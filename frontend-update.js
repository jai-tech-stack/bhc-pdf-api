// 📝 REPLACE the downloadPDFReportNew function in your bhclive.html with this:

// Configuration - UPDATE THIS AFTER DEPLOYING TO VERCEL
const PDF_API_URL = 'https://YOUR-PROJECT.vercel.app/api/generate-pdf'; // 👈 CHANGE THIS!

async function downloadPDFReportNew(opts = {}) {
  if (isGenerating) {
    updateOverlay('A report is already being generated — please wait...');
    return Promise.reject(new Error('PDF generation already in progress'));
  }
  
  isGenerating = true;
  const overlay = showOverlay('Preparing your Brand Health Report...');
  
  try {
    updateOverlay('Generating PDF content...');
    
    // Get current state data
    const currentState = opts.currentState || window.currentState || FALLBACK_STATE;
    const assessmentData = opts.assessmentData || window.assessmentData || FALLBACK_ASSESSMENT;
    
    // Generate HTML template for PDF
    const htmlContent = generatePDFHTMLTemplate(currentState, assessmentData);
    
    updateOverlay('Sending to PDF generator...');
    
    // Call the serverless API
    const response = await fetch(PDF_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        htmlContent: htmlContent,
        assessmentData: {
          overallScore: currentState.overallScore,
          categoryScores: currentState.categoryScores,
          gapAnalysis: currentState.gapAnalysis
        },
        fileName: opts.fileName || `Brand_Health_Report_${new Date().toISOString().slice(0,10)}.pdf`
      })
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'PDF generation failed');
    }
    
    updateOverlay('Downloading report...');
    
    // Get PDF blob
    const blob = await response.blob();
    
    // Create download link
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = opts.fileName || `Brand_Health_Report_${new Date().toISOString().slice(0,10)}.pdf`;
    document.body.appendChild(a);
    a.click();
    
    // Cleanup
    window.URL.revokeObjectURL(url);
    a.remove();
    
    updateOverlay('Report generated successfully!');
    setTimeout(() => removeOverlay(), 700);
    
    isGenerating = false;
    return { success: true };
    
  } catch (error) {
    console.error('PDF generation error:', error);
    removeOverlay();
    isGenerating = false;
    alert('Failed to generate PDF: ' + (error.message || 'Unknown error'));
    return Promise.reject(error);
  } finally {
    isGenerating = false;
    if (overlayEl) {
      setTimeout(() => { 
        try { removeOverlay(); } catch(e){} 
      }, 1200);
    }
  }
}

