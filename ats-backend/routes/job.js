const express = require('express');
const router = express.Router();
const Job = require('../models/job');
const auth = require('../middleware/auth');

// Create a job
router.post('/', auth, async (req, res) => {
    if (req.user.role !== 'HR') {
        return res.status(403).json({ message: 'Only HR can create jobs' });
    }
    const { title, description, location, keywords } = req.body;
    try {
        const job = new Job({
            title,
            description,
            location,
            keywords: keywords || [], // Ensure keywords is an array
            createdBy: req.user.id
        });
        await job.save();
        res.status(201).json(job);
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Get all jobs
router.get('/', async (req, res) => {
    try {
        const jobs = await Job.find().populate('createdBy', 'name');
        res.json(jobs);
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;