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

    if (matzahStage) {
      matzahStage.classList.add("is-dismissing");
    }

    window.setTimeout(function () {
      if (matzahStage) {
        matzahStage.hidden = true;
      }
      panelForm.hidden = false;
      panelForm.classList.add("panel--enter");
      emailInput.focus();
    }, 520);
  }

  function revealSuccess() {
    panelForm.hidden = true;
    panelReveal.hidden = false;

    clueEl.textContent = PLACEHOLDER_CLUE;

    huntEl.textContent = "";
    typewriter(huntEl, HUNT_LINE, 120, null);
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

    fetch(endpoint, {
      method: "POST",
      redirect: "follow",
      credentials: "omit",
      headers: {
        "Content-Type": "text/plain;charset=utf-8",
      },
      body: JSON.stringify({ email: email }),
    })
      .then(function (res) {
        return res.text().then(function (text) {
          var data = null;
          try {
            data = text ? JSON.parse(text) : null;
          } catch (err) {
            data = null;
          }
          return { httpOk: res.ok, data: data };
        });
      })
      .then(function (result) {
        if (!result.httpOk) {
          throw new Error("Something went wrong. Try again.");
        }
        if (!result.data || result.data.ok !== true) {
          var msg =
            result.data && result.data.error
              ? String(result.data.error)
              : "Could not save.";
          throw new Error(msg);
        }
        revealSuccess();
      })
      .catch(function (err) {
        var msg =
          err && err.message
            ? err.message
            : "Network error — check connection or Apps Script deploy.";
        showError(msg);
      })
      .finally(function () {
        submitBtn.disabled = false;
        submitBtn.textContent = prevLabel;
      });
  });
})();
