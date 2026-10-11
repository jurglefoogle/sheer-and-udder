#!/usr/bin/env node
// Generates brand imagery through the Codex CLI's image_generation tool.
// Usage: node tools/gen-images.mjs [--only id1,id2] [--force] [--concurrency 3]
import { spawn } from 'node:child_process';
import { readFile, readdir, stat, copyFile, mkdir, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { homedir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const outDir = path.join(root, 'assets', 'raw');
const logDir = path.join(root, 'assets', 'logs');
const genRoot = path.join(homedir(), '.codex', 'generated_images');

const args = process.argv.slice(2);
const flag = (name) => args.includes(`--${name}`);
const opt = (name, fallback) => {
  const i = args.indexOf(`--${name}`);
  return i >= 0 ? args[i + 1] : fallback;
};
const only = opt('only', '')?.split(',').filter(Boolean) ?? [];
const force = flag('force');
const concurrency = Number(opt('concurrency', 3));
const extra = opt('extra', '');
const model = opt('model', 'gpt-5.6-sol');

const { style, shots } = JSON.parse(await readFile(path.join(root, 'tools', 'image-prompts.json'), 'utf8'));
await mkdir(outDir, { recursive: true });
await mkdir(logDir, { recursive: true });

const queue = shots.filter((s) => {
  if (only.length) return only.includes(s.id);
  return force || !existsSync(path.join(outDir, `${s.id}.png`));
});

async function listImages(dir) {
  const found = [];
  if (!existsSync(dir)) return found;
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) found.push(...(await listImages(p)));
    else if (/\.(png|webp|jpe?g)$/i.test(entry.name)) found.push(p);
  }
  return found;
}

function buildPrompt(shot) {
  return [
    'Use your image generation tool to create exactly ONE image. Do not write code, do not create or edit any files, do not run shell commands. Just generate the image and reply "done".',
    `Image size: ${shot.size}.`,
    shot.ref ? 'The attached image is the brand label artwork to reference.' : '',
    style,
    `Shot: ${shot.prompt}`,
    extra,
  ].filter(Boolean).join('\n\n');
}

function runCodex(shot) {
  return new Promise((resolve) => {
    const cliArgs = ['exec', '--skip-git-repo-check', '--enable', 'image_generation', '-s', 'read-only', '-m', model];
    if (shot.ref) cliArgs.push('-i', path.join(root, shot.ref));
    cliArgs.push('-');
    const child = spawn('codex', cliArgs, { cwd: root });
    let log = '';
    child.stdout.on('data', (d) => (log += d));
    child.stderr.on('data', (d) => (log += d));
    child.stdin.end(buildPrompt(shot));
    child.on('close', (code) => resolve({ code, log }));
  });
}

async function generate(shot) {
  const started = Date.now();
  const before = new Set(await listImages(genRoot));
  console.log(`▶ ${shot.id}`);
  const { code, log } = await runCodex(shot);
  await writeFile(path.join(logDir, `${shot.id}.log`), log);
  // The image lands in ~/.codex/generated_images/<thread>/; the thread id is printed in the log.
  const thread = log.match(/session id:\s*([0-9a-f-]{36})/i)?.[1];
  const candidates = [];
  for (const file of await listImages(thread ? path.join(genRoot, thread) : genRoot)) {
    if (before.has(file)) continue;
    const s = await stat(file);
    if (s.mtimeMs >= started - 1000) candidates.push({ file, t: s.mtimeMs });
  }
  candidates.sort((a, b) => b.t - a.t);
  if (!candidates.length) {
    console.error(`✖ ${shot.id}: no image produced (exit ${code}). See assets/logs/${shot.id}.log`);
    return false;
  }
  await copyFile(candidates[0].file, path.join(outDir, `${shot.id}.png`));
  console.log(`✔ ${shot.id} (${((Date.now() - started) / 1000).toFixed(0)}s)`);
  return true;
}

console.log(`Generating ${queue.length} image(s), concurrency ${concurrency}`);
const results = [];
const workers = Array.from({ length: Math.min(concurrency, queue.length) }, async () => {
  while (queue.length) {
    const shot = queue.shift();
    results.push({ id: shot.id, ok: await generate(shot) });
  }
});
await Promise.all(workers);
const failed = results.filter((r) => !r.ok).map((r) => r.id);
console.log(`Done. ${results.length - failed.length} ok, ${failed.length} failed${failed.length ? ': ' + failed.join(', ') : ''}`);
process.exit(failed.length ? 1 : 0);
