document.addEventListener("DOMContentLoaded", function () {

    // Greeting
    const greeting = document.querySelector(".greeting-text h2");

    if (greeting) {

        const hour = new Date().getHours();
        const name = greeting.textContent.split(", ")[1];

        let text = "Good Morning";

        if (hour >= 12 && hour < 17) {
            text = "Good Afternoon";
        } else if (hour >= 17) {
            text = "Good Evening";
        }

        greeting.textContent = text + ", " + name;
    }

    // Card Animation
    const cards = document.querySelectorAll(".greeting-card, .card");

    cards.forEach(function(card, index) {

        card.style.opacity = "0";
        card.style.transform = "translateY(20px)";

        setTimeout(function() {
            card.style.transition = "all .5s ease";
            card.style.opacity = "1";
            card.style.transform = "translateY(0)";
        }, index * 150);

    });

});