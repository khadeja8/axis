/* =========================================
   Axis — Shared Script (Multi-Page)
   - Light theme only & nav highlight
   - Home: exact-match submit-only + show "save question" button after question
   - Memory: folder grid (one per emotion)
   - NO CSS inside.
   ========================================= */
const $ = (sel, el=document) => el.querySelector(sel);
const $$ = (sel, el=document) => [...el.querySelectorAll(sel)];
const root = document.documentElement;
root.classList.add('light'); try{ localStorage.removeItem('axis_theme'); }catch{}

(()=>{ const page=document.body.dataset.page; $$('.main-nav .nav-btn').forEach(a=>{a.classList.toggle('is-active',a.dataset.match===page); if(a.dataset.match===page)a.setAttribute('aria-current','page');});})();

const toast=(msg)=>{const t=$('#toast'); if(!t)return; t.textContent=msg; t.classList.add('show'); setTimeout(()=>t.classList.remove('show'),2000);};

/* =================== HOME =================== */
if(document.body.dataset.page==='home'){
  const chipRow=$('#chipRow'), emotionInput=$('#emotionInput'), sendQuery=$('#sendQuery'), results=$('#results');
  const DATA_PATH='./axisss.json';
  const PENDING_KEY='axis_pending_question_v1';
  const F={title:'الشعور',desc:'شرح الشعور',quote:'مقولة فلسفية',ali:'مقولة للامام علي (ع)',expl:'شرح المقولة ',qst:'سؤال استنتاجي '};
  const esc=(s='')=>String(s).replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
  const textToHTML=(s='')=>esc(s).replace(/\n/g,'<br>');
  const normalize=(s='')=>String(s).replace(/\u0640/g,'').replace(/[\u064B-\u0652\u0670]/g,'').trim().toLowerCase();
  let DATA=[], EMOS=[];
  async function load(){const r=await fetch(DATA_PATH,{cache:'no-store'});const j=await r.json();DATA=Array.isArray(j)?j:[];EMOS=[...new Set(DATA.map(x=>x[F.title]).filter(Boolean))];}
  function buildChip(t){const b=document.createElement('button'); b.className='chip'; b.textContent=t; b.type='button'; b.onclick=()=>{emotionInput.value=t; sendQuery.classList.add('show');}; return b;}
  function chipsFrom(list){chipRow.innerHTML=''; if(!list.length){const d=document.createElement('div'); d.className='chip-empty'; d.textContent='لا اقتراحات مطابقة'; chipRow.appendChild(d); return;} list.slice(0,32).forEach(e=>chipRow.appendChild(buildChip(e)));}
  function card(it){
    const t=it[F.title]||'—'; const d=it[F.desc]||''; const q=it[F.quote]||''; const a=it[F.ali]||''; const e=it[F.expl]||''; const s=it[F.qst]||'';
    const questionBlock=s?`
      <div class="r-block">
        <h5>سؤال استنتاجي</h5>
        <p>${textToHTML(s)}</p>
      </div>
      <div class="r-actions" style="margin-top:.5rem">
        <button class="btn primary" data-act="save-question" data-emotion="${esc(t)}" data-question="${esc(s)}">احفظ السؤال بالمفكرة ان كنت تود تدوين اجاباتك </button>
      </div>`:'';
    return `
      <div class="result-item">
        <h4>${esc(t)}</h4>
        ${d?`<p>${textToHTML(d)}</p>`:''}
        ${(q||a||e||s)?`
          <details class="r-details" open>
            <summary>التفاصيل</summary>
            ${q?`<div class="r-block"><h5>مقولة فلسفية</h5><p>${textToHTML(q)}</p></div>`:''}
            ${a?`<div class="r-block"><h5>قول للإمام علي (ع)</h5><p>${textToHTML(a)}</p></div>`:''}
            ${e?`<div class="r-block"><h5>شرح المقولة</h5><p>${textToHTML(e)}</p></div>`:''}
            ${questionBlock}
          </details>`:''}
      </div>`;}
  function renderOne(item){results.innerHTML=item?card(item):'<div class="no-results">عذرًا، لا تتوفر معلومات عن هذا الشعور حاليًا.</div>';}
  function searchSubmit(){const q=(emotionInput.value||'').trim(); if(!q){results.innerHTML='';return;} const exact=DATA.find(it=>normalize(it[F.title]||'')===normalize(q)); renderOne(exact||null);}
  if(results){results.addEventListener('click',e=>{const btn=e.target.closest('[data-act="save-question"]'); if(!btn)return; const emotion=btn.getAttribute('data-emotion')||''; const question=btn.getAttribute('data-question')||''; if(!emotion||!question){toast('لا يوجد سؤال استنتاجي لحفظه.'); return;} try{localStorage.setItem(PENDING_KEY,JSON.stringify({emotion,question,ts:Date.now()}));}catch{} window.location.href='memory.html';});}
  (async()=>{try{await load();chipsFrom(EMOS);}catch(e){results.innerHTML='<div class="no-results">تعذر تحميل البيانات.</div>';}})();
  emotionInput?.addEventListener('input',()=>{const v=emotionInput.value||''; sendQuery.classList.toggle('show',v.trim().length>0); const filtered=EMOS.filter(e=>normalize(e).startsWith(normalize(v))); chipsFrom(filtered);});
  emotionInput?.addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();}});
  sendQuery?.addEventListener('click',searchSubmit);
}

