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


