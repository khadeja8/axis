/* =========================================
   Axis — Shared Script (Multi-Page)
   - يميّز الصفحة الحالية ويضوي زر النافبار المناسب.
   - تبديل ثيم فاتح/داكن.
   - الرئيسية: بحث Axis (chips + زر إرسال عند الكتابة + نتائج).
   - المفكرة: تخزين محلي + حذف/نسخ/تصدير.
   - تواصل: فورم تجريبي يعرض Toast فقط.
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

// ===== ثيم فاتح/داكن =====
const THEME_KEY = 'axis_theme';
const savedTheme = localStorage.getItem(THEME_KEY);
if(savedTheme === 'light'){ root.classList.add('light'); }
const toggleThemeBtn = $('#toggleTheme');
if(toggleThemeBtn){
  toggleThemeBtn.addEventListener('click', () => {
    root.classList.toggle('light');
    localStorage.setItem(THEME_KEY, root.classList.contains('light') ? 'light' : 'dark');
  });
}

// ===== تمييز الصفحة الحالية بالنافبار =====
(function markActiveNav(){
  const page = document.body.dataset.page; // "home" | "memory" | "about" | "contact"
  $$('.main-nav .nav-btn').forEach(a => {
    a.classList.toggle('is-active', a.dataset.match === page);
    if(a.dataset.match === page) a.setAttribute('aria-current', 'page');
  });
})();

// ===== الصفحة: الرئيسية (بحث Axis) =====
if(document.body.dataset.page === 'home'){
  const chipRow = $('#chipRow');
  const emotionInput = $('#emotionInput');
  const sendQuery = $('#sendQuery');
  const results = $('#results');

  const EMOTION_SUGGESTIONS = [
    'قلق خفيف','تفاؤل','إنهاك','حماس عالي','ضياع','امتنان','حزن','هدوء','توتر قبل الامتحان','فخر'
  ];

  function renderChips(){
    if(!chipRow) return;
    chipRow.innerHTML = '';
    const five = EMOTION_SUGGESTIONS.slice().sort(() => Math.random()-0.5).slice(0,5);
    for(const word of five){
      const chip = document.createElement('button');
      chip.type = 'button';
      chip.className = 'chip';
      chip.textContent = word;
      chip.addEventListener('click', () => {
        emotionInput.value = word;
        sendQuery.classList.add('show');
        emotionInput.focus();
      });
      chipRow.appendChild(chip);
    }
  }
  function handleSearch(){
    const q = (emotionInput?.value || '').trim();
    if(!q) return;
    const item = document.createElement('div');
    item.className = 'result-item';
    item.innerHTML = `
      <h4>نتائج لـ: ${q}</h4>
      <p>(مثال) روابط وتمارين ومذكرات مقترحة مرتبطة بـ <strong>${q}</strong>. سنربطه بقاعدة بياناتك لاحقًا.</p>
    `;
    results?.prepend(item);
    toast('تم — أضفنا نتيجة استكشاف');
    if(emotionInput) emotionInput.value = '';
    sendQuery?.classList.remove('show');
    renderChips();
  }

  if(emotionInput && sendQuery){
    renderChips();
    emotionInput.addEventListener('input', () => {
      const hasText = emotionInput.value.trim().length > 0;
      sendQuery.classList.toggle('show', hasText);
    });
    sendQuery.addEventListener('click', handleSearch);
    emotionInput.addEventListener('keydown', (e) => {
      if(e.key === 'Enter'){ e.preventDefault(); handleSearch(); }
    });
  }
}

// ===== الصفحة: المفكرة =====
if(document.body.dataset.page === 'memory'){
  const JOURNAL_KEY = 'axis_journal';
  const journalForm = $('#journalForm');
  const journalInput = $('#journalInput');
  const journalList = $('#journalList');
  const exportBtn = $('#exportJournal');
  const clearBtn = $('#clearJournal');

  const loadJournal = () => {
    try{ return JSON.parse(localStorage.getItem(JOURNAL_KEY) || '[]'); }
    catch{ return []; }
  };
  const saveJournal = (data) => localStorage.setItem(JOURNAL_KEY, JSON.stringify(data));
  const escapeHTML = (s) => s.replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));

  function renderJournal(){
    const data = loadJournal();
    if(!journalList) return;
    journalList.innerHTML = '';
    if(data.length === 0){
      const empty = document.createElement('li');
      empty.className = 'journal-item';
      empty.textContent = 'لا توجد مذكرات بعد.';
      journalList.appendChild(empty);
      return;
    }
    data.forEach((row, idx) => {
      const li = document.createElement('li');
      li.className = 'journal-item';
      li.innerHTML = `
        <div class="journal-meta">
          <span class="material-symbols-outlined" aria-hidden="true">calendar_month</span>
          <span>${new Date(row.ts).toLocaleString('ar-IQ')}</span>
        </div>
        <div class="journal-text">${escapeHTML(row.text)}</div>
        <div class="journal-actions">
          <button class="icon-btn" data-act="copy" data-idx="${idx}">
            <span class="material-symbols-outlined" aria-hidden="true">content_copy</span> نسخ
          </button>
          <button class="icon-btn danger" data-act="delete" data-idx="${idx}">
            <span class="material-symbols-outlined" aria-hidden="true">delete</span> حذف
          </button>
        </div>
      `;
      journalList.appendChild(li);
    });
  }

  journalForm?.addEventListener('submit', (e) => {
    e.preventDefault();
    const text = (journalInput?.value || '').trim();
    if(!text) return toast('اكتبي ملاحظة أولاً');
    const data = loadJournal();
    data.unshift({ text, ts: Date.now() });
    saveJournal(data);
    renderJournal();
    if(journalInput) journalInput.value = '';
    toast('انضافت للمفكرة ✨');
  });

  journalList?.addEventListener('click', async (e) => {
    const btn = e.target.closest('button[data-act]');
    if(!btn) return;
    const act = btn.dataset.act;
    const idx = +btn.dataset.idx;
    const data = loadJournal();
    if(act === 'delete'){
      data.splice(idx, 1);
      saveJournal(data);
      renderJournal();
      toast('انحذفت الملاحظة');
    }else if(act === 'copy'){
      await navigator.clipboard.writeText(data[idx].text);
      toast('اتنسخت 💾');
    }
  });

  exportBtn?.addEventListener('click', () => {
    const data = loadJournal();
    const blob = new Blob([JSON.stringify(data, null, 2)], {type: 'application/json'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'axis-journal.json';
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    toast('تصدير جاهز');
  });

  clearBtn?.addEventListener('click', () => {
    if(confirm('متأكدة من حذف كل المذكرات؟')) {
      localStorage.setItem(JOURNAL_KEY, '[]');
      renderJournal();
      toast('انحذفت كل المذكرات');
    }
  });

  renderJournal();
}

