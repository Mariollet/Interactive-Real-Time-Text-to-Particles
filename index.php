<!DOCTYPE html>
<html lang="en">

<head>
	<meta charset="UTF-8" />
	<meta name="viewport" content="width=device-width, initial-scale=1.0" />
	<title>KG Particles</title>
	<!-- Bootstrap CSS -->
	<link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
	<!-- Google Fonts -->
	<link href="https://fonts.googleapis.com/css2?family=Luckiest+Guy&family=Bangers&family=Rubik+Iso&family=Oi&family=Roboto:wght@400&display=swap" rel="stylesheet">
	<!-- CSS -->
	<link rel="stylesheet" href="./assets/css/index.css" />
</head>

<body>
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
					<input type="range" class="form-range" id="drag" min="0.8" max="1" step="0.01" value="0.95">
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
					<input type="range" class="form-range" id="thickness" min="50" max="200" value="80">
				</div>
			</div>

		</div>
	</div>

	<a href="https://github.com/Mariollet/kg" target="_blank" id="github-link" class="position-fixed bottom-0 end-0 m-3 text-decoration-none text-secondary small d-flex align-items-center" style="z-index:999;">
		<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="currentColor" class="bi bi-github me-1" viewBox="0 0 16 16">
			<path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.19 0 .21.15.46.55.38A8.013 8.013 0 0 0 16 8c0-4.42-3.58-8-8-8z" />
		</svg>
		GitHub
	</a>

	<script>
		function updateRangeValue(id) {
			document.getElementById(id + 'Value').textContent = document.getElementById(id).value;
		}
		document.addEventListener('DOMContentLoaded', function() {
			['drag', 'ease', 'spacing', 'margin', 'thickness'].forEach(function(id) {
				updateRangeValue(id);
				document.getElementById(id).addEventListener('input', function() {
					updateRangeValue(id);
				});
			});
		});


		function getDefaultOptions() {
			return {
				THICKNESS: Math.pow(Number(document.getElementById('thickness').value), 2),
				DRAG: Number(document.getElementById('drag').value),
				EASE: Number(document.getElementById('ease').value),
				SPACING: Number(document.getElementById('spacing').value),
				MARGIN: Number(document.getElementById('margin').value)
			};
		}

		let { THICKNESS, DRAG, EASE, SPACING, MARGIN } = getDefaultOptions();

		let container, canvas, ctx, stats, list, tog, man, mx, my, w, h, p;
		let currentFont = "'Luckiest Guy', cursive";

		// Gère les retours à la ligne pour le texte
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
						points.push({
							x: x,
							y: y
						});
					}
				}
			}
			return points;
		}

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

			let points = getTextPoints(
				"CASSEZ\nLES CODES",
				currentFont,
				Math.floor(h / 4),
				SPACING,
				w,
				h
			);

			if (transition && list && list.length) {
				// Transition douce : chaque particule garde sa position actuelle
				transitionStep = 0;
				transitioning = true;

				// Si plus de points que de particules, duplique la dernière particule
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
				// Si moins de points que de particules, coupe la liste
				if (list.length > points.length) {
					list = list.slice(0, points.length);
				}
				// Enregistre la position de départ et la nouvelle cible pour chaque particule
				for (let i = 0; i < list.length; i++) {
					list[i].startx = list[i].x;
					list[i].starty = list[i].y;
					list[i].ox = points[i].x;
					list[i].oy = points[i].y;
				}
			} else {
				// Initialisation classique
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

			// Pas besoin de recréer le canvas ni de vider le container ici
			// container.appendChild(canvas);

			container.addEventListener("mousemove", function(e) {
				let bounds = container.getBoundingClientRect();
				mx = e.clientX - bounds.left;
				my = e.clientY - bounds.top;
				man = true;
			});

			if (typeof Stats === "function") {
				document.body.appendChild((stats = new Stats()).domElement);
			}
		}

		let transitionStep = 0;
		let transitionFrames = 40;
		let transitioning = false;
		let newTargets = [];

		function step() {
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

		window.addEventListener("resize", function() {
			container.innerHTML = "";
			init();
		});

		// Menu de sélection de police
		document.getElementById('fontSelect').addEventListener('change', function(e) {
			currentFont = e.target.value;
			// On attend que la police soit chargée avant de redessiner
			if (document.fonts && document.fonts.load) {
				// On charge la police avec une taille arbitraire (ex: 40px)
				document.fonts.load('bold 40px ' + currentFont).then(function() {
					init(true);
				});
			} else {
				init(true);
			}
		});

		// Attendre que les fonts soient chargées avant d'initialiser
		if (document.fonts && document.fonts.ready) {
			document.fonts.ready.then(function() {
				init();
				step();
			});
		} else {
			window.onload = function() {
				init();
				step();
			};
		}

		document.getElementById('thickness').addEventListener('input', function(e) {
			THICKNESS = Math.pow(Number(e.target.value), 2);
			init(true);
		});
		document.getElementById('drag').addEventListener('input', function(e) {
			DRAG = Number(e.target.value);
		});
		document.getElementById('ease').addEventListener('input', function(e) {
			EASE = Number(e.target.value);
		});
		document.getElementById('spacing').addEventListener('input', function(e) {
			SPACING = Number(e.target.value);
			init(true);
		});
		document.getElementById('margin').addEventListener('input', function(e) {
			MARGIN = Number(e.target.value);
			init(true);
		});
	</script>
</body>

</html>