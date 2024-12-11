document.addEventListener("DOMContentLoaded", () => {
    const storyContainer = document.getElementById("story-container");
    storyContainer.className = "story-container";
  
    // Fetch team data from the JSON file
    fetch("../static/json/team.json")
      .then(response => response.json())
      .then(teamMembers => {
        teamMembers.forEach(member => {
          const card = document.createElement("div");
          card.classList.add("our-story");
  
          card.innerHTML = `
            <img src="${member.image}" alt="${member.name}">
            <div class="overlay">
              <p>${member.name}</p>
              <p>${member.year}</p>
              <p>${member.major}</p>
            </div>
          `;
  
          storyContainer.appendChild(card);
        });
      })
      .catch(error => console.error("Error loading team data:", error));
  });
  