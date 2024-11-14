function sendForm(event)
{
    event.preventDefault();

    const name = document.getElementById("name").value.trim();
    const email = document.getElementById("email").value.trim();
    const message = document.getElementById("message").value.trim();
    const errorMessageName = document.getElementById("error-message-name")
    const errorMessageEmail = document.getElementById("error-message-email")
    const errorMessageMessage = document.getElementById("error-message-message")
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; /*email dogrulama yapması icin*/ 

    if (!name) {
        document.getElementById("error-message-name").textContent = "Lütfen isim Giriniz.";
        document.getElementById("error-message-name").style.display = "block";

        setTimeout(() => {
            errorMessageName.style.display = "none";
        }, 3000); /* 3 saniye sonra hata mesaji kaybolucak */ 
        return;
    }
    if (!email) {
        document.getElementById("error-message-email").textContent = "Lütfen e-mail adresi giriniz.";
        document.getElementById("error-message-email").style.display = "block";

        setTimeout(() => {
            errorMessageEmail.style.display = "none";
        }, 3000); /* 3 saniye sonra hata mesaji kaybolucak */ 
        return;
    }
    if (!emailPattern.test(email)) {
        document.getElementById("error-message-email").textContent = "Geçersiz email adresi.";
        document.getElementById("error-message-email").style.display = "block";

        setTimeout(() => {
            errorMessageEmail.style.display = "none";
        }, 3000); /* 3 saniye sonra hata mesaji kaybolucak */
        return;
    }
    if (!message) {
        document.getElementById("error-message-message").textContent = "Lütfen mesaj giriniz.";
        document.getElementById("error-message-message").style.display = "block";

        setTimeout(() => {
            errorMessageMessage.style.display = "none";
        }, 3000); /* 3 saniye sonra hata mesaji kaybolucak */ 
        return;
    }

    const mailLink = `mailto:ebcakir52@gmail.com?subject=Contact from ${encodeURIComponent(name)}&body=${encodeURIComponent(message)}`;
    window.location.href = mailLink
}