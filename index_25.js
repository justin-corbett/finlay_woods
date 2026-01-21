// Register GSAP
 document.addEventListener("DOMContentLoaded", (event) => {
  gsap.registerPlugin(Observer,ScrollTrigger,SplitText,CustomEase)
 });

 // Lenis (with GSAP Scroltrigger)
const lenis = new Lenis({
  overscroll: false,
  anchors: true,
});
lenis.on('scroll', ScrollTrigger.update);
gsap.ticker.add((time) => {lenis.raf(time * 1000);});
gsap.ticker.lagSmoothing(0);

// Horizontal Scroll
// Sticky section heights
function setTrackHeights() {
  document.querySelectorAll(".horizontal-scroll_section-height").forEach(section => {
    const track = section.querySelector(".horizontal-scroll_track");
    const trackWidth = track.scrollWidth / 2; // original content width
    section.style.height = trackWidth + "px"; // fake height for vertical scroll
  });
}
setTrackHeights();
window.addEventListener("resize", setTrackHeights);


// Build your horizontal timeline
let horizontalMainTl = gsap.timeline({
scrollTrigger: {
  id: "horizontal-work",
  trigger: ".horizontal-scroll_section-height",
  start: "top top",
  end: "bottom bottom",
  scrub: 1
}
});

horizontalMainTl.to(".horizontal-scroll_track", {
xPercent: -100,
ease: "none"
});


// Scroll-To Anchor Lenis
function initScrollToAnchorLenis() {
  document.querySelectorAll("[data-anchor-target]").forEach(el => {
    el.addEventListener("click", (e) => {
      e.preventDefault();

      const selector = el.getAttribute("data-anchor-target");
      const target = document.querySelector(selector);
      if (!target) return;

      // Find parent horizontal section
      const hSection = target.closest(".horizontal-scroll_section-height");
      if (!hSection) {
        // Not inside horizontal scroll → normal scroll
        lenis.scrollTo(target, {
          duration: 1.2,
          easing: (x) => x
        });
        return;
      }

      // Horizontal track inside section
      const track = hSection.querySelector(".horizontal-scroll_track");
      const trackWidth = track.scrollWidth;
      const sectionHeight = parseFloat(getComputedStyle(hSection).height);

      // Target element X position relative to track
      const targetRect = target.getBoundingClientRect();
      const trackRect = track.getBoundingClientRect();
      const offsetX = targetRect.left - trackRect.left; // px

      // Map horizontal offset to vertical scroll
      const sectionTop = hSection.offsetTop;
      const verticalScrollPos = sectionTop + (sectionHeight * offsetX / trackWidth);

      lenis.scrollTo(verticalScrollPos, {
        duration: 1.4,
        easing: (x) => 1 - Math.pow(1 - x, 3)
      });
    });
  });
}

// Initialize Scroll-To Anchor Lenis
document.addEventListener('DOMContentLoaded', () => {
  initScrollToAnchorLenis();
});

// Animate work items as scroll into view
gsap.utils.toArray(".marquee_item").forEach((item) => {
  gsap.from(item, {
    opacity: 0,
    y: 40,
    scale: 0.95,
    duration: 0.6,
    ease: "power3.out",
    scrollTrigger: {
      trigger: item,
      containerAnimation: horizontalMainTl,
      start: "left right",   // item enters from right edge
      toggleActions: "play none none reverse"
    }
  });
});

document.querySelectorAll(".section-image").forEach((section) => {
  const img = section.querySelector(".image-full_screen");

  ScrollTrigger.create({
    trigger: section,
    containerAnimation: horizontalMainTl,
    start: "left right",
    end: "right left",
    scrub: 1,
    onUpdate: (self) => {
      const progress = self.progress; // 0 → 1

      // Map progress to -10vw → +10vw
      const xVW = gsap.utils.mapRange(
        0, 1,     // input range (scroll)
        5, -5,  // output range (vw) — inverted so forward scroll moves left
        progress
      );

      img.style.transform = `translateX(${xVW}vw)`;
    }
  });
});







/*
// Timeline markers
function initTimelineAnimations() {
  // Timeline pinhead fade in
  gsap.timeline({
    scrollTrigger: {
      trigger: ".collection-projects",
      containerAnimation: horizontalMainTl,
      start: "left 52.5%",
      end: "left 47.5%",
      scrub: true,
    }
  })
  .to(".projects-timeline-pin-wrapper", { opacity: 1, ease: "power4.out" }, 0);

  // Markers animation
  const pinWrapper = document.querySelector(".projects-timeline-pin-wrapper");
  const outerPin = document.querySelector(".projects-timeline-pin-outer-wrapper");
  const innerPin = document.querySelector(".projects-timeline-pin-inner-wrapper");

  const markers = document.querySelectorAll(".project-timeline-marker");

  markers.forEach(marker => {
    gsap.set(marker, { scaleY: 1, transformOrigin: "50% 100%" });

    gsap.timeline({
      scrollTrigger: {
        trigger: marker,
        containerAnimation: horizontalMainTl,
        start: "left right",
        end: "left left",
        scrub: true,
        onUpdate: self => {
          const mBounds = marker.getBoundingClientRect();
          const pinBounds = pinWrapper.getBoundingClientRect();
          const outerBounds = outerPin.getBoundingClientRect();
          const innerBounds = innerPin.getBoundingClientRect();

          if (mBounds.left < innerBounds.right && mBounds.right > innerBounds.left) {
            gsap.to(marker, { scaleY: 3.75, duration: 0.2, opacity: 1, ease: "power1.out" });
          } else if (mBounds.left < outerBounds.right && mBounds.right > outerBounds.left) {
            gsap.to(marker, { scaleY: 2.75, duration: 0.2, opacity: 0.5, ease: "power1.out" });
          } else if (mBounds.left < pinBounds.right && mBounds.right > pinBounds.left) {
            gsap.to(marker, { scaleY: 1.75, duration: 0.2, opacity: 0.3, ease: "power1.out" });
          } else {
            gsap.to(marker, { scaleY: 1, duration: 0.2, opacity: 0.1, ease: "power1.out" });
          }
        }
      }
    });
  });
}
*/

// Pick a random lowercase letter not in the original word
function randomLetterExcluding(originalChars) {
  let char;
  const lowerOriginal = originalChars.map(c => c.toLowerCase());
  do {
    char = String.fromCharCode(97 + Math.floor(Math.random() * 26));
  } while (lowerOriginal.includes(char));
  return char;
}

// Flicker text animation
function animateLoaderText(element, duration = 1.5) {
  if (!element) return;

  gsap.set(element, { display: "block", opacity: 1 });

  const split = new SplitText(element, { type: "chars" });
  const chars = split.chars;
  const originalChars = chars.map(c => c.textContent);

  gsap.set(chars, { opacity: 0, display: "inline-block" });

  const tl = gsap.timeline();

  chars.forEach((charSpan) => {
    const flickerTl = gsap.timeline();
    const flickerCount = 5 + Math.floor(Math.random() * 2);
    const singleDuration = duration / (flickerCount + 1);

    for (let i = 0; i < flickerCount; i++) {
      const rand = Math.random();
      let newChar = charSpan.textContent;
      let color = "";
      let opacity = 1;

      if (rand < 0.2) color = "#ff0f00";
      else if (rand < 0.5) opacity = 0;
      else newChar = randomLetterExcluding(originalChars);

      flickerTl.to(charSpan, {
        duration: singleDuration,
        textContent: newChar,
        color,
        opacity,
        ease: "none"
      });
    }

    flickerTl.to(charSpan, {
      duration: singleDuration,
      textContent: charSpan.textContent,
      color: "",
      opacity: 1
    });

    tl.add(flickerTl, 0);
  });

  return tl;
}


// Home Hero Logo SVG Animation
let heroLogoTL;

document.addEventListener("DOMContentLoaded", () => {
  const logo = document.querySelectorAll(".hero-logo-svg");

  // Set initial state
  gsap.set(logo, {
    yPercent: -110,
    transformOrigin: "50% 50%",
  });

  // Create paused timeline
  heroLogoTL = gsap.timeline({ paused: true });

  heroLogoTL.to(logo, {
    yPercent: 0,
    duration: 0.8,
    ease: "power3.out",
  });
});

// Play animation
function animateHeroLogo() {
  if (!heroLogoTL) return;
  heroLogoTL.play();
}



let descriptionSplit;

function initHeroDescriptionSplit() {
  const description = document.querySelector(".home_hero-description");
  if (!description) return;

  // Clean up previous split
  if (descriptionSplit) descriptionSplit.revert();

  // Create SplitText for lines
  descriptionSplit = SplitText.create(description, {
    type: "lines",
    mask: "lines",
    aria: "auto",
    autoSplit: true,
  });

  // Hide all lines individually
  gsap.set(descriptionSplit.lines, { yPercent: 100 });

  // Make the parent visible AFTER SplitText has processed
  gsap.set(description, { autoAlpha: 1 });
}

function animateHeroDescription() {
  if (!descriptionSplit) return;

  gsap.to(descriptionSplit.lines, {
    yPercent: 0,
    duration: 0.8,
    ease: "power4.out",
    stagger: 0.15,
  });
}

// Wait for fonts to be ready
document.fonts.ready.then(() => {
  initHeroDescriptionSplit();
});



















