// Dates au format ISO (AAAA-MM-JJ), calculées en UTC pour éviter tout décalage d'heure d'été.
export const dateIsoValide = (s) => /^\d{4}-\d{2}-\d{2}$/.test(s ?? '') && !Number.isNaN(Date.parse(s + 'T12:00:00Z')) && new Date(s + 'T12:00:00Z').toISOString().slice(0, 10) === s;
export function ajouterJours(iso, n) { const d = new Date(iso + 'T12:00:00Z'); d.setUTCDate(d.getUTCDate() + n); return d.toISOString().slice(0, 10); }
export const dernierJourDuMois = (annee, mois) => new Date(Date.UTC(annee, mois, 0, 12)).toISOString().slice(0, 10); // mois de 1 à 12
export const dateLongue = (iso) => new Date(iso + 'T12:00:00Z').toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' });
export const aujourdhui = () => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; };
