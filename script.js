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


// Responsive Skills marquee: continuous right-to-left loop on desktop and mobile.
const skillsViewport = document.querySelector("#skills .cards");
if (skillsViewport) {
  const originalCards = Array.from(skillsViewport.querySelectorAll(":scope > article"));

  if (originalCards.length < 2) {
    skillsViewport.classList.add("skills-static-track");
  } else {
    const track = document.createElement("div");
    track.className = "skills-marquee-track";

    // Keep the original five cards intact, then add one matching set for a seamless loop.
    originalCards.forEach((card) => track.appendChild(card));
    originalCards.forEach((card) => {
      const clone = card.cloneNode(true);
      clone.setAttribute("aria-hidden", "true");
      clone.querySelectorAll("[id]").forEach((node) => node.removeAttribute("id"));
      track.appendChild(clone);
    });
    skillsViewport.appendChild(track);

    const progress = document.createElement("div");
    progress.className = "skills-marquee-progress";
    progress.setAttribute("aria-hidden", "true");
    progress.innerHTML = "<span></span>";
    skillsViewport.insertAdjacentElement("afterend", progress);
    const progressFill = progress.querySelector("span");

    let cycleWidth = 0;
    let lastTime = 0;
    let isInteracting = false;
    const speed = 34; // pixels per second; same direction and behavior on every screen size.

    const updateProgress = () => {
      if (!progressFill || !cycleWidth) return;
      const value = Math.min(skillsViewport.scrollLeft / cycleWidth, 1);
      progressFill.style.transform = "scaleX(" + value + ")";
    };

    const measure = () => {
      const firstCard = track.children[0];
      const firstClone = track.children[originalCards.length];
      if (!firstCard || !firstClone) return;

      const distance = firstClone.getBoundingClientRect().left -
        firstCard.getBoundingClientRect().left;
      cycleWidth = distance > 0 ? distance : track.scrollWidth / 2;

      // Keep the scroll position inside the first cycle after responsive re-measurement.
      if (cycleWidth > 0 && skillsViewport.scrollLeft >= cycleWidth) {
        skillsViewport.scrollLeft %= cycleWidth;
      }
      updateProgress();
    };

    const animate = (time) => {
      if (!lastTime) lastTime = time;
      const delta = Math.min((time - lastTime) / 1000, 0.05);
      lastTime = time;

      // Hover never pauses the marquee. Only a deliberate touch/pen gesture temporarily
      // yields control so the visitor can swipe naturally; autoplay resumes on release.
      if (!prefersReducedMotion && !isInteracting && !document.hidden && cycleWidth > 0) {
        skillsViewport.scrollLeft += speed * delta;
        if (skillsViewport.scrollLeft >= cycleWidth) {
          skillsViewport.scrollLeft -= cycleWidth;
        }
        updateProgress();
      }
      window.requestAnimationFrame(animate);
    };

    skillsViewport.addEventListener("scroll", updateProgress, { passive: true });
    skillsViewport.addEventListener("pointerdown", (event) => {
      if (event.pointerType === "touch" || event.pointerType === "pen") {
        isInteracting = true;
      }
    }, { passive: true });
    window.addEventListener("pointerup", () => { isInteracting = false; });
    window.addEventListener("pointercancel", () => { isInteracting = false; });
    // Fallback for browsers that dispatch touch events without Pointer Events.
    skillsViewport.addEventListener("touchstart", () => { isInteracting = true; }, { passive: true });
    skillsViewport.addEventListener("touchend", () => { isInteracting = false; }, { passive: true });
    skillsViewport.addEventListener("touchcancel", () => { isInteracting = false; }, { passive: true });
    document.addEventListener("visibilitychange", () => { lastTime = 0; });

    measure();
    if ("ResizeObserver" in window) {
      const skillsResizeObserver = new ResizeObserver(measure);
      skillsResizeObserver.observe(skillsViewport);
      skillsResizeObserver.observe(track);
    } else {
      window.addEventListener("resize", measure);
    }
    window.addEventListener("load", measure, { once: true });
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(measure);
    window.requestAnimationFrame(() => {
      measure();
      window.requestAnimationFrame(animate);
    });
  }
}


