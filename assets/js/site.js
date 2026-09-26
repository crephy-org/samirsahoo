(() => {
  const C = window.SITE_CONTENT;
  const $ = s => document.querySelector(s);
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));

  $('#hero-name').textContent = C.profile.name;
  $('#hero-title').textContent = C.profile.title;
  $('#hero-summary').textContent = C.profile.summary;
  $('#email-link').textContent = C.profile.email;
  $('#email-link').href = `mailto:${C.profile.email}`;
  $('#scholar-link').href = C.profile.scholar;
  $('#orcid-link').href = C.profile.orcid;
  $('#ResearchGate-link').href = C.profile.ResearchGate;
  $('#GitHub-link').href = C.profile.GitHub;
  $('#year').textContent = new Date().getFullYear();

  if (C.profile.portrait) {
    const slot = $('#portrait-slot');
    slot.hidden = false;
    slot.innerHTML = `<img src="${C.profile.portrait}" alt="Portrait of ${esc(C.profile.name)}">`;
  }

  const bibKey = p => `${p.authors.split(',')[0].split(' ').pop()}${p.year}${p.title.replace(/[^A-Za-z0-9 ]/g,'').split(' ').filter(Boolean).slice(0,3).join('')}`;
  const bibtex = (p) => {
    const doi = p.doi ? p.doi.replace(/^https?:\/\/doi\.org\//,'') : '';
    const fields = [
      `  title = {${p.title}},`,
      `  author = {${p.authors.replace(/, and /g, ' and ').replace(/, /g, ' and ')}},`,
      `  year = {${p.year}},`,
      `  journal = {${p.venue.replace(/\s+\d.*$/, '')}},`
    ];
    if (doi) fields.push(`  doi = {${doi}},`);
    fields.push(`  note = {${p.status || 'Published'}}`);
    return `@article{${bibKey(p)},\n${fields.join('\n')}\n}`;
  };
  const downloadText = (filename, text) => {
    const blob = new Blob([text], {type:'text/plain;charset=utf-8'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = filename; document.body.appendChild(a); a.click(); a.remove();
    URL.revokeObjectURL(url);
  };

  $('#news-list').innerHTML = C.news.map(n => `
    <article class="news-item">
      <span class="news-date">${esc(n.date)}</span>
      <h3>${esc(n.title)}</h3>
      <p>${esc(n.text)}</p>
    </article>`).join('');

  $('#research-grid').innerHTML = C.researchThemes.map((r,i) => `
    <article class="research-card reveal" style="--delay:${i*55}ms">
      <span class="card-index">0${i+1}</span>
      <h3>${esc(r.title)}</h3>
      <p>${esc(r.text)}</p>
      <div class="tag-row">${r.tags.map(t=>`<span>${esc(t)}</span>`).join('')}</div>
      <a class="card-link" href="${r.link}">Read more →</a>
    </article>`).join('');

  $('#directions-list').innerHTML = C.currentDirections.map((d,i) => `
    <article class="direction-row reveal" style="--delay:${i*55}ms">
      <span class="direction-number">${String(i+1).padStart(2,'0')}</span>
      <div><h3>${esc(d.title)}</h3><p>${esc(d.text)}</p></div>
    </article>`).join('');

  let expanded = false;
  function renderPubs() {
    const list = expanded ? C.publications : C.publications.slice(0,6);
    $('#publication-list').innerHTML = list.map(p => `
      <article class="pub-row">
        <div class="pub-year">${esc(p.year)}</div>
        <div class="pub-main">
          <h3>${esc(p.title)}</h3>
          <p>${esc(p.authors)}</p>
          <p class="venue">${esc(p.venue)}${p.status ? ` · ${esc(p.status)}` : ''}</p>
        </div>
        <div class="pub-links">
          ${p.doi ? `<a href="${p.doi}" target="_blank" rel="noopener">DOI</a>` : ''}
          <a href="${p.scholar}" target="_blank" rel="noopener">Scholar</a>
          <button class="bib-link" type="button" data-bib-index="${C.publications.indexOf(p)}">BibTeX</button>
        </div>
      </article>`).join('');
    $('#toggle-publications').textContent = expanded ? 'Show selected publications' : 'Show all publications';
  }
  renderPubs();
  $('#toggle-publications').addEventListener('click', () => { expanded = !expanded; renderPubs(); });
  $('#publication-list').addEventListener('click', (e) => {
    const b = e.target.closest('[data-bib-index]');
    if (!b) return;
    const p = C.publications[Number(b.dataset.bibIndex)];
    downloadText(`${bibKey(p)}.bib`, bibtex(p));
  });
  $('#download-bibtex').addEventListener('click', () => {
    downloadText('Samir_Sahoo_publications.bib', C.publications.map(bibtex).join('\n\n'));
  });

  $('#methods').innerHTML = C.methods.map(x=>`<span>${esc(x)}</span>`).join('');
  $('#experience-list').innerHTML = C.experience.map(x=>`
    <div class="timeline-row"><div class="timeline-date">${esc(x.period)}</div><div><h4>${esc(x.role)}</h4><p class="place">${esc(x.place)}</p><p>${esc(x.detail)}</p></div></div>`).join('');
  $('#teaching-list').innerHTML = C.teaching.map(x=>`
    <div class="timeline-row"><div class="timeline-date">${esc(x.term)}</div><div><h4>${esc(x.course)}</h4><p class="place">${esc(x.place)}</p><p>${esc(x.detail)}</p></div></div>`).join('');

  const toggle = $('.nav-toggle');
  toggle.addEventListener('click', () => $('.nav').classList.toggle('open'));
  document.querySelectorAll('.nav a').forEach(a => a.addEventListener('click',()=>$('.nav').classList.remove('open')));

  const io = new IntersectionObserver(entries => entries.forEach(e => {
    if (e.isIntersecting) e.target.classList.add('visible');
  }), {threshold:.1});
  document.querySelectorAll('.reveal').forEach(el=>io.observe(el));
})();
