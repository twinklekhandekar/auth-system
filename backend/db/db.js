const mongoose = require('mongoose')
require('dotenv').config();


function connectDB() {
    mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        console.log('Connected to MongoDB Atlas');
    })
    .catch(err => {
        console.error('MongoDB connection error:', err);
    });
}

module.exports = connectDB