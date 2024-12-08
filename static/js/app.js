// Global variables
let current_section = "genre-section"; // Tracks the currently visible section
let all_sections = ["genre-section", "playlist-section", "events-section"]; // List of all sections for navigation
let selectedGenres = []; // Stores the genres selected by the user

// Scrolling Logic

// Scrolls smoothly to the specified section and updates the current section
// Also updates the side navitgation dots to reflect the current section
function scrollToSection(section_id) {
  let next_section = document.getElementById(section_id); // Get the target section
  if (next_section) {
    next_section.scrollIntoView({ behavior: "smooth", block: "start" }); // Smooth scrolling is initiated
    current_section = section_id; // Update the current section to reflect current status

    // Update the side navigation dots to highlight the current activated section
    document.querySelectorAll(".side-dots span").forEach((dot, index) => {
      dot.classList.toggle("active", all_sections[index] == section_id);
    });
  }
}

// Intersection Observer to detect when sections come into view
// Note: https://developer.mozilla.org/en-US/docs/Web/API/Intersection_Observer_API
//       was utilized for this section
let observer = new IntersectionObserver(
  (next_entr) => {
    next_entr.forEach((entr) => {
      if (entr.isIntersecting) {
        let section_id = entr.target.id;
        current_section = section_id; // Update the current section

        // Update the side navigation dots properly
        let found_idx = all_sections.indexOf(section_id);
        document.querySelectorAll(".side-dots span").forEach((dot, index) => {
          dot.classList.toggle("active", index == found_idx); 
        });
      }
    });
  },
  { threshold: 0.5 } // Trigger when 50% of the section is visible on the page
);

// Observe each section to track visibility
document.querySelectorAll("section").forEach((next_section) => {
  observer.observe(next_section);
});

// Navigates to the next or previous section that is based
// on the inputted direction (up/down)
function arrowNavigation(dir) {
  let current_idx = all_sections.indexOf(current_section); // Get the current section index
  let target_idx;

  if (dir == "up" && current_idx > 0) {
    target_idx = current_idx - 1; // Move to the previous section of the web page
  } else if (dir == "down" && current_idx < all_sections.length - 1) {
    target_idx = current_idx + 1; // Move to the next section of the web page
  } else {
    return; // No action is needed if we reached a designed boundary of the page
  }

  scrollToSection(all_sections[target_idx]);
}

// Attach click listeners to the navigation arrows
document.querySelectorAll(".arrow").forEach((next_arrow) => {
  next_arrow.addEventListener("click", (e) => {
    arrowNavigation(next_arrow.classList.contains("up") ? "up" : "down");
  });
});

// Spotify API Logic


let accessToken = null; // Stores the Spotify access token
let tokenExpirationTime = 0; // Tracks when the token expiress

// Fetches a new access token from the Spotify backend
async function fetchAccessToken() {
  const response = await fetch(
    "https://whispering-meadow-56072-ba39b0cc37be.herokuapp.com/token"
  );
  const data = await response.json();
  accessToken = data.access_token; // Save the new token 
  tokenExpirationTime = Date.now() + data.expires_in * 1000; // Calculate expiration time
}

// Retrieves a valid access token, refreshing it if necessary
async function getAccessToken() {
  if (!accessToken || Date.now() >= tokenExpirationTime) {
    await fetchAccessToken(); // Refresh the token if expired or missing
  }
  return accessToken;
}

