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

  /* ---- Theme (dark default, persisted light toggle) ---- */
  var themeBtn = document.querySelector(".theme-btn");
  var themeMeta = document.querySelector('meta[name="theme-color"]');
  var THEME_BG = { dark: "#101318", light: "#F5F3EE" };

  function currentTheme() {
    return document.documentElement.getAttribute("data-theme") === "light" ? "light" : "dark";
  }

  function syncThemeUi() {
    var t = currentTheme();
    if (themeBtn) {
      themeBtn.setAttribute(
        "aria-label",
        themeBtn.getAttribute(t === "dark" ? "data-label-light" : "data-label-dark") || "Toggle theme"
      );
    }
    if (themeMeta) themeMeta.setAttribute("content", THEME_BG[t]);
  }

  if (themeBtn) {
    themeBtn.addEventListener("click", function () {
      var next = currentTheme() === "dark" ? "light" : "dark";
      document.documentElement.setAttribute("data-theme", next);
      try { localStorage.setItem("siteTheme", next); } catch (e) {}
      syncThemeUi();
    });
  }
  syncThemeUi();

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
    var pSvg = document.getElementById("patent-svg");
    var pTarget = document.getElementById("p-target");
    var pTargetInner = pTarget ? pTarget.querySelector(".p-target-inner") : null;
    var pLeader = document.getElementById("p-target-leader");
    var DRAG_R = 174;   /* device orbit radius around the servo pivot */
    var D_MIN = -45;    /* display rotation clamp; physical 45-140 within 0-180 */
    var D_MAX = 50;
    var pDragging = false;
    var pFollowRaf = 0;

    function pApply(d) {
      pAngleCur = d;
      if (pNarrow) {
        pNarrow.setAttribute(
          "transform",
          "rotate(" + d.toFixed(2) + " " + PIVOT.x + " " + PIVOT.y + ")"
        );
      }
      if (pAngle) pAngle.textContent = "\u03B8 = " + Math.round(90 + d) + "\u00B0";
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
      if (pFollowRaf) cancelAnimationFrame(pFollowRaf);
      pTimers.forEach(function (t) { clearTimeout(t); });
      pTimers = [];
    }

    function pPlaceTarget(d) {
      if (!pTarget) return;
      var rad = (d * Math.PI) / 180;
      var cx = PIVOT.x + DRAG_R * Math.sin(rad);
      var cy = PIVOT.y - DRAG_R * Math.cos(rad);
      pTarget.setAttribute(
        "transform",
        "translate(" + (cx - 292).toFixed(1) + " " + (cy - 100).toFixed(1) + ")"
      );
      if (pLeader) {
        var dx = PIVOT.x - cx;
        var dy = PIVOT.y - cy;
        var len = Math.sqrt(dx * dx + dy * dy);
        var t = Math.max(0, (len - 30) / len);
        pLeader.setAttribute("x1", cx.toFixed(1));
        pLeader.setAttribute("y1", cy.toFixed(1));
        pLeader.setAttribute("x2", (cx + dx * t).toFixed(1));
        pLeader.setAttribute("y2", (cy + dy * t).toFixed(1));
      }
      pTarget.setAttribute("aria-valuenow", String(Math.round(90 + d)));
    }

    /* antenna chases the device with a short mechanical lag */
    function pFollow(targetD) {
      if (pFollowRaf) cancelAnimationFrame(pFollowRaf);
      if (pReduce.matches) {
        pApply(targetD);
        return;
      }
      function step() {
        var diff = targetD - pAngleCur;
        if (Math.abs(diff) < 0.4) {
          pApply(targetD);
          pFollowRaf = 0;
          return;
        }
        pApply(pAngleCur + diff * 0.22);
        pFollowRaf = requestAnimationFrame(step);
      }
      pFollowRaf = requestAnimationFrame(step);
    }

    function pPointerAngle(e) {
      if (!pSvg || !pSvg.getScreenCTM()) return 0;
      var pt = pSvg.createSVGPoint();
      pt.x = e.clientX;
      pt.y = e.clientY;
      var p = pt.matrixTransform(pSvg.getScreenCTM().inverse());
      var a = (Math.atan2(p.x - PIVOT.x, PIVOT.y - p.y) * 180) / Math.PI;
      return Math.max(D_MIN, Math.min(D_MAX, a));
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
      if (pTarget) pTarget.setAttribute("tabindex", mode === "ai" ? "0" : "-1");
      if (mode === "wide") {
        pStatus.textContent = showcase.getAttribute("data-status-wide");
        pAnimateTo(0, 700);
      } else if (mode === "directional") {
        pStatus.textContent = showcase.getAttribute("data-status-directional");
        pAnimateTo(42, 900);
      } else {
        pPlaceTarget(-38);
        if (pTargetInner) {
          pTargetInner.classList.remove("p-pulse");
          void pTargetInner.getBBox();
          pTargetInner.classList.add("p-pulse");
          pTimers.push(
            setTimeout(function () { pTargetInner.classList.remove("p-pulse"); }, 1500)
          );
        }
        pTimers = pTimers.concat([
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
        ]);
      }
    }

    showcase
      .querySelector(".patent-controls")
      .addEventListener("click", function (e) {
        var btn = e.target.closest(".patent-btn");
        if (btn) pSetMode(btn.getAttribute("data-patent-mode"));
      });

    if (pTarget) {
      pTarget.addEventListener("pointerdown", function (e) {
        if (pVisual.getAttribute("data-mode") !== "ai") return;
        e.preventDefault();
        pClear();
        pDragging = true;
        pVisual.classList.add("p-dragging");
        try { pTarget.setPointerCapture(e.pointerId); } catch (err) {}
        pStatus.textContent = showcase.getAttribute("data-status-ai-drag");
        var a = pPointerAngle(e);
        pPlaceTarget(a);
        pFollow(a);
      });
      pTarget.addEventListener("pointermove", function (e) {
        if (!pDragging) return;
        var a = pPointerAngle(e);
        pPlaceTarget(a);
        pFollow(a);
      });
      function pEndDrag() {
        if (!pDragging) return;
        pDragging = false;
        pVisual.classList.remove("p-dragging");
        pStatus.textContent = showcase.getAttribute("data-status-ai-drag-end");
      }
      pTarget.addEventListener("pointerup", pEndDrag);
      pTarget.addEventListener("pointercancel", pEndDrag);
      /* Touch fallback: browsers that ignore touch-action on SVG elements
         steal the gesture for scrolling and fire pointercancel. Canceling
         the default keeps the drag alive; touch events keep targeting the
         element the gesture started on, so no pointer capture is needed. */
      function pTouchAngle(e) {
        return pPointerAngle(e.changedTouches[0]);
      }
      pTarget.addEventListener("touchstart", function (e) {
        if (pVisual.getAttribute("data-mode") !== "ai") return;
        if (e.cancelable) e.preventDefault();
        pClear();
        pDragging = true;
        pVisual.classList.add("p-dragging");
        pStatus.textContent = showcase.getAttribute("data-status-ai-drag");
        var a = pTouchAngle(e);
        pPlaceTarget(a);
        pFollow(a);
      }, { passive: false });
      pTarget.addEventListener("touchmove", function (e) {
        if (!pDragging) return;
        if (e.cancelable) e.preventDefault();
        var a = pTouchAngle(e);
        pPlaceTarget(a);
        pFollow(a);
      }, { passive: false });
      pTarget.addEventListener("touchend", pEndDrag);
      pTarget.addEventListener("touchcancel", pEndDrag);
      pTarget.addEventListener("keydown", function (e) {
        if (pVisual.getAttribute("data-mode") !== "ai") return;
        var key = e.key;
        if (key !== "ArrowLeft" && key !== "ArrowRight" && key !== "ArrowUp" && key !== "ArrowDown") return;
        e.preventDefault();
        var step = e.shiftKey ? 10 : 5;
        var cur = parseFloat(pTarget.getAttribute("aria-valuenow")) - 90;
        var nd =
          key === "ArrowLeft" || key === "ArrowDown"
            ? Math.max(D_MIN, cur - step)
            : Math.min(D_MAX, cur + step);
        pClear();
        pStatus.textContent = showcase.getAttribute("data-status-ai-drag");
        pPlaceTarget(nd);
        pFollow(nd);
      });
    }

    pApply(0);
    pPlaceTarget(-38);

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
