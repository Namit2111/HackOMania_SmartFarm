const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const fileUpload = require('express-fileupload');
const fs = require('fs').promises;
const axios = require('axios');
const app = express();
app.use(express.static('static'));
app.use(fileUpload());
// Serve static files from the public directory
app.use(express.static(path.join(__dirname, 'public')));

app.use(bodyParser.json());

app.use(bodyParser.urlencoded({ extended: true }));
// MongoDB connection
mongoose.connect('mongodb://localhost:27017/mydatabase', { useNewUrlParser: true, useUnifiedTopology: true });
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => {
    console.log('Connected to MongoDB');
});

// Define user schema
const userSchema = new mongoose.Schema({
    username: String,
    password: String,
    p:String,
    place:String
});

// Create user model
const User = mongoose.model('user', userSchema);
app.use('/user/photos', express.static(path.join(__dirname, 'photos')));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});
//--------------------------------------------------------------------------------------------------------//
// Route for serving the signin.html file
app.get('/signin', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'signin.html'));
});

// Route for handling signin request
app.post('/signin', async (req, res) => {
    const { username, password } = req.body;
    console.log(req.body)
    try {
        const user = await User.findOne({ username, password });
        if (user) {
            // User found, authentication successful
            res.status(200)
           if (user.p == "admin" ){
            res.redirect("/admin")
           }
           else{
            res.redirect("/user")
           }
           
        } else {
            // User not found or password incorrect
            res.status(401).json({ message: 'Invalid username or password' });
            console.log("Not Here")
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

//-------------------------------------------------------------------------------------//
app.get('/admin', async (req, res) => {
    try {
        const users = await User.find({ p: 'farmer' });
        const usersLength = users.length;
        res.render('admin.pug',{usersLength});
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).send('Internal Server Error');
    }
});


//-----------------------------------------------------------------------------------------//
app.get('/assign', async (req, res) => {
    const users = await User.find({ p: 'farmer' });
    res.render('table.pug',{users})
});
//--------------------------------------------------------------------------------------------//
app.get('/user', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'profile.html'));
});
app.post('/user/photo', (req, res) => {
    if (!req.files || Object.keys(req.files).length === 0) {
        return res.status(400).send('No files were uploaded.');
    }

    // The name of the input field (e.g., "photo") is used to retrieve the uploaded file
    const photo = req.files.photo;

    // Use the mv() method to save the file to the "photos" folder
    photo.mv(path.join(__dirname, 'photos', photo.name), (err) => {
        if (err) {
            return res.status(500).send(err);
        }
        res.send('File uploaded successfully!');
    });
});
//-----------------------------------------------------------------------------------//

app.get('/user/predict', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'predict.html'));
});
app.post('/user/predict', async (req, res) => {
    s
    // return res.status(200).json({msg:"Predicted Apple rust"}) 
    // try {
    //     if (!req.files || !req.files.photo) {
    //         return res.status(400).send('No file uploaded.');
    //     }
        
    //     const photo = req.files.photo;
    //     const buffer = photo.data;

    //     // Fetch Hugging Face API using Axios
    //     const response = await axios.post(
    //         "",
    //         buffer,
    //         {timeout: 10000,
    //             headers: { 
    //                 Authorization: "",
    //                 'Content-Type': 'image/jpeg' // Set appropriate content type for the image
    //             }
    //         }
    //     );
        
    //     const result = response.data;
    //     res.json(result);
    // } catch (error) {
    //     console.error(error);
    //     res.status(500).send('Internal Server Error');
    // }
});

app.get('/user/weather', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'Weather.html'));
});
//------------------------------------------------------------------------------------//


// Serve the HTML file
app.get('/user/photos', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'photos.html'));
});
// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
