// script.js

const navButtons = document.querySelectorAll(".nav-btn");
const screens = document.querySelectorAll(".screen");

// نخزن الواجهة الحالية
let currentScreen = document.querySelector(".screen.is-visible");

function switchScreen(targetId) {
  const targetScreen = document.getElementById(targetId);

  if (targetScreen === currentScreen) return; // إذا نفس الواجهة، لا تسوي شي

  // نخفي الواجهة الحالية مع حركة للخروج
  currentScreen.classList.remove("is-visible");
  currentScreen.classList.add("slide-out");

  // بعد ما تخلص حركة الخروج، نخفيها نهائي
  currentScreen.addEventListener("animationend", () => {
    currentScreen.setAttribute("hidden", "true");
    currentScreen.classList.remove("slide-out");
  }, { once: true });

  // نعرض الواجهة الجديدة مع حركة للدخول
  targetScreen.removeAttribute("hidden");
  targetScreen.classList.add("slide-in");

  targetScreen.addEventListener("animationend", () => {
    targetScreen.classList.remove("slide-in");
    targetScreen.classList.add("is-visible");
    currentScreen = targetScreen; // تحديث الشاشة الحالية
  }, { once: true });
}

// إضافة Event Listener لكل زر
navButtons.forEach(btn => {
  btn.addEventListener("click", () => {
    navButtons.forEach(b => b.classList.remove("is-active"));
    btn.classList.add("is-active");

    const target = btn.getAttribute("data-target");
    switchScreen(target);
  });
});

// افتراضياً نعرض الرئيسية
switchScreen("home");