// Loader init
function initLoader() {
  const counter = document.querySelector(".loader-counter");
  const loaderName = document.querySelector(".loader-name");
  const loaderRole = document.querySelector(".loader-role");
  const videoWrapper = document.querySelector(".loader-video");
  const videoPreview = document.querySelector(".loader_video-preview");
  const videoUI = document.querySelector(".loader-video-ui");

  if (!counter || !videoPreview || !videoWrapper) return;

  // Initial states
  gsap.set(counter, { y: "200%", opacity: 1 });
  gsap.set(videoPreview, { y: "101%" });
  gsap.set(videoUI, { autoAlpha: 0 });

  const videoSlideDuration = 1;
  const counterSlideDuration = 1;
  const counterCountDuration = 4;
  const nameFlickerDuration = 1.2;
  const roleFlickerDuration = 1.2;
  const fadeOutDuration = 0.6;
  const wrapperExpandDuration = 1.5;
  const loaderFadeOutDuration = 0.8;
  const uiFadeInDuration = 0.6;

  const tl = gsap.timeline();

  tl.addLabel("videoIn");



  tl.to(videoPreview, {
    y: "0%",
    duration: videoSlideDuration,
    ease: "power3.out",
    onStart: () => {
      lenis.stop();
      lenis.scrollTo("#top", {
        duration: 0.2,
        force: true,
      });
    }
  }, "videoIn");

  tl.to(counter, {
    y: "0%",
    duration: counterSlideDuration,
    ease: "power3.out"
  }, "videoIn+=0.3");

  tl.to({ val: 0 }, {
    val: 100,
    duration: counterCountDuration,
    ease: "linear",
    onUpdate() {
      counter.textContent = Math.floor(this.targets()[0].val)
        .toString()
        .padStart(2, "0");
    }
  }, "videoIn");

  tl.to(videoUI, {
    autoAlpha: 1,
    duration: uiFadeInDuration
  }, "videoIn+=" + videoSlideDuration);

  if (loaderName) {
    tl.add(
      animateLoaderText(loaderName, nameFlickerDuration),
      "videoIn+=" + videoSlideDuration
    );
  }

  if (loaderRole) {
    tl.add(
      animateLoaderText(loaderRole, roleFlickerDuration),
      "videoIn+=" + (videoSlideDuration + 0.3)
    );
  }

  tl.add(() => {
    gsap.to([counter, loaderName, loaderRole], {
      opacity: 0,
      duration: fadeOutDuration,
      ease: "power2.out"
    });

    gsap.to(videoWrapper, {
      width: "100%",
      height: "100%",
      duration: wrapperExpandDuration,
      ease: "power2.out"
    });
  }, "videoIn+=" + counterCountDuration);

  tl.to(".loader", {
    autoAlpha: 0,
    duration: loaderFadeOutDuration,
    ease: "power2.out",
    onComplete: () => {
      gsap.set(".loader", { display: "none" });

      // start smooth scroll
      lenis.start();

      // refresh ScrollTrigger AFTER loader layout stabilizes
      ScrollTrigger.refresh(true);

      animateHeroLogo();

      gsap.delayedCall(0.3, () => {
        animateHeroDescription();
      });

    }
  });

}

// ✅ DOM READY → FONTS READY → INIT
document.addEventListener("DOMContentLoaded", () => {
    initLoader();
});






// Navigation – Timezone 
function initDynamicCurrentTime() {
  const defaultTimezone = "Europe/Amsterdam";

  // Helper function to format numbers with leading zero
  const formatNumber = (number) => number.toString().padStart(2, '0');

  // Function to create a time formatter with the correct timezone
  const createFormatter = (timezone) => {
    return new Intl.DateTimeFormat([], {
      timeZone: timezone,
      timeZoneName: 'short',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false, // Optional: Remove to match your simpler script
    });
  };

  // Function to parse the formatted string into parts
  const parseFormattedTime = (formattedDateTime) => {
    const match = formattedDateTime.match(/(\d+):(\d+):(\d+)\s*([\w+]+)/);
    if (match) {
      return {
        hours: match[1],
        minutes: match[2],
        seconds: match[3],
        timezone: match[4], // Handles both GMT+X and CET cases
      };
    }
    return null;
  };

  // Function to update the time for all elements
  const updateTime = () => {
    document.querySelectorAll('[data-current-time]').forEach((element) => {
      const timezone = element.getAttribute('data-current-time') || defaultTimezone;
      const formatter = createFormatter(timezone);
      const now = new Date();
      const formattedDateTime = formatter.format(now);

      const timeParts = parseFormattedTime(formattedDateTime);
      if (timeParts) {
        const {
          hours,
          minutes,
          seconds,
          timezone
        } = timeParts;

        // Update child elements if they exist
        const hoursElem = element.querySelector('[data-current-time-hours]');
        const minutesElem = element.querySelector('[data-current-time-minutes]');
        const secondsElem = element.querySelector('[data-current-time-seconds]');
        const timezoneElem = element.querySelector('[data-current-time-timezone]');

        if (hoursElem) hoursElem.textContent = hours;
        if (minutesElem) minutesElem.textContent = minutes;
        if (secondsElem) secondsElem.textContent = seconds;
        if (timezoneElem) timezoneElem.textContent = timezone;
      }
    });
  };

  // Initial update and interval for subsequent updates
  updateTime();
  setInterval(updateTime, 1000);
}

// Initialize Dynamic Current Time
document.addEventListener('DOMContentLoaded', () => {
  initDynamicCurrentTime();
});

// CMS LIST SYNC POWER-UP (T.RICKS)
window.addEventListener("DOMContentLoaded", (event) => {
  // attribute value checker
  function attr(defaultVal, attrVal) {
    const defaultValType = typeof defaultVal;
    if (typeof attrVal !== "string" || attrVal.trim() === "") return defaultVal;
    if (attrVal === "true" && defaultValType === "boolean") return true;
    if (attrVal === "false" && defaultValType === "boolean") return false;
    if (isNaN(attrVal) && defaultValType === "string") return attrVal;
    if (!isNaN(attrVal) && defaultValType === "number") return +attrVal;
    return defaultVal;
  }
  // cms list sync component
  $("[tr-listsync-element='component']").each(function (index) {
    let componentEl = $(this),
      cmsListEl = componentEl.find("[tr-listsync-element='list']"),
      cmsItemEl = cmsListEl.children();
    let onLoadSetting = attr(false, componentEl.attr("tr-listsync-onload")),
      activeIndexSetting = attr(0, componentEl.attr("tr-listsync-activeindex")),
      activeClassSetting = attr("is-active", componentEl.attr("tr-listsync-activeclass"));
    function addActive(trigger) {
      cmsItemEl.removeClass(activeClassSetting);
      let itemIndex = trigger.index();
      cmsListEl.each(function () {
        $(this).children().eq(itemIndex).addClass(activeClassSetting);
      });
    }
    if (onLoadSetting) addActive(cmsItemEl.eq(activeIndexSetting));
    cmsListEl.each(function () {
      let childrenItemEl = $(this).children(),
        clickSetting = attr(true, $(this).attr("tr-listsync-click")),
        hoverInSetting = attr(false, $(this).attr("tr-listsync-hoverin")),
        hoverOutSetting = attr(false, $(this).attr("tr-listsync-hoverout"));
      if (clickSetting) {
        childrenItemEl.on("click", function () {
          addActive($(this));
        });
      }
      if (hoverInSetting) {
        childrenItemEl.on("mouseenter", function () {
          addActive($(this));
        });
      }
      if (hoverOutSetting) {
        childrenItemEl.on("mouseleave", function () {
          cmsItemEl.removeClass(activeClassSetting);
        });
      }
    });
  });
});

// Theme switching per section
gsap.utils.toArray("[data-theme-section]").forEach((section) => {
const theme = section.getAttribute("data-theme-section");
const bg    = section.getAttribute("data-bg-section");

ScrollTrigger.create({
  trigger: section,
  start: "left right-=95%",
  end: "right right-=95%",
  containerAnimation: horizontalMainTl, // key part
  onToggle(self) {
    if (!self.isActive) return;

    document.querySelectorAll("[data-theme-nav]").forEach((el) => {
      el.setAttribute("data-theme-nav", theme);
    });
    document.querySelectorAll("[data-bg-nav]").forEach((el) => {
      el.setAttribute("data-bg-nav", bg);
    });
  }
  // , markers: true // debug
  });
});



// Menu Button
CustomEase.create("button-ease", "0.5, 0.05, 0.05, 0.99")

function initMenuButton() {
  // Select elements
  const menuButton = document.querySelector("[data-menu-button]");
  const lines = document.querySelectorAll(".menu-button-line");
  const [line1, line2, line3] = lines;
  
  // Define one global timeline
  let menuButtonTl = gsap.timeline({
    defaults:{
      overwrite:"auto",
      ease: "button-ease",
  	  duration: 0.3
    }
  })

  const menuOpen = () => {
    menuButtonTl.clear() // Stop any previous tweens, if any
    .to(line2, { scaleX: 0, opacity: 0 }) // Step 1: Hide middle line
    .to(line1, { x: "-1.3em", opacity: 0 }, "<") // Step 1: Movetop line
    .to(line3, { x: "1.3em", opacity: 0 }, "<") // Step 1: Move bottom line
    .to([line1,line3],{opacity:0, duration: 0.1},"<+=0.2") // Step 2: Quickly fade top and bottom lines
    .set(line1, { rotate: -135, y: "-1.3em", scaleX: 0.9 }) // Step 3: Instantly rotate and scale top line
    .set(line3, { rotate: 135, y: "-1.4em", scaleX: 0.9 }, "<") // Step 3: Instantly rotate and scale bottom line
    .to(line1, { opacity: 1, x: "0em", y: "0.5em"}) // Step 4: Move top line to final position
    .to(line3, { opacity: 1, x: "0em", y: "-0.25em" }, "<+=0.1"); // Step 4: Move bottom line to final position
  }

  const menuClose = () => {
    menuButtonTl.clear() // Stop any previous tweens, if any
    .to([line1, line2, line3], { // Move all lines back in a different animation
      scaleX: 1,
      rotate: 0,
      x: "0em",
      y: "0em",
      opacity: 1,
      duration: 0.45,
      overwrite: "auto",
    })
  }

  // Toggle Animation
  menuButton.addEventListener("click", () => {
    const currentState = menuButton.getAttribute("data-menu-button");

    if (currentState === "burger") {
      menuOpen()
      menuButton.setAttribute("data-menu-button", "close");
    } else {
      menuClose()
      menuButton.setAttribute("data-menu-button", "burger");
    }
  });
}

