import User from '../models/User.js';
import crypto from 'crypto';
import nodemailer from 'nodemailer';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { generateAccessToken, generateRefreshToken } from '../utils/tokenUtils.js';

// 1. Invite User
export const inviteUser = async (req, res) => {
  const { firstName, lastName, email, phone, gender, role, adminKey } = req.body;
  try {
    if (adminKey !== process.env.ADMIN_SECRET_KEY) {
      return res.status(401).json({ message: "Incorrect Admin Secret Key!" });
    }

    const token = crypto.randomBytes(32).toString('hex');
    const expires = Date.now() + 5 * 60 * 1000; 

    const newUser = new User({
      firstName, lastName, email, phone, gender, role: role || 'customer',
      emailToken: token,
      emailTokenExpire: expires,
      password: await bcrypt.hash(crypto.randomBytes(8).toString('hex'), 10), // Temp pass
      isActive: false
    });

    await newUser.save();

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS }
    });

    const link = `${process.env.CLIENT_URL}/setup-password?token=${token}&email=${email}`;
    await transporter.sendMail({
      to: email,
      subject: "Verify Your Account",
      html: `<p>Click <a href="${link}">here</a> to set password. Expire in 5 mins.</p>`
    });

    res.status(200).json({ message: "Invite link sent!" });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// 2. Verify and Setup Password
export const verifyAndSetup = async (req, res) => {
  const { token, email, password } = req.body;
  try {
    const user = await User.findOne({ 
      email, emailToken: token, emailTokenExpire: { $gt: Date.now() } 
    });

    if (!user) return res.status(400).json({ message: "Link expired or invalid!" });

    user.password = await bcrypt.hash(password, await bcrypt.genSalt(10));
    user.isActive = true;
    user.emailToken = undefined;
    user.emailTokenExpire = undefined;
    await user.save();

    res.status(200).json({ message: "Verified! You can login now." });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// 3. Login User
export const loginUser = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email, isActive: true });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(400).json({ message: "Invalid credentials or account not active!" });
    }

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    // Set Refresh Token in Cookie
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'Strict',
      maxAge: 7 * 24 * 60 * 60 * 1000 
    });

    user.lastLogin = Date.now();
    await user.save();

    res.status(200).json({
      message: "Login successful!",
      accessToken,
      user: { name: user.firstName, role: user.role }
    });
  } catch (err) { res.status(500).json({ message: err.message }); }
  
};
export const refreshToken = async (req, res) => {
  const token = req.cookies.refreshToken;
  console.log("Received Refresh Token:", token); // Debugging line
  if (!token) return res.status(401).json({ message: "No refresh token" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_REFRESHTOEKEN_KEY);
    console.log("Decoded Refresh Token:", decoded); // Debugging line
    const user = await User.findById(decoded.id);
    if (!user) return res.status(403).json({ message: "User not found" });

    const newAccessToken = generateAccessToken(user);
    
    res.status(200).json({
      accessToken: newAccessToken,
      user: { name: user.firstName, role: user.role }
    });

  } catch (err) {
    console.error("Refresh Token Error:", err); // Debugging line
    return res.status(403).json({ message: "Invalid refresh token" });
  }
};

// 5. Logout
export const logoutUser = async (req, res) => {
  res.clearCookie("refreshToken", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "Strict"
  });

  res.status(200).json({ message: "Logged out successfully" });
};