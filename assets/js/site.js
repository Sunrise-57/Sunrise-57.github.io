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
      if (navLabel) navLabel.textContent = open ? "Close" : "Menu";
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
    ".section-head, .about > *, .interest-card, .project-card, " +
    ".experience-card, .timeline__item, .contact-panel, .cv-section"
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
})();