// Bilingual portfolio content and hero role rotation.
const languageButton = document.getElementById("language-toggle");
const roleHeading = document.querySelector(".hero .intro h3");
const roleSets = {
  en: ["Web Developer", "Digital Marketing Specialist", "Meta Ads & SEO", "Social Media Marketer"],
  bn: ["ওয়েব ডেভেলপার", "ডিজিটাল মার্কেটিং স্পেশালিস্ট", "মেটা অ্যাডস ও SEO", "সোশ্যাল মিডিয়া মার্কেটার"]
};
const translations = {
  "Home":"হোম","About":"আমার সম্পর্কে","Skills":"দক্ষতা","Experience":"অভিজ্ঞতা","Projects":"প্রজেক্ট","Contact":"যোগাযোগ",
  "Let's Talk ↗":"আলাপ করি ↗","WEB & DIGITAL PROFESSIONAL":"ওয়েব ও ডিজিটাল প্রফেশনাল",
  "●   OPEN TO OPPORTUNITIES":"●   কাজের সুযোগের জন্য উন্মুক্ত","Hello, I'm":"হ্যালো, আমি",
  "Web Developer":"ওয়েব ডেভেলপার","Digital Marketing Specialist":"ডিজিটাল মার্কেটিং স্পেশালিস্ট",
  "Explore My Work ↗":"আমার কাজ দেখুন ↗","Get in Touch":"যোগাযোগ করুন",
  "Years of Experience":"বছরের অভিজ্ঞতা","Development Focus":"ডেভেলপমেন্টে মনোযোগ","Curiosity to Learn":"শেখার আগ্রহ",
  "Creative mindset":"সৃজনশীল মানসিকতা","Always learning, always building":"সবসময় শিখছি, নতুন কিছু তৈরি করছি",
  "01 / ABOUT ME":"০১ / আমার সম্পর্কে","Technology meets creativity.":"প্রযুক্তি ও সৃজনশীলতার সমন্বয়।",
  "Digital growth starts here.":"ডিজিটাল অগ্রযাত্রার শুরু এখানে।",
  "I’m MD Mehedi Hasan, a Web Developer and Digital Marketing professional who can take a website project from initial planning and UI design through frontend development, backend programming and database integration. I enjoy building complete, responsive web solutions and helping businesses connect with the right audience through digital marketing.":"আমি MD Mehedi Hasan। আমি একজন ওয়েব ডেভেলপার ও ডিজিটাল মার্কেটিং প্রফেশনাল। প্রাথমিক পরিকল্পনা ও UI ডিজাইন থেকে ফ্রন্টএন্ড ডেভেলপমেন্ট, ব্যাকএন্ড প্রোগ্রামিং এবং ডেটাবেজ ইন্টিগ্রেশন পর্যন্ত একটি ওয়েবসাইট তৈরির সম্পূর্ণ প্রক্রিয়ায় কাজ করতে পারি। পাশাপাশি ডিজিটাল মার্কেটিংয়ের মাধ্যমে ব্যবসাকে সঠিক অডিয়েন্সের সঙ্গে যুক্ত করতে আগ্রহী।",
  "My web development work covers the complete process—from structuring and designing user interfaces to building frontend experiences, server-side features and database-backed functionality. I also work with WordPress when it suits the project. Alongside development, I work with Facebook and Instagram advertising, audience targeting, campaign management, social media marketing and SEO to improve online visibility and reach potential customers.":"আমার ওয়েব ডেভেলপমেন্টের কাজের মধ্যে রয়েছে ইউজার ইন্টারফেসের কাঠামো ও ডিজাইন তৈরি, ফ্রন্টএন্ড, সার্ভার-সাইড ফিচার এবং ডেটাবেজ-নির্ভর কার্যকারিতা তৈরি। প্রজেক্টের উপযোগী হলে WordPress নিয়েও কাজ করি। পাশাপাশি অনলাইনে দৃশ্যমানতা বাড়াতে Facebook ও Instagram বিজ্ঞাপন, অডিয়েন্স টার্গেটিং, ক্যাম্পেইন ম্যানেজমেন্ট, সোশ্যাল মিডিয়া মার্কেটিং এবং SEO নিয়ে কাজ করি।",
  "I believe a strong digital presence needs both a well-built website and an effective marketing strategy. I focus on usability, clear communication, audience understanding and continuous improvement while developing my skills through practical projects and hands-on work.":"আমি বিশ্বাস করি, শক্তিশালী ডিজিটাল উপস্থিতির জন্য ভালোভাবে তৈরি ওয়েবসাইটের পাশাপাশি কার্যকর মার্কেটিং কৌশলও প্রয়োজন। ব্যবহারযোগ্যতা, পরিষ্কার যোগাযোগ, অডিয়েন্সকে বোঝা এবং ধারাবাহিক উন্নতিতে গুরুত্ব দিই। বাস্তব প্রজেক্ট ও হাতে-কলমে কাজের মাধ্যমে দক্ষতা বাড়াচ্ছি।",
  "02 / MY TOOLKIT":"০২ / আমার দক্ষতা","Skills &":"দক্ষতা ও","Technologies":"প্রযুক্তি",
  "My skills cover end-to-end website development, from interface design and frontend development to backend functionality, alongside digital marketing and SEO.":"আমার দক্ষতার মধ্যে রয়েছে ইন্টারফেস ডিজাইন ও ফ্রন্টএন্ড থেকে ব্যাকএন্ড পর্যন্ত সম্পূর্ণ ওয়েবসাইট ডেভেলপমেন্ট, পাশাপাশি ডিজিটাল মার্কেটিং ও SEO।",
  "Core Web Development":"মূল ওয়েব ডেভেলপমেন্ট","Building responsive, accessible interfaces with strong web fundamentals.":"ওয়েবের মৌলিক বিষয় কাজে লাগিয়ে রেসপনসিভ ও সহজে ব্যবহারযোগ্য ইন্টারফেস তৈরি।",
  "Frontend Development":"ফ্রন্টএন্ড ডেভেলপমেন্ট","Creating interactive user interfaces with modern JavaScript frameworks and styling tools.":"আধুনিক JavaScript ফ্রেমওয়ার্ক ও স্টাইলিং টুল দিয়ে ইন্টারঅ্যাকটিভ ইউজার ইন্টারফেস তৈরি।",
  "Backend & Development Tools":"ব্যাকএন্ড ও ডেভেলপমেন্ট টুলস","Working with server-side technologies, frameworks and version control.":"সার্ভার-সাইড প্রযুক্তি, ফ্রেমওয়ার্ক ও ভার্সন কন্ট্রোল নিয়ে কাজ।",
  "WordPress & CMS":"WordPress ও CMS","Building and managing content-driven websites with flexible CMS tools.":"বিভিন্ন CMS টুল ব্যবহার করে কনটেন্টভিত্তিক ওয়েবসাইট তৈরি ও পরিচালনা।",
  "Digital Marketing":"ডিজিটাল মার্কেটিং","Planning and managing digital campaigns to grow brand visibility and reach the right audience.":"ব্র্যান্ডের পরিচিতি বাড়ানো ও সঠিক অডিয়েন্সের কাছে পৌঁছাতে ডিজিটাল ক্যাম্পেইন পরিকল্পনা ও পরিচালনা।","Facebook Ads":"Facebook বিজ্ঞাপন","Instagram Ads":"Instagram বিজ্ঞাপন","Audience Targeting":"অডিয়েন্স টার্গেটিং","Campaign Management":"ক্যাম্পেইন ম্যানেজমেন্ট","Social Media Marketing":"সোশ্যাল মিডিয়া মার্কেটিং",
  "Theme Customization":"থিম কাস্টমাইজেশন","Website Management":"ওয়েবসাইট পরিচালনা","SEO Basics":"SEO-এর প্রাথমিক বিষয়",
  "I can manage the complete website development process—from planning and design to frontend, backend and database integration.":"আমি পরিকল্পনা ও ডিজাইন থেকে শুরু করে ফ্রন্টএন্ড, ব্যাকএন্ড এবং ডেটাবেজ ইন্টিগ্রেশন পর্যন্ত সম্পূর্ণ ওয়েবসাইট তৈরির কাজ করতে পারি।",
  "03 / EXPERIENCE":"০৩ / অভিজ্ঞতা","Continuous hands-on development":"নিয়মিত হাতে-কলমে কাজ ও দক্ষতা উন্নয়ন",
  "Building practical experience across website development, social media marketing, Meta advertising campaigns, audience research and SEO.":"ওয়েবসাইট ডেভেলপমেন্ট, সোশ্যাল মিডিয়া মার্কেটিং, Meta বিজ্ঞাপন ক্যাম্পেইন, অডিয়েন্স রিসার্চ এবং SEO-তে বাস্তব অভিজ্ঞতা তৈরি করছি।",
  "GROWTH":"উন্নতি","IN PROGRESS":"চলমান",
  "04 / SELECTED WORK":"০৪ / নির্বাচিত কাজ","Projects &":"প্রজেক্ট ও","Experiments":"পরীক্ষামূলক কাজ",
  "Selected work across web development and digital marketing, including website projects, social media campaigns and SEO activities.":"ওয়েব ডেভেলপমেন্ট ও ডিজিটাল মার্কেটিংয়ের নির্বাচিত কাজ—যেমন ওয়েবসাইট প্রজেক্ট, সোশ্যাল মিডিয়া ক্যাম্পেইন এবং SEO কার্যক্রম।",
  "Web Development & Digital Marketing":"ওয়েব ডেভেলপমেন্ট ও ডিজিটাল মার্কেটিং","Selected website projects, Meta Ads campaigns, social media creatives and SEO work will be showcased here as they are ready.":"নির্বাচিত ওয়েবসাইট প্রজেক্ট, Meta Ads ক্যাম্পেইন, সোশ্যাল মিডিয়া ক্রিয়েটিভ এবং SEO-এর কাজ প্রস্তুত হলে এখানে দেখানো হবে।",
  "CONTACT ME":"যোগাযোগ করুন","05 / LET’S TALK":"০৫ / কথা বলি",
  "Have an idea?":"কোনো আইডিয়া আছে?","Let’s make it happen.":"চলুন বাস্তবায়ন করি।",
  "Whether you need a professional website or support with digital marketing, I can help you build your online presence. Let’s discuss your goals and explore the right digital solution for your business.":"আপনার কি একটি প্রফেশনাল ওয়েবসাইট প্রয়োজন, নাকি ডিজিটাল মার্কেটিংয়ে সহায়তা চান? আপনার অনলাইন উপস্থিতি গড়ে তুলতে আমি সহায়তা করতে পারি। আপনার লক্ষ্য নিয়ে আলোচনা করে ব্যবসার জন্য উপযুক্ত ডিজিটাল সমাধান খুঁজে নেওয়া যাক।",
  "QUICK RESPONSE":"দ্রুত উত্তর","Start a WhatsApp Conversation":"WhatsApp-এ কথা বলুন",
  "Open to new connections and opportunities":"নতুন যোগাযোগ ও কাজের সুযোগের জন্য উন্মুক্ত",
  "DIRECT CONTACT":"সরাসরি যোগাযোগ","Let’s connect":"যোগাযোগ করি","EMAIL ME":"ইমেইল করুন",
  "PHONE & WHATSAPP":"ফোন ও WhatsApp","ALTERNATE PHONE":"বিকল্প ফোন","FOLLOW MY WORK":"আমার কাজ অনুসরণ করুন",
  "Designed with purpose. Built with curiosity.":"উদ্দেশ্য নিয়ে ডিজাইন, জানার আগ্রহে নির্মাণ।",
  "PERSONAL PORTFOLIO":"ব্যক্তিগত পোর্টফোলিও"
};
const originalDescription = "MD Mehedi Hasan — Web Developer & Digital Marketing Specialist building complete websites from design to backend, and working with Meta Ads, social media marketing and SEO.";
const bengaliDescription = "MD Mehedi Hasan — ওয়েব ডেভেলপার ও ডিজিটাল মার্কেটিং প্রফেশনাল। ডিজাইন থেকে ব্যাকএন্ড পর্যন্ত সম্পূর্ণ ওয়েবসাইট তৈরি, Meta Ads, সোশ্যাল মিডিয়া মার্কেটিং ও SEO নিয়ে কাজ করি।";
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
    if (suffix) suffix.textContent = toBengali ? "ওয়েব ডেভেলপমেন্ট ও ডিজিটাল মার্কেটিং" : "Web Development & Digital Marketing";
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
