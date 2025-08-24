document.addEventListener("DOMContentLoaded", () => {
  const input = document.getElementById("thought-input");
  const sendBtn = document.getElementById("send-btn");
  const suggestions = document.querySelectorAll(".suggest-chip");

  // 🟢 وظيفة: تحديث حالة زر الإرسال
  function updateSendBtn() {
    if (input.value.trim().length > 0) {
      sendBtn.hidden = false;
      sendBtn.setAttribute("aria-hidden", "false");
    } else {
      sendBtn.hidden = true;
      sendBtn.setAttribute("aria-hidden", "true");
    }
  }

  // عند الكتابة داخل الحقل
  input.addEventListener("input", updateSendBtn);

  // عند اختيار اقتراح
  suggestions.forEach(chip => {
    chip.addEventListener("click", () => {
      input.value = chip.dataset.value;
      updateSendBtn();
      input.focus();
    });
  });

  // عند الضغط على زر الإرسال
  sendBtn.addEventListener("click", () => {
    const value = input.value.trim();
    if (!value) return;

    // مثال: عرض النتيجة داخل قسم النتائج
    const results = document.querySelector(".results");
    results.hidden = false;

    // إنشاء بطاقة جديدة (تجريبية – لاحقاً تربطيها بالبيانات الحقيقية)
    const card = document.createElement("article");
    card.className = "result-card";
    card.innerHTML = `
      <h2 class="result-title">${value}</h2>
      <blockquote class="result-quote">هنا اقتباس فلسفي/مقولة مناسبة لـ "${value}".</blockquote>
      <p class="result-explainer">شرح موجز أو تفسير للفكرة المرتبطة بـ ${value}.</p>
      <div class="result-question">
        <h3>سؤال للتفكير</h3>
        <p>ما الذي تعلّمته من هذا الشعور اليوم؟</p>
        <button type="button" class="save-to-notebook">حفظ في المفكرة</button>
      </div>
    `;
    results.prepend(card);

    // تفريغ الحقل وإخفاء الزر
    input.value = "";
    updateSendBtn();
  });

  // 🟢 نظام التنقل (بين الأقسام)
  const navLinks = document.querySelectorAll(".nav-link");
  const sections = document.querySelectorAll("main, section[id]");

  function showSection(targetId) {
    sections.forEach(sec => {
      sec.hidden = sec.id !== targetId && sec.tagName.toLowerCase() !== "main";
      if (sec.tagName.toLowerCase() === "main" && targetId === "home") {
        sec.hidden = false;
      }
    });

    // تحديث حالة الرابط النشط
    navLinks.forEach(link => {
      if (link.getAttribute("href") === `#${targetId}`) {
        link.classList.add("is-active");
      } else {
        link.classList.remove("is-active");
      }
    });

    // التركيز على القسم الجديد (تحسين الوصول)
    const target = document.getElementById(targetId);
    if (target) target.focus();
  }

  navLinks.forEach(link => {
    link.addEventListener("click", e => {
      e.preventDefault();
      const targetId = link.getAttribute("href").slice(1);
      showSection(targetId);
    });
  });

  // افتراضياً: عرض الرئيسية
  showSection("home");
});
