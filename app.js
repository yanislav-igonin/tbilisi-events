const CATS = { theatre:'театр', classical:'классика', show:'шоу', comedy:'стендап', pop:'поп', excursion:'экскурсии', sport:'спорт', electronic:'электроника', folk:'фолк', rap:'рэп', jazz:'джаз', dance:'танец', rock:'рок', metal:'метал', meetup:'митапы', quiz:'квизы', lecture:'лекции', party:'вечеринки', film:'кино', standup:'стендап', jam:'джемы', punk:'панк', blues:'блюз', other:'другое' };
const UNVERIFIED = new Set(['restored_unverified', 'unverified_lead']);
const WD = ['вс','пн','вт','ср','чт','пт','сб'];
const WD_RU = ['воскресенье','понедельник','вторник','среда','четверг','пятница','суббота'];
const WD_KA = ['კვირა','ორშაბათი','სამშაბათი','ოთხშაბათი','ხუთშაბათი','პარასკევი','შაბათი'];
const HOURS = { weekdays:'будни', weekends:'выходные', open:'ежедневно', tuesday_sunday:'вт–вс', tuesday_saturday:'вт–сб', last_entry:'последний вход', closed:'выходной' };
const DAY_EN = { Monday:'пн', Tuesday:'вт', Wednesday:'ср', Thursday:'чт', Friday:'пт', Saturday:'сб', Sunday:'вс' };

const favs = new Set(JSON.parse(localStorage.getItem('tbilisi-favs') || '[]'));
const state = { cat: null, onlyFav: false, day: null };
let data;

const $ = (s) => document.querySelector(s);
const esc = (s) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;' }[c]));
const dayOf = (iso) => new Date(iso + 'T12:00:00');
const startTime = (e) => e.time || e.times?.[0] || '';
const isMine = (e) => e.ticket_purchased || favs.has(String(e.id));

function days() {
  const out = [];
  for (let d = dayOf(data.metadata.date_from); d <= dayOf(data.metadata.date_to); d.setDate(d.getDate() + 1))
    out.push(d.toISOString().slice(0, 10));
  return out;
}

const shown = (e) => (!state.cat || e.category === state.cat) && (!state.onlyFav || isMine(e));

function renderDays() {
  $('#days').innerHTML = days().map((d) => {
    const evs = data.events.filter((e) => e.date === d && shown(e)), dt = dayOf(d);
    const ticket = data.events.some((e) => e.date === d && e.ticket_purchased);
    const dots = '<i></i>'.repeat(Math.min(evs.length, 5));
    return `<button class="${ticket ? 'ticket' : ''}" data-day="${d}" aria-pressed="${d === state.day}" aria-label="${dt.getDate()} ноября, событий: ${evs.length}">
      <span class="wd">${WD[dt.getDay()]}</span><span class="n">${dt.getDate()}</span><span class="dots">${dots}</span></button>`;
  }).join('') + `<button class="museum-tab" data-day="anytime" aria-pressed="${state.day === 'anytime'}">Любой день</button>`
    + `<button class="museum-tab" data-day="museums" aria-pressed="${state.day === 'museums'}">Музеи</button>`;
}

function card(e) {
  const id = String(e.id), fav = favs.has(id);
  const time = e.times ? e.times.join('<br>') : esc(e.time || '').replace(' / ', '<br>');
  const title = e.url ? `<a href="${esc(e.url)}" target="_blank" rel="noopener">${esc(e.title)}</a>` : esc(e.title);
  const price = /не подтвержден/i.test(e.price || '') ? 'цена неизвестна' : e.price;
  const where = [e.venue, price, e.language].filter((x) => x && x !== 'Билет уже куплен').map(esc).join(', ');
  const flag = (UNVERIFIED.has(e.status) ? '<span class="flag">Не подтверждено. </span>' : '') + (e.recurring ? 'Регулярное. ' : '');
  return `<article class="ev ${e.ticket_purchased ? 'mine' : ''}">
    <time>${time}</time>
    <div><h3>${title}</h3>
      <p class="where">${where}</p>
      ${e.description ? `<p class="about">${esc(e.description)}</p>` : ''}
      ${flag || e.notes ? `<p class="note">${flag}${esc(e.notes)}</p>` : ''}
      ${e.ticket_purchased ? '<span class="bought">Билет куплен</span>' : ''}</div>
    ${e.ticket_purchased ? '<span></span>' : `<button class="star" data-fav="${id}" aria-pressed="${fav}" aria-label="${fav ? 'Убрать из моих' : 'Добавить в мои'}">${fav ? '★' : '☆'}</button>`}
  </article>`;
}

