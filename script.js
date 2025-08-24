// ------------------------------
// تبديل الصفحات
// ------------------------------
const navLinks = document.querySelectorAll('.navbar li a');
const screens = document.querySelectorAll('.screen');

navLinks.forEach(link => {
  link.addEventListener('click', (e) => {
    e.preventDefault();

    // إزالة active من الكل
    navLinks.forEach(l => l.parentElement.classList.remove('active'));
    // إضافة active للرابط الحالي
    link.parentElement.classList.add('active');

    // جلب الـ id (home, notebook, about, contact)
    const target = link.getAttribute('id');

    // إخفاء كل الشاشات
    screens.forEach(screen => {
      screen.style.display = 'none';
    });

    // إظهار الشاشة المطلوبة
    const targetScreen = document.querySelector(`[data-screen="${target}"]`);
    if (targetScreen) {
      targetScreen.style.display = 'block';
    }
  });
});

// ------------------------------
// تأثير على صورة محمود درويش
// ------------------------------
const mahmoodImg = document.querySelector('.mahmood-photo');

if (mahmoodImg) {
  mahmoodImg.addEventListener('click', () => {
    // تكبير بسيط عند الضغط
    mahmoodImg.style.transform = 'scale(1.1)';
    mahmoodImg.style.transition = 'transform 0.3s ease';

    // ترجع للوضع الطبيعي بعد 300ms
    setTimeout(() => {
      mahmoodImg.style.transform = 'scale(1)';
    }, 300);
  });
}
