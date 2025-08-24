display:flex;
  align-items:center;
  padding: 0 34px;
  font-size: clamp(18px, 2.2vw, 28px);
  color: rgba(0,0,0,.62);
  letter-spacing:.6px;
  box-shadow: var(--shadow);
  position:relative;
}

/* تأثير ضغط عند التركيز كأنه إدخال */
.think-box:focus,
.think-box:focus-visible{
  outline:none;
  box-shadow: inset 0 0 0 3px rgba(0,0,0,.2), var(--shadow);
  color:#222;
}

/* =========================
   تجاوبية
   ========================= */
@media (max-width: 820px){
  .top-nav{gap:16px}
  .nav-btn{padding:12px 22px}
  .fab-toggle{width:70px; height:70px}
  .think-box{min-height:74px}
}

@media (max-width: 520px){
  .app{margin-top:20px}
  .top-nav{
    justify-content:space-between;
  }
  .nav-btn{
    flex:1 1 auto;
    text-align:center;
    padding:12px 16px;
  }
  .think-row{
    flex-direction: column;
    gap:14px;
  }
  .fab-toggle{order:2}
  .think-box{order:1; width:100%}
}

/* =========================
   الحركات (Animations)
   ========================= */

@keyframes slideIn {
  from { 
    opacity: 0;
    transform: translateX(100px); /* يدخل من اليمين */
  }
  to { 
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes slideOut {
  from { 
    opacity: 1;
    transform: translateX(0);
  }
  to { 
    opacity: 0;
    transform: translateX(-100px); /* يطلع لليسار */
  }
}

.slide-in {
  animation: slideIn 0.4s ease forwards;
}

.slide-out {
  animation: slideOut 0.4s ease forwards;
}
