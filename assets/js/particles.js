import Stats from 'https://cdnjs.cloudflare.com/ajax/libs/stats.js/17/Stats.js'

// --- UI OPTIONS LOGIC: Centralized slider/option management ---
// List of all UI controls with their parsing logic and option keys
const optionIds = [
    { id: 'fontSelect', parse: v => v, key: 'FONT' },
    { id: 'sentenceInput', parse: v => v, key: 'TEXT' },
    { id: 'fontWeight', parse: v => v, key: 'FONT_WEIGHT' },
    { id: 'drag', parse: parseFloat, key: 'DRAG' },
    { id: 'ease', parse: parseFloat, key: 'EASE' },
    { id: 'spacing', parse: parseFloat, key: 'SPACING' },
    { id: 'thickness', parse: v => Math.pow(parseFloat(v), 2), key: 'THICKNESS' }
];

optionIds.push({ id: 'randomize', parse: v => !!v, key: 'RANDOMIZE' });

const options = {};

let randomizeInterval = null;

// Update the displayed value next to each slider (for live feedback)
function updateRangeValue(id) {
    const input = document.getElementById(id);
    const valueSpan = document.getElementById(id + 'Value');
    if (valueSpan) valueSpan.textContent = input.value;
}

// Sync all slider/input values to the options object
function updateOptionsFromInputs() {
    optionIds.forEach(opt => {
        const el = document.getElementById(opt.id);
        if (el) options[opt.key] = opt.parse(el.value);
    });
}

// --- UI INIT: Set up event listeners for all controls ---
document.addEventListener('DOMContentLoaded', function () {
    // UI controls
    optionIds.forEach(opt => {
        const el = document.getElementById(opt.id);
        if (!el) return;
        if (el.type === 'range') updateRangeValue(opt.id);
        el.addEventListener('input', function () {
            if (el.type === 'range') updateRangeValue(opt.id);
            updateOptionsFromInputs();
            if (['spacing', 'fontSelect', 'sentenceInput', 'fontWeight'].includes(opt.id)) {
                init(true);
            }
        });
    });
    updateOptionsFromInputs();

    // Sentence input
    const sentenceInput = document.getElementById('sentenceInput');
    if (sentenceInput) {
        sentenceInput.addEventListener('input', function () {
            updateOptionsFromInputs();
            init(true);
        });
    }

    // Font select
    const fontSelect = document.getElementById('fontSelect');
    if (fontSelect) {
        fontSelect.addEventListener('change', function (e) {
            const currentFont = e.target.value;
            const currentWeight = document.getElementById('fontWeight').value;
            if (document.fonts && document.fonts.load) {
                document.fonts.load(currentWeight + ' 40px ' + currentFont).then(function () {
                    init(true);
                });
            } else {
                init(true);
            }
        });
    }

    // Font loading and animation start
    const fontWeight = document.getElementById('fontWeight');
    const font = fontSelect ? fontSelect.value : "'Bangers', cursive";
    const weight = fontWeight ? fontWeight.value : "bold";
    if (document.fonts && document.fonts.load) {
        document.fonts.load(weight + ' 40px ' + font).then(function () {
            init();
            step();
        });
    } else {
        init();
        step();
    }

    const magicSpan = document.querySelector('.magic');
    if (magicSpan) {
        magicSpan.style.cursor = "default";
        magicSpan.addEventListener('click', function () {
            launchAnimation();
        });
    }
});

// --- GLOBALS: Animation state and font ---
let container, canvas, ctx, stats, list, tog, man, mx, my, w, h, p;
let mouseTrail = [];
let lastMouse = null;

// --- PARTICLE GENERATION: Convert text to points using canvas ---
// Converts the current text and font settings into an array of points for the particles
function getTextPoints(text, font, fontWeight, fontSize, spacing, width, height) {
    let tempCanvas = document.createElement("canvas");
    let tempCtx = tempCanvas.getContext("2d");
    tempCanvas.width = width;
    tempCanvas.height = height;
    tempCtx.clearRect(0, 0, tempCanvas.width, tempCanvas.height);
    tempCtx.font = fontWeight + " " + fontSize + "px " + font;
    tempCtx.textBaseline = "top";
    tempCtx.fillStyle = "#fff";

    let lines = text.split('\n');
    let lh = fontSize * 1.1; // Default line height
    let totalHeight = lines.length * lh;
    let startY = (tempCanvas.height - totalHeight) / 2;

    // Draw each line of text centered horizontally and vertically
    for (let i = 0; i < lines.length; i++) {
        let textWidth = tempCtx.measureText(lines[i]).width;
        let tx = (tempCanvas.width - textWidth) / 2;
        let ty = startY + i * lh;
        tempCtx.fillText(lines[i], tx, ty);
    }

    // Sample the canvas to extract points where text pixels are present
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
                points.push({
                    x: x,
                    y: y
                });
            }
        }
    }
    return points;
}