// Initialize Burger Menu Button
document.addEventListener('DOMContentLoaded', () => {
  initMenuButton();
});


// Cursor
const squareLeft   = document.querySelector(".cursor-square-left");
const squareCenter = document.querySelector(".cursor-square-center");
const lineH        = document.querySelector(".cursor-line-h");
const lineV        = document.querySelector(".cursor-line-v");
const cursorText   = document.querySelector(".cursor-text"); // NEW

window.addEventListener("mousemove", (e) => {
  // Use body font size as base for em
  const bodyFontSize = parseFloat(getComputedStyle(document.body).fontSize);

  // ---- Y bounds (7.5em top / 5em bottom)
  const minY = 7.5 * bodyFontSize;                      // top limit
  const maxY = window.innerHeight - (5 * bodyFontSize); // bottom limit
  const clampedY = Math.min(Math.max(e.clientY, minY), maxY);

  // ---- X bounds (7.5em left / 5em right)
  const minX = 5.1 * bodyFontSize;
  const maxX = window.innerWidth - (5 * bodyFontSize);
  const clampedX = Math.min(Math.max(e.clientX, minX), maxX);

  // Left square (Y only)
  if (squareLeft) {
    gsap.to(squareLeft, {
      y: clampedY - squareLeft.offsetHeight / 2,
      duration: 0.4,
      ease: "power2.out"
    });
  }

  // Center square (X + Y)
  if (squareCenter) {
    gsap.to(squareCenter, {
      x: clampedX - squareCenter.offsetWidth  / 2,
      y: clampedY - squareCenter.offsetHeight / 2,
      duration: 0.4,
      ease: "power2.out"
    });
  }

  // Horizontal line (Y only)
  if (lineH) {
    gsap.to(lineH, {
      y: clampedY,
      duration: 0.4,
      ease: "power2.out"
    });
  }

  // Vertical line (X only, NO vertical clamp)
  if (lineV) {
    gsap.to(lineV, {
      x: clampedX,
      duration: 0.4,
      ease: "power2.out"
    });
  }

  // Text follows same as center square (X + Y, centered)
  if (cursorText) {
    gsap.to(cursorText, {
      x: clampedX - cursorText.offsetWidth  / 2,
      y: clampedY - cursorText.offsetHeight / 2,
      duration: 0.4,
      ease: "power2.out"
    });
  }
});


// Red Recording Dot Off/On Animation
document.addEventListener("DOMContentLoaded", function() {
  // Select all elements with the class 'recording-dot'
  const recordingDots = document.querySelectorAll('.recording-dot');

  // Use GSAP to create an infinite flashing animation
  gsap.timeline({ repeat: -1 })
    .to(recordingDots, { opacity: 1, duration: 1 }) // On for 1 second
    .to(recordingDots, { opacity: 0, duration: 1 }) // Fade out for 0.5 second
    .to(recordingDots, { opacity: 0, duration: 0.125 }) // Off for 0.5 second
    .to(recordingDots, { opacity: 1, duration: 1 }); // Off for 0.5 second
});


// Marquee Item Hover 
const marqueeItems = document.querySelectorAll('.marquee_item');

// --- Initialize & autoplay all marquee videos ---
marqueeItems.forEach(item => {
  const video = item.querySelector('.marquee_video-preview');
  if (!video) return;

  video.muted = true;
  video.loop = true;
  video.playsInline = true;

  const playPromise = video.play();
  if (playPromise !== undefined) playPromise.catch(() => {});
});

// --- Hover behaviour ---
marqueeItems.forEach(item => {

  item.addEventListener('mouseenter', () => {
    // --- GSAP animations ---
    gsap.to(marqueeItems, { filter: "grayscale(100%)", duration: 1 });
    gsap.to(item, { filter: "grayscale(0%)", duration: 1 });

    // --- Pause ALL sibling videos ---
    marqueeItems.forEach(otherItem => {
      if (otherItem === item) return;

      const otherVideo = otherItem.querySelector('.marquee_video-preview');
      if (otherVideo && !otherVideo.paused) {
        otherVideo.pause();
      }
    });
  });

  item.addEventListener('mouseleave', () => {

    // --- Resume ALL videos ---
    marqueeItems.forEach(otherItem => {
      const otherVideo = otherItem.querySelector('.marquee_video-preview');
      if (otherVideo && otherVideo.paused) {
        const playPromise = otherVideo.play();
        if (playPromise !== undefined) playPromise.catch(() => {});
      }
    });

    gsap.to(marqueeItems, { filter: "grayscale(0%)", duration: 1 });
    gsap.to(item, { filter: "grayscale(0%)", duration: 1 });

  });
});


function animateMarqueeHover(item) {
  const marqueeUI = item.querySelector('.marquee-video-ui');

  // Borders
  const borderTop = item.querySelector('.ui-border-top');
  const borderBottom = item.querySelector('.ui-border-bottom');
  const borderLeft = item.querySelector('.ui-border-left');
  const borderRight = item.querySelector('.ui-border-right');

  // Corners
  const corners = {
    tlH: item.querySelector('.corner-tl-h'),
    tlV: item.querySelector('.corner-tl-v'),
    trH: item.querySelector('.corner-tr-h'),
    trV: item.querySelector('.corner-tr-v'),
    blH: item.querySelector('.corner-bl-h'),
    blV: item.querySelector('.corner-bl-v'),
    brH: item.querySelector('.corner-br-h'),
    brV: item.querySelector('.corner-br-v'),
  };

  // Text
  const textItems = item.querySelectorAll(
    '.text-work-record, .text-work-shutter, .text-work-aperture'
  );
  const timeText = item.querySelector('.text-work-time');
  const recordingDot = item.querySelector('.recording-dot-wrap');

  // Initial states
  gsap.set([...textItems, timeText], { yPercent: 100 });
  gsap.set(recordingDot, { opacity: 0 });

  // ───────────────── TIMER ─────────────────
  let startTime = 0;
  let tickerActive = false;
  let resetDelayCall;

  function formatTime(ms) {
    const totalSeconds = ms / 1000;
    const seconds = Math.floor(totalSeconds) % 60;
    const frames = Math.floor((totalSeconds % 1) * 100);

    return `00:${seconds.toString().padStart(2, '0')}:${frames
      .toString()
      .padStart(2, '0')}`;
  }

  function startTimer() {
    if (resetDelayCall) resetDelayCall.kill();

    startTime = performance.now();
    tickerActive = true;

    gsap.ticker.add(updateTimer);
  }

  function updateTimer() {
    if (!tickerActive) return;

    const elapsed = performance.now() - startTime;
    timeText.textContent = formatTime(elapsed);
  }

  function stopAndResetTimer() {
    tickerActive = false;
    gsap.ticker.remove(updateTimer);
    timeText.textContent = '00:00:00';
  }

  // ───────────────── TIMELINE ─────────────────
  const tl = gsap.timeline({ paused: true });

  tl.set(marqueeUI, { display: 'flex' }, 0)

    // Borders
    .from(borderTop, { width: '0%', duration: 1, ease: 'power1.out' }, 0)
    .from(borderBottom, { width: '0%', duration: 1, ease: 'power2.out' }, '<')
    .from(borderRight, { height: '0%', duration: 1, ease: 'power2.out' }, '<')
    .from(borderLeft, { height: '0%', duration: 1, ease: 'power2.out' }, '<')

    // Corners
    .from(corners.tlH, { width: '0%', duration: 0.2 }, '<0.1')
    .from(corners.tlV, { height: '0%', duration: 0.2 }, '<0.05')
    .from(corners.trH, { width: '0%', duration: 0.2 }, '<0.05')
    .from(corners.trV, { height: '0%', duration: 0.2 }, '<0.05')
    .from(corners.blH, { width: '0%', duration: 0.2 }, '<0.05')
    .from(corners.blV, { height: '0%', duration: 0.2 }, '<0.05')
    .from(corners.brH, { width: '0%', duration: 0.2 }, '<0.05')
    .from(corners.brV, { height: '0%', duration: 0.2 }, '<0.05')

    // Text reveal
    .to(
      [...textItems, timeText],
      {
        yPercent: 0,
        duration: 0.6,
        ease: 'power3.out',
        stagger: 0.05,
      },
      '<0.1'
    )

    // Recording dot
    .to(
      recordingDot,
      {
        opacity: 1,
        duration: 0.4,
        ease: 'power2.out',
      },
      '<'
    );

  // ───────────────── EVENTS ─────────────────
  item.addEventListener('mouseenter', () => {
    gsap.to(item, {
      scale: 0.8,
      duration: 0.5,
      ease: 'power2.inOut',
    });

    tl.play();
    startTimer();
  });

  item.addEventListener('mouseleave', () => {
    gsap.to(item, {
      scale: 1,
      duration: 0.5,
      ease: 'power2.inOut',
    });

    tl.reverse();

    resetDelayCall = gsap.delayedCall(1, stopAndResetTimer);
  });
}

// Apply to all marquee items
document.querySelectorAll('.marquee_item').forEach(item => {
  animateMarqueeHover(item);
});











