/* Personal site interactions: theme, navigation, reveal, small utilities. */
(function () {
  "use strict";

  var root = document.documentElement;
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* Theme ---------------------------------------------------------------- */
  var themeMeta = document.querySelectorAll('meta[name="theme-color"]');
  function paintThemeColor(theme) {
    themeMeta.forEach(function (tag) {
      tag.setAttribute("content", theme === "dark" ? "#100f0d" : "#fbfaf7");
      tag.removeAttribute("media");
    });
  }
  paintThemeColor(root.getAttribute("data-theme") || "light");

  var toggle = document.getElementById("theme-toggle");
  if (toggle) {
    toggle.addEventListener("click", function () {
      var next = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
      root.setAttribute("data-theme", next);
      try { localStorage.setItem("theme", next); } catch (e) {}
      paintThemeColor(next);
    });
  }

  /* Header state & reading progress -------------------------------------- */
  var header = document.getElementById("site-header");
  var bar = document.getElementById("progress-bar");
  var ambient = document.querySelector(".ambient");
  var ticking = false;

  function onScroll() {
    if (ticking) return;
    ticking = true;
    window.requestAnimationFrame(function () {
      var y = window.scrollY || window.pageYOffset;
      if (header) header.classList.toggle("is-scrolled", y > 8);
      if (bar) {
        var doc = document.documentElement;
        var max = doc.scrollHeight - window.innerHeight;
        var pct = max > 0 ? Math.min(100, (y / max) * 100) : 0;
        bar.style.width = pct.toFixed(2) + "%";
      }
      if (ambient) {
        ambient.style.setProperty("--grid-shift", Math.min(y * 0.06, 240).toFixed(1) + "px");
      }
      ticking = false;
    });
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* Mobile navigation ---------------------------------------------------- */
  var navToggle = document.getElementById("nav-toggle");
  var nav = document.getElementById("site-nav");
  var navLabel = navToggle ? navToggle.querySelector(".nav-toggle__label") : null;
  if (navToggle && nav) {
    navToggle.addEventListener("click", function () {
      var open = nav.classList.toggle("is-open");
      navToggle.setAttribute("aria-expanded", open ? "true" : "false");
      if (navLabel) navLabel.textContent = open ? navToggle.getAttribute("data-label-open") : navToggle.getAttribute("data-label-closed");
    });
    nav.addEventListener("click", function (event) {
      if (event.target.closest("a")) {
        nav.classList.remove("is-open");
        navToggle.setAttribute("aria-expanded", "false");
      }
    });
    document.addEventListener("click", function (event) {
      if (!nav.classList.contains("is-open")) return;
      if (nav.contains(event.target) || navToggle.contains(event.target)) return;
      nav.classList.remove("is-open");
      navToggle.setAttribute("aria-expanded", "false");
    });
    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape" && nav.classList.contains("is-open")) {
        nav.classList.remove("is-open");
        navToggle.setAttribute("aria-expanded", "false");
        navToggle.focus();
      }
    });
  }

  /* Reveal on scroll ----------------------------------------------------- */
  /* Above-the-fold blocks stay static; only content further down animates. */
  var revealTargets = document.querySelectorAll(
    ".section-head, .about > *, .interest-card, .theme-block, " +
    ".timeline__item, .contact-panel, .cv-section"
  );

  if (revealTargets.length && root.classList.contains("reveal-ready") && !reduceMotion) {
    revealTargets.forEach(function (el) {
      el.setAttribute("data-reveal", "");
    });
    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.08 }
    );
    revealTargets.forEach(function (el) { observer.observe(el); });
  }

  /* Active section in navigation ----------------------------------------- */
  var navLinks = nav ? Array.prototype.slice.call(nav.querySelectorAll('a[href*="#"]')) : [];
  var sections = navLinks
    .map(function (link) {
      var id = link.getAttribute("href").split("#")[1];
      return id ? document.getElementById(id) : null;
    })
    .filter(Boolean);

  if (sections.length && "IntersectionObserver" in window) {
    var setActive = function (id) {
      navLinks.forEach(function (link) {
        var match = link.getAttribute("href").split("#")[1] === id;
        link.classList.toggle("is-active", match);
        if (match) link.setAttribute("aria-current", "true");
        else if (link.getAttribute("aria-current") === "true") link.removeAttribute("aria-current");
      });
    };
    var navObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) setActive(entry.target.id);
        });
      },
      { rootMargin: "-45% 0px -50% 0px", threshold: 0 }
    );
    sections.forEach(function (section) { navObserver.observe(section); });

    var clearNavActive = function () {
      navLinks.forEach(function (link) {
        link.classList.remove("is-active");
        if (link.getAttribute("aria-current") === "true") link.removeAttribute("aria-current");
      });
    };
    window.addEventListener("scroll", function () {
      if ((window.scrollY || window.pageYOffset) < 240) clearNavActive();
    }, { passive: true });
  }

  /* Toast ---------------------------------------------------------------- */
  var toast;
  var toastTimer;
  function showToast(message) {
    if (!toast) {
      toast = document.createElement("div");
      toast.className = "toast";
      toast.setAttribute("role", "status");
      toast.setAttribute("aria-live", "polite");
      document.body.appendChild(toast);
    }
    toast.textContent = message;
    toast.classList.add("is-visible");
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(function () {
      toast.classList.remove("is-visible");
    }, 2200);
  }

  /* Copy email ----------------------------------------------------------- */
  document.querySelectorAll("[data-copy-email]").forEach(function (button) {
    button.addEventListener("click", function () {
      var email = button.getAttribute("data-copy-email");
      var done = function () { showToast("Email copied — " + email); };
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(email).then(done, function () {
          window.location.href = "mailto:" + email;
        });
      } else {
        window.location.href = "mailto:" + email;
      }
    });
  });

  /* Print ---------------------------------------------------------------- */
  document.querySelectorAll("[data-print]").forEach(function (button) {
    button.addEventListener("click", function () { window.print(); });
  });

  /* Filterable lists (notes by topic, library by type) ------------------- */
  document.querySelectorAll("[data-filter-bar]").forEach(function (bar) {
    var scope = bar.closest("[data-filter-scope]") || document;
    var items = Array.prototype.slice.call(scope.querySelectorAll("[data-filter-item]"));
    var countEl = scope.querySelector("[data-filter-count]");
    var emptyEl = scope.querySelector("[data-filter-empty]");
    var chips = Array.prototype.slice.call(bar.querySelectorAll("[data-filter]"));
    var param = bar.getAttribute("data-filter-param") || "tag";
    var noun = bar.getAttribute("data-filter-noun") || "item";
    var nounMany = bar.getAttribute("data-filter-noun-many") || (noun + "s");

    var applyFilter = function (value, remember) {
      var visible = 0;
      items.forEach(function (item) {
        var tags = (item.getAttribute("data-filter-tags") || "").split(" ").filter(Boolean);
        var show = value === "all" || tags.indexOf(value) !== -1;
        item.hidden = !show;
        if (show) visible += 1;
      });
      chips.forEach(function (chip) {
        var active = chip.getAttribute("data-filter") === value;
        chip.classList.toggle("is-active", active);
        chip.setAttribute("aria-pressed", active ? "true" : "false");
      });
      if (emptyEl) emptyEl.hidden = visible !== 0;
      if (countEl) countEl.textContent = visible + " " + (visible === 1 ? noun : nounMany);
      if (remember) {
        var url = new URL(window.location.href);
        if (value === "all") url.searchParams.delete(param);
        else url.searchParams.set(param, value);
        window.history.replaceState({}, "", url);
      }
    };

    bar.addEventListener("click", function (event) {
      var chip = event.target.closest("[data-filter]");
      if (!chip) return;
      applyFilter(chip.getAttribute("data-filter"), true);
    });

    var requested = new URLSearchParams(window.location.search).get(param);
    if (requested && chips.some(function (chip) { return chip.getAttribute("data-filter") === requested; })) {
      applyFilter(requested, false);
    }
  });

  /* Notes: table of contents --------------------------------------------- */
  var toc = document.querySelector("[data-toc]");
  var tocNav = document.querySelector("[data-toc-nav]");
  var noteContent = document.getElementById("note-content");
  if (toc && tocNav && noteContent) {
    var headings = Array.prototype.slice.call(noteContent.querySelectorAll("h2, h3"));
    if (headings.length >= 3) {
      var tocLinks = headings.map(function (heading, index) {
        if (!heading.id) heading.id = "section-" + (index + 1);
        var link = document.createElement("a");
        link.className = "note-toc__link" + (heading.tagName === "H3" ? " note-toc__link--h3" : "");
        link.href = "#" + heading.id;
        link.textContent = heading.textContent;
        tocNav.appendChild(link);
        return link;
      });
      toc.hidden = false;

      var setActiveHeading = function () {
        var current = null;
        headings.forEach(function (heading) {
          if (heading.getBoundingClientRect().top <= window.innerHeight * 0.35) current = heading;
        });
        tocLinks.forEach(function (link) {
          link.classList.toggle("is-active", !!current && link.getAttribute("href") === "#" + current.id);
        });
      };
      var tocTick = false;
      window.addEventListener("scroll", function () {
        if (tocTick) return;
        tocTick = true;
        window.requestAnimationFrame(function () { setActiveHeading(); tocTick = false; });
      }, { passive: true });
      setActiveHeading();
    }
  }
