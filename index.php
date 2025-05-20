<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Interactive Particles Typography</title>
    <!-- Bootstrap CSS -->
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
    <!-- Google Fonts -->
    <link href="https://fonts.googleapis.com/css2?family=Luckiest+Guy&family=Bangers&family=Rubik+Iso&family=Oi&family=Roboto:wght@400&display=swap" rel="stylesheet">
    <!-- CSS -->
    <link rel="stylesheet" href="./assets/css/index.css" />
</head>

<body>
	// This is where the magic happens
    <div id="container"></div>

    <div id="fontMenu" class="card p-2">
        <div class="card-body text-white">
            <div>
                <label for="fontSelect" class="form-label">FONT</label>
                <select id="fontSelect" class="form-select form-select-sm">
                    <option value="'Luckiest Guy', cursive">Luckiest Guy</option>
                    <option value="'Bangers', cursive">Bangers</option>
                    <option value="'Rubik Iso', cursive">Rubik Iso</option>
                    <option value="'Oi', cursive">Oi</option>
                </select>
            </div>
            <hr class="my-2">
            <div class="mt-3">
                <div>
                    <label for="drag" class="form-label">DRAG: <span id="dragValue"></span></label>
                    <input type="range" class="form-range" id="drag" min="0.8" max="1" step="0.01" value="0.96">
                </div>
                <div>
                    <label for="ease" class="form-label">EASE: <span id="easeValue"></span></label>
                    <input type="range" class="form-range" id="ease" min="0.01" max="1" step="0.01" value="0.5">
                </div>
            </div>
            <hr class="my-2">
            <div class="mt-3">
                <div>
                    <label for="spacing" class="form-label">SPACING: <span id="spacingValue"></span></label>
                    <input type="range" class="form-range" id="spacing" min="1" max="10" value="1">
                </div>
                <div>
                    <label for="margin" class="form-label">MARGIN: <span id="marginValue"></span></label>
                    <input type="range" class="form-range" id="margin" min="0" max="300" value="100">
                </div>
                <div>
                    <label for="thickness" class="form-label">THICKNESS: <span id="thicknessValue"></span></label>
                    <input type="range" class="form-range" id="thickness" min="50" max="200" value="120">
                </div>
            </div>
        </div>
    </div>

    <a href="https://github.com/Mariollet/interactive_particles_typography" target="_blank" id="github-link" class="position-fixed bottom-0 end-0 m-3 text-decoration-none text-secondary small d-flex align-items-center" style="z-index:999;">
        <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="currentColor" class="bi bi-github me-1" viewBox="0 0 16 16">
            <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.19 0 .21.15.46.55.38A8.013 8.013 0 0 0 16 8c0-4.42-3.58-8-8-8z" />
        </svg>
        GitHub
    </a>

    <script>
        // Centralise la gestion des sliders/options
        const optionIds = [
            { id: 'drag', parse: parseFloat },
            { id: 'ease', parse: parseFloat },
            { id: 'spacing', parse: parseFloat },
            { id: 'margin', parse: parseFloat },
            { id: 'thickness', parse: v => Math.pow(parseFloat(v), 2) }
        ];

        const options = {};

        function updateRangeValue(id) {
            const input = document.getElementById(id);
            const valueSpan = document.getElementById(id + 'Value');
            if (valueSpan) valueSpan.textContent = input.value;
        }

        function updateOptionsFromInputs() {
            optionIds.forEach(opt => {
                const val = document.getElementById(opt.id).value;
                options[opt.id.toUpperCase()] = opt.parse(val);
            });
        }

        document.addEventListener('DOMContentLoaded', function () {
            optionIds.forEach(opt => {
                updateRangeValue(opt.id);
                document.getElementById(opt.id).addEventListener('input', function (e) {
                    updateRangeValue(opt.id);
                    updateOptionsFromInputs();
                    // Transition douce si spacing, margin, thickness, sinon live
                    if (['spacing', 'margin', 'thickness'].includes(opt.id)) {
                        init(true);
                    }
                });
            });
            updateOptionsFromInputs();
        });

        let container, canvas, ctx, stats, list, tog, man, mx, my, w, h, p;
        let currentFont = "'Luckiest Guy', cursive";

        function getTextPoints(text, font, fontSize, spacing, width, height) {
            let tempCanvas = document.createElement("canvas");
            let tempCtx = tempCanvas.getContext("2d");
            tempCanvas.width = width;
            tempCanvas.height = height;
            tempCtx.clearRect(0, 0, tempCanvas.width, tempCanvas.height);
            tempCtx.font = "bold " + fontSize + "px " + font;
            tempCtx.textBaseline = "top";
            tempCtx.fillStyle = "#fff";

            let lines = text.split('\n');
            let lineHeight = fontSize * 1.1;
            let totalHeight = lines.length * lineHeight;
            let startY = (tempCanvas.height - totalHeight) / 2;

            for (let i = 0; i < lines.length; i++) {
                let textWidth = tempCtx.measureText(lines[i]).width;
                let tx = (tempCanvas.width - textWidth) / 2;
                let ty = startY + i * lineHeight;
                tempCtx.fillText(lines[i], tx, ty);
            }

            let points = [];
            let imageData = tempCtx.getImageData(
                0,
                0,
                tempCanvas.width,
                tempCanvas.height
            ).data;
            for (let y = 0; y < tempCanvas.height; y += spacing) {
                for (let x = 0; x < tempCanvas.width; x += spacing) {
                    let i = (y * tempCanvas.width + x) * 4;
                    if (imageData[i + 3] > 128) {
                        points.push({ x: x, y: y });
                    }
                }
            }
            return points;
        }

        let transitionStep = 0;
        let transitionFrames = 40;
        let transitioning = false;

        function init(transition) {
            container = document.getElementById("container");
            if (!canvas) {
                canvas = document.createElement("canvas");
                ctx = canvas.getContext("2d");
                container.appendChild(canvas);
            }
            man = true;
            tog = true;

            w = canvas.width = window.innerWidth;
            h = canvas.height = window.innerHeight;

            const { THICKNESS, DRAG, EASE, SPACING, MARGIN } = options;

            let points = getTextPoints(
                "CASSEZ\nLES CODES",
                currentFont,
                Math.floor(h / 4),
                SPACING,
                w,
                h
            );

            if (transition && list && list.length) {
                transitionStep = 0;
                transitioning = true;
                while (list.length < points.length) {
                    let last = list[list.length - 1];
                    list.push({
                        vx: 0, vy: 0,
                        x: last ? last.x : 0, y: last ? last.y : 0,
                        ox: last ? last.x : 0, oy: last ? last.y : 0,
                        startx: last ? last.x : 0, starty: last ? last.y : 0
                    });
                }
                if (list.length > points.length) {
                    list = list.slice(0, points.length);
                }
                for (let i = 0; i < list.length; i++) {
                    list[i].startx = list[i].x;
                    list[i].starty = list[i].y;
                    list[i].ox = points[i].x;
                    list[i].oy = points[i].y;
                }
            } else {
                list = [];
                for (let i = 0; i < points.length; i++) {
                    p = {
                        vx: 0, vy: 0,
                        x: points[i].x, y: points[i].y,
                        ox: points[i].x, oy: points[i].y,
                    };
                    list.push(p);
                }
            }

            container.addEventListener("mousemove", function (e) {
                let bounds = container.getBoundingClientRect();
                mx = e.clientX - bounds.left;
                my = e.clientY - bounds.top;
                man = true;
            });

            if (typeof Stats === "function") {
                document.body.appendChild((stats = new Stats()).domElement);
            }
        }

        function step() {
            const { THICKNESS, DRAG, EASE } = options;
            if (stats) stats.begin();

            if (transitioning) {
                transitionStep++;
                let t = Math.min(1, transitionStep / transitionFrames);
                for (let i = 0; i < list.length; i++) {
                    list[i].x = list[i].startx + (list[i].ox - list[i].startx) * t;
                    list[i].y = list[i].starty + (list[i].oy - list[i].starty) * t;
                }
                if (t >= 1) {
                    transitioning = false;
                }
            } else if ((tog = !tog)) {
                if (!man) {
                    let t = +new Date() * 0.001;
                    mx = w * 0.5 + Math.cos(t * 2.1) * Math.cos(t * 0.9) * w * 0.45;
                    my =
                        h * 0.5 +
                        Math.sin(t * 3.2) * Math.tan(Math.sin(t * 0.8)) * h * 0.45;
                }

                for (let i = 0; i < list.length; i++) {
                    p = list[i];
                    let dx = mx - p.x;
                    let dy = my - p.y;
                    let d = dx * dx + dy * dy;
                    let f = -THICKNESS / d;
                    if (d < THICKNESS) {
                        let t = Math.atan2(dy, dx);
                        p.vx += f * Math.cos(t);
                        p.vy += f * Math.sin(t);
                    }
                    p.x += (p.vx *= DRAG) + (p.ox - p.x) * EASE;
                    p.y += (p.vy *= DRAG) + (p.oy - p.y) * EASE;
                }
            } else {
                let a = ctx.createImageData(w, h);
                let b = a.data;
                for (let i = 0; i < list.length; i++) {
                    p = list[i];
                    let n = (~~p.x + ~~p.y * w) * 4;
                    b[n] = b[n + 1] = b[n + 2] = 255;
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

        document.getElementById('fontSelect').addEventListener('change', function (e) {
            currentFont = e.target.value;
            if (document.fonts && document.fonts.load) {
                document.fonts.load('bold 40px ' + currentFont).then(function () {
                    init(true);
                });
            } else {
                init(true);
            }
        });

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