// Generates a playlist based on selected genres using the Spotify API
async function generatePlaylist() {
  let header = document.getElementById("genre-select-header");
  if (selectedGenres.length === 0) {
    header.innerHTML = "Please select at least one genre!"; // Prompt user if no genres selected
    return;
  }

  try {
    header.innerHTML = "Select Your Favorite Genres"; // Reset header text when genres are chosen by user
    let accessToken = await getAccessToken(); // Ensure that a valid access token was retrieved
    let all_tracks = [];

    for (let next_genre of selectedGenres) {
      let random_off = Math.floor(Math.random() * 100); // Randomize the selection of tracks from the Spotify API
      let response = await fetch(
        `https://api.spotify.com/v1/search?q=genre:${next_genre}&type=track&offset=${random_off}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      if (response.ok) {
        let data = await response.json();
        all_tracks = all_tracks.concat(data.tracks.items); // Add tracks to the tracker list
      } else {
        let errorData = await response.json();
        console.error("Spotify API Error:", errorData);
        alert("Failed to generate playlist. Please try again later.");
        return;
      }
    }

    // Remove duplicate tracks so as to provide a more useful user experience
    let unique = [];
    let track_id_next = new Set();

    all_tracks.forEach((next_track) => {
      if (!track_id_next.has(next_track.id)) {
        track_id_next.add(next_track.id);
        unique.push(next_track);
      }
    });

    // Shuffle the found tracks in-place in order to show
    // a randomized view of selected tracks
    // Note: https://www.geeksforgeeks.org/ was used to help solve the issue
    // of randomization
    function shuffleTracks(track_array) {
      for (let i = track_array.length - 1; i > 0; i--) {
        let rand_index = Math.floor(Math.random() * (i + 1));
        [track_array[i], track_array[rand_index]] = [
          track_array[rand_index],
          track_array[i],
        ];
      }
    }

    shuffleTracks(unique);

    // show the user 12 randomly fetched tracks from the Spotify API
    let final_tracks = unique.slice(0, 12);
    displayPlaylist(final_tracks);
    scrollToSection("playlist-section");
  } catch (error) {
    console.error("Error fetch playlist:", error);
  }
}

// Displays the playlist tracks in the playlist container of the HTML
function displayPlaylist(tracks) {
  let container = document.getElementById("playlist-container");
  container.innerHTML = ""; // Clear the container

  // Check if the tracks array is empty or undefined
  if (!tracks || tracks.length === 0) {
    // Handle empty playlists gracefully
    container.classList.add("no-result");
    container.innerHTML = `
        <div class="no-result-card">
          <h3>No Playlist Found</h3>
          <p>Please select at least one genre and generate a playlist.</p>
        </div>
        `;
    return;
  }
  container.classList.remove("no-result"); // Remove the "no result" class if tracks were actually found

  // Iterate over the tracks and create a DOM element for each one
  tracks.forEach((track) => {
    let trackElement = document.createElement("div");
    trackElement.classList.add("track"); // Add the next song/track to the CSS class

    // Populate the track element with album art, track info, and spotify link provided by
    // Spotify APU
    trackElement.innerHTML = `
            <img src="${
              track.album.images[0]
                ? track.album.images[0].url
                : "images/no-album-cover.png"
            }" alt="Album Art" class="album-art">
            <div class="track-info">
                <h3>${track.name}</h3>
                <p>${track.artists.map((artist) => artist.name).join(", ")}</p>
                <a href="${
                  track.external_urls.spotify
                }" target="_blank">Listen on Spotify</a>
            </div>
        `;
    container.appendChild(trackElement); // Append the track element to the HTML container holding all of the data
  });
}

// Initialize the playlist display with an empty state
displayPlaylist([]);

// Logic to dynamically load genres and handle their selecton
document.addEventListener("DOMContentLoaded", async function () {
  let is_mobile = false; // tracks whether the device is mobile view or close to it
  let all_genre_container = document.getElementById("genre-pills");
  let more_button = document.getElementById("show-more"); // Button to toggle genre "pill" visibility
  let all_pills = []; // Array to store all genre pills

  // Loads genres from a local JSON file and creates pill elements for each genre
  async function load_genres() {
    try {
      let response = await fetch("../static/json/genres.json"); // Fetch genres from a JSON file
      let found_genres = await response.json();

      // Create a pill for each genre
      found_genres.forEach((next_genre) => {
        let next_pill = document.createElement("span");
        next_pill.classList.add("genre-pill");
        next_pill.setAttribute(
          "data-value",
          next_genre.toLowerCase().replace(/ /g, "_") // Convert genre to the proper format using regex expression/search for whitespace
        );
        next_pill.textContent = next_genre;

        // Toggle genre selection on click
        next_pill.addEventListener("click", () => toggle_genre(next_pill));
        all_genre_container.appendChild(next_pill);
      });

      all_pills = document.querySelectorAll(".genre-pill");  // Cache all the pills that are present on the page
      update_vis_pills();  // Update visibility based on the screen size of the current window
    } catch (error) {
      console.log("Unable to fetch genres!");
    }
  }

  // Toggle a genre's selection state and updates the selectedGenres array
  function toggle_genre(pill) {
    let next_genre = pill.getAttribute("data-value");

    if (selectedGenres.includes(next_genre)) {
      selectedGenres = selectedGenres.filter(
        (selected) => selected != next_genre
      );
      pill.classList.remove("selected"); // Deselect the genre pill that was clicked by the user
    } else {
      selectedGenres.push(next_genre);
      pill.classList.add("selected"); // Select the genre pill that was clicked by the user
    }
  }

  // Updates the visibility of the genre pills based on the width of the device
  // being used
  function update_vis_pills() {
    if (window.innerWidth < 768) {
      let hidden_pills = Array.from(all_pills).slice(10); // Hide all but he first 10 genre pills
      hidden_pills.forEach((pill) => {
        pill.style.display = is_mobile ? "inline-block" : "none"; // Toggle the visibility of the pills
      });

      more_button.style.display = "block";
      more_button.textContent = is_mobile ? "Show Less" : "Show More"; // Show the "Show More/Less" button that a user can interact with
    } else {
      all_pills.forEach((pill) => (pill.style.display = "inline-block")); // Show all the pills to the current user
      more_button.style.display = "none"; // Hide the toggle button if screen is large enough
      is_mobile = false;
    }
  }

  // Toggle visibility of addional genre pills on button click
  more_button.addEventListener("click", () => {
    is_mobile = !is_mobile;
    update_vis_pills();
  });

  window.addEventListener("resize", update_vis_pills); // Adjust the pill visibility on window resizing
  load_genres(); // Load all of the genres initially
});

// TicketMaster API Logic

// Fetches events for a given artist from the Tickemaster API and displays them
async function grabEvents(artist_name) {
  try {
    let fixed_artist = encodeURIComponent(artist_name); // Encode artist name for the URL
    const response = await fetch(
      `https://whispering-meadow-56072-ba39b0cc37be.herokuapp.com/events?artist=${fixed_artist}`
    );

    if (!response.ok) {
      displayAllEvents([]); // Display an empty state if the fetch for events does not work
      console.error("Error fetching events:", error);
      return;
    }

    const data = await response.json();

    // Check if there are any events available and display them properly
    if (data._embedded && data._embedded.events) {
      displayAllEvents(data._embedded.events);
    } else {
      displayAllEvents([]); // Display an empty state in there are no events found
    }
  } catch (error) {
    console.error("Error fetching events:", error);
    displayAllEvents([]); // Handle errors properly
  }
}

