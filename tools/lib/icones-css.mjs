// Icônes utilisées en CSS (avant un texte écrit ailleurs) : masque SVG en data: coloré par currentColor. Source des tracés : src/content/icones.mjs.
import { ICONES } from '../../src/content/icones.mjs';
const masque = (nom) => `url("data:image/svg+xml,${encodeURIComponent(`<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='black' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'>${ICONES[nom].replace(/"/g, "'")}</svg>`)}")`;
const regle = (sel, nom) => `${sel}::before { content: ""; display: inline-block; width: 1.15em; height: 1.15em; background: currentColor; -webkit-mask: ${masque(nom)} center / contain no-repeat; mask: ${masque(nom)} center / contain no-repeat; vertical-align: -.2em; flex: none; }`;
const apres = (sel, nom) => `${sel}::after { content: ""; width: 14px; height: 14px; background: #fff; -webkit-mask: ${masque(nom)} center / contain no-repeat; mask: ${masque(nom)} center / contain no-repeat; }`;
export const cssIcones = () => [
  regle('.notice', 'alert'), regle('.notice.info', 'info'), regle('.studio-cta', 'heart'), regle('.plus-aide > summary', 'info'),
  regle('.bilan-titre.ok', 'check'), regle('.bilan-titre.erreur', 'alert'), regle('.resultat .vide', 'calculator'), apres('.coche input:checked', 'tick'),
].join('\n');
