document.addEventListener('DOMContentLoaded', function () {
    // Set default values for UI controls
    document.getElementById('sentenceInput').value = "Break\nThe Codes";
    document.getElementById('fontSelect').value = "'Oi', cursive";
    document.getElementById('fontWeight').value = "100";
    document.getElementById('ease').value = "0.2";
    document.getElementById('easeValue').textContent = "0.2";
    // Set thickness to 50 if mobile
    function isMobile() {
        return /Mobi|Android|iPhone|iPad|iPod|Opera Mini|IEMobile|WPDesktop/i.test(navigator.userAgent);
    }
    if (isMobile()) {
        document.getElementById('thickness').value = "50";
        document.getElementById('thicknessValue').textContent = "50";
    }
});