// Constructeurs de champs de formulaire (HTML statique, écrit à la génération du site : jamais construit avec des données saisies).
import { esc } from '../../tools/lib/layout.mjs';

// Aide courte : sous le champ. Aide longue : repliée derrière « En savoir plus » pour garder le formulaire léger.
const aideHtml = (id, texte) => !texte ? '' : texte.replace(/<[^>]+>/g, '').length > 50
  ? `<details class="plus-aide"><summary>En savoir plus</summary><p class="aide" id="${id}-aide">${texte}</p></details>`
  : `<p class="aide" id="${id}-aide">${texte}</p>`;
export const champ = ({ nom, label, type = 'text', aide = '', pour = '', client = '', auto = '', attrs = '', classe = '', etiquettes = null }) => {
  const id = 'f-' + nom.replace(/\./g, '-');
  return `<div class="champ${classe ? ' ' + classe : ''}"${pour ? ` data-pour="${pour}"` : ''}${client ? ` data-client="${client}"` : ''}><label for="${id}"${etiquettes ? ` data-etiquettes="${esc(JSON.stringify(etiquettes))}"` : ''}>${label}</label>` +
    (type === 'textarea' ? `<textarea id="${id}" name="${nom}" rows="3" maxlength="1000"${auto ? ` autocomplete="${auto}"` : ''}${attrs ? ' ' + attrs : ''}></textarea>` : `<input id="${id}" name="${nom}" type="${type}"${auto ? ` autocomplete="${auto}"` : ''}${attrs ? ' ' + attrs : ''}>`) +
    aideHtml(id, aide) + '</div>';
};
export const coche = ({ nom, label, pour = '', client = '', aide = '' }) => { const id = 'f-' + nom.replace(/\./g, '-'); return `<div class="champ coche"${pour ? ` data-pour="${pour}"` : ''}${client ? ` data-client="${client}"` : ''}><label><input id="${id}" name="${nom}" type="checkbox"> <span>${label}</span></label>${aideHtml(id, aide)}</div>`; };
export const choisir = ({ nom, label, options, pour = '', aide = '' }) => { const id = 'f-' + nom.replace(/\./g, '-'); return `<div class="champ"${pour ? ` data-pour="${pour}"` : ''}><label for="${id}">${label}</label><select id="${id}" name="${nom}">${options.map(([v, l]) => `<option value="${v}">${esc(l)}</option>`).join('')}</select>${aide ? `<p class="aide">${aide}</p>` : ''}</div>`; };
export const radios = ({ nom, legende, options }) => `<fieldset class="radios"><legend>${legende}</legend>${options.map(([v, l, d]) => `<label class="radio"><input type="radio" name="${nom}" value="${v}"><span><strong>${esc(l)}</strong>${d ? `<small>${esc(d)}</small>` : ''}</span></label>`).join('')}</fieldset>`;

