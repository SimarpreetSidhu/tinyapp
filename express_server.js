const express = require("express");
const app = express();
const getUserByEmail = require("./helpers/getUserByEmail");
const urlsForUser = require("./helpers/urlsForUsers");
const generateRandomString = require("./helpers/generateRandomString");
const bcrypt = require("bcryptjs");
const cookieSession = require('cookie-session');
const {
  FORBIDDEN,
  FORBIDDEN_STATUS_CODE,
  NOT_FOUND,
  NOT_FOUND_STATUS_CODE,
  PORT,
  UNAUTHORIZED_USER,
  UNAUTHORIZED_USER_STATUS_CODE,
} = require('./constants');


const port = PORT;

/**
 * In-memory databases for URLs and users
*/
const urlDatabase = {
  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    userID: "aJ48lW",
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userID: "aJ48lW",
  },
};

// In-memory users database
const users = {};

/**
 * App configuration: set EJS view engine, parse URL-encoded bodies, and use cookie-session
*/
app.set("view engine","ejs");
app.use(express.urlencoded({extended : true}));
app.use(cookieSession({
  name: 'user_id',
  keys: ["2435dfgh345dxfcgvbh456dfgh"],

  // Cookie Options
  maxAge: 24 * 60 * 60 * 1000 // 24 hours
}));

/**
 * Start the server
*/
app.listen(port, () => {
  console.log(`App listening on port ${port}!`);
});

// middlewares

/**
*Middleware to make current user available in all EJS templates
*/
app.use((req, res, next) => {
  const user_id = req.session.user_id  || null;
  res.locals.user = users[user_id] || null;
  next();
});

/**
 * Middleware to ensure user is logged in
*/
const requireLogin = function(req,res,next) {

  const user_id = req.session.user_id;
  if (!user_id) {
    return res.status(UNAUTHORIZED_USER_STATUS_CODE).send(UNAUTHORIZED_USER);
  }
  req.user_id = user_id;
  next();
};

/**
 * Middleware to ensure user owns the requested URL
*/
const requireUrlOwnership = function(req,res,next) {
  const id = req.params.id;
  const urlItem = urlDatabase[id];
  const user_id = req.session.user_id;

  if (!urlItem) {
    return res.status(NOT_FOUND_STATUS_CODE).send(NOT_FOUND);
  }
  if (urlItem.userID !== user_id) {
    return res.status(FORBIDDEN_STATUS_CODE).send(FORBIDDEN);
  }
  req.urlItem = urlItem;
  req.urlId   = id;

  next();
};


/**
 * GET "/"
 * Redirects to /login if not logged in, else to /urls
*/
app.get("/", (req, res)=>{
  const user_id = req.session.user_id;
  if (!user_id) {
    return res.redirect("/login");
  } else {
    return res.redirect("/urls");
  }
});

/**
 * GET "/login"
 * Renders login page if not logged in, else redirects to /urls
*/
app.get("/login",(req,res)=> {
  const user_id = req.session.user_id;
  if (!user_id) {
    return res.render("login",{ error : null});
  } else {
    return res.redirect("/urls");
  }
});

/**
 * GET "/register"
 * Renders registration page if not logged in, else redirects to /urls
*/
app.get("/register",(req,res) => {
  const user_id = req.session.user_id;
  if (!user_id) {
    return res.render("register",{ error : null});
  } else {
    return res.redirect("/urls");
  }
 
});

/**
 * GET "/urls"
 * Display list of URLs for the logged-in user; show message if none exist
*/
app.get("/urls",(req,res)=> {
  const user_id = req.session.user_id;
  if (user_id) {

    const urlsForLoggedInUser = urlsForUser(urlDatabase,user_id);
    const templateVars = {
      urls:urlsForLoggedInUser,
      error: null
    };
    
    if (Object.keys(urlsForLoggedInUser).length > 0) {
      
      return res.render("urls_index", templateVars);
    } else {
      templateVars.urls = {};
      templateVars.error = "No URLs found yet. Create one!";
      return res.render("urls_index",templateVars);
    }
  } else {
    return res
      .status(UNAUTHORIZED_USER_STATUS_CODE)
      .send(UNAUTHORIZED_USER);
  }
  
});

/**
 * GET "/urls/new"
 * Render form to create a new short URL; redirect to login if not logged in
*/
app.get("/urls/new",(req,res) => {
  const user_id = req.session.user_id;
  if (user_id) {
    return res.render("urls_new");
  } else {
    res.redirect("/login");
  }
});

/**
 * POST "/urls/:id"
 * Update an existing URL's long URL if user owns it
 */

app.post("/urls/:id", requireLogin, requireUrlOwnership,(req,res)=>{
  
  const longURL = req.body.longURL;
  req.urlItem.longURL = longURL;
  return res.redirect(`/urls`);

});

/**
 * GET "/urls/:id"
 * Show details and edit form for a specific URL if user owns it
*/
app.get("/urls/:id", requireLogin, requireUrlOwnership,(req,res)=>{
  
  const templateVars = {
    id: req.urlId,
    longURL: req.urlItem.longURL
  };
  res.render("urls_show", templateVars);
});

/**
 * GET "/u/:id"
 * Redirect to the long URL for a given short URL ID; return 404 if not found
 */
app.get("/u/:id", (req, res) => {
  const id = req.params.id;
  if (urlDatabase.hasOwnProperty(id)) {
    const longURL = urlDatabase[id].longURL;
    res.redirect(longURL);
  } else {
    return res
      .status(NOT_FOUND_STATUS_CODE)
      .send(NOT_FOUND);
  }
  
});

/**
 * POST "/urls"
 * Create a new short URL for the logged-in user
*/
app.post("/urls",(req,res)=>{
  const user_id = req.session.user_id;
  if (user_id) {
    const id = generateRandomString();
    const longURL = req.body.longURL;
    urlDatabase[id] = {longURL, userID: user_id};
    return res.redirect(`/urls/${id}`);
  } else {
    return res
      .status(UNAUTHORIZED_USER_STATUS_CODE)
      .send(UNAUTHORIZED_USER);
  }
});

/**
 * POST "/urls/:id/delete"
 * Delete a short URL if user owns it
*/
app.post("/urls/:id/delete",requireLogin, requireUrlOwnership,(req,res)=>{
  delete urlDatabase[req.urlId];
  return res.redirect('/urls');
});

/**
 * POST "/login"
 * Authenticate user, verify password, and set session cookie
*/
app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  const userExist = getUserByEmail(users, email);

  if (userExist) {
    const doesPasswordMatch = bcrypt.compareSync(password, userExist.password);
    if (doesPasswordMatch) {
      req.session.user_id = userExist.id;
      return res.redirect(`/urls`);
    } else {
      return res.status(403).render("login", { error: "Password is incorrect" });
    }
  } else {
    return res.status(403).render("login", { error: "User doesn't exist" });
  }
});

/**
 * POST "/logout"
 * Clear session cookie and redirect to login page
*/
app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect('/login');
});

/**
 * POST "/register"
 * Register new user, store hashed password, set session, and redirect to /urls
*/
app.post("/register", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  if (!email || !password) {
    return res.status(400).render("register", { error: "Please enter email and password to register" });
  }

  const doesUserExist = getUserByEmail(users, email);

  if (doesUserExist) {
    return res.status(400).render("register", { error: "User already exists" });
  }

  const id = generateRandomString();
  const hashedPassword = bcrypt.hashSync(password, 10);

  users[id] = {
    id,
    email,
    password: hashedPassword,
  };

  req.session.user_id = id;
  res.redirect('/urls');

});





