require('dotenv').config();
const express = require('express');
const multer = require('multer');
const mongoose = require('mongoose');
const Razorpay = require('razorpay');
const nodemailer = require('nodemailer');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public')); // Serve HTML from public folder

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/nymphacademy', { useNewUrlParser: true, useUnifiedTopology: true });

// Student Schema
const studentSchema = new mongoose.Schema({
    name: String,
    phone: String,
    gender: String,
    class: String,
    email: String,
    address: String,
    imagePath: String, // Path to uploaded image
    rollNumber: String,
    paymentId: String,
    orderId: String,
    createdAt: { type: Date, default: Date.now }
});
const Student = mongoose.model('Student', studentSchema);

// Multer for Image Upload (store in /uploads folder)
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = 'uploads/';
        if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});
const upload = multer({ 
    storage, 
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) cb(null, true);
        else cb(new Error('Only images allowed'), false);
    }
});

// Razorpay Instance
const rzp = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
});

// Email Transporter (Gmail example; replace with SendGrid if preferred)
const transporter = nodemailer.createTransporter({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS // Use App Password for Gmail
    }
});

// Routes

// Submit Form (Upload Image, Create Razorpay Order)
app.post('/submit-form', upload.single('studentImage'), async (req, res) => {
    try {
        const { name, phone, gender, class: studentClass, email, address } = req.body;
        const imagePath = req.file ? req.file.path : null;

        // Create Razorpay Order
        const order = await rzp.orders.create({
            amount: 15000, // ₹150 in paise
            currency: 'INR',
            receipt: 'enroll_' + Date.now()
        });

        // Temp store data (in production, use session/DB temp)
        // For simplicity, we'll store after payment; here just return order
        res.json({ success: true, orderId: order.id });
    } catch (err) {
        res.json({ success: false, message: err.message });
    }
});

// Verify Payment, Store Data, Generate Roll, Send Email
app.post('/verify-payment', async (req, res) => {
    const { paymentId, orderId } = req.body;

    try {
        // Verify Payment (Razorpay)
        const order = await rzp.orders.fetch(orderId);
        if (order.status !== 'paid') throw new Error('Payment not completed');

        // Fetch form data (in production, store temp on /submit-form; here assume refetch or session)
        // For this example, we'll need to adjust: Actually, on /submit-form, store temp in DB with status 'pending'
        // Simplified: Assume data is resent or stored; in real, use sessions

        // Generate Roll Number: Count students +1