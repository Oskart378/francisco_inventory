const mongoose = require('mongoose');
const User = require('./models/User'); // Path to your user model
const bcrypt = require('bcryptjs');

const mongoURI = 'mongodb+srv://osacarloopez85:dh6HEB2b1anFFrGY@cluster0.fjtbp.mongodb.net/'; // Replace with your MongoDB URI
mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(async () => {
        console.log('Connected to MongoDB');

        // Create admin user
        const admin = new User({
            username: 'admin',
            password: 'adminpassword', // Replace with a strong password
            role: 'admin'
        });
        admin.password = await bcrypt.hash(admin.password, 10);
        await admin.save();

        // Create read-only user
        const readOnlyUser = new User({
            username: 'readonly',
            password: 'readonlypassword', // Replace with a strong password
            role: 'user'
        });
        readOnlyUser.password = await bcrypt.hash(readOnlyUser.password, 10);
        await readOnlyUser.save();

        console.log('Users created');
        mongoose.connection.close();
    })
    .catch(err => {
        console.error('Error:', err);
        mongoose.connection.close();
    });
