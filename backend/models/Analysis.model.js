const mongoose = require('mongoose');

const issueSchema = new mongoose.Schema({
    lineStart: Number,
    lineEnd: Number,
    severity: { type: String, enum: ['critical', 'warning', 'info'] },
    type: String,  
    message: String,
    suggestion: String,
    co2Impact: Number  
});

const fileAnalysisSchema = new mongoose.Schema({
    filename: String,
    language: { type: String, enum: ['python', 'java', 'c', 'cpp'] },
    greenScore: { type: Number, min: 0, max: 100 },
    co2Estimate: Number,  
    issues: [issueSchema],
    metrics: {
        cyclomaticComplexity: Number,
        linesOfCode: Number,
        nestedLoopDepth: Number,
        memoryAllocations: Number,
        ioOperations: Number,
        recursiveCalls: Number,
        inefficientPatterns: Number
    }
});

const analysisSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    projectName: { type: String, default: 'Unnamed Project' },
    files: [fileAnalysisSchema],
    overallScore: { type: Number, min: 0, max: 100 },
    totalCo2: Number,
    grade: { type: String, enum: ['A+', 'A', 'B', 'C', 'D', 'F'] },
    summary: String,
    recommendations: [String],
    createdAt: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('Analysis', analysisSchema);