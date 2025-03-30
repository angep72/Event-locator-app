const client = require("../connection");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const getAllUsers = (req, res) => {
  client.query(`SELECT * FROM users`, (err, result) => {
    if (err) throw err;
    res.send(result.rows);
  });
};

const getSingleUser = (req, res) => {
  client.query(
    `SELECT * FROM users WHERE user_id=${req.params.id}`,
    (err, result) => {
      if (err) throw err;
      res.send(result.rows);
    }
  );
};

const updateUser = (req, res) => {
  const user = req.body;
  const updateQuery = `UPDATE users SET username=$1, email=$2, first_name=$3, last_name=$4, date_of_birth=$5, location=$6 WHERE user_id=$7 RETURNING *`;

  client.query(
    updateQuery,
    [
      user.username,
      user.email,
      user.first_name,
      user.last_name,
      user.date_of_birth,
      user.location,
      req.params.id,
    ],
    (err, result) => {
      if (err) {
        return res.status(500).json({ status: "error", message: err.message });
      }
      return res.json({ status: "success", data: result.rows[0] });
    }
  );
};

const registerUser = (req, res) => {
  // Check if password is in the body
  if (!req.body.password_hash) {
    return res
      .status(400)
      .json({ status: "error", message: "Password is required" });
  }

  // Hash the password before storing it in the database
  const hashedPassword = bcrypt.hashSync(req.body.password_hash, 10);

  const user = req.body;
  const postQuery = `INSERT INTO users(username, email, password_hash, first_name, last_name, date_of_birth, location)
                       VALUES($1, $2, $3, $4, $5, $6, $7)
                       RETURNING *`;

  client.query(
    postQuery,
    [
      user.username,
      user.email,
      hashedPassword,
      user.first_name,
      user.last_name,
      user.date_of_birth,
      user.location,
    ],
    (err, result) => {
      if (err) {
        // If there's an error, return a 500 status with error message
        return res.status(500).json({ status: "error", message: err.message });
      }
      // Return the inserted user data and status 201 (Created)
      return res.status(201).json({ status: "success", data: result.rows[0] });
    }
  );
};

const loginUser = (req, res) => {
  //use jwt token
  const { email, password_hash } = req.body;
  const userQuery = `SELECT * FROM users WHERE email=$1`;
  client.query(userQuery, [email], (err, result) => {
    if (err) {
      return res
        .status(401)
        .json({ status: "error", message: "Invalid email or password" });
    }
    // Check if password matches
    const user = result.rows[0];
    if (!user || !bcrypt.compareSync(password_hash, user.password_hash)) {
      return res
        .status(401)
        .json({ status: "error", message: "Invalid email or password" });
    }
    // Generate JWT token
    const token = jwt.sign({ userId: user.id }, "your_secret_key", {
      expiresIn: "1h",
    });
    return res.json({ status: "success", token });
  });
};

module.exports = {
  getAllUsers,
  getSingleUser,
  updateUser,
  registerUser,
  loginUser,
};
