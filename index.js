gsap.registerPlugin(ScrollTrigger);

ScrollTrigger.defaults({
  markers: false,
});

/*
// Image scale full projects
$(".section-spacer-projects_img").each(function (index) {
  let triggerElement = $(this);
  let targetElement = $(".image-full_screen-projects");

  let tl = gsap.timeline({
    scrollTrigger: {
      trigger: triggerElement,
      // trigger element - viewport
      start: "top bottom",
      end: "bottom top",
      scrub: 1,
    },
  });
  tl.to(targetElement, {
    scale: "1",
    duration: 1,
  });
});

// Image scale Full About
$(".section-spacer-about_img").each(function (index) {
  let triggerElement = $(this);
  let targetElement = $(".image-full_screen-about");

  let tl = gsap.timeline({
    scrollTrigger: {
      trigger: triggerElement,
      // trigger element - viewport
      start: "top bottom",
      end: "bottom top",
      scrub: 1,
    },
  });
  tl.to(targetElement, {
    scale: "1",
    duration: 1,
  });
});

// About image scale (with scrubbing)
$(".about-image-wrapper").each(function (index) {
  let triggerElement = $(this);
  let targetElement = $(".about-image");

  let tl = gsap.timeline({
    scrollTrigger: {
      trigger: triggerElement,
      // trigger element - viewport
      start: "top bottom",
      end: "bottom top",
      scrub: 1, // Scrubbing
    },
  });
  tl.to(targetElement, {
    scale: "1",
    duration: 1,
  });
});
*/

// Logo Scale
$(".section-hero_home").each(function (index) {
  let triggerElement = $(this);
  let targetElement = $(".nav_logo");

  let tl = gsap.timeline({
    scrollTrigger: {
      trigger: triggerElement,
      // trigger element - viewport
      start: "top top",
      end: "bottom top",
      scrub: 1,
    },
  });
  tl.to(targetElement, {
    y: "0%",
    duration: 1,
    ease: 'power3.out',
  });
});

$(".section-hero_home").each(function (index) {
  let triggerElement = $(this);
  let targetElement = $(".nav_logo-text");

  let tl = gsap.timeline({
    scrollTrigger: {
      trigger: triggerElement,
      // trigger element - viewport
      start: "top top",
      end: "bottom top",
      scrub: 1,
    },
  });
  tl.to(targetElement, {
    fontSize: "2EM",
    duration: 1,
  });
});


// Loader 
window.addEventListener("load", function() {
  const scrollTopButton = document.querySelector('.scroll-top');
  
  if (scrollTopButton) {
    const clickEvent = new Event('click');
    scrollTopButton.dispatchEvent(clickEvent);
  }
});

document.addEventListener("DOMContentLoaded", function() {
  // Your code to be executed when the page starts loading
  gsap.to(".loader-text", {
    y: "0",
    duration: 0.2,
    delay: 0.3,
    ease: 'power3.out'
  	});
});

window.addEventListener("load", loader);

/*
function loader() {

  // Add a delay before stopping the scroll (adjust the delay time as needed)
  setTimeout(function() {
    window.SScroll.call.stop();
  }, 1000); // 1000 milliseconds = 1 second
  
  // get references to the elements we want to animate
  const titleTexts = document.querySelectorAll(".loader-title");
  const titleWrap = titleTexts[0].parentNode;
  const loaderBackground = document.querySelectorAll(".loader_background");

  const tl = gsap.timeline({
    onComplete: () => {
      // allow scroll when animation completes
      gsap.set("body", { overflow: "auto" });
      gsap.set(".loader", { display: "none" });
      window.SScroll.call.start();
    },
  });

  // prevent flash of .main container on load
  // works in tandem with <style> in page settings code
  gsap.set(".main-wrapper", { visibility: "visible" });
  gsap.set(".loader-text", { y: "100%" })
  
  gsap.registerEffect({
    name: "swingUp",
    effect: (targets, config) => {
      return gsap.from(targets, {
        duration: config.duration,
        autoAlpha: 0, // FOUC - visibility -> visible when opacity > 0
        yPercent: 100,
        rotateZ: 0,
        stagger: 0.2,
        ease: 'power3.out',
      });
    },
  	defaults: { duration: 0.5 },
  	extendTimeline: true, // allows nice timeline syntax
	});

  tl
  	.to(".loader-text", {
    y: "-100%",
    duration: 0.2,
    ease: 'power3.out'
  	})
    // swing up "RESTOCK"
    .swingUp(titleTexts[0])
    // move title wrap up 33% y direction
    .fromTo(titleWrap, { yPercent: 66 }, { yPercent: 33, duration: 0.5, ease: 'power3.out' })
    // swing up "REORDER"
    .swingUp(titleTexts[1],  "<+0.1")
    
    // move title wrap up to its zero position
    .to(titleWrap, { yPercent: 0, duration: 1, ease: 'power3.out' }, "<+0.5")
    // swing up "REPEAT"
    .swingUp(titleTexts[2], { duration: 1 }, "<+0.1")
    // bring main container into view and animate border-radius
    .to(".loader_background", {
      yPercent: -100,
      duration: 0.6,
      delay: 0.8,
      ease: 'power3.out',
    })
    .to(".loader-title", {
      autoAlpha: 0,
      duration: 0.2,
      delay: 0,
      ease: 'power3.out',
    }, "<+0.05")
  
}
*/

