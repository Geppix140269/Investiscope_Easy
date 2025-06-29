exports.handler = async (event, context) => {
  const { id } = event.queryStringParameters || {};
  
  try {
    // If no ID provided, show debug info
    if (!id) {
      const response = await fetch('https://kjyobkrjcmiuusijvrme.supabase.co/rest/v1/investiscope_leads?select=*', {
        headers: {
          'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtqeW9ia3JqY21pdXVzaWp2cm1lIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA5NDM5NzMsImV4cCI6MjA2NjUxOTk3M30.2GxAUtXPal7ufxg7KgWMO7h15RXJOolBWt0-NPygj2I',
          'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtqeW9ia3JqY21pdXVzaWp2cm1lIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA5NDM5NzMsImV4cCI6MjA2NjUxOTk3M30.2GxAUtXPal7ufxg7KgWMO7h15RXJOolBWt0-NPygj2I'
        }
      });
      
      const responseText = await response.text();
      let allRecords;
      
      try {
        allRecords = JSON.parse(responseText);
      } catch (e) {
        return {
          statusCode: 200,
          headers: { 'Content-Type': 'text/html' },
          body: `
            <h1>Debug Info</h1>
            <p>Response Status: ${response.status}</p>
            <p>Response Headers: ${JSON.stringify([...response.headers])}</p>
            <p>Response Text: <pre>${responseText}</pre></p>
          `
        };
      }
      
      return {
        statusCode: 200,
        headers: { 'Content-Type': 'text/html' },
        body: `
          <!DOCTYPE html>
          <html>
          <head>
            <title>All Reports</title>
            <style>
              body { font-family: Arial, sans-serif; padding: 20px; }
              table { border-collapse: collapse; width: 100%; }
              th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
              th { background-color: #f2f2f2; }
              a { color: #007bff; text-decoration: none; }
              a:hover { text-decoration: underline; }
            </style>
          </head>
          <body>
            <h1>All Available Reports</h1>
            <p>Total records found: ${allRecords.length}</p>
            
            ${allRecords.length === 0 ? 
              '<p style="color: red;">No records found in database!</p>' :
              `<table>
                <tr>
                  <th>Analysis ID</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Date</th>
                  <th>Action</th>
                </tr>
                ${allRecords.map(record => `
                  <tr>
                    <td>${record.analysis_id || 'N/A'}</td>
                    <td>${record.name || 'N/A'}</td>
                    <td>${record.email || 'N/A'}</td>
                    <td>${record.created_at ? new Date(record.created_at).toLocaleDateString() : 'N/A'}</td>
                    <td><a href="?id=${record.analysis_id}">View Report</a></td>
                  </tr>
                `).join('')}
              </table>`
            }
            
            <h2>Debug Info:</h2>
            <p>Response status: ${response.status}</p>
            <p>First record (if any): <pre>${allRecords[0] ? JSON.stringify(allRecords[0], null, 2) : 'No records'}</pre></p>
          </body>
          </html>
        `
      };
    }
    
    // Rest of the function for viewing specific reports...
    // (keep the existing code for when id parameter is provided)
    
  } catch (error) {
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'text/html' },
      body: `<h1>Error</h1><pre>${error.message}\n${error.stack}</pre>`
    };
  }
};
