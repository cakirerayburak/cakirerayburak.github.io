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
    var openLabel = menuBtn.getAttribute("data-label-open") || "Open menu";
    var closeLabel = menuBtn.getAttribute("data-label-close") || "Close menu";
    menuBtn.setAttribute("aria-label", open ? closeLabel : openLabel);
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

  /* ---- Patent showcase (deterministic mode machine) ---- */
  var showcase = document.querySelector(".patent-showcase");
  if (showcase) {
    var pVisual = showcase.querySelector(".patent-visual");
    var pButtons = showcase.querySelectorAll(".patent-btn");
    var pStatus = showcase.querySelector("[data-patent-status]");
    var pNarrow = document.getElementById("p-ant-narrow");
    var pAngle = document.getElementById("p-angle-text");
    var PIVOT = { x: 398, y: 239 };
    var pReduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    var pToken = 0;
    var pRaf = 0;
    var pTimers = [];
    var pAngleCur = 0;

    function pApply(d) {
      pAngleCur = d;
      if (pNarrow) {
        pNarrow.setAttribute(
          "transform",
          "rotate(" + d.toFixed(2) + " " + PIVOT.x + " " + PIVOT.y + ")"
        );
      }
      if (pAngle) pAngle.textContent = "\u03B8 " + Math.round(90 + d) + "\u00B0";
    }

    function pAnimateTo(target, duration, done) {
      var my = ++pToken;
      if (pRaf) cancelAnimationFrame(pRaf);
      if (pReduce.matches || duration <= 0) {
        pApply(target);
        if (done) done();
        return;
      }
      var from = pAngleCur;
      var start = 0;
      function ease(t) {
        return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
      }
      function frame(now) {
        if (my !== pToken) return;
        if (!start) start = now;
        var t = Math.min(1, (now - start) / duration);
        pApply(from + (target - from) * ease(t));
        if (t < 1) pRaf = requestAnimationFrame(frame);
        else if (done) done();
      }
      pRaf = requestAnimationFrame(frame);
    }

    function pClear() {
      pToken++;
      if (pRaf) cancelAnimationFrame(pRaf);
      pTimers.forEach(function (t) { clearTimeout(t); });
      pTimers = [];
    }

    function pSetMode(mode) {
      pClear();
      pVisual.setAttribute("data-mode", mode);
      pButtons.forEach(function (b) {
        b.setAttribute(
          "aria-pressed",
          String(b.getAttribute("data-patent-mode") === mode)
        );
      });
      if (mode === "wide") {
        pStatus.textContent = showcase.getAttribute("data-status-wide");
        pAnimateTo(0, 700);
      } else if (mode === "directional") {
        pStatus.textContent = showcase.getAttribute("data-status-directional");
        pAnimateTo(42, 900);
      } else {
        pTimers = [
          setTimeout(function () {
            pStatus.textContent = showcase.getAttribute("data-status-ai-1");
          }, 250),
          setTimeout(function () {
            pStatus.textContent = showcase.getAttribute("data-status-ai-2");
            pAnimateTo(-38, 900);
          }, 1500),
          setTimeout(function () {
            pStatus.textContent = showcase.getAttribute("data-status-ai-3");
          }, 2600),
        ];
      }
    }

    showcase
      .querySelector(".patent-controls")
      .addEventListener("click", function (e) {
        var btn = e.target.closest(".patent-btn");
        if (btn) pSetMode(btn.getAttribute("data-patent-mode"));
      });

    pApply(0);

    if ("IntersectionObserver" in window) {
      var pio = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) {
              showcase.classList.add("patent-ready");
              pio.disconnect();
            }
          });
        },
        { threshold: 0.25 }
      );
      pio.observe(showcase);
    } else {
      showcase.classList.add("patent-ready");
    }
  }

  /* ---- Footer year ---- */
  var yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());
})();
