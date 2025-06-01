import Stats from "https://cdnjs.cloudflare.com/ajax/libs/stats.js/17/Stats.js";

// =======================
// UI OPTIONS & MANAGEMENT
// =======================

// List of all UI controls with their parsing logic and option keys
const optionIds = [
    { id: "fontSelect", parse: (v) => v, key: "FONT" },
    { id: "sentenceInput", parse: (v) => v, key: "TEXT" },
    { id: "fontWeight", parse: (v) => v, key: "FONT_WEIGHT" },
    { id: "drag", parse: parseFloat, key: "DRAG" },
    { id: "ease", parse: parseFloat, key: "EASE" },
    { id: "spacing", parse: parseFloat, key: "SPACING" },
    {
        id: "thickness",
        parse: (v) => Math.pow(parseFloat(v), 2),
        key: "THICKNESS",
    },
    { id: "lerp", parse: parseFloat, key: "LERP" },
    { id: "randomize", parse: (v) => !!v, key: "RANDOMIZE" },
    { id: "coloredParticles", parse: (v) => !!v, key: "COLORED_PARTICLES" },
];

const options = {};
let randomizeInterval = null;

// Update the displayed value next to each slider
function updateRangeValue(id) {
    const input = document.getElementById(id);
    const valueSpan = document.getElementById(id + "Value");
    if (valueSpan) valueSpan.textContent = input.value;
}

// Sync all slider/input values to the options object
function updateOptionsFromInputs() {
    optionIds.forEach((opt) => {
        const el = document.getElementById(opt.id);
        if (el) {
            let val;
            if (el.type === "checkbox") {
                val = el.checked;
            } else {
                val = el.value;
            }
            options[opt.key] = opt.parse(val);
        }
    });
    console.log("Updated options:", options);
}

// =======================
// UI EVENT BINDINGS
// =======================

document.addEventListener("DOMContentLoaded", function () {
    // Bind UI controls
    optionIds.forEach((opt) => {
        const el = document.getElementById(opt.id);
        if (!el) return;
        if (el.type === "range") updateRangeValue(opt.id);
        el.addEventListener("input", function () {
            if (el.type === "range") updateRangeValue(opt.id);
            updateOptionsFromInputs();
            if (
                [
                    "spacing",
                    "fontSelect",
                    "sentenceInput",
                    "fontWeight",
                ].includes(opt.id)
            ) {
                init(true);
            }
        });
    });
    updateOptionsFromInputs();

    // Sentence input triggers re-init
    const sentenceInput = document.getElementById("sentenceInput");
    if (sentenceInput) {
        sentenceInput.addEventListener("input", function () {
            updateOptionsFromInputs();
            init(true);
        });
    }

    // Font select triggers font loading and re-init
    const fontSelect = document.getElementById("fontSelect");
    if (fontSelect) {
        fontSelect.addEventListener("change", function (e) {
            const currentFont = e.target.value;
            const currentWeight = document.getElementById("fontWeight").value;
            if (document.fonts && document.fonts.load) {
                document.fonts
                    .load(currentWeight + " 40px " + currentFont)
                    .then(function () {
                        init(true);
                    });
            } else {
                init(true);
            }
        });
    }

    // Font loading and animation start
    const fontWeight = document.getElementById("fontWeight");
    const font = fontSelect ? fontSelect.value : "'Bangers', cursive";
    const weight = fontWeight ? fontWeight.value : "bold";
    if (document.fonts && document.fonts.load) {
        document.fonts.load(weight + " 40px " + font).then(function () {
            init();
            step();
        });
    } else {
        init();
        step();
    }

    // Magic animation trigger
    const magicSpan = document.querySelector(".magic");
    if (magicSpan) {
        magicSpan.style.cursor = "default";
        magicSpan.addEventListener("click", function () {
            launchAnimation();
        });
    }
});

// =======================
// GLOBALS & STATE
// =======================

