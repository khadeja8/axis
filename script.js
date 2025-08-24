const navButtons = document.querySelectorAll(".nav-btn");
const screens = document.querySelectorAll(".screen");
let currentScreen = document.querySelector(".screen.is-visible");

function switchScreen(targetId) {
  const targetScreen = document.getElementById(targetId);
  if (targetScreen === currentScreen) return;

  // خروج الشاشة الحالية
  currentScreen.classList.remove("is-visible");
  currentScreen.classList.add("slide-out");
  currentScreen.addEventListener("animationend", () => {
    currentScreen.classList.remove("slide-out");
    currentScreen.style.display = "none";
  }, { once: true });

  // دخول الشاشة الجديدة
  targetScreen.style.display = "block";
  targetScreen.classList.add("slide-in");
  targetScreen.addEventListener("animationend", () => {
    targetScreen.classList.remove("slide-in");
    targetScreen.classList.add("is-visible");
    currentScreen = targetScreen;
  }, { once: true });
}

// ربط الأزرار
navButtons.forEach(btn => {
  btn.addEventListener("click", () => {
    navButtons.forEach(b => b.classList.remove("is-active"));
    btn.classList.add("is-active");
    switchScreen(btn.getAttribute("data-target"));
  });
});
