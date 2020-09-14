console.log(process.env.NODE_ENV);
if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

const express = require("express");
const app = express();
const jwt = require("jsonwebtoken");
const cors = require("cors");
const path = require("path");
const http = require("http");
const { timeStamp } = require("console");

const server = http.createServer(app);
const { PORT=3000, JWT_SECRET="development_secret" } = process.env;

const users = [
  {
    id: "usr-demo-1",
    username: "krdemo",
    email: "krdemo@test.com",
    name: "User Demo",
    role: "admin",
    deparment: "administration",
    sub: "administrator",
    pushToken: ""
  },
  {
    id: "usr-demo-2",
    username: "krdemo2",
    email: "krdemo2@test.com",
    name: "User Demo 2",
    role: "user",
    deparment: "administration",
    sub: "administrator",
    pushToken: ""
  }
]

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use("/webchat", express.static(path.join(__dirname, "public")));

app.get("/", (req, res, next) => {
  const encoded = jwt.sign(user, JWT_SECRET, { expiresIn: 3600 * 1000 });
  res.send(encoded);
})

app.get("/users", (req, res, next) => {
  res.send({ users });
})

app.post("/", (req, res, next) => {
  const { username } = req.body;

  const foundUser = users.find(user => user.username === username);

  if (foundUser) {
    const encoded = jwt.sign(foundUser, JWT_SECRET, { expiresIn: 3600 * 1000 });
    
    res.send(encoded);

    return;
  }

  const err = {
    status: 401,
    message: "username unidentified"
  }

  next(err);
})

app.put("/", (req, res, next) => {
  const { token } = req.body;

  try {
    const verified = jwt.verify(token, JWT_SECRET);
    const found = users.find(user => user.username === verified.username);

    if (found) {
      res.send({ message: "verified", username: verified.username });
      
      return;
    }

    const err = {
      status: 401,
      message: "token unverified"
    }

    next(err);
  } catch (err) {
    next(err);
  }
})

app.post("/:username", (req, res, next) => {
  const { username } = req.params;
  const { token } = req.body;
  
  const foundUser = users.find(user => user.username === username);

  if (foundUser) {
    foundUser.pushToken = token;
    
    res.send({ message: "Push Token set"});

    return;
  }

  const err = {
    status: 401,
    message: "username unidentified"
  }

  next(err);
})

app.use((err, req, res, next) => {
  console.log("ERROR", err);

  if (err.error) {
    console.log(err.error);
  }
  if (err.status) {
    res.status(err.status).send({ message: err.message });
    return;    
  }

  res.status(500).send({ message: "internal error" });
})

server.listen(PORT, () => {
  console.log("listen on port", PORT);
});