let container, canvas, ctx, stats, list, tog;
let w, h, p;
let transitionStep = 0;
let transitionFrames = 40;
let transitioning = false;
let mx, my;
let realMouse = { x: undefined, y: undefined };
let man = false;

// =======================
// PERFORMANCE PANEL (STATS.JS)
// =======================

if (!window.stats) {
    window.stats = new Stats();
    stats = window.stats;
    stats.showPanel(1);
    document.body.appendChild(stats.dom);
    stats.dom.style.position = "fixed";
    stats.dom.style.top = "0";
    stats.dom.style.right = "0";
    if (stats.dom.style.left) stats.dom.style.left = "";
    stats.dom.style.zIndex = "2000";
    stats.dom.style.opacity = "0.9";
    stats.dom.style.cursor = "pointer";
}

// =======================
// MOUSE & TOUCH HANDLING
// =======================

document.addEventListener("mousemove", function (e) {
    const bounds = document.body.getBoundingClientRect();
    realMouse.x = e.clientX - bounds.left;
    realMouse.y = e.clientY - bounds.top;
    if (typeof mx === "undefined" || typeof my === "undefined") {
        mx = realMouse.x;
        my = realMouse.y;
    }
    man = true;
});
document.addEventListener("touchmove", function (e) {
    if (e.touches && e.touches.length > 0) {
        const bounds = document.body.getBoundingClientRect();
        realMouse.x = e.touches[0].clientX - bounds.left;
        realMouse.y = e.touches[0].clientY - bounds.top;
        if (typeof mx === "undefined" || typeof my === "undefined") {
            mx = realMouse.x;
            my = realMouse.y;
        }
        man = true;
    }
});

// =======================
// PARTICLE GENERATION
// =======================

