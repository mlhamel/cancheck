export const RECALL_META = {
  id: 'cfia-beer-metal-2026',
  agency: {
    en: 'Canadian Food Inspection Agency (CFIA)',
    fr: 'Agence canadienne d’inspection des aliments (ACIA)',
  },
  issue: {
    en: 'Pieces of metal (Food — Extraneous material)',
    fr: 'Présence de morceaux de métal (alimentation — matière étrangère)',
  },
  sourceUrl: {
    en: 'https://recalls-rappels.canada.ca/en/alert-recall/various-brands-alcoholic-and-non-alcoholic-beer-recalled-due-pieces-metal',
    fr: 'https://recalls-rappels.canada.ca/fr/avis-rappel/rappel-biere-alcoolisee-et-non-alcoolisee-diverses-marques-en-raison-presence-morceaux',
  },
  published: '2026-11-10',
  lastUpdated: '2026-11-09',
};

/*
  Affected products table transcribed from the CFIA recall notice
  (recall-rappels.canada.ca, last updated 2026-11-09). UPCs are kept as
  strings because UPC-A values can start with 0.
  To update the dataset, re-read the official table and edit this array.
*/
export const RECALLED_PRODUCTS = [
  { brand: 'Black Horse', product: 'Black Horse Beer', size: '8 x 355 mL', upc: '056327018129', codes: ['J296'] },

  { brand: 'Blue Moon', product: 'Non-Alcoholic Belgian White Belgian-Style Wheat Ale Beer', size: '6 x 355 mL', upc: '056327025127', codes: ['H216', 'K096'] },
  { brand: 'Blue Moon', product: 'Non-Alcoholic Belgian White Belgian-Style Wheat Ale Beer', size: '24 x 355 mL', upc: '056327025257', codes: ['K096'] },
  { brand: 'Blue Moon', product: 'Belgian White Belgian-Style Wheat Ale Beer', size: '24 x 355 mL', upc: '056327021945', codes: ['H286', 'J116', 'K096'] },
  { brand: 'Blue Moon', product: 'Belgian White Belgian-Style Wheat Ale Beer', size: '24 x 473 mL', upc: '056327011199', codes: ['H286', 'K026'] },
  { brand: 'Blue Moon', product: 'Belgian White Belgian-Style Wheat Ale Beer', size: '4 x 473 mL', upc: '056327013742', codes: ['H286', 'K026'] },
  { brand: 'Blue Moon', product: 'Belgian White Belgian-Style Wheat Ale Beer', size: '12 x 355 mL', upc: '056327011151', codes: ['J256'] },
  { brand: 'Blue Moon', product: 'Belgian White Belgian-Style Wheat Ale Beer', size: '473 mL', upc: '056327011168', codes: ['H286', 'K026'] },
  { brand: 'Blue Moon', product: 'Mango Wheat Beer with natural flavour', size: '24 x 473 mL', upc: '056327013704', codes: ['K026'] },
  { brand: 'Blue Moon', product: 'Mango Wheat Beer with natural flavour', size: '4 x 473 mL', upc: '056327015272', codes: ['K026'] },
  { brand: 'Blue Moon', product: 'Mango Wheat Beer with natural flavour', size: '473 mL', upc: '056327013711', codes: ['K026'] },
  { brand: 'Blue Moon', product: 'Light Citrus Wheat Beer with natural flavour', size: '12 x 355 mL', upc: '056327015494', codes: ['K156'] },

  { brand: 'Brasseur de Montréal', product: 'Normanville Hazy IPA Beer', size: '4 x 473 mL', upc: '629255226043', codes: ['K0126', 'J1026', 'J2426'] },
  { brand: 'Brasseur de Montréal', product: 'Normanville Hazy IPA Beer', size: '12 x 355 mL', upc: '629255926127', codes: ['K0126', 'J1026', 'J2426'] },
  { brand: 'Brasseur de Montréal', product: 'Bonsecours Lager Light Beer', size: '4 x 473 mL', upc: '629255230040', codes: ['J2226'] },
  { brand: 'Brasseur de Montréal', product: 'Bonsecours Lager Light Beer', size: '12 x 355 mL', upc: '629255930124', codes: ['J1626'] },
  { brand: 'Brasseur de Montréal', product: 'Neighbourhood’s Pick (beer)', size: '12 x 355 mL', upc: '629255959125', codes: ['J1626', 'J1726', 'H1926'] },
  { brand: 'Brasseur de Montréal', product: 'Griffintown Blonde Ale Beer', size: '12 x 355 mL', upc: '629255901124', codes: ['J216'] },
  { brand: 'Brasseur de Montréal', product: 'Petite-Bourgogne Red Ale Beer', size: '12 x 355 mL', upc: '629255903128', codes: ['J216'] },

  { brand: 'Coors Light', product: 'Light Beer', size: '24 x 355 mL', upc: '056327183247', codes: ['J286'] },
  { brand: 'Coors Light', product: 'Light Beer', size: '15 x 355 mL', upc: '056327183278', codes: ['J286'] },
  { brand: 'Coors Light', product: 'Light Beer', size: '8 x 355 mL', upc: '056327018099', codes: ['J286', 'K026'] },
  { brand: 'Coors Light', product: 'Light Beer', size: '12 x 355 mL', upc: '056327183254', codes: ['J246', 'J256', 'K026', 'K146'] },

  { brand: 'Hop Valley', product: 'Bubble Stash IPA Strong Beer', size: '12 x 355 mL', upc: '627005971021', codes: ['J1726'] },

  { brand: 'India Beer', product: 'Beer', size: '12 x 355 mL', upc: '056327023116', codes: ['J246'] },

  { brand: 'Molson Canadian', product: 'Beer', size: '15 x 355 mL', upc: '056327073272', codes: ['J216'] },
  { brand: 'Molson Canadian', product: 'Beer', size: '12 x 355 mL', upc: '056327073258', codes: ['J216', 'K136'] },
  { brand: 'Molson Canadian', product: 'Beer', size: '24 x 473 mL', upc: '056327007444', codes: ['K016'] },
  { brand: 'Molson Canadian', product: 'Beer', size: '473 mL', upc: '056327073937', codes: ['K016'] },
];