// Generate HTML template for PDF
function generatePDFHTMLTemplate(currentState, assessmentData) {
  const { overallScore, categoryScores, gapAnalysis } = currentState;
  
  const getScoreColor = (score) => {
    if (score >= 80) return 'rgb(5,159,21)';
    if (score >= 70) return 'rgb(255,196,0)';
    if (score >= 60) return 'rgb(255,111,0)';
    return 'rgb(255,0,0)';
  };
  
  const getGrade = (score) => {
    if (score >= 90) return 'A';
    if (score >= 80) return 'B';
    if (score >= 70) return 'C';
    if (score >= 60) return 'D';
    return 'E';
  };
  
  const getInterpretation = (score) => {
    if (score >= 90) return {
      summary: "Your brand demonstrates excellent health with robust alignment across all dimensions.",
      p1: "This strong coherence indicates that brand values, mission, and expressions are consistently perceived.",
      p2: "Consistent messaging and authentic representation foster trust and loyalty among consumers."
    };
    if (score >= 80) return {
      summary: "Your brand demonstrates robust health with a strong foundation and positive market perception.",
      p1: "Minor gaps require focused attention to ensure sustained growth and competitive advantage.",
      p2: "These areas represent opportunities for significant improvement across various touchpoints."
    };
    if (score >= 70) return {
      summary: "The brand exhibits moderate health, indicating a need for strategic enhancements.",
      p1: "Without focused interventions, the brand risks stagnation or decline in market relevance.",
      p2: "Key areas include brand perception, customer engagement, and competitive differentiation."
    };
    if (score >= 60) return {
      summary: "Assessment reveals a weakened brand position requiring immediate attention.",
      p1: "Communications appear fragmented and misaligned, leading to confusion about brand identity.",
      p2: "Comprehensive brand workshop and strategic realignment are essential for revitalization."
    };
    return {
      summary: "Critical brand health issues require immediate comprehensive intervention.",
      p1: "Significant gaps exist across awareness, perception, differentiation, and loyalty.",
      p2: "A multi-faceted approach focusing on brand audit and discovery is absolutely essential."
    };
  };
  
  const interp = getInterpretation(overallScore);
  const grade = getGrade(overallScore);
  const scoreColor = getScoreColor(overallScore);
  
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { 
      font-family: 'Helvetica Neue', Arial, sans-serif; 
      background: #03051c;
      color: #fff;
      line-height: 1.6;
    }
    .page { 
      padding: 40px; 
      page-break-after: always;
      min-height: 297mm;
    }
    .header { 
      text-align: center; 
      margin-bottom: 40px;
    }
    .title { 
      font-size: 36px; 
      font-weight: bold; 
      color: #BD96E8;
      margin-bottom: 10px;
    }
    .subtitle { 
      font-size: 20px; 
      color: #9fb6df;
    }
    .score-section {
      text-align: center;
      margin: 40px 0;
    }
    .score-circle {
      width: 150px;
      height: 150px;
      border-radius: 50%;
      background: ${scoreColor};
      margin: 0 auto 20px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 48px;
      font-weight: bold;
      border: 5px solid #380e68;
    }
    .grade-badge {
      font-size: 24px;
      color: #BD96E8;
      font-weight: bold;
    }
    .section {
      background: rgba(56, 14, 104, 0.3);
      border: 1px solid rgba(189, 150, 232, 0.2);
      border-radius: 12px;
      padding: 24px;
      margin: 24px 0;
    }
    .section-title {
      font-size: 24px;
      color: #BD96E8;
      margin-bottom: 12px;
      font-weight: bold;
    }
    .section-description {
      color: #9fb6df;
      margin-bottom: 20px;
      font-size: 14px;
    }
    .gap-item {
      margin: 20px 0;
    }
    .gap-title {
      font-size: 18px;
      color: #fff;
      margin-bottom: 10px;
    }
    .progress-bar {
      background: rgba(26, 30, 48, 0.8);
      height: 30px;
      border-radius: 15px;
      overflow: hidden;
      margin: 10px 0;
    }
    .progress-fill {
      height: 100%;
      background: ${scoreColor};
      display: flex;
      align-items: center;
      justify-content: flex-end;
      padding-right: 12px;
      color: #fff;
      font-weight: bold;
    }
    .text-muted { color: #9fb6df; }
    .footer {
      text-align: center;
      margin-top: 40px;
      padding-top: 20px;
      border-top: 1px solid rgba(189, 150, 232, 0.2);
      color: #9fb6df;
      font-size: 12px;
    }
  </style>
</head>
<body>
  <!-- Page 1: Overview -->
  <div class="page">
    <div class="header">
      <div class="title">Brand Health Assessment</div>
      <div class="subtitle">Comprehensive Analysis Report</div>
    </div>
    
    <div class="section">
      <div class="section-title">Overview</div>
      <p class="text-muted">${interp.summary}</p>
    </div>
    
    <div class="score-section">
      <div class="score-circle">${overallScore}%</div>
      <div class="grade-badge">Grade ${grade}</div>
    </div>
    
    <div class="section">
      <p class="text-muted" style="margin-bottom: 16px;">${interp.p1}</p>
      <p class="text-muted">${interp.p2}</p>
    </div>
    
    <div class="footer">
      <p>Generated by Brand Health Checker | ${new Date().toLocaleDateString()}</p>
      <p style="margin-top: 8px;">www.brandhealthchecker.com</p>
    </div>
  </div>
  
  <!-- Page 2: Gap Analysis -->
  <div class="page">
    <div class="section-title" style="text-align: center; margin-bottom: 30px;">Core Gap Analysis</div>
    <p class="section-description" style="text-align: center;">Key performance indicators across critical brand dimensions</p>
    
    <div class="gap-item">
      <div class="gap-title">Vision & Reality Gap</div>
      <div class="progress-bar">
        <div class="progress-fill" style="width: ${gapAnalysis?.visionReality?.score || 0}%;">
          ${gapAnalysis?.visionReality?.score || 0}%
        </div>
      </div>
      <p class="text-muted" style="font-size: 14px;">Measures alignment between your brand vision and current reality</p>
    </div>
    
    <div class="gap-item">
      <div class="gap-title">People & Culture Gap</div>
      <div class="progress-bar">
        <div class="progress-fill" style="width: ${gapAnalysis?.peopleCulture?.score || 0}%;">
          ${gapAnalysis?.peopleCulture?.score || 0}%
        </div>
      </div>
      <p class="text-muted" style="font-size: 14px;">Evaluates internal culture alignment with brand promises</p>
    </div>
    
    <div class="gap-item">
      <div class="gap-title">Image & Perception Gap</div>
      <div class="progress-bar">
        <div class="progress-fill" style="width: ${gapAnalysis?.imagePerception?.score || 0}%;">
          ${gapAnalysis?.imagePerception?.score || 0}%
        </div>
      </div>
      <p class="text-muted" style="font-size: 14px;">Assesses customer perception vs. intended brand image</p>
    </div>
    
    <div class="footer">
      <p>Page 2 of 3 | Brand Health Assessment Report</p>
    </div>
  </div>
  
  <!-- Page 3: Recommendations -->
  <div class="page">
    <div class="section-title" style="text-align: center; margin-bottom: 30px;">Next Steps</div>
    
    <div class="section">
      <div class="section-title" style="font-size: 20px;">Recommended Actions</div>
      <ul style="color: #9fb6df; padding-left: 24px;">
        <li style="margin: 12px 0;">Schedule a free 60-minute consultation to discuss findings</li>
        <li style="margin: 12px 0;">Review category-specific recommendations</li>
        <li style="margin: 12px 0;">Develop action plan based on priority areas</li>
        <li style="margin: 12px 0;">Implement brand alignment strategies</li>
      </ul>
    </div>
    
    <div class="section">
      <div class="section-title" style="font-size: 20px;">Contact Information</div>
      <p class="text-muted" style="margin: 12px 0;">📧 Email: hello@brandhealthchecker.com</p>
      <p class="text-muted" style="margin: 12px 0;">🌐 Website: www.brandhealthchecker.com</p>
      <p class="text-muted" style="margin: 12px 0;">📅 Book Consultation: Schedule your free 30-minute call</p>
    </div>
    
    <div class="footer">
      <p>Page 3 of 3 | Brand Health Assessment Report</p>
      <p style="margin-top: 12px;">© ${new Date().getFullYear()} Brand Health Checker. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
  `.trim();
}

// Make functions available globally
window.downloadPDFReportNew = downloadPDFReportNew;
window.generatePDFHTMLTemplate = generatePDFHTMLTemplate;

