// Setup express and ejs
const express = require('express');
const expressSession = require('express-session');
const dotenv = require('dotenv');
const mysql = require('mysql2');
const methodOverride = require('method-override');
const expressSanitizer = require('express-sanitizer');

// Create the express application object
const app = express();
const port = 8000;
const expressLayouts = require('express-ejs-layouts');

// Load environment variables from .env file
dotenv.config();

console.log(".ENV Variables:", {
  HEALTH_HOST: process.env.HEALTH_HOST,
  HEALTH_USER: process.env.HEALTH_USER,
  HEALTH_DATABASE: process.env.HEALTH_DATABASE,
  SESSION_SECRET: process.env.SESSION_SECRET ? 'DEFINED' : 'UNDEFINED',
});

// Define the database connection pool
const db = mysql.createPool({
  host: process.env.HEALTH_HOST,
  user: process.env.HEALTH_USER,
  password: process.env.HEALTH_PASSWORD,
  database: process.env.HEALTH_DATABASE,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});
global.db = db;

require('./cron/goalCron');
// Tell Express that we want to use EJS as the templating engine
app.set('view engine', 'ejs');

// Set up session middleware
app.use(
  expressSession({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
  }),
);

app.use((req, res, next) => {
  res.locals.loggedUser = req.session.loggedUser || null;
  next();
});

// Set up the body parser
app.use(express.urlencoded({ extended: true }));

app.use(methodOverride('_method'));

app.use(expressSanitizer());

// Set up express-ejs-layouts
app.use(expressLayouts);
app.set('layout', 'layouts/main');

// Serve static files from the "public" folder
app.use(express.static('public'));

// Server static files from the "uploads" folder
app.use('/uploads', express.static('uploads'));

// Load the route handlers
const mainRoutes = require('./routes/main');
app.use('/', mainRoutes);

// Load the route handlers for /auth
const authRoutes = require('./routes/auth');
app.use('/auth', authRoutes);

const runsRoutes = require('./routes/runs');
app.use('/runs', runsRoutes);

const goalsRoutes = require('./routes/goals');
app.use('/goals', goalsRoutes);

const searchRoutes = require('./routes/search');
app.use('/search', searchRoutes);

const profileRoutes = require('./routes/profile');
app.use('/profile', profileRoutes);

const followRoutes = require('./routes/follow');
app.use('/follow', followRoutes);

const settingsRoutes = require('./routes/settings');
app.use('/settings', settingsRoutes);

app.use((error, req, res, next) => {
  console.error(error.stack);
  res.status(500).send('Something broke!<br>' + error.message);
});

// Start the web app listening
app.listen(port, () => console.log(`Example app listening on port ${port}!`));