// Calculate a font size that adapts to the screen size (responsive)
function getAdaptiveFontSize() {
    const min = 40;
    const max = 200;
    const base = Math.min(window.innerWidth, window.innerHeight);

    const isMobile = /Mobi|Android|iPhone|iPad|iPod|Opera Mini|IEMobile|WPDesktop/i.test(navigator.userAgent);

    if (isMobile) {
        return Math.max(min, Math.min(max, Math.floor(base / 12)));
    } else {
        return Math.max(min, Math.min(max, Math.floor(base / 4)));
    }
}

// --- ANIMATION STATE: Transition logic ---
let transitionStep = 0;
let transitionFrames = 40;
let transitioning = false;

// --- INIT: Setup or update the particle system, with optional transition ---
// Initializes or updates the particle system, optionally animating the transition
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

    const {
        THICKNESS,
        DRAG,
        EASE,
        SPACING,
        FONT,
        TEXT,
        FONT_WEIGHT
    } = options;

    let points = getTextPoints(
        TEXT || "CASSEZ\nLES CODES",
        FONT || "'Bangers', cursive",
        FONT_WEIGHT || "bold",
        getAdaptiveFontSize(),
        SPACING,
        w,
        h
    );

    if (transition && list && list.length) {
        // Animate transition between old and new points
        transitionStep = 0;
        transitioning = true;
        // If new points are more than old, duplicate last old point
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
                starty: last ? last.y : 0
            });
        }
        // If new points are less, trim the list
        if (list.length > points.length) {
            list = list.slice(0, points.length);
        }
        // Store start and target positions for transition
        for (let i = 0; i < list.length; i++) {
            list[i].startx = list[i].x;
            list[i].starty = list[i].y;
            list[i].ox = points[i].x;
            list[i].oy = points[i].y;
        }
    } else {
        // Initial creation of particles
        list = [];
        for (let i = 0; i < points.length; i++) {
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
    }

    // Mouse interaction for particle repulsion
    container.addEventListener("mousemove", function (e) {
        let bounds = container.getBoundingClientRect();
        let x = e.clientX - bounds.left;
        let y = e.clientY - bounds.top;
        man = true;

        if (lastMouse) {
            let dx = x - lastMouse.x;
            let dy = y - lastMouse.y;
            let dist = Math.sqrt(dx * dx + dy * dy);
            let steps = Math.ceil(dist / 2); // 2px between each point
            for (let i = 1; i <= steps; i++) {
                mouseTrail.push({
                    x: lastMouse.x + (dx * i) / steps,
                    y: lastMouse.y + (dy * i) / steps
                });
            }
        } else {
            mouseTrail.push({ x, y });
        }
        lastMouse = { x, y };
    });

    // Enable on mobile devices (touch events)
    function isMobile() {
        return /Mobi|Android|iPhone|iPad|iPod|Opera Mini|IEMobile|WPDesktop/i.test(navigator.userAgent);
    }

    if (isMobile()) {
        container.addEventListener("touchmove", function (e) {
            if (e.touches && e.touches.length > 0) {
                let bounds = container.getBoundingClientRect();
                mx = e.touches[0].clientX - bounds.left;
                my = e.touches[0].clientY - bounds.top;
                man = true;
            }
        });
    } else {
        // FPS stats: show all panels horizontally and display the second panel
        if (typeof Stats !== "undefined") {
            stats = new Stats();
            stats.showPanel(1);
            stats.dom.style.position = "fixed";
            stats.dom.style.top = "0px";
            stats.dom.style.right = "0px";
            stats.dom.style.left = "auto";
            stats.dom.style.zIndex = 9999;
            stats.dom.style.display = "flex"; // Arrange panels horizontally
            stats.dom.style.flexDirection = "row";
            document.body.appendChild(stats.dom);
        }
    }
}