function renderDay() {
  const anytime = state.day === 'anytime';
  const d = state.day, dt = anytime ? null : dayOf(d);
  const dayEvents = anytime ? data.anytime : data.events.filter((e) => e.date === d);
  const cats = [...new Set(dayEvents.map((e) => e.category))];
  if (state.cat && !cats.includes(state.cat)) state.cat = null;
  const evs = dayEvents.filter(shown).sort((a, b) => startTime(a).localeCompare(startTime(b)));
  const catBtn = (key, label) => `<button data-cat="${key ?? ''}" aria-pressed="${state.cat === key}">${label}</button>`;
  $('#day').innerHTML = (anytime
    ? `<div class="dayhead"><span class="big" style="font-size:44px">Любой день</span><span class="ru">Экскурсии и места по записи, без фиксированной даты</span></div>`
    : `<div class="dayhead"><span class="big">${dt.getDate()}</span>
      <span class="geo" lang="ka">${WD_KA[dt.getDay()]}</span>
      <span class="ru">${WD_RU[dt.getDay()]}, ноябрь</span></div>`) + `
    ${cats.length > 1 ? `<div class="cats">${catBtn(null, 'всё')}${cats.map((c) => catBtn(c, CATS[c] || c)).join('')}</div>` : ''}
    ${evs.map(card).join('') || `<p class="empty">${state.onlyFav ? 'На этот день ничего не отмечено. Сними «Только мои», чтобы увидеть всё.' : 'В этот день в афише пусто. Хороший вечер, чтобы просто погулять.'}</p>`}`;
}

function renderMuseums() {
  const hours = (h) => Object.entries(h || {}).map(([k, v]) =>
    `${HOURS[k] || k} ${Array.isArray(v) ? v.map((x) => DAY_EN[x] || x).join(', ') : v}`).join('; ');
  $('#museums').innerHTML = `<div class="dayhead"><span class="big" style="font-size:44px">Музеи</span><span class="ru">Открыты всю неделю, можно в любой день</span></div>` +
    data.museums.map((m) => `<div class="museum"><h3>${esc(m.name)}</h3>
      ${(m.exhibitions || []).map((x) => `<p>«${esc(x.title)}»${x.until ? `, до ${dayOf(x.until).toLocaleDateString('ru', { day: 'numeric', month: 'long' })}` : ''}${x.description ? `. ${esc(x.description)}` : ''}</p>`).join('')}
      ${m.description ? `<p>${esc(m.description)}</p>` : ''}
      <p class="hours">${/не подтвержден/i.test(m.price) ? 'Цена неизвестна' : esc(m.price)}. ${esc(hours(m.hours))}</p></div>`).join('') +
    `<footer>Афиша собрана 7 ноября. Цены и билеты проверяй по ссылкам.</footer>`;
}

function render() {
  const museums = state.day === 'museums';
  $('#day').hidden = museums; $('#museums').hidden = !museums;
  renderDays();
  museums ? renderMuseums() : renderDay();
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
    state.day = t.dataset.day; state.cat = null; render(); scrollTo({ top: 0 });
  }
});
$('#onlyFav').addEventListener('change', (e) => { state.onlyFav = e.target.checked; render(); });

fetch('events.json?v=' + Date.now()).then((r) => r.json()).then((d) => {
  data = d;
  const today = new Date().toISOString().slice(0, 10);
  state.day = days().includes(today) ? today : days()[0];
  render();
});
