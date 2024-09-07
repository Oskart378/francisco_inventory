const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// MongoDB connection string
const mongoURI = 'mongodb+srv://osacarloopez85:dh6HEB2b1anFFrGY@cluster0.fjtbp.mongodb.net/'; // Replace with your MongoDB URI

// Connect to MongoDB
mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(async () => {
    console.log('Connected to MongoDB');
    
    const userSchema = new mongoose.Schema({
      username: String,
      password: String,
      role: { type: String, enum: ['admin', 'readonly'], default: 'readonly' }
    });
    
    const User = mongoose.model('User', userSchema);
    
    // Create a new user
    const username = 'newuser'; // Replace with the desired username
    const password = 'Ficfy504!'; // Replace with the desired password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const newUser = new User({
      username: username,
      password: hashedPassword,
      role: 'readonly' // Or 'admin' if needed
    });
    
    await newUser.save();
    console.log('User created successfully');

    // Disconnect from MongoDB
    mongoose.disconnect();
  })
  .catch(err => {
    console.error('Failed to connect to MongoDB', err);
  });
