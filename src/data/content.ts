export type FlavorId =
  | 'classic'
  | 'mexican'
  | 'smores'
  | 'boston-cream'
  | 'tiramisu'
  | 'pb-cup'
  | 'german-chocolate';

export interface Flavor {
  id: FlavorId;
  name: string;
  number: string;
  tagline: string;
  description: string;
  notes: string[];
  pairs: string[];
  status: 'available' | 'coming';
  bg: string;
  accent: string;
  image: string;
  recipe: string;
}

export interface Recipe {
  id: string;
  name: string;
  flavor: FlavorId;
  hook: string;
  glass: string;
  ingredients: string[];
  method: string;
  image: string;
}

export const flavors: Flavor[] = [
  {
    id: 'classic',
    name: 'The Classic',
    number: 'No. 01',
    tagline: 'Dark, velvety, unapologetically grown.',
    description:
      'Our original pour. Dutch-process cocoa and real whole-milk powder, deepened with malted barley and finished with a pinch of sea salt so it plays nicely with whiskey, rum, or nothing at all.',
    notes: ['Dutch-process cocoa', 'Malted milk', 'Sea salt finish'],
    pairs: ['Bourbon', 'Aged rum', 'Irish cream'],
    status: 'available',
    bg: '#2a160e',
    accent: '#c9a25a',
    image: 'flavor-classic',
    recipe: 'grown-banana',
  },
  {
    id: 'mexican',
    name: 'Mexican Chocolate',
    number: 'No. 02',
    tagline: 'Cinnamon heat with a slow-burn finish.',
    description:
      'Stone-ground cocoa warmed with Ceylon cinnamon and the faintest ancho glow. It starts sweet and leaves a little heat behind, like any good bad idea.',
    notes: ['Ceylon cinnamon', 'Ancho warmth', 'Stone-ground cocoa'],
    pairs: ['Reposado tequila', 'Mezcal', 'Añejo rum'],
    status: 'coming',
    bg: '#3a1a10',
    accent: '#d9773f',
    image: 'flavor-mexican',
    recipe: 'cinnamon-outlaw',
  },
  {
    id: 'smores',
    name: "S'mores",
    number: 'No. 03',
    tagline: 'Campfire confessions. No tent required.',
    description:
      'Toasted marshmallow, honeyed graham and milk chocolate. It tastes like the night you swore you would never tell anyone about.',
    notes: ['Toasted marshmallow', 'Honey graham', 'Milk chocolate'],
    pairs: ['Smoky bourbon', 'Rye', 'Marshmallow vodka'],
    status: 'coming',
    bg: '#2e1d12',
    accent: '#e7a75e',
    image: 'flavor-smores',
    recipe: 'campfire-confession',
  },
  {
    id: 'boston-cream',
    name: 'Boston Cream Pie',
    number: 'No. 04',
    tagline: 'Custard-soft, with a ganache glaze.',
    description:
      'Vanilla custard and golden butter cake under a glossy chocolate glaze. Proper on the outside, scandalous in the middle.',
    notes: ['Vanilla custard', 'Butter cake', 'Ganache glaze'],
    pairs: ['Vanilla vodka', 'Amaretto', 'Cognac'],
    status: 'coming',
    bg: '#2b1f12',
    accent: '#ebd18c',
    image: 'flavor-boston-cream',
    recipe: 'cream-of-the-crop',
  },
  {
    id: 'tiramisu',
    name: 'Tiramisu',
    number: 'No. 05',
    tagline: 'Pick-me-up. Put-you-down.',
    description:
      'Espresso, mascarpone cream and a soft dusting of cocoa. It lifts you up, then lets you down gently.',
    notes: ['Espresso', 'Mascarpone', 'Cocoa dust'],
    pairs: ['Coffee liqueur', 'Dark rum', 'Marsala'],
    status: 'coming',
    bg: '#211713',
    accent: '#c39770',
    image: 'flavor-tiramisu',
    recipe: 'espresso-undressed',
  },
  {
    id: 'pb-cup',
    name: 'Peanut Butter Cup',
    number: 'No. 06',
    tagline: 'Salty, sweet, and a little nutty.',
    description:
      'Roasted peanut butter folded into milk chocolate with a flake of sea salt. Some pairings are just meant to be.',
    notes: ['Roasted peanut', 'Milk chocolate', 'Flaky salt'],
    pairs: ['Peanut butter whiskey', 'Bourbon', 'Banana liqueur'],
    status: 'coming',
    bg: '#2d1a0d',
    accent: '#e8a040',
    image: 'flavor-pb-cup',
    recipe: 'nutty-professor',
  },
  {
    id: 'german-chocolate',
    name: 'German Chocolate Cake',
    number: 'No. 07',
    tagline: 'Coconut, pecan, and no regrets.',
    description:
      'Dark cocoa layered with toasted coconut, candied pecan and brown-butter caramel. Your grandmother’s cake, after she got her own place.',
    notes: ['Toasted coconut', 'Candied pecan', 'Caramel'],
    pairs: ['Dark rum', 'Spiced rum', 'Pecan bourbon'],
    status: 'coming',
    bg: '#2a1810',
    accent: '#cf8d55',
    image: 'flavor-german-chocolate',
    recipe: 'coconut-confidential',
  },
];

