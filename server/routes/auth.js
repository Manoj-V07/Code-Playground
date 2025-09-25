import express from "express";
import User from "../models/User.js";
import { protect } from "../middleware/auth.js";
import jwt from "jsonwebtoken";

const router = express.Router();


//Signup Route 
router.post("/signup" , async (req,res) => {
    const { username , email , password } = req.body;
    try{
        if(!username || !email || !password){
            return res.status(400).json({ message : "Please Fill All The Credentials"});
        }
        const userExists = await User.findOne({ email });
        if(userExists){
            return res.status(400).json({ message : "User Already Exists"});
        }
        const user = await User.create({ username , email , password });
        const token = generateToken(user.id);
        res.status(201).json({
            id : user._id,
            username : user.username,
            email : user.email,
            token,
        });
    }catch(err){
        res.status(500).json({ message : "Internal Server Error"});
    }
});


//Login Route
router.post("/login" , async (req,res) => {
    const { email , password } = req.body;
    try{
        if(!email || !password){
            return res.status(400).json({ message : "Pleae Fill All The Credentials"});
        }
        const user = await User.findOne({ email });
        if(!user || !(await user.matchPassword(password))){
            return res.status(401).json({ message : "Invalid Credentials"});
        }
        const token = generateToken(user.id);
        res.status(200).json({
            id : user._id,
            username : user.username,
            email : user.email,
            token,
        });
    }catch(err){
        res.status(500).json({ message : "Internal Server Error"});
    }
});

//Me Route
router.get("/me", protect , async(req,res) => {
    res.status(200).json(req.user);
});

//Generate JWT Token
const generateToken = (id) => {
    return jwt.sign({id} , process.env.JWT_SECRET , {expiresIn : "30d"});
};

export default router;
