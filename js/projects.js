function filterProjects(category) {
    const projects = document.querySelectorAll('.project-img');

    projects.forEach((project) => {
        if (category === 'all' || project.dataset.category === category) {
            project.style.display = 'block';
        } else {
            project.style.display = 'none';
        }
    });
}

function l_open(imgSrc, description) {
    const lightbox = document.getElementById("lightbox");
    document.getElementById("lightbox-img").src = imgSrc;
    document.getElementById("lightbox-desc").innerText = description;
    lightbox.style.display = "flex";
}

function l_close() {
    const lightbox = document.getElementById("lightbox");
    lightbox.style.display = "none";
}