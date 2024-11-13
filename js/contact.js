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
        document.getElementById("error-message-name").textContent = "Please enter your name.";
        document.getElementById("error-message-name").style.display = "block";

        setTimeout(() => {
            errorMessageName.style.display = "none";
        }, 3000); /* 3 saniye sonra hata mesaji kaybolucak */ 
        return;
    }
    if (!email) {
        document.getElementById("error-message-email").textContent = "Please enter your e-mail.";
        document.getElementById("error-message-email").style.display = "block";

        setTimeout(() => {
            errorMessageEmail.style.display = "none";
        }, 3000); /* 3 saniye sonra hata mesaji kaybolucak */ 
        return;
    }
    if (!emailPattern.test(email)) {
        alert("Please enter a valid email address.");
        return;
    }
    if (!message) {
        document.getElementById("error-message-message").textContent = "Please enter your message.";
        document.getElementById("error-message-message").style.display = "block";

        setTimeout(() => {
            errorMessageMessage.style.display = "none";
        }, 3000); /* 3 saniye sonra hata mesaji kaybolucak */ 
        return;
    }

    const mailLink = `mailto:ebcakir52@gmail.com?subject=Contact from ${encodeURIComponent(name)}&body=${encodeURIComponent(message)}`;
    window.location.href = mailLink
}