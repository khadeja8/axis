const intro = document.getElementById('intro');

// بعد انتهاء أنيميشن الاختفاء → احذف الانترو من الـ DOM
intro.addEventListener('animationend', e => {
  if(e.animationName === "introExit"){
    intro.remove();
  }
});
