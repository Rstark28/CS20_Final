// Global variables
let current_section = 'header-section'; // Tracks the currently active section
let all_sections = ['header-section', 'story-section', 'testimonials-section']; // List of all sections for navigation
let selectedGenres = []; // Placeholder for selected genres (not used in this snippet)


// Scrolling Logic

// Smoothly scrolls to the specified section by its ID and updates the
// active section indicator
function scrollToSection(section_id) {
    let next_section = document.getElementById(section_id); // Get the target section element
    if (next_section) {
        next_section.scrollIntoView({behavior: 'smooth', block: 'start'}); // Smooth scroll to the section
        current_section = section_id; // Update the currently active section

        // Update the side navigation dots to reflect the active section
        document.querySelectorAll('.side-dots span').forEach((dot, index) => {
            dot.classList.toggle('active', all_sections[index] == section_id);
        });
    }
}

// Intersection Observer to detect when sections come into view
// Note: https://developer.mozilla.org/en-US/docs/Web/API/Intersection_Observer_API
//       was utilized for this section
let observer = new IntersectionObserver(
    (next_entr) => {
        next_entr.forEach(entr => {
            if (entr.isIntersecting) {
                let section_id = entr.target.id; // Get the ID of the next intersection section
                current_section = section_id; // Update the current section
                
                // Update the side navigation dots to reflect visible section
                let found_idx = all_sections.indexOf(section_id);
                document.querySelectorAll('.side-dots span').forEach((dot, index) => {
                    dot.classList.toggle('active', index == found_idx); // Highlight the corresponding dot
                });
            }
        });
    },
    {threshold: 0.5} // Trigger when 50% of the section is visible on the current screen
);

// Observe each section in the document to track overall visibility
document.querySelectorAll('section').forEach(next_section => {
    observer.observe(next_section); // Add each section to the observer
});

// Navigates to the previous or next section based on the direction
function arrowNavigation(dir) {
    let current_idx = all_sections.indexOf(current_section); // Get the index of the current section
    let target_idx;

    if (dir == 'up' && current_idx > 0) {
        target_idx = current_idx - 1; // Move to the previous section
    } else if (dir == 'down' && current_idx < all_sections.length - 1) {
        target_idx = current_idx + 1; // Move to the next section
    } else {
        return; // Do nothing if we have reached a defined boundary on the webpage
    }

    scrollToSection(all_sections[target_idx]); // Scroll to the target section
}

// Attach click event listeners to all navigation arrows
document.querySelectorAll('.arrow').forEach(next_arrow => {
    next_arrow.addEventListener('click', (e) => {
        arrowNavigation(next_arrow.classList.contains('up') ? 'up' : 'down');
    });
});

// Dynamically creates navigation arrows for specified containers
function createNavArrows(containerId) {
  const container = document.getElementById(containerId); // Get the container element in the HTML
  if (!container) return; // Exit if the container doesn't exist

  // Create and append the "Up" navigation arrows
  const arrowUp = document.createElement("button");
  arrowUp.classList.add("arrow", "up");
  arrowUp.innerHTML = '<i class="fas fa-arrow-up"></i>'; // Add arrow icon
  arrowUp.addEventListener("click", () => arrowNavigation("up")); // Attach click event

  // Create and append the "Down" navigation arrows
  const arrowDown = document.createElement("button");
  arrowDown.classList.add("arrow", "down");
  arrowDown.innerHTML = '<i class="fas fa-arrow-down"></i>'; // Add arrow icon
  arrowDown.addEventListener("click", () => arrowNavigation("down")); // Attach click event

  container.appendChild(arrowUp);
  container.appendChild(arrowDown);
}

// Generate navigation arrows for the specified sections
["header-nav-arrows", "story-nav-arrows", "testimonials-nav-arrows"].forEach(createNavArrows);