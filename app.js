const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const { check, validationResult } = require('express-validator');
const app = express();
const port = 3000; // Change as needed

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/Assignment8');
const User = mongoose.model('User', {
  fullName: String,
  email: {type:String,unique: true },
  password: String,
});

app.use(express.json());

// Validation middleware for creating a user
const createUserValidation = [
  check('fullName')
  .notEmpty().withMessage('Full name is required')
  .isString().withMessage('Field must be a string')
  .matches(/^[a-zA-Z\s]+$/).withMessage('Field must only contain alphabetical characters and spaces')
  .isLength({ max: 20 }).withMessage('Name cannot be more that 20 characters'),

  check('email')
  .notEmpty().withMessage('Email is required')
  .isString().withMessage('Email must be a string')
  .isEmail().withMessage('Invalid email format'),
  
  check('password')
  .notEmpty().withMessage('Password is required')
  .isString().withMessage('Password must be a string')
  .isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
  .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*()_+{}\[\]:;<>,.?~\\/-]).*$/) .withMessage('Password must contain at least one lowercase letter, one uppercase letter, and one special character'),
];

// Create a new user
app.post('/user/create', createUserValidation, async (req, res) => {
    const errors = validationResult(req);
  
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
  
    const { email, fullName, password } = req.body;
  
    const hashedPassword = await bcrypt.hash(password, 10);
  
    const newUser = new User({
      email,
      fullName,
      password: hashedPassword,
    });
  
    await newUser.save();
    res.json({ message: 'User created successfully' });
  });
  
  

// Validation middleware for updating user details
const updateUserValidation = [
  check('fullName')
  .notEmpty().withMessage('Full name is required')
  .isString().withMessage('Name must be a string')
  .matches(/^[a-zA-Z\s]+$/).withMessage('Field must only contain alphabetical characters and spaces')
  .isLength({ max: 20 }).withMessage('Name cannot be more that 20 characters'),
  
  check('password')
  .notEmpty().withMessage('Password is required')
  .isString().withMessage('Password must be a string')
  .isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
  .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*()_+{}\[\]:;<>,.?~\\/-]).*$/) .withMessage('Password must contain at least one lowercase letter, one uppercase letter, and one special character'),
];

// Update user details
app.put('/user/edit', updateUserValidation, async (req, res) => {
    const errors = validationResult(req);
  
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
  
    const { email, fullName, password } = req.body;
  
    if (!email) {
      return res.status(400).json({ message: 'Email is required in the request body' });
    }
  
    const user = await User.findOne({ email });
  
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
  
    user.fullName = fullName;
    user.password = await bcrypt.hash(password, 10);
    await user.save();
    res.json({ message: 'User details updated successfully' });
  });
  

// Delete a user by email
app.delete('/user/delete', async (req, res) => {
    const { email } = req.body;
  
    if (!email) {
      return res.status(400).json({ message: 'Email is required in the request body' });
    }
  
    const user = await User.findOne({ email });
  
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
  
    await User.findByIdAndDelete(user._id);
    res.json({ message: 'User deleted successfully' });
  });

// Get all user information (excluding passwords)
app.get('/user/getAll', async (req, res) => {
    
  const users = await User.find({}, { fullName:1,email:1,password:1,_id:0});
  console.log(users,'USERS')

  res.json(users);
  
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