function loader() {

  // Add a delay before stopping the scroll (adjust the delay time as needed)
  setTimeout(function() {
    window.SScroll.call.stop();
  }, 1000); // 1000 milliseconds = 1 second
  
  // get references to the elements we want to animate
  const titleTexts = document.querySelectorAll(".loader-title");
  const titleWrap = titleTexts[0].parentNode;
  const loaderBackground = document.querySelectorAll(".loader_background");

  const tl = gsap.timeline({
    onComplete: () => {
      // allow scroll when animation completes
      gsap.set("body", { overflow: "auto" });
      gsap.set(".loader", { display: "none" });
      window.SScroll.call.start();
    },
  });

  // prevent flash of .main container on load
  // works in tandem with <style> in page settings code
  gsap.set(".main-wrapper", { visibility: "visible" });
  
  gsap.registerEffect({
    name: "swingUp",
    effect: (targets, config) => {
      return gsap.from(targets, {
        duration: config.duration,
        autoAlpha: 0, // FOUC - visibility -> visible when opacity > 0
        yPercent: 100,
        rotateZ: 0,
        stagger: 0,
        ease: 'power1.out',
      });
    },
  	defaults: { duration: 0.5 },
  	extendTimeline: true, // allows nice timeline syntax
	});

  tl
  	.to(".loader-text", {
    y: "100%",
    opacity: 0,
    duration: 0.5,
    ease: 'power1.out'
  	})

    // swing up "Loading..."
    .swingUp(titleTexts[0],"<-0.4")

    // move title wrap up 33% y direction
    .fromTo(titleWrap, { yPercent: 100 }, { yPercent: 66, duration: 0.5, ease: 'power1.out' })

    // swing up "VIDEOGRAPHY"
    .swingUp(titleTexts[1],  "<+0")

    // move title wrap up to its zero position
    .to(titleWrap, { yPercent: 0, duration: 1, ease: 'power1.out' }, "<+0")

    // swing up "FINLAY WOODS"
    .swingUp(titleTexts[2], { duration: 0.5 }, "<+0.0")

    // bring main container into view and animate border-radius
    .to(".loader_background", {
      xPercent: -100,
      duration: 0.6,
      delay: 0.8,
      ease: 'power1.out',
    })
    .to(".loader-title", {
      autoAlpha: 0,
      duration: 0.2,
      delay: 0,
      ease: 'power1.out',
    }, "<+0.0")
  
}

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


// Projects hover, add class
document.addEventListener('DOMContentLoaded', () => {
 document.querySelectorAll('.collection-projects-item').forEach(trigger => {
  trigger.addEventListener('mouseover', function(){ 
  document.querySelectorAll('.title-projects').forEach(target => 		     		 	 target.classList.add('is-active'));
  });
 }); 
 
 document.querySelectorAll('.collection-projects-item').forEach(trigger => {
  trigger.addEventListener('mouseout', function(){ 
  document.querySelectorAll('.title-projects').forEach(target => 							target.classList.remove('is-active'));

  });
 }); 
});

// Horizontal scroll
let tlMain = gsap
  .timeline({
    scrollTrigger: {
      trigger: ".section-height",
      start: "top top",
      end: "98% bottom",
      scrub: 1
    }
  })
  .to(".track", {
    xPercent: -100,
    ease: "none"
  });
  
// hero photo
gsap
  .timeline({
    scrollTrigger: {
      trigger: ".hero-panel",
      containerAnimation: tlMain,
      start: "left right",
      end: "right left",
      scrub: true
    }
  })
  .to(".hero-panel_img", { scale: 1 }, 0);
  

// Optional - Set sticky section heights based on inner content width
// Makes scroll timing feel more natural
function setTrackHeights() {
  $(".section-height").each(function (index) {
    let trackWidth = $(this).find(".track").outerWidth();
    $(this).height(trackWidth);
  });
}
setTrackHeights();
window.addEventListener("resize", function () {
  setTrackHeights();
});

// Scroll animation for projects background
gsap.timeline({
  scrollTrigger: {
      trigger: ".section-height",
      start: "top top",
      end: "30% bottom",
      scrub: 1
  }
})
.to(".projects-bg-slide", {
  x: 0,
  ease: "power1.out" // You can adjust the ease as needed
});

/*
// Scroll animation for about background
gsap.timeline({
  scrollTrigger: {
      trigger: ".section-height",
      start: "middle top",
      end: "bottom+100vh bottom",
      scrub: 1
  }
})
.to(".about-bg-slide", {
  y: 0,
  ease: "none"
 // You can adjust the ease as needed
});
*/

