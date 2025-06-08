const express = require("express");
const cookieParser = require('cookie-parser');
const app = express();
const userLookUp = require("./helpers/userLookUp");
const urlsForUser = require("./helpers/urlsForUsers");
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

// users object to store and access the users in the app

const users = {};

app.set("view engine","ejs");
app.use(express.urlencoded({extended : true}));
app.use(cookieParser());

app.get("/", (req, res)=>{
  res.send("Hello");
});

app.listen(port, () => {
  console.log(`App listening on port ${port}!`);
});

// middleware to make current user object available in all templates

app.use((req, res, next) => {
  const user_id = req.cookies.user_id || null;
  res.locals.user = users[user_id] || null;
  next();
});

app.get("/urls.json",(req, res)=>{
  res.json(urlDatabase);
});

app.get("/hello",(req,res)=>{
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

// GET handler for the /login route

app.get("/login",(req,res)=>{
  res.render("login",{ error : null});
});

// GET handler for the /register route

app.get("/register",(req,res) => {
  res.render("register",{ error : null});
});

app.get("/urls",(req,res)=> {
  const user_id = req.cookies.user_id;
  if (user_id) {

    const urlsForLoggedInUser = urlsForUser(urlDatabase,user_id);
    
    if (urlsForLoggedInUser !== null) {
      const templateVars = {
        urls:urlDatabase
      };
      return res.render("urls_index", templateVars);
    } else {
      return res
        .status(NOT_FOUND)
        .send(NOT_FOUND_STATUS_CODE);
    }
  } else {
    return res
      .status(UNAUTHORIZED_USER_STATUS_CODE)
      .send(UNAUTHORIZED_USER);
  }
  
});

app.get("/urls/new",(req,res) => {
  const user_id = req.cookies.user_id;
  if (user_id) {
    return res.render("urls_new");
  } else {
    res.redirect("/login");
  }
});

app.post("/urls/:id",(req,res)=>{
  const user_id = req.cookies.user_id;
  if (user_id) {
    const id = req.params.id;
    if (urlDatabase[id] !== undefined) {
      if (user_id === urlDatabase[id]["userID"]) {
        const longURL = req.body.longURL;
        urlDatabase[id].longURL = longURL;
        return res.redirect(`/urls`);
      } else {
        return res
          .status(FORBIDDEN_STATUS_CODE)
          .send(FORBIDDEN);
      }

    } else {
      return res
        .status(NOT_FOUND)
        .send(NOT_FOUND_STATUS_CODE);
    }
    
    
  } else {
    return res
      .status(UNAUTHORIZED_USER_STATUS_CODE)
      .send(UNAUTHORIZED_USER);
  }
  
});

app.get("/urls/:id",(req,res)=>{
  const user_id = req.cookies.user_id;
  if (user_id) {
    const id = req.params.id;
    if (urlDatabase[id] !== undefined) {
      if (user_id === urlDatabase[id]["userID"]) {
      
        const templateVars = {id,longURL :urlDatabase[id]["longURL"]};
        res.render("urls_show", templateVars);
      } else {
        return res
          .status(FORBIDDEN_STATUS_CODE)
          .send(FORBIDDEN);
      }

    } else {
      return res
        .status(NOT_FOUND)
        .send(NOT_FOUND_STATUS_CODE);
    }
    
  } else {
    return res
      .status(UNAUTHORIZED_USER_STATUS_CODE)
      .send(UNAUTHORIZED_USER);
  }
  
});

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

app.post("/urls",(req,res)=>{
  const user_id = req.cookies.user_id;
  if (user_id) {
    const id = generateRandomString();
    console.log(req.body);
    const longURL = req.body.longURL;
    urlDatabase[id] = {longURL, userID: user_id};
    return res.redirect(`/urls/${id}`);
  } else {
    return res
      .status(UNAUTHORIZED_USER_STATUS_CODE)
      .send(UNAUTHORIZED_USER);
  }
  
});

app.post("/urls/:id/delete",(req,res)=>{
  const user_id = req.cookies.user_id;
  if (user_id) {
    const id = req.params.id;
    if (user_id === urlDatabase[id].userID) {
      delete urlDatabase[id];
      return res.redirect('/urls');
    } else {
      return res
        .status(FORBIDDEN_STATUS_CODE)
        .send(FORBIDDEN);
    }
    
    
  } else {
    return res
      .status(UNAUTHORIZED_USER_STATUS_CODE)
      .send(UNAUTHORIZED_USER);
  }
  
});

// POST handler for the /login route

app.post("/login",(req,res) => {

  const email = req.body.email;
  const password = req.body.password;

  const userExist = userLookUp(users,email);

  if (userExist) {
    if (userExist.password === password) {
      const id = userExist.id;
      res.cookie("user_id", id);
      res.redirect(`/urls`);
    } else {
      return res
        .status(403)
        .render("login",{error: "Password is incorrect"});
    }
  } else {
    return res
      .status(403)
      .render("login",{error: "User doesn't exists"});
  }
});

// POST handler for the /logout route

app.post("/logout",(req,res) => {
  res.clearCookie("user_id");
  res.redirect('/login');
});

// POST handler for the /register route

app.post("/register",(req,res)=>{
 
  const email = req.body.email;
  const password = req.body.password;

  if (!email || !password) {
    return res
      .status(400)
      .render("register",{error: "Please enter email and password to register"});
  }

  const doesUserExist = userLookUp(users,email);

  if (doesUserExist) {
    return res
      .status(400)
      .render("register",{error: "User already exists"});
  }

  const id = generateRandomString();
  
  res.cookie("user_id", id);

  users[id] = {
    id,
    email,
    password
  };
  res.redirect('/urls');

});

const generateRandomString = function() {
  return Math.random().toString(36).slice(2,8);
};





