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

const masterUser = require("./users.json");

const server = http.createServer(app);
const { PORT=3000, JWT_SECRET="development_secret" } = process.env;

const users = masterUser;

const encodeMid = (req, res, next) => {
  const { username } = req;

  const foundUser = users.find(user => user.username === username);

  if (foundUser) {
    const token = jwt.sign(foundUser, JWT_SECRET, { expiresIn: 60 });

    req.token = token;
    next();

    return;
  }

  const err = {
    status: 401,
    message: "username unidentified"
  }
  next(err);
}

const decodeMid = (req, res, next) => {
  const { token } = req;
  try {
    const verified = jwt.verify(token, JWT_SECRET);
    console.log({verified, token})
    const found = users.find(user => user.username === verified.username);

    if (found) {
      req.verified = verified;
      next();

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
}

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use("/", express.static(path.join(__dirname, "public")));

// GET JWT BY QUERY ENDPOINT (PUSH TOKEN DEFINED ALREADY)
app.get("/auth", (req, res, next) => {
  const { id } = req.query;

  req.username = id;
  next();
}, encodeMid, (req, res, next) => {
  const { token } = req;

  res.send(token);
})

// GET USERNAMES LIST
app.get("/users", (req, res, next) => {
  const { completed } = req.query; 
  if (completed === "true") {
    res.send({ users });

    return;
  }
  const mapped = users.map(user => ({ username: user.username, pushToken: user.pushToken }));

  res.send({ users: mapped });
})

// LOGIN (PUSH TOKEN NOT DEFINED YET)
app.post("/auth", (req, res, next) => {
  const { username } = req.body;

  req.username = username;
  next();
}, encodeMid, (req, res, next) => {
  const { token } = req;

  res.send(token);
})

// VERIFY JWT (PUSH TOKEN NOT DEFINED YET)
app.put("/auth", (req, res, next) => {
  const { token } = req.body;

  req.token = token;
  next();
}, decodeMid, (req, res, next) => {
  const { verified } = req;

  res.send({ message: "verified", username: verified.username });
})

// SET PUSH TOKEN TO DEFINED USERNAME
app.post("/pushtoken/:username", (req, res, next) => {
  const { username } = req.params;
  const { token } = req.body;
  
  const foundUser = users.find(user => user.username === username);

  if (foundUser && token) {
    foundUser.pushToken.push(token);
    foundUser.pushToken = [... new Set(foundUser.pushToken)];
    res.send({ message: "Push Token set" });

    return;
  }

  const err = {
    status: 401,
    message: "username or push token unidentified"
  }

  next(err);
})

// SET PUSH TOKEN TO DEFINED USERNAME
app.post("/logout/:username", (req, res, next) => {
  const { username } = req.params;
  const { token } = req.body;
  
  const foundUser = users.find(user => user.username === username);

  if (foundUser && token) {
    foundUser.pushToken = foundUser.pushToken.filter(el => el !== token);
    
    res.send({ message: "Push Token removed" });

    return;
  }

  const err = {
    status: 401,
    message: "username or push token unidentified"
  }

  next(err);
})

// VERIFY JWT INCLUDED PUSH TOKEN INFORMATION
app.get("/internal/decode", (req, res, next) => {
  const { authorization } = req.headers;
  const splitted = authorization.split(' ');

  if (splitted[0] !== 'Bearer') {
    const err = {
      status: 401,
      message: "invalid token format"
    }
    next(err);

    return;
  }
  const token = splitted[1];

  req.token = token;
  next();
}, decodeMid, (req, res, next) => {
  const { verified } = req;

  res.send({ verified });
})

// ERROR HANDLER
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