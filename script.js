// Portfolio interactions
const menu = document.querySelector(".toggle");
const nav = document.querySelector("header nav");

if (menu && nav) {
  menu.addEventListener("click", () => nav.classList.toggle("open"));
  document.querySelectorAll("nav a").forEach((link) => {
    link.addEventListener("click", () => nav.classList.remove("open"));
  });
}

const year = document.getElementById("year");
if (year) year.textContent = new Date().getFullYear();

// Scroll-triggered reveals. Content remains visible if motion is reduced
// or if the GSAP CDN is unavailable.
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// Repeating typewriter for the full name: MD → Mehedi → Hasan.
const nameParts = [
  document.getElementById("name-md"),
  document.getElementById("name-mehedi"),
  document.getElementById("name-hasan")
];

if (nameParts.every(Boolean)) {
  const fullName = ["MD", "Mehedi", "Hasan."];
  if (prefersReducedMotion) {
    nameParts.forEach((part, index) => { part.textContent = fullName[index]; });
  } else {
    const typeSpeed = 115;
    const eraseSpeed = 55;
    let partIndex = 0;
    let charIndex = 0;
    let erasing = false;

    nameParts.forEach((part) => { part.textContent = ""; });
    nameParts[0].classList.add("typing-cursor");

    const animateName = () => {
      const part = nameParts[partIndex];
      const word = fullName[partIndex];

      if (!erasing) {
        if (charIndex < word.length) {
          part.textContent += word.charAt(charIndex++);
          window.setTimeout(animateName, typeSpeed);
          return;
        }

        part.classList.remove("typing-cursor");
        partIndex++;
        charIndex = 0;

        if (partIndex < nameParts.length) {
          nameParts[partIndex].classList.add("typing-cursor");
          window.setTimeout(animateName, 140);
        } else {
          window.setTimeout(() => {
            erasing = true;
            partIndex = nameParts.length - 1;
            charIndex = fullName[partIndex].length;
            nameParts[partIndex].classList.add("typing-cursor");
            animateName();
          }, 2000);
        }
        return;
      }

      if (charIndex > 0) {
        part.textContent = word.slice(0, --charIndex);
        window.setTimeout(animateName, eraseSpeed);
        return;
      }

      part.classList.remove("typing-cursor");
      partIndex--;
      if (partIndex >= 0) {
        charIndex = fullName[partIndex].length;
        nameParts[partIndex].classList.add("typing-cursor");
        window.setTimeout(animateName, 70);
      } else {
        erasing = false;
        partIndex = 0;
        charIndex = 0;
        nameParts[0].classList.add("typing-cursor");
        window.setTimeout(animateName, 350);
      }
    };

    window.setTimeout(animateName, 450);
  }
}


const revealTargets = [
  "#about > label",
  "#about .split > *",
  "#skills .section-title > *",
  "#skills .cards article",
  "#skills .note",
  "#experience > label",
  "#experience .experience > *",
  "#projects .section-title > *",
  "#projects .project > *",
  "#contact .contact-intro > *",
  "#contact .contact-panel > *"
].flatMap((selector) => Array.from(document.querySelectorAll(selector)));

if (!prefersReducedMotion && revealTargets.length) {
  if (window.gsap && window.ScrollTrigger) {
    gsap.registerPlugin(ScrollTrigger);

    // Only hide elements after GSAP is confirmed available, so a CDN failure
    // can never leave portfolio content invisible.
    revealTargets.forEach((element) => element.classList.add("reveal-on-scroll"));
    gsap.set(revealTargets, { autoAlpha: 0, y: 22 });

    ScrollTrigger.batch(revealTargets, {
      start: "top 88%",
      end: "bottom 12%",
      once: false,
      onEnter: (elements) => {
        gsap.to(elements, {
          autoAlpha: 1,
          y: 0,
          duration: 0.68,
          stagger: 0.11,
          ease: "power2.out",
          overwrite: true
        });
      },
      onEnterBack: (elements) => {
        gsap.to(elements, {
          autoAlpha: 1,
          y: 0,
          duration: 0.58,
          stagger: 0.09,
          ease: "power2.out",
          overwrite: true
        });
      },
      onLeaveBack: (elements) => {
        gsap.to(elements, {
          autoAlpha: 0,
          y: 18,
          duration: 0.32,
          stagger: 0.05,
          ease: "power1.in",
          overwrite: true
        });
      }
    });

    window.addEventListener("load", () => ScrollTrigger.refresh(), { once: true });
  } else if ("IntersectionObserver" in window) {
    // Accessible fallback: reveal on entry and reset on exit for replay.
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        entry.target.classList.toggle("is-visible", entry.isIntersecting);
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -35px 0px" });

    revealTargets.forEach((element) => {
      element.classList.add("reveal-on-scroll");
      observer.observe(element);
    });
  }
}


