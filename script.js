// الحصول على كل العناصر
const links = document.querySelectorAll('.navbar li');

// إضافة حدث عند الضغط
links.forEach(link => {
  link.addEventListener('click', () => {
    // إزالة active من الكل
    links.forEach(l => l.classList.remove('active'));
    // إضافة active للعنصر الحالي
    link.classList.add('active');
  });
});
