const express = require('express');
const session = require('express-session');
const multer = require('multer');
const mysql = require('mysql2');
const path = require('path');
const fs = require('fs');
const { jsPDF } = require('jspdf');
const app = express();
const port = 3000;

// Middleware to parse incoming JSON and URL-encoded data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Session configuration for user authentication
app.use(session({
    secret: 'your_secret_key',
    resave: false,
    saveUninitialized: true,
}));

// Set up multer for file uploads (e.g., for the image)
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });

// MySQL database connection
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'sel630',
    database: 'portfolio_db'
});

db.connect((err) => {
    if (err) throw err;
    console.log('Connected to the database.');
});

// Route to handle user login
app.post('/login', (req, res) => {
    const { email, password } = req.body;

    const query = 'SELECT * FROM users WHERE email = ?';
    db.query(query, [email], async (err, results) => {
        if (err) return res.status(500).json({ message: 'Database error' });

        if (results.length === 0) return res.status(401).json({ message: 'Invalid credentials' });

        const user = results[0];
        const match = await bcrypt.compare(password, user.password);

        if (match) {
            req.session.userId = user.id;
            res.json({ message: 'Login successful' });
        } else {
            res.status(401).json({ message: 'Invalid credentials' });
        }
    });
});

// Middleware to protect routes
const requireLogin = (req, res, next) => {
    if (!req.session.userId) {
        return res.status(401).json({ message: 'Unauthorized' });
    }
    next();
};

// Route to handle form submission and store data
app.post('/submit', upload.single('image'), (req, res) => {
    const {
        name, contact, bio, institution, degree, year, grade,
        softSkills, techSkills, company, duration, responsibilities,
        projectTitle, projectDesc
    } = req.body;

    const imagePath = req.file ? req.file.path : null;  // Path to uploaded image (if any)

    // Store data into MySQL database
    const query = `INSERT INTO portfolios (name, contact, bio, image, institution, degree, year, grade, softSkills, techSkills, company, duration, responsibilities, projectTitle, projectDesc) 
                   VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

    db.query(query, [
        name, contact, bio, imagePath, institution, degree, year, grade,
        softSkills, techSkills, company, duration, responsibilities,
        projectTitle, projectDesc
    ], (err, result) => {
        if (err) {
            console.error('Error saving data to DB: ', err);
            return res.status(500).json({ message: 'Error saving data' });
        }

        // Once data is stored, generate the portfolio PDF
        const pdfData = {
            name,
            contact,
            bio,
            institution,
            degree,
            year,
            grade,
            softSkills,
            techSkills,
            company,
            duration,
            responsibilities,
            projectTitle,
            projectDesc,
            imagePath
        };

        const pdfFilePath = generatePDF(pdfData);  // Generate the PDF and get file path
        res.json({ pdfUrl: pdfFilePath });
    });
});

// Function to generate PDF using jsPDF
function generatePDF(data) {
    const doc = new jsPDF();

    // Adding the PDF content
    doc.setFontSize(16);
    doc.text(`Portfolio of ${data.name}`, 10, 10);

    doc.setFontSize(12);
    doc.text(`Name: ${data.name}`, 10, 20);
    doc.text(`Contact Info: ${data.contact}`, 10, 30);
    doc.text(`Bio: ${data.bio}`, 10, 40);
    doc.text(`Institution: ${data.institution}`, 10, 50);
    doc.text(`Degree: ${data.degree}`, 10, 60);
    doc.text(`Year: ${data.year}`, 10, 70);
    doc.text(`Grade: ${data.grade}`, 10, 80);
    doc.text(`Soft Skills: ${data.softSkills}`, 10, 90);
    doc.text(`Technical Skills: ${data.techSkills}`, 10, 100);
    doc.text(`Company: ${data.company}`, 10, 110);
    doc.text(`Job Duration: ${data.duration}`, 10, 120);
    doc.text(`Responsibilities: ${data.responsibilities}`, 10, 130);
    doc.text(`Project Title: ${data.projectTitle}`, 10, 140);
    doc.text(`Project Description: ${data.projectDesc}`, 10, 150);

    // If an image was uploaded, add it to the PDF
    if (data.imagePath) {
        const imgData = fs.readFileSync(data.imagePath);
        doc.addImage(imgData, 'JPEG', 10, 160, 50, 50);
    }

    // Define the output path for the PDF
    const pdfFilePath = `pdfs/portfolio_${Date.now()}.pdf`;

    // Save the generated PDF to the server
    doc.save(pdfFilePath);

    return pdfFilePath;
}

// Start the server
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});