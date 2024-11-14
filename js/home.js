const words = ["Geliştirici", "Bilgisayar Mühendisi", "Tasarımcı","Robotik Mühendisi"];
let wordIndex = 0;
let letterIndex = 0;
const typingSpeed = 150;
const erasingSpeed = 100;
const delayBetweenWords = 2000;
const dynamicText = document.getElementById("dynamic-text");

function type() {
    if (letterIndex < words[wordIndex].length) {
        dynamicText.textContent += words[wordIndex][letterIndex];
        letterIndex++;
        setTimeout(type, typingSpeed);
    } else {
        setTimeout(erase, delayBetweenWords);
    }
}

function erase() {
    if (letterIndex > 0) {
        dynamicText.textContent = words[wordIndex].substring(0, letterIndex - 1);
        letterIndex--;
        setTimeout(erase, erasingSpeed);
    } else {
        wordIndex = (wordIndex + 1) % words.length;
        setTimeout(type, typingSpeed);
    }
}

document.addEventListener("DOMContentLoaded", function() {
    type(); // Başlatmak için type fonksiyonunu çağırıyoruz
});