// Navigation + Hover (split both main & hover so close animates whichever is visible)
document.addEventListener("DOMContentLoaded", () => {
  const navPanel = document.querySelector(".navigation-dropdown-slide"); // background panel
  const navMenu  = document.querySelector(".nav_menu");                 // wrapper
  const navBtn   = document.querySelector(".nav_menu-button");          // toggle button
  const navLinks = Array.from(document.querySelectorAll(".nav_link"));  // each nav item
  const navNumbers = Array.from(document.querySelectorAll(".nav_link-number")); // numbers

  // selectors for button + borders + cursor parts + extras

  const cursorSquares  = document.querySelectorAll(".cursor-square-left, .cursor-square-center");
  const cursorLines    = document.querySelectorAll(".cursor-line-h, .cursor-line-v");
  const cursorText     = document.querySelectorAll(".cursor-text");

  if (!navPanel || !navMenu || !navBtn || !navLinks.length) return;

  // -------- Speed controls --------
  const OPEN_SPEED  = 1;     // playback speed when opening
  const CLOSE_SPEED = 2;     // playback speed when closing

  // ---- Build per-link hover timelines ----
  navLinks.forEach(link => {
    const main  = link.querySelector(".nav_link-main");
    const hover = link.querySelector(".nav_link-hover");
    const mask  = link.querySelector(".nav_link-mask");
    if (!main || !hover || !mask) return;

    // stacking + mask setup
    mask.style.position  ||= "relative";
    mask.style.overflow  ||= "hidden";
    hover.style.position ||= "absolute";
    hover.style.left = "0"; hover.style.top = "0"; hover.style.width = "100%";

    if (!hover.style.transform) gsap.set(hover, { yPercent: 100 });

    const htl = gsap.timeline({
      paused: true,
      defaults: { duration: 0.45, ease: "power3.out", overwrite: "auto" }
    });
    htl.to(main, { yPercent: -100 }, 0)
       .fromTo(hover, { yPercent: 105 }, { yPercent: 0, immediateRender: false }, 0);

    link._hoverTl = htl;

    // mouse/keyboard handlers
    link.addEventListener("mouseenter", () => link._hoverTl?.timeScale(OPEN_SPEED).play());
    link.addEventListener("mouseleave", () => link._hoverTl?.timeScale(CLOSE_SPEED).reverse());
    link.addEventListener("focus",     () => link._hoverTl?.timeScale(OPEN_SPEED).play());
    link.addEventListener("blur",      () => link._hoverTl?.timeScale(CLOSE_SPEED).reverse());
  });

  // ---- Split BOTH the main and hover headings ----
  const mainHeadings  = navLinks.map(l => l.querySelector(".nav_link-main")).filter(Boolean);
  const hoverHeadings = navLinks.map(l => l.querySelector(".nav_link-hover")).filter(Boolean);
  const splitTargets  = [...mainHeadings, ...hoverHeadings];
  if (!splitTargets.length) return;

  SplitText.autoSplit?.({
    targets: splitTargets,
    types: "words",
    wordClass: "nav-word",
    reduceWhiteSpace: false
  }) || SplitText.create(splitTargets, {
    type: "words",
    wordsClass: "nav-word",
    reduceWhiteSpace: false
  });

  const allWords = splitTargets.flatMap(el => Array.from(el.querySelectorAll(".nav-word")));

  // ---- Prep states ----
  gsap.set(navMenu,  { display: "none" });
  gsap.set(navPanel, { x: "-100%" });
  gsap.set([...allWords, ...navNumbers], { yPercent: 110 });

  // ---- Open/Close timeline ----
  const tl = gsap.timeline({ paused: true, defaults: { ease: "power3.out" } });

  // disable pointer events at start
  tl.set(navMenu, { display: "block" }, 0)
    .to(navPanel, { duration: 1, x: "0%", ease: "power3.inOut" })
    .to(allWords, { duration: 0.7, yPercent: 0, stagger: { amount: 0.5, from: "start" } }, "<50%")
    .to(navNumbers, { duration: 0.7, yPercent: 0, stagger: { amount: 0.5, from: "start" } }, "<50%")
    .to([cursorSquares, cursorLines, cursorText], { opacity: 0, duration: 0.3 }, 0)
    // re-enable pointer events after open finishes
    .set(".navbar_container", { pointerEvents: "auto" });

  // ---- Toggle helpers with color class ----
  let isOpen = false;

  const openNav = () => {
    navLinks.forEach(l => l._hoverTl?.timeScale(CLOSE_SPEED).reverse(0));
    lenis.stop();

  // Add open color class with 0.2s delay
  gsap.delayedCall(0.2, () => {
    document.querySelectorAll("[data-theme-nav]").forEach(el => {
      el.classList.add("nav-open-black");
    });
  });

    tl.timeScale(OPEN_SPEED).play(0);
    isOpen = true;
  };

  const closeNav = () => {
    navLinks.forEach(l => l._hoverTl?.timeScale(CLOSE_SPEED).reverse());
    tl.timeScale(CLOSE_SPEED).reverse();

  // Remove open color class with 0.6s delay
  gsap.delayedCall(0.6, () => {
    document.querySelectorAll("[data-theme-nav]").forEach(el => {
      el.classList.remove("nav-open-black");
    });
  });

    isOpen = false;
  };

  navBtn.addEventListener("click", (e) => {
    e.preventDefault();
    isOpen ? closeNav() : openNav();

    navBtn.setAttribute("aria-expanded", isOpen ? "true" : "false");
    navMenu.setAttribute("aria-hidden", isOpen ? "false" : "true");
  });

  // reset navMenu visibility when completely closed
  tl.eventCallback("onReverseComplete", () => {
    gsap.set(navMenu, { display: "none" });
    lenis.start();
  });

  // expose timeline if needed
  window.navOpenTl = tl;
});



// Nav link hover
document.addEventListener("DOMContentLoaded", () => {
  const links = document.querySelectorAll(".nav-link-wrap");
  if (!links.length) return;

  links.forEach(link => {
    const main  = link.querySelector(".nav_link-main");
    const hover = link.querySelector(".nav_link-hover");
    const imgWrap = link.querySelector(".nav-image-wrap");
    const navLinkWrap = link.querySelector(".nav_link");
    const navSpacer = link.querySelector(".nav_link-spacer");
    const navLinkNumber = link.querySelector(".nav_link-number");

    if (!main || !hover || !imgWrap || !navLinkWrap || !navSpacer || !navLinkNumber ) return;

    // timeline (no autoAlpha, no initial set)
    const tl = gsap.timeline({ paused: true, defaults: { duration: 0.3, ease: "power2.inOut" }});
    tl.to(main,  { yPercent: -110 }, 0)
      .to(hover, { yPercent: -110 }, 0)
      .to(imgWrap, { width: "auto" }, 0)
      .to(navSpacer, { width: "2em" }, 0)
      .to(navLinkNumber, { color: "white" }, 0);

    // mouse
    link.addEventListener("mouseenter", () => tl.play());
    link.addEventListener("mouseleave", () => tl.reverse());

    // accessibility: keyboard focus
    link.addEventListener("focus", () => tl.play());
    link.addEventListener("blur", () => tl.reverse());
  });
});

// Scrollbar
function initScrollProgressBar() {
  const progressBar = document.querySelector('.progress-bar');
  const progressBarWrap = document.querySelector('.progress-bar-wrap');

  if (!progressBar || !progressBarWrap) return;

  // Convert 7.5em to pixels (based on wrap font-size)
  const fontSize = parseFloat(
    getComputedStyle(progressBarWrap).fontSize
  );
  const minHeightPx = 7.5 * fontSize;

  // Measure full bar height
  const fullHeight = progressBarWrap.offsetHeight;

  // Calculate minimum scale value
  const minScaleY = minHeightPx / fullHeight;

  // Set initial state
  gsap.set(progressBar, {
    scaleY: minScaleY,
    transformOrigin: 'top center',
  });

  // Animate scroll progress
  gsap.to(progressBar, {
    scaleY: 1,
    ease: 'none',
    scrollTrigger: {
      trigger: '.horizontal-scroll_section-height',
      start: 'top top',
      end: 'bottom bottom',
      scrub: 0.5,
    },
  });
}

// Initialize Scroll Progress Bar
document.addEventListener('DOMContentLoaded', () => {
  initScrollProgressBar();
});


// Hover animation for .home_hero-arrow-wrap
document.querySelectorAll(".home_hero-arrow-wrap").forEach((wrap) => {
  const corners = wrap.querySelector(".arrow-corners");
  const arrow   = wrap.querySelector(".home_hero-arrow");

  // Build a timeline so both animate together
  const tl = gsap.timeline({ paused: true });

  tl.to(corners, {
    rotation: -90,
    borderColor: "#f00000",
    duration: 0.4,
    ease: "power2.out"
  }, 0) // start at same time

  .to(arrow, {
    rotation: 0,
    scale: 0.8,
    duration: 0.4,
    ease: "power2.out"
  }, 0);

  wrap.addEventListener("mouseenter", () => tl.play());
  wrap.addEventListener("mouseleave", () => tl.reverse());
});










































// Bunny Video Player

