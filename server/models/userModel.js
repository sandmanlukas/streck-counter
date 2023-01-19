const mongoose = require("mongoose");
const bcrypt = require("bcryptjs-react");

const Schema = mongoose.Schema;

// schema for a user
const userSchema = new Schema({
  username: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    required: true,
  }
});

// static login method
userSchema.statics.login = async function (username, password) {
  console.log(username, password)
  const test = await this.find({})
  console.log(test)
  if (!username || !password) {
    throw Error("All fields must be filled");
  }

  const user = await this.findOne({ username });
  if (!user) {
    throw Error("Incorrect username");
  }

  const match = await bcrypt.compare(password, user.password);
  if (!match) {
    throw Error("Incorrect password");
  }

  return user;
};

module.exports = mongoose.model("User", userSchema, "users");
