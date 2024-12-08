document.addEventListener("DOMContentLoaded", () => {
  const storyContainer = document.getElementById("our-story");

  // Fetch story from the JSON file
  fetch("../static/json/story.json")
      .then(response => response.json())
      .then(story => {
          story.forEach(story => {
              const card = document.createElement("div");
              card.classList.add("story-card");

              card.innerHTML = `
                  <p>"${story.story}"</p>
              `;

              storyContainer.appendChild(card);
          });
      })
      .catch(error => console.error("Error loading story:", error));
});
