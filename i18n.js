export const LANGUAGES = ['en', 'fr'];

const STRINGS = {
  en: {
    docTitle: 'CanCheck — Is your beer recalled?',
    tagline: 'Molson Coors beer recall — November 2026.',
    intro:
      'On November 10, 2026, the CFIA recalled various Molson Coors beer products sold across Canada because they may contain **pieces of metal**.' +
      ' Scan the **UPC barcode** on the can, bottle or box to check a product in seconds.',
    startScan: 'Scan a barcode',
    manualEntry: 'Enter the UPC manually',
    manualTitle: 'Manual product check',
    manualHint: 'Type the 12–13-digit number printed under the barcode.',
    manualPlaceholder: 'e.g. 056327073937',
    manualSubmit: 'Check this product',
    invalidInput: 'Enter 12 or 13 digits (spaces are ignored).',
    scanningHint: 'Hold the can and phone upright, 20–30 cm away, out of glare. Type it below if it won’t scan.',
    typeInstead: 'Type it instead',
    stop: 'Stop camera',
    torch: 'Flashlight',
    scanAgain: 'Scan another product',
    backHome: 'Home',
    recalledTitle: 'Recalled product',
    recalledBody:
      'This product format is on the CFIA recall list. Do not use, sell, serve or distribute it — return it to the point of purchase.',
    codesLead: 'Only specific batch codes are affected. Check the code printed on your can, bottle or box — if it matches one of these, the product is part of the recall:',
    notListedTitle: 'Not on the recall list',
    notListedBody:
      'This product format is not on the CFIA recall list as of {date}. Recalls can be updated at any time — if in doubt, verify on the official notice.',
    unknownTitle: 'Code not recognized',
    unknownBody:
      'The scanned code “{code}” is not a 12-digit UPC product barcode. QR codes on cans are usually just website links — scan the striped UPC barcode instead, or type the UPC manually.',
    scannedCode: 'Scanned code',
    detailBrand: 'Brand',
    detailProduct: 'Product',
    detailSize: 'Format',
    affectedCodes: 'Affected batch codes',
    official: 'Official CFIA notice',
    dataNote: 'Recall data last updated {date} · Source: {agency}',
    cameraError:
      'The camera could not be started. Make sure you allowed camera access (HTTPS or localhost required), then try again — or type the UPC manually.',
    cameraStall:
      'The camera is not responding. Tap retry — on iPhone you may need to fully close this page (swipe the tab away) and reopen it.',
    retryCamera: 'Retry camera',
    engineError: 'The barcode engine failed to load. Check your connection and reload the page.',
    langButton: 'FR',
    langSwitchTo: 'Switch to French',
  },

  fr: {
    docTitle: 'CanCheck — Votre bière est-elle rappelée?',
    tagline: 'Rappel de bières Molson Coors — novembre 2026.',
    intro:
      'Le 10 novembre 2026, l’ACIA a rappelé divers produits de bière Molson Coors vendus partout au Canada parce qu’ils pourraient contenir des **morceaux de métal**.' +
      ' Scannez le **code-barres UPC** de la canette, de la bouteille ou de la boîte pour vérifier un produit en quelques secondes.',
    startScan: 'Scanner un code-barres',
    manualEntry: 'Saisir le UPC manuellement',
    manualTitle: 'Vérification manuelle',
    manualHint: 'Tapez le numéro à 12–13 chiffres imprimé sous le code-barres.',
    manualPlaceholder: 'p. ex. 056327073937',
    manualSubmit: 'Vérifier ce produit',
    invalidInput: 'Saisissez 12 ou 13 chiffres (les espaces sont ignorés).',
    scanningHint: 'Tenez la canette et le téléphone bien à la verticale, à 20–30 cm et hors du reflet. Saisissez-le ci-dessous s’il refuse de scanner.',
    typeInstead: 'Saisir manuellement',
    stop: 'Fermer la caméra',
    torch: 'Lampe de poche',
    scanAgain: 'Vérifier un autre produit',
    backHome: 'Accueil',
    recalledTitle: 'Produit rappelé',
    recalledBody:
      'Ce format de produit figure sur la liste de rappel de l’ACIA. Ne l’employez pas, ne le vendez pas, ne le servez pas et ne le distribuez pas — retournez-le au point d’achat.',
    codesLead: 'Seuls certains codes de lot sont touchés. Vérifiez le code imprimé sur votre canette, votre bouteille ou votre boîte — s’il correspond à l’un des suivants, le produit fait l’objet du rappel :',
    notListedTitle: 'Aucun rappel pour ce produit',
    notListedBody:
      'Ce format de produit ne figure pas sur la liste de rappel de l’ACIA en date du {date}. Les rappels peuvent être mis à jour à tout moment — en cas de doute, consultez l’avis officiel.',
    unknownTitle: 'Code non reconnu',
    unknownBody:
      'Le code scanné « {code} » n’est pas un code-barres de produit UPC à 12 chiffres. Les codes QR sur les canettes ne sont généralement que des liens de site Web — scannez plutôt le code-barres UPC rayé ou tapez le UPC manuellement.',
    scannedCode: 'Code scanné',
    detailBrand: 'Marque',
    detailProduct: 'Produit',
    detailSize: 'Format',
    affectedCodes: 'Codes de lot touchés',
    official: 'Avis officiel de l’ACIA',
    dataNote: 'Données de rappel mises à jour le {date} · Source : {agency}',
    cameraError:
      'Impossible d’accéder à la caméra. Assurez-vous d’avoir autorisé l’accès (HTTPS ou localhost requis), puis réessayez — ou tapez le UPC manuellement.',
    cameraStall:
      'La caméra ne répond pas. Touchez Réessayer — sur iPhone, il peut falloir fermer complètement la page (la retirer des onglets) et la rouvrir.',
    retryCamera: 'Réessayer la caméra',
    engineError: 'Le moteur de lecture des codes-barres n’a pas pu être chargé. Vérifiez votre connexion et rechargez la page.',
    langButton: 'EN',
    langSwitchTo: 'Passer à l’anglais',
  },
};

export function getStrings(lang) {
  return STRINGS[lang] ?? STRINGS.en;
}

export function isSupportedLang(lang) {
  return LANGUAGES.includes(lang);
}
