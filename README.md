# JARVIS AI Interface

A fully functional JARVIS AI interface inspired by Iron Man, with voice recognition, text-to-speech, and holographic UI.

## Features

- 🎤 **Voice Recognition**: Say "Hey JARVIS" to activate voice commands
- 🔊 **Text-to-Speech**: JARVIS responds with voice
- 🎨 **Holographic Interface**: Animated 3D displays and visualizations
- 📊 **System Monitoring**: Real-time status panels and diagnostics
- 💬 **Interactive Commands**: Type or speak commands to JARVIS

## How to Run

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn package manager

### Installation & Running

1. **Install dependencies** (if needed):
   ```bash
   npm install
   ```

2. **Start the development server**:
   ```bash
   npm run dev
   ```

3. **Open your browser**:
   - The app will automatically open, or go to: `http://localhost:5173`
   - **Important**: Allow microphone access when prompted by your browser

## Voice Commands

### Activation
- Say **"Hey JARVIS"** to activate voice command mode
- Or click the microphone button manually

### Example Commands
- "System status"
- "Weather report"
- "Power levels"
- "Run diagnostics"
- "What time is it?"
- "Analyze the environment"
- "Prepare the suit"

### Quick Tips
- Speak clearly and wait for JARVIS to finish responding
- JARVIS will automatically listen for "Hey JARVIS" wake word
- You can also type commands in the command input field
- Click the quick command buttons for instant responses

## Browser Compatibility

**Best experience with:**
- Google Chrome (recommended)
- Microsoft Edge
- Safari (macOS/iOS)

**Note**: Speech recognition works best in Chrome and Edge browsers. Make sure to:
1. Allow microphone permissions when prompted
2. Use HTTPS or localhost (required for Web Speech API)
3. Have a stable internet connection (speech recognition uses cloud services)

## Troubleshooting

### Voice recognition not working?
- Check if your browser supports Web Speech API
- Ensure microphone permissions are granted
- Try refreshing the page and allowing permissions again
- Check if your microphone is working in other apps

### JARVIS not speaking?
- Check your system volume
- Ensure the page isn't muted in browser
- Some browsers require user interaction before playing audio

### Development Issues?
- Clear browser cache and reload
- Check console for any errors
- Make sure you're using a modern browser version

## Setup Gemini API

1. **Get API Key:**
   - Go to https://makersuite.google.com/app/apikey
   - Sign in and create a new API key
   - Copy the API key

2. **Update API Key:**
   - Open `utils/gemini.ts`
   - Replace `YOUR_API_KEY_HERE` with your actual API key

3. **Enable API (if needed):**
   - Go to https://console.cloud.google.com/
   - Navigate to APIs & Services → Library
   - Search for "Generative Language API"
   - Click Enable

## Technology Stack

- React
- TypeScript
- Motion (Framer Motion)
- Tailwind CSS
- Web Speech API (Recognition & Synthesis)
- Google Gemini API
- Vite

---

**Enjoy your JARVIS AI experience!** 🚀
