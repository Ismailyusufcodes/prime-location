/* Prime Location — interactions
   Motion modelled on the recorded reference walkthrough. */
(function () {
  "use strict";

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var qaMode = /(\?|&)qa=1/.test(window.location.search);
  var clamp = function (v, min, max) { return Math.min(max, Math.max(min, v)); };
  var html = document.documentElement;
  var body = document.body;

  if (qaMode) {
    html.classList.add("qa");
    Array.prototype.forEach.call(document.querySelectorAll('img[loading="lazy"]'), function (img) {
      img.loading = "eager";
    });
  }

  /* ---------------------------------------------------------
     Word splitter (blur-reveal typography)
     --------------------------------------------------------- */
  function splitWords(root) {
    var nodes = Array.prototype.slice.call(root.childNodes);
    root.textContent = "";
    nodes.forEach(function (node) {
      if (node.nodeType === 3) {
        node.textContent.split(/(\s+)/).forEach(function (part) {
          if (!part) return;
          if (/^\s+$/.test(part)) {
            root.appendChild(document.createTextNode(part));
            return;
          }
          var w = document.createElement("span");
          w.className = "w";
          var wi = document.createElement("span");
          wi.className = "wi";
          wi.textContent = part;
          w.appendChild(wi);
          root.appendChild(w);
        });
      } else if (node.nodeType === 1) {
        if (node.tagName === "BR") {
          root.appendChild(node);
          return;
        }
        var word = document.createElement("span");
        word.className = "w";
        var inner = document.createElement("span");
        inner.className = "wi";
        inner.appendChild(node);
        word.appendChild(inner);
        root.appendChild(word);
      }
    });
    Array.prototype.forEach.call(root.querySelectorAll(".w"), function (w, i) {
      w.style.setProperty("--i", i);
    });
  }

  if (!reduceMotion) {
    Array.prototype.forEach.call(document.querySelectorAll("[data-split]"), splitWords);
  }

  /* ---------------------------------------------------------
     Page-load intro
     --------------------------------------------------------- */
  var intro = document.querySelector("[data-intro]");
  var introDone = false;

  function showBooking() {
    var booking = document.querySelector("[data-booking]");
    if (booking) booking.classList.add("is-visible");
  }

  function finishIntro(instant) {
    if (introDone) return;
    introDone = true;
    html.classList.remove("is-loading");
    html.classList.add("is-ready");
    body.classList.remove("is-intro");
    if (intro) {
      if (instant) {
        intro.parentNode.removeChild(intro);
      } else {
        window.setTimeout(function () {
          if (intro.parentNode) intro.parentNode.removeChild(intro);
        }, 1200);
      }
    }
    window.setTimeout(showBooking, instant ? 0 : 900);
  }

  var seenIntro = false;
  try {
    seenIntro = window.sessionStorage.getItem("pl-intro") === "1";
  } catch (err) { seenIntro = false; }

  if (!intro || reduceMotion || qaMode || seenIntro) {
    finishIntro(true);
  } else {
    html.classList.add("is-loading");
    body.classList.add("is-intro");
    try { window.sessionStorage.setItem("pl-intro", "1"); } catch (err) {}

    var MIN_INTRO = 2100;
    var MAX_INTRO = 7000;
    var introStart = window.performance && performance.now ? performance.now() : Date.now();
    var introProgress = 0;
    var introExited = false;
    var introTimer = null;

    function setIntroProgress(ratio) {
      introProgress = Math.max(introProgress, clamp(ratio, 0, 1));
      intro.style.setProperty("--intro-progress", introProgress.toFixed(3));
    }

    function introExit() {
      if (introExited) return;
      introExited = true;
      if (introTimer) window.clearInterval(introTimer);
      intro.classList.add("is-out");
      html.classList.remove("is-loading");
      window.setTimeout(function () {
        html.classList.add("is-ready");
        body.classList.remove("is-intro");
        window.setTimeout(function () {
          if (intro.parentNode) intro.parentNode.removeChild(intro);
        }, 1200);
        window.setTimeout(showBooking, 500);
        introDone = true;
      }, 320);
    }

    function introReadyCheck() {
      if (introExited) return;
      var now = window.performance && performance.now ? performance.now() : Date.now();
      if (introProgress >= 1 && now - introStart >= MIN_INTRO) introExit();
    }

    /* preload the assets that sit above and just below the fold */
    var PRELOAD = [
      "assets/img/hero-lagos.jpg",
      "assets/img/hero-2.jpg",
      "assets/img/hero-3.jpg",
      "assets/img/card-development.jpg",
      "assets/img/hood-lekki.jpg"
    ];
    var unitsTotal = PRELOAD.length + 1; /* + fonts */
    var unitsDone = 0;

    function unitDone() {
      unitsDone += 1;
      setIntroProgress(unitsDone / unitsTotal);
      introReadyCheck();
    }

    setIntroProgress(0.04);

    PRELOAD.forEach(function (src) {
      var img = new Image();
      img.onload = unitDone;
      img.onerror = unitDone;
      img.src = src;
    });

    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(unitDone, unitDone);
    } else {
      window.setTimeout(unitDone, 300);
    }

    introTimer = window.setInterval(introReadyCheck, 100);

    /* hard ceiling: never hold the page hostage */
    window.setTimeout(function () {
      setIntroProgress(1);
      introExit();
    }, MAX_INTRO);
  }

  /* ---------------------------------------------------------
     Header state
     --------------------------------------------------------- */
  var header = document.querySelector("[data-header]");
  var progressBar = document.querySelector("[data-progress]");
  var lastScrollY = window.scrollY || window.pageYOffset;

  function onScrollHeader() {
    var y = window.scrollY || window.pageYOffset;
    var dy = y - lastScrollY;

    if (header && !document.body.classList.contains("is-locked")) {
      if (y < 160) {
        header.classList.remove("is-hidden");
      } else if (dy > 4) {
        header.classList.add("is-hidden");
        closeMenus();
      } else if (dy < -4) {
        header.classList.remove("is-hidden");
      }
    }

    if (Math.abs(dy) > 0) lastScrollY = y;
    if (header) header.classList.toggle("is-elevated", y > 40);

    if (progressBar) {
      var max = document.documentElement.scrollHeight - window.innerHeight;
      progressBar.style.transform = "scaleX(" + (max > 0 ? clamp(y / max, 0, 1) : 0) + ")";
    }
  }
  onScrollHeader();
  window.addEventListener("scroll", onScrollHeader, { passive: true });
  window.addEventListener("resize", function () {
    onScrollHeader();
  });

  /* ---------------------------------------------------------
     Mega menu
     --------------------------------------------------------- */
  var navItems = Array.prototype.slice.call(document.querySelectorAll(".nav__item--has-menu"));
  navItems.forEach(function (item) {
    var btn = item.querySelector(".nav__link");
    if (!btn) return;
    btn.addEventListener("click", function (e) {
      e.preventDefault();
      var isOpen = item.classList.contains("is-open");
      closeMenus();
      if (!isOpen) {
        item.classList.add("is-open");
        btn.setAttribute("aria-expanded", "true");
      }
    });
    item.addEventListener("keydown", function (e) {
      if (e.key === "Escape") {
        item.classList.remove("is-open");
        btn.setAttribute("aria-expanded", "false");
        btn.focus();
      }
    });
  });

  function closeMenus() {
    navItems.forEach(function (item) {
      item.classList.remove("is-open");
      var b = item.querySelector(".nav__link");
      if (b) b.setAttribute("aria-expanded", "false");
    });
  }

  document.addEventListener("click", function (e) {
    if (!e.target.closest(".nav__item--has-menu")) closeMenus();
  });

  /* ---------------------------------------------------------
     Mobile navigation
     --------------------------------------------------------- */
  var menuToggle = document.querySelector("[data-menu-toggle]");
  var mobileNav = document.querySelector("[data-mobile-nav]");

  function setMenu(open) {
    if (!menuToggle || !mobileNav) return;
    menuToggle.setAttribute("aria-expanded", String(open));
    mobileNav.hidden = false;
    window.requestAnimationFrame(function () {
      mobileNav.classList.toggle("is-open", open);
    });
    body.classList.toggle("is-locked", open);
    mobileNav.style.pointerEvents = open ? "auto" : "none";
    if (!open) {
      window.setTimeout(function () {
        if (!mobileNav.classList.contains("is-open")) mobileNav.hidden = true;
      }, 260);
    }
  }
  if (mobileNav) {
    mobileNav.hidden = true;
    mobileNav.style.pointerEvents = "none";
  }
  if (menuToggle) {
    menuToggle.addEventListener("click", function () {
      setMenu(menuToggle.getAttribute("aria-expanded") !== "true");
    });
    mobileNav.addEventListener("click", function (e) {
      if (e.target.closest("a")) setMenu(false);
    });
  }
  window.addEventListener("keydown", function (e) {
    if (e.key === "Escape") {
      if (menuToggle && menuToggle.getAttribute("aria-expanded") === "true") {
        setMenu(false);
        menuToggle.focus();
      }
      closeMenus();
    }
  });

  /* ---------------------------------------------------------
     Portal dialog
     --------------------------------------------------------- */
  var dialog = document.querySelector("[data-portal-dialog]");
  document.querySelectorAll("[data-portal]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      if (!dialog) return;
      if (typeof dialog.showModal === "function") dialog.showModal();
      else dialog.setAttribute("open", "");
    });
  });
  if (dialog) {
    dialog.addEventListener("click", function (e) {
      if (e.target === dialog) dialog.close();
    });
  }

  /* ---------------------------------------------------------
     Hero slideshow
     --------------------------------------------------------- */
  var heroSlides = Array.prototype.slice.call(document.querySelectorAll(".hero__slide"));
  if (heroSlides.length > 1 && !reduceMotion) {
    var slideIndex = 0;
    window.setInterval(function () {
      if (document.hidden) return;
      heroSlides[slideIndex].classList.remove("is-active");
      slideIndex = (slideIndex + 1) % heroSlides.length;
      heroSlides[slideIndex].classList.add("is-active");
    }, 5200);
  }

  /* ---------------------------------------------------------
     Neighbourhoods
     --------------------------------------------------------- */
  var HOODS = [
    {
      name: "Lekki",
      img: "assets/img/hood-lekki.jpg",
      alt: "Aerial view of homes in Lekki, Lagos",
      desc: "Waterfront estates, new-build duplexes and the city’s fastest-growing corridor — from Admiralty Way to the Lekki–Epe axis."
    },
    {
      name: "Ikoyi",
      img: "assets/img/hood-ikoyi.jpg",
      alt: "Tree-lined streets and low-rise homes in Ikoyi, Lagos",
      desc: "Leafy streets, diplomatic residences and the most coveted addresses on the island — Old Ikoyi through to Parkview."
    },
    {
      name: "Victoria Island",
      img: "assets/img/hood-vi.jpg",
      alt: "Towers and marina frontage on Victoria Island, Lagos",
      desc: "Where business towers meet marina frontage, late-night kitchens and a promenade that runs from Eko to Oniru."
    },
    {
      name: "Ikeja GRA",
      img: "assets/img/hood-ikeja.jpg",
      alt: "Quiet residential street in Ikeja GRA, Lagos",
      desc: "Old-money calm, mature trees and easy access to the airport — mainland living without the mainland noise."
    },
    {
      name: "Yaba",
      img: "assets/img/hood-yaba.jpg",
      alt: "Street scene in Yaba, Lagos",
      desc: "The tech hub: compact apartments steps from cafés, co-working labs and the University of Lagos."
    },
    {
      name: "Banana Island",
      img: "assets/img/hood-banana.jpg",
      alt: "Waterfront and boats around Banana Island, Lagos",
      desc: "Gated waterfront living with private jetties, resort-grade amenities and a five-minute boat ride to Ikoyi."
    },
    {
      name: "Surulere",
      img: "assets/img/hood-surulere.jpg",
      alt: "The National Theatre and surrounding streets in Surulere, Lagos",
      desc: "Family homes and community streets minutes from the National Theatre and the stadium."
    },
    {
      name: "Ajah",
      img: "assets/img/hood-ajah.jpg",
      alt: "New housing along the Lekki–Epe axis at Ajah",
      desc: "Value-driven estates along the Lekki–Epe axis, with space to grow and a young, fast-growing community."
    }
  ];

  var hoodRows = Array.prototype.slice.call(document.querySelectorAll("[data-hood]"));
  var hoodImg = document.querySelector("[data-hood-img]");
  var hoodAlt = document.querySelector("[data-hood-img-alt]");
  var hoodDesc = document.querySelector("[data-hood-desc]");
  var hoodCurrent = 0;
  var hoodDescTimer = null;
  var hoodSwapTimer = null;
  var hoodBusy = false;

  var hoodLayers = [hoodImg, hoodAlt];
  var hoodActive = 0;

  function settleHoodLayers() {
    if (!hoodImg || !hoodAlt) return;
    hoodLayers.forEach(function (layer) { layer.style.transition = "none"; });
    var visible = hoodLayers[hoodActive];
    var hidden = hoodLayers[1 - hoodActive];
    visible.style.opacity = "1";
    visible.style.transform = "translate3d(0,0,0)";
    hidden.style.opacity = "0";
    hidden.style.transform = "translate3d(-100%,0,0)";
    hidden.alt = "";
    hoodBusy = false;
    window.clearTimeout(hoodSwapTimer);
  }

  function slideHoodImage(data) {
    if (!hoodImg || !hoodAlt) return;
    if (reduceMotion) {
      hoodImg.src = data.img;
      hoodImg.alt = data.alt;
      return;
    }
    if (hoodBusy) settleHoodLayers();

    var incomingIndex = 1 - hoodActive;
    var incoming = hoodLayers[incomingIndex];
    var outgoing = hoodLayers[hoodActive];

    incoming.src = data.img;
    incoming.alt = data.alt;
    incoming.style.transition = "none";
    incoming.style.opacity = "1";
    incoming.style.transform = "translate3d(-100%,0,0)";
    void incoming.offsetWidth;

    incoming.style.transition = "";
    outgoing.style.transition = "";

    incoming.style.transform = "translate3d(0,0,0)";
    outgoing.style.transform = "translate3d(100%,0,0)";

    hoodActive = incomingIndex;
    hoodBusy = true;

    window.clearTimeout(hoodSwapTimer);
    hoodSwapTimer = window.setTimeout(function () {
      /* park the old layer off-screen left, invisibly, ready for the next swap */
      outgoing.style.transition = "none";
      outgoing.style.opacity = "0";
      outgoing.style.transform = "translate3d(-100%,0,0)";
      outgoing.alt = "";
      hoodBusy = false;
    }, 740);
  }

  function selectHood(index, immediate) {
    if (!hoodRows.length) return;
    var next = HOODS[index];
    if (!next || index === hoodCurrent) return;
    hoodCurrent = index;
    hoodRows.forEach(function (row, i) {
      row.setAttribute("aria-current", i === index ? "true" : "false");
    });

    slideHoodImage(next);

    if (hoodDesc) hoodDesc.classList.add("is-switching");
    window.clearTimeout(hoodDescTimer);
    hoodDescTimer = window.setTimeout(function () {
      if (hoodDesc) {
        hoodDesc.textContent = next.desc;
        hoodDesc.classList.remove("is-switching");
      }
    }, immediate || reduceMotion ? 0 : 180);
  }

  hoodRows.forEach(function (row) {
    var index = parseInt(row.getAttribute("data-hood"), 10);
    row.addEventListener("mouseenter", function () { selectHood(index); });
    row.addEventListener("focus", function () { selectHood(index); });
    row.addEventListener("click", function () { selectHood(index); });
  });

  /* ---------------------------------------------------------
     Key figures count-up
     --------------------------------------------------------- */
  var counters = document.querySelectorAll("[data-count]");
  var counted = false;

  function animateCount(el) {
    var target = parseFloat(el.getAttribute("data-count"));
    var prefix = el.getAttribute("data-prefix") || "";
    var suffix = el.getAttribute("data-suffix") || "";
    var group = el.hasAttribute("data-group");
    var start = null;
    var dur = 1500;

    function frame(now) {
      if (start === null) start = now;
      var p = clamp((now - start) / dur, 0, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      var val = Math.round(target * eased);
      el.textContent = prefix + (group ? val.toLocaleString("en-NG") : String(val)) + suffix;
      if (p < 1) window.requestAnimationFrame(frame);
    }
    if (reduceMotion || qaMode) {
      el.textContent = prefix + (group ? target.toLocaleString("en-NG") : target) + suffix;
      return;
    }
    window.requestAnimationFrame(frame);
  }

  function runCounters() {
    if (counted) return;
    counted = true;
    Array.prototype.forEach.call(counters, animateCount);
  }

  /* ---------------------------------------------------------
     Featured properties — scroll driven
     --------------------------------------------------------- */
  var featured = document.querySelector("[data-featured]");
  var track = document.querySelector("[data-featured-track]");
  var backdrop = document.querySelector("[data-featured-backdrop]");
  var strip = document.querySelector("[data-featured-strip]");
  var panel = document.querySelector("[data-featured-panel]");
  var featuredIndex = document.querySelector("[data-featured-index]");
  var featuredTotal = document.querySelector("[data-featured-total]");
  var desktopQuery = window.matchMedia("(min-width: 861px)");
  var slides = track ? Array.prototype.slice.call(track.children) : [];
  var featuredState = { target: 0, current: 0, viewportH: 0, panelH: 0, panelHCurrent: -1, panelCurrentH: null, stripX: 0, stripCurrent: null, lastShown: -1, progress: 0 };

  if (featuredTotal) featuredTotal.textContent = String(slides.length).padStart(2, "0");

  function measureFeatured() {
    var viewport = track ? track.parentElement : null;
    featuredState.viewportH = viewport ? viewport.clientHeight : 0;
    featuredState.panelH = panel && panel.parentElement ? panel.parentElement.clientHeight : 0;
  }

  function updateFeatured() {
    if (!featured || !track || slides.length < 2) return;
    if (!desktopQuery.matches || qaMode) return;
    var rect = featured.getBoundingClientRect();
    var scrollable = featured.offsetHeight - window.innerHeight;
    if (scrollable <= 0) return;
    var p = clamp(-rect.top / scrollable, 0, 1);
    featuredState.progress = p;
    /* properties only change while the card is fully open */
    var slideProgress = clamp((p - 0.12) / 0.76, 0, 1);
    featuredState.target = slideProgress * (slides.length - 1);

    if (featuredIndex) {
      var shown = clamp(Math.round(featuredState.target) + 1, 1, slides.length);
      if (shown !== featuredState.lastShown) {
        featuredIndex.textContent = String(shown).padStart(2, "0");
        featuredState.lastShown = shown;
      }
    }
  }

  function rafFeatured() {
    if (!featured || !track) { window.requestAnimationFrame(rafFeatured); return; }
    var p = featuredState.progress;
    featuredState.current += (featuredState.target - featuredState.current) * (reduceMotion ? 1 : 0.11);
    if (Math.abs(featuredState.target - featuredState.current) < 0.0006) {
      featuredState.current = featuredState.target;
    }
    if (desktopQuery.matches && !qaMode && !reduceMotion) {
      track.style.transform =
        "translate3d(0," + (-featuredState.current * featuredState.viewportH) + "px,0)";

      if (strip) {
        /* gradient backdrop, drifting left to right, eased behind the scroll */
        var maxShift = window.innerWidth * 0.2;
        var targetX = -maxShift * (1 - p);
        if (featuredState.stripCurrent === null) featuredState.stripCurrent = targetX;
        featuredState.stripCurrent += (targetX - featuredState.stripCurrent) * 0.14;
        if (Math.abs(targetX - featuredState.stripCurrent) < 0.4) {
          featuredState.stripCurrent = targetX;
        }
        if (Math.abs(featuredState.stripCurrent - featuredState.stripX) > 0.4) {
          strip.style.transform =
            "translate3d(" + featuredState.stripCurrent.toFixed(1) + "px,0,0)";
          featuredState.stripX = featuredState.stripCurrent;
        }
      }
      if (panel) {
        /* the card opens by growing in height — content is never scaled */
        var pOpen = clamp(p / 0.12, 0, 1);
        var pClose = clamp((p - 0.88) / 0.12, 0, 1);
        var easedOpen = 1 - Math.pow(1 - pOpen, 3);
        var easedClose = pClose * pClose * (3 - 2 * pClose);
        var panelH = featuredState.panelH || window.innerHeight;
        var targetH = panelH * easedOpen * (1 - easedClose);
        if (featuredState.panelCurrentH === null) featuredState.panelCurrentH = targetH;
        featuredState.panelCurrentH += (targetH - featuredState.panelCurrentH) * 0.16;
        if (Math.abs(targetH - featuredState.panelCurrentH) < 0.4) {
          featuredState.panelCurrentH = targetH;
        }
        if (Math.abs(featuredState.panelCurrentH - featuredState.panelHCurrent) > 0.3) {
          panel.style.height = featuredState.panelCurrentH.toFixed(1) + "px";
          featuredState.panelHCurrent = featuredState.panelCurrentH;
        }
      }
    }
    window.requestAnimationFrame(rafFeatured);
  }

  function resetFeaturedInline() {
    if (panel) panel.style.height = "";
    if (track) track.style.transform = "";
    if (strip) strip.style.transform = "";
    featuredState.panelHCurrent = -1;
    featuredState.panelCurrentH = null;
    featuredState.stripX = 0;
    featuredState.stripCurrent = null;
  }

  if (featured && track && slides.length > 1) {
    measureFeatured();
    updateFeatured();
    window.addEventListener("scroll", updateFeatured, { passive: true });
    window.addEventListener("resize", function () {
      if (!desktopQuery.matches) resetFeaturedInline();
      measureFeatured();
      updateFeatured();
    });
    desktopQuery.addEventListener("change", function () {
      if (!desktopQuery.matches) resetFeaturedInline();
      measureFeatured();
      updateFeatured();
    });
    window.requestAnimationFrame(rafFeatured);
  }

  /* ---------------------------------------------------------
     Capabilities strip
     --------------------------------------------------------- */
  var capsViewport = document.querySelector("[data-caps-viewport]");
  if (capsViewport) {
    var capsTrack = document.querySelector("[data-caps-track]");
    var capsBar = document.querySelector("[data-caps-bar]");
    var prevBtn = document.querySelector("[data-caps-prev]");
    var nextBtn = document.querySelector("[data-caps-next]");

    function updateCaps() {
      var max = capsViewport.scrollWidth - capsViewport.clientWidth;
      var p = max > 0 ? capsViewport.scrollLeft / max : 0;
      if (capsBar) {
        var w = Math.max(18, (capsViewport.clientWidth / capsViewport.scrollWidth) * 100);
        capsBar.style.width = w + "%";
        capsBar.style.transform = "translateX(" + (p * (100 - w)) / w * 100 + "%)";
      }
      if (prevBtn) prevBtn.disabled = capsViewport.scrollLeft <= 2;
      if (nextBtn) nextBtn.disabled = capsViewport.scrollLeft >= max - 2;
    }

    function step(dir) {
      var card = capsTrack ? capsTrack.querySelector(".cap") : null;
      var amount = card ? card.getBoundingClientRect().width + 12 : 280;
      capsViewport.scrollBy({ left: dir * amount * 1.5, behavior: reduceMotion ? "auto" : "smooth" });
    }

    if (prevBtn) prevBtn.addEventListener("click", function () { step(-1); });
    if (nextBtn) nextBtn.addEventListener("click", function () { step(1); });
    capsViewport.addEventListener("scroll", updateCaps, { passive: true });
    window.addEventListener("resize", updateCaps);

    var down = false, startX = 0, startScroll = 0, moved = false;
    capsViewport.addEventListener("pointerdown", function (e) {
      if (e.pointerType === "touch") return;
      down = true; moved = false;
      startX = e.clientX;
      startScroll = capsViewport.scrollLeft;
      capsViewport.classList.add("is-dragging");
    });
    window.addEventListener("pointermove", function (e) {
      if (!down) return;
      var dx = e.clientX - startX;
      if (Math.abs(dx) > 4) moved = true;
      capsViewport.scrollLeft = startScroll - dx;
    });
    window.addEventListener("pointerup", function () {
      if (!down) return;
      down = false;
      capsViewport.classList.remove("is-dragging");
    });
    capsViewport.addEventListener("click", function (e) {
      if (moved) e.preventDefault();
    }, true);

    updateCaps();
    window.setTimeout(updateCaps, 300);
  }

  /* ---------------------------------------------------------
     Scroll reveals
     --------------------------------------------------------- */
  var splitEls = Array.prototype.slice.call(document.querySelectorAll("[data-split]"));
  var fadeEls = Array.prototype.slice.call(document.querySelectorAll("[data-fade]"));
  var clipEls = Array.prototype.slice.call(document.querySelectorAll("[data-clip]"));
  var listEls = Array.prototype.slice.call(document.querySelectorAll("[data-list]"));
  var capsSection = document.querySelector(".caps");
  var figuresSection = document.querySelector("[data-figures]");
  var footerEl = document.querySelector(".footer");
  var footerWatermark = document.querySelector(".footer__watermark");

  if ("IntersectionObserver" in window) {
    var revealIO = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-in");
        revealIO.unobserve(entry.target);
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.12 });

    splitEls.concat(fadeEls, clipEls, listEls).forEach(function (el) { revealIO.observe(el); });
    if (capsSection) revealIO.observe(capsSection);
    if (footerEl) revealIO.observe(footerEl);

    var figuresIO = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-in");
        runCounters();
        figuresIO.unobserve(entry.target);
      });
    }, { threshold: 0.25 });
    if (figuresSection) figuresIO.observe(figuresSection);

    var newsIO = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-in");
        newsIO.unobserve(entry.target);
      });
    }, { rootMargin: "0px 0px -10% 0px", threshold: 0.15 });
    Array.prototype.forEach.call(document.querySelectorAll("[data-news-item]"), function (el) {
      newsIO.observe(el);
    });

    if (footerWatermark) {
      var wmIO = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            footerWatermark.classList.add("is-in-wm");
            wmIO.unobserve(entry.target);
          }
        });
      }, { threshold: 0.05 });
      wmIO.observe(footerWatermark);
    }
  } else {
    splitEls.concat(fadeEls, clipEls, listEls).forEach(function (el) { el.classList.add("is-in"); });
    if (capsSection) capsSection.classList.add("is-in");
    if (figuresSection) figuresSection.classList.add("is-in");
    if (footerEl) footerEl.classList.add("is-in");
    Array.prototype.forEach.call(document.querySelectorAll("[data-news-item]"), function (el) {
      el.classList.add("is-in");
    });
    runCounters();
  }

  /* above-the-fold failsafe */
  window.setTimeout(function () {
    splitEls.concat(fadeEls, clipEls, listEls).forEach(function (el) {
      if (el.getBoundingClientRect().top < window.innerHeight * 1.02) el.classList.add("is-in");
    });
  }, 1400);

  /* ---------------------------------------------------------
     CTA parallax
     --------------------------------------------------------- */
  var ctaMedia = document.querySelector(".cta__media");
  var ctaSection = document.querySelector(".cta");
  function updateParallax() {
    if (!ctaMedia || !ctaSection || reduceMotion) return;
    var rect = ctaSection.getBoundingClientRect();
    if (rect.bottom < 0 || rect.top > window.innerHeight) return;
    var offset = (rect.top - window.innerHeight * 0.5) * -0.06;
    ctaMedia.style.transform = "translate3d(0," + offset.toFixed(2) + "px,0)";
  }
  window.addEventListener("scroll", updateParallax, { passive: true });
  updateParallax();

  /* ---------------------------------------------------------
     Misc
     --------------------------------------------------------- */
  var year = document.querySelector("[data-year]");
  if (year) year.textContent = String(new Date().getFullYear());

  document.querySelectorAll('a[href^="#"]').forEach(function (link) {
    link.addEventListener("click", function (e) {
      var id = link.getAttribute("href");
      if (!id || id === "#") return;
      var target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      var top = target.getBoundingClientRect().top + window.scrollY;
      if (id !== "#top") top -= 64;
      window.scrollTo({ top: top, behavior: reduceMotion ? "auto" : "smooth" });
      if (history.replaceState) history.replaceState(null, "", id);
    });
  });

  /* QA offsets (only with ?qa=1) */
  if (qaMode) {
    window.addEventListener("load", function () {
      window.setTimeout(function () {
        var ids = ["top", "neighborhoods", "featured", "about", "capabilities", "news", "contact"];
        var offsets = {};
        ids.forEach(function (id) {
          var el = document.getElementById(id);
          if (el) offsets[id] = Math.round(el.getBoundingClientRect().top + window.scrollY);
        });
        offsets.page = document.body.scrollHeight;
        var tag = document.createElement("div");
        tag.id = "qa-offsets";
        tag.textContent = JSON.stringify(offsets);
        document.body.appendChild(tag);
      }, 300);
    });
  }
})();
