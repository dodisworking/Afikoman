(function () {
  "use strict";

  var HUNT_LINE = "happy hunting";

  var RIDDLE_LINES = [
    "Two brothers, with Jewish chutzpah behind the scene,",
    "Helped shape Disney's songs in ways rarely seen.",
    "From shtetl to studio, they made their way up,",
    "Turning small sparks of magic into something grown-up.",
    "From jungle to rooftops, their melodies would flow,",
    "Writing the songs that the whole world would know.",
    "They gave us a word that's absurdly ferocious,",
    "A tongue-twisting triumph… supercalifragilisticexpialidocious.",
    "\"When you've got nothing to say…\" they showed us the way,",
    "One word could carry the whole thing to play.",
    "So follow that melody, go where it flows,",
    "There's something hidden there… more than you know.",
    "And when you find it, no need to be precocious—",
    "You'll be feeling supercalifragilisticexpialidocious.",
  ];

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
  var matzahSlot = document.getElementById("matzah-slot");
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

  function typewriterRhythm(el, line, done) {
    el.textContent = "";
    var i = 0;
    var big = "supercalifragilisticexpialidocious";

    function delayAt(idx) {
      var c = line.charAt(idx);
      var base = 30;
      if (c === "…") {
        return base + 140;
      }
      if (",;:".indexOf(c) >= 0) {
        return base + 85;
      }
      if (".!?".indexOf(c) >= 0) {
        return base + 210;
      }
      if (c === "—") {
        return base + 130;
      }
      if (c === "\"") {
        return base + 55;
      }
      if (c === " ") {
        return base + 12;
      }
      var start = line.indexOf(big);
      if (start >= 0 && idx >= start && idx < start + big.length) {
        return base + 38;
      }
      return base;
    }

    function step() {
      if (i >= line.length) {
        window.setTimeout(function () {
          if (typeof done === "function") {
            done();
          }
        }, 360);
        return;
      }
      el.textContent += line.charAt(i);
      var d = delayAt(i);
      i += 1;
      window.setTimeout(step, d);
    }
    step();
  }

  function revealRiddleLine(lineIndex) {
    if (lineIndex >= RIDDLE_LINES.length) {
      window.setTimeout(function () {
        huntEl.textContent = "";
        typewriter(huntEl, HUNT_LINE, 95, null);
      }, 520);
      return;
    }

    var line = RIDDLE_LINES[lineIndex];
    var p = document.createElement("p");
    p.className = "riddle-line";
    if (line.indexOf("supercalifragilisticexpialidocious") >= 0) {
      p.classList.add("riddle-line--spark");
    }
    clueEl.appendChild(p);

    typewriterRhythm(p, line, function () {
      window.setTimeout(function () {
        revealRiddleLine(lineIndex + 1);
      }, 280);
    });
  }

  function revealRiddleInstant() {
    clueEl.textContent = "";
    RIDDLE_LINES.forEach(function (line) {
      var p = document.createElement("p");
      p.className = "riddle-line";
      if (line.indexOf("supercalifragilisticexpialidocious") >= 0) {
        p.classList.add("riddle-line--spark");
      }
      p.textContent = line;
      clueEl.appendChild(p);
    });
    huntEl.textContent = "";
    typewriter(huntEl, HUNT_LINE, 70, null);
  }

  function unlockForm() {
    if (!panelForm.hidden) {
      return;
    }

    var reduceMotion =
      typeof window.matchMedia === "function" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    var unlockMs = reduceMotion ? 200 : 780;

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
      /* Lock slot to matzah height so the panel stays centered where the matzah was. */
      panelForm.classList.remove("panel--pre", "panel--enter-active");
      if (matzahSlot && matzahStage && matzahStage.offsetHeight > 0) {
        matzahSlot.style.minHeight = Math.ceil(matzahStage.offsetHeight) + "px";
        matzahSlot.classList.add("matzah-slot--done");
      }
      /* Hiding the intro removes its layout height and pulls the stack upward — preserve
         the same vertical offset with a spacer so the email panel stays put. */
      if (intro && afikomanStack && shell) {
        var spacerH = afikomanStack.offsetTop - intro.offsetTop;
        if (spacerH <= 0 && intro.offsetHeight > 0) {
          spacerH = intro.offsetHeight;
        }
        if (spacerH > 0) {
          var existing = document.getElementById("intro-layout-spacer");
          if (existing) {
            existing.remove();
          }
          var spacer = document.createElement("div");
          spacer.id = "intro-layout-spacer";
          spacer.className = "intro-layout-spacer";
          spacer.setAttribute("aria-hidden", "true");
          spacer.style.height = Math.ceil(spacerH) + "px";
          shell.insertBefore(spacer, afikomanStack);
        }
        intro.hidden = true;
      } else if (intro) {
        intro.hidden = true;
      }
      if (matzahStage) {
        matzahStage.hidden = true;
      }
      emailInput.focus();
    }, unlockMs);
  }

  function revealSuccess() {
    panelForm.hidden = true;
    if (afikomanStack) {
      afikomanStack.hidden = true;
    }
    var layoutSpacer = document.getElementById("intro-layout-spacer");
    if (layoutSpacer) {
      layoutSpacer.remove();
    }
    if (shell) {
      shell.classList.add("shell--focus");
    }
    panelReveal.hidden = false;

    clueEl.textContent = "";
    huntEl.textContent = "";

    var reduceMotion =
      typeof window.matchMedia === "function" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (reduceMotion) {
      revealRiddleInstant();
    } else {
      revealRiddleLine(0);
    }
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
