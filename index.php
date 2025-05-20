<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>30,000 Particles</title>
    <style>
      @import url("https://fonts.googleapis.com/css?family=Poppins");

      html,
      body {
        background: #111;
        height: 100%;
        margin: 0;
      }

      #container {
        background: #111;
        position: absolute;
        left: 50%;
        top: 50%;
        transform: translate(-50%, -50%);
      }
    </style>
  </head>
  <body>
    <div id="container"></div>
    <script>
      var THICKNESS = Math.pow(80, 2),
        COLOR = 220,
        DRAG = 0.95,
        EASE = 0.25,
        SPACING = 4, // espace entre particules
        MARGIN = 100;

      var container, canvas, ctx, stats, list, tog, man, mx, my, w, h, p;

      // Nouvelle fonction pour générer les points à partir d'un texte
      function getTextPoints(text, font, fontSize, spacing) {
        // Création d'un canvas temporaire
        var tempCanvas = document.createElement("canvas");
        var tempCtx = tempCanvas.getContext("2d");
        tempCanvas.width = 800;
        tempCanvas.height = 300;
        tempCtx.clearRect(0, 0, tempCanvas.width, tempCanvas.height);
        tempCtx.font = fontSize + "px " + font;
        tempCtx.textBaseline = "top";
        // Centrage horizontal
        var textWidth = tempCtx.measureText(text).width;
        var tx = (tempCanvas.width - textWidth) / 2;
        tempCtx.fillStyle = "#fff";
        tempCtx.fillText(text, tx, 50);

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
              // alpha > 50%
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

        w = canvas.width = 800;
        h = canvas.height = 300;

        container.style.marginLeft = Math.round(w * -0.5) + "px";
        container.style.marginTop = Math.round(h * -0.5) + "px";

        // ---- Change ici le texte, la police et la taille ----
        var points = getTextPoints("CASSEZ LES CODES", "Poppins", 240, SPACING);

        // Crée les particules à partir des points
        for (var i = 0; i < points.length; i++) {
          p = {
            vx: 0,
            vy: 0,
            x: points[i].x + MARGIN,
            y: points[i].y + MARGIN,
            ox: points[i].x + MARGIN,
            oy: points[i].y + MARGIN,
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

      // Lance l'animation
      init();
      step();
    </script>
  </body>
</html>
