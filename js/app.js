$(document).ready(function() {
    // Load header and footer components
    $('#header').load('components/header.html');
    $('#footer').load('components/footer.html');

    // Example: Add 'scrolled' class to navbar when scrolling
    window.addEventListener("scroll", function () {
        const header = document.getElementById("header");
        if (window.scrollY > 50) {
            header.classList.add("scrolled");
        } else {
            header.classList.remove("scrolled");
        }
    });
});
