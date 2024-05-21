const express = require("express");
const path = require("path");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const bcrypt = require('bcrypt');
const session = require('express-session');
const jwt = require("jsonwebtoken");
var datetime = new Date();
const JWT_SECRET = "hvdvay6ert72839289()aiyg8t87qt72393293883uhefiuh78ttq3ifi78272jbkj?[]]pou89ywe";

const app = express();
app.use(express.json());

mongoose.connect(
  "mongodb+srv://andrewpurba54:andrewacp1688@cluster1.3idadyo.mongodb.net/?retryWrites=true&w=majority&appName=Cluster1",
  { useNewUrlParser: true, useUnifiedTopology: true }
);

const notesSchema = new mongoose.Schema({
  username: { type: String, unique: true },
  email: { type: String, unique: true },
  password: String,
}, {
  collection: "UserInfo",
});

const Note = mongoose.model("UserInfo", notesSchema);

const db = mongoose.connection;
db.once("open", () => {
  console.log("Connected to Mongoose server!");
});

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public", "")));

// Configure session middleware
app.use(session({
  secret: 'your-secret-key', // Replace with a strong secret key
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false } // Set to true if using HTTPS
}));

const port = process.env.PORT || 3000;

app.get("/", async (req, res) => {
  try {
    const filePath = path.join(__dirname, "views", "pages", "login.ejs");
    const html = await ejs.renderFile(filePath);
    res.send(html);
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

app.post("/", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await Note.findOne({ email });

    if (!user) {
      console.log('User not found');
      return res.status(401).send({ message: 'Invalid email or password' });
    }

    if (await bcrypt.compare(password, user.password)) {
      console.log(user.email + ' login at ' + datetime);
      
      // Store user data in the session
      req.session.user = user;
      return res.send({ message: 'Login successful' });
    }

    console.log('Invalid Password');
    return res.status(401).send({ message: 'Invalid email or password' });
  } catch (error) {
    console.error(error);
    return res.status(500).send({ message: 'Internal server error' });
  }
});

// Logout route
app.post('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).send({ message: 'Failed to log out' });
    }
    res.redirect('/');
  });
});

app.get('/homepage', async (req, res) => {
  try {
    // Retrieve user data from the session
    const user = req.session.user;

    if (!user) { 
      res.redirect('/')
      return res.status(403).send({ message: 'Not authenticated' });
    }

    const filePath = path.join(__dirname, 'views', 'pages', 'index.ejs');
    const html = await ejs.renderFile(filePath, { user });
    res.send(html); 
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: 'An error occurred. Please try again later.' });
  }
});

app.get('/signup', async (req, res) => {
  try {
    const filePath = path.join(__dirname, 'views', 'pages', 'signup.ejs');
    const html = await ejs.renderFile(filePath);
    res.send(html);
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});

app.post("/signup", async (req, res) => {
  const { username, email, password, confirm_password } = req.body;
  const encryptedPassword = await bcrypt.hash(password, 10);

  if (!username || !email || !password || !confirm_password) {
    return res.status(400).send({ message: 'All fie lds are required' });
  }

  if (password !== confirm_password) {
    return res.status(400).send({ message: 'Passwords do not match' });
  }

  try {
    const existingUser = await Note.findOne({ $or: [{ email: email }, { username: username }] });

    if (existingUser) {
      if (existingUser.email === email) {
        return res.status(400).send({ message: 'Email already exists' });
      } else {
        return res.status(400).send({ message: 'Username already exists' });
      }
    }

    await Note.create({
      username,
      email,
      password: encryptedPassword,
    });

    console.log('Email ' + email + ' has been successfully created');
    console.log('Username ' + username + ' has been successfully created');
    res.status(200).send({ message: 'Sign up successful' });
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: 'Internal server error' });
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