// --- MAIN ANIMATION LOOP: Handles transitions, physics, and rendering ---
// The main animation loop: handles transitions, physics, and draws the particles
function step() {
    const {
        THICKNESS,
        DRAG,
        EASE
    } = options;
    if (stats) stats.begin();

    if (transitioning) {
        // Animate transition between old and new positions
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
        // Physics: update particle positions based on mouse and parameters
        if (!man) {
            let t = +new Date() * 0.001;
            mx = w * 0.5 + Math.cos(t * 2.1) * Math.cos(t * 0.9) * w * 0.45;
            my =
                h * 0.5 +
                Math.sin(t * 3.2) * Math.tan(Math.sin(t * 0.8)) * h * 0.45;
        } else if (mouseTrail.length > 0) {
            // Take several points from the trail to reduce latency
            let N = 20; // Trail speed
            let pt;
            while (N-- && mouseTrail.length > 0) {
                pt = mouseTrail.shift();
            }
            if (pt) {
                mx = pt.x;
                my = pt.y;
            }
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
        // Rendering: draw all particles to the canvas
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

// Move the launchAnimation function to the top-level scope so it is accessible everywhere

function launchAnimation() {
    const colors = [];
    for (let h = 0; h < 360; h += 12) {
        colors.push(`hsl(${h}, 70%, 18%)`);
    }
    const body = document.body;
    let frame = 0;
    const totalFrames = 60 * 10;
    let lastColor = getComputedStyle(body).backgroundColor;
    let currentColor = colors[Math.floor(Math.random() * colors.length)];
    function lerpColor(a, b, t) {
        function parseColor(str) {
            if (str.startsWith('rgb')) {
                return str.match(/\d+/g).map(Number);
            } else if (str.startsWith('hsl')) {
                let [h, s, l] = str.match(/\d+/g).map(Number);
                s /= 100; l /= 100;
                let c = (1 - Math.abs(2 * l - 1)) * s;
                let x = c * (1 - Math.abs((h / 60) % 2 - 1));
                let m = l - c / 2;
                let r = 0, g = 0, b = 0;
                if (h < 60) [r, g, b] = [c, x, 0];
                else if (h < 120) [r, g, b] = [x, c, 0];
                else if (h < 180) [r, g, b] = [0, c, x];
                else if (h < 240) [r, g, b] = [0, x, c];
                else if (h < 300) [r, g, b] = [x, 0, c];
                else [r, g, b] = [c, 0, x];
                return [Math.round((r + m) * 255), Math.round((g + m) * 255), Math.round((b + m) * 255)];
            } else if (str.startsWith('#')) {
                let hex = str.replace('#', '');
                if (hex.length === 3) hex = hex.split('').map(x => x + x).join('');
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

// Smoothly animate slider value
function animateSlider(id, target, duration) {
    const el = document.getElementById(id);
    if (!el) return;
    const start = parseFloat(el.value);
    target = parseFloat(target);
    const startTime = performance.now();

    function stepAnim(now) {
        const t = Math.min(1, (now - startTime) / duration);
        el.value = (start + (target - start) * t).toFixed(el.step && el.step < 1 ? 2 : 0);
        el.dispatchEvent(new Event('input'));
        if (t < 1) requestAnimationFrame(stepAnim);
    }
    requestAnimationFrame(stepAnim);
}

// Randomize options at intervals
function startRandomizeOptions() {
    if (randomizeInterval) return;
    randomizeInterval = setInterval(() => {
        // Only randomize if the option is checked
        if (!options.RANDOMIZE) return;

        // Randomize fluidity (drag, ease, thickness)
        // Get min/max from the DOM for each slider
        function getRange(id) {
            const el = document.getElementById(id);
            return {
                min: parseFloat(el.min),
                max: parseFloat(el.max),
                step: parseFloat(el.step)
            };
        }

        const dragRange = getRange('drag');
        const easeRange = getRange('ease');
        const thicknessRange = getRange('thickness');

        const drag = (Math.random() * (dragRange.max - dragRange.min) + dragRange.min).toFixed(2);
        const ease = (Math.random() * (easeRange.max - easeRange.min) + easeRange.min).toFixed(2);
        // Thickness should be rounded to nearest step (e.g. 5)
        const thicknessRaw = Math.random() * (thicknessRange.max - thicknessRange.min) + thicknessRange.min;
        const thickness = Math.round(thicknessRaw / thicknessRange.step) * thicknessRange.step;

        // Animate sliders smoothly
        animateSlider('drag', drag, 200);
        animateSlider('ease', ease, 200);
        animateSlider('thickness', thickness, 1200);
    }, 1200);
}

function stopRandomizeOptions() {
    if (randomizeInterval) {
        clearInterval(randomizeInterval);
        randomizeInterval = null;
    }
}

// Listen for randomize checkbox changes
document.addEventListener('DOMContentLoaded', function () {
    const randomize = document.getElementById('randomize');
    if (randomize) {
        randomize.addEventListener('change', function () {
            updateOptionsFromInputs();
            if (randomize.checked) {
                startRandomizeOptions();
            } else {
                stopRandomizeOptions();
            }
        });
        // If checked on load, start randomizing
        if (randomize.checked) startRandomizeOptions();
    }
});