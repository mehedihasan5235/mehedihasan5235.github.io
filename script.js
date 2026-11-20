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

// Type the hero name once on page load.
const nameFirst = document.getElementById("name-first");
const nameLast = document.getElementById("name-last");

if (!prefersReducedMotion && nameFirst && nameLast) {
  const firstName = nameFirst.textContent;
  const lastName = nameLast.textContent;
  nameFirst.textContent = "";
  nameLast.textContent = "";
  nameFirst.classList.add("typing-cursor");

  let firstIndex = 0;
  let lastIndex = 0;

  const typeName = () => {
    if (firstIndex < firstName.length) {
      nameFirst.textContent += firstName.charAt(firstIndex++);
      window.setTimeout(typeName, 105);
      return;
    }

    if (nameFirst.classList.contains("typing-cursor")) {
      nameFirst.classList.remove("typing-cursor");
      nameLast.classList.add("typing-cursor");
      window.setTimeout(typeName, 230);
      return;
    }

    if (lastIndex < lastName.length) {
      nameLast.textContent += lastName.charAt(lastIndex++);
      window.setTimeout(typeName, 115);
      return;
    }

    nameLast.classList.remove("typing-cursor");
  };

  window.setTimeout(typeName, 420);
}


// Scroll-triggered reveals. Content remains visible if motion is reduced
// or if the GSAP CDN is unavailable.
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

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
