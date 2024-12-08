// Load environment variables from a .env file into process.env
require('dotenv').config()

// Import required libraries
const express = require('express'); // Framework for helping build the app
const axios = require('axios'); // Helps with making the requried HTTP calls
const cors = require('cors'); // Helped to enable Cross-Origin Resource Sharing
const bodyParser = require('body-parser'); // Helps with parsing incomingrequests properly

// Initialize the Express app
const app = express();

// Apply the required libraries
app.use(cors()); // Enable CORS for all the created routes
app.use(bodyParser.json()); // Parse the incoming JSON data

// Fetch Spotify API credentials from environment variables
const clientID = process.env.SPOTIFY_CLIENT_ID; // Spotify client ID (provided by Spotify when sign-up occurred)
const clientSECRET = process.env.SPOTIFY_CLIENT_SECRET; // Spotify secret client code (provided as a personal key by Spotify)

// Encode Spotify credentials in order to pass basic authorization properly
const basicAuth = Buffer.from(`${clientID}:${clientSECRET}`).toString('base64');

// Root route - basic response in order to check whether the server was running properly
// Note: helped with debugging
app.get('/', (req, res) => {
    res.send('Welcome to the Spotify Backend API!');
})

// Route to fetch events from TicketMAster API for a given artist
app.get('/events', async (req, res) => {
    const artist_name = req.query.artist; // Extract artist name from query parameters
    const ticketMasterAPIKey = process.env.TICKETMASTER_API_KEY; // Ticketmaster API key from environment variables

    try {
        // Make a GET request to Tickemaster API to search for events marching the artist name
        const response = await axios.get('https://app.ticketmaster.com/discovery/v2/events.json', {
            params: {
                apikey: ticketMasterAPIKey, // API key for authentication
                keyword: artist_name // Search keyword/inputted artist name
            }
        });
        
        // Check if events are found and return them; otherwise, return an empty array
        if (response.data._embedded && response.data._embedded.events) {
            res.json(response.data._embedded.events);
        } else {
            res.json([]); // Handles the situation where no events are found
        }
    } catch (error) {
        // Handle errros by returning a 500 status code
        // Note: used extensively in debugging
        res.status(500).json({error: "Failed to fetch events!"});
    }
});


// Route to fetch a spotify access token using given client credentials
// Note: https://developer.spotify.com/documentation/web-api was used
//       to help with solving the refresh token issue
app.get('/token', async (req, res) => {
    try {
        // Make a POST request to Spotify for a new access token
        const response = await axios.post(
            'https://accounts.spotify.com/api/token',
            new URLSearchParams({grant_type: 'client_credentials'}), // Request body
            {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded', // Required content type
                    Authorization: `Basic ${basicAuth}`, // Basic Authorizaqtion header with encoded credentials
                },
            }
        );
        res.json(response.data) // Return the access token its details
    } catch (error) {
        // Log the error and send a 500 response with a failure message
        // Note: used extensively in debugging
        console.error('Error fetching token!');
        res.status(500).json({error: 'Failed to fetch token'});
    }
})

// Initiate the actual server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});