function initBunnyPlayer() {
  document.querySelectorAll('[data-bunny-player-init]').forEach(function(player) {
    var src = player.getAttribute('data-player-src');
    if (!src) return;

    var video = player.querySelector('video');
    if (!video) return;

    try { video.pause(); } catch(_) {}
    try { video.removeAttribute('src'); video.load(); } catch(_) {}

    // Attribute helpers
    function setStatus(s) {
      if (player.getAttribute('data-player-status') !== s) {
        player.setAttribute('data-player-status', s);
      }
    }
    function setMutedState(v) {
      video.muted = !!v;
      player.setAttribute('data-player-muted', video.muted ? 'true' : 'false');
    }
    function setFsAttr(v) { player.setAttribute('data-player-fullscreen', v ? 'true' : 'false'); }
    function setActivated(v) { player.setAttribute('data-player-activated', v ? 'true' : 'false'); }
    if (!player.hasAttribute('data-player-activated')) setActivated(false);

    // Elements
    var timeline = player.querySelector('[data-player-timeline]');
    var progressBar = player.querySelector('[data-player-progress]');
    var bufferedBar = player.querySelector('[data-player-buffered]');
    var handle = player.querySelector('[data-player-timeline-handle]');
    var timeDurationEls = player.querySelectorAll('[data-player-time-duration]');
    var timeProgressEls = player.querySelectorAll('[data-player-time-progress]');

    // Flags
    var updateSize = player.getAttribute('data-player-update-size'); // "true" | "cover" | null
    var lazyMode = player.getAttribute('data-player-lazy');          // "true" | "meta" | null
    var isLazyTrue = lazyMode === 'true';
    var isLazyMeta = lazyMode === 'meta';
    var autoplay = player.getAttribute('data-player-autoplay') === 'true';
    var initialMuted = player.getAttribute('data-player-muted') === 'true';

    // Used to suppress 'ready' flicker when user just pressed play in lazy modes
    var pendingPlay = false;

    // Autoplay forces muted; IO will trigger "fake click"
    if (autoplay) { setMutedState(true); video.loop = true; } else { setMutedState(initialMuted); }

    video.setAttribute('muted', '');
    video.setAttribute('playsinline', '');
    video.setAttribute('webkit-playsinline', '');
    video.playsInline = true;
    if (typeof video.disableRemotePlayback !== 'undefined') video.disableRemotePlayback = true;
    if (autoplay) video.autoplay = false;

    var isSafariNative = !!video.canPlayType('application/vnd.apple.mpegurl');
    var canUseHlsJs = !!(window.Hls && Hls.isSupported()) && !isSafariNative;

    // Minimal ratio fetch when requested (and not already handled by lazy meta)
    if (updateSize === 'true' && !isLazyMeta) {
      if (isLazyTrue) {
        // Do nothing: no fetch, no <video> touch when lazy=true
      } else {
        var prev = video.preload;
        video.preload = 'metadata';
        var onMeta2 = function() {
          setBeforeRatio(player, updateSize, video.videoWidth, video.videoHeight);
          video.removeEventListener('loadedmetadata', onMeta2);
          video.preload = prev || '';
        };
        video.addEventListener('loadedmetadata', onMeta2, { once: true });
        video.src = src;
      }
    }

    //  Lazy meta fetch (duration + aspect) without attaching playback
    function fetchMetaOnce() {
      getSourceMeta(src, canUseHlsJs).then(function(meta){
        if (meta.width && meta.height) setBeforeRatio(player, updateSize, meta.width, meta.height);
        if (timeDurationEls.length && isFinite(meta.duration) && meta.duration > 0) {
          setText(timeDurationEls, formatTime(meta.duration));
        }
        readyIfIdle(player, pendingPlay);
      });
    }

    // Attach media only once (for actual playback)
    var isAttached = false;
    var userInteracted = false;
    var lastPauseBy = '';
    function attachMediaOnce() {
      if (isAttached) return;
      isAttached = true;

      if (player._hls) { try { player._hls.destroy(); } catch(_) {} player._hls = null; }

      if (isSafariNative) {
        video.preload = (isLazyTrue || isLazyMeta) ? 'auto' : video.preload;
        video.src = src;
        video.addEventListener('loadedmetadata', function() {
          readyIfIdle(player, pendingPlay);
          if (updateSize === 'true') setBeforeRatio(player, updateSize, video.videoWidth, video.videoHeight);
          if (timeDurationEls.length) setText(timeDurationEls, formatTime(video.duration));
        }, { once: true });
      } else if (canUseHlsJs) {
        var hls = new Hls({ maxBufferLength: 10 });
        hls.attachMedia(video);
        hls.on(Hls.Events.MEDIA_ATTACHED, function() { hls.loadSource(src); });
        hls.on(Hls.Events.MANIFEST_PARSED, function() {
          readyIfIdle(player, pendingPlay);
          if (updateSize === 'true') {
            var lvls = hls.levels || [];
            var best = bestLevel(lvls);
            if (best && best.width && best.height) setBeforeRatio(player, updateSize, best.width, best.height);
          }
        });
        hls.on(Hls.Events.LEVEL_LOADED, function(e, data) {
          if (data && data.details && isFinite(data.details.totalduration)) {
            if (timeDurationEls.length) setText(timeDurationEls, formatTime(data.details.totalduration));
          }
        });
        player._hls = hls;
      } else {
        video.src = src;
      }
    }

    // Initialize based on lazy mode
    if (isLazyMeta) {
      fetchMetaOnce();
      video.preload = 'none';
    } else if (isLazyTrue) {
      video.preload = 'none';
    } else {
      attachMediaOnce();
    }

    // Toggle play/pause
    function togglePlay() {
      userInteracted = true;
      if (video.paused || video.ended) {
        if ((isLazyTrue || isLazyMeta) && !isAttached) attachMediaOnce();
        pendingPlay = true;
        lastPauseBy = '';
        setStatus('loading');
        safePlay(video);
      } else {
        lastPauseBy = 'manual';
        video.pause();
      }
    }

    // Toggle mute
    function toggleMute() {
      video.muted = !video.muted;
      player.setAttribute('data-player-muted', video.muted ? 'true' : 'false');
    }

    // Fullscreen helpers
    function isFsActive() { return !!(document.fullscreenElement || document.webkitFullscreenElement); }
    function enterFullscreen() {
      if (player.requestFullscreen) return player.requestFullscreen();
      if (video.requestFullscreen) return video.requestFullscreen();
      if (video.webkitSupportsFullscreen && typeof video.webkitEnterFullscreen === 'function') return video.webkitEnterFullscreen();
    }
    function exitFullscreen() {
      if (document.exitFullscreen) return document.exitFullscreen();
      if (document.webkitExitFullscreen) return document.webkitExitFullscreen();
      if (video.webkitDisplayingFullscreen && typeof video.webkitExitFullscreen === 'function') return video.webkitExitFullscreen();
    }
    function toggleFullscreen() { if (isFsActive() || video.webkitDisplayingFullscreen) exitFullscreen(); else enterFullscreen(); }
    document.addEventListener('fullscreenchange', function() { setFsAttr(isFsActive()); });
    document.addEventListener('webkitfullscreenchange', function() { setFsAttr(isFsActive()); });
    video.addEventListener('webkitbeginfullscreen', function() { setFsAttr(true); });
    video.addEventListener('webkitendfullscreen', function() { setFsAttr(false); });

    // Controls (delegated)
    player.addEventListener('click', function(e) {
      var btn = e.target.closest('[data-player-control]');
      if (!btn || !player.contains(btn)) return;
      var type = btn.getAttribute('data-player-control');
      if (type === 'play' || type === 'pause' || type === 'playpause') togglePlay();
      else if (type === 'mute') toggleMute();
      else if (type === 'fullscreen') toggleFullscreen();
    });

    // Time text (not in rAF)
    function updateTimeTexts() {
      if (timeDurationEls.length) setText(timeDurationEls, formatTime(video.duration));
      if (timeProgressEls.length) setText(timeProgressEls, formatTime(video.currentTime));
    }
    video.addEventListener('timeupdate', updateTimeTexts);
    video.addEventListener('loadedmetadata', function(){ updateTimeTexts(); maybeSetRatioFromVideo(player, updateSize, video); });
    video.addEventListener('loadeddata', function(){ maybeSetRatioFromVideo(player, updateSize, video); });
    video.addEventListener('playing', function(){ maybeSetRatioFromVideo(player, updateSize, video); });
    video.addEventListener('durationchange', updateTimeTexts);

    // rAF visuals (progress + handle only)
    var rafId;
    function updateProgressVisuals() {
      if (!video.duration) return;
      var playedPct = (video.currentTime / video.duration) * 100;
      if (progressBar) progressBar.style.transform = 'translateX(' + (-100 + playedPct) + '%)';
      if (handle) handle.style.left = playedPct + '%';
    }
    function loop() {
      updateProgressVisuals();
      if (!video.paused && !video.ended) rafId = requestAnimationFrame(loop);
    }

    // Buffered bar (not in rAF)
    function updateBufferedBar() {
      if (!bufferedBar || !video.duration || !video.buffered.length) return;
      var end = video.buffered.end(video.buffered.length - 1);
      var buffPct = (end / video.duration) * 100;
      bufferedBar.style.transform = 'translateX(' + (-100 + buffPct) + '%)';
    }
    video.addEventListener('progress', updateBufferedBar);
    video.addEventListener('loadedmetadata', updateBufferedBar);
    video.addEventListener('durationchange', updateBufferedBar);

    // Media event wiring
    video.addEventListener('play', function() { setActivated(true); cancelAnimationFrame(rafId); loop(); setStatus('playing'); });
    video.addEventListener('playing', function() { pendingPlay = false; setStatus('playing'); });
    video.addEventListener('pause', function() { pendingPlay = false; cancelAnimationFrame(rafId); updateProgressVisuals(); setStatus('paused'); });
    video.addEventListener('waiting', function() { setStatus('loading'); });
    video.addEventListener('canplay', function() { readyIfIdle(player, pendingPlay); });
    video.addEventListener('ended', function() { pendingPlay = false; cancelAnimationFrame(rafId); updateProgressVisuals(); setStatus('paused'); setActivated(false);   resetThumbnails(player);  });

    // Scrubbing (pointer events)
    if (timeline) {
      var dragging = false, wasPlaying = false, targetTime = 0, lastSeekTs = 0, seekThrottle = 180, rect = null;
      window.addEventListener('resize', function() { if (!dragging) rect = null; });
      function getFractionFromX(x) {
        if (!rect) rect = timeline.getBoundingClientRect();
        var f = (x - rect.left) / rect.width; if (f < 0) f = 0; if (f > 1) f = 1; return f;
      }
      function previewAtFraction(f) {
        if (!video.duration) return;
        var pct = f * 100;
        if (progressBar) progressBar.style.transform = 'translateX(' + (-100 + pct) + '%)';
        if (handle) handle.style.left = pct + '%';
        if (timeProgressEls.length) setText(timeProgressEls, formatTime(f * video.duration));
      }
      function maybeSeek(now) {
        if (!video.duration) return;
        if ((now - lastSeekTs) < seekThrottle) return;
        lastSeekTs = now; video.currentTime = targetTime;
      }
      function onPointerDown(e) {
        if (!video.duration) return;
        dragging = true; wasPlaying = !video.paused && !video.ended; if (wasPlaying) video.pause();
        player.setAttribute('data-timeline-drag', 'true'); rect = timeline.getBoundingClientRect();
        var f = getFractionFromX(e.clientX); targetTime = f * video.duration; previewAtFraction(f); maybeSeek(performance.now());
        timeline.setPointerCapture && timeline.setPointerCapture(e.pointerId);
        window.addEventListener('pointermove', onPointerMove, { passive: false });
        window.addEventListener('pointerup', onPointerUp, { passive: true });
        e.preventDefault();
      }
      function onPointerMove(e) {
        if (!dragging) return;
        var f = getFractionFromX(e.clientX); targetTime = f * video.duration; previewAtFraction(f); maybeSeek(performance.now()); e.preventDefault();
      }
      function onPointerUp() {
        if (!dragging) return;
        dragging = false; player.setAttribute('data-timeline-drag', 'false'); rect = null; video.currentTime = targetTime;
        if (wasPlaying) safePlay(video); else { updateProgressVisuals(); updateTimeTexts(); }
        window.removeEventListener('pointermove', onPointerMove);
        window.removeEventListener('pointerup', onPointerUp);
      }
      timeline.addEventListener('pointerdown', onPointerDown, { passive: false });
      if (handle) handle.addEventListener('pointerdown', onPointerDown, { passive: false });
    }

    // Hover/idle detection (pointer-based)
    var hoverTimer;
    var hoverHideDelay = 3000;
    function setHover(state) {
      if (player.getAttribute('data-player-hover') !== state) {
        player.setAttribute('data-player-hover', state);
      }
    }
    function scheduleHide() { clearTimeout(hoverTimer); hoverTimer = setTimeout(function() { setHover('idle'); }, hoverHideDelay); }
    function wakeControls() { setHover('active'); scheduleHide(); }
    player.addEventListener('pointerdown', wakeControls);
    document.addEventListener('fullscreenchange', wakeControls);
    document.addEventListener('webkitfullscreenchange', wakeControls);
    var trackingMove = false;
    function onPointerMoveGlobal(e) {
      var r = player.getBoundingClientRect();
      if (e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top && e.clientY <= r.bottom) wakeControls();
    }
    player.addEventListener('pointerenter', function() {
      wakeControls();
      if (!trackingMove) { trackingMove = true; window.addEventListener('pointermove', onPointerMoveGlobal, { passive: true }); }
    });
    player.addEventListener('pointerleave', function() {
      setHover('idle'); clearTimeout(hoverTimer);
      if (trackingMove) { trackingMove = false; window.removeEventListener('pointermove', onPointerMoveGlobal); }
    });

    // In-view auto play/pause (only when autoplay is true)
    if (autoplay) {
      var io = new IntersectionObserver(function(entries) {
        entries.forEach(function(entry) {
          var inView = entry.isIntersecting && entry.intersectionRatio > 0;

          if (inView) {
            if ((isLazyTrue || isLazyMeta) && !isAttached) attachMediaOnce();

            if (video.paused) {
              // we will attempt to play -> show loading until events flip to playing
              lastPauseBy = '';
              pendingPlay = true;
              setStatus('loading');
              safePlay(video);
            } else {
              // already playing; don't flash loading
              setStatus('playing');
            }
          } else {
            if (!video.paused && !video.ended) {
              lastPauseBy = 'io';
              video.pause();
              setStatus('paused'); // keep UI honest while out of view
            }
          }
        });
      }, { threshold: 0.1 });

      io.observe(player);
    }
  });

  // Helper: time/text/meta/ratio utilities
  function pad2(n) { return (n < 10 ? '0' : '') + n; }
  function formatTime(sec) {
    if (!isFinite(sec) || sec < 0) return '00:00';
    var s = Math.floor(sec), h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), r = s % 60;
    return h > 0 ? (h + ':' + pad2(m) + ':' + pad2(r)) : (pad2(m) + ':' + pad2(r));
  }
  function setText(nodes, text) { nodes.forEach(function(n){ n.textContent = text; }); }

  // Helper: Choose best HLS level by resolution --- */
  function bestLevel(levels) {
    if (!levels || !levels.length) return null;
    return levels.reduce(function(a, b) { return ((b.width||0) > (a.width||0)) ? b : a; }, levels[0]);
  }

  // Helper: Safe programmatic play
  function safePlay(video) {
    var p = video.play();
    if (p && typeof p.then === 'function') p.catch(function(){});
  }

  // Helper: Ready status guard
  function readyIfIdle(player, pendingPlay) {
    if (!pendingPlay &&
        player.getAttribute('data-player-activated') !== 'true' &&
        player.getAttribute('data-player-status') === 'idle') {
      player.setAttribute('data-player-status', 'ready');
    }
  }

  // Helper: Ratio Setter
  function setBeforeRatio(player, updateSize, w, h) {
    if (updateSize !== 'true' || !w || !h) return;
    var before = player.querySelector('[data-player-before]');
    if (!before) return;
    before.style.paddingTop = (h / w * 100) + '%';
  }
  function maybeSetRatioFromVideo(player, updateSize, video) {
    if (updateSize !== 'true') return;
    var before = player.querySelector('[data-player-before]');
    if (!before) return;
    var hasPad = before.style.paddingTop && before.style.paddingTop !== '0%';
    if (!hasPad && video.videoWidth && video.videoHeight) {
      setBeforeRatio(player, updateSize, video.videoWidth, video.videoHeight);
    }
  }

  // Helper: simple URL resolver
  function resolveUrl(base, rel) { try { return new URL(rel, base).toString(); } catch(_) { return rel; } }

  // Helper: Unified meta fetch (hls.js or native fetch)
  function getSourceMeta(src, useHlsJs) {
    return new Promise(function(resolve) {
      if (useHlsJs && window.Hls && Hls.isSupported()) {
        try {
          var tmp = new Hls();
          var out = { width: 0, height: 0, duration: NaN };
          var haveLvls = false, haveDur = false;

          tmp.on(Hls.Events.MANIFEST_PARSED, function(e, data) {
            var lvls = (data && data.levels) || tmp.levels || [];
            var best = bestLevel(lvls);
            if (best && best.width && best.height) { out.width = best.width; out.height = best.height; haveLvls = true; }
          });
          tmp.on(Hls.Events.LEVEL_LOADED, function(e, data) {
            if (data && data.details && isFinite(data.details.totalduration)) { out.duration = data.details.totalduration; haveDur = true; }
          });
          tmp.on(Hls.Events.ERROR, function(){ try { tmp.destroy(); } catch(_) {} resolve(out); });
          tmp.on(Hls.Events.LEVEL_LOADED, function(){ try { tmp.destroy(); } catch(_) {} resolve(out); });

          tmp.loadSource(src);
          return;
        } catch(_) {
          resolve({ width:0, height:0, duration:NaN });
          return;
        }
      }

      function parseMaster(masterText) {
        var lines = masterText.split(/\r?\n/);
        var bestW = 0, bestH = 0, firstMedia = null, lastInf = null;
        for (var i=0;i<lines.length;i++) {
          var line = lines[i];
          if (line.indexOf('#EXT-X-STREAM-INF:') === 0) {
            lastInf = line;
          } else if (lastInf && line && line[0] !== '#') {
            if (!firstMedia) firstMedia = line.trim();
            var m = /RESOLUTION=(\d+)x(\d+)/.exec(lastInf);
            if (m) {
              var w = parseInt(m[1],10), h = parseInt(m[2],10);
              if (w > bestW) { bestW = w; bestH = h; }
            }
            lastInf = null;
          }
        }
        return { bestW: bestW, bestH: bestH, media: firstMedia };
      }
      function sumDuration(mediaText) {
        var dur = 0, re = /#EXTINF:([\d.]+)/g, m;
        while ((m = re.exec(mediaText))) dur += parseFloat(m[1]);
        return dur;
      }

      fetch(src, { credentials: 'omit', cache: 'no-store' }).then(function(r){
        if (!r.ok) throw new Error('master');
        return r.text();
      }).then(function(master){
        var info = parseMaster(master);
        if (!info.media) { resolve({ width: info.bestW||0, height: info.bestH||0, duration: NaN }); return; }
        var mediaUrl = resolveUrl(src, info.media);
        return fetch(mediaUrl, { credentials: 'omit', cache: 'no-store' }).then(function(r){
          if (!r.ok) throw new Error('media');
          return r.text();
        }).then(function(mediaText){
          resolve({ width: info.bestW||0, height: info.bestH||0, duration: sumDuration(mediaText) });
        });
      }).catch(function(){ resolve({ width:0, height:0, duration:NaN }); });
    });
  }
}

