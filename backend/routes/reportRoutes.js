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

    const checkPageBreak = (doc, requiredSpace) => {
      if (doc.y + requiredSpace > doc.page.height - doc.page.margins.bottom) {
        doc.addPage();
      }
    };

    // 1. Overall Assessment
    doc.fillColor('#2563EB').fontSize(14).font('Helvetica-Bold').text('OVERALL ASSESSMENT');
    doc.moveDown(0.3);
    doc.fillColor('#334155').fontSize(11).font('Helvetica-Bold').text(`• Overall ATS Score: `, { continued: true }).font('Helvetica').text(`${analysis.atsScore !== undefined && analysis.atsScore !== null ? analysis.atsScore + '%' : 'N/A'}`);
    const jdMatch = analysis.semanticSimilarity !== undefined && analysis.semanticSimilarity !== null ? `${analysis.semanticSimilarity}%` : 'N/A';
    doc.font('Helvetica-Bold').text(`• Job Description Match: `, { continued: true }).font('Helvetica').text(`${jdMatch}`);
    doc.moveDown(0.5);

    let atsLevel = analysis.atsScore >= 80 ? 'strong' : analysis.atsScore >= 60 ? 'moderate' : 'weak';
    let matchLevel = (analysis.semanticSimilarity || 0) >= 80 ? 'strong' : (analysis.semanticSimilarity || 0) >= 60 ? 'moderate' : 'low';
    
    let gapReason = '';
    if (analysis.missingSkills && analysis.missingSkills.length > 0) {
      gapReason = `the absence of explicit evidence for critical requirements like ${analysis.missingSkills[0].skill || analysis.missingSkills[0]}`;
    } else {
      gapReason = 'a general misalignment with the specific semantic keywords expected for this role';
    }

    let assessmentText = `This resume achieved an overall ATS score of ${analysis.atsScore || 0}%, indicating a ${atsLevel} structural and technical presentation. Alignment with the target role is ${matchLevel} at ${jdMatch}. The primary factor influencing this alignment is ${gapReason}.`;
    
    doc.fillColor('#1E293B').fontSize(11).font('Helvetica').text(assessmentText, { align: 'justify' });
    doc.moveDown(1.5);

    // 2. Resume Sections
    checkPageBreak(doc, 100);
    doc.fillColor('#2563EB').fontSize(14).font('Helvetica-Bold').text('RESUME SECTIONS');
    doc.moveDown(0.3);
    doc.fillColor('#334155').fontSize(11).font('Helvetica');
    let sectionCount = 0;
    if (analysis.detectedSections && analysis.detectedSections.length > 0) {
      analysis.detectedSections.forEach(sec => {
         doc.text(`• ${sec}`);
         sectionCount++;
      });
    } else {
      doc.text('No core sections detected.');
    }
    doc.moveDown(0.5);
    doc.fillColor('#1E293B').fontSize(10).font('Helvetica-Oblique').text(`The resume contains ${sectionCount} out of 5 standard structural sections, providing recruiters with the basic framework needed to evaluate the candidate.`);
    doc.moveDown(1.5);

    // 3. Strengths
    if (analysis.strengths && analysis.strengths.length > 0) {
      checkPageBreak(doc, 100);
      doc.fillColor('#16A34A').fontSize(14).font('Helvetica-Bold').text('STRENGTHS');
      doc.moveDown(0.3);
      doc.fillColor('#334155').fontSize(11).font('Helvetica');
      analysis.strengths.forEach(str => doc.text(`• ${str}`));
      doc.moveDown(1.5);
    }

    // 4. Areas to Improve
    if (analysis.weaknesses && analysis.weaknesses.length > 0) {
      checkPageBreak(doc, 100);
      doc.fillColor('#DC2626').fontSize(14).font('Helvetica-Bold').text('AREAS TO IMPROVE');
      doc.moveDown(0.3);
      doc.fillColor('#334155').fontSize(11).font('Helvetica');
      analysis.weaknesses.forEach(weak => doc.text(`• ${weak}`));
      doc.moveDown(1.5);
    }

    // 5. Missing Skills
    checkPageBreak(doc, 100);
    doc.fillColor('#EA580C').fontSize(14).font('Helvetica-Bold').text('JD ALIGNMENT / MISSING SKILLS');
    doc.moveDown(0.3);
    doc.fillColor('#334155').fontSize(11).font('Helvetica');
    if (analysis.missingSkills && analysis.missingSkills.length > 0) {
      analysis.missingSkills.forEach(item => {
         const skillName = item.skill || item;
         const imp = item.importance ? `— ${item.importance}` : '';
         checkPageBreak(doc, 60);
         doc.font('Helvetica-Bold').text(`${skillName} ${imp}`);
         doc.font('Helvetica').fontSize(10).fillColor('#1E293B').text(`The JD explicitly requires ${skillName}, but no ${skillName} experience was explicitly detected in the uploaded resume.`);
         doc.moveDown(0.5);
         doc.fontSize(11).fillColor('#334155');
      });
    } else {
      doc.text('Great — no significant missing skills detected against the provided Job Description.');
    }
    doc.moveDown(1.5);

    // 6. Technical Skills
    checkPageBreak(doc, 100);
    doc.fillColor('#8B5CF6').fontSize(14).font('Helvetica-Bold').text('TECHNICAL SKILLS');
    doc.moveDown(0.3);
    doc.fillColor('#334155').fontSize(11).font('Helvetica');
    let hasSkills = false;
    if (analysis.techSkillProfile && Object.keys(analysis.techSkillProfile).length > 0) {
      Object.entries(analysis.techSkillProfile).forEach(([key, skills]) => {
         if (skills && skills.length > 0) {
            hasSkills = true;
            checkPageBreak(doc, 30);
            const formattedKey = key.replace('_', ' ').toUpperCase();
            doc.font('Helvetica-Bold').text(`${formattedKey}: `, { continued: true }).font('Helvetica').text(skills.join(", "));
         }
      });
    }
    if (!hasSkills) {
      doc.text('No technical profile data available.');
    } else {
      doc.moveDown(0.5);
      doc.fillColor('#1E293B').fontSize(10).font('Helvetica-Oblique').text('These are the technical skills explicitly detected from the uploaded resume. Their presence indicates what the current resume communicates to a recruiter; it does not determine the candidate\'s actual level of proficiency.');
    }
    doc.moveDown(1.5);

    // 7. Recommended Improvements
    checkPageBreak(doc, 100);
    doc.fillColor('#2563EB').fontSize(14).font('Helvetica-Bold').text('RECOMMENDED IMPROVEMENTS');
    doc.moveDown(0.3);
    const improvements = analysis.recommendedImprovements || analysis.recommended_improvements || [];
    if (improvements.length > 0) {
      improvements.forEach((item) => {
         checkPageBreak(doc, 80);
         doc.fillColor('#0F172A').fontSize(12).font('Helvetica-Bold').text(`${item.title}`);
         doc.moveDown(0.2);
         doc.fillColor('#64748B').fontSize(10).font('Helvetica-Bold').text(`Why it matters: `, { continued: true }).font('Helvetica').text(`${item.why_it_matters}`);
         doc.moveDown(0.2);
         doc.fillColor('#334155').font('Helvetica-Bold').text(`What to change: `, { continued: true }).font('Helvetica').text(`${item.what_to_change}`);
         doc.moveDown(0.8);
      });
    } else {
       doc.fillColor('#334155').fontSize(11).font('Helvetica-Oblique').text('No specific improvements recommended.');
    }
    doc.moveDown(1.5);

    // 8. Candidate Takeaway
    checkPageBreak(doc, 100);
    doc.fillColor('#2563EB').fontSize(14).font('Helvetica-Bold').text('CANDIDATE TAKEAWAY');
    doc.moveDown(0.3);
    
    let currentStrength = (analysis.strengths && analysis.strengths.length > 0) ? analysis.strengths[0].toLowerCase() : 'a solid structural foundation';
    if (currentStrength.endsWith('.')) {
        currentStrength = currentStrength.slice(0, -1); // Remove trailing period for flow
    }
    
    let currentGap = (analysis.weaknesses && analysis.weaknesses.length > 0) ? analysis.weaknesses[0].toLowerCase() : 'general formatting and bullet impact';
    if (currentGap.endsWith('.')) {
        currentGap = currentGap.slice(0, -1);
    }
    
    let firstPriority = improvements.length > 0 ? improvements[0].title.toLowerCase() : 'reviewing your metrics and ensuring your technical skills are explicitly listed';

    let takeawayText = `Currently, your resume successfully demonstrates ${currentStrength}. The most significant gap against the target role is ${currentGap}. To immediately improve your positioning, you should prioritize ${firstPriority}.`;

    doc.fillColor('#1E293B').fontSize(11).font('Helvetica').text(takeawayText, { align: 'justify' });
    doc.moveDown(1.5);

    doc.end();
  } catch (err) {
    console.error('Report error:', err);
    res.status(500).json({ error: 'Server error generating PDF report.' });
  }
});

module.exports = router;
