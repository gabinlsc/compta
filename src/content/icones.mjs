// Icônes du site : tracés de 24 × 24 au trait (style Lucide, licence ISC, redessinés), toujours décoratives (aria-hidden), colorées par `currentColor`.
export const ICONES = {
  receipt: '<path d="M5 3h14v18l-3-2-2 2-2-2-2 2-2-2-3 2z"/><path d="M9 8h6M9 12h6"/>',
  calculator: '<rect x="5" y="3" width="14" height="18" rx="3"/><path d="M8.5 7.5h7M8.5 12h.01M12 12h.01M15.5 12h.01M8.5 16h.01M12 16h.01M15.5 16h.01"/>',
  calendar: '<rect x="3.5" y="5" width="17" height="15.5" rx="3"/><path d="M8 3v4M16 3v4M3.5 10h17M8 14h.01M12 14h.01M16 14h.01"/>',
  timer: '<circle cx="12" cy="13.5" r="7.5"/><path d="M12 9.5v4l2.5 1.5M9.5 2.5h5"/>',
  book: '<path d="M5 4.5A1.5 1.5 0 0 1 6.5 3H19v15H6.5A1.5 1.5 0 0 0 5 19.5z"/><path d="M5 19.5A1.5 1.5 0 0 0 6.5 21H19v-3M9 7.5h6"/>',
  shield: '<path d="M12 3l7.5 3v5.5c0 4.6-3.1 7.9-7.5 9.5-4.4-1.6-7.5-4.9-7.5-9.5V6z"/><path d="m8.8 12 2.3 2.3 4.2-4.6"/>',
  file: '<path d="M7 3h7l5 5v11a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z"/><path d="M14 3v5h5M9 13h6M9 17h6"/>',
  scale: '<path d="M12 4v16M7 20h10M5 7h14"/><path d="M5 7l-3 7a3.5 3.5 0 0 0 6 0zM19 7l-3 7a3.5 3.5 0 0 0 6 0z"/>',
  rocket: '<path d="M12 3c3.5 1.5 6 5 6 9l-3 3h-6l-3-3c0-4 2.5-7.5 6-9z"/><circle cx="12" cy="10" r="1.6"/><path d="M9 15l-2.5 4 3.5-1M15 15l2.5 4-3.5-1"/>',
  clipboard: '<rect x="5" y="4.5" width="14" height="16.5" rx="2.5"/><path d="M9 4.5V3.5h6v1M9 11h6M9 15h4"/>',
  zap: '<path d="M13 2.5 5 13.5h6l-1 8 8-11h-6z"/>',
  mail: '<rect x="3" y="5.5" width="18" height="13" rx="3"/><path d="m4 8 8 5.5L20 8"/>',
  trending: '<path d="m3.5 16.5 6-6 4 4 7-7.5"/><path d="M15 7h5.5v5.5"/>',
  'book-open': '<path d="M12 6.5C10 4.7 7 4 3.5 4.5v13c3.5-.5 6.5.2 8.5 2 2-1.8 5-2.5 8.5-2v-13C17 4 14 4.7 12 6.5z"/><path d="M12 6.5v13"/>',
  building: '<rect x="5" y="3" width="10" height="18" rx="1.5"/><path d="M15 9h4v12h-4M8.5 7.5h3M8.5 11h3M8.5 14.5h3"/>',
  check: '<circle cx="12" cy="12" r="9"/><path d="m8 12.3 2.8 2.8 5.4-5.6"/>',
  wrench: '<path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>',
  search: '<circle cx="11" cy="11" r="6.5"/><path d="m16 16 4.5 4.5"/>',
  sparkles: '<path d="M12 3l1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9z"/><path d="M19 15l.8 2.2L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.8z"/>',
  lock: '<rect x="4.5" y="10.5" width="15" height="10.5" rx="2.6"/><path d="M8 10.5V7.5a4 4 0 0 1 8 0v3"/><circle cx="12" cy="15.7" r="1.2"/>',
  code: '<path d="m8.5 8-4.5 4 4.5 4M15.5 8l4.5 4-4.5 4M13.5 5.5l-3 13"/>',
  heart: '<path d="M12 20s-7.5-4.6-7.5-10.3A4.2 4.2 0 0 1 12 7.2a4.2 4.2 0 0 1 7.5 2.5C19.5 15.4 12 20 12 20z"/>',
  sliders: '<path d="M4 7h9M17 7h3M4 17h3M11 17h9"/><circle cx="15" cy="7" r="2"/><circle cx="9" cy="17" r="2"/>',
  message: '<path d="M20.5 11.5a8 8 0 0 1-11.7 7L3.5 20l1.6-4.6A8 8 0 1 1 20.5 11.5z"/>',
  info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v5.5M12 7.8h.01"/>',
  alert: '<path d="M12 3.5 21.5 20h-19z"/><path d="M12 10v4.5M12 17.2h.01"/>',
  tick: '<path d="m5 12.5 4.5 4.5L19 7.5"/>',
  arrow: '<path d="M5 12h14M13 6l6 6-6 6"/>',
  pin: '<path d="M12 21s-6.5-5.6-6.5-11a6.5 6.5 0 0 1 13 0c0 5.4-6.5 11-6.5 11z"/><circle cx="12" cy="10" r="2.3"/>',
};
// Icône de chaque outil et de chaque guide (par identifiant de page).
export const ICONE_DE = {
  'facture-auto-entrepreneur': 'receipt', 'simulateur-revenu-net': 'calculator', 'calendrier-echeances': 'calendar', 'tarif-journalier': 'timer',
  'livre-des-recettes': 'book', 'registre-rgpd': 'shield', 'mentions-legales-site': 'file', 'comparateur-statuts': 'scale',
  'creer-sa-micro-entreprise': 'rocket', 'mentions-obligatoires-facture': 'clipboard', 'facturation-electronique': 'zap', 'declarer-son-chiffre-d-affaires': 'mail',
  'plafonds-et-seuils-de-tva': 'trending', 'livre-des-recettes-a-quoi-ca-sert': 'book-open', 'cfe-qui-la-paie': 'building', 'checklist-premiere-facture': 'check',
};
export const svg = (nom, classe = 'ico') => `<svg class="${classe}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${ICONES[nom] ?? ICONES.sparkles}</svg>`;
export const bulle = (nom) => `<span class="bulle">${svg(nom)}</span>`;
export const bulleDe = (slug) => bulle(ICONE_DE[slug] ?? 'sparkles');