// Helper: Reset video state on finish
function resetThumbnails(player) {
  stopThumbnailBlink();

  player.querySelectorAll(".bunny-player__video-thumbnail").forEach(t => {
    t.setAttribute("data-player-active", "false");

    const idle = t.querySelector(".bunny-player__video-thumbnail-content");
    const playing = t.querySelector(".bunny-player__video-thumbnail-content__playing");
    const textEl = t.querySelector("[data-text-play]");

    if (idle) idle.style.display = "flex";
    if (playing) playing.style.display = "none";
    if (textEl) textEl.textContent = "";
  });
}


// Initialize Bunny HTML HLS Player (Advanced)
document.addEventListener('DOMContentLoaded', function() {
  initBunnyPlayer();
});

let blinkingTl = null;

function startThumbnailBlink(player) {
  stopThumbnailBlink();
  const thumb = player.querySelector(".bunny-player__video-thumbnail[data-player-active='true']");
  if (!thumb) return;
  const blinkBlock = thumb.querySelector(".thumbnail-playing-block");
  if (!blinkBlock) return;

  blinkBlock.style.opacity = 1;
  blinkingTl = gsap.timeline({ repeat: -1, yoyo: true });
  blinkingTl.to(blinkBlock, { duration: 0.4, opacity: 0.2, ease: "power1.inOut" })
             .to(blinkBlock, { duration: 0.4, opacity: 1, ease: "power1.inOut" });
}

