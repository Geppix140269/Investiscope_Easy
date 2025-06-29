// netlify/functions/report.js
exports.handler = async (event, context) => {
  const { id } = event.queryStringParameters || {};
  
  if (!id) {
    return {
      statusCode: 400,
      body: 'Missing report ID'
    };
  }
  
  try {
    // Fetch from Supabase
    const response = await fetch('https://kjyobkrjcmiuusijvrme.supabase.co/rest/v1/investiscope_leads?analysis_id=eq.' + id, {
      headers: {
        'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtqeW9ia3JqY21pdXVzaWp2cm1lIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA5NDM5NzMsImV4cCI6MjA2NjUxOTk3M30.2GxAUtXPal7ufxg7KgWMO7h15RXJOolBWt0-NPygj2I',
        'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtqeW9ia3JqY21pdXVzaWp2cm1lIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA5NDM5NzMsImV4cCI6MjA2NjUxOTk3M30.2GxAUtXPal7ufxg7KgWMO7h15RXJOolBWt0-NPygj2I'
      }
    });
    
    const dataArray = await response.json();
    const data = dataArray[0];
    
    if (!data) {
      return {
        statusCode: 404,
        body: 'Report not found'
      };
    }
    
    // Extract data - fixed variable naming
    const propertyData = data.property_data || {};
    const eligibilityData = data.eligibility_data || {};
    const calcResults = data.results || {}; // Changed from 'results' to 'calcResults'
    
    // Generate HTML report
    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>InvestiScope Report - ${id}</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 25%, #059669 75%, #047857 100%);
            background-size: 400% 400%;
            animation: gradientShift 20s ease infinite;
            min-height: 100vh;
            color: #1a1a1a;
        }
        @keyframes gradientShift {
            0% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
        }
        .container { max-width: 800px; margin: 0 auto; padding: 40px 20px; }
        .report-card {
            background: rgba(255, 255, 255, 0.95);
            backdrop-filter: blur(10px);
            border-radius: 24px;
            padding: 40px;
            box-shadow: 0 20px 60px rgba(0,0,0,0.15);
            margin-bottom: 24px;
        }
        .header { text-align: center; margin-bottom: 40px; }
        .logo { font-size: 36px; font-weight: 300; margin-bottom: 16px; }
        .logo strong { font-weight: 700; }
        .analysis-id {
            background: #f3f4f6;
            padding: 8px 16px;
            border-radius: 8px;
            display: inline-block;
            font-size: 14px;
            color: #6b7280;
            margin-bottom: 24px;
        }
        h1 { font-size: 32px; font-weight: 700; margin-bottom: 24px; color: #1a1a1a; }
        h2 {
            font-size: 24px;
            font-weight: 600;
            margin-bottom: 20px;
            color: #374151;
            border-bottom: 2px solid #e5e7eb;
            padding-bottom: 12px;
        }
        .summary-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
            margin-bottom: 32px;
        }
        .summary-box {
            background: #f9fafb;
            padding: 24px;
            border-radius: 16px;
            text-align: center;
            border: 1px solid #e5e7eb;
        }
        .summary-box.highlight {
            background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);
            border-color: #86efac;
        }
        .summary-label { font-size: 14px; color: #6b7280; margin-bottom: 8px; }
        .summary-value { font-size: 28px; font-weight: 700; color: #1a1a1a; }
        .summary-value.green { color: #059669; }
        .details-section { margin-bottom: 32px; }
        .detail-row {
            display: flex;
            justify-content: space-between;
            padding: 12px 0;
            border-bottom: 1px solid #f3f4f6;
        }
        .detail-label { color: #6b7280; }
        .detail-value { font-weight: 600; color: #1a1a1a; }
        .eligibility-badge {
            display: inline-block;
            padding: 8px 24px;
            border-radius: 50px;
            font-weight: 600;
            margin-bottom: 16px;
        }
        .eligible { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; }
        .not-eligible { background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); color: white; }
        .cta-button {
            display: inline-block;
            background: linear-gradient(135deg, #059669 0%, #047857 100%);
            color: white;
            padding: 16px 32px;
            border-radius: 12px;
            text-decoration: none;
            font-weight: 600;
            margin: 8px;
            box-shadow: 0 4px 15px rgba(5, 150, 105, 0.4);
        }
        .whatsapp { background: #25D366; }
        @media (max-width: 640px) {
            .container { padding: 20px 12px; }
            .report-card { padding: 24px 16px; }
            .summary-grid { grid-template-columns: 1fr; }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="report-card">
            <div class="header">
                <div class="logo">InvestiScope<strong>™</strong></div>
                <div class="analysis-id">Analysis ID: ${id}</div>
                <h1>Property Investment Analysis Report</h1>
            </div>
            
            <div class="summary-grid">
                <div class="summary-box">
                    <div class="summary-label">Property Price</div>
                    <div class="summary-value">€${(propertyData.price || 0).toLocaleString()}</div>
                </div>
                <div class="summary-box">
                    <div class="summary-label">Total Investment</div>
                    <div class="summary-value">€${Math.round(calcResults.totalProject || 0).toLocaleString()}</div>
                </div>
                <div class="summary-box ${eligibilityData.eligible ? 'highlight' : ''}">
                    <div class="summary-label">Mini PIA Grant</div>
                    <div class="summary-value ${eligibilityData.eligible ? 'green' : ''}">
                        €${eligibilityData.eligible ? Math.round(calcResults.grant || 0).toLocaleString() : '0'}
                    </div>
                </div>
                <div class="summary-box">
                    <div class="summary-label">Your Investment</div>
                    <div class="summary-value">€${Math.round(calcResults.yourCost || calcResults.totalProject || 0).toLocaleString()}</div>
                </div>
            </div>
            
            <div class="details-section">
                <h2>Grant Eligibility Status</h2>
                <div style="text-align: center; padding: 24px;">
                    <div class="eligibility-badge ${eligibilityData.eligible ? 'eligible' : 'not-eligible'}">
                        ${eligibilityData.eligible ? '✅ ELIGIBLE FOR MINI PIA' : '❌ NOT ELIGIBLE FOR MINI PIA'}
                    </div>
                    <p style="color: #6b7280; margin-top: 12px;">
                        ${eligibilityData.reason || 'Eligibility assessment pending'}
                    </p>
                </div>
            </div>
            
            <div class="details-section">
                <h2>Property Details</h2>
                <div class="detail-row">
                    <span class="detail-label">Property Size</span>
                    <span class="detail-value">${propertyData.size || 0} m²</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Number of Bedrooms</span>
                    <span class="detail-value">${propertyData.bedrooms || 0}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Renovation Level</span>
                    <span class="detail-value">€${(propertyData.renovationLevel || 0).toLocaleString()}/m²</span>
                </div>
            </div>
            
            <div class="details-section">
                <h2>Investment Breakdown</h2>
                <div class="detail-row">
                    <span class="detail-label">Property Purchase Price</span>
                    <span class="detail-value">€${(propertyData.price || 0).toLocaleString()}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Renovation Costs</span>
                    <span class="detail-value">€${Math.round(calcResults.renovationCost || 0).toLocaleString()}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Professional Fees</span>
                    <span class="detail-value">€${Math.round(calcResults.professionalFees || 0).toLocaleString()}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Taxes & Registration</span>
                    <span class="detail-value">€${Math.round(calcResults.taxesAndFees || 0).toLocaleString()}</span>
                </div>
            </div>
            
            <div style="text-align: center; margin-top: 40px; padding-top: 32px; border-top: 2px solid #e5e7eb;">
                <h3 style="margin-bottom: 20px;">Ready to Move Forward?</h3>
                <a href="https://wa.me/393514001402?text=Hi, I received my InvestiScope report. My analysis ID is: ${id}" 
                   class="cta-button whatsapp">
                    💬 Chat on WhatsApp
                </a>
                <a href="tel:+393514001402" class="cta-button">
                    📞 Call +39 351 400 1402
                </a>
            </div>
        </div>
    </div>
</body>
</html>`;
    
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'text/html; charset=utf-8' },
      body: html
    };
    
  } catch (error) {
    console.error('Error:', error);
    return {
      statusCode: 500,
      body: 'Error generating report: ' + error.message
    };
  }
};
