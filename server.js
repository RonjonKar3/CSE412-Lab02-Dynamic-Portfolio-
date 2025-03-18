const express = require('express');
const mysql = require('mysql');
const bcrypt = require('bcryptjs');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const port = 5000;

// ✅ Use CORS Middleware (Allow frontend to access backend)
app.use(cors({
    origin: 'http://127.0.0.1:5500',  // Allow only Live Server frontend
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type']
}));

// ✅ Handle CORS Preflight Requests
app.options('*', cors());  // <- Add this after app.use(cors())

// ✅ Middleware
app.use(bodyParser.json());
app.use(express.static('public'));

// Create a connection to the database
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'admin1234', // Replace with your MySQL password
    database: 'user_data' // Replace with your database name
});

db.connect((err) => {
    if (err) {
        console.error('Database connection failed:', err.stack);
        return;
    }
    console.log('Connected to MySQL database.');
});

app.use(bodyParser.json());
app.use(express.static('public')); // Serve static files from 'public' folder

// Handle Sign Up - POST /signup
app.post('/signup', (req, res) => {
    const { name, email, password } = req.body;

    // Check if all required fields are provided
    if (!name || !email || !password) {
        return res.status(400).json({ message: 'Please provide all required fields (name, email, password)' });
    }

    // Check if the email already exists in the database
    const checkQuery = 'SELECT * FROM users WHERE email = ?';
    db.query(checkQuery, [email], (err, result) => {
        if (err) {
            console.error('Error checking user existence:', err);
            return res.status(500).json({ message: 'Error checking user existence' });
        }

        if (result.length > 0) {
            return res.status(400).json({ message: 'Email already in use' });
        }

        // Hash the password
        bcrypt.hash(password, 10, (err, hashedPassword) => {
            if (err) {
                console.error('Error hashing password:', err);
                return res.status(500).json({ message: 'Error registering user' });
            }

            // Insert the new user into the database
            const insertQuery = 'INSERT INTO users (name, email, password) VALUES (?, ?, ?)';
            db.query(insertQuery, [name, email, hashedPassword], (err, result) => {
                if (err) {
                    console.error('Error inserting user into database:', err);
                    return res.status(500).json({ message: 'Error registering user' });
                }
                res.status(200).json({ success: true, message: 'User registered successfully' });
            });
        });
    });
});

// Handle Login - POST /login
app.post('/login', (req, res) => {
    const { email, password } = req.body;

    // Check if email and password are provided
    if (!email || !password) {
        return res.status(400).json({ message: 'Please provide both email and password' });
    }

    // Check if the user exists in the database
    const query = 'SELECT * FROM users WHERE email = ?';
    db.query(query, [email], (err, result) => {
        if (err) {
            console.error('Error checking user:', err);
            return res.status(500).json({ message: 'Error logging in' });
        }

        if (result.length === 0) {
            return res.status(400).json({ success: false, message: 'User not found' });
        }

        // Compare the entered password with the stored hashed password
        const user = result[0];
        bcrypt.compare(password, user.password, (err, isMatch) => {
            if (err) {
                console.error('Error comparing passwords:', err);
                return res.status(500).json({ message: 'Error logging in' });
            }

            if (!isMatch) {
                return res.status(400).json({ success: false, message: 'Invalid credentials' });
            }

            res.status(200).json({ success: true, message: 'Login successful' });
        });
    });
});

// Start the server
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
