# Interactive-Real-Time-Text-to-Particles

A interactive web application that transforms any text into animated particles in real time.  
You can customize the font, weight, spacing, thickness, and physical properties (drag, ease) of the particle system, and see the result instantly.

---

## Features

- **Real-time text-to-particles rendering**
- **Fully interactive controls** for typography and particle physics
- **Font and weight selection**
- **Live adjustment** of drag, ease, spacing, and thickness
- **Responsive UI** (works on desktop and mobile)
- **Modern, accessible interface**
- **Custom favicon**: Upside-down yellow smiley for a playful touch
- **GitHub link**: Quick access to the source code from the UI

---

## Demo

Open `index.html` in your browser to see the demo instantly.

---

## Installation

1. **Clone the repository**

   ```sh
   git clone https://github.com/Mariollet/interactive_particles_typography.git
   cd interactive_particles_typography
   ```

2. **Open the app**  
   Simply open `index.html` in your browser.

   > _If you want to use a local server (optional):_
   ```sh
   php -S localhost:8000
   ```
   Then open [http://localhost:8000](http://localhost:8000) in your browser.

---

## Usage

- Use the **Text** input to change the animated sentence in real time (use `\n` for line breaks).
- Use the **Font** dropdown to change the typeface.
- Adjust **Drag** and **Ease** for fluidity of the animation.
- Adjust **Spacing** and **Thickness** to change the shape and density of the particle text.
- Move your mouse over the canvas to interact with the particles.
- The GitHub link in the bottom-right corner leads to this repository.

---

## Project Structure

```
/
├── assets/
│   └── css/
│       └── index.css      # Custom styles
│   └── js/
│       └── menu.js        # Menu logic
│       └── particles.js   # Particle system
├── index.html             # Main HTML/JS file
└── README.md
```

---

## Customization

- **Change the default text**:  
  Use the Text input in the UI, or edit the default value in the HTML (`index.html`).
- **Add more fonts**:  
  Add options to the `<select id="fontSelect">` and update the Google Fonts link in the `<head>`.
- **Tweak animation**:  
  Adjust the physics and rendering logic in `assets/js/particles.js`.

---

## Credits

- [Bootstrap](https://getbootstrap.com/) for UI components
- [Google Fonts](https://fonts.google.com/) for typography
- Favicon: Custom SVG smiley (upside-down)

---

## License

MIT License.  
See [LICENSE](LICENSE) for details.

---

## Author

[github.com/Mariollet](https://github.com/Mariollet)

---

**Enjoy experimenting with Interactive-Real-Time-Text-to-Particles!**
