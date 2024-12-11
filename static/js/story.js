document.addEventListener("DOMContentLoaded", () => {
    const missionContainer = document.getElementById("story");
    missionContainer.className = "story";
  
    // Fetch mission data from the JSON file
    fetch("../static/json/story.json")
      .then(response => response.json())
      .then(mission => {
        const missionHTML = `
          <p>${mission.description}</p>
        `;
  
        missionContainer.innerHTML = missionHTML;
      })
      .catch(error => console.error("Error loading mission data:", error));
  });
  