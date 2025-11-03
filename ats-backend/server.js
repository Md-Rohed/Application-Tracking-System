const express = require('express');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const multer = require('multer');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;              // ✅ use Render's PORT
const MONGO_URI = process.env.MONGO_URI || process.env.MONGODB_URI; // ✅ accept either name
const ALLOWED_ORIGIN = process.env.ALLOWED_ORIGIN || '*';
app.use(cors({ origin: ALLOWED_ORIGIN, credentials: true }));
app.use(express.json());

// Multer for Resume Upload
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, 'uploads/'),
    filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`)
});
const upload = multer({
    storage,
    fileFilter: (req, file, cb) => {
        if (file.mimetype === 'application/pdf') cb(null, true);
        else cb(new Error('Only PDFs allowed'), false);
    },
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

// User Schema
const userSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['HR', 'Applicant'], required: true },
    name: String
});
const User = mongoose.model('User', userSchema);

// Job Schema
const jobSchema = new mongoose.Schema({
    title: String,
    location: String,
    description: String,
    status: { type: String, enum: ['Open', 'Closed'], default: 'Open' },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    createdAt: { type: Date, default: Date.now },
    keywords: { type: [String], default: [] } // Added keywords field
});
const Job = mongoose.model('Job', jobSchema);

// Application Schema
const applicationSchema = new mongoose.Schema({
    jobId: { type: mongoose.Schema.Types.ObjectId, ref: 'Job' },
    applicantId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    resume: { filePath: String, parsedData: Object },
    status: { type: String, enum: ['Applied', 'Shortlisted', 'Rejected'], default: 'Applied' },
    formData: Object,
    matchPercentage: { type: Number, default: 0 },// Added matchPercentage field,
});
const Application = mongoose.model('Application', applicationSchema);

// Middleware for Auth
const authMiddleware = (roles) => (req, res, next) => {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) return res.status(401).json({ error: 'No token provided' });

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        if (roles && !roles.includes(decoded.role)) {
            return res.status(403).json({ error: 'Access denied' });
        }
        next();
    } catch (err) {
        res.status(401).json({ error: 'Invalid token' });
    }
};

// Routes
// Signup
app.post('/api/auth/signup', async (req, res) => {
    const { email, password, role, name } = req.body;
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = new User({ email, password: hashedPassword, role, name });
        await user.save();
        res.status(201).json({ message: 'User created' });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// Login
app.post('/api/auth/login', async (req, res) => {
    const { email, password, role } = req.body;
    try {
        const user = await User.findOne({ email, role });
        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }
        const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' });
        res.json({ token, role: user.role });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// Post Job (HR only)
app.post('/api/jobs', authMiddleware(['HR']), async (req, res) => {
    const { title, description, location, keywords } = req.body;
    try {
        const job = new Job({ title, description, location, keywords: keywords || [], createdBy: req.user.id });
        await job.save();
        res.status(201).json(job);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// Edit Job (HR only)
app.put('/api/jobs/:id', authMiddleware(['HR']), async (req, res) => {
    const { title, description, location, keywords, status } = req.body;
    try {
        const job = await Job.findById(req.params.id);
        if (!job) {
            return res.status(404).json({ error: 'Job not found' });
        }
        if (job.createdBy.toString() !== req.user.id) {
            return res.status(403).json({ error: 'Not authorized to edit this job' });
        }
        const updatedJob = await Job.findByIdAndUpdate(
            req.params.id,
            {
                title: title || job.title,
                description: description || job.description,
                location: location || job.location,
                keywords: keywords || job.keywords,
                status: status || job.status
            },
            // { new: true }
        );
        res.json(updatedJob);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// Get All Jobs (Public)
app.get('/api/jobs', async (req, res) => {
    try {
        const jobs = await Job.find({ status: 'Open' });
        res.json(jobs);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// Get Job by ID (Public) - This can be used for job details to pre-fill the edit form
app.get('/api/jobs/:id', async (req, res) => {
    try {
        const job = await Job.findById(req.params.id);
        if (!job) return res.status(404).json({ error: 'Job not found' });
        res.json(job);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

const natural = require('natural'); // NLP library
const stringSimilarity = require('string-similarity'); // optional

app.post('/api/applications', authMiddleware(['Applicant']), upload.single('resume'), async (req, res) => {
    const { jobId, formData } = req.body;
    try {
        const job = await Job.findById(jobId);
        if (!job) {
            return res.status(404).json({ error: 'Job not found' });
        }

        const pdfParse = require('pdf-parse');
        const fs = require('fs');
        const pdfBuffer = fs.readFileSync(req.file.path);
        const pdfData = await pdfParse(pdfBuffer);
        const resumeText = pdfData.text.toLowerCase();

        // Tokenize resume text into words
        const tokenizer = new natural.WordTokenizer();
        const tokens = tokenizer.tokenize(resumeText);

        const keywords = job.keywords.map(k => k.toLowerCase());
        let matchCount = 0;

        // More flexible matching
        keywords.forEach(keyword => {
            // Exact or partial match
            const exactMatch = tokens.includes(keyword);

            // Loose similarity (for React vs ReactJS, Node vs Node.js)
            const similar = tokens.some(word => stringSimilarity.compareTwoStrings(word, keyword) > 0.7);

            if (exactMatch || similar) {
                matchCount++;
            }
        });

        const matchPercentage = keywords.length > 0 ? (matchCount / keywords.length) * 100 : 0;

        const application = new Application({
            jobId,
            applicantId: req.user.id,
            resume: { filePath: req.file.path, parsedData: {} },
            formData: JSON.parse(formData),
            matchPercentage,
        });
        await application.save();

        res.status(201).json({ message: 'Application submitted', application });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});


// Get Applications (HR only)
app.get('/api/applications', authMiddleware(['HR']), async (req, res) => {
    try {
        const applications = await Application.find()
            .populate('jobId', 'title')
            .populate('applicantId', 'name email')
            .select('jobId applicantId resume status formData matchPercentage');
        res.json(applications);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// Update Application Status (HR only)
app.patch('/api/applications/:id', authMiddleware(['HR']), async (req, res) => {
    const { status } = req.body;
    try {
        const application = await Application.findByIdAndUpdate(
            req.params.id,
            { status },
            { new: true }
        );
        res.json(application);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// Download Resume (HR only)
app.get('/api/resumes/:id', authMiddleware(['HR']), async (req, res) => {
    try {
        const application = await Application.findById(req.params.id);
        if (!application) return res.status(404).json({ error: 'Application not found' });
        res.sendFile(path.resolve(application.resume.filePath));
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// ---- Boot: connect THEN listen (prevents buffering timeouts) ----
(async () => {
    try {
        if (!MONGO_URI) throw new Error('MONGO_URI / MONGODB_URI not set');

        await mongoose.connect(MONGO_URI, {
            serverSelectionTimeoutMS: 15000,
            connectTimeoutMS: 15000,
        });

        console.log('✅ MongoDB connected');
        app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
    } catch (err) {
        console.error('❌ Failed to start server:', err);
        // Optional: process.exit(1);
    }
})();