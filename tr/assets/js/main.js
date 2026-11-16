/* Progressive enhancement only. No dependencies. */
(function () {
  "use strict";

  document.documentElement.classList.add("js");

  /* ---- Mobile menu ---- */
  var menuBtn = document.querySelector(".menu-btn");
  var menu = document.getElementById("mobile-menu");

  function setMenu(open) {
    if (!menuBtn || !menu) return;
    menuBtn.setAttribute("aria-expanded", String(open));
    menuBtn.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    if (open) {
      menu.hidden = false;
      document.body.classList.add("menu-open");
      var first = menu.querySelector("a");
      if (first) first.focus();
    } else {
      menu.hidden = true;
      document.body.classList.remove("menu-open");
    }
  }

  if (menuBtn && menu) {
    menuBtn.addEventListener("click", function () {
      setMenu(menuBtn.getAttribute("aria-expanded") !== "true");
    });
    menu.addEventListener("click", function (e) {
      if (e.target.closest("a")) setMenu(false);
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && menuBtn.getAttribute("aria-expanded") === "true") {
        setMenu(false);
        menuBtn.focus();
      }
    });
  }

  /* ---- Scroll reveal (IO, once) ---- */
  var revealEls = document.querySelectorAll("[data-reveal]");
  if ("IntersectionObserver" in window && revealEls.length) {
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("in-view");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -8% 0px" }
    );
    revealEls.forEach(function (el) { io.observe(el); });

    /* Safety: a few embedded views never deliver IO callbacks.
       If an in-viewport probe element reports nothing within 600ms,
       drop the reveal-hiding entirely so content is never stuck invisible. */
    var probe = document.createElement("div");
    probe.style.cssText =
      "position:absolute;top:0;left:0;width:1px;height:1px;visibility:hidden;";
    document.body.appendChild(probe);
    var ioAlive = false;
    var probeIO = new IntersectionObserver(function (entries) {
      if (entries.some(function (e) { return e.isIntersecting; })) {
        ioAlive = true;
        probeIO.disconnect();
        probe.remove();
      }
    }, { threshold: 0 });
    probeIO.observe(probe);
    setTimeout(function () {
      if (!ioAlive) {
        probeIO.disconnect();
        probe.remove();
        document.documentElement.classList.add("no-io");
        revealEls.forEach(function (el) { el.classList.add("in-view"); });
      }
    }, 600);
  } else {
    revealEls.forEach(function (el) { el.classList.add("in-view"); });
  }

  /* ---- Active nav link ---- */
  var navLinks = document.querySelectorAll('.nav-links a[href^="#"]');
  var sections = Array.prototype.map
    .call(navLinks, function (a) { return document.querySelector(a.hash); })
    .filter(Boolean);

  if ("IntersectionObserver" in window && sections.length) {
    var sectionIO = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          navLinks.forEach(function (a) {
            if (a.hash === "#" + entry.target.id) {
              a.setAttribute("aria-current", "true");
            } else {
              a.removeAttribute("aria-current");
            }
          });
        });
      },
      { rootMargin: "-40% 0px -55% 0px" }
    );
    sections.forEach(function (s) { sectionIO.observe(s); });
  }

  /* ---- Footer year ---- */
  var yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());
})();
