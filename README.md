# AI Clip Generator & Social Auto-Shorts 🎬

A polished, full-stack React and Node20/Express web application that lets you load any YouTube video, clip relevant highlights, translate transcripts, and simulate customized social shorts with custom brand overlays.

---

## 🚀 How to Export this Code to your GitHub Repository

Right now, your GitHub repository (`https://github.com/sunil1999999/ai-clip-generator`) contains an empty project with no code. To run this app locally, you need to export the code from Google AI Studio.

Here is the easiest way to do it:

### Option A: Direct Download (ZIP)
1. In the **Google AI Studio Build** interface, look at the **top bar** or **Settings (Gear Icon)**.
2. Click **Export** ➡️ **Download as ZIP**.
3. Extract the contents of this ZIP file directly into your local `C:\Users\crypt\ai-clip-generator\` folder. Overwrite any existing files (like `package.json` if prompted).
4. Now, your local directory will contain all files belonging to this project (`server.ts`, `src/`, `package.json`, etc.).

### Option B: Push using Git manually
If you've downloaded the ZIP to a temporary directory, you can copy files into your repository folder, and then run these commands inside `C:\Users\crypt\ai-clip-generator\`:
```bash
git add .
git commit -m "Export AI Clip Generator applet"
git push origin main
```

---

## 🛠️ How to Run Locally

Once you have unzipped or pushed the files to your folder, follow these steps to run the application on your computer:

### 1. Install Dependencies
Open your terminal (Command Prompt, PowerShell, or Git Bash) in your project folder (`C:\Users\crypt\ai-clip-generator\`) and run:
```bash
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to a new file named `.env`:
```bash
copy .env.example .env
```
*(Or manually create a `.env` file in the root folder).*

Edit the `.env` file and fill in your Gemini API key:
```env
GEMINI_API_KEY="your_actual_gemini_api_key_here"
APP_URL="http://localhost:3000"
```
> **How to get a Gemini API Key?** Go to [Google AI Studio](https://aistudio.google.com/) and click on "Get API Key" to generate a free key!

### 3. Run in Development Mode
Start the full-stack development server by running:
```bash
npm run dev
```

Your app will start up, compiling both the client-side React UI and the server-side Express APIs. Open your browser and go to:
**[http://localhost:3000](http://localhost:3000)**

---

## 📦 Production Deployment

To build and run the applet in production:

1. **Build the production bundle**:
   ```bash
   npm run build
   ```
   This compiles the React website into a static `dist/` directory and bundles the Express `server.ts` into a fast, single file `dist/server.cjs`.

2. **Start the production server**:
   ```bash
   npm run start
   ```

---

## 🌟 Key Features

- **Multi-language Transcripts**: Select preset audio-vlogs, paste standard YouTube links, and generate or read multi-format transcripts.
- **AI Highlight Clipping**: Auto-clip custom video ranges dynamically with starting and ending offsets.
- **Dual Formats**: Switch between standard Widescreen (16:9) and Mobile Portrait Short (9:16) crop previews synchronously.
- **Sound & Voice Modes**: Switch between simulated voiceovers (TTS), Retro voice modulators, or playing the original video audio track directly.
- **Brand Watermarking**: Customize branding, insert floating watermarks, and change positions dynamically.
- **Full-Responsive Layout**: Clean desktop and mobile layout optimized for zero flicker.
