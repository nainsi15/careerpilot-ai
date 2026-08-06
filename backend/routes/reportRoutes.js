const express = require('express');
const router = express.Router();
const PDFDocument = require('pdfkit');
const auth = require('../middleware/auth');
const Analysis = require('../models/Analysis');

// GET /report/:id
router.get('/:id', auth, async (req, res) => {
  try {
    const analysis = await Analysis.findById(req.params.id)
      .populate('resumeId')
      .populate('jobId');

    if (!analysis) {
      return res.status(404).json({ error: 'Analysis record not found.' });
    }

    const doc = new PDFDocument({ margin: 40 });
    const filename = `CareerPilot_Report_${analysis._id}.pdf`;

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

    doc.pipe(res);

    // Document Header
    doc.fillColor('#0F172A').fontSize(22).font('Helvetica-Bold').text('CAREERPILOT AI - RESUME REPORT', { align: 'center' });
    doc.moveDown(0.3);
    doc.fillColor('#64748B').fontSize(10).font('Helvetica').text(`Report ID: ${analysis._id} | Generated: ${new Date().toLocaleDateString()}`, { align: 'center' });
    doc.moveDown(1.5);

    // Target Role & Job
    doc.fillColor('#1E293B').fontSize(14).font('Helvetica-Bold').text(`Target Role: ${analysis.jobId?.title || 'Software Engineer'}`);
    doc.moveDown(0.5);

    // ATS Score Card
    doc.rect(40, doc.y, 515, 65).fill('#F8FAFC').stroke('#E2E8F0');
    const startY = doc.y - 55;
    
    doc.fillColor('#0F172A').fontSize(24).font('Helvetica-Bold').text(`${analysis.atsScore}%`, 60, startY);
    doc.fillColor('#64748B').fontSize(10).font('Helvetica').text('OVERALL ATS SCORE', 60, startY + 28);

    doc.fillColor('#0F172A').fontSize(18).font('Helvetica-Bold').text(`${analysis.semanticSimilarity}%`, 220, startY + 5);
    doc.fillColor('#64748B').fontSize(10).font('Helvetica').text('SEMANTIC SIMILARITY', 220, startY + 28);

    doc.fillColor('#0F172A').fontSize(14).font('Helvetica-Bold').text(`${analysis.shortlistReadiness}`, 380, startY + 7);
    doc.fillColor('#64748B').fontSize(10).font('Helvetica').text('SHORTLIST STATUS', 380, startY + 28);

    doc.y = startY + 80;

    // Detailed Breakdown
    doc.fillColor('#1E293B').fontSize(14).font('Helvetica-Bold').text('Detailed Score Breakdown');
    doc.moveDown(0.5);
    doc.fontSize(11).font('Helvetica').fillColor('#334155');
    doc.text(`• Keyword & Skill Match: ${analysis.skillScore}%`);
    doc.text(`• Semantic Vector Alignment: ${analysis.semanticSimilarity}%`);
    doc.text(`• Section Completeness: ${analysis.sectionScore}%`);
    doc.text(`• Impact & Formatting Verbs: ${analysis.impactScore}%`);
    doc.moveDown(1);

    // Missing Skills
    if (analysis.missingSkills && analysis.missingSkills.length > 0) {
      doc.fillColor('#DC2626').fontSize(14).font('Helvetica-Bold').text('Critical Missing Skills');
      doc.moveDown(0.5);
      analysis.missingSkills.forEach(item => {
        doc.fontSize(10).font('Helvetica-Bold').fillColor('#B91C1C').text(`- ${item.skill.toUpperCase()}`, { continued: true });
        doc.font('Helvetica').fillColor('#475569').text(` (Urgency: ${item.importance})`);
      });
      doc.moveDown(1);
    }

    // Recruiter Feedback
    if (analysis.recruiterFeedback) {
      doc.fillColor('#1E293B').fontSize(14).font('Helvetica-Bold').text('Recruiter-Style Assessment');
      doc.moveDown(0.5);
      doc.fontSize(10).font('Helvetica-Oblique').fillColor('#334155').text(`"${analysis.recruiterFeedback}"`);
      doc.moveDown(1);
    }

    // AI Rewritten Bullets
    if (analysis.rewrittenBullets && analysis.rewrittenBullets.length > 0) {
      doc.fillColor('#1E293B').fontSize(14).font('Helvetica-Bold').text('ATS-Optimized Bullet Point Suggestions');
      doc.moveDown(0.5);
      analysis.rewrittenBullets.forEach((bullet, idx) => {
        doc.fontSize(10).font('Helvetica-Bold').fillColor('#94A3B8').text(`[Original ${idx + 1}]: `);
        doc.font('Helvetica').fillColor('#64748B').text(bullet.original);
        doc.font('Helvetica-Bold').fillColor('#059669').text(`[Improved ${idx + 1}]: `);
        doc.font('Helvetica').fillColor('#0F172A').text(bullet.improved);
        doc.moveDown(0.5);
      });
    }

    doc.end();
  } catch (err) {
    console.error('Report error:', err);
    res.status(500).json({ error: 'Server error generating PDF report.' });
  }
});

module.exports = router;
