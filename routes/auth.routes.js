const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const User = require("../models/User.model");

const {isAuthenticated} = require("../middleware/jwt.middleware");

const router = express.Router();
const saltRounds = 10;


//AUTH - SIGNUP
router.post("/signup", (req, res) => {
  console.log("received signup request", req.body);
  const { email, password, userName } = req.body;

  if (!email || !password || !userName) {
    res.status(400).json({message: "Provide email, passowrd and name."});
    return;
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  if (!emailRegex.test(email)) {
    res.status(400).json({message: "Provide a valid email address."});
    return;
  }

  const passwordRegex = /(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,}/;
  if (!passwordRegex.test(password)) {
    res
      .status(400).json({message: "Password must have at least 6 characters and contain at least one number, one lowercase and one uppercase letter.",});
    return;
  }

  User.findOne({ $or: [{ email }, { userName }] })
  .then ((foundUser) => {
    if (foundUser) {
        return res.status(400).json({ message: "Email or username already exists." });
    }

    const salt = bcrypt.genSaltSync(saltRounds);
    const hashedPassword = bcrypt.hashSync(password, salt);

    return User.create({email, password: hashedPassword, userName});
  })
  .then((createdUser) => {
    
    const {email, userName, _id} = createdUser;
    const user = {email, userName, _id};

    res.status(201).json({user:user});
  })
  .catch(err => {
    console.log(err);
    res.status(500).json({message: "Internal server error"})
  });
});

//AUTH - LOGIN
router.post('/login', (req, res) => {
    const {email, password} = req.body;

    if(email ==='' || password ===''){
        res.status(400).json({message:"Provide email and password."});
        return;
    }

    User.findOne({email})
    .then((foundUser) => {
        if(!foundUser) {
             res.status(401).json({ message: "User not found." })
        return;
    }

    const passwordCorrect = bcrypt.compareSync(password, foundUser.password);
    
    if(passwordCorrect) {

        const {_id, email, userName} = foundUser;

        const payload = {_id, email, userName};

        const authToken = jwt.sign(
            payload,
            process.env.TOKEN_SECRET,
            {algorithm: 'HS256', expiresIn:"6h"}
        );

        res.status(200).json({authToken: authToken});
    }
    else {
        res.status(401).json({message: "unable to authenticate"});
    }
})
.catch (err => res.status(500).json({message: "internal server error"}));
});

//AUTH - VERIFY
router.get('/verify', isAuthenticated, async (req, res) => {
  try {
    const user = await User.findById(req.payload._id).select(
      "email userName bio location profileImage savedPosts"
    );

    if (!user) return res.status(404).json({ message: "User not found" });

    res.status(200).json(user);
  } catch (err) {
    console.error("Error verifying user:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});



module.exports = router;
