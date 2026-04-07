(function () {
  "use strict";

  var form = document.getElementById("signup-form");
  var matzah = document.getElementById("matzah");
  var matzahStage = document.getElementById("matzah-stage");
  var emailInput = document.getElementById("email");
  var submitBtn = document.getElementById("submit-btn");
  var formError = document.getElementById("form-error");
  var formSaving = document.getElementById("form-saving");
  var panelForm = document.getElementById("panel-form");
  var panelReveal = document.getElementById("panel-reveal");
  var shell = document.getElementById("shell");
  var intro = document.getElementById("intro");
  var afikomanStack = document.getElementById("afikoman-stack");
  var matzahSlot = document.getElementById("matzah-slot");
  var proxyForm = document.getElementById("sheet-proxy-form");
  var proxyEmail = document.getElementById("sheet-proxy-email");
  var proxyFrame = document.getElementById("sheet-proxy-frame");
  var karaokePanel = document.getElementById("karaoke-panel");
  var karaokeLyrics = document.getElementById("karaoke-lyrics");
  var kiteVideo = document.getElementById("kite-video");
  var karaokeVideoWrap = document.querySelector(".karaoke-video-wrap");
  var karaokeOutro = document.getElementById("karaoke-outro");

  var KITE_VIDEO_SRC =
    typeof window.KITE_VIDEO_SRC === "string" && window.KITE_VIDEO_SRC.trim()
      ? window.KITE_VIDEO_SRC.trim()
      : "assets/kite-song.mp4";

  /** Seconds into the MP4 when singing begins (lyric clock uses time since this moment). */
  var KITE_SONG_START_SEC =
    typeof window.KITE_SONG_START_SEC === "number" && !isNaN(window.KITE_SONG_START_SEC)
      ? window.KITE_SONG_START_SEC
      : 5;

  var KITE_LYRIC_MS_PER_CHAR =
    typeof window.KITE_LYRIC_MS_PER_CHAR === "number" && window.KITE_LYRIC_MS_PER_CHAR > 0
      ? window.KITE_LYRIC_MS_PER_CHAR
      : 28;

  /**
   * Film transcript wording (Mary Poppins). Spoken Mrs. Banks / Constable lines omitted.
   * Timing: seconds after KITE_SONG_START_SEC (singing begins ~5s into the MP4).
   */
  var KITE_VIDEO_LINES = [
    "With tuppence for paper and strings",
    "You can have your own set of wings",
    "With your feet on the ground",
    "You're a bird in flight",
    "With your fist holding tight",
    "To the string of your kite",
    "Oh, oh, oh",
    "Let's go fly a kite",
    "Up to the highest height!",
    "Let's go fly a kite",
    "And send it soaring",
    "Up through the atmosphere",
    "Up where the air is clear",
    "Oh, let's go fly a kite!",
    "Let's go fly a kite",
    "Up to the highest height!",
    "Let's go fly a kite and send it soaring",
    "Up through the atmosphere",
    "Up where the air is clear",
    "Oh, let's go fly a kite!",
    "When you send it flying up there",
    "All at once you're lighter than air",
    "You can dance on the breeze",
    "Over houses and trees",
    "With your fist holding tight",
    "To the string of your kite",
    "Oh, oh, oh",
    "Now!",
    "Let's go fly a kite",
    "Up to the highest height!",
    "Let's go fly a kite and send it soaring",
    "Up through the atmosphere",
    "Up where the air is clear",
    "Oh, let's go fly a kite!",
  ];

  /**
   * Banks Family chorus after dialogue (~1:00). Bert verse pulled earlier vs old 1:32 map; tail gaps scaled.
   * Override in config.js if your rip differs.
   */
  var KITE_LYRIC_RESUME_SEC =
    typeof window.KITE_LYRIC_RESUME_SEC === "number" && !isNaN(window.KITE_LYRIC_RESUME_SEC)
      ? window.KITE_LYRIC_RESUME_SEC
      : 60;

  /** Seconds after vocal start when Bert’s verse begins (default ~1:27; tune if your rip leads the old 1:32 map). */
  var KITE_LYRIC_VERSE_START_SEC =
    typeof window.KITE_LYRIC_VERSE_START_SEC === "number" && !isNaN(window.KITE_LYRIC_VERSE_START_SEC)
      ? window.KITE_LYRIC_VERSE_START_SEC
      : 87;

  /** Scale Bert→finale inter-line gaps (<1 = slightly earlier next lines, reduces drift). */
  var KITE_LYRIC_BERT_TAIL_GAP_SCALE =
    typeof window.KITE_LYRIC_BERT_TAIL_GAP_SCALE === "number" &&
    !isNaN(window.KITE_LYRIC_BERT_TAIL_GAP_SCALE) &&
    window.KITE_LYRIC_BERT_TAIL_GAP_SCALE > 0
      ? window.KITE_LYRIC_BERT_TAIL_GAP_SCALE
      : 0.93;

  var KITE_LYRIC_CUES = (function () {
    var resume = KITE_LYRIC_RESUME_SEC;
    var tBert = KITE_LYRIC_VERSE_START_SEC;
    /* Opening verse + chorus: aligned to original film subtitle pacing (vocal t=0 at MP4+5s). */
    var t0 = 0;
    var open = [
      { line: 0, t: t0 + 0 },
      { line: 1, t: t0 + 2.617 },
      { line: 2, t: t0 + 6.107 },
      { line: 3, t: t0 + 8.442 },
      { line: 4, t: t0 + 11.612 },
      { line: 5, t: t0 + 15.366 },
      { line: 6, t: t0 + 17.451 },
      { line: 7, t: t0 + 20.288 },
      { line: 8, t: t0 + 23.958 },
      { line: 9, t: t0 + 27.461 },
      { line: 10, t: t0 + 30.2 },
      { line: 11, t: t0 + 35.597 },
      { line: 12, t: t0 + 38.055 },
      { line: 13, t: t0 + 41.602 },
    ];
    /* Banks Family chorus: same spacing as George’s chorus (lines 7–13), starting at resume. */
    var ch0 = 20.288;
    var banks = [
      { line: 14, t: resume },
      { line: 15, t: resume + (23.958 - ch0) },
      { line: 16, t: resume + (27.461 - ch0) },
      { line: 17, t: resume + (35.597 - ch0) },
      { line: 18, t: resume + (38.055 - ch0) },
      { line: 19, t: resume + (41.602 - ch0) },
    ];
    /* Bert → finale: anchor line 20 at tBert; following gaps from film map × scale so lines don’t lag. */
    var filmTailT = [
      52.602, 55.619, 59.109, 61.444, 64.614, 68.368, 70.451, 71.35, 73.288, 76.958, 80.461, 88.597, 91.055,
      94.604,
    ];
    var gapScale = KITE_LYRIC_BERT_TAIL_GAP_SCALE;
    var tail = [];
    var tCur = tBert;
    var ti;
    tail.push({ line: 20, t: tBert });
    for (ti = 1; ti < filmTailT.length; ti++) {
      tCur += (filmTailT[ti] - filmTailT[ti - 1]) * gapScale;
      tail.push({ line: 20 + ti, t: tCur });
    }
    return open.concat(banks, tail);
  })();

  var KITE_LAST_CUE_INDEX = KITE_LYRIC_CUES.length - 1;

  function escapeHtml(s) {
    return String(s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function buildLineUpMatches(lines) {
    var out = [];
    var ord = 1;
    var li, line, re, m, row;
    for (li = 0; li < lines.length; li++) {
      line = lines[li];
      row = [];
      re = /\bup\b/gi;
      while ((m = re.exec(line)) !== null) {
        row.push({ start: m.index, end: m.index + m[0].length, ord: ord++ });
      }
      out.push(row);
    }
    return out;
  }

  var KITE_LINE_UP_MATCHES = buildLineUpMatches(KITE_VIDEO_LINES);

  /** Each full "up" (word) gets a larger font than the previous across the whole song. */
  function buildLyricHtmlSlice(line, j, matches) {
    if (j <= 0) {
      return "";
    }
    var cursor = 0;
    var k, m, html, growEm;
    html = "";
    matches = matches || [];
    for (k = 0; k < matches.length; k++) {
      m = matches[k];
      if (m.start >= j) {
        break;
      }
      if (m.start > cursor) {
        html += escapeHtml(line.slice(cursor, Math.min(m.start, j)));
        cursor = m.start;
        if (cursor >= j) {
          break;
        }
      }
      if (j >= m.end) {
        /* Each “up” doubles the previous size (1em → 2em → 4em …), capped so lines stay usable. */
        growEm = Math.min(Math.pow(2, m.ord - 1), 16);
        html +=
          '<span class="karaoke-up" style="font-size:calc(1em * ' +
          growEm +
          ')">' +
          escapeHtml(line.slice(m.start, m.end)) +
          "</span>";
        cursor = m.end;
      } else {
        html += escapeHtml(line.slice(m.start, j));
        cursor = j;
        break;
      }
    }
    if (cursor < j) {
      html += escapeHtml(line.slice(cursor, j));
    }
    return html;
  }

  function setKaraokeLineHtml(p, lineIndex, visibleLen) {
    var line = KITE_VIDEO_LINES[lineIndex];
    var j = typeof visibleLen === "number" ? visibleLen : line.length;
    p.innerHTML = buildLyricHtmlSlice(line, j, KITE_LINE_UP_MATCHES[lineIndex]);
  }

  var KARAOKE_OUTRO_GAP_MS = 480;
  var KARAOKE_OUTRO_MS_PER_CHAR = Math.max(22, Math.round(KITE_LYRIC_MS_PER_CHAR * 0.95));

  var karaokeFinaleActive = false;
  var outroIntervals = [];
  var outroTimeouts = [];

  function clearOutroAnimTimers() {
    outroIntervals.forEach(function (id) {
      window.clearInterval(id);
    });
    outroTimeouts.forEach(function (id) {
      window.clearTimeout(id);
    });
    outroIntervals = [];
    outroTimeouts = [];
  }

  function resetKaraokeFinale() {
    clearOutroAnimTimers();
    karaokeFinaleActive = false;
    if (karaokeVideoWrap) {
      karaokeVideoWrap.classList.remove("karaoke-video-wrap--fadeout");
      karaokeVideoWrap.removeAttribute("hidden");
    }
    if (karaokeLyrics) {
      karaokeLyrics.removeAttribute("hidden");
    }
    if (karaokeOutro) {
      karaokeOutro.classList.remove("karaoke-outro--solo");
      karaokeOutro.hidden = true;
      var kids = karaokeOutro.querySelectorAll(".karaoke-outro__line");
      var ki;
      for (ki = 0; ki < kids.length; ki++) {
        kids[ki].textContent = "";
      }
    }
  }

  function prefersReducedMotionOutro() {
    return (
      typeof window.matchMedia === "function" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    );
  }

  function typePlainIntoElement(el, text, msPerChar, done) {
    if (!el) {
      if (done) {
        done();
      }
      return;
    }
    if (prefersReducedMotionOutro()) {
      el.textContent = text;
      if (done) {
        done();
      }
      return;
    }
    var j = 0;
    var id = window.setInterval(function () {
      if (j <= text.length) {
        el.textContent = text.slice(0, j);
        j += 1;
      } else {
        window.clearInterval(id);
        var ix = outroIntervals.indexOf(id);
        if (ix >= 0) {
          outroIntervals.splice(ix, 1);
        }
        if (done) {
          done();
        }
      }
    }, msPerChar);
    outroIntervals.push(id);
  }

  function runKaraokeOutroTyping() {
    var seq = [
      { id: "karaoke-outro-l0", text: "Chag Sameach!" },
      { id: "karaoke-outro-l1", text: "\u05d7\u05d2 \u05e9\u05de\u05d7" },
      { id: "karaoke-outro-l2", text: "Happy Passover!" },
      { id: "karaoke-outro-l3", text: "Happy hunting!" },
    ];
    var ms = KARAOKE_OUTRO_MS_PER_CHAR;
    var gap = KARAOKE_OUTRO_GAP_MS;

    function step(i) {
      if (i >= seq.length) {
        return;
      }
      var el = document.getElementById(seq[i].id);
      typePlainIntoElement(el, seq[i].text, ms, function () {
        var t = window.setTimeout(function () {
          var ix = outroTimeouts.indexOf(t);
          if (ix >= 0) {
            outroTimeouts.splice(ix, 1);
          }
          step(i + 1);
        }, gap);
        outroTimeouts.push(t);
      });
    }

    step(0);
  }

  function startKaraokeFinale() {
    if (karaokeFinaleActive || !karaokePanel) {
      return;
    }
    karaokeFinaleActive = true;

    if (lyricRaf) {
      window.cancelAnimationFrame(lyricRaf);
      lyricRaf = 0;
    }

    if (kiteVideo) {
      try {
        kiteVideo.pause();
      } catch (err) {
        /* ignore */
      }
    }

    if (karaokeVideoWrap) {
      karaokeVideoWrap.classList.remove("karaoke-video-wrap--fadeout");
      karaokeVideoWrap.setAttribute("hidden", "");
    }
    if (karaokeLyrics) {
      karaokeLyrics.textContent = "";
      karaokeLyrics.setAttribute("hidden", "");
    }

    if (!karaokeOutro) {
      return;
    }
    karaokeOutro.hidden = false;
    karaokeOutro.classList.add("karaoke-outro--solo");
    try {
      karaokeOutro.scrollIntoView({
        block: "center",
        behavior: prefersReducedMotionOutro() ? "auto" : "smooth",
      });
    } catch (err) {
      karaokeOutro.scrollIntoView(false);
    }
    runKaraokeOutroTyping();
  }

  var endpoint =
    typeof window.SHEETS_ENDPOINT === "string" ? window.SHEETS_ENDPOINT.trim() : "";

  var lineTriggered = [];
  var lineDom = [];
  var typingQueue = [];
  var isTypingLine = false;
  var currentTypingIdx = -1;
  var typewriterTimer = 0;
  var lyricRaf = 0;

  function resetLyricSync() {
    resetKaraokeFinale();
    if (typewriterTimer) {
      window.clearInterval(typewriterTimer);
      typewriterTimer = 0;
    }
    if (lyricRaf) {
      window.cancelAnimationFrame(lyricRaf);
      lyricRaf = 0;
    }
    typingQueue = [];
    isTypingLine = false;
    currentTypingIdx = -1;
    lineTriggered = new Array(KITE_LYRIC_CUES.length).fill(false);
    lineDom = new Array(KITE_LYRIC_CUES.length).fill(null);
    if (karaokeLyrics) {
      karaokeLyrics.textContent = "";
    }
  }

  function scrollLyricsDown() {
    if (!karaokeLyrics) {
      return;
    }
    karaokeLyrics.scrollTop = karaokeLyrics.scrollHeight;
  }

  function songTimeFromVideo() {
    if (!kiteVideo) {
      return -1;
    }
    return kiteVideo.currentTime - KITE_SONG_START_SEC;
  }

  function enqueueDueLines(songT) {
    if (songT < 0) {
      return;
    }
    var i;
    for (i = 0; i < KITE_LYRIC_CUES.length; i++) {
      if (!lineTriggered[i] && songT >= KITE_LYRIC_CUES[i].t) {
        lineTriggered[i] = true;
        typingQueue.push(i);
      }
    }
  }

  function flushTypingQueue() {
    if (isTypingLine || typingQueue.length === 0 || !karaokeLyrics) {
      return;
    }
    var reduceMotion =
      typeof window.matchMedia === "function" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    var cueIdx = typingQueue.shift();
    var cue = KITE_LYRIC_CUES[cueIdx];
    var lineIdx = cue.line;
    var text = KITE_VIDEO_LINES[lineIdx];
    var p = document.createElement("p");
    p.className = "karaoke-line";
    karaokeLyrics.appendChild(p);
    lineDom[cueIdx] = p;
    isTypingLine = true;
    currentTypingIdx = cueIdx;

    if (reduceMotion) {
      setKaraokeLineHtml(p, lineIdx);
      isTypingLine = false;
      currentTypingIdx = -1;
      scrollLyricsDown();
      flushTypingQueue();
      if (cueIdx === KITE_LAST_CUE_INDEX) {
        startKaraokeFinale();
      }
      return;
    }

    var j = 0;
    typewriterTimer = window.setInterval(function () {
      if (j <= text.length) {
        setKaraokeLineHtml(p, lineIdx, j);
        j += 1;
        scrollLyricsDown();
      } else {
        window.clearInterval(typewriterTimer);
        typewriterTimer = 0;
        isTypingLine = false;
        currentTypingIdx = -1;
        var finishedLastCue = cueIdx === KITE_LAST_CUE_INDEX;
        flushTypingQueue();
        if (finishedLastCue) {
          startKaraokeFinale();
        }
      }
    }, KITE_LYRIC_MS_PER_CHAR);
  }

  function catchUpLyricsForSeek() {
    if (!karaokeLyrics) {
      return;
    }
    var songT = songTimeFromVideo();
    var i;
    for (i = 0; i < KITE_LYRIC_CUES.length; i++) {
      var cue = KITE_LYRIC_CUES[i];
      if (songT >= cue.t) {
        lineTriggered[i] = true;
        if (!lineDom[i]) {
          var pEl = document.createElement("p");
          pEl.className = "karaoke-line";
          setKaraokeLineHtml(pEl, cue.line);
          karaokeLyrics.appendChild(pEl);
          lineDom[i] = pEl;
        }
      } else {
        lineTriggered[i] = false;
        if (lineDom[i] && lineDom[i].parentNode) {
          lineDom[i].parentNode.removeChild(lineDom[i]);
        }
        lineDom[i] = null;
      }
    }
    typingQueue = [];
    isTypingLine = false;
    currentTypingIdx = -1;
    scrollLyricsDown();
  }

  function lyricTick() {
    if (!kiteVideo || kiteVideo.paused) {
      lyricRaf = 0;
      return;
    }
    enqueueDueLines(songTimeFromVideo());
    if (!isTypingLine) {
      flushTypingQueue();
    }
    lyricRaf = window.requestAnimationFrame(lyricTick);
  }

  function onPlayLyrics() {
    if (lyricRaf) {
      window.cancelAnimationFrame(lyricRaf);
    }
    lyricRaf = window.requestAnimationFrame(lyricTick);
  }

  function onPauseLyrics() {
    if (lyricRaf) {
      window.cancelAnimationFrame(lyricRaf);
      lyricRaf = 0;
    }
    if (typewriterTimer) {
      window.clearInterval(typewriterTimer);
      typewriterTimer = 0;
    }
    if (isTypingLine && currentTypingIdx >= 0 && lineDom[currentTypingIdx]) {
      setKaraokeLineHtml(lineDom[currentTypingIdx], KITE_LYRIC_CUES[currentTypingIdx].line);
    }
    isTypingLine = false;
    currentTypingIdx = -1;
    /* Do not flushTypingQueue here — avoids typing ahead while paused; play resumes via lyricTick. */
  }

  function onSeekLyrics() {
    onPauseLyrics();
    resetKaraokeFinale();
    if (!karaokeLyrics) {
      return;
    }
    karaokeLyrics.textContent = "";
    lineTriggered = new Array(KITE_LYRIC_CUES.length).fill(false);
    lineDom = new Array(KITE_LYRIC_CUES.length).fill(null);
    typingQueue = [];
    catchUpLyricsForSeek();
    if (kiteVideo && !kiteVideo.paused) {
      onPlayLyrics();
    }
  }

  var kiteVideoLyricsWired = false;

  function wireKiteVideoLyrics() {
    if (!kiteVideo || kiteVideoLyricsWired) {
      return;
    }
    kiteVideoLyricsWired = true;
    kiteVideo.addEventListener("play", onPlayLyrics);
    kiteVideo.addEventListener("pause", onPauseLyrics);
    kiteVideo.addEventListener("seeked", onSeekLyrics);
  }

  function showError(msg) {
    formError.textContent = msg;
    formError.hidden = false;
  }

  function clearError() {
    formError.textContent = "";
    formError.hidden = true;
  }

  function setSavingState(active) {
    if (formSaving) {
      formSaving.hidden = !active;
    }
    if (form) {
      form.setAttribute("aria-busy", active ? "true" : "false");
    }
    if (submitBtn) {
      if (active) {
        submitBtn.classList.add("submit-btn--loading");
      } else {
        submitBtn.classList.remove("submit-btn--loading");
      }
    }
  }

  function isValidEmail(value) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  }

  function beginSimpleKaraoke() {
    if (!karaokePanel || karaokePanel.getAttribute("data-karaoke-started") === "1") {
      return;
    }
    karaokePanel.setAttribute("data-karaoke-started", "1");

    resetLyricSync();
    wireKiteVideoLyrics();

    if (kiteVideo) {
      var source = kiteVideo.querySelector("source");
      if (source) {
        source.src = KITE_VIDEO_SRC;
      }

      function jumpToSongStart() {
        try {
          kiteVideo.currentTime = KITE_SONG_START_SEC;
        } catch (err) {
          /* ignore */
        }
      }

      kiteVideo.addEventListener(
        "loadedmetadata",
        function () {
          jumpToSongStart();
        },
        { once: true }
      );

      kiteVideo.load();

      if (window.location.protocol !== "file:") {
        var tryPlay = function () {
          jumpToSongStart();
          var playAttempt = kiteVideo.play();
          if (playAttempt !== undefined && playAttempt.catch) {
            playAttempt.catch(function () {});
          }
        };
        if (kiteVideo.readyState >= 1) {
          window.setTimeout(tryPlay, 0);
        } else {
          kiteVideo.addEventListener(
            "canplay",
            function () {
              tryPlay();
            },
            { once: true }
          );
        }
      }
    }
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

    panelForm.hidden = false;
    panelForm.classList.add("panel--pre");

    window.requestAnimationFrame(function () {
      window.requestAnimationFrame(function () {
        panelForm.classList.add("panel--enter-active");
      });
    });

    window.setTimeout(function () {
      panelForm.classList.remove("panel--pre", "panel--enter-active");
      if (matzahSlot && matzahStage && matzahStage.offsetHeight > 0) {
        matzahSlot.style.minHeight = Math.ceil(matzahStage.offsetHeight) + "px";
        matzahSlot.classList.add("matzah-slot--done");
      }
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
    beginSimpleKaraoke();
  }

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
      setSavingState(false);
      submitBtn.disabled = false;
      submitBtn.textContent = prevLabel;
      revealSuccess();
    }

    function onLoad() {
      cleanup();
    }

    if (!proxyForm) {
      submitBtn.disabled = false;
      showError("Something went wrong. Refresh and try again.");
      return;
    }

    if (proxyFrame) {
      proxyFrame.addEventListener("load", onLoad);
    }

    proxyForm.action = endpoint;
    proxyEmail.value = email;

    setSavingState(true);

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

    submitEmailToSheet(email, prevLabel);
  });
})();
