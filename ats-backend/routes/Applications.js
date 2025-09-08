const express = require('express');
const router = express.Router();
const Application = require('../models/Application');
const Job = require('../models/job');
const auth = require('../middleware/auth');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const pdfParse = require('pdf-parse');

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: './uploads/',
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    }
});
const upload = multer({
    storage,
    fileFilter: (req, file, cb) => {
        if (file.mimetype === 'application/pdf') {
            cb(null, true);
        } else {
            cb(new Error('Only PDFs are allowed'), false);
        }
    }
});

// Submit an application
router.post('/', auth, upload.single('resume'), async (req, res) => {
    if (req.user.role !== 'Applicant') {
        return res.status(403).json({ message: 'Only Applicants can apply' });
    }
    const { jobId, name, email, phone } = req.body;
    if (!req.file) {
        return res.status(400).json({ message: 'Resume is required' });
    }
    try {
        // Find the job to get keywords
        const job = await Job.findById(jobId);
        if (!job) {
            return res.status(404).json({ message: 'Job not found' });
        }

        // Extract text from PDF
        const pdfBuffer = fs.readFileSync(req.file.path);
        const pdfData = await pdfParse(pdfBuffer);
        const resumeText = pdfData.text.toLowerCase();

        // Calculate match percentage
        const keywords = job.keywords.map(k => k.toLowerCase());
        let matchCount = 0;
        keywords.forEach(keyword => {
            if (resumeText.includes(keyword)) {
                matchCount++;
            }
        });
        const matchPercentage = keywords.length > 0 ? (matchCount / keywords.length) * 100 : 0;

        // Create application
        const application = new Application({
            jobId,
            applicantId: req.user.id,
            resume: {
                filePath: req.file.path,
                parsedData: {} // Add resume parsing logic here if using Affinda/RChilli
            },
            status: 'Applied',
            formData: { name, email, phone },
            matchPercentage
        });
        await application.save();
        res.status(201).json({ message: 'Application submitted', application });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get applications for HR
router.get('/', auth, async (req, res) => {
    if (req.user.role !== 'HR') {
        return res.status(403).json({ message: 'Only HR can view applications' });
    }
    try {
        const applications = await Application.find()
            .populate('jobId', 'title')
            .populate('applicantId', 'name email');
        res.json(applications);
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Update application status
router.put('/:id', auth, async (req, res) => {
    if (req.user.role !== 'HR') {
        return res.status(403).json({ message: 'Only HR can update applications' });
    }
    const { status } = req.body;
    try {
        const application = await Application.findById(req.params.id);
        if (!application) {
            return res.status(404).json({ message: 'Application not found' });
        }
        application.status = status;
        await application.save();
        res.json(application);
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;