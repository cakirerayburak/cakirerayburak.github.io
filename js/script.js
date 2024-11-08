// Saat güncelleyici fonksiyon
function updateClock() {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    document.getElementById('current-time').textContent = `${hours}:${minutes}:${seconds}`;
}

// Saati her saniyede bir güncelle
setInterval(updateClock, 1000);
updateClock(); // Sayfa yüklendiğinde saati hemen göster


function toggleDescription() {
    const descriptionContainer = document.getElementById("description");
    const toggleButton = document.getElementById("toggle-description");

    descriptionContainer.classList.toggle("expanded");

    if (descriptionContainer.classList.contains("expanded")) {
        toggleButton.textContent = "Daha Az Gör";
    } else {
        toggleButton.textContent = "Daha Fazla Gör";
    }
}




const navToggle = document.querySelector('.nav-toggle');
const navbar = document.querySelector('.navbar');

navToggle.addEventListener('click', () => {
    navbar.classList.toggle('active');
});

document.addEventListener("DOMContentLoaded", function() {
    setTimeout(type, delayBetweenWords);
});
