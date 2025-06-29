exports.handler = async (event, context) => {
  const { id } = event.queryStringParameters || {};
  
  if (!id) {
    return {
      statusCode: 400,
      headers: { 'Content-Type': 'text/plain' },
      body: 'Missing report ID'
    };
  }
  
  try {
    // Fetch data from Supabase
    const url = `https://kjyobkrjcmiuusijvrme.supabase.co/rest/v1/investiscope_leads?analysis_id=eq.${id}`;
    const response = await fetch(url, {
      headers: {
        'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtqeW9ia3JqY21pdXVzaWp2cm1lIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA5NDM5NzMsImV4cCI6MjA2NjUxOTk3M30.2GxAUtXPal7ufxg7KgWMO7h15RXJOolBWt0-NPygj2I'
      }
    });
    
    const dataArray = await response.json();
    const data = dataArray[0];
    
    if (!data) {
      return {
        statusCode: 404,
        headers: { 'Content-Type': 'text/html' },
        body: '<h1>Report not found</h1><p>Please check your analysis ID and try again.</p>'
      };
    }
    
    // Extract all data with proper field mappings
    const p = data.property_data || {};
    const e = data.eligibility_data || {};
    const r = data.results || {};
    
    // Check if we have the complete data structure (from updated calculator)
    const hasCompleteData = r.propertyPurchase !== undefined;
    
    // Get eligibility status
    const eligible = e.eligible === true || e.eligible === 'true';
    
    // Property values
    const propertyPrice = p.price || 0;
    const propertySize = p.size || 0;
    const bedrooms = p.bedrooms || p.rooms || 0;
    const renovationPerSqm = p.renovationLevel || p.renovationPerSqm || 0;
    
    // Calculate costs (handle both old and new data structures)
    let renovationCost, equipment, innovation, environmental, designPm, preliminaryStudies;
    let agencyFee, registrationTax, notaryFee, consultingFee;
    let totalEligible, totalNonEligible, totalProject;
    let grantAmount, taxCredit, totalBenefit, netInvestment;
    
    if (hasCompleteData) {
      // New complete data structure
      renovationCost = r.renovationCost || 0;
      equipment = r.equipment || 0;
      innovation = r.innovation || 0;
      environmental = r.environmental || 0;
      designPm = r.designPm || 0;
      preliminaryStudies = r.preliminaryStudies || 0;
      
      agencyFee = r.agencyFee || 0;
      registrationTax = r.registrationTax || 0;
      notaryFee = r.notaryFee || 0;
      consultingFee = r.consultingFee || 0;
      
      totalEligible = r.totalEligible || 0;
      totalNonEligible = r.totalNonEligible || 0;
      totalProject = r.totalProject || 0;
      
      grantAmount = eligible ? (r.grant || 0) : 0;
      taxCredit = eligible ? (r.taxCredit || 0) : 0;
      totalBenefit = eligible ? (r.totalBenefit || 0) : 0;
      netInvestment = r.netInvestment || r.yourCost || totalProject;
    } else {
      // Old data structure - calculate values
      renovationCost = propertySize * renovationPerSqm;
      
      // Estimate additional components
      equipment = Math.round(propertySize * 250);
      innovation = Math.round(propertySize * 125);
      environmental = Math.round(propertySize * 83);
      
      // Professional fees
      const civilWorks = propertyPrice + renovationCost;
      designPm = civilWorks * 0.06;
      const preliminaryTotal = civilWorks + equipment + innovation + environmental + designPm;
      preliminaryStudies = preliminaryTotal * 0.015 / (1 - 0.015);
      
      // Non-eligible costs
      agencyFee = propertyPrice * 0.03;
      registrationTax = propertyPrice * 0.09;
      notaryFee = propertyPrice * 0.025;
      consultingFee = 15000;
      
      totalEligible = preliminaryTotal + preliminaryStudies;
      totalNonEligible = agencyFee + registrationTax + notaryFee + consultingFee;
      totalProject = totalEligible + totalNonEligible;
      
      // Grant calculations
      if (eligible) {
        grantAmount = totalEligible * 0.45;
        taxCredit = totalEligible * 0.15;
        totalBenefit = grantAmount + taxCredit;
        netInvestment = totalProject - grantAmount - taxCredit;
      } else {
        grantAmount = 0;
        taxCredit = 0;
        totalBenefit = 0;
        netInvestment = totalProject;
      }
    }
    
    // Financial projections - look in multiple places for the data
    const futureValue = r.futureValue || (totalProject * Math.pow(1.035, 5));
    const capitalGain = futureValue - totalProject;
    const annualRental = r.annualRentalIncome || r.annualIncome || (propertyPrice * 0.18 * 0.8);
    const monthlyRental = annualRental / 12;
    
    // Calculate metrics
    const capRate = totalProject > 0 ? (annualRental / totalProject * 100).toFixed(1) : '0.0';
    const paybackYears = annualRental > 0 ? (netInvestment / annualRental).toFixed(1) : 'N/A';
    const fiveYearCashFlow = (annualRental * 5) - netInvestment;
    
    // ROI calculation
    let roiPercent;
    if (eligible && netInvestment > 0) {
      roiPercent = ((capitalGain + totalBenefit) / netInvestment * 100).toFixed(1);
    } else if (totalProject > 0) {
      roiPercent = (capitalGain / totalProject * 100).toFixed(1);
    } else {
      roiPercent = '0.0';
    }
    
    // Professional HTML Report
    const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>InvestiScope Investment Analysis Report - ${data.analysis_id}</title>
    <style>
        @page { 
            size: A4; 
            margin: 0;
        }
        
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6;
            color: #1a1a1a;
            background: #f5f5f5;
        }
        
        .report-container {
            max-width: 210mm;
            margin: 0 auto;
            background: white;
            box-shadow: 0 0 20px rgba(0,0,0,0.1);
        }
        
        /* Header with gradient */
        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 25%, #059669 75%, #047857 100%);
            color: white;
            padding: 60px 40px;
            text-align: center;
            position: relative;
            overflow: hidden;
        }
        
        .header::before {
            content: '';
            position: absolute;
            top: -50%;
            right: -50%;
            width: 200%;
            height: 200%;
            background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%);
            animation: shimmer 15s infinite;
        }
        
        @keyframes shimmer {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
        
        .logo {
            font-size: 42px;
            font-weight: 200;
            letter-spacing: -1px;
            margin-bottom: 10px;
            position: relative;
            z-index: 1;
        }
        
        .logo strong {
            font-weight: 700;
        }
        
        .report-title {
            font-size: 24px;
            font-weight: 300;
            margin-bottom: 20px;
            opacity: 0.95;
            position: relative;
            z-index: 1;
        }
        
        .analysis-badge {
            display: inline-block;
            background: rgba(255,255,255,0.2);
            padding: 8px 20px;
            border-radius: 20px;
            font-size: 14px;
            margin-top: 10px;
            backdrop-filter: blur(10px);
            position: relative;
            z-index: 1;
        }
        
        /* Executive Summary */
        .executive-summary {
            padding: 40px;
            background: #fafbfc;
            border-bottom: 1px solid #e5e7eb;
        }
        
        .summary-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 24px;
            margin-top: 24px;
        }
        
        .metric-card {
            background: white;
            padding: 24px;
            border-radius: 12px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.05);
            text-align: center;
            transition: transform 0.2s;
        }
        
        .metric-card:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        }
        
        .metric-card.highlight {
            background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);
            border: 2px solid #10b981;
        }
        
        .metric-label {
            font-size: 14px;
            color: #6b7280;
            margin-bottom: 8px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        
        .metric-value {
            font-size: 32px;
            font-weight: 700;
            color: #1a1a1a;
            line-height: 1.2;
        }
        
        .metric-value.green {
            color: #10b981;
        }
        
        .metric-value.blue {
            color: #3b82f6;
        }
        
        /* Content sections */
        .content {
            padding: 40px;
        }
        
        .section {
            margin-bottom: 48px;
        }
        
        .section-title {
            font-size: 28px;
            font-weight: 600;
            color: #111827;
            margin-bottom: 24px;
            padding-bottom: 12px;
            border-bottom: 3px solid #e5e7eb;
        }
        
        .data-table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 16px;
        }
        
        .data-table th,
        .data-table td {
            padding: 16px;
            text-align: left;
            border-bottom: 1px solid #e5e7eb;
        }
        
        .data-table th {
            background: #f9fafb;
            font-weight: 600;
            color: #374151;
            font-size: 14px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        
        .data-table td {
            color: #1f2937;
        }
        
        .data-table tr:hover {
            background: #f9fafb;
        }
        
        /* Eligibility Status */
        .eligibility-section {
            background: ${eligible ? 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)' : 'linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%)'};
            padding: 32px;
            border-radius: 16px;
            text-align: center;
            margin: 32px 0;
        }
        
        .eligibility-badge {
            display: inline-block;
            background: ${eligible ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)' : 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)'};
            color: white;
            padding: 12px 32px;
            border-radius: 50px;
            font-size: 18px;
            font-weight: 600;
            box-shadow: 0 4px 12px ${eligible ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'};
        }
        
        .eligibility-details {
            margin-top: 16px;
            color: ${eligible ? '#065f46' : '#991b1b'};
            font-size: 16px;
        }
        
        /* Financial projections */
        .projection-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 20px;
            margin-top: 24px;
        }
        
        .projection-card {
            background: #f9fafb;
            padding: 24px;
            border-radius: 12px;
            border: 1px solid #e5e7eb;
        }
        
        .projection-card h4 {
            font-size: 16px;
            color: #374151;
            margin-bottom: 16px;
            font-weight: 600;
        }
        
        .projection-item {
            display: flex;
            justify-content: space-between;
            padding: 8px 0;
            border-bottom: 1px solid #e5e7eb;
        }
        
        .projection-item:last-child {
            border-bottom: none;
        }
        
        /* Risk Assessment */
        .risk-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 16px;
            margin-top: 24px;
        }
        
        .risk-item {
            padding: 16px;
            border-radius: 8px;
            text-align: center;
            font-weight: 600;
        }
        
        .risk-low {
            background: #d1fae5;
            color: #065f46;
        }
        
        .risk-medium {
            background: #fed7aa;
            color: #92400e;
        }
        
        .risk-high {
            background: #fee2e2;
            color: #991b1b;
        }
        
        /* Footer */
        .footer {
            background: #1f2937;
            color: white;
            padding: 40px;
            text-align: center;
        }
        
        .cta-buttons {
            margin: 32px 0;
        }
        
        .cta-button {
            display: inline-block;
            padding: 16px 32px;
            margin: 0 12px;
            border-radius: 8px;
            text-decoration: none;
            font-weight: 600;
            transition: transform 0.2s;
        }
        
        .cta-button:hover {
            transform: translateY(-2px);
        }
        
        .cta-primary {
            background: linear-gradient(135deg, #059669 0%, #047857 100%);
            color: white;
            box-shadow: 0 4px 12px rgba(5, 150, 105, 0.3);
        }
        
        .cta-whatsapp {
            background: #25D366;
            color: white;
            box-shadow: 0 4px 12px rgba(37, 211, 102, 0.3);
        }
        
        .disclaimer {
            margin-top: 32px;
            padding-top: 32px;
            border-top: 1px solid #374151;
            font-size: 14px;
            color: #9ca3af;
            line-height: 1.8;
        }
        
        /* Print styles */
        @media print {
            body {
                background: white;
            }
            
            .report-container {
                box-shadow: none;
            }
            
            .cta-buttons {
                display: none;
            }
            
            .section {
                page-break-inside: avoid;
            }
        }
        
        /* Mobile responsive */
        @media (max-width: 768px) {
            .header {
                padding: 40px 20px;
            }
            
            .content {
                padding: 20px;
            }
            
            .summary-grid,
            .projection-grid {
                grid-template-columns: 1fr;
            }
            
            .data-table {
                font-size: 14px;
            }
            
            .cta-button {
                display: block;
                margin: 12px 0;
            }
        }
    </style>
</head>
<body>
    <div class="report-container">
        <!-- Header -->
        <header class="header">
            <div class="logo">InvestiScope<strong>™</strong></div>
            <h1 class="report-title">Comprehensive Investment Analysis Report</h1>
            <div class="analysis-badge">Analysis ID: ${data.analysis_id}</div>
            <div style="margin-top: 16px; opacity: 0.9;">
                Generated on ${new Date(data.created_at).toLocaleDateString('en-US', { 
                    weekday: 'long',
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                })}
            </div>
        </header>
        
        <!-- Executive Summary -->
        <section class="executive-summary">
            <h2 style="font-size: 32px; font-weight: 600; margin-bottom: 8px;">Executive Summary</h2>
            <p style="color: #6b7280; font-size: 18px;">Key investment metrics at a glance</p>
            
            <div class="summary-grid">
                <div class="metric-card">
                    <div class="metric-label">Property Value</div>
                    <div class="metric-value">€${propertyPrice.toLocaleString()}</div>
                </div>
                
                <div class="metric-card">
                    <div class="metric-label">Total Project Cost</div>
                    <div class="metric-value">€${Math.round(totalProject).toLocaleString()}</div>
                </div>
                
                <div class="metric-card ${eligible ? 'highlight' : ''}">
                    <div class="metric-label">Mini PIA Grant</div>
                    <div class="metric-value ${eligible ? 'green' : ''}">
                        €${Math.round(grantAmount).toLocaleString()}
                    </div>
                </div>
                
                <div class="metric-card">
                    <div class="metric-label">Net Investment</div>
                    <div class="metric-value blue">€${Math.round(netInvestment).toLocaleString()}</div>
                </div>
            </div>
        </section>
        
        <!-- Main Content -->
        <div class="content">
            <!-- Grant Eligibility Status -->
            <div class="eligibility-section">
                <div class="eligibility-badge">
                    ${eligible ? '✅ ELIGIBLE FOR MINI PIA GRANT' : '❌ NOT ELIGIBLE FOR MINI PIA GRANT'}
                </div>
                ${e.reason ? `<div class="eligibility-details">${e.reason}</div>` : ''}
                ${!eligible && (!e.details || !e.details.inPuglia) ? '<div class="eligibility-details">Property must be located in Puglia region to qualify for Mini PIA grants</div>' : ''}
            </div>
            
            <!-- Property Overview -->
            <section class="section">
                <h2 class="section-title">Property Overview</h2>
                <table class="data-table">
                    <tr>
                        <th>Attribute</th>
                        <th>Details</th>
                    </tr>
                    <tr>
                        <td>Location</td>
                        <td>${e.details && e.details.inPuglia ? 'Puglia, Italy' : 'Italy'}</td>
                    </tr>
                    <tr>
                        <td>Property Type</td>
                        <td>${e.details && e.details.propertyType ? e.details.propertyType.charAt(0).toUpperCase() + e.details.propertyType.slice(1) : 'Not specified'}</td>
                    </tr>
                    <tr>
                        <td>Built Size</td>
                        <td>${propertySize} m²</td>
                    </tr>
                    <tr>
                        <td>Number of Bedrooms</td>
                        <td>${bedrooms}</td>
                    </tr>
                    <tr>
                        <td>Current Condition</td>
                        <td>${e.details && e.details.condition ? e.details.condition.charAt(0).toUpperCase() + e.details.condition.slice(1) : 'To be assessed'}</td>
                    </tr>
                    <tr>
                        <td>Intended Use</td>
                        <td>${e.details && e.details.tourismUse ? 'Tourism Accommodation (B&B/Hotel)' : 'Private Residence'}</td>
                    </tr>
                </table>
            </section>
            
            <!-- Investment Breakdown -->
            <section class="section">
                <h2 class="section-title">Detailed Investment Breakdown</h2>
                <table class="data-table">
                    <tr>
                        <th>Cost Component</th>
                        <th>Amount (€)</th>
                        <th>% of Total</th>
                    </tr>
                    <tr>
                        <td>Property Purchase Price</td>
                        <td>€${propertyPrice.toLocaleString()}</td>
                        <td>${totalProject > 0 ? ((propertyPrice / totalProject) * 100).toFixed(1) : '0.0'}%</td>
                    </tr>
                    <tr>
                        <td>Renovation Costs (${renovationPerSqm}€/m²)</td>
                        <td>€${Math.round(renovationCost).toLocaleString()}</td>
                        <td>${totalProject > 0 ? ((renovationCost / totalProject) * 100).toFixed(1) : '0.0'}%</td>
                    </tr>
                    <tr>
                        <td>Equipment & Furnishings</td>
                        <td>€${Math.round(equipment).toLocaleString()}</td>
                        <td>${totalProject > 0 ? ((equipment / totalProject) * 100).toFixed(1) : '0.0'}%</td>
                    </tr>
                    <tr>
                        <td>Innovation & Technology</td>
                        <td>€${Math.round(innovation).toLocaleString()}</td>
                        <td>${totalProject > 0 ? ((innovation / totalProject) * 100).toFixed(1) : '0.0'}%</td>
                    </tr>
                    <tr>
                        <td>Environmental/Energy</td>
                        <td>€${Math.round(environmental).toLocaleString()}</td>
                        <td>${totalProject > 0 ? ((environmental / totalProject) * 100).toFixed(1) : '0.0'}%</td>
                    </tr>
                    <tr>
                        <td>Design & Project Management (6%)</td>
                        <td>€${Math.round(designPm).toLocaleString()}</td>
                        <td>${totalProject > 0 ? ((designPm / totalProject) * 100).toFixed(1) : '0.0'}%</td>
                    </tr>
                    <tr>
                        <td>Preliminary Studies (1.5%)</td>
                        <td>€${Math.round(preliminaryStudies).toLocaleString()}</td>
                        <td>${totalProject > 0 ? ((preliminaryStudies / totalProject) * 100).toFixed(1) : '0.0'}%</td>
                    </tr>
                    <tr style="background: #f9fafb;">
                        <td><strong>Subtotal Eligible Costs</strong></td>
                        <td><strong>€${Math.round(totalEligible).toLocaleString()}</strong></td>
                        <td><strong>${totalProject > 0 ? ((totalEligible / totalProject) * 100).toFixed(1) : '0.0'}%</strong></td>
                    </tr>
                    <tr>
                        <td>Agency Fees (3%)</td>
                        <td>€${Math.round(agencyFee).toLocaleString()}</td>
                        <td>${totalProject > 0 ? ((agencyFee / totalProject) * 100).toFixed(1) : '0.0'}%</td>
                    </tr>
                    <tr>
                        <td>Registration Tax (9%)</td>
                        <td>€${Math.round(registrationTax).toLocaleString()}</td>
                        <td>${totalProject > 0 ? ((registrationTax / totalProject) * 100).toFixed(1) : '0.0'}%</td>
                    </tr>
                    <tr>
                        <td>Notary Fees (2.5%)</td>
                        <td>€${Math.round(notaryFee).toLocaleString()}</td>
                        <td>${totalProject > 0 ? ((notaryFee / totalProject) * 100).toFixed(1) : '0.0'}%</td>
                    </tr>
                    <tr>
                        <td>Business Consulting</td>
                        <td>€${Math.round(consultingFee).toLocaleString()}</td>
                        <td>${totalProject > 0 ? ((consultingFee / totalProject) * 100).toFixed(1) : '0.0'}%</td>
                    </tr>
                    <tr style="background: #f9fafb;">
                        <td><strong>Subtotal Non-Eligible</strong></td>
                        <td><strong>€${Math.round(totalNonEligible).toLocaleString()}</strong></td>
                        <td><strong>${totalProject > 0 ? ((totalNonEligible / totalProject) * 100).toFixed(1) : '0.0'}%</strong></td>
                    </tr>
                    <tr style="font-weight: 700; background: #f9fafb;">
                        <td>Total Project Cost</td>
                        <td>€${Math.round(totalProject).toLocaleString()}</td>
                        <td>100%</td>
                    </tr>
                    ${eligible ? `
                    <tr style="color: #059669; font-weight: 700;">
                        <td>Mini PIA Grant (45% of eligible)</td>
                        <td>- €${Math.round(grantAmount).toLocaleString()}</td>
                        <td>-${totalProject > 0 ? ((grantAmount / totalProject) * 100).toFixed(1) : '0.0'}%</td>
                    </tr>
                    <tr style="color: #3b82f6; font-weight: 700;">
                        <td>Tax Credit (15% of eligible)</td>
                        <td>- €${Math.round(taxCredit).toLocaleString()}</td>
                        <td>-${totalProject > 0 ? ((taxCredit / totalProject) * 100).toFixed(1) : '0.0'}%</td>
                    </tr>
                    <tr style="font-weight: 700; background: #f0fdf4;">
                        <td>Your Net Investment</td>
                        <td>€${Math.round(netInvestment).toLocaleString()}</td>
                        <td>${totalProject > 0 ? ((netInvestment / totalProject) * 100).toFixed(1) : '0.0'}%</td>
                    </tr>
                    ` : ''}
                </table>
            </section>
            
            <!-- Financial Projections -->
            <section class="section">
                <h2 class="section-title">5-Year Financial Projections</h2>
                
                <div class="projection-grid">
                    <div class="projection-card">
                        <h4>📈 Return on Investment</h4>
                        <div class="projection-item">
                            <span>ROI (5 years)</span>
                            <strong style="color: #059669;">${roiPercent}%</strong>
                        </div>
                        <div class="projection-item">
                            <span>Property Appreciation</span>
                            <strong>€${Math.round(capitalGain).toLocaleString()}</strong>
                        </div>
                        <div class="projection-item">
                            <span>Future Value (5 years)</span>
                            <strong>€${Math.round(futureValue).toLocaleString()}</strong>
                        </div>
                    </div>
                    
                    <div class="projection-card">
                        <h4>🏨 Rental Income Analysis</h4>
                        <div class="projection-item">
                            <span>Annual Rental Income</span>
                            <strong>€${Math.round(annualRental).toLocaleString()}</strong>
                        </div>
                        <div class="projection-item">
                            <span>Monthly Average</span>
                            <strong>€${Math.round(monthlyRental).toLocaleString()}</strong>
                        </div>
                        <div class="projection-item">
                            <span>Gross Rental Yield</span>
                            <strong>${capRate}%</strong>
                        </div>
                    </div>
                    
                    <div class="projection-card">
                        <h4>💰 Investment Metrics</h4>
                        <div class="projection-item">
                            <span>Cap Rate</span>
                            <strong>${capRate}%</strong>
                        </div>
                        <div class="projection-item">
                            <span>Payback Period</span>
                            <strong>${paybackYears} years</strong>
                        </div>
                        <div class="projection-item">
                            <span>5-Year Net Cash Flow</span>
                            <strong ${fiveYearCashFlow < 0 ? 'style="color: #ef4444;"' : ''}>€${Math.round(fiveYearCashFlow).toLocaleString()}</strong>
                        </div>
                    </div>
                </div>
            </section>
            
            <!-- Risk Assessment -->
            <section class="section">
                <h2 class="section-title">Risk Assessment</h2>
                <div class="risk-grid">
                    <div class="risk-item risk-low">
                        <div>Location Risk</div>
                        <div>LOW</div>
                    </div>
                    <div class="risk-item ${eligible ? 'risk-low' : 'risk-medium'}">
                        <div>Funding Risk</div>
                        <div>${eligible ? 'LOW' : 'MEDIUM'}</div>
                    </div>
                    <div class="risk-item risk-low">
                        <div>Market Risk</div>
                        <div>LOW</div>
                    </div>
                    <div class="risk-item risk-medium">
                        <div>Construction Risk</div>
                        <div>MEDIUM</div>
                    </div>
                </div>
                <p style="margin-top: 16px; color: #6b7280;">
                    ${eligible ? 
                    "Puglia's tourism market shows consistent growth with government support for tourism infrastructure development." :
                    "Consider properties in Puglia to access Mini PIA grants and reduce funding risk."}
                </p>
            </section>
            
            <!-- Next Steps -->
            <section class="section">
                <h2 class="section-title">Recommended Next Steps</h2>
                ${eligible ? `
                <ol style="line-height: 2; font-size: 16px;">
                    <li><strong>Property Due Diligence:</strong> Conduct professional property survey and title verification</li>
                    <li><strong>Grant Application:</strong> Prepare Mini PIA application with required documentation</li>
                    <li><strong>Project Planning:</strong> Develop detailed architectural plans for tourism use</li>
                    <li><strong>Financing:</strong> Secure funding for your €${Math.round(netInvestment).toLocaleString()} contribution</li>
                    <li><strong>Legal Structure:</strong> Establish appropriate business entity for tourism operations</li>
                    <li><strong>Timeline:</strong> Mini PIA applications typically process within 90-120 days</li>
                </ol>
                ` : `
                <ul style="line-height: 2; font-size: 16px;">
                    <li><strong>Location Requirement:</strong> Property must be located in Puglia region for Mini PIA eligibility</li>
                    <li><strong>Alternative Properties:</strong> Consider properties in Puglia that meet Mini PIA requirements</li>
                    <li><strong>Eligibility Review:</strong> Minimum 5 bedrooms required for non-hotel B&B classification</li>
                    <li><strong>Other Incentives:</strong> Explore alternative regional grant programs</li>
                    <li><strong>Private Financing:</strong> Current project requires €${Math.round(totalProject).toLocaleString()} without grants</li>
                </ul>
                `}
            </section>
            
            <!-- Investor Information -->
            <section class="section">
                <h2 class="section-title">Investor Information</h2>
                <table class="data-table">
                    <tr>
                        <td>Investor Name</td>
                        <td>${data.name || 'Not provided'}</td>
                    </tr>
                    <tr>
                        <td>Email</td>
                        <td>${data.email || 'Not provided'}</td>
                    </tr>
                    <tr>
                        <td>Phone</td>
                        <td>${data.phone || 'Not provided'}</td>
                    </tr>
                    <tr>
                        <td>Report Generated</td>
                        <td>${new Date(data.created_at).toLocaleDateString()}</td>
                    </tr>
                </table>
            </section>
        </div>
        
        <!-- Footer -->
        <footer class="footer">
            <h3 style="font-size: 24px; margin-bottom: 16px;">Ready to Proceed with Your Investment?</h3>
            <p style="opacity: 0.9; margin-bottom: 32px;">
                Our team of experts is ready to guide you through every step of your Italian property investment journey.
            </p>
            
            <div class="cta-buttons">
                <a href="https://wa.me/393514001402?text=Hi, I received my InvestiScope report (ID: ${data.analysis_id}). I would like to discuss the next steps for my investment." 
                   class="cta-button cta-whatsapp">
                    💬 Chat on WhatsApp
                </a>
                <a href="tel:+393514001402" class="cta-button cta-primary">
                    📞 Schedule a Call
                </a>
            </div>
            
            <div class="disclaimer">
                <p><strong>Important Disclaimer:</strong></p>
                <p>This report is provided for informational purposes only and does not constitute financial, investment, or legal advice. All calculations are estimates based on current market conditions and regulatory frameworks. Actual results may vary. Government grant availability and terms are subject to change. Mini PIA grants require properties to be located in Puglia region and meet specific eligibility criteria. We strongly recommend consulting with qualified legal, tax, and financial advisors before making any investment decisions.</p>
                <p style="margin-top: 16px;">© ${new Date().getFullYear()} InvestiScope™. All rights reserved. This report is confidential and intended solely for the named recipient.</p>
            </div>
        </footer>
    </div>
</body>
</html>`;
    
    return {
      statusCode: 200,
      headers: { 
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'no-cache'
      },
      body: html
    };
    
  } catch (err) {
    console.error('Report generation error:', err);
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'text/plain' },
      body: 'Error generating report: ' + err.message
    };
  }
};
