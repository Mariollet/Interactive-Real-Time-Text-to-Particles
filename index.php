<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>KG Particles</title>
    <!-- Ajout de la font Bangers -->
    <link href="https://fonts.googleapis.com/css2?family=Bangers&display=swap" rel="stylesheet">
    <style>
      html,
      body {
        background: #111;
        height: 100vh;
        width: 100vw;
        margin: 0;
        padding: 0;
        overflow: hidden;
        font-family: 'Bangers', Impact, 'Comic Sans MS', 'Arial Black', cursive, sans-serif;
      }

      #container {
        background: transparent;
        width: 100vw;
        height: 100vh;
        position: absolute;
        left: 0;
        top: 0;
        margin: 0;
        padding: 0;
      }
    </style>
  </head>
  <body>
    <div id="container"></div>
    <script>
      var THICKNESS = Math.pow(80, 2),
        COLOR = 255,
        DRAG = 0.95,
        EASE = 0.25,
        SPACING = 4,
        MARGIN = 100;

      var container, canvas, ctx, stats, list, tog, man, mx, my, w, h, p;

      // Gère les retours à la ligne pour le texte
      function getTextPoints(text, font, fontSize, spacing, width, height) {
        var tempCanvas = document.createElement("canvas");
        var tempCtx = tempCanvas.getContext("2d");
        tempCanvas.width = width;
        tempCanvas.height = height;
        tempCtx.clearRect(0, 0, tempCanvas.width, tempCanvas.height);
        tempCtx.font = "bold " + fontSize + "px " + font;
        tempCtx.textBaseline = "top";
        tempCtx.fillStyle = "#fff";

        var lines = text.split('\n');
        var lineHeight = fontSize * 1.1;
        var totalHeight = lines.length * lineHeight;
        var startY = (tempCanvas.height - totalHeight) / 2;

        for (var i = 0; i < lines.length; i++) {
          var textWidth = tempCtx.measureText(lines[i]).width;
          var tx = (tempCanvas.width - textWidth) / 2;
          var ty = startY + i * lineHeight;
          tempCtx.fillText(lines[i], tx, ty);
        }

        var points = [];
        var imageData = tempCtx.getImageData(
          0,
          0,
          tempCanvas.width,
          tempCanvas.height
        ).data;
        for (var y = 0; y < tempCanvas.height; y += spacing) {
          for (var x = 0; x < tempCanvas.width; x += spacing) {
            var i = (y * tempCanvas.width + x) * 4;
            if (imageData[i + 3] > 128) {
              points.push({ x: x, y: y });
            }
          }
        }
        return points;
      }

      function init() {
        container = document.getElementById("container");
        canvas = document.createElement("canvas");
        ctx = canvas.getContext("2d");
        man = true;
        tog = true;
        list = [];

        w = canvas.width = window.innerWidth;
        h = canvas.height = window.innerHeight;

        // Utilise la font cartoon Bangers
        var points = getTextPoints(
          "CASSEZ\nLES CODES",
          "'Bangers', Impact, 'Comic Sans MS', 'Arial Black', cursive, sans-serif",
          Math.floor(h / 4),
          SPACING,
          w,
          h
        );

        for (var i = 0; i < points.length; i++) {
          p = {
            vx: 0,
            vy: 0,
            x: points[i].x,
            y: points[i].y,
            ox: points[i].x,
            oy: points[i].y,
          };
          list.push(p);
        }

        container.addEventListener("mousemove", function (e) {
          var bounds = container.getBoundingClientRect();
          mx = e.clientX - bounds.left;
          my = e.clientY - bounds.top;
          man = true;
        });

        if (typeof Stats === "function") {
          document.body.appendChild((stats = new Stats()).domElement);
        }

        container.appendChild(canvas);
      }

      function step() {
        if (stats) stats.begin();

        if ((tog = !tog)) {
          if (!man) {
            var t = +new Date() * 0.001;
            mx = w * 0.5 + Math.cos(t * 2.1) * Math.cos(t * 0.9) * w * 0.45;
            my =
              h * 0.5 +
              Math.sin(t * 3.2) * Math.tan(Math.sin(t * 0.8)) * h * 0.45;
          }

          for (var i = 0; i < list.length; i++) {
            p = list[i];
            var dx = mx - p.x;
            var dy = my - p.y;
            var d = dx * dx + dy * dy;
            var f = -THICKNESS / d;
            if (d < THICKNESS) {
              var t = Math.atan2(dy, dx);
              p.vx += f * Math.cos(t);
              p.vy += f * Math.sin(t);
            }
            p.x += (p.vx *= DRAG) + (p.ox - p.x) * EASE;
            p.y += (p.vy *= DRAG) + (p.oy - p.y) * EASE;
          }
        } else {
          var a = ctx.createImageData(w, h);
          var b = a.data;
          for (var i = 0; i < list.length; i++) {
            p = list[i];
            var n = (~~p.x + ~~p.y * w) * 4;
            b[n] = b[n + 1] = b[n + 2] = COLOR;
            b[n + 3] = 255;
          }
          ctx.putImageData(a, 0, 0);
        }

        if (stats) stats.end();
        requestAnimationFrame(step);
      }

      window.addEventListener("resize", function () {
        container.innerHTML = "";
        init();
      });

      // Attendre que la font soit chargée avant d'initialiser
      if (document.fonts && document.fonts.ready) {
        document.fonts.ready.then(function () {
          init();
          step();
        });
      } else {
        window.onload = function () {
          init();
          step();
        };
      }
    </script>
  </body>
</html>
