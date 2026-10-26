// Compta by glsc : thème (le temps de la visite, rien n'est enregistré) et recherche locale. Aucune requête externe.
(() => {
  const root = document.documentElement;
  const toggle = document.getElementById('theme-toggle');
  if (toggle) toggle.addEventListener('click', () => {
    const dark = root.dataset.theme ? root.dataset.theme === 'dark' : matchMedia('(prefers-color-scheme: dark)').matches;
    root.dataset.theme = dark ? 'light' : 'dark';
  });

  // Résultats chiffrés : petit rebond quand la valeur change (les outils réécrivent le texte, rien n'est envoyé).
  const zone = document.querySelector('.resultat');
  if (zone) new MutationObserver(() => zone.querySelectorAll('.grand').forEach((el) => {
    if (el.dataset.v === el.textContent) return;
    el.dataset.v = el.textContent; el.classList.remove('maj'); void el.offsetWidth; el.classList.add('maj');
  })).observe(zone, { childList: true, subtree: true, characterData: true });

  const out = document.getElementById('resultats');
  if (!out) return;
  const q = (new URLSearchParams(location.search).get('q') || '').trim().slice(0, 80);
  const input = document.getElementById('q');
  if (input) input.value = q;
  const norm = (s) => s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  const status = document.getElementById('resultats-etat');
  if (!q) { status.textContent = 'Saisissez un mot pour chercher un outil, un guide ou une page.'; return; }
  fetch('/assets/search-index.json').then((r) => r.json()).then((index) => {
    const words = norm(q).split(/\s+/).filter(Boolean);
    const scored = index.map((p) => {
      const t = norm(p.titre), d = norm(p.description);
      let s = 0;
      for (const w of words) { if (t.includes(w)) s += 3; else if (d.includes(w)) s += 1; else return null; }
      return { p, s };
    }).filter(Boolean).sort((a, b) => b.s - a.s);
    status.textContent = scored.length ? `${scored.length} résultat${scored.length > 1 ? 's' : ''} pour « ${q} »` : `Aucun résultat pour « ${q} ».`;
    for (const { p } of scored) {
      const li = document.createElement('li'), a = document.createElement('a'), d = document.createElement('p');
      a.href = p.url; a.textContent = p.titre; d.textContent = p.description;
      li.append(a, d); out.append(li);
    }
  }).catch(() => { status.textContent = 'La recherche est momentanément indisponible.'; });
})();
