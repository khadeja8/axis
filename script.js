/* =========================================
Axis — Shared Script (Multi-Page)
Includes: Home search (JSON) + Memory (journal) features
Memory features:
 - Save question as folder
 - Each folder contains entries (text or drawing)
 - Toggle between text/draw, draw with pointer/touch
 - Store in localStorage under 'axis_journal'
========================================= */

const $ = (sel, el=document) => el.querySelector(sel);
const $$ = (sel, el=document) => [...el.querySelectorAll(sel)];
const root = document.documentElement;
const TOAST_KEY = 'axis_toast_dummy';

const toast = (msg) => {
  const t = $('#toast');
  if(!t) return;
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 2200);
};

/* Ensure light theme */
root.classList.add('light');
try { localStorage.removeItem('axis_theme'); } catch(_) {}

/* -------------------- Home (search) -------------------- */
if(document.body.dataset.page === 'home'){
  // minimal home logic (assumes axisss.json present)
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
  function normalize(ar=''){ return String(ar).replace(/\u0640/g,'').replace(/[\u064B-\u0652\u0670]/g,'').trim().toLowerCase(); }
  let AXIS_DATA = []; let EMOS = [];
  async function loadData(){ const r = await fetch(DATA_PATH,{cache:'no-store'}); if(!r.ok) throw new Error('HTTP '+r.status); const j = await r.json(); AXIS_DATA = Array.isArray(j)?j:[]; EMOS = [...new Set(AXIS_DATA.map(i=>i[F.title]).filter(Boolean))]; }
  function buildChip(text){ const b=document.createElement('button'); b.type='button'; b.className='chip'; b.textContent=text; b.addEventListener('click',()=>{ if (emotionInput){ emotionInput.value=text; if(sendQuery) sendQuery.classList.add('show'); } doSearch(text,true); }); return b; }
  function renderChipsFrom(list){ if(!chipRow) return; chipRow.innerHTML=''; if(!list||list.length===0){ const empty=document.createElement('div'); empty.className='chip-empty'; empty.textContent='لا اقتراحات مطابقة'; chipRow.appendChild(empty); return; } list.slice(0,32).forEach(e=>chipRow.appendChild(buildChip(e))); }
  function renderChips(items){ renderChipsFrom([...new Set(items.map(i=>i[F.title]).filter(Boolean))]); }
  function card(it){ const t=it[F.title]||'—'; const d=it[F.desc]||''; const q=it[F.quote]||''; const a=it[F.ali]||''; const e=it[F.expl]||''; const s=it[F.qst]||''; return `
    <div class="result-item">
      <h4>${esc(t)}</h4>
      ${d?`<p>${textToHTML(d)}</p>`:''}
      ${(q||a||e||s)?`
        <details class="r-details">
          <summary>التفاصيل</summary>
          ${q?`<div class="r-block"><h5>مقولة فلسفية</h5><p>${textToHTML(q)}</p></div>`:''}
          ${a?`<div class="r-block"><h5>قول للإمام علي (ع)</h5><p>${textToHTML(a)}</p></div>`:''}
          ${e?`<div class="r-block"><h5>شرح المقولة</h5><p>${textToHTML(e)}</p></div>`:''}
          ${s?`<div class="r-block"><h5>سؤال استنتاجي</h5><p>${textToHTML(s)}</p></div>`:''}
        </details>
      `:''}
    </div>`; }
  function renderOne(item){ if(!results) return; results.innerHTML = item ? card(item) : `<div class="no-results">عذرًا، لا تتوفر معلومات عن هذا الشعور حاليًا.</div>`; }
  function doSearch(text, preferExact=false){ const q=String(text||'').trim(); if(!q){ results.innerHTML=''; return; } const lower=normalize(q); const exact = AXIS_DATA.find(it=>normalize(it[F.title]||'')===lower); if(preferExact && exact){ renderOne(exact); return; } const keys=[F.title,F.desc,F.quote,F.ali,F.expl,F.qst]; const firstPartial = AXIS_DATA.find(it=>{ const hay=normalize(keys.map(k=>it[k]||'').join(' ')); return hay.includes(lower); }); renderOne(firstPartial||null); }
  (async ()=>{ try{ await loadData(); renderChips(AXIS_DATA); results.innerHTML=''; }catch(e){ console.error(e); if(results) results.innerHTML=`<div class="no-results">حدث خطأ في تحميل البيانات.</div>`; toast('تعذّر تحميل ملف البيانات.'); } })();
  if (emotionInput && sendQuery){ emotionInput.addEventListener('input',()=>{ const v=emotionInput.value||''; const hasText=v.trim().length>0; sendQuery.classList.toggle('show',hasText); if(hasText){ const prefix=normalize(v); const filtered=EMOS.filter(e=>normalize(e).startsWith(prefix)); renderChipsFrom(filtered); }else{ renderChipsFrom(EMOS); results.innerHTML=''; } }); emotionInput.addEventListener('keydown',(e)=>{ if(e.key==='Enter'){ e.preventDefault(); doSearch(emotionInput.value,true); } }); sendQuery.addEventListener('click',()=>{ doSearch(emotionInput.value,true); }); }

} // end home

