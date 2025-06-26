import bcrypt from 'bcryptjs';
import User from '../models/user.model.js';
import nodemailer from 'nodemailer';

import { generateTokens } from '../utils/token.js';
const SALT_ROUNDS = 10;



  
  const sendConfirmationEmail = async ({ name, email, phone, password,role }) => {
    const transporter = nodemailer.createTransport({
      service: 'Gmail', // or SMTP
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  
    const mailOptions = {
    //   from: '"Your App" <your@email.com>',
      from: '"Devangi Outdoor solutions" <devangioutdoor@gmail.com>',
      to: email,
      subject: 'Welcome! Your Registration Details',
      html: `
        <h3>Welcome, ${name}!</h3>
        <p>You’ve successfully registered. Here are your credentials:</p>
        <ul>
          <li><strong>Role:</strong> ${role}</li>
          <li><strong>Name:</strong> ${name}</li>
          <li><strong>Email:</strong> ${email}</li>
          <li><strong>Phone:</strong> ${phone}</li>
          <li><strong>Password:</strong> ${password}</li>
        </ul>
        <p>Keep this email safe.</p>
      `,
    };
  
    try {
        await transporter.sendMail(mailOptions);
        console.log(`✅ Email sent to ${email}`);
      } catch (err) {
        console.error(`❌ Failed to send email:`, err);
      }
      
  };

  export const registerUser = async (req, res) => {
    const { name, email, phone, password } = req.body;
    const role = req.body.role || 'member';
  
    try {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ message: 'User already exists' });
      }
  
      if (role === 'admin') {
        const existingAdmin = await User.findOne({ role: 'admin' });
        if (existingAdmin) {
          return res.status(400).json({ message: 'Admin account already exists' });
        }
      }
  
      const hashedPassword = await bcrypt.hash(password, 10);
      const newUser = new User({
        name,
        email,
        phone,
        password: hashedPassword,
        role,
      });
  
      await newUser.save();
      await sendConfirmationEmail({ name, email, phone, password, role });
  
      res.json({ message: `${role} registered successfully` });
    } catch (error) {
      console.error('Registration Error:', error);
      res.status(500).json({ message: 'Error registering user', error: error.message });
    }
  };
  
  

// export const loginUser = async (req, res) => {
//   const { email, password } = req.body;
//   try {
//     const user = await User.findOne({ email }); // ✅ await here too
//     if (!user) {
//       return res.status(401).json({ message: 'Invalid email or password' });
//     }
//     const isMatch = await bcrypt.compare(password, user.password);
//     if (!isMatch) {
//       return res.status(401).json({ message: 'Invalid email or password' });
//     }
//     res.json({ message: 'Login successful' });
//   } catch (error) {
//     res.status(500).json({ message: 'Error logging in', error: error.message });
//   }
// };
export const loginUser = async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });

  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  const { accessToken, refreshToken } = generateTokens(user);

  // Optional: Set refresh token in secure HTTP-only cookie
  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: true, // set to false on localhost
    sameSite: 'Strict',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  res.json({ accessToken, user: { email: user.email, role: user.role, id: user._id,name:user.name,role:user.role } });
}