// Mobile-only Skills carousel using native horizontal scrolling.
const skillsViewport = document.querySelector("#skills .cards");
if (skillsViewport) {
  const mobileSkills = window.matchMedia("(max-width: 760px)");
  const originalCards = Array.from(skillsViewport.querySelectorAll(":scope > article"));

  if (!mobileSkills.matches || originalCards.length < 2) {
    skillsViewport.classList.add("skills-static-track");
  } else {
    const track = document.createElement("div");
    track.className = "skills-marquee-track";
    originalCards.forEach((card) => track.appendChild(card));
    originalCards.forEach((card) => {
      const clone = card.cloneNode(true);
      clone.setAttribute("aria-hidden", "true");
      track.appendChild(clone);
    });
    skillsViewport.appendChild(track);

    const progress = document.createElement("div");
    progress.className = "skills-marquee-progress";
    progress.setAttribute("aria-hidden", "true");
    progress.innerHTML = '<span></span>';
    skillsViewport.insertAdjacentElement("afterend", progress);
    const progressFill = progress.querySelector("span");

    let cycleWidth = 0;
    let lastTime = 0;
    let isPaused = false;
    const speed = 28;

    const updateProgress = () => {
      const progressValue = cycleWidth > 0 ? Math.min(skillsViewport.scrollLeft / cycleWidth, 1) : 0;
      progressFill.style.transform = "scaleX(" + progressValue + ")";
    };
    const measure = () => {
      const firstClone = track.children[originalCards.length];
      if (firstClone) {
        cycleWidth = firstClone.offsetLeft - track.children[0].offsetLeft;
        updateProgress();
      }
    };
    const animate = (time) => {
      if (!lastTime) lastTime = time;
      const delta = Math.min((time - lastTime) / 1000, 0.05);
      lastTime = time;

      if (!isPaused && !document.hidden && cycleWidth > 0) {
        skillsViewport.scrollLeft += speed * delta;
        if (skillsViewport.scrollLeft >= cycleWidth) {
          skillsViewport.scrollLeft -= cycleWidth;
        }
        updateProgress();
      }
      window.requestAnimationFrame(animate);
    };

    skillsViewport.addEventListener("scroll", updateProgress, { passive: true });
    skillsViewport.addEventListener("touchstart", () => { isPaused = true; }, { passive: true });
    skillsViewport.addEventListener("touchend", () => { isPaused = false; }, { passive: true });
    skillsViewport.addEventListener("touchcancel", () => { isPaused = false; }, { passive: true });
    skillsViewport.addEventListener("pointerdown", () => { isPaused = true; });
    window.addEventListener("pointerup", () => { isPaused = false; });
    window.addEventListener("pointercancel", () => { isPaused = false; });
    skillsViewport.addEventListener("mouseenter", () => { isPaused = true; });
    skillsViewport.addEventListener("mouseleave", () => { isPaused = false; });
    document.addEventListener("visibilitychange", () => { lastTime = 0; });

    measure();
    if ("ResizeObserver" in window) new ResizeObserver(measure).observe(skillsViewport);
    else window.addEventListener("resize", measure);
    window.requestAnimationFrame(animate);
  }
}

// Subtle typewriter role rotation in the hero.
const roleHeading = document.querySelector(".hero .intro h3");
if (roleHeading) {
  const roles = [
    "Web Developer",
    "WordPress Developer",
    "Frontend Enthusiast",
    "Digital Marketing Enthusiast"
  ];

  roleHeading.innerHTML = '<span id="role-text">Web Developer</span> <i>·</i> WordPress <i>·</i> Digital Marketing';
  const roleText = document.getElementById("role-text");

  if (!prefersReducedMotion && roleText) {
    let roleIndex = 0;
    let charIndex = roles[0].length;
    let deleting = false;

    const typeNext = () => {
      const current = roles[roleIndex];

      if (!deleting) {
        charIndex++;
        roleText.textContent = current.slice(0, charIndex);
        if (charIndex >= current.length) {
          deleting = true;
          window.setTimeout(typeNext, 1500);
          return;
        }
      } else {
        charIndex--;
        roleText.textContent = current.slice(0, charIndex);
        if (charIndex <= 0) {
          deleting = false;
          roleIndex = (roleIndex + 1) % roles.length;
        }
      }

      window.setTimeout(typeNext, deleting ? 42 : 78);
    };

    window.setTimeout(typeNext, 2800);
  }
}
