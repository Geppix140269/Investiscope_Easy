<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>InvestiScope Light</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <style>
        .gradient-bg {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%);
            min-height: 100vh;
        }
        .module-frame {
            width: 100%;
            border: none;
            background: transparent;
        }
    </style>
</head>
<body class="gradient-bg">
    <div id="app-container" style="max-width: 1000px; margin: 0 auto; padding: 20px;">
        <!-- Module content loads here -->
        <iframe id="active-module" class="module-frame" style="height: 800px;"></iframe>
    </div>

    <script>
        // App state management
        const appState = {
            currentModule: 'calculator',
            data: {}
        };

        // Module URLs (update these to your Netlify URLs)
        const modules = {
            calculator: 'calculator.html',
            eligibility: 'eligibility.html',
            emaildb: 'email-database.html'
        };

        // Load a module
        function loadModule(moduleName) {
            const iframe = document.getElementById('active-module');
            iframe.src = modules[moduleName];
            appState.currentModule = moduleName;
        }

        // Listen for messages from modules
        window.addEventListener('message', (event) => {
            // Security check - update this to your actual domain
            // if (event.origin !== 'https://your-site.netlify.app') return;

            const { type, data } = event.data;

            switch(type) {
                case 'CALCULATOR_COMPLETE':
                    // Calculator finished, save data and load eligibility
                    appState.data.calculations = data;
                    loadModule('eligibility');
                    // Pass data to eligibility module
                    setTimeout(() => {
                        document.getElementById('active-module').contentWindow.postMessage({
                            type: 'LOAD_CALCULATOR_DATA',
                            data: appState.data.calculations
                        }, '*');
                    }, 1000);
                    break;

                case 'ELIGIBILITY_COMPLETE':
                    // Eligibility finished, save data and load email/db
                    appState.data.eligibility = data;
                    loadModule('emaildb');
                    // Pass combined data to email module
                    setTimeout(() => {
                        document.getElementById('active-module').contentWindow.postMessage({
                            type: 'LOAD_PROPERTY_DATA',
                            data: appState.data
                        }, '*');
                    }, 1000);
                    break;

                case 'REGISTRATION_COMPLETE':
                    // All done - show thank you or redirect
                    alert('Analysis complete! Check your email for the full report.');
                    // Optionally restart
                    loadModule('calculator');
                    break;
            }
        });

        // Start the app
        loadModule('calculator');
    </script>
</body>
</html>
