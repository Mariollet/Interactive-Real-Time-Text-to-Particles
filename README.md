# Interactive Real-Time Text-to-Particles

A web application that transforms any text into animated particles in real time.  
All typography and particle physics parameters are fully configurable via a UI.

---

## Features

- Real-time text-to-particles rendering
- Interactive controls for font, weight, spacing, drag, ease, thickness, and lerp
- Responsive UI (desktop and mobile)
- Modern, accessible interface

---

## Demo

Open `index.html` in your browser.

---

## Installation

```sh
git clone https://github.com/Mariollet/interactive_particles_typography.git
cd interactive_particles_typography
```

Open `index.html` directly in your browser.

Optional: run a local server (for some browser font loading support):

```sh
php -S localhost:8000
```
Then open [http://localhost:8000](http://localhost:8000).

---

## Usage

- Use the **Text** area to change the animated sentence (supports `\n` for line breaks).
- Select a **Font** and **Weight**.
- Adjust **Drag**, **Ease**, **Spacing**, **Thickness**, and **Lerp** for different particle behaviors.
- Move your mouse or touch the canvas to interact with the particles.
- Use the **Randomize** checkbox to enable automatic randomization of physics parameters.
- The GitHub link in the bottom-right corner leads to the repository.

---

## Project Structure

```
/
├── assets/
│   ├── css/
│   │   └── index.css        # Custom styles
│   └── js/
│       ├── menu.js          # UI menu logic
│       ├── init.js          # UI default values
│       └── particles.js     # Particle system and animation
├── index.html               # Main HTML file
└── README.md
```

---

## Customization

- **Default text**: Change the value in the UI or edit the default in `init.js`.
- **Fonts**: Add options to `<select id="fontSelect">` in `index.html` and update the Google Fonts link in the `<head>`.
- **Animation logic**: Edit `assets/js/particles.js` for custom physics or rendering.

---

## Dependencies

- [Bootstrap](https://getbootstrap.com/) (UI)
- [Google Fonts](https://fonts.google.com/) (typography)
- [Stats.js](https://github.com/mrdoob/stats.js/) (performance panel)

---

## License

MIT License.  
See [LICENSE](LICENSE).

---

## Author

[github.com/Mariollet](https://github.com/Mariollet)

---

**Enjoy experimenting with Interactive Real-Time Text-to-Particles!**
