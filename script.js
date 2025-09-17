/* =========================================
   Axis — Shared Script (Multi-Page)
   - Nav highlight.
   - Light theme only.
   - Home: load axisss.json, chips from "الشعور".
   - EXACT ONLY + Submit-only: Results appear ONLY when pressing the send button.
   - No emojis/icons; full description with newlines preserved.
   ========================================= */

const $ = (sel, el=document) => el.querySelector(sel);
const $$ = (sel, el=document) => [...el.querySelectorAll(sel)];
const root = document.documentElement;

const toast = (msg) => {
  const t = $('#toast');
  if(!t) return;
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 2200);
};

/* Light-only */
root.classList.add('light');
try { localStorage.removeItem('axis_theme'); } catch(_){}

/* Minimal styles (no icons) */
(function injectStyles(){
  const css = `
  .results{
    display:flex; flex-direction:column; gap:1rem; margin-top:1.2rem; align-items:center;
  }
  .result-item{
    width:100%; max-width:720px; background:var(--surface-2,#fff);
    border:1px solid rgba(0,0,0,.08); border-radius:12px; padding:1.1rem 1.25rem;
    box-shadow:0 6px 16px rgba(0,0,0,.06); transition:transform .2s ease;
  }
  .result-item:hover{ transform:translateY(-2px); }
  .result-item h4{
    font-size:1.28rem; font-weight:800; margin:0 0 .55rem;
    display:flex; align-items:center; gap:.45rem;
  }
  .r-details{ margin-top:.75rem; }
  .r-block{ margin-top:.5rem; }
  .no-results, .chip-empty{
    width:100%; max-width:560px; text-align:center; padding:1rem;
    border-radius:12px; background:#f8f9fb; border:1px dashed #c9ced6; color:#4b5563;
    font-size:1.06rem; display:flex; align-items:center; justify-content:center;
    margin-top:1.0rem;
  }
  `;
  const s = document.createElement('style');
  s.setAttribute('data-axis','injected-result-styles');
  s.textContent = css;
  document.head.appendChild(s);
})();

/* Nav highlight */
(() => {
  const page = document.body.dataset.page;
  $$('.main-nav .nav-btn').forEach(a => {
    a.classList.toggle('is-active', a.dataset.match === page);
    if(a.dataset.match === page) a.setAttribute('aria-current', 'page');
  });
})();

/* Home */
if(document.body.dataset.page === 'home'){
  const chipRow      = $('#chipRow');
  const emotionInput = $('#emotionInput');
  const sendQuery    = $('#sendQuery');
  const results      = $('#results');

  const DATA_PATH = './axisss.json';

  const F = {
    title: 'الشعور',
    desc:  'شرح الشعور',
    quote: 'مقولة فلسفية',
    ali:   'مقولة للامام علي (ع)',
    expl:  'شرح المقولة ',
    qst:   'سؤال استنتاجي ',
  };

  const esc = (s='') => String(s).replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
  const textToHTML = (s='') => esc(s).replace(/\n/g,'<br>');

  function normalize(ar=''){
    return String(ar)
      .replace(/\u0640/g, '')              // ـ
      .replace(/[\u064B-\u0652\u0670]/g, '') // الحركات
      .trim().toLowerCase();
  }

  let AXIS_DATA = [];
  let EMOS = [];

  async function loadData(){
    const res = await fetch(DATA_PATH, {cache:'no-store'});
    if(!res.ok) throw new Error('HTTP '+res.status);
    const json = await res.json();
    AXIS_DATA = Array.isArray(json) ? json : [];
    EMOS = [...new Set(AXIS_DATA.map(i => i[F.title]).filter(Boolean))];
  }

  function buildChip(text){
    const chip = document.createElement('button');
    chip.type = 'button';
    chip.className = 'chip';
    chip.textContent = text;
    chip.addEventListener('click', () => {
      if (emotionInput) {
        emotionInput.value = text;
        if (sendQuery) sendQuery.classList.add('show');
      }
      // IMPORTANT: no auto-search here
    });
    return chip;
  }

  function renderChipsFrom(list){
    if(!chipRow) return;
    chipRow.innerHTML = '';
    if(!list || list.length === 0){
      const empty = document.createElement('div');
      empty.className = 'chip-empty';
      empty.textContent = 'لا اقتراحات مطابقة';
      chipRow.appendChild(empty);
      return;
    }
    list.slice(0, 32).forEach(e => chipRow.appendChild(buildChip(e)));
  }

  function renderChips(items){
    renderChipsFrom([...new Set(items.map(i => i[F.title]).filter(Boolean))]);
  }

  function card(it){
    const t = it[F.title] || '—';
    const d = it[F.desc]  || '';
    const q = it[F.quote] || '';
    const a = it[F.ali]   || '';
    const e = it[F.expl]  || '';
    const s = it[F.qst]   || '';

    return `
      <div class="result-item">
        <h4>${esc(t)}</h4>
        ${d ? `<p>${textToHTML(d)}</p>` : ''}
        ${(q||a||e||s) ? `
          <details class="r-details">
            <summary>التفاصيل</summary>
            ${q ? `<div class="r-block"><h5>مقولة فلسفية</h5><p>${textToHTML(q)}</p></div>` : ''}
            ${a ? `<div class="r-block"><h5>قول للإمام علي (ع)</h5><p>${textToHTML(a)}</p></div>` : ''}
            ${e ? `<div class="r-block"><h5>شرح المقولة</h5><p>${textToHTML(e)}</p></div>` : ''}
            ${s ? `<div class="r-block"><h5>سؤال استنتاجي</h5><p>${textToHTML(s)}</p></div>` : ''}
          </details>
        ` : ''}
      </div>
    `;
  }

  function renderOne(item){
    if(!results) return;
    results.innerHTML = item
      ? card(item)
      : `<div class="no-results">عذرًا، لا تتوفر معلومات عن هذا الشعور حاليًا.</div>`;
  }

  // EXACT ONLY + submit-only
  function doSearchOnSubmit(){
    const q = String(emotionInput?.value || '').trim();
    if(!q){ results.innerHTML = ''; return; }
    const lower = normalize(q);
    const exact = AXIS_DATA.find(it => normalize(it[F.title]||'') === lower);
    renderOne(exact || null);
  }

  (async ()=>{
    try{
      await loadData();
      renderChips(AXIS_DATA);
      results.innerHTML = '';
    }catch(e){
      console.error(e);
      if (results) results.innerHTML = `<div class="no-results">حدث خطأ في تحميل البيانات.</div>`;
      toast('تعذّر تحميل ملف البيانات.');
    }
  })();

  if (emotionInput && sendQuery){
    emotionInput.addEventListener('input', ()=>{
      const v = emotionInput.value || '';
      const hasText = v.trim().length > 0;
      sendQuery.classList.toggle('show', hasText);

      if(hasText){
        const prefix = normalize(v);
        const filtered = EMOS.filter(e => normalize(e).startsWith(prefix));
        renderChipsFrom(filtered);
      }else{
        renderChipsFrom(EMOS);
        results.innerHTML = '';
      }
    });

    // Disable Enter search: no action on Enter
    emotionInput.addEventListener('keydown', (e)=>{
      if(e.key === 'Enter'){
        e.preventDefault(); // do nothing
      }
    });

    // Only this triggers search
    sendQuery.addEventListener('click', doSearchOnSubmit);
  }
}
