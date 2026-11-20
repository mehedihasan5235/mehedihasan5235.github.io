const menu=document.querySelector(".toggle"),nav=document.querySelector("header nav");menu.addEventListener("click",()=>nav.classList.toggle("open"));document.querySelectorAll("nav a").forEach(a=>a.addEventListener("click",()=>nav.classList.remove("open")));document.getElementById("year").textContent=new Date().getFullYear();

// Smooth reveal for sections and cards
document.querySelectorAll("main .section, .cards article, .experience, .project, #contact .contact-intro, #contact .contact-panel").forEach((el)=>el.classList.add("reveal-on-scroll"));
if("IntersectionObserver" in window){
  const revealObserver=new IntersectionObserver((entries,observer)=>{
    entries.forEach((entry)=>{
      if(entry.isIntersecting){entry.target.classList.add("is-visible");observer.unobserve(entry.target);}
    });
  },{threshold:.12,rootMargin:"0px 0px -35px 0px"});
  document.querySelectorAll(".reveal-on-scroll").forEach((el)=>revealObserver.observe(el));
}else{
  document.querySelectorAll(".reveal-on-scroll").forEach((el)=>el.classList.add("is-visible"));
}

// Subtle typewriter role rotation in the hero
const roleHeading=document.querySelector(".hero .intro h3");
if(roleHeading){
  const roles=["Web Developer","WordPress Developer","Frontend Enthusiast","Digital Marketing Enthusiast"];
  roleHeading.innerHTML='<span id="role-text">Web Developer</span> <i>·</i> WordPress <i>·</i> Digital Marketing';
  const roleText=document.getElementById("role-text");
  let roleIndex=0,charIndex=roles[0].length,deleting=false;
  const reducedMotion=window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if(!reducedMotion){
    const typeNext=()=>{
      const current=roles[roleIndex];
      if(!deleting){
        charIndex++;
        roleText.textContent=current.slice(0,charIndex);
        if(charIndex>=current.length){deleting=true;setTimeout(typeNext,1500);return;}
      }else{
        charIndex--;
        roleText.textContent=current.slice(0,charIndex);
        if(charIndex<=0){deleting=false;roleIndex=(roleIndex+1)%roles.length;}
      }
      setTimeout(typeNext,deleting?42:78);
    };
    setTimeout(typeNext,1300);
  }
}