// Displays the fetched events in the events container within the HTML
function displayAllEvents(events) {
  let eventsContainer = document.getElementById("events-container");
  eventsContainer.innerHTML = ""; // Clear the container within the HTML

  if (events.length == 0) {
    // Handle empty events properly
    eventsContainer.classList.add("no-result");
    eventsContainer.innerHTML = `
        <div class="no-result-card">
        <h3>No Upcoming Events</h3>
        <p>We're sorry, but there are no scheduled events for this artist at the moment. Please check back later!</p>
        </div>
        `;
    return;
  }

  eventsContainer.classList.remove("no-result"); // Remove "no result" class if events are found

  events.forEach((event) => {
    let next_event = document.createElement("div");
    let next_image = event.images?.[0]?.url;
    next_event.classList.add("event-card");

    // Handle valid and invalid event URLs
    let found_url = null;
    if (event.url && !event.url.includes("undefined")) {
      found_url = event.url;
    }

    // Handle the event where there is no ticket site up and running
    // for a particluar event via Tickemaster API
    let button_text = "";
    if (found_url) {
      button_text = `<button onclick="window.open('${found_url}', '_blank')">Buy Tickets</button>`;
    } else {
      button_text = `<button disabled style="cursor: not-allowed; opacity: 0.6;">Tickets Not Available</button>`;
    }

    // Populate the event card with details that are provided
    // by the TickeMaster API such as name of event, event image, event date, etc.
    next_event.innerHTML = `
        <img src="${next_image}" alt="${event.name}" class="event-image">
        <h3>${event.name}</h3>
        <p> ${new Date(event.dates.start.localDate).toDateString()}</p>
        <p> ${event._embedded.venues[0].name}</p>
        ${button_text}`;

    eventsContainer.appendChild(next_event); // Append the processed events card to the HMTL container
  });
}

// Add click event listnener to the playlist container to fetch events
// for the select artist
document
  .getElementById("playlist-container")
  .addEventListener("click", (event) => {
    let artist_card = event.target.closest(".track");
    if (!artist_card) {
      return;
    }

    let artist_name = artist_card
      .querySelector(".track-info p")
      .textContent.split(",")[0]
      .trim(); // Extrac tthe artist name from the card

    scrollToSection("events-section"); // Navigate to the events section right away, once an artist is clicked
    grabEvents(artist_name); // Fetch events for the selected artis
  });

  // Initialize the events container with an empty state
displayAllEvents([]);

// Dynamically create navigation arrows for navigation between sections
function createNavArrows(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;

  // Create and append a "Home" button
  const homeButton = document.createElement("button");
  homeButton.classList.add("arrow", "home");
  homeButton.innerHTML = '<i class="fas fa-home"></i>';
  homeButton.addEventListener("click", () => (window.location.href = "/"));

  // Create and append a "Up" navigation arrow
  const arrowUp = document.createElement("button");
  arrowUp.classList.add("arrow", "up");
  arrowUp.innerHTML = '<i class="fas fa-arrow-up"></i>';
  arrowUp.addEventListener("click", () => arrowNavigation("up"));

  // Create and append a "Down" navigation arrow
  const arrowDown = document.createElement("button");
  arrowDown.classList.add("arrow", "down");
  arrowDown.innerHTML = '<i class="fas fa-arrow-down"></i>';
  arrowDown.addEventListener("click", () => arrowNavigation("down"));

  // Create and append a "Logout" button
  const logoutButton = document.createElement("button");
  logoutButton.classList.add("arrow", "logout");
  logoutButton.innerHTML = '<i class="fas fa-sign-out-alt"></i>';
  logoutButton.addEventListener(
    "click",
    () => (window.location.href = "/logout")
  );

  // Append all buttons to the container within the HTML
  container.appendChild(homeButton);
  container.appendChild(arrowUp);
  container.appendChild(arrowDown);
  container.appendChild(logoutButton);
}

// Generate navigation arrows for specified container
["genre-nav-arrows", "playlist-nav-arrows", "events-nav-arrows"].forEach(
  createNavArrows
);
