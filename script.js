const navButtons = document.querySelectorAll(".nav-btn");
const screens = document.querySelectorAll(".screen");
let currentScreen = document.querySelector(".screen.is-visible");

const thinkInput = document.getElementById("thinkInput");
const sendBtn = document.getElementById("sendBtn");
const suggests = document.querySelectorAll(".suggest");

// التبديل بين الشاشات
function switchScreen(targetId) {
  const targetScreen = document.getElementById(targetId);
  if (targetScreen === currentScreen) return;

  currentScreen.classList.remove("is-visible");
  targetScreen.classList.add("is-visible");
  currentScreen = targetScreen;
}

navButtons.forEach(btn => {
  btn.addEventListener("click", () => {
    navButtons.forEach(b => b.classList.remove("is-active"));
    btn.classList.add("is-active");
    switchScreen(btn.getAttribute("data-target"));
  });
});

// إظهار زر الإرسال إذا كتب المستخدم
thinkInput.addEventListener("input", () => {
  if (thinkInput.value.trim() !== "") {
    sendBtn.hidden = false;
  } else {
    sendBtn.hidden = true;
  }
});

// إذا ضغط على اقتراح → يكتب بالحقل ويظهر زر الإرسال
suggests.forEach(s => {
  s.addEventListener("click", () => {
    thinkInput.value = s.textContent;
    sendBtn.hidden = false;
    thinkInput.focus();
  });
});

// لما يضغط زر الإرسال
sendBtn.addEventListener("click", () => {
  alert("تم إرسال: " + thinkInput.value);
  thinkInput.value = "";
  sendBtn.hidden = true;
});
