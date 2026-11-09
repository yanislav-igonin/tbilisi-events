const CATS = { theatre:'Театр', classical:'Классика', show:'Шоу', comedy:'Стендап', pop:'Поп', excursion:'Экскурсии', sport:'Спорт', electronic:'Электроника', folk:'Фолк', rap:'Рэп', jazz:'Джаз', dance:'Танец', rock:'Рок', metal:'Метал' };
const STATUS = { restored_unverified:'не подтверждено', unverified_lead:'не подтверждено' };
const WD = ['вс','пн','вт','ср','чт','пт','сб'];
const favs = new Set(JSON.parse(localStorage.getItem('tbilisi-favs') || '[]'));
const state = { cat: null, onlyFav: false };
let data;

const $ = (s) => document.querySelector(s);
const esc = (s) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;' }[c]));
const dayOf = (iso) => new Date(iso + 'T12:00:00');

function days() {
  const out = [];
  for (let d = dayOf(data.metadata.date_from); d <= dayOf(data.metadata.date_to); d.setDate(d.getDate() + 1))
    out.push(d.toISOString().slice(0, 10));
  return out;
}

function visible() {
  return data.events.filter((e) => (!state.cat || e.category === state.cat) && (!state.onlyFav || favs.has(String(e.id)) || e.ticket_purchased));
}

function renderCats() {
  const counts = {};
  data.events.forEach((e) => counts[e.category] = (counts[e.category] || 0) + 1);
  const btn = (key, label) => `<button data-cat="${key ?? ''}" aria-pressed="${state.cat === key}">${label}</button>`;
  $('#cats').innerHTML = btn(null, 'Все') + Object.keys(counts).sort((a, b) => counts[b] - counts[a])
    .map((c) => btn(c, `${CATS[c] || c} · ${counts[c]}`)).join('');
}

function renderDays(list) {
  $('#days').innerHTML = days().map((d) => {
    const evs = list.filter((e) => e.date === d), dt = dayOf(d);
    const busy = data.events.some((e) => e.date === d && e.ticket_purchased);
    return `<button class="${busy ? 'busy' : ''} ${evs.length ? '' : 'empty'}" data-day="${d}">
      <small>${WD[dt.getDay()]}</small><b>${dt.getDate()}</b><small>${busy ? '🎟' : evs.length}</small></button>`;
  }).join('');
}

function card(e) {
  const id = String(e.id), fav = favs.has(id);
  const time = e.times ? e.times.join('<br>') : esc(e.time);
  const title = e.url ? `<a href="${esc(e.url)}" target="_blank" rel="noopener">${esc(e.title)}</a>` : esc(e.title);
  const tags = [`<span class="tag">${CATS[e.category] || esc(e.category)}</span>`];
  if (e.ticket_purchased) tags.push('<span class="tag ok">билет куплен</span>');
  if (STATUS[e.status]) tags.push(`<span class="tag warn">${STATUS[e.status]}</span>`);
  if (e.url_type === 'listing') tags.push('<span class="tag">ссылка на афишу</span>');
  return `<article class="ev ${e.ticket_purchased ? 'mine' : ''}">
    <time>${time}</time>
    <div><h3>${title}</h3>
      <p>${esc(e.venue)}${e.price ? ' · ' + esc(e.price) : ''}${e.language ? ' · ' + esc(e.language) : ''}</p>
      ${e.description ? `<p>${esc(e.description)}</p>` : ''}
      ${e.notes ? `<p><i>${esc(e.notes)}</i></p>` : ''}
      <p>${tags.join('')}</p></div>
    <button class="star" data-fav="${id}" aria-pressed="${fav}" aria-label="В избранное">${fav ? '★' : '☆'}</button>
  </article>`;
}

function renderList(list) {
  $('#list').innerHTML = days().map((d) => {
    const evs = list.filter((e) => e.date === d).sort((a, b) => (a.time || a.times?.[0] || '').localeCompare(b.time || b.times?.[0] || ''));
    if (!evs.length) return '';
    const dt = dayOf(d);
    return `<section class="day" id="d-${d}"><h2>${dt.getDate()} ноября, ${WD[dt.getDay()]}</h2>${evs.map(card).join('')}</section>`;
  }).join('') || '<p>Ничего не найдено.</p>';
}

function renderMuseums() {
  $('#museumList').innerHTML = data.museums.map((m) => `<div class="museum"><h3>${esc(m.name)}</h3>
    ${(m.exhibitions || []).map((x) => `<p>«${esc(x.title)}»${x.until ? ' до ' + esc(x.until) : ''}${x.description ? ' — ' + esc(x.description) : ''}</p>`).join('')}
    ${m.description ? `<p>${esc(m.description)}</p>` : ''}
    <p class="tag">${esc(m.price)}</p> ${Object.entries(m.hours || {}).map(([k, v]) => `<span class="tag">${esc(k)}: ${esc(Array.isArray(v) ? v.join(', ') : v)}</span>`).join('')}
  </div>`).join('');
}

function render() {
  const list = visible();
  renderCats(); renderDays(list); renderList(list);
  document.documentElement.style.setProperty('--hh', $('header').offsetHeight + 'px');
}

document.addEventListener('click', (ev) => {
  const t = ev.target.closest('button');
  if (!t) return;
  if (t.dataset.fav) {
    favs.has(t.dataset.fav) ? favs.delete(t.dataset.fav) : favs.add(t.dataset.fav);
    localStorage.setItem('tbilisi-favs', JSON.stringify([...favs]));
    render();
  } else if ('cat' in t.dataset) {
    state.cat = t.dataset.cat || null; render();
  } else if (t.dataset.day) {
    document.getElementById('d-' + t.dataset.day)?.scrollIntoView({ behavior: 'smooth' });
  }
});
$('#onlyFav').addEventListener('change', (e) => { state.onlyFav = e.target.checked; render(); });

fetch('events.json').then((r) => r.json()).then((d) => { data = d; render(); renderMuseums(); });
