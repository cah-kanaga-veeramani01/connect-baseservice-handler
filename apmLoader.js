require('elastic-apm-node').start({
    // Allowed characters: a-z, A-Z, 0-9, -, _, and space
    serviceName: process.env.APM_SERVICE_NAME,
  
    // Use if APM Server requires a token
    secretToken: process.env.APM_TOKEN,
  
    // Set custom APM Server URL (default: http://localhost:8200)
    serverUrl: process.env.APM_SERVER_URL,
    environment: process.env.ENV
  })