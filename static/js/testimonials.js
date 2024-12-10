document.addEventListener("DOMContentLoaded", () => {
  const testimonialsContainer = document.getElementById(
    "testimonials-container"
  );

  // Function to create star rating elements
  const starRating = (rating) => {
    const starsContainer = document.createElement("div");
    starsContainer.classList.add("star-rating");

    for (let i = 1; i <= 5; i++) {
      const star = document.createElement("span");
      star.classList.add("star");
      if (i <= rating) {
        star.textContent = "★";
        star.classList.add("filled");
      } else {
        star.textContent = "☆";
      }
      starsContainer.appendChild(star);
    }

    return starsContainer;
  };

  // Fetch testimonials from the JSON file
  fetch("../static/json/testimonials.json")
    .then((response) => response.json())
    .then((testimonials) => {
      testimonials.forEach((testimonial) => {
        const card = document.createElement("div");
        card.classList.add("testimonial-card");

        const stars = starRating(testimonial.rating);

        card.innerHTML = `
            <span class="rating">${stars.outerHTML}</span>
            <h3>${testimonial.name}</h3>
            <p>"${testimonial.feedback}"</p>
            <p class="name-role">- ${testimonial.role}</p>
        `;
        testimonialsContainer.appendChild(card);
      });
    })
    .catch((error) => console.error("Error loading testimonials:", error));
});
