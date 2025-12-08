// Setup express and ejs
const express = require("express");
const expressSession = require("express-session");
const dotenv = require("dotenv");
const mysql = require("mysql2");

// Create the express application object
const app = express();
const port = 8000;
const expressLayouts = require("express-ejs-layouts");

dotenv.config();

// Define the database connection pool
const db = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});
global.db = db;

// Tell Express that we want to use EJS as the templating engine
app.set("view engine", "ejs");

// Set up session middleware
app.use(
  expressSession({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
  })
);

app.use((req, res, next) => {
  res.locals.loggedUser = req.session.loggedUser || null;
  next();
});

// Set up the body parser
app.use(express.urlencoded({ extended: true }));

// Set up express-ejs-layouts
app.use(expressLayouts);
app.set("layout", "layouts/main");

// Serve static files from the "public" folder
app.use(express.static("public"));

// Load the route handlers
const mainRoutes = require("./routes/main");
app.use("/", mainRoutes);

// Load the route handlers for /auth
const authRoutes = require("./routes/auth");
app.use("/auth", authRoutes);

const runsRoutes = require("./routes/runs");
app.use("/runs", runsRoutes);

const followRoutes = require("./routes/follow");
app.use("/follow", followRoutes);

app.use((error, req, res, next) => {
  console.error(error.stack);
  res.status(500).send("Something broke!<br>" + error.message);
});

// Start the web app listening
app.listen(port, () => console.log(`Example app listening on port ${port}!`));
