exports.handler = async (event, context) => {
  const { id } = event.queryStringParameters || {};
  
  try {
    // If no ID provided, show all available IDs
    if (!id) {
      const response = await fetch('https://kjyobkrjcmiuusijvrme.supabase.co/rest/v1/investiscope_leads?select=analysis_id,name,created_at', {
        headers: {
          'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtqeW9ia3JqY21pdXVzaWp2cm1lIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA5NDM5NzMsImV4cCI6MjA2NjUxOTk3M30.2GxAUtXPal7ufxg7KgWMO7h15RXJOolBWt0-NPygj2I'
        }
      });
      
      const allRecords = await response.json();
      
      return {
        statusCode: 200,
        headers: { 'Content-Type': 'text/html' },
        body: `
          <h1>All Available Reports</h1>
          <p>Click on any ID to view the report:</p>
          <ul>
            ${allRecords.map(record => `
              <li>
                <a href="?id=${record.analysis_id}">
                  ${record.analysis_id} - ${record.name} - ${new Date(record.created_at).toLocaleDateString()}
                </a>
              </li>
            `).join('')}
          </ul>
        `
      };
    }
    
    // Fetch specific report
    const response = await fetch('https://kjyobkrjcmiuusijvrme.supabase.co/rest/v1/investiscope_leads?analysis_id=eq.' + id, {
      headers: {
        'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtqeW9ia3JqY21pdXVzaWp2cm1lIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA5NDM5NzMsImV4cCI6MjA2NjUxOTk3M30.2GxAUtXPal7ufxg7KgWMO7h15RXJOolBWt0-NPygj2I'
      }
    });
    
    const dataArray = await response.json();
    const data = dataArray[0];
    
    if (!data) {
      return {
        statusCode: 404,
        body: `Report not found for ID: ${id}`
      };
    }
    
    // Display the report (simplified for now)
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'text/html' },
      body: `
        <h1>Report Found!</h1>
        <p>Analysis ID: ${data.analysis_id}</p>
        <p>Name: ${data.name}</p>
        <p>Email: ${data.email}</p>
        <h2>Data:</h2>
        <pre>${JSON.stringify(data, null, 2)}</pre>
      `
    };
    
  } catch (error) {
    return {
      statusCode: 500,
      body: 'Error: ' + error.message
    };
  }
};