export const recipes: Recipe[] = [
  {
    id: 'grown-banana',
    name: 'The Grown Banana',
    flavor: 'classic',
    hook: 'The one on the back of the tin.',
    glass: 'Rocks glass',
    ingredients: ['8 oz banana milk', '1½–2 oz whiskey or rum', '2 Tbsp Sheer & Udder Classic', 'Whipped cream, to top'],
    method: 'Froth the banana milk with the mix until silky. Stir in the spirit, pour over ice (or serve warm) and crown it with whipped cream.',
    image: 'cocktail-grown-banana',
  },
  {
    id: 'cinnamon-outlaw',
    name: 'Cinnamon Outlaw',
    flavor: 'mexican',
    hook: 'Slow heat, fast friends.',
    glass: 'Tumbler, large cube',
    ingredients: ['6 oz whole milk', '1½ oz reposado tequila', '2 Tbsp Mexican Chocolate', 'Pinch of cayenne', 'Cinnamon-sugar rim'],
    method: 'Rim the glass. Shake the milk, mix, tequila and cayenne hard with ice, then strain over a single large cube. Garnish with a flamed cinnamon stick.',
    image: 'cocktail-cinnamon-outlaw',
  },
  {
    id: 'campfire-confession',
    name: 'Campfire Confession',
    flavor: 'smores',
    hook: 'What happens at camp…',
    glass: 'Coupe',
    ingredients: ['6 oz whole milk', '1½ oz bourbon', "2 Tbsp S'mores", 'Torched marshmallow', 'Graham-crumb rim'],
    method: 'Warm the milk and froth in the mix. Add the bourbon, pour into a graham-rimmed coupe and top with a freshly torched marshmallow.',
    image: 'cocktail-campfire-confession',
  },
  {
    id: 'cream-of-the-crop',
    name: 'Cream of the Crop',
    flavor: 'boston-cream',
    hook: 'Proper. Mostly.',
    glass: 'Nick & Nora',
    ingredients: ['5 oz whole milk', '1 oz vanilla vodka', '½ oz amaretto', '2 Tbsp Boston Cream Pie', 'Ganache drizzle'],
    method: 'Drizzle ganache inside a chilled glass. Shake everything else with ice and strain in slowly so it layers.',
    image: 'cocktail-cream-of-the-crop',
  },
  {
    id: 'espresso-undressed',
    name: 'Espresso Undressed',
    flavor: 'tiramisu',
    hook: 'The after-dinner nightcap that keeps you up.',
    glass: 'Martini',
    ingredients: ['4 oz whole milk', '1 oz coffee liqueur', '1 oz fresh espresso', '2 Tbsp Tiramisu', '3 coffee beans'],
    method: 'Shake hard with ice until it builds a thick foam. Double-strain into a chilled martini glass, dust with cocoa and float three beans on top.',
    image: 'cocktail-espresso-undressed',
  },
  {
    id: 'nutty-professor',
    name: 'The Nutty Professor',
    flavor: 'pb-cup',
    hook: 'Tenured. Untamed.',
    glass: 'Stemmed goblet',
    ingredients: ['6 oz whole milk', '1½ oz peanut butter whiskey', '2 Tbsp Peanut Butter Cup', 'Crushed-peanut rim'],
    method: 'Rim the glass with crushed peanuts. Blend the milk, mix and whiskey with a handful of ice until frothy, then pour.',
    image: 'cocktail-nutty-professor',
  },
  {
    id: 'coconut-confidential',
    name: 'Coconut Confidential',
    flavor: 'german-chocolate',
    hook: 'Strictly between us.',
    glass: 'Rocks glass',
    ingredients: ['6 oz coconut milk', '1½ oz dark rum', '2 Tbsp German Chocolate Cake', 'Toasted-coconut rim', 'Caramel drizzle'],
    method: 'Shake the coconut milk, mix and rum over ice. Strain into a coconut-rimmed glass and finish with caramel and a candied pecan.',
    image: 'cocktail-coconut-confidential',
  },
];

export const puns = [
  'Udderly indulgent',
  'Moo-ve over, kids',
  'Shaken, not stirred-ish',
  'Cocoa after curfew',
  'Pour decisions, made well',
  'Got spirits?',
  'No crusts were cut',
  'Milk, minus the mustache',
];

export const products = {
  tin: { id: 'tin', name: 'Classic — Signature Tin', detail: '24 pours · 17 oz', price: 29, image: 'hero-tin' },
  pouch: { id: 'pouch', name: 'Classic — Refill Pouch', detail: '12 pours · 8.5 oz', price: 17, image: 'hero-pouch' },
} as const;
export type ProductId = keyof typeof products;

// Swap in a real endpoint (e.g. Formspree) to collect waitlist emails for real.
export const WAITLIST_ENDPOINT = '';
