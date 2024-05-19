const express = require("express");
var fs = require("fs");
const app = express();
const path = require("path");
const bodyParser = require("body-parser");
const ejs = require("ejs");

const port = process.env.PORT || 3000;

app.get("/", async (req, res) => {
  res.send("<h2>Hello Andrew</h2>");
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
