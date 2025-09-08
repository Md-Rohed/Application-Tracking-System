const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema({
    jobId: { type: mongoose.Schema.Types.ObjectId, ref: 'Job', required: true },
    applicantId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    resume: {
        filePath: { type: String, required: true },
        parsedData: { type: Object, default: {} }
    },
    status: { type: String, default: 'Applied' },
    formData: {
        name: { type: String, required: true },
        email: { type: String, required: true },
        phone: { type: String, required: true }
    },
    matchPercentage: { type: Number, default: 0 } // Ensure this field exists
});

module.exports = mongoose.model('Application', applicationSchema);