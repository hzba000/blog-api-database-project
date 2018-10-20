"use strict";

const mongoose = require("mongoose");


const blogpostSchema = mongoose.Schema({
    
        "title": {type: String, required: true},
        "content": {type:String, required:true},
        "author": {type:Object, required:true},
        "created": {type:Date, default:Date.now}
    
});

// *virtuals* (http://mongoosejs.com/docs/guide.html#virtuals)
// allow us to define properties on our object that manipulate
// properties that are stored in the database. Here we use it
// to generate a human readable string based on the address object
// we're storing in Mongo.
blogpostSchema.virtual("authorString").get(function() {
  return `${this.author.firstName} ${this.author.lastName}`.trim();
});

// this is an *instance method* which will be available on all instances
// of the model. This method will be used to return an object that only
// exposes *some* of the fields we want from the underlying data
blogpostSchema.methods.serialize = function() {
    return {
      id: this._id,
      title: this.title,
      content: this.content,
      author: this.authorString,
      created: this.created
    };
  };

const BlogPosts = mongoose.model("BlogPosts", blogpostSchema);

module.exports = {BlogPosts};