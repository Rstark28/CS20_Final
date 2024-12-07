// Global variables
let current_section = 'header-section';
let all_sections = ['header-section', 'story-section', 'testimonials-section'];
let selectedGenres = [];


// Scrolling Logic
function scrollToSection(section_id) {
    let next_section = document.getElementById(section_id);
    if (next_section) {
        next_section.scrollIntoView({behavior: 'smooth', block: 'start'});
        current_section = section_id;

        document.querySelectorAll('.side-dots span').forEach((dot, index) => {
            dot.classList.toggle('active', all_sections[index] == section_id);
        });
    }
}

let observer = new IntersectionObserver(
    (next_entr) => {
        next_entr.forEach(entr => {
            if (entr.isIntersecting) {
                let section_id = entr.target.id;
                current_section = section_id;

                let found_idx = all_sections.indexOf(section_id);
                document.querySelectorAll('.side-dots span').forEach((dot, index) => {
                    dot.classList.toggle('active', index == found_idx);
                });
            }
        });
    },
    {threshold: 0.5}
);

document.querySelectorAll('section').forEach(next_section => {
    observer.observe(next_section);
});

function arrowNavigation(dir) {
    let current_idx = all_sections.indexOf(current_section);
    let target_idx;

    if (dir == 'up' && current_idx > 0) {
        target_idx = current_idx - 1;
    } else if (dir == 'down' && current_idx < all_sections.length - 1) {
        target_idx = current_idx + 1;
    } else {
        return;
    }

    scrollToSection(all_sections[target_idx]);
}

document.querySelectorAll('.arrow').forEach(next_arrow => {
    next_arrow.addEventListener('click', (e) => {
        arrowNavigation(next_arrow.classList.contains('up') ? 'up' : 'down');
    });
});

// Dynamically create navigation arrows
function createNavArrows(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;

  const arrowUp = document.createElement("button");
  arrowUp.classList.add("arrow", "up");
  arrowUp.textContent = "▲";
  arrowUp.addEventListener("click", () => arrowNavigation("up"));

  const arrowDown = document.createElement("button");
  arrowDown.classList.add("arrow", "down");
  arrowDown.textContent = "▼";
  arrowDown.addEventListener("click", () => arrowNavigation("down"));

  container.appendChild(arrowUp);
  container.appendChild(arrowDown);
}

["header-nav-arrows", "story-nav-arrows", "testimonials-nav-arrows"].forEach(createNavArrows);