/* -------------------- Memory (journal) -------------------- */
if(document.body.dataset.page === 'memory'){
  // Elements
  const folderList = $('#folderList');
  const newFromQuestion = $('#newFromQuestion');
  const exportAll = $('#exportAll');
  const clearAll = $('#clearAll');
  const currentQuestion = $('#currentQuestion');
  const currentFolderInfo = $('#currentFolderInfo');
  const modeText = $('#modeText');
  const modeDraw = $('#modeDraw');
  const saveNote = $('#saveNote');
  const noteText = $('#noteText');
  const entriesEl = $('#entries');
  const drawCanvas = $('#drawCanvas');
  const clearCanvas = $('#clearCanvas');
  const exportCanvas = $('#exportCanvas');

  const STORAGE_KEY = 'axis_journal_v1';

  // state
  let JOURNAL = []; // array of {id,title,created,entries: [{id,type,content,created}...]}
  let ACTIVE_FOLDER_ID = null;
  let DRAW_MODE = false;

  // canvas setup
  let ctx=null, drawing=false, last={x:0,y:0}, ratio=1;
  function setupCanvas(){
    if(!drawCanvas) return;
    const c = drawCanvas;
    // set actual pixels for high-DPI
    const rect = c.getBoundingClientRect();
    const w = Math.floor(rect.width);
    const h = Math.floor(rect.height);
    ratio = window.devicePixelRatio||1;
    c.width = w*ratio; c.height = h*ratio;
    c.style.width = w+'px'; c.style.height = h+'px';
    ctx = c.getContext('2d');
    ctx.scale(ratio,ratio);
    ctx.lineCap='round'; ctx.lineJoin='round'; ctx.strokeStyle='#111'; ctx.lineWidth=2.6;
    // touch/pointer events
    c.addEventListener('pointerdown', (e)=>{ drawing=true; const p=getPos(e); last={x:p.x,y:p.y}; });
    c.addEventListener('pointermove', (e)=>{ if(!drawing) return; const p=getPos(e); ctx.beginPath(); ctx.moveTo(last.x,last.y); ctx.lineTo(p.x,p.y); ctx.stroke(); last={x:p.x,y:p.y}; });
    window.addEventListener('pointerup', ()=>{ drawing=false; });
    // disable scrolling when drawing on touch
    c.addEventListener('touchstart', (e)=>{ e.preventDefault(); }, {passive:false});
  }
  function getPos(e){
    const rect = drawCanvas.getBoundingClientRect();
    const x = (e.clientX - rect.left);
    const y = (e.clientY - rect.top);
    return {x, y};
  }
  function clearDrawing(){ if(!ctx) return; const c=drawCanvas; ctx.clearRect(0,0,c.width, c.height); }
  function exportDrawingAsData(){ if(!drawCanvas) return null; const data = drawCanvas.toDataURL('image/png'); return data; }

  // storage helpers
  function loadJournal(){ try{ const raw = localStorage.getItem(STORAGE_KEY); return raw ? JSON.parse(raw) : []; }catch(e){ return []; } }
  function saveJournal(){ localStorage.setItem(STORAGE_KEY, JSON.stringify(JOURNAL)); }

  function uid(prefix='id'){ return prefix+'_'+Math.random().toString(36).slice(2,9); }

  // UI renderers
  function renderFolderList(){
    if(!folderList) return;
    folderList.innerHTML='';
    if(JOURNAL.length===0){ const e=document.createElement('div'); e.className='small-muted'; e.textContent='لا توجد مفكرات بعد'; folderList.appendChild(e); return; }
    JOURNAL.forEach(f=>{
      const div=document.createElement('div'); div.className='folder-item'; if(f.id===ACTIVE_FOLDER_ID) div.classList.add('active');
      const left=document.createElement('div'); left.style.display='flex'; left.style.flexDirection='column';
      const title=document.createElement('div'); title.className='folder-title'; title.textContent=f.title;
      const meta=document.createElement('div'); meta.className='folder-meta'; meta.textContent=new Date(f.created).toLocaleString();
      left.appendChild(title); left.appendChild(meta);
      const right=document.createElement('div'); right.style.display='flex'; right.style.gap='.4rem';
      const del=document.createElement('button'); del.className='btn'; del.textContent='حذف'; del.addEventListener('click',(ev)=>{ ev.stopPropagation(); if(confirm('حذف المفكرة سيحذف كل ملاحظاتها. موافق؟')){ JOURNAL=JOURNAL.filter(x=>x.id!==f.id); if(ACTIVE_FOLDER_ID===f.id) ACTIVE_FOLDER_ID=null; saveJournal(); renderFolderList(); renderActiveFolder(); } });
      right.appendChild(del);
      div.appendChild(left); div.appendChild(right);
      div.addEventListener('click',()=>{ ACTIVE_FOLDER_ID=f.id; renderFolderList(); renderActiveFolder(); });
      folderList.appendChild(div);
    });
  }

  function renderActiveFolder(){
    const folder = JOURNAL.find(f=>f.id===ACTIVE_FOLDER_ID);
    if(!folder){
      currentQuestion.textContent = 'اختر مفكرة أو احفظ سؤال من نتيجة البحث';
      currentFolderInfo.textContent = '';
      entriesEl.innerHTML = '';
      noteText.value = '';
      clearDrawing();
      return;
    }
    currentQuestion.textContent = folder.title;
    currentFolderInfo.textContent = `${folder.entries.length} ملاحظة — انشئت ${new Date(folder.created).toLocaleString()}`;
    // render entries
    entriesEl.innerHTML='';
    if(folder.entries.length===0){ entriesEl.innerHTML='<div class="small-muted">لا توجد ملاحظات بعد</div>'; return; }
    folder.entries.slice().reverse().forEach(en=>{
      const div=document.createElement('div'); div.className='entry';
      const meta=document.createElement('div'); meta.className='meta'; meta.innerHTML=`<span>${new Date(en.created).toLocaleString()}</span><span><button class="btn">حذف</button></span>`;
      const content=document.createElement('div');
      if(en.type==='text'){ content.innerHTML = '<div>'+ (en.content? en.content.replace(/\\n/g,'<br>') : '') +'</div>'; }
      else if(en.type==='draw'){ content.innerHTML = `<img src="${en.content}" style="max-width:100%; border-radius:6px; display:block;" />`; }
      div.appendChild(meta); div.appendChild(content);
      // delete entry
      meta.querySelector('button').addEventListener('click', ()=>{
        if(confirm('حذف الملاحظة؟')){
          folder.entries = folder.entries.filter(x=>x.id!==en.id);
          saveJournal(); renderActiveFolder(); renderFolderList();
        }
      });
      entriesEl.appendChild(div);
    });
  }

  // actions
  function createFolderFromQuestion(title){
    if(!title) return toast('لا يوجد سؤال لحفظه.');
    const id = uid('folder');
    const f = { id, title, created: Date.now(), entries: [] };
    JOURNAL.push(f); saveJournal(); ACTIVE_FOLDER_ID = id; renderFolderList(); renderActiveFolder(); toast('تم إنشاء المفكرة');
  }

  function addTextEntryToActive(text){
    const folder = JOURNAL.find(f=>f.id===ACTIVE_FOLDER_ID);
    if(!folder) return toast('اختر مفكرة أولاً');
    const en = { id: uid('en'), type:'text', content: text, created: Date.now() };
    folder.entries.push(en); saveJournal(); renderActiveFolder(); toast('تم حفظ الملاحظة');
  }

  function addDrawEntryToActive(dataUrl){
    const folder = JOURNAL.find(f=>f.id===ACTIVE_FOLDER_ID);
    if(!folder) return toast('اختر مفكرة أولاً');
    const en = { id: uid('en'), type:'draw', content: dataUrl, created: Date.now() };
    folder.entries.push(en); saveJournal(); renderActiveFolder(); toast('تم حفظ الرسم');
  }

  // wire buttons
  function initMemory(){
    JOURNAL = loadJournal();
    ACTIVE_FOLDER_ID = JOURNAL.length ? JOURNAL[0].id : null;
    renderFolderList(); renderActiveFolder();
    // modes
    modeText.addEventListener('click', ()=>{ DRAW_MODE=false; modeText.classList.add('primary'); modeDraw.classList.remove('primary'); });
    modeDraw.addEventListener('click', ()=>{ DRAW_MODE=true; modeDraw.classList.add('primary'); modeText.classList.remove('primary'); setupCanvas(); });
    // save
    saveNote.addEventListener('click', ()=>{
      if(DRAW_MODE){
        const data = exportDrawingAsData();
        if(!data) return toast('لا يوجد رسم لحفظه'); addDrawEntryToActive(data);
      } else {
        const txt = (noteText.value||'').trim();
        if(!txt) return toast('لا يوجد نص للحفظ');
        addTextEntryToActive(txt);
        noteText.value='';
      }
    });
    // new folder button (takes current question from page if any)
    newFromQuestion.addEventListener('click', ()=>{
      // try to read question from current page (search results). We look for element with class "result-item" and first h4 text
      let q = '';
      const resItem = document.querySelector('.result-item');
      if(resItem){
        const h = resItem.querySelector('h4');
        if(h) q = h.textContent.trim();
      }
      if(!q) q = prompt('اكتب عنوان المفكرة (اسم الشعور) الذي تريد حفظه:');
      if(q) createFolderFromQuestion(q);
    });
    exportAll.addEventListener('click', ()=>{
      const data = JSON.stringify(JOURNAL, null, 2);
      const blob = new Blob([data], {type:'application/json'});
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a'); a.href=url; a.download='axis_journal_export.json'; document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url);
    });
    clearAll.addEventListener('click', ()=>{
      if(confirm('مسح كل المفكرات؟')){ JOURNAL=[]; saveJournal(); ACTIVE_FOLDER_ID=null; renderFolderList(); renderActiveFolder(); }
    });
    // canvas controls
    clearCanvas.addEventListener('click', ()=>{ clearDrawing(); });
    exportCanvas.addEventListener('click', ()=>{
      const data = exportDrawingAsData();
      if(!data) return toast('لا يوجد رسم');
      // save directly as drawing entry if active
      addDrawEntryToActive(data);
      clearDrawing();
    });
  }

  // start up
  initMemory();
  // resize/redraw canvas on window resize
  window.addEventListener('resize', ()=>{ if(DRAW_MODE) { setupCanvas(); } });

} // end memory
