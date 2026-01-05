# JARVIS App Launcher Setup

To enable JARVIS to open applications and software, you need to run a backend server.

## Setup Instructions

### 1. Install Backend Dependencies

Open a new terminal in the project directory and run:

```bash
npm install express cors
```

Or if you prefer a separate package.json for the server:

```bash
npm install --prefix . express cors
```

### 2. Start the Backend Server

In a separate terminal window, run:

```bash
node server.js
```

Or use npm:

```bash
npm run server
```

You should see:
```
🚀 JARVIS App Launcher Server running on http://localhost:3001
Ready to launch applications!
```

### 3. Keep Both Servers Running

- **Terminal 1**: Run `npm run dev` (React frontend)
- **Terminal 2**: Run `node server.js` (Backend app launcher)

## Usage

Once both servers are running, you can say commands like:

- "Open Notepad"
- "Launch Chrome"
- "Start Calculator"
- "Run Spotify"
- "Open Visual Studio Code"

## Supported Applications

The following applications are pre-configured:
- Notepad
- Calculator
- Chrome
- Firefox
- Edge
- VS Code
- Spotify
- Discord
- Steam
- Photoshop
- Excel
- Word
- PowerPoint
- Outlook
- Teams
- Zoom
- WhatsApp
- Telegram
- VLC
- Media Player

## Adding More Applications

Edit `server.js` and add entries to the `APP_MAPPINGS` object:

```javascript
const APP_MAPPINGS = {
  'your-app-name': 'your-app.exe',
  // ...
};
```

## Troubleshooting

- **"Unable to connect to app launcher service"**: Make sure the backend server is running on port 3001
- **"Could not launch [app]"**: The application may not be installed or not in the system PATH
- **Port already in use**: Change the PORT in `server.js` to a different number (e.g., 3002)

