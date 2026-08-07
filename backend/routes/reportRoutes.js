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

   // ==========================
// ATS SUMMARY
// ==========================

doc.moveDown();

const startY = doc.y;

// Card Background
doc.roundedRect(40, startY, 515, 110, 10)
   .fill('#F8FAFC');

doc.strokeColor('#CBD5E1')
   .roundedRect(40, startY, 515, 110, 10)
   .stroke();

// ATS Score
doc.fillColor('#2563EB')
   .font('Helvetica-Bold')
   .fontSize(34)
   .text(`${analysis.atsScore}%`, 60, startY + 20);

doc.fontSize(11)
   .fillColor('#64748B')
   .font('Helvetica')
   .text('Overall ATS Score', 60, startY + 60);

// Right Side Scores

let x = 250;
let y = startY + 18;

doc.font('Helvetica-Bold')
   .fillColor('#0F172A')
   .fontSize(11);

doc.text(`Semantic Similarity : ${analysis.semanticSimilarity}%`, x, y);

y += 20;

doc.text(`Skill Match         : ${analysis.skillScore}%`, x, y);

y += 20;

doc.text(`Section Score       : ${analysis.sectionScore}%`, x, y);

y += 20;

doc.text(`Impact Score        : ${analysis.impactScore}%`, x, y);

y += 20;

doc.fillColor('#16A34A')
   .text(`Status : ${analysis.shortlistReadiness}`, x, y);

// Move cursor below card
doc.y = startY + 130;

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

    if (doc.y > 650) {
        doc.addPage();
    }

    doc.fontSize(12)
       .fillColor('#2563EB')
       .font('Helvetica-Bold')
       .text(`Suggestion ${idx + 1}`);

    doc.moveDown(0.2);

    doc.fontSize(10)
       .fillColor('#64748B')
       .font('Helvetica')
       .text("Original:");

    doc.moveDown(0.2);

    doc.fillColor('#0F172A')
       .text(bullet.original);

    doc.moveDown(0.4);

    doc.font('Helvetica-Bold')
       .fillColor('#16A34A')
       .text("Improved:");

    doc.moveDown(0.2);

    doc.font('Helvetica')
       .fillColor('#0F172A')
       .text(bullet.improved);

    doc.moveDown();
});
    }

    doc.end();
  } catch (err) {
    console.error('Report error:', err);
    res.status(500).json({ error: 'Server error generating PDF report.' });
  }
});

module.exports = router;