function stopThumbnailBlink() {
  if (blinkingTl) {
    blinkingTl.kill();
    blinkingTl = null;
  }
}

// Update the active thumbnail text
function updateThumbnailText(player, text) {
  const activeThumb = player.querySelector(".bunny-player__video-thumbnail[data-player-active='true']");
  if (!activeThumb) return;
  const textEl = activeThumb.querySelector("[data-text-play]");
  if (textEl) textEl.textContent = text;
}

// Thumbnail click to switch video
document.querySelectorAll(".bunny-player__video-thumbnail").forEach(thumb => {
  thumb.addEventListener("click", () => {
    const player = thumb.closest(".bunny-player");
    const video = player.querySelector("video");
    if (!video) return;

    // Update thumbnail UI
    player.querySelectorAll(".bunny-player__video-thumbnail").forEach(t => {
      t.setAttribute("data-player-active", "false");
      const idle = t.querySelector(".bunny-player__video-thumbnail-content");
      const playing = t.querySelector(".bunny-player__video-thumbnail-content__playing");
      if (idle) idle.style.display = "flex";
      if (playing) playing.style.display = "none";
    });
    thumb.setAttribute("data-player-active", "true");
    const idle = thumb.querySelector(".bunny-player__video-thumbnail-content");
    const playing = thumb.querySelector(".bunny-player__video-thumbnail-content__playing");
    if (idle) idle.style.display = "none";
    if (playing) playing.style.display = "flex";

    // Stop any previous blinking
    stopThumbnailBlink();

    // Pause video & reset HLS
    video.pause();
    if (player._hls) {
      try { player._hls.destroy(); } catch (_) {}
      player._hls = null;
    }

    // Load new HLS source
    const newSrc = thumb.getAttribute("data-player-src");
    if (!newSrc) return;

    const hls = new Hls({ maxBufferLength: 10 });
    hls.attachMedia(video);
    hls.on(Hls.Events.MEDIA_ATTACHED, () => hls.loadSource(newSrc));
    player._hls = hls;

    // Play once manifest is parsed
    hls.on(Hls.Events.MANIFEST_PARSED, () => {
      video.play().catch(() => {});
    });

    // Blinking indicator + update text
    video.addEventListener("play", () => {
      startThumbnailBlink(player);
      updateThumbnailText(player, "Playing");
    });
    video.addEventListener("pause", () => {
      stopThumbnailBlink();
      updateThumbnailText(player, "Paused");
    });
    video.addEventListener("ended", () => {
      stopThumbnailBlink();
      updateThumbnailText(player, "Paused");
    });
  });
});

// Auto-activate thumbnail for initially loaded video, but only when video actually plays
document.querySelectorAll('[data-bunny-player-init]').forEach(player => {
  const video = player.querySelector('video');
  if (!video) return;

  const checkInitialThumbnail = () => {
    if (!player._hls) {
      // HLS not attached yet, try next frame
      requestAnimationFrame(checkInitialThumbnail);
      return;
    }

    // Wait for MANIFEST_PARSED to ensure HLS is loaded
    player._hls.on(Hls.Events.MANIFEST_PARSED, () => {
      const currentSrc = player.getAttribute('data-player-src') || '';
      if (!currentSrc) return;

      // Listen for the actual play event
      const onPlay = () => {
        const thumb = player.querySelector(`.bunny-player__video-thumbnail[data-player-src="${currentSrc}"]`);
        if (thumb) {
          // Trigger click to activate UI (blinking, text)
          thumb.click();
        }
        video.removeEventListener('play', onPlay);
      };

      video.addEventListener('play', onPlay);
    });
  };

  checkInitialThumbnail();
});

















// GSAP Split Text Scramble
// Utility: pick a random lowercase letter NOT in the original word
function randomLetterExcluding(originalChars) {
  let char;
  const lowerOriginal = originalChars.map(c => c.toLowerCase());
  do {
    char = String.fromCharCode(97 + Math.floor(Math.random() * 26)); // a-z
  } while (lowerOriginal.includes(char));
  return char;
}

// Reusable chaotic scramble function
function scrambleText(target, finalText) {
  // 🔑 Force correct character count BEFORE splitting
  target.textContent = finalText;

  const split = new SplitText(target, { type: "chars" });
  const chars = split.chars;
  const finalChars = finalText.split("");

  const tl = gsap.timeline({
    onComplete: () => {
      chars.forEach((char, i) => {
        char.textContent = finalChars[i];
        char.style.color = "";
        char.style.opacity = "";
      });
    }
  });

  chars.forEach((charSpan, i) => {
    const flickerTimeline = gsap.timeline();
    const flickerCount = 5 + Math.floor(Math.random() * 2);

    for (let j = 0; j < flickerCount; j++) {
      const rand = Math.random();
      let newChar = finalChars[i];
      let color = "";
      let opacity = 1;

      if (rand < 0.2) color = "#ff0f00";
      else if (rand < 0.5) opacity = 0;
      else newChar = randomLetterExcluding(finalChars);

      flickerTimeline.to(charSpan, {
        duration: 0.04 + Math.random() * 0.06,
        textContent: newChar,
        color,
        opacity,
        ease: "none"
      });
    }

    flickerTimeline.to(charSpan, {
      duration: 0.05,
      textContent: finalChars[i],
      color: "",
      opacity: 1
    });

    tl.add(flickerTimeline, 0);
  });

  return tl;
}






function initChaoticHoverReducedRed() {
  document.querySelectorAll('[data-scramble-hover="link"]').forEach((wrapper) => {
    const target = wrapper.querySelector('[data-scramble-hover="target"]');

    const split = new SplitText(target, { type: "chars" });
    const chars = split.chars;
    const originalChars = chars.map(c => c.textContent);
    let isAnimating = false;

    wrapper.addEventListener("mouseenter", () => {
      if (isAnimating) return;
      isAnimating = true;

      const total = chars.length;
      const indices = Array.from(Array(total).keys()); // all characters affected

      const tl = gsap.timeline({
        onComplete: () => {
          chars.forEach((char, i) => {
            char.textContent = originalChars[i];
            char.style.color = "";
            char.style.opacity = "";
          });
          isAnimating = false;
        }
      });

      // Chaotic flicker letters for all characters
      indices.forEach((i) => {
        const charSpan = chars[i];
        const flickerTimeline = gsap.timeline({});
        const flickerCount = 5 + Math.floor(Math.random() * 2); // 5-6 flickers

        for (let j = 0; j < flickerCount; j++) {
          const rand = Math.random();
          let newChar = originalChars[i];
          let color = "";
          let opacity = 1;

          if (rand < 0.2) { 
            // 20% chance red letter (reduce red letters)
            newChar = originalChars[i];
            color = "#ff0f00";
          } else if (rand < 0.5) { 
            // 30% hidden (opacity 0)
            newChar = originalChars[i];
            opacity = 0;
          } else { 
            // 50% random letter (a-z) not in original word
            newChar = randomLetterExcluding(originalChars);
          }

          flickerTimeline.to(charSpan, {
            duration: 0.04 + Math.random() * 0.06,
            textContent: newChar,
            color: color,
            opacity: opacity,
            ease: "none"
          });
        }

        // Restore original char at end
        flickerTimeline.to(charSpan, { duration: 0.05, textContent: originalChars[i], color: "", opacity: 1 });

        tl.add(flickerTimeline, 0); // all flickers start together
      });
    });
  });
}

document.addEventListener("DOMContentLoaded", initChaoticHoverReducedRed);


// Change cursor text on work hover
const cursorTextMarquee = document.querySelector(".cursor-text");
let cursorAnimating = false;

function scrambleCursorText(newText) {
  if (!cursorTextMarquee || cursorAnimating) return;

  cursorAnimating = true;

  // Animate scramble and restore to newText
  scrambleText(cursorTextMarquee, newText);

  gsap.delayedCall(0.5, () => {
    cursorAnimating = false;
  });
}

gsap.utils.toArray(".marquee_item").forEach(item => {
  item.addEventListener("mouseenter", () => {
    scrambleCursorText("PLAY");
  });

  item.addEventListener("mouseleave", () => {
    scrambleCursorText("SCROLL");
  });
});


