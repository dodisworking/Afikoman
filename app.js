(function () {
  "use strict";

  /** Replace with your real clue when ready. */
  var PLACEHOLDER_CLUE =
    "The real clue goes here — edit PLACEHOLDER_CLUE in app.js when you have it.";

  var HUNT_LINE = "happy hunting";

  var form = document.getElementById("signup-form");
  var matzah = document.getElementById("matzah");
  var matzahStage = document.getElementById("matzah-stage");
  var emailInput = document.getElementById("email");
  var submitBtn = document.getElementById("submit-btn");
  var formError = document.getElementById("form-error");
  var panelForm = document.getElementById("panel-form");
  var panelReveal = document.getElementById("panel-reveal");
  var clueEl = document.getElementById("clue-text");
  var huntEl = document.getElementById("hunt-text");
  var shell = document.getElementById("shell");
  var intro = document.getElementById("intro");
  var afikomanStack = document.getElementById("afikoman-stack");
  var proxyForm = document.getElementById("sheet-proxy-form");
  var proxyEmail = document.getElementById("sheet-proxy-email");
  var proxyFrame = document.getElementById("sheet-proxy-frame");

  var endpoint =
    typeof window.SHEETS_ENDPOINT === "string" ? window.SHEETS_ENDPOINT.trim() : "";

  function showError(msg) {
    formError.textContent = msg;
    formError.hidden = false;
  }

  function clearError() {
    formError.textContent = "";
    formError.hidden = true;
  }

  function isValidEmail(value) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  }

  function typewriter(el, text, msPerChar, done) {
    el.textContent = "";
    var i = 0;
    function tick() {
      if (i < text.length) {
        el.textContent += text.charAt(i);
        i += 1;
        setTimeout(tick, msPerChar);
      } else if (typeof done === "function") {
        done();
      }
    }
    tick();
  }

  function unlockForm() {
    if (!panelForm.hidden) {
      return;
    }

    var reduceMotion =
      typeof window.matchMedia === "function" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    var unlockMs = reduceMotion ? 200 : 780;

    if (shell) {
      shell.classList.add("shell--transitioning");
    }

    if (intro) {
      intro.classList.add("intro--dismissing");
    }

    if (matzah) {
      matzah.classList.add("matzah--dismissing");
    }

    if (matzahStage) {
      matzahStage.classList.add("is-dismissing");
    }

    /* Form sits behind matzah in the stack; show + animate in sync with matzah fading out */
    panelForm.hidden = false;
    panelForm.classList.add("panel--pre");

    window.requestAnimationFrame(function () {
      window.requestAnimationFrame(function () {
        panelForm.classList.add("panel--enter-active");
      });
    });

    window.setTimeout(function () {
      /* Keep panel absolutely centered (same transform) — only drop enter classes.
         Reserve stack height so nothing jumps when matzah is removed from flow. */
      panelForm.classList.remove("panel--pre", "panel--enter-active");
      if (afikomanStack && panelForm.offsetHeight > 0) {
        afikomanStack.style.minHeight = Math.ceil(panelForm.offsetHeight) + "px";
        afikomanStack.classList.add("afikoman-stack--done");
      }
      if (intro) {
        intro.hidden = true;
      }
      if (matzahStage) {
        matzahStage.hidden = true;
      }
      if (shell) {
        shell.classList.remove("shell--transitioning");
        shell.classList.add("shell--focus");
      }
      emailInput.focus();
    }, unlockMs);
  }

  function revealSuccess() {
    panelForm.hidden = true;
    if (afikomanStack) {
      afikomanStack.hidden = true;
    }
    panelReveal.hidden = false;

    clueEl.textContent = PLACEHOLDER_CLUE;

    huntEl.textContent = "";
    typewriter(huntEl, HUNT_LINE, 120, null);
  }

  /**
   * POST via hidden form + iframe (application/x-www-form-urlencoded).
   * Avoids browser CORS blocking fetch() to script.google.com from github.io.
   */
  function submitEmailToSheet(email, prevLabel) {
    var finished = false;

    function cleanup() {
      if (finished) {
        return;
      }
      finished = true;
      if (proxyFrame) {
        proxyFrame.removeEventListener("load", onLoad);
      }
      submitBtn.disabled = false;
      submitBtn.textContent = prevLabel;
      revealSuccess();
    }

    function onLoad() {
      cleanup();
    }

    if (proxyFrame) {
      proxyFrame.addEventListener("load", onLoad);
    }

    proxyForm.action = endpoint;
    proxyEmail.value = email;
    proxyForm.submit();

    window.setTimeout(function () {
      if (!finished) {
        cleanup();
      }
    }, 8000);
  }

  if (matzah) {
    matzah.addEventListener("click", unlockForm);
    matzah.addEventListener("keydown", function (e) {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        unlockForm();
      }
    });
  }

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    clearError();

    var email = (emailInput.value || "").trim();
    if (!email) {
      showError("Enter your email.");
      return;
    }
    if (!isValidEmail(email)) {
      showError("That does not look like a valid email.");
      return;
    }

    if (!endpoint) {
      showError(
        "Connect Google: open your Sheet → Extensions → Apps Script → Deploy → Web app (Execute as: you, Who has access: Anyone). Copy the URL ending in /exec, paste it into config.js as SHEETS_ENDPOINT, save, refresh this page."
      );
      return;
    }

    submitBtn.disabled = true;
    var prevLabel = submitBtn.textContent;
    submitBtn.textContent = "…";

    submitEmailToSheet(email, prevLabel);
  });
})();
