const axios = require('axios');
const AdmZip = require('adm-zip');
const Analysis = require('../models/Analysis.model');
const User = require('../models/User.model');
const path = require('path');
const fs = require('fs');

const SUPPORTED_EXTENSIONS = { '.py': 'python', '.java': 'java', '.c': 'c', '.cpp': 'cpp', '.cc': 'cpp', '.cxx': 'cpp' };
const ML_SERVICE_URL = process.env.ML_SERVICE_URL || 'http://localhost:8000';

// Extract files from upload (single file or ZIP)
const extractCodeFiles = (filePath, originalName) => {
    const ext = path.extname(originalName).toLowerCase();
    const files = [];

    if (ext === '.zip') {
        const zip = new AdmZip(filePath);
        zip.getEntries().forEach(entry => {
            const entryExt = path.extname(entry.entryName).toLowerCase();
            if (SUPPORTED_EXTENSIONS[entryExt] && !entry.isDirectory) {
                files.push({
                    filename: entry.entryName,
                    language: SUPPORTED_EXTENSIONS[entryExt],
                    content: entry.getData().toString('utf8')
                });
            }
        });
    } else if (SUPPORTED_EXTENSIONS[ext]) {
        files.push({
            filename: originalName,
            language: SUPPORTED_EXTENSIONS[ext],
            content: fs.readFileSync(filePath, 'utf8')
        });
    }

    return files;
};

// Grade from score
const getGrade = (score) => {
    if (score >= 90) return 'A+';
    if (score >= 80) return 'A';
    if (score >= 70) return 'B';
    if (score >= 60) return 'C';
    if (score >= 50) return 'D';
    return 'F';
};

// MAIN ANALYSIS ENDPOINT
exports.analyzeCode = async (req, res) => {
    const filePath = req.file?.path;
    console.log('📁 File received:', req.file?.originalname);
    console.log('👤 User ID:', req.userId);

    try {
        if (!req.file) return res.status(400).json({ message: 'No file uploaded' });

        const codeFiles = extractCodeFiles(filePath, req.file.originalname);
        console.log('📂 Code files found:', codeFiles.length);

        if (codeFiles.length === 0)
            return res.status(400).json({ message: 'No supported code files found (.py, .java, .c, .cpp)' });

        // FIX — declare fileAnalyses array before the loop
        const fileAnalyses = [];

        for (const codeFile of codeFiles) {
            console.log('🔄 Sending to ML:', codeFile.filename, codeFile.language);
            const mlResponse = await axios.post(`${ML_SERVICE_URL}/analyze`, {
                filename: codeFile.filename,
                language: codeFile.language,
                code: codeFile.content
            });
            fileAnalyses.push(mlResponse.data);
        }

        // Compute overall score
        const overallScore = Math.round(
            fileAnalyses.reduce((sum, f) => sum + f.greenScore, 0) / fileAnalyses.length
        );

        const totalCo2 = fileAnalyses.reduce((sum, f) => sum + f.co2Estimate, 0);

        // Build recommendations
        const allSuggestions = fileAnalyses.flatMap(f =>
            (f.issues || []).map(i => i.suggestion)
        );
        const uniqueRecommendations = [...new Set(allSuggestions)].slice(0, 5);

        // Save to DB
        const analysis = await Analysis.create({
            userId: req.userId,
            projectName: req.body.projectName || req.file.originalname.replace('.zip', ''),
            files: fileAnalyses,
            overallScore,
            totalCo2: Math.round(totalCo2 * 100) / 100,
            grade: getGrade(overallScore),
            recommendations: uniqueRecommendations,
            summary: `Analyzed ${codeFiles.length} file(s). Overall green score: ${overallScore}/100. Grade: ${getGrade(overallScore)}.`
        });

        // Update user stats
        const user = await User.findById(req.userId);
        const newTotal = user.totalScans + 1;
        const newAvg = Math.round(
            ((user.avgGreenScore * user.totalScans) + overallScore) / newTotal
        );
        await User.findByIdAndUpdate(req.userId, {
            totalScans: newTotal,
            avgGreenScore: newAvg
        });

        res.json(analysis);

    } catch (err) {
        console.error('❌ Analysis error full details:');
        console.error('Message:', err.message);
        console.error('Stack:', err.stack);
        if (err.response) console.error('ML Service response:', err.response.data);
        res.status(500).json({
            message: 'Analysis failed',
            error: err.message,
            detail: err.response?.data || 'No ML service response'
        });
    } finally {
        if (filePath && fs.existsSync(filePath)) fs.unlinkSync(filePath);
    }
};