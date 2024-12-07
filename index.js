// Import required modules
const express = require("express");
const path = require("path");
const bcrypt = require("bcrypt");
const { MongoClient, ServerApiVersion } = require("mongodb");
const bodyParser = require("body-parser");
const session = require("express-session");
const crypto = require("crypto");
const flash = require("connect-flash");

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
    process.exit(1); // Exit the process if connection fails
  }
}

// Establish MongoDB connection
connectToMongo();

// Generate a session secret (for user authentication)
const sessionSecret = process.env.SESSION_SECRET || crypto.randomBytes(64).toString("hex");

// Middleware configuration
app.set("view engine", "ejs"); // Serve views
app.use("/static", express.static(path.join(__dirname, "static"))); // Serve static files
app.use(bodyParser.urlencoded({ extended: true })); // Data parser
app.use(flash()); // Flash messages

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
  if (!req.session.userId) {
    return res.redirect("/login",);
  }
  res.render("app");
});

// Register route
app.get("/register", (req, res) => {
  const errorMessages = req.flash("error");
  res.render("register", { error: errorMessages });
});

// Login route
app.get("/login", (req, res) => {
  const errorMessages = req.flash("error");
  res.render("login", { error: errorMessages });
});

// Logout route
app.get("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.send("Error during logout.");
    }
    res.redirect("/");
  });
});

// User registration
app.post("/register", async (req, res) => {
  const { email, password } = req.body;

  try {
    // Check if the email is already registered
    const existingUser = await usersCollection.findOne({ email });
    if (existingUser) {
      req.flash("error", "Email is already registered.");
      return res.redirect("/register");
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

    // Regenerate session and set variables
    req.session.regenerate((err) => {
      if (err) {
        console.error("Session regeneration error:", err);
        req.flash("error", "An error occurred. Please try again.");
        return res.redirect("/register");
      }

      req.session.userId = newUser._id;
      req.session.email = newUser.email;

      res.redirect("/app");
    });
  } catch (error) {
    console.error("Error during registration:", error);
    req.flash("error", "An error occurred during registration.");
    res.redirect("/register");
  }
});

// Handle user login
app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await usersCollection.findOne({ email });
    if (!user) {
      req.flash("error", "No user found with this email.");
      return res.redirect("/login");
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      req.flash("error", "Invalid password.");
      return res.redirect("/login");
    }

    // Regenerate session and set variables
    req.session.regenerate((err) => {
      if (err) {
        console.error("Session regeneration error:", err);
        req.flash("error", "An error occurred. Please try again.");
        return res.redirect("/login");
      }

      req.session.userId = user._id;
      req.session.email = user.email;

      res.redirect("/app");
    });
  } catch (error) {
    console.error("Error during login:", error);
    req.flash("error", "An error occurred during login.");
    res.redirect("/login");
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
