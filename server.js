"use strict";

const express = require("express");
const mongoose = require("mongoose");

// Mongoose internally uses a promise-like object,
// but its better to make Mongoose use built in es6 promises
mongoose.Promise = global.Promise;

// config.js is where we control constants for entire
// app like PORT and DATABASE_URL
const { PORT, DATABASE_URL } = require("./config");
const { BlogPosts } = require("./models");

const app = express();
app.use(express.json());

app.use(express.static('public'));


// GET requests to /blog-posts => return 10 blog posts
app.get("/blog-posts", (req, res) => {
    BlogPosts.find()
      // we're limiting because blogposts db has > 25,000
      //not really, it has far less, but i'm keeping this for my info.
      // documents, and that's too much to process/return
      .limit(10)
      // success callback: for each blogpost we got back, we'll
      // call the `.serialize` instance method we've created in
      // models.js in order to only expose the data we want the API return.    
      .then(blogposts => {
        res.json({
          blogposts: blogposts.map(blogpost => blogpost.serialize())
        });
      })
      .catch(err => {
        console.error(err);
        res.status(500).json({ message: "Internal server error" });
      });
  });

// can also request by ID
app.get("/blog-posts/:id", (req, res) => {
  BlogPosts
    // this is a convenience method Mongoose provides for searching
    // by the object _id property
    .findById(req.params.id)
    .then(blogpost => res.json(blogpost.serialize()))
    .catch(err => {
      console.error(err);
      res.status(500).json({ message: "Internal server error" });
    });
});

//Create a new blog entry POST
app.post("/blog-posts", (req, res) => {
  const requiredFields = ["title", "content", "author"];
  for (let i = 0; i < requiredFields.length; i++) {
    const field = requiredFields[i];
    if (!(field in req.body)) {
      const message = `Missing \`${field}\` in request body`;
      console.error(message);
      return res.status(400).send(message);
    }
  }

  BlogPosts.create({
    title: req.body.title,
    content: req.body.content,
    author: req.body.author
  })
    .then(blogpost => res.status(201).json(blogpost.serialize()))
    .catch(err => {
      console.error(err);
      res.status(500).json({ message: "Internal server error" });
    });
});

//Update a blog post PUT
app.put("/blog-posts/:id", (req, res) => {
  // ensure that the id in the request path and the one in request body match
  if (!(req.params.id && req.body.id && req.params.id === req.body.id)) {
    const message =
      `Request path id (${req.params.id}) and request body id ` +
      `(${req.body.id}) must match`;
    console.error(message);
    return res.status(400).json({ message: message });
  }

  // we only support a subset of fields being updateable.
  // if the user sent over any of the updatableFields, we udpate those values
  // in document
  const toUpdate = {};
  const updateableFields = ["title", "content", "author"];

  updateableFields.forEach(field => {
    if (field in req.body) {
      toUpdate[field] = req.body[field];
    }
  });

  BlogPosts
    // all key/value pairs in toUpdate will be updated -- that's what `$set` does
    .findByIdAndUpdate(req.params.id, { $set: toUpdate })
    .then(blogpost => res.status(204).end())
    .catch(err => res.status(500).json({ message: "Internal server error" }));
});

//Delete blog post DELETE
app.delete("/blog-posts/:id", (req, res) => {
  BlogPosts.findByIdAndRemove(req.params.id)
    .then(blogpost => res.status(204).end())
    .catch(err => res.status(500).json({ message: "Internal server error" }));
});

  let server;

  // this function connects to our database, then starts the server
function runServer(databaseUrl, port = PORT) {
    return new Promise((resolve, reject) => {
      mongoose.connect(
        databaseUrl,
        err => {
          if (err) {
            return reject(err);
          }
          server = app
            .listen(port, () => {
              console.log(`Your app is listening on port ${port}`);
              resolve();
            })
            .on("error", err => {
              mongoose.disconnect();
              reject(err);
            });
        }
      );
    });
  }
  
  // this function closes the server, and returns a promise. we'll
  // use it in our integration tests later.
  function closeServer() {
    return mongoose.disconnect().then(() => {
      return new Promise((resolve, reject) => {
        console.log("Closing server");
        server.close(err => {
          if (err) {
            return reject(err);
          }
          resolve();
        });
      });
    });
  }
  
  // if server.js is called directly (aka, with `node server.js`), this block
  // runs. but we also export the runServer command so other code (for instance, test code) can start the server as needed.
  if (require.main === module) {
    runServer(DATABASE_URL).catch(err => console.error(err));
  }
  
  module.exports = { app, runServer, closeServer };