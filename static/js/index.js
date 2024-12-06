// Global variables
const allSections = [
    'header-section',
    'story-section',
    'testimonials-section',
];

let currentSectionIndex = 0;

// Helper: Scroll to a specific section
function scrollToSection(index) {
    const section = document.getElementById(allSections[index]);
    if (section) {
        section.scrollIntoView({ behavior: 'smooth', block: 'start' });
        updateActiveDot(index);
        currentSectionIndex = index;
    }
}

// Helper: Update active dot on the side navigation
function updateActiveDot(index) {
    document.querySelectorAll('.side-dots span').forEach((dot, i) => {
        dot.classList.toggle('active', i === index);
    });
}

// Arrow navigation logic
function arrowNavigation(direction) {
    if (direction === 'up' && currentSectionIndex > 0) {
        scrollToSection(currentSectionIndex - 1);
    } else if (direction === 'down' && currentSectionIndex < allSections.length - 1) {
        scrollToSection(currentSectionIndex + 1);
    }
}

// Add event listeners to arrow buttons
document.querySelectorAll('.arrow').forEach((arrow) => {
    arrow.addEventListener('click', () => {
        const direction = arrow.classList.contains('up') ? 'up' : 'down';
        arrowNavigation(direction);
    });
});

// Intersection observer to track the current visible section
const observer = new IntersectionObserver(
    (entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                currentSectionIndex = allSections.indexOf(entry.target.id);
                updateActiveDot(currentSectionIndex);
            }
        });
    },
    { threshold: 0.5 }
);

// Observe all sections
allSections.forEach((sectionId) => {
    const section = document.getElementById(sectionId);
    if (section) {
        observer.observe(section);
    }
});

// Dynamically create navigation arrows
function createNavArrows(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    // Create Up arrow
    const arrowUp = document.createElement('button');
    arrowUp.classList.add('arrow', 'up');
    arrowUp.textContent = '▲';
    arrowUp.addEventListener('click', () => arrowNavigation('up'));

    // Create Down arrow
    const arrowDown = document.createElement('button');
    arrowDown.classList.add('arrow', 'down');
    arrowDown.textContent = '▼';
    arrowDown.addEventListener('click', () => arrowNavigation('down'));

    // Append arrows to the container
    container.appendChild(arrowUp);
    container.appendChild(arrowDown);
}

// Generate navigation arrows for each section
['header-nav-arrows', 'story-nav-arrows', 'testimonials-nav-arrows'].forEach(createNavArrows);