/* =================== MEMORY =================== */
if (document.body.dataset.page === 'memory') {
  const GRID = $('#folderGrid');
  const EMPTY = $('#emptyMem');
  const LIST_SEC = $('#memList');
  const DETAIL_SEC = $('#memDetail');
  const BTN_BACK = $('#backToGrid');
  const D_EMO = $('#detailEmotion');
  const D_Q = $('#detailQuestion');

  // أدوات التحرير
  const modeTextBtn = $('#modeText');
  const modeDrawBtn = $('#modeDraw');
  const textEditor = $('#textEditor');
  const drawEditor = $('#drawEditor');
  const noteText = $('#noteText');
  const saveNoteBtn = $('#saveNote');
  const drawCanvas = $('#drawCanvas');
  const clearCanvasBtn = $('#clearCanvas');
  const saveDrawingBtn = $('#saveDrawing');
  const entriesEl = $('#entries');

  const STORAGE_KEY = 'axis_journal_v2';
  const PENDING_KEY = 'axis_pending_question_v1';

  function load() {
    try { const raw = localStorage.getItem(STORAGE_KEY); return raw ? JSON.parse(raw) : []; }
    catch { return []; }
  }
  function save(data) { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); }
  function uid() { return 'en_' + Math.random().toString(36).slice(2, 9); }

  function ensureEntriesShape() {
    const data = load();
    let changed = false;
    data.forEach(f => { if (!Array.isArray(f.entries)) { f.entries = []; changed = true; } });
    if (changed) save(data);
  }

  function upsertFromPending() {
    let pending = null;
    try { const raw = localStorage.getItem(PENDING_KEY); pending = raw ? JSON.parse(raw) : null; } catch {}
    if (!pending || !pending.emotion) return;

    const data = load();
    const i = data.findIndex(x => x.emotion === pending.emotion);
    if (i >= 0) {
      data[i].question = pending.question || data[i].question || '';
    } else {
      data.push({
        id: 'f_' + Math.random().toString(36).slice(2, 9),
        emotion: pending.emotion,
        question: pending.question || '',
        created: Date.now(),
        entries: []
      });
    }
    save(data);
    try { localStorage.removeItem(PENDING_KEY); } catch {}
    toast('تم حفظ السؤال في المفكرة');
  }

  function renderGrid() {
    const data = load();
    GRID.innerHTML = '';
    if (!data.length) { EMPTY.hidden = false; return; }
    EMPTY.hidden = true;

    data.forEach(item => {
      const card = document.createElement('button');
      card.type = 'button';
      card.className = 'folder-card';
      card.setAttribute('data-id', item.id);
      card.innerHTML = `
        <img src="folder.png" alt="Folder" class="folder-icon">
        <div class="folder-name">${item.emotion}</div>
      `;
      card.addEventListener('click', () => openDetail(item.id));
      GRID.appendChild(card);
    });
  }

  let ACTIVE_ID = null;

  function openDetail(id) {
    const data = load();
    const item = data.find(x => x.id === id);
    if (!item) return;

    ACTIVE_ID = id;
    D_EMO.textContent = item.emotion || '';
    D_Q.textContent = item.question || '—';
    LIST_SEC.hidden = true;
    DETAIL_SEC.hidden = false;

    showMode('text');
    renderEntries(item);
  }

  function back() {
    DETAIL_SEC.hidden = true;
    LIST_SEC.hidden = false;
    ACTIVE_ID = null;
  }

  function showMode(mode) {
    if (mode === 'text') {
      textEditor.hidden = false;
      drawEditor.hidden = true;
    } else {
      textEditor.hidden = true;
      drawEditor.hidden = false;
      prepareCanvas();
    }
  }

  function renderEntries(folder) {
    entriesEl.innerHTML = '';
    if (!folder.entries || !folder.entries.length) {
      const e = document.createElement('div');
      e.className = 'small-muted';
      e.textContent = 'لا توجد ملاحظات بعد';
      entriesEl.appendChild(e);
      return;
    }
    folder.entries.slice().reverse().forEach(en => {
      const wrap = document.createElement('div');
      wrap.className = 'entry';
      const bar = document.createElement('div');
      bar.className = 'meta';
      bar.innerHTML = `<span>${new Date(en.created).toLocaleString()}</span>
                       <button class="btn" data-del="${en.id}">حذف</button>`;
      const body = document.createElement('div');
      if (en.type === 'text') {
        body.innerHTML = `<div>${(en.content || '').replace(/\n/g, '<br>')}</div>`;
      } else if (en.type === 'draw') {
        body.innerHTML = `<img src="${en.content}" alt="" style="max-width:100%;display:block;border-radius:8px;">`;
      }
      wrap.appendChild(bar); wrap.appendChild(body);
      entriesEl.appendChild(wrap);
      bar.querySelector('[data-del]').addEventListener('click', () => {
        const data = load();
        const f = data.find(x => x.id === ACTIVE_ID);
        if (!f) return;
        f.entries = f.entries.filter(x => x.id !== en.id);
        save(data);
        renderEntries(f);
      });
    });
  }

  saveNoteBtn?.addEventListener('click', () => {
    const txt = (noteText?.value || '').trim();
    if (!txt) { toast('اكتب شيئًا أولاً'); return; }
    const data = load();
    const f = data.find(x => x.id === ACTIVE_ID);
    if (!f) { toast('افتح مفكرة أولاً'); return; }
    f.entries = f.entries || [];
    f.entries.push({ id: uid(), type: 'text', content: txt, created: Date.now() });
    save(data);
    noteText.value = '';
    renderEntries(f);
    toast('تم حفظ الملاحظة');
  });

  let ctx, drawing = false, last = null;

  function prepareCanvas() {
    if (!drawCanvas) return;
    const ratio = window.devicePixelRatio || 1;
    const w = drawCanvas.clientWidth || drawCanvas.width || 600;
    const h = drawCanvas.clientHeight || drawCanvas.height || 360;
    drawCanvas.width  = Math.floor(w * ratio);
    drawCanvas.height = Math.floor(h * ratio);
    ctx = drawCanvas.getContext('2d');
    ctx.scale(ratio, ratio);
    ctx.lineWidth = 2.2;
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#222';
    ctx.clearRect(0, 0, drawCanvas.width, drawCanvas.height);
  }

  function getPos(e) {
    const rect = drawCanvas.getBoundingClientRect();
    if (e.touches && e.touches[0]) {
      return { x: e.touches[0].clientX - rect.left, y: e.touches[0].clientY - rect.top };
    } else {
      return { x: e.clientX - rect.left, y: e.clientY - rect.top };
    }
  }

  function start(e) { drawing = true; last = getPos(e); }
  function move(e) {
    if (!drawing) return;
    const p = getPos(e);
    ctx.beginPath();
    ctx.moveTo(last.x, last.y);
    ctx.lineTo(p.x, p.y);
    ctx.stroke();
    last = p;
  }
  function end() { drawing = false; last = null; }

  if (drawCanvas) {
    drawCanvas.addEventListener('mousedown', start);
    drawCanvas.addEventListener('mousemove', move);
    window.addEventListener('mouseup', end);
    drawCanvas.addEventListener('touchstart', (e) => { e.preventDefault(); start(e); }, { passive: false });
    drawCanvas.addEventListener('touchmove',  (e) => { e.preventDefault(); move(e);  }, { passive: false });
    drawCanvas.addEventListener('touchend', end);
    drawCanvas.addEventListener('dragstart', e => e.preventDefault());
  }

  clearCanvasBtn?.addEventListener('click', () => {
    if (!ctx) prepareCanvas();
    if (ctx) { ctx.clearRect(0, 0, drawCanvas.width, drawCanvas.height); }
  });

  saveDrawingBtn?.addEventListener('click', () => {
    const data = load();
    const f = data.find(x => x.id === ACTIVE_ID);
    if (!f) { toast('افتح مفكرة أولاً'); return; }
    const url = drawCanvas.toDataURL('image/png');
    f.entries = f.entries || [];
    f.entries.push({ id: uid(), type: 'draw', content: url, created: Date.now() });
    save(data);
    renderEntries(f);
    toast('تم حفظ الرسم');
  });

  modeTextBtn?.addEventListener('click', () => showMode('text'));
  modeDrawBtn?.addEventListener('click', () => showMode('draw'));

  ensureEntriesShape();
  upsertFromPending();
  renderGrid();
  BTN_BACK?.addEventListener('click', back);
}