/* Ambient cursor glow --------------------------------------------------- */
  var glow = document.querySelector("[data-ambient-glow]");
  var compass = document.querySelector("[data-ambient-compass]");
  var finePointer = window.matchMedia("(hover: hover) and (min-width: 1180px)").matches;
  if (glow && !reduceMotion && finePointer) {
    var target = { x: window.innerWidth / 2, y: window.innerHeight * 0.4 };
    var pos = { x: target.x, y: target.y };
    var glowRaf = null;
    var glowOn = false;

    var glowLoop = function () {
      pos.x += (target.x - pos.x) * 0.09;
      pos.y += (target.y - pos.y) * 0.09;
      var transform = "translate3d(" + pos.x.toFixed(1) + "px," + pos.y.toFixed(1) + "px,0)";
      glow.style.transform = transform;
      if (compass) compass.style.transform = transform;
      if (Math.abs(target.x - pos.x) > 0.5 || Math.abs(target.y - pos.y) > 0.5) {
        glowRaf = window.requestAnimationFrame(glowLoop);
      } else {
        glowRaf = null;
      }
    };

    window.addEventListener("pointermove", function (event) {
      target.x = event.clientX;
      target.y = event.clientY;
      if (!glowOn) {
        glowOn = true;
        glow.classList.add("is-active");
        if (compass) compass.classList.add("is-active");
      }
      if (!glowRaf) glowRaf = window.requestAnimationFrame(glowLoop);
    }, { passive: true });

    document.addEventListener("pointerleave", function () {
      glowOn = false;
      glow.classList.remove("is-active");
      if (compass) compass.classList.remove("is-active");
    });
  }

  /* Hero print tilt -------------------------------------------------------- */
  var hero = document.querySelector(".hero");
  var heroFrame = document.querySelector(".hero__frame");
  if (hero && heroFrame && !reduceMotion && window.matchMedia("(hover: hover)").matches) {
    hero.addEventListener("pointermove", function (event) {
      var rect = hero.getBoundingClientRect();
      var nx = (event.clientX - rect.left) / rect.width - 0.5;
      var ny = (event.clientY - rect.top) / rect.height - 0.5;
      heroFrame.style.transition = "transform 140ms ease-out";
      heroFrame.style.transform =
        "rotate(-1.2deg) rotateY(" + (nx * 4).toFixed(2) + "deg) rotateX(" + (-ny * 3).toFixed(2) + "deg)";
    }, { passive: true });
    hero.addEventListener("pointerleave", function () {
      heroFrame.style.transition = "";
      heroFrame.style.transform = "";
    });
  }
})();