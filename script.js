// التنقّل بين الشاشات
const navButtons = document.querySelectorAll(".nav-btn");
const screens = document.querySelectorAll(".screen");
let currentScreen = document.querySelector(".screen.is-visible");

function switchScreen(targetId) {
  const target = document.getElementById(targetId);
  if (target === currentScreen) return;

  // خروج ودخول بحركة يمين/يسار
  currentScreen.classList.remove("is-visible");
  currentScreen.classList.add("slide-out");
  currentScreen.addEventListener("animationend", () => {
    currentScreen.classList.remove("slide-out");
    currentScreen.setAttribute("hidden","true");
  }, { once:true });

  target.removeAttribute("hidden");
  target.classList.add("slide-in");
  target.addEventListener("animationend", () => {
    target.classList.remove("slide-in");
    target.classList.add("is-visible");
    currentScreen = target;
  }, { once:true });
}

navButtons.forEach(btn=>{
  btn.addEventListener("click", ()=>{
    navButtons.forEach(b=>b.classList.remove("is-active"));
    btn.classList.add("is-active");
    switchScreen(btn.getAttribute("data-target"));
  });
});

// عناصر الرئيسية
const thinkInput = document.getElementById("thinkInput");
const confirmBtn = document.getElementById("confirmBtn");
const bubbleFeed = document.getElementById("bubbleFeed");
const suggests = document.querySelectorAll(".suggest");
const thinkWrap = document.getElementById("thinkWrap");

// إظهار زر التثبيت فقط عند وجود نص
function toggleConfirm(){
  confirmBtn.hidden = thinkInput.value.trim() === "";
}
thinkInput.addEventListener("input", toggleConfirm);

// الضغط على اقتراح → يكتب بالحقل ويظهر الزر
suggests.forEach(s=>{
  s.addEventListener("click", ()=>{
    thinkInput.value = s.textContent.trim();
    toggleConfirm();
    thinkInput.focus();
  });
});

// زر التثبيت → يضيف فقاعة رد فوق، مثل روبوت محادثة
confirmBtn.addEventListener("click", ()=>{
  const txt = thinkInput.value.trim();
  if (!txt) return;

  // إضافة فقاعة رد بما كتبه المستخدم (أو المختار)
  const row = document.createElement("div");
  row.className = "bubble-row";
  const b = document.createElement("div");
  b.className = "bubble";
  b.textContent = txt;
  row.appendChild(b);
  bubbleFeed.appendChild(row);

  // تنظيف الحقل وإخفاء الزر
  thinkInput.value = "";
  toggleConfirm();

  // سكرول هادئ للأسفل حتى تشوف الفقاعة
  row.scrollIntoView({ behavior: "smooth", block: "center" });
});

// جعل الحقل بالمنتصف افتراضيًا ثم يصعد مع الكيبورد
// يعمل على iOS/Android وحديث المتصفحات عبر visualViewport
(function handleKeyboardLift(){
  if (!window.visualViewport) return;
  const baseMargin = getComputedStyle(thinkWrap).marginTop;

  function update(){
    // لما يطلع الكيبورد تصغر الـviewport height
    const vh = window.visualViewport.height;
    // إذا صغر بشكل ملحوظ، ارفع الحقل
    if (vh < window.innerHeight * 0.8){
      thinkWrap.style.marginTop = "6vh";
    } else {
      thinkWrap.style.marginTop = baseMargin; // يرجع للوسط
    }
  }
  window.visualViewport.addEventListener("resize", update);
  window.visualViewport.addEventListener("scroll", update);
})();

// فوكس تلقائي عند النقر داخل منطقة الإدخال
thinkWrap.addEventListener("click", (e)=>{
  if (e.target !== thinkInput && e.target !== confirmBtn){
    thinkInput.focus();
  }
});

// افتراضياً: إخفاء زر التثبيت بالبداية
toggleConfirm();
