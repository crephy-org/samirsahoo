(() => {
  const C = window.SITE_CONTENT;
  const key = document.body.dataset.project;
  const P = C.projects[key];
  if (!P) return;
  const $ = s => document.querySelector(s);
  const esc = (s) => String(s).replace(/[&<>'"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));
  const slug = (text) => String(text).toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
  const bibKey = (p) => `sahoo${p.year}${slug(p.title).split('-').slice(0,3).join('')}`;
  const bibtex = (p) => {
    const doi = p.doi ? p.doi.replace(/^https?:\/\/doi\.org\//,'') : '';
    const fields = [`  title = {${p.title}},`, `  author = {${p.authors.replace(/, and /g, ' and ').replace(/, /g, ' and ')}},`, `  year = {${p.year}},`, `  journal = {${p.venue.replace(/\s+\d.*$/, '')}},`];
    if (doi) fields.push(`  doi = {${doi}},`);
    fields.push(`  note = {${p.status || 'Published'}}`);
    return `@article{${bibKey(p)},\n${fields.join('\n')}\n}`;
  };
  const downloadText = (filename, text) => { const blob = new Blob([text], {type:'text/plain;charset=utf-8'}); const url = URL.createObjectURL(blob); const a=document.createElement('a'); a.href=url; a.download=filename; document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url); };
  document.title = `${P.title} — Samir Sahoo`;
  $('#project-kicker').textContent = P.kicker;
  $('#project-title').textContent = P.title;
  $('#project-lead').textContent = P.lead;
  $('#project-figure').src = P.figure;
  $('#project-figure').alt = P.figureAlt;
  $('#project-prose').innerHTML = P.sections
    ? P.sections.map(s=>`<section class="essay-section"><h2>${esc(s.heading)}</h2>${s.paragraphs.map(p=>`<p>${esc(p)}</p>`).join('')}</section>`).join('')
    : P.paragraphs.map(p=>`<p>${esc(p)}</p>`).join('');
  $('#project-questions').innerHTML = P.questions.map(q=>`<li>${esc(q)}</li>`).join('');
  $('#related-pubs').innerHTML = P.related.map(i => C.publications[i]).map(p=>`
    <article>
      <h3>${esc(p.title)}</h3>
      <p>${esc(p.venue)} · ${esc(p.year)}</p>
      ${p.doi ? `<a href="${p.doi}" target="_blank" rel="noopener">DOI</a> · ` : ''}<a href="${p.scholar}" target="_blank" rel="noopener">Scholar</a> · <button class="bib-link related-bib" type="button" data-title="${esc(p.title)}">BibTeX</button>
    </article>`).join('');
  $('#year').textContent = new Date().getFullYear();
  $('#related-pubs').addEventListener('click', (e) => {
    const b = e.target.closest('.related-bib'); if (!b) return;
    const p = C.publications.find(x => x.title === b.dataset.title); if (!p) return;
    downloadText(`${bibKey(p)}.bib`, bibtex(p));
  });
  const toggle = document.querySelector('.nav-toggle');
  if (toggle) toggle.addEventListener('click', () => document.querySelector('.nav').classList.toggle('open'));
})();
