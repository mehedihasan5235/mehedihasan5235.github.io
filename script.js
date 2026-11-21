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


// Bilingual portfolio content and hero role rotation.
const languageButton = document.getElementById("language-toggle");
const roleHeading = document.querySelector(".hero .intro h3");
const roleSets = {
  en: ["Frontend Web Developer", "JavaScript Developer", "Web Application Developer", "Web Developer"],
  bn: ["ফ্রন্টএন্ড ওয়েব ডেভেলপার", "জাভাস্ক্রিপ্ট ডেভেলপার", "ওয়েব অ্যাপ্লিকেশন ডেভেলপার", "ওয়েব ডেভেলপার"]
};
const translations = {
  "Home":"হোম","About":"আমার সম্পর্কে","Skills":"দক্ষতা","Experience":"অভিজ্ঞতা","Projects":"প্রজেক্ট","Contact":"যোগাযোগ",
  "Let's Talk ↗":"আলাপ করি ↗","WEB & DIGITAL PROFESSIONAL":"ওয়েব ও ডিজিটাল প্রফেশনাল",
  "●   OPEN TO OPPORTUNITIES":"●   কাজের সুযোগের জন্য উন্মুক্ত","Hello, I'm":"হ্যালো, আমি",
  "Web Developer":"ওয়েব ডেভেলপার","Programming":"প্রোগ্রামিং","Web Applications":"ওয়েব অ্যাপ্লিকেশন",
  "Explore My Work ↗":"আমার কাজ দেখুন ↗","Get in Touch":"যোগাযোগ করুন",
  "Years of Experience":"বছরের অভিজ্ঞতা","Development Focus":"ডেভেলপমেন্টে মনোযোগ","Curiosity to Learn":"শেখার আগ্রহ",
  "Creative mindset":"সৃজনশীল মানসিকতা","Always learning, always building":"সবসময় শিখছি, নতুন কিছু তৈরি করছি",
  "01 / ABOUT ME":"০১ / আমার সম্পর্কে","Building for the web.":"ওয়েবের জন্য তৈরি করি।",
  "Focused on clean code.":"পরিচ্ছন্ন কোডে মনোযোগী।",
  "I’m MD Mehedi Hasan, a web developer focused on creating responsive, accessible and user-friendly websites and web applications. I enjoy solving problems through code, translating requirements into clear interfaces and building features that work smoothly across devices.":"আমি MD Mehedi Hasan। আমি রেসপনসিভ, সহজে ব্যবহারযোগ্য এবং সবার জন্য উপযোগী ওয়েবসাইট ও ওয়েব অ্যাপ্লিকেশন তৈরিতে মনোযোগী একজন ওয়েব ডেভেলপার। কোডের মাধ্যমে সমস্যা সমাধান, প্রয়োজন অনুযায়ী পরিষ্কার ইন্টারফেস তৈরি এবং বিভিন্ন ডিভাইসে সঠিকভাবে কাজ করে এমন ফিচার তৈরি করতে ভালোবাসি।",
  "My primary focus is programming-led web development: building interfaces with HTML, CSS and JavaScript, working with modern frontend tools, and exploring application logic and backend technologies. I also use WordPress to develop and manage content-driven websites when it is the right fit for a project.":"আমার প্রধান কাজ প্রোগ্রামিংভিত্তিক ওয়েব ডেভেলপমেন্ট—HTML, CSS ও JavaScript দিয়ে ইন্টারফেস তৈরি, আধুনিক ফ্রন্টএন্ড টুল ব্যবহার এবং অ্যাপ্লিকেশন লজিক ও ব্যাকএন্ড প্রযুক্তি নিয়ে কাজ করা। প্রজেক্টের প্রয়োজন অনুযায়ী WordPress দিয়েও কনটেন্টভিত্তিক ওয়েবসাইট তৈরি ও পরিচালনা করি।",
  "I approach each project with attention to structure, usability, performance and maintainable code. I value clear communication, thoughtful implementation and continuous improvement, and I’m always working to strengthen my skills through hands-on projects and learning.":"প্রতিটি প্রজেক্টে সঠিক কাঠামো, ব্যবহারযোগ্যতা, পারফরম্যান্স এবং সহজে রক্ষণাবেক্ষণযোগ্য কোডকে গুরুত্ব দিই। পরিষ্কার যোগাযোগ, পরিকল্পিত বাস্তবায়ন ও ধারাবাহিক উন্নতিতে বিশ্বাস করি। বাস্তব প্রজেক্ট ও শেখার মাধ্যমে নিয়মিত নিজের দক্ষতা বাড়ানোর চেষ্টা করি।",
  "02 / MY TOOLKIT":"০২ / আমার দক্ষতা","Skills &":"দক্ষতা ও","Technologies":"প্রযুক্তি",
  "Technologies and tools I use to develop responsive websites and web applications.":"রেসপনসিভ ওয়েবসাইট ও ওয়েব অ্যাপ্লিকেশন তৈরিতে ব্যবহৃত প্রযুক্তি ও টুলস।",
  "Core Web Development":"মূল ওয়েব ডেভেলপমেন্ট","Building responsive, accessible interfaces with strong web fundamentals.":"ওয়েবের মৌলিক বিষয় কাজে লাগিয়ে রেসপনসিভ ও সহজে ব্যবহারযোগ্য ইন্টারফেস তৈরি।",
  "Frontend Development":"ফ্রন্টএন্ড ডেভেলপমেন্ট","Creating interactive user interfaces with modern JavaScript frameworks and styling tools.":"আধুনিক JavaScript ফ্রেমওয়ার্ক ও স্টাইলিং টুল দিয়ে ইন্টারঅ্যাকটিভ ইউজার ইন্টারফেস তৈরি।",
  "Backend & Development Tools":"ব্যাকএন্ড ও ডেভেলপমেন্ট টুলস","Working with server-side technologies, frameworks and version control.":"সার্ভার-সাইড প্রযুক্তি, ফ্রেমওয়ার্ক ও ভার্সন কন্ট্রোল নিয়ে কাজ।",
  "WordPress & CMS":"WordPress ও CMS","Building and managing content-driven websites with flexible CMS tools.":"বিভিন্ন CMS টুল ব্যবহার করে কনটেন্টভিত্তিক ওয়েবসাইট তৈরি ও পরিচালনা।",
  "Theme Customization":"থিম কাস্টমাইজেশন","Website Management":"ওয়েবসাইট পরিচালনা","SEO Basics":"SEO-এর প্রাথমিক বিষয়",
  "I continuously expand my toolkit through practical development, experimentation and ongoing learning.":"বাস্তব ডেভেলপমেন্ট, পরীক্ষা-নিরীক্ষা ও নিয়মিত শেখার মাধ্যমে নিজের দক্ষতা ও টুলসের পরিধি বাড়াচ্ছি।",
  "03 / EXPERIENCE":"০৩ / অভিজ্ঞতা","Continuous hands-on development":"নিয়মিত হাতে-কলমে কাজ ও দক্ষতা উন্নয়ন",
  "Strengthening my web development skills through practical projects, experimentation and consistent learning.":"বাস্তব প্রজেক্ট, পরীক্ষা-নিরীক্ষা ও নিয়মিত শেখার মাধ্যমে ওয়েব ডেভেলপমেন্টের দক্ষতা বাড়াচ্ছি।",
  "GROWTH":"উন্নতি","IN PROGRESS":"চলমান",
  "04 / SELECTED WORK":"০৪ / নির্বাচিত কাজ","Projects &":"প্রজেক্ট ও","Experiments":"পরীক্ষামূলক কাজ",
  "A space for selected projects, ideas and things I build along the way.":"আমার নির্বাচিত প্রজেক্ট, আইডিয়া এবং তৈরি করা কাজের সংগ্রহ।",
  "More work coming soon":"আরও কাজ শিগগিরই যুক্ত হবে","Project details and live links will be added here as the portfolio is updated.":"পোর্টফোলিও আপডেটের সঙ্গে প্রজেক্টের বিস্তারিত ও লাইভ লিংক এখানে যুক্ত করা হবে।",
  "CONTACT ME":"যোগাযোগ করুন","05 / LET’S TALK":"০৫ / কথা বলি",
  "Have an idea?":"কোনো আইডিয়া আছে?","Let’s make it happen.":"চলুন বাস্তবায়ন করি।",
  "Whether you’re planning a website, looking for digital support, or simply want to connect, I’d be happy to hear from you. Tell me a little about what you have in mind.":"আপনি কি ওয়েবসাইট তৈরি করতে চান, ডিজিটাল সহায়তা খুঁজছেন, নাকি যোগাযোগ করতে চান? আপনার পরিকল্পনা সম্পর্কে আমাকে জানান—আপনার কথা শুনতে ভালো লাগবে।",
  "QUICK RESPONSE":"দ্রুত উত্তর","Start a WhatsApp Conversation":"WhatsApp-এ কথা বলুন",
  "Open to new connections and opportunities":"নতুন যোগাযোগ ও কাজের সুযোগের জন্য উন্মুক্ত",
  "DIRECT CONTACT":"সরাসরি যোগাযোগ","Let’s connect":"যোগাযোগ করি","EMAIL ME":"ইমেইল করুন",
  "PHONE & WHATSAPP":"ফোন ও WhatsApp","ALTERNATE PHONE":"বিকল্প ফোন","FOLLOW MY WORK":"আমার কাজ অনুসরণ করুন",
  "Designed with purpose. Built with curiosity.":"উদ্দেশ্য নিয়ে ডিজাইন, জানার আগ্রহে নির্মাণ।",
  "PERSONAL PORTFOLIO":"ব্যক্তিগত পোর্টফোলিও"
};
const originalDescription = "MD Mehedi Hasan — Web Developer focused on programming, frontend development and building responsive web applications.";
const bengaliDescription = "MD Mehedi Hasan — ওয়েব ডেভেলপার ও ডিজিটাল মার্কেটিং প্রফেশনাল। ওয়েবসাইট তৈরি, ডিজিটাল মার্কেটিং ও SEO-তে কাজ করি।";
let portfolioLanguage = "en";
let activeRoles = roleSets.en;
let roleIndex = 0;
let charIndex = activeRoles[0].length;
let deletingRole = false;
let roleTimerStarted = false;

