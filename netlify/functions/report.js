exports.handler = async (event, context) => {
  const { id } = event.queryStringParameters || {};
  
  if (!id) {
    return {
      statusCode: 400,
      body: 'Missing report ID'
    };
  }
  
  try {
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
        body: '<h1>Report not found</h1>'
      };
    }
    
    const p = data.property_data || {};
    const r = data.results || {};
    const eligible = data.eligible === 'true' || data.eligible === true;
    
    const html = `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Report ${id}</title>
<style>
body{margin:0;padding:20px;font-family:Arial,sans-serif;background:#f0f0f0}
.container{max-width:800px;margin:0 auto;background:white;padding:30px;border-radius:10px;box-shadow:0 2px 10px rgba(0,0,0,0.1)}
h1{color:#333;text-align:center}
.grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:20px;margin:30px 0}
.box{background:#f8f9fa;padding:20px;border-radius:8px;text-align:center}
.box.green{background:#d4edda}
.label{color:#666;font-size:14px}
.value{font-size:24px;font-weight:bold;color:#333;margin-top:5px}
.section{margin:30px 0}
.row{display:flex;justify-content:space-between;padding:10px 0;border-bottom:1px solid #eee}
.badge{display:inline-block;padding:10px 20px;border-radius:25px;font-weight:bold;margin:20px 0}
.eligible{background:#28a745;color:white}
.not-eligible{background:#dc3545;color:white}
.btn{display:inline-block;padding:12px 24px;margin:10px;background:#007bff;color:white;text-decoration:none;border-radius:5px}
.btn.wa{background:#25D366}
</style>
</head>
<body>
<div class="container">
<h1>InvestiScope™ Report</h1>
<p style="text-align:center;color:#666">Analysis ID: ${data.analysis_id}</p>

<div class="grid">
<div class="box">
<div class="label">Property Price</div>
<div class="value">€${(p.price||0).toLocaleString()}</div>
</div>
<div class="box">
<div class="label">Total Investment</div>
<div class="value">€${Math.round(r.totalProject||0).toLocaleString()}</div>
</div>
<div class="box ${eligible?'green':''}">
<div class="label">Mini PIA Grant</div>
<div class="value">€${eligible?Math.round(data.grant_amount||0).toLocaleString():'0'}</div>
</div>
<div class="box">
<div class="label">Your Investment</div>
<div class="value">€${Math.round(r.yourCost||r.totalProject||0).toLocaleString()}</div>
</div>
</div>

<div class="section" style="text-align:center">
<div class="badge ${eligible?'eligible':'not-eligible'}">
${eligible?'✅ ELIGIBLE FOR MINI PIA':'❌ NOT ELIGIBLE FOR MINI PIA'}
</div>
</div>

<div class="section">
<h2>Property Details</h2>
<div class="row">
<span>Size</span>
<strong>${p.size||0} m²</strong>
</div>
<div class="row">
<span>Bedrooms</span>
<strong>${p.bedrooms||p.rooms||0}</strong>
</div>
<div class="row">
<span>Renovation</span>
<strong>€${(p.renovationLevel||p.renovationPerSqm||0).toLocaleString()}/m²</strong>
</div>
</div>

<div class="section">
<h2>Contact</h2>
<div class="row">
<span>Name</span>
<strong>${data.name||'N/A'}</strong>
</div>
<div class="row">
<span>Email</span>
<strong>${data.email||'N/A'}</strong>
</div>
</div>

<div style="text-align:center;margin-top:40px">
<a href="https://wa.me/393514001402?text=Hi, I received my report ${data.analysis_id}" class="btn wa">💬 WhatsApp</a>
<a href="tel:+393514001402" class="btn">📞 Call</a>
</div>
</div>
</body>
</html>`;
    
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'text/html' },
      body: html
    };
    
  } catch (err) {
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'text/plain' },
      body: 'Error: ' + err.message
    };
  }
};
