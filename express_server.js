const express = require("express");
const cookieParser = require('cookie-parser')
const app = express();

const PORT = 8080;

const urlDatabase = {
  b2xVn2: "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com",
};

// users object to store and access the users in the app

const users = {};

app.set("view engine","ejs");
app.use(express.urlencoded({extended : true}));
app.use(cookieParser());

app.get("/", (req, res)=>{
  res.send("Hello");
});

app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}!`);
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

app.get("/urls",(req,res)=> {
  const templateVars = {
    urls:urlDatabase};
  res.render("urls_index", templateVars);
});

app.get("/urls/new",(req,res)=>{
  res.render("urls_new");
});

app.get("/urls/:id",(req,res)=>{
  const id = req.params.id;
  const templateVars = {id,longURL :urlDatabase[id]};
  res.render("urls_show", templateVars);
});

app.get("/u/:id", (req, res) => {
  const id = req.params.id;
  const longURL = urlDatabase[id];
  res.redirect(longURL);
});

app.post("/urls",(req,res)=>{
  const id = generateRandomString();
  const longURL = req.body.longURL;
  urlDatabase[id] = longURL;
  return res.redirect(`/urls/${id}`);
});

app.post("/urls/:id/delete",(req,res)=>{
  const id = req.params.id;
  delete urlDatabase[id];
  return res.redirect(`/urls`);
});

app.post("/urls/:id",(req,res)=>{
  const id = req.params.id;
  const longURL = req.body.longURL;
  urlDatabase[id] = longURL;
  return res.redirect(`/urls`);
});

app.post("/login",(req,res)=>{
  res.redirect(`/urls`);
});

app.post("/logout",(req,res)=>{
  res.clearCookie("user_id");
  res.redirect('/urls');
});

// GET handler for the /register route

app.get("/register",(req,res)=>{
  res.render("register");
})

// POST handler for the /register route

app.post("/register",(req,res)=>{
  const id = generateRandomString();
  const email = req.body.email;
  const password = req.body.password;
  res.cookie("user_id", id);

  users[id] = {
    id,
    email,
    password
  }
  console.log(users);
  res.redirect('/urls');
});

const generateRandomString = function() {
  return Math.random().toString(36).slice(2,8);
};