function setPortfolioLanguage(language) {
  portfolioLanguage = language;
  const toBengali = language === "bn";
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  let node;
  while ((node = walker.nextNode())) {
    const current = node.nodeValue;
    const trimmed = current.trim();
    if (!trimmed) continue;
    let translated = trimmed;
    if (toBengali && Object.prototype.hasOwnProperty.call(translations, trimmed)) {
      translated = translations[trimmed];
    } else if (!toBengali) {
      const english = Object.keys(translations).find((key) => translations[key] === trimmed);
      if (english) translated = english;
    }
    if (translated !== trimmed) node.nodeValue = current.replace(trimmed, translated);
  }

  document.documentElement.lang = toBengali ? "bn" : "en";
  document.title = toBengali ? "MD Mehedi Hasan | পোর্টফোলিও" : "MD Mehedi Hasan | Portfolio";
  const description = document.querySelector('meta[name="description"]');
  if (description) description.content = toBengali ? bengaliDescription : originalDescription;

  document.querySelectorAll("[aria-label]").forEach((element) => {
    const labels = {
      "Toggle menu": "মেনু খুলুন",
      "Switch language to Bengali": "ভাষা ইংরেজিতে পরিবর্তন করুন",
      "Switch language to English": "ভাষা বাংলায় পরিবর্তন করুন"
    };
    const current = element.getAttribute("aria-label");
    if (toBengali && labels[current]) element.setAttribute("aria-label", labels[current]);
    else if (!toBengali) {
      const english = Object.keys(labels).find((key) => labels[key] === current);
      if (english) element.setAttribute("aria-label", english);
    }
  });

  const languageButtonText = toBengali ? "English" : "বাংলা";
  if (languageButton) {
    languageButton.textContent = languageButtonText;
    languageButton.setAttribute("aria-label", toBengali ? "Switch language to English" : "Switch language to Bengali");
  }

  activeRoles = toBengali ? roleSets.bn : roleSets.en;
  roleIndex = 0;
  charIndex = activeRoles[0].length;
  deletingRole = false;
  if (roleHeading) {
    roleHeading.innerHTML = '<span id="role-text"></span> <i>·</i> <span id="role-suffix"></span>';
    const roleText = document.getElementById("role-text");
    const suffix = document.getElementById("role-suffix");
    if (roleText) roleText.textContent = activeRoles[0];
    if (suffix) suffix.textContent = toBengali ? "প্রোগ্রামিং ও ওয়েব অ্যাপ্লিকেশন" : "Programming & Web Applications";
  }
}

if (languageButton) {
  languageButton.addEventListener("click", () => {
    setPortfolioLanguage(portfolioLanguage === "en" ? "bn" : "en");
  });
}
setPortfolioLanguage("en");

if (roleHeading && !prefersReducedMotion) {
  roleTimerStarted = true;
  const animateRole = () => {
    const roleText = document.getElementById("role-text");
    if (!roleText) {
      window.setTimeout(animateRole, 300);
      return;
    }
    const currentRole = activeRoles[roleIndex];
    if (!deletingRole) {
      charIndex = Math.min(charIndex + 1, currentRole.length);
      roleText.textContent = currentRole.slice(0, charIndex);
      if (charIndex >= currentRole.length) {
        deletingRole = true;
        window.setTimeout(animateRole, 1500);
        return;
      }
    } else {
      charIndex = Math.max(charIndex - 1, 0);
      roleText.textContent = currentRole.slice(0, charIndex);
      if (charIndex === 0) {
        deletingRole = false;
        roleIndex = (roleIndex + 1) % activeRoles.length;
      }
    }
    window.setTimeout(animateRole, deletingRole ? 42 : 78);
  };
  window.setTimeout(animateRole, 2800);
}
