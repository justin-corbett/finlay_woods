// Initialize GSAP
gsap.registerPlugin(ScrollTrigger, Flip, Observer, SplitText, CustomEase, ScrollToPlugin);

// Lenis (with GSAP Scroltrigger)
const lenis = new Lenis();
lenis.on('scroll', ScrollTrigger.update);
gsap.ticker.add((time) => {lenis.raf(time * 1000);});
gsap.ticker.lagSmoothing(0);


// Show/hide grid w/ Shift + G
$(function () {
  const $wrap = $(".grid-wrap");
  let tl = null; // active timeline instance

  // Ensure wrapper starts hidden (your CSS should already do this)
  $wrap.css("display", "none");

  function buildOpenTimeline() {
    // Clean up any previous timeline
    if (tl) { tl.kill(); tl = null; }

    const cols = $wrap.find(".grid-column").get(); // fresh node list every time

    // Clear any inline transforms from prior runs
    gsap.set(cols, { clearProps: "transform" });

    tl = gsap.timeline({
      defaults: { duration: 0.6, ease: "power2.out" },
      onStart() {
        $wrap.css("display", "flex");
      },
      onReverseComplete() {
        $wrap.css("display", "none");
        // Fully reset columns so next open starts clean
        gsap.set(cols, { clearProps: "transform" });
        // Kill timeline to avoid stale state
        tl.kill();
        tl = null;
      }
    });

    // Smooth, jank-free column grow
    tl.fromTo(
      cols,
      { scaleY: 0 },
      { scaleY: 1, stagger: { each: 0.05, from: "left" } }
    );

    return tl;
  }

  function isHidden() {
    return $wrap.css("display") === "none";
  }

  $(document).on("keydown", function (e) {
    if (e.shiftKey && String(e.key).toLowerCase() === "g") {
      // Prevent fighting the current animation
      if (tl && tl.isActive()) return;

      if (isHidden()) {
        // Open: (re)build fresh timeline and play
        buildOpenTimeline().play(0);
      } else {
        // Close: reverse current tl if present, otherwise quick hide fallback
        if (tl) {
          tl.reverse();
        } else {
          // Rare edge: got visible without a tl
          const cols = $wrap.find(".grid-column").get();
          gsap.set(cols, { clearProps: "transform" });
          $wrap.css("display", "none");
        }
      }
    }
  });
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

// Horizontal Scroll

// Sticky section heights
function setTrackHeights() {
$(".horizontal-scroll_section-height").each(function () {
  let trackWidth = $(this).find(".horizontal-scroll_track").outerWidth();
  $(this).height(trackWidth);
});
}
setTrackHeights();
window.addEventListener("resize", setTrackHeights);

// Build your horizontal timeline
let horizontalMainTl = gsap.timeline({
scrollTrigger: {
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
.to(".projects-timeline-pin-wrapper", { opacity: "100%", ease: "power4.out"
}, 0);

// Homepage Timeline Markers Animate on Pinhead Crossover
let markers = document.querySelectorAll(".project-timeline-marker");
markers.forEach(marker => {
  gsap.set(marker, { scaleY: 1, transformOrigin: "50% 100%", }); // Set the initial height

  let tl = gsap.timeline({
    scrollTrigger: {
      trigger: marker,
      containerAnimation: horizontalMainTl,
      start: "left right",
      end: "left left",
      scrub: true,
      onUpdate: self => {
        let markerBounds = marker.getBoundingClientRect();
        let pinBounds = document.querySelector(".projects-timeline-pin-wrapper").getBoundingClientRect();
        let outerPinBounds = document.querySelector(".projects-timeline-pin-outer-wrapper").getBoundingClientRect();
        let innerPinBounds = document.querySelector(".projects-timeline-pin-inner-wrapper").getBoundingClientRect();

        if (markerBounds.left < innerPinBounds.right && markerBounds.right > innerPinBounds.left) {
          // Inner pin → 2em
          gsap.to(marker, { scaleY: 3.75, duration: 0.2, opacity: 1, ease: "power1.out" });
        } else if (markerBounds.left < outerPinBounds.right && markerBounds.right > outerPinBounds.left) {
          // Outer wrapper → 1.5em
          gsap.to(marker, { scaleY: 2.75, duration: 0.2, opacity: 0.5, ease: "power1.out" });
        } else if (markerBounds.left < pinBounds.right && markerBounds.right > pinBounds.left) {
          // Pin wrapper → 1.25em
          gsap.to(marker, { scaleY: 1.75, duration: 0.2, opacity: 0.3, ease: "power1.out" });
        } else {
          // Reset → 0.75em
          gsap.to(marker, { scaleY: 1, duration: 0.2, opacity: 0.1, ease: "power1.out" });
        }
      }
    }
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
  const minX = 7.5 * bodyFontSize;
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
  // Select all elements with the class 'recording-dot-wrapper'
  const recordingDots = document.querySelectorAll('.recording-dot-wrapper');

  // Use GSAP to create an infinite flashing animation
  gsap.timeline({ repeat: -1 })
    .to(recordingDots, { opacity: 1, duration: 1 }) // On for 1 second
    .to(recordingDots, { opacity: 0, duration: 1 }) // Fade out for 0.5 second
    .to(recordingDots, { opacity: 0, duration: 0.125 }) // Off for 0.5 second
    .to(recordingDots, { opacity: 1, duration: 1 }); // Off for 0.5 second
});


// Set initial opacity of all .work-corners elements to 0
gsap.set(".work-corners", { opacity: 0 });


// Marquee Item Hover Animation
document.querySelectorAll('.marquee_item').forEach(item => {
  const image       = item.querySelector('.marquee_img');
  const workCorners = item.querySelector('.work-corners');
  const videoSelf   = item.querySelector('.marquee_video-preview');

  const allItems = item.parentElement?.querySelectorAll('.marquee_item') || [];

  item.addEventListener('mouseenter', () => {
    // Visuals
    gsap.to(image, { scale: 0.8, duration: 0.5, ease: "power4.out" });
    gsap.to(workCorners, { opacity: 1, duration: 0.5, ease: "power4.out", delay: 0.25 });
    gsap.to(allItems, { filter: "grayscale(100%)", duration: 0.5 });
    gsap.to(item, { filter: "grayscale(0%)", duration: 1 });

    // Keep autoplay on self
    if (videoSelf) {
      videoSelf.setAttribute("autoplay", "");
      videoSelf.play?.();
    }

    // Remove autoplay from siblings
    allItems.forEach(sib => {
      if (sib === item) return;
      const v = sib.querySelector('.marquee_video-preview');
      if (!v) return;
      v.removeAttribute("autoplay");
      v.pause?.();
      // Optionally reset
      // v.currentTime = 0;
    });
  });

  item.addEventListener('mouseleave', () => {
    // Visuals
    gsap.to(image, { scale: 1, duration: 0.5, ease: "power4.out" });
    gsap.to(workCorners, { opacity: 0, duration: 0.5, ease: "power4.out" });
    gsap.to(allItems, { filter: "grayscale(0%)", duration: 0.5 });

    // Siblings get autoplay back
    allItems.forEach(sib => {
      if (sib === item) return;
      const v = sib.querySelector('.marquee_video-preview');
      if (!v) return;
      v.setAttribute("autoplay", "");
      v.play?.();
    });

    // Self just keeps autoplay (no change)
  });
});


// Navigation + Hover (split both main & hover so close animates whichever is visible)
document.addEventListener("DOMContentLoaded", () => {
  const navPanel = document.querySelector(".navigation-dropdown-slide"); // background panel
  const navMenu  = document.querySelector(".nav_menu");                  // wrapper
  const navBtn   = document.querySelector(".nav_menu-button");           // toggle button
  const navLinks = Array.from(document.querySelectorAll(".nav_link"));   // each nav item

  // selectors for button + borders + cursor parts + extras
  const menuLines      = document.querySelectorAll(".menu-button-line");
  const menuSeparators = document.querySelectorAll(".menu-button-separator");
  const navBorders     = document.querySelectorAll(".nav-border");
  const cursorSquares  = document.querySelectorAll(".cursor-square-left, .cursor-square-center");
  const cursorLines    = document.querySelectorAll(".cursor-line-h, .cursor-line-v");
  const cursorText     = document.querySelectorAll(".cursor-text");
  const logo           = document.querySelectorAll(".nav-logo");
  const time           = document.querySelectorAll(".time-box");


  if (!navPanel || !navMenu || !navBtn || !navLinks.length) return;

  // -------- Speed controls (1 = normal) --------
  const OPEN_SPEED  = 1;     // playback speed when opening
  const CLOSE_SPEED = 1.5;   // playback speed when closing

  // ---- Build per-link hover timelines (store on the element) ----
  navLinks.forEach(link => {
    const main  = link.querySelector(".nav_link-main");
    const hover = link.querySelector(".nav_link-hover");
    const mask  = link.querySelector(".nav_link-mask");
    if (!main || !hover || !mask) return;

    // Ensure proper stacking once (safe if already in CSS)
    mask.style.position  ||= "relative";
    mask.style.overflow  ||= "hidden";
    hover.style.position ||= "absolute";
    hover.style.left = "0"; hover.style.top = "0"; hover.style.width = "100%";

    // Make sure hover starts below (CSS can do this too)
    if (!hover.style.transform) gsap.set(hover, { yPercent: 100 });

    const htl = gsap.timeline({
      paused: true,
      defaults: { duration: 0.45, ease: "power3.out", overwrite: "auto" }
    });
    htl.to(main,  { yPercent: -100 }, 0)
       .fromTo(hover, { yPercent: 100 }, { yPercent: 0, immediateRender: false }, 0);

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
    mask: "words",
    wordClass: "nav-word",
    reduceWhiteSpace: false
  }) || SplitText.create(splitTargets, {
    type: "words",
    mask: "words",
    wordsClass: "nav-word",
    reduceWhiteSpace: false
  });

  const allWords = splitTargets.flatMap(el => Array.from(el.querySelectorAll(".nav-word")));

  // ---- Prep states ----
  gsap.set(navMenu,  { display: "none" });
  gsap.set(navPanel, { x: "-100%" });
  gsap.set(allWords, { yPercent: 110 });

  // ---- Open/Close timeline ----
  const tl = gsap.timeline({ paused: true, defaults: { ease: "power3.out" } });

  // disable pointer events on navbar_container at start
  tl.set(navMenu, { display: "block" }, 0)
    .to(navPanel, { duration: 1, x: "0%", ease: "power3.inOut" })
    .to(allWords, {
      duration: 0.7,
      yPercent: 0,
      stagger: { amount: 0.5, from: "start" }
    }, "<50%")
    // animate menu button parts, nav borders, time-square background to black
    .to(
      [menuLines, menuSeparators, navBorders, ".time-square"],
      { backgroundColor: "#000", duration: 0.5 },
      "<"
    )
    // fade out cursor elements and text
    .to([cursorSquares, cursorLines, cursorText], { opacity: 0, duration: 0.5 }, "<")
    // animate nav-location text color to black
    .to(".nav-location", { color: "#000", duration: 0.5 }, "<")
    // animate logo text color to black
    .to([logo], { color: "#000", duration: 0.5 }, "<")
    // animate time text and background
    .to([time], { color: "#FFFFFF", backgroundColor: "#000", duration: 0.5 }, "<")

    // re-enable pointer events after open finishes
    .set(".navbar_container", { pointerEvents: "auto" });

  // reset navMenu visibility when completely closed
  tl.eventCallback("onReverseComplete", () => {
    gsap.set(navMenu, { display: "none" });
    window.lenis?.start?.();
  });

  // ---- Toggle helpers (with timeScale for speed control) ----
  let isOpen = false;

  const openNav = () => {
    navLinks.forEach(l => l._hoverTl?.timeScale(CLOSE_SPEED).reverse(0));
    window.lenis?.stop?.();
    tl.timeScale(OPEN_SPEED).play(0);
    isOpen = true;
  };

  const closeNav = () => {
    navLinks.forEach(l => l._hoverTl?.timeScale(CLOSE_SPEED).reverse());
    tl.timeScale(CLOSE_SPEED).reverse();
    isOpen = false;
  };

  navBtn.addEventListener("click", (e) => {
    e.preventDefault();
    isOpen ? closeNav() : openNav();

    navBtn.setAttribute("aria-expanded", isOpen ? "true" : "false");
    navMenu.setAttribute("aria-hidden", isOpen ? "false" : "true");
  });

  // expose if needed elsewhere
  window.navOpenTl = tl;
});


// Nav link hover
document.addEventListener("DOMContentLoaded", () => {
  const links = document.querySelectorAll(".nav_link");
  if (!links.length) return;

  links.forEach(link => {
    const main  = link.querySelector(".nav_link-main");
    const hover = link.querySelector(".nav_link-hover");
    if (!main || !hover) return;

    // timeline (no autoAlpha, no initial set)
    const tl = gsap.timeline({ paused: true, defaults: { duration: 0.3, ease: "power3.inOut" }});
    tl.to(main,  { yPercent: -100 }, 0)
      .to(hover, { yPercent: -100 }, 0);

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

  // Ensure the bar scales from the top
  gsap.set(progressBar, { scaleY: 0, transformOrigin: "top center" });

  // Animate the progress bar as you scroll
  gsap.to(progressBar, {
    scaleY: 1,
    ease: 'none',
    scrollTrigger: {
      trigger: document.body,
      start: 'top top',
      end: 'bottom bottom',
      scrub: 0.5,
    },
  });

  // Click listener to scroll vertically
  progressBarWrap.addEventListener('click', (event) => {
    const clickY = event.clientY; // click position vertically
    const progress = clickY / progressBarWrap.offsetHeight; // % down the bar
    const scrollPosition = progress * (document.body.scrollHeight - window.innerHeight);
  
    gsap.to(window, {
      scrollTo: scrollPosition,
      duration: 0.725,
      ease: 'power3.out',
    });
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

gsap.registerPlugin(SplitText);

// Utility: pick a random lowercase letter NOT in the original word
function randomLetterExcluding(originalChars) {
  let char;
  const lowerOriginal = originalChars.map(c => c.toLowerCase());
  do {
    char = String.fromCharCode(97 + Math.floor(Math.random() * 26)); // a-z
  } while (lowerOriginal.includes(char));
  return char;
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
