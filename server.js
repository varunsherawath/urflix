// Simple Node.js backend server to launch applications
// Run with: node server.js

import express from 'express';
import { exec } from 'child_process';
import cors from 'cors';

const app = express();
const PORT = 3001;

// Enable CORS for the React app
app.use(cors());
app.use(express.json());

// App name to executable mapping
const APP_MAPPINGS = {
  'notepad': 'notepad.exe',
  'calculator': 'calc.exe',
  'chrome': 'chrome.exe',
  'firefox': 'firefox.exe',
  'edge': 'msedge.exe',
  'vscode': 'code.exe',
  'spotify': 'spotify.exe',
  'discord': 'discord.exe',
  'steam': 'steam.exe',
  'photoshop': 'photoshop.exe',
  'excel': 'excel.exe',
  'word': 'winword.exe',
  'powerpoint': 'powerpnt.exe',
  'outlook': 'outlook.exe',
  'teams': 'teams.exe',
  'zoom': 'zoom.exe',
  'whatsapp': 'whatsapp.exe',
  'telegram': 'telegram.exe',
  'vlc': 'vlc.exe',
  'media player': 'wmplayer.exe',
};

// Launch application endpoint
app.post('/launch-app', (req, res) => {
  const { appName } = req.body;
  
  if (!appName) {
    return res.status(400).json({ 
      success: false, 
      message: 'App name is required' 
    });
  }
  
  const lowerAppName = appName.toLowerCase().trim();
  
  // Find executable
  let executable = APP_MAPPINGS[lowerAppName];
  
  // If not found in mappings, try using the app name directly
  if (!executable) {
    // Try common patterns
    if (lowerAppName.endsWith('.exe')) {
      executable = lowerAppName;
    } else {
      executable = lowerAppName + '.exe';
    }
  }
  
  console.log(`Attempting to launch: ${executable}`);
  
  // Execute the command
  exec(`start "" "${executable}"`, (error, stdout, stderr) => {
    if (error) {
      console.error(`Error launching ${executable}:`, error);
      
      // Try alternative method - search in common locations
      const commonPaths = [
        `C:\\Program Files\\${executable}`,
        `C:\\Program Files (x86)\\${executable}`,
        `C:\\Windows\\System32\\${executable}`,
        executable // Try direct execution
      ];
      
      let triedAlternative = false;
      for (const path of commonPaths) {
        exec(`start "" "${path}"`, (altError) => {
          if (!altError) {
            triedAlternative = true;
            return res.json({ 
              success: true, 
              message: `Successfully launched ${appName}` 
            });
          }
        });
      }
      
      if (!triedAlternative) {
        // Try using shell:AppsFolder for Windows Store apps
        exec(`start shell:AppsFolder\\${executable}`, (shellError) => {
          if (shellError) {
            return res.status(500).json({ 
              success: false, 
              message: `Could not launch ${appName}. Please ensure it is installed and accessible.` 
            });
          } else {
            return res.json({ 
              success: true, 
              message: `Successfully launched ${appName}` 
            });
          }
        });
      }
    } else {
      res.json({ 
        success: true, 
        message: `Successfully launched ${appName}` 
      });
    }
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'App launcher service is running' });
});

app.listen(PORT, () => {
  console.log(`🚀 JARVIS App Launcher Server running on http://localhost:${PORT}`);
  console.log('Ready to launch applications!');
});

