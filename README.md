# Interactive Particles Typography

A playful and interactive web demo that transforms text into animated particles, with real-time controls for font, spacing, thickness, and more. Built with vanilla JavaScript and Bootstrap, this project lets you explore typography and particle animation in a fun, visual way.

---

## Features

- **Live particle animation**: Text is rendered as a cloud of interactive particles.
- **Phrase input**: Instantly update the animated text with your own sentence (supports multi-line with `\n`).
- **Font selection**: Choose from several Google Fonts for instant style changes.
- **Real-time controls**: Adjust drag, ease, spacing, margin, and thickness with smooth transitions.
- **Responsive UI**: Clean, mobile-friendly interface using Bootstrap.
- **Custom favicon**: Upside-down yellow smiley for a playful touch.
- **GitHub link**: Quick access to the source code from the UI.

---

## Demo

> _You can see a live demo by opening `index.php` in your browser (requires a local server for PHP, e.g. [Laragon](https://laragon.org/) or [XAMPP](https://www.apachefriends.org/))._

---

## Installation

1. **Clone the repository**

   ```sh
   git clone https://github.com/Mariollet/interactive_particles_typography.git
   cd interactive_particles_typography
   ```

2. **Start a local server**  
   You can use [Laragon](https://laragon.org/), [XAMPP](https://www.apachefriends.org/), or the built-in PHP server:
   ```sh
   php -S localhost:8000
   ```
   Then open [http://localhost:8000](http://localhost:8000) in your browser.

---

## Usage

- Use the **TEXT** input to change the animated sentence in real time (use `\n` for line breaks).
- Use the **Font** dropdown to change the typeface.
- Adjust **Drag** and **Ease** for fluidity of the animation.
- Adjust **Spacing**, **Margin**, and **Thickness** to change the shape and density of the particle text.
- Move your mouse over the canvas to interact with the particles.
- The GitHub link in the bottom-right corner leads to this repository.

---

## Project Structure

```
/
├── assets/
│   └── css/
│       └── index.css      # Custom styles
├── index.php              # Main HTML/JS file
└── README.md
```

---

## Customization

- **Change the default text**:  
  Use the TEXT input in the UI, or edit the default value in the HTML (`index.php`).
- **Add more fonts**:  
  Add options to the `<select id="fontSelect">` and update the Google Fonts link in the `<head>`.
- **Tweak animation**:  
  Adjust the physics and rendering logic in the JavaScript section of `index.php`.

---

## Credits

- [Bootstrap](https://getbootstrap.com/) for UI components
- [Google Fonts](https://fonts.google.com/) for typography
- Favicon: Custom SVG smiley (tête à l'envers)

---

## License

MIT License.  
See [LICENSE](LICENSE) for details.

---

## Author

[github.com/Mariollet](https://github.com/Mariollet)

---

**Have fun experimenting with interactive particle typography!**
