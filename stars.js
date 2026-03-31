(function () {
  "use strict";

  var canvas = document.getElementById("stars-canvas");
  if (!canvas) return;

  var ctx = canvas.getContext("2d");
  var stars = [];
  var w = 0;
  var h = 0;
  var dpr = Math.min(window.devicePixelRatio || 1, 2);

  function resize() {
    w = window.innerWidth;
    h = window.innerHeight;
    canvas.width = Math.floor(w * dpr);
    canvas.height = Math.floor(h * dpr);
    canvas.style.width = w + "px";
    canvas.style.height = h + "px";
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    initStars();
  }

  function initStars() {
    stars = [];
    var count = Math.min(520, Math.floor((w * h) / 1700));
    for (var i = 0; i < count; i++) {
      stars.push({
        x: Math.random() * w,
        y: Math.random() * h,
        r: Math.random() * 1.4 + 0.2,
        a: Math.random() * 0.55 + 0.25,
        tw: Math.random() * Math.PI * 2,
        sp: 0.4 + Math.random() * 1.2,
      });
    }
  }

  var t = 0;
  function frame() {
    t += 0.016;
    ctx.clearRect(0, 0, w, h);
    for (var i = 0; i < stars.length; i++) {
      var s = stars[i];
      var flicker = 0.68 + 0.32 * Math.sin(t * s.sp + s.tw);
      var a = s.a * flicker;
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(255, 255, 255, " + a + ")";
      ctx.fill();
    }
    requestAnimationFrame(frame);
  }

  window.addEventListener("resize", resize);
  resize();
  requestAnimationFrame(frame);
})();
