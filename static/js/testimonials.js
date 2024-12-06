document.addEventListener("DOMContentLoaded", () => {
    const testimonialsContainer = document.getElementById("testimonials-container");

    // Fetch testimonials from the JSON file
    fetch("../static/json/testimonials.json")
        .then(response => response.json())
        .then(testimonials => {
            testimonials.forEach(testimonial => {
                const card = document.createElement("div");
                card.classList.add("testimonial-card");

                card.innerHTML = `
                    <h3>${testimonial.name}</h3>
                    <p>"${testimonial.feedback}"</p>
                    <span>- ${testimonial.role}</span>
                `;

                testimonialsContainer.appendChild(card);
            });
        })
        .catch(error => console.error("Error loading testimonials:", error));
});
