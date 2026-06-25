let { MongoClient } = require("mongodb");

let client = new MongoClient(process.env.MONGO_URL);
client.connect();

let db = client.db("cloudinary");

module.exports = {
  messageCollec: db.collection("messages"),
  photoCollec: db.collection("files"),
};