// Converts the current text and font settings into an array of points for the particles
function getTextPoints(
    text,
    font,
    fontWeight,
    fontSize,
    spacing,
    width,
    height,
) {
    let tempCanvas = document.createElement("canvas");
    let tempCtx = tempCanvas.getContext("2d");
    tempCanvas.width = width;
    tempCanvas.height = height;
    tempCtx.clearRect(0, 0, tempCanvas.width, tempCanvas.height);
    tempCtx.font = fontWeight + " " + fontSize + "px " + font;
    tempCtx.textBaseline = "top";
    tempCtx.fillStyle = "#fff";

    let lines = text.split("\n");
    let lh = fontSize * 1.1;
    let totalHeight = lines.length * lh;
    let startY = (tempCanvas.height - totalHeight) / 2;

    for (let i = 0; i < lines.length; i++) {
        let textWidth = tempCtx.measureText(lines[i]).width;
        let tx = (tempCanvas.width - textWidth) / 2;
        let ty = startY + i * lh;
        tempCtx.fillText(lines[i], tx, ty);
    }

    let points = [];
    let imageData = tempCtx.getImageData(
        0,
        0,
        tempCanvas.width,
        tempCanvas.height,
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

// Responsive font size based on screen size
function getAdaptiveFontSize() {
    const min = 40;
    const max = 200;
    const base = Math.min(window.innerWidth, window.innerHeight);
    const isMobile =
        /Mobi|Android|iPhone|iPad|iPod|Opera Mini|IEMobile|WPDesktop/i.test(
            navigator.userAgent,
        );
    return isMobile
        ? Math.max(min, Math.min(max, Math.floor(base / 20)))
        : Math.max(min, Math.min(max, Math.floor(base / 4)));
}

// =======================
// PARTICLE SYSTEM INIT
// =======================

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

    const { THICKNESS, DRAG, EASE, SPACING, FONT, TEXT, FONT_WEIGHT } = options;

    let points = getTextPoints(
        TEXT || "CASSEZ\nLES CODES",
        FONT || "'Bangers', cursive",
        FONT_WEIGHT || "bold",
        getAdaptiveFontSize(),
        SPACING,
        w,
        h,
    );

    if (transition && list && list.length) {
        transitionStep = 0;
        transitioning = true;
        while (list.length < points.length) {
            let last = list[list.length - 1];
            list.push({
                vx: 0,
                vy: 0,
                x: last ? last.x : 0,
                y: last ? last.y : 0,
                ox: last ? last.x : 0,
                oy: last ? last.y : 0,
                startx: last ? last.x : 0,
                starty: last ? last.y : 0,
                velocityHistory: 0,
                smoothVelocity: 0,
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
            if (!list[i].hasOwnProperty("velocityHistory")) {
                list[i].velocityHistory = 0;
                list[i].smoothVelocity = 0;
            }
        }
    } else {
        list = [];
        for (let i = 0; i < points.length; i++) {
            p = {
                vx: 0,
                vy: 0,
                x: points[i].x,
                y: points[i].y,
                ox: points[i].x,
                oy: points[i].y,
                velocityHistory: 0,
                smoothVelocity: 0,
            };
            list.push(p);
        }
    }
}

// =======================
// MAIN ANIMATION LOOP
// =======================

function step() {
    const { THICKNESS, DRAG, EASE, LERP } = options;
    if (stats) stats.begin();

    if (transitioning) {
        transitionStep++;
        let t = Math.min(1, transitionStep / transitionFrames);
        for (let i = 0; i < list.length; i++) {
            list[i].x = list[i].startx + (list[i].ox - list[i].startx) * t;
            list[i].y = list[i].starty + (list[i].oy - list[i].starty) * t;
        }
        if (t >= 1) transitioning = false;
    } else if ((tog = !tog)) {
        // Mouse following logic
        if (!man) {
            // ...idle mode...
        } else {
            if (
                typeof mx === "undefined" ||
                typeof my === "undefined" ||
                typeof realMouse.x === "undefined" ||
                typeof realMouse.y === "undefined"
            ) {
                return requestAnimationFrame(step);
            }
            const dx = realMouse.x - mx;
            const dy = realMouse.y - my;
            const dist = Math.sqrt(dx * dx + dy * dy);
            const maxStep = 40;
            let t = LERP;
            if (dist > maxStep) t = maxStep / dist;
            mx += dx * t;
            my += dy * t;
        }

        // Particle physics
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
        // Rendering with velocity-based colors
        let a = ctx.createImageData(w, h);
        let b = a.data;
        for (let i = 0; i < list.length; i++) {
            p = list[i];
            let n = (~~p.x + ~~p.y * w) * 4;

            // Calculate velocity magnitude
            let velocity = Math.sqrt(p.vx * p.vx + p.vy * p.vy);

            // Smooth velocity transition with ease-in effect
            let targetVelocity = Math.min(1, velocity * 2);
            let velocityEase = 0.08; // Adjust this for faster/slower transitions
            p.smoothVelocity +=
                (targetVelocity - p.smoothVelocity) * velocityEase;

            // Apply ease-in curve for smoother color transitions
            let easeInVel = p.smoothVelocity * p.smoothVelocity; // Quadratic ease-in

            // Background animation colors
            const animationColors = [
                [0, 158, 255], // #009eff
                [252, 100, 130], // #fc6482
                [152, 95, 242], // #985ff2
                [51, 232, 141], // #33e88d
                [255, 134, 105], // #ff8669
                [96, 31, 155], // #601f9b
            ];

            let r, g, blue;
            if (options.COLORED_PARTICLES) {
                if (easeInVel < 0.05) {
                    // Static particles - white
                    r = g = blue = 255;
                } else {
                    // Map smooth velocity to color palette
                    let colorIndex = easeInVel * (animationColors.length - 1);
                    let baseIndex = Math.floor(colorIndex);
                    let nextIndex = Math.min(
                        baseIndex + 1,
                        animationColors.length - 1,
                    );
                    let t = colorIndex - baseIndex;

                    // Interpolate between two colors
                    const color1 = animationColors[baseIndex];
                    const color2 = animationColors[nextIndex];

                    r = Math.floor(color1[0] + (color2[0] - color1[0]) * t);
                    g = Math.floor(color1[1] + (color2[1] - color1[1]) * t);
                    blue = Math.floor(color1[2] + (color2[2] - color1[2]) * t);
                }
            } else {
                // Default white particles
                r = g = blue = 255;
            }

            b[n] = r; // Red
            b[n + 1] = g; // Green
            b[n + 2] = blue; // Blue
            b[n + 3] = 255; // Alpha
        }
        ctx.putImageData(a, 0, 0);
    }

    if (stats) stats.end();
    requestAnimationFrame(step);
}

// =======================
// BACKGROUND COLOR ANIMATION
// =======================

function launchAnimation() {
    const colors = [
        "#009eff",
        "#fc6482",
        "#985ff2",
        "#33e88d",
        "#ff8669",
        "#601f9b",
    ];
    const body = document.body;
    let frame = 0;
    const totalFrames = 60 * 10;
    let lastColor = getComputedStyle(body).backgroundColor;
    let currentColor = colors[Math.floor(Math.random() * colors.length)];

    function lerpColor(a, b, t) {
        function parseColor(str) {
            if (str.startsWith("rgb")) {
                return str.match(/\d+/g).map(Number);
            } else if (str.startsWith("hsl")) {
                let [h, s, l] = str.match(/\d+/g).map(Number);
                s /= 100;
                l /= 100;
                let c = (1 - Math.abs(2 * l - 1)) * s;
                let x = c * (1 - Math.abs(((h / 60) % 2) - 1));
                let m = l - c / 2;
                let r = 0,
                    g = 0,
                    b = 0;
                if (h < 60) [r, g, b] = [c, x, 0];
                else if (h < 120) [r, g, b] = [x, c, 0];
                else if (h < 180) [r, g, b] = [0, c, x];
                else if (h < 240) [r, g, b] = [0, x, c];
                else if (h < 300) [r, g, b] = [x, 0, c];
                else[r, g, b] = [c, 0, x];
                return [
                    Math.round((r + m) * 255),
                    Math.round((g + m) * 255),
                    Math.round((b + m) * 255),
                ];
            } else if (str.startsWith("#")) {
                let hex = str.replace("#", "");
                if (hex.length === 3)
                    hex = hex
                        .split("")
                        .map((x) => x + x)
                        .join("");
                const num = parseInt(hex, 16);
                return [num >> 16, (num >> 8) & 255, num & 255];
            }
            return [17, 17, 17];
        }
        const c1 = parseColor(a);
        const c2 = parseColor(b);
        return `rgb(${Math.round(c1[0] + (c2[0] - c1[0]) * t)},${Math.round(c1[1] + (c2[1] - c1[1]) * t)},${Math.round(c1[2] + (c2[2] - c1[2]) * t)})`;
    }

    let fadeInFrame = 0;
    const fadeInFrames = 30;
    function fadeIn() {
        const tf = fadeInFrame / fadeInFrames;
        body.style.background = lerpColor(lastColor, currentColor, tf);
        fadeInFrame++;
        if (fadeInFrame <= fadeInFrames) {
            requestAnimationFrame(fadeIn);
        } else {
            animateBg();
        }
    }
    function animateBg() {
        if (frame % 60 === 0) {
            lastColor = currentColor;
            let nextColor;
            do {
                nextColor = colors[Math.floor(Math.random() * colors.length)];
            } while (nextColor === lastColor);
            currentColor = nextColor;
        }
        const t = (frame % 60) / 60;
        body.style.transition = "none";
        body.style.background = lerpColor(lastColor, currentColor, t);
        frame++;
        if (frame < totalFrames) {
            requestAnimationFrame(animateBg);
        } else {
            let fadeFrame = 0;
            const fadeFrames = 30;
            const original = "#111";
            function fadeOut() {
                const tf = fadeFrame / fadeFrames;
                body.style.background = lerpColor(currentColor, original, tf);
                fadeFrame++;
                if (fadeFrame <= fadeFrames) {
                    requestAnimationFrame(fadeOut);
                } else {
                    body.style.background = "";
                }
            }
            fadeOut();
        }
    }
    fadeIn();
}

// =======================
// EASTER EGG: Keyboard shortcut
// =======================

(function () {
    const egg = String.fromCharCode(0x6d, 0x61, 0x67, 0x69, 0x63);
    let buffer = "";
    window.addEventListener("keydown", function (e) {
        buffer += e.key.toLowerCase();
        if (buffer.length > egg.length) buffer = buffer.slice(-egg.length);
        if (buffer === egg) {
            launchAnimation();
            buffer = "";
        }
    });
})();

// =======================
// SLIDER ANIMATION & RANDOMIZATION
// =======================

// Animate slider value smoothly
function animateSlider(id, target, duration) {
    const el = document.getElementById(id);
    if (!el) return;
    const start = parseFloat(el.value);
    target = parseFloat(target);
    const startTime = performance.now();

    function stepAnim(now) {
        const t = Math.min(1, (now - startTime) / duration);
        el.value = (start + (target - start) * t).toFixed(
            el.step && el.step < 1 ? 2 : 0,
        );
        el.dispatchEvent(new Event("input"));
        if (t < 1) requestAnimationFrame(stepAnim);
    }
    requestAnimationFrame(stepAnim);
}

// Randomize options at intervals
function startRandomizeOptions() {
    if (randomizeInterval) return;
    randomizeInterval = setInterval(() => {
        if (!options.RANDOMIZE) return;

        function getRange(id) {
            const el = document.getElementById(id);
            return {
                min: parseFloat(el.min),
                max: parseFloat(el.max),
                step: parseFloat(el.step),
            };
        }

        const dragRange = getRange("drag");
        const easeRange = getRange("ease");
        const thicknessRange = getRange("thickness");
        const lerpRange = getRange("lerp");

        // Use a common percent for thickness and lerp
        const percent = Math.random();
        const thicknessValue =
            thicknessRange.min +
            percent * (thicknessRange.max - thicknessRange.min);
        const thickness =
            Math.round(thicknessValue / thicknessRange.step) *
            thicknessRange.step;
        const lerp = (
            lerpRange.min +
            percent * (lerpRange.max - lerpRange.min)
        ).toFixed(2);

        // Other sliders are randomized independently
        const drag = (
            Math.random() * (dragRange.max - dragRange.min) +
            dragRange.min
        ).toFixed(2);
        const ease = (
            Math.random() * (easeRange.max - easeRange.min) +
            easeRange.min
        ).toFixed(2);

        animateSlider("drag", drag, 420);
        animateSlider("ease", ease, 420);
        animateSlider("thickness", thickness, 1200);
        animateSlider("lerp", lerp, 1200);
    }, 1200);
}

function stopRandomizeOptions() {
    if (randomizeInterval) {
        clearInterval(randomizeInterval);
        randomizeInterval = null;
    }
}

// Listen for randomize checkbox changes
document.addEventListener("DOMContentLoaded", function () {
    const randomize = document.getElementById("randomize");
    if (randomize) {
        randomize.addEventListener("change", function () {
            updateOptionsFromInputs();
            if (randomize.checked) {
                startRandomizeOptions();
            } else {
                stopRandomizeOptions();
            }
        });
        if (randomize.checked) startRandomizeOptions();
    }

    // Listen for colored particles checkbox changes
    const coloredParticles = document.getElementById("coloredParticles");
    if (coloredParticles) {
        coloredParticles.addEventListener("change", function () {
            updateOptionsFromInputs();
        });
    }
});
