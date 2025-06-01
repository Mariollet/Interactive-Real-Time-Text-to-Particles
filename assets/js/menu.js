document.addEventListener('DOMContentLoaded', function () {
    const fontMenu = document.getElementById('fontMenu');
    const menuToggle = document.getElementById('menuToggle');
    const menuClose = document.getElementById('menuClose');

    function showMenu(show) {
        if (show) {
            fontMenu.style.transform = 'translateY(0)';
            fontMenu.style.opacity = '1';
            fontMenu.style.pointerEvents = 'auto';
            fontMenu.setAttribute('tabindex', '0');
            menuToggle.classList.add('d-none');
            menuToggle.setAttribute('aria-expanded', 'true');
        } else {
            fontMenu.style.transform = 'translateY(120%)';
            fontMenu.style.opacity = '0';
            fontMenu.style.pointerEvents = 'none';
            fontMenu.setAttribute('tabindex', '-1');
            menuToggle.classList.remove('d-none');
            menuToggle.setAttribute('aria-expanded', 'false');
        }
    }

    // Always hide the menu on load, mobile or not
    showMenu(false);

    // Event listeners for toggle and close buttons
    menuToggle.addEventListener('click', function () {
        showMenu(true);
    });
    menuClose.addEventListener('click', function () {
        showMenu(false);
    });

    // Optional: close the menu if clicking outside
    document.addEventListener('click', function (e) {
        if (
            fontMenu.style.opacity === '1' &&
            !fontMenu.contains(e.target) &&
            !menuToggle.contains(e.target)
        ) {
            showMenu(false);
        }
    });
});