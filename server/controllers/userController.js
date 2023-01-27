const jwt = require("jsonwebtoken");
const User = require("../models/userModel");

const createToken = (_id) => {
  return jwt.sign({ _id }, process.env.SECRET, { expiresIn: "1w" });
};

// login user
const loginUser = async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await User.login(username, password);

    // create a token
    const token = createToken(user._id);

    res.status(200).json({ username, token, role: user.role });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const getRole = async (req, res) => {
  const { token } = req.body;
  try {
    const { _id } = jwt.verify(token, process.env.SECRET);
    const userRole = await User.find({ _id }).select("role");
    res.status(200).json({ role: userRole[0].role });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

module.exports = { loginUser };
