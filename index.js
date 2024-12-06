// Import required modules
const express = require("express");
const path = require("path");
const bcrypt = require("bcrypt");
const { MongoClient, ServerApiVersion } = require("mongodb");
const bodyParser = require("body-parser");
const session = require("express-session");
const crypto = require("crypto");

// Initialize Express app
const app = express();
const port = process.env.PORT || 3000;

// MongoDB configuration
const uri = "mongodb+srv://djangoproj210:123@cluster0.ghk5p.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
const dbName = "User_Auth";
const collectionName = "users";

let client; // MongoDB client instance
let usersCollection; // Reference to users collection

// Function to connect to MongoDB
async function connectToMongo() {
  try {
    client = new MongoClient(uri, {
      serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
      },
    });
    await client.connect();

    // Get database and collection
    const database = client.db(dbName);
    usersCollection = database.collection(collectionName);
    console.log("Connected to MongoDB");
  } catch (err) {
    console.error("Error connecting to MongoDB:", err);
  }
}

// Establish MongoDB connection
connectToMongo();

// Generate a session secret (for user authentication)
const sessionSecret = process.env.SESSION_SECRET || crypto.randomBytes(64).toString("hex");

// Middleware configuration
app.set("view engine", "ejs"); // Serve views
app.use('/static', express.static(path.join(__dirname, 'static'))); // Serve static
app.use(bodyParser.urlencoded({ extended: true })); // Data parser

// Session configuration
app.use(
  session({
    secret: sessionSecret,
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false },
  })
);

// Routes

// Home route
app.get("/", (req, res) => {
  res.render("index"); // Render index.ejs
});

// App route
app.get("/app", (req, res) => {
  // Redirect to login page if the user is not logged in
  if (!req.session.userId) {
    return res.redirect("/login");
  }
  res.render("app");
});

// Register route
app.get("/register", (req, res) => {
  res.render("register");
});

// Login route
app.get("/login", (req, res) => {
  res.render("login");
});

// Logout route
app.get("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.send("Error during logout.");
    }

    res.redirect("/login");
  });
});

// User registration
app.post("/register", async (req, res) => {
  const { email, password } = req.body;

  try {
    // Check if the email is already registered
    const existingUser = await usersCollection.findOne({ email });
    if (existingUser) {
      return res.send("User with this email already exists.");
    }

    // Hash the user's password
    const passwordHash = await bcrypt.hash(password, 10);

    // Create a new user document
    const newUser = {
      email,
      passwordHash,
      createdAt: new Date(),
    };

    await usersCollection.insertOne(newUser);

    // Set session variables
    req.session.userId = newUser._id;
    req.session.email = newUser.email;

    res.redirect("/app");
  } catch (error) {
    console.error("Error during registration:", error);
    res.send("An error occurred during registration.");
  }
});

// User login
app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    // Find the user by email
    const user = await usersCollection.findOne({ email });
    if (!user) {
      return res.send("No user found with this email.");
    }

    // Verify the password
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      return res.send("Invalid password.");
    }

    // Set session variables
    req.session.userId = user._id;
    req.session.email = user.email;

    res.redirect("/app");
  } catch (error) {
    console.error("Error during login:", error);
    res.send("An error occurred during login.");
  }
});

// Close MongoDB connection
process.on("SIGINT", async () => {
  if (client) {
    await client.close();
    console.log("MongoDB connection closed");
  }
  process.exit(0);
});

// Start the Express server
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
