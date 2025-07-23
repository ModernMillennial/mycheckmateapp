// build-helper.js
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Function to copy app.config.js to app.json for EAS build
function prepareForBuild() {
  try {
    const config = require('./app.config.js');
    fs.writeFileSync(
      path.join(__dirname, 'app.json'),
      JSON.stringify({ expo: config }, null, 2)
    );
    console.log('Successfully created app.json for build');
  } catch (error) {
    console.error('Error preparing for build:', error);
    process.exit(1);
  }
}

// Run the preparation
prepareForBuild();