// Bunny Background Video
function initBunnyPlayerBackground() {
  document.querySelectorAll('[data-bunny-background-init]').forEach(function(player) {
    var src = player.getAttribute('data-player-src');
    if (!src) return;

    var video = player.querySelector('video');
    if (!video) return;

    try { video.pause(); } catch(_) {}
    try { video.removeAttribute('src'); video.load(); } catch(_) {}

    // Attribute helpers
    function setStatus(s) {
      if (player.getAttribute('data-player-status') !== s) {
        player.setAttribute('data-player-status', s);
      }
    }
    function setActivated(v) { player.setAttribute('data-player-activated', v ? 'true' : 'false'); }
    if (!player.hasAttribute('data-player-activated')) setActivated(false);

    // Flags
    var lazyMode   = player.getAttribute('data-player-lazy'); // "true" | "false" (no meta)
    var isLazyTrue = lazyMode === 'true';
    var autoplay   = player.getAttribute('data-player-autoplay') === 'true';
    var initialMuted = player.getAttribute('data-player-muted') === 'true';

    // Used to suppress 'ready' flicker when user just pressed play in lazy modes
    var pendingPlay = false;

    // Autoplay forces muted + loop; IO will drive play/pause
    if (autoplay) { video.muted = true; video.loop = true; }
    else { video.muted = initialMuted; }

    video.setAttribute('muted', '');
    video.setAttribute('playsinline', '');
    video.setAttribute('webkit-playsinline', '');
    video.playsInline = true;
    if (typeof video.disableRemotePlayback !== 'undefined') video.disableRemotePlayback = true;
    if (autoplay) video.autoplay = false;

    var isSafariNative = !!video.canPlayType('application/vnd.apple.mpegurl');
    var canUseHlsJs    = !!(window.Hls && Hls.isSupported()) && !isSafariNative;

    // Attach media only once (for actual playback)
    var isAttached = false;
    var userInteracted = false;
    var lastPauseBy = ''; // 'io' | 'manual' | ''
    function attachMediaOnce() {
      if (isAttached) return;
      isAttached = true;

      if (player._hls) { try { player._hls.destroy(); } catch(_) {} player._hls = null; }

      if (isSafariNative) {
        video.preload = isLazyTrue ? 'none' : 'auto';
        video.src = src;
        video.addEventListener('loadedmetadata', function() {
          readyIfIdle(player, pendingPlay);
        }, { once: true });
      } else if (canUseHlsJs) {
        var hls = new Hls({ maxBufferLength: 10 });
        hls.attachMedia(video);
        hls.on(Hls.Events.MEDIA_ATTACHED, function() { hls.loadSource(src); });
        hls.on(Hls.Events.MANIFEST_PARSED, function() {
          readyIfIdle(player, pendingPlay);
        });
        player._hls = hls;
      } else {
        video.src = src;
      }
    }

    // Initialize based on lazy mode
    if (isLazyTrue) {
      video.preload = 'none';
    } else {
      attachMediaOnce();
    }

    // Toggle play/pause
    function togglePlay() {
      userInteracted = true;
      if (video.paused || video.ended) {
        if (isLazyTrue && !isAttached) attachMediaOnce();
        pendingPlay = true;
        lastPauseBy = '';
        setStatus('loading');
        safePlay(video);
      } else {
        lastPauseBy = 'manual';
        video.pause();
      }
    }

    // Toggle mute
    function toggleMute() {
      video.muted = !video.muted;
      player.setAttribute('data-player-muted', video.muted ? 'true' : 'false');
    }

    // Controls (delegated)
    player.addEventListener('click', function(e) {
      var btn = e.target.closest('[data-player-control]');
      if (!btn || !player.contains(btn)) return;
      var type = btn.getAttribute('data-player-control');
      if (type === 'play' || type === 'pause' || type === 'playpause') togglePlay();
      else if (type === 'mute') toggleMute();
    });

    // Media event wiring
    video.addEventListener('play', function() { setActivated(true); setStatus('playing'); });
    video.addEventListener('playing', function() { pendingPlay = false; setStatus('playing'); });
    video.addEventListener('pause', function() { pendingPlay = false; setStatus('paused'); });
    video.addEventListener('waiting', function() { setStatus('loading'); });
    video.addEventListener('canplay', function() { readyIfIdle(player, pendingPlay); });
    video.addEventListener('ended', function() { pendingPlay = false; setStatus('paused'); setActivated(false); });

    // In-view auto play/pause (only when autoplay is true)
    if (autoplay) {
      if (player._io) { try { player._io.disconnect(); } catch(_) {} }
      var io = new IntersectionObserver(function(entries) {
        entries.forEach(function(entry) {
          var inView = entry.isIntersecting && entry.intersectionRatio > 0;
          if (inView) {
            if (isLazyTrue && !isAttached) attachMediaOnce();
            if ((lastPauseBy === 'io') || (video.paused && lastPauseBy !== 'manual')) {
              setStatus('loading');
              if (video.paused) togglePlay();
              lastPauseBy = '';
            }
          } else {
            if (!video.paused && !video.ended) {
              lastPauseBy = 'io';
              video.pause();
            }
          }
        });
      }, { threshold: 0.1 });
      io.observe(player);
      player._io = io;
    }
  });

  // Helper: Ready status guard
  function readyIfIdle(player, pendingPlay) {
    if (!pendingPlay &&
        player.getAttribute('data-player-activated') !== 'true' &&
        player.getAttribute('data-player-status') === 'idle') {
      player.setAttribute('data-player-status', 'ready');
    }
  }

  // Helper: safe programmatic play
  function safePlay(video) {
    var p = video.play();
    if (p && typeof p.then === 'function') p.catch(function(){});
  }
}

// Initialize Bunny HTML HLS Player (Background)
document.addEventListener('DOMContentLoaded', function() {
  initBunnyPlayerBackground();
});




// Logo Wall
function initLogoWallCycle() {
  const loopDelay = 1.5;   // Loop Duration
  const duration  = 0.9;   // Animation Duration

  document.querySelectorAll('[data-logo-wall-cycle-init]').forEach(root => {
    const list   = root.querySelector('[data-logo-wall-list]');
    const items  = Array.from(list.querySelectorAll('[data-logo-wall-item]'));

    const shuffleFront = root.getAttribute('data-logo-wall-shuffle') !== 'false';
    const originalTargets = items
      .map(item => item.querySelector('[data-logo-wall-target]'))
      .filter(Boolean);

    let visibleItems   = [];
    let visibleCount   = 0;
    let pool           = [];
    let pattern        = [];
    let patternIndex   = 0;
    let tl;

    function isVisible(el) {
      return window.getComputedStyle(el).display !== 'none';
    }

    function shuffleArray(arr) {
      const a = arr.slice();
      for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
      }
      return a;
    }

    function setup() {
      if (tl) {
        tl.kill();
      }
      visibleItems = items.filter(isVisible);
      visibleCount = visibleItems.length;

      pattern = shuffleArray(
        Array.from({ length: visibleCount }, (_, i) => i)
      );
      patternIndex = 0;

      // remove all injected targets
      items.forEach(item => {
        item.querySelectorAll('[data-logo-wall-target]').forEach(old => old.remove());
      });

      pool = originalTargets.map(n => n.cloneNode(true));

      let front, rest;
      if (shuffleFront) {
        const shuffledAll = shuffleArray(pool);
        front = shuffledAll.slice(0, visibleCount);
        rest  = shuffleArray(shuffledAll.slice(visibleCount));
      } else {
        front = pool.slice(0, visibleCount);
        rest  = shuffleArray(pool.slice(visibleCount));
      }
      pool = front.concat(rest);

      for (let i = 0; i < visibleCount; i++) {
        const parent =
          visibleItems[i].querySelector('[data-logo-wall-target-parent]') ||
          visibleItems[i];
        parent.appendChild(pool.shift());
      }

      tl = gsap.timeline({ repeat: -1, repeatDelay: loopDelay });
      tl.call(swapNext);
      tl.play();
    }

    function swapNext() {
      const nowCount = items.filter(isVisible).length;
      if (nowCount !== visibleCount) {
        setup();
        return;
      }
      if (!pool.length) return;

      const idx = pattern[patternIndex % visibleCount];
      patternIndex++;

      const container = visibleItems[idx];
      const parent =
        container.querySelector('[data-logo-wall-target-parent]') ||
        container.querySelector('*:has(> [data-logo-wall-target])') ||
        container;
      const existing = parent.querySelectorAll('[data-logo-wall-target]');
      if (existing.length > 1) return;

      const current  = parent.querySelector('[data-logo-wall-target]');
      const incoming = pool.shift();

      gsap.set(incoming, { yPercent: 50, autoAlpha: 0 });
      parent.appendChild(incoming);

      if (current) {
        gsap.to(current, {
          yPercent: -50,
          autoAlpha: 0,
          duration,
          ease: "expo.inOut",
          onComplete: () => {
            current.remove();
            pool.push(current);
          }
        });
      }

      gsap.to(incoming, {
        yPercent: 0,
        autoAlpha: 1,
        duration,
        delay: 0.1,
        ease: "expo.inOut"
      });
    }

    setup();

    ScrollTrigger.create({
      trigger: root,
      start: 'top bottom',
      end: 'bottom top',
      onEnter:     () => tl.play(),
      onLeave:     () => tl.pause(),
      onEnterBack: () => tl.play(),
      onLeaveBack: () => tl.pause()
    });

    document.addEventListener('visibilitychange', () =>
      document.hidden ? tl.pause() : tl.play()
    );
  });
}

// Initialize Logo Wall Cycle
document.addEventListener('DOMContentLoaded', () => {
  initLogoWallCycle();
});