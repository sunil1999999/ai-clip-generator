import express from "express";
import path from "path";
import dotenv from "dotenv";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Database file setup
const DB_PATH = path.join(process.cwd(), "db.json");

interface UserData {
  email: string;
  passwordHash: string;
  name: string;
  credits: number;
  tier: string;
  recoveryCode?: string;
}

interface ProjectData {
  id: string;
  title: string;
  videoUrl: string;
  topic: string;
  clips: any[];
  tags: string[];
  speakers: any[];
  timestamp: string;
  userId: string;
}

interface TemplateData {
  id: string;
  name: string;
  fontFamily: string;
  fontSize: number;
  primaryColor: string;
  strokeColor: string;
  fontCase: string;
  backgroundColor: string;
  logoUrl?: string;
  logoPosition?: string;
  userId: string;
}

interface DBType {
  users: Record<string, UserData>;
  projects: ProjectData[];
  templates: TemplateData[];
}

function loadDB(): DBType {
  try {
    if (fs.existsSync(DB_PATH)) {
      const raw = fs.readFileSync(DB_PATH, "utf-8");
      return JSON.parse(raw);
    }
  } catch (e) {
    console.warn("DB load failed, resetting with fallback default state:", e);
  }
  const defaultDB: DBType = { users: {}, projects: [], templates: [] };
  fs.writeFileSync(DB_PATH, JSON.stringify(defaultDB, null, 2), "utf-8");
  return defaultDB;
}

function saveDB(data: DBType) {
  try {
    fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), "utf-8");
  } catch (e) {
    console.error("Critical: Failed to save server-side DB:", e);
  }
}

// REGISTER SECURE AUTH & PLATFORM MANAGEMENT APIS
app.post("/api/auth/register", (req, res) => {
  const { email, password, name } = req.body;
  if (!email || !password || !name) {
    return res.status(400).json({ success: false, error: "Please provide all registration details (email, password, name)" });
  }
  const db = loadDB();
  const lowerEmail = email.toLowerCase().trim();
  if (db.users[lowerEmail]) {
    return res.status(400).json({ success: false, error: "An account with this email identifier already exists." });
  }
  db.users[lowerEmail] = {
    email: lowerEmail,
    passwordHash: password, // simple storage hash for demo sandbox
    name,
    credits: 80, // 80 free credits
    tier: "starter"
  };
  saveDB(db);
  res.json({ success: true, user: { email: lowerEmail, name, credits: 80, tier: "starter" } });
});

app.post("/api/auth/login", (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ success: false, error: "Please deliver credential parameters." });
  }
  const db = loadDB();
  const lowerEmail = email.toLowerCase().trim();
  const user = db.users[lowerEmail];
  if (!user || user.passwordHash !== password) {
    return res.status(401).json({ success: false, error: "Invalid email structure or credentials. Please check password." });
  }
  res.json({ success: true, user: { email: user.email, name: user.name, credits: user.credits, tier: user.tier } });
});

app.post("/api/auth/profile", (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ success: false });
  const db = loadDB();
  const user = db.users[email.toLowerCase().trim()];
  if (!user) return res.status(404).json({ success: false, error: "No profile corresponding directly to this user." });
  res.json({ success: true, user: { email: user.email, name: user.name, credits: user.credits, tier: user.tier } });
});

app.post("/api/auth/recover", (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ success: false, error: "Send corresponding account email." });
  const db = loadDB();
  const lowerEmail = email.toLowerCase().trim();
  const user = db.users[lowerEmail];
  if (!user) {
    return res.status(404).json({ success: false, error: "Given email is not in use." });
  }
  const code = "VIRA-" + Math.floor(1000 + Math.random() * 9000);
  user.recoveryCode = code;
  saveDB(db);
  res.json({ success: true, code, message: `Access sequence security pin dispatched to accounts register: ${code}` });
});

app.post("/api/auth/reset-password", (req, res) => {
  const { email, code, newPassword } = req.body;
  if (!email || !code || !newPassword) {
    return res.status(400).json({ success: false, error: "Missing required inputs." });
  }
  const db = loadDB();
  const lowerEmail = email.toLowerCase().trim();
  const user = db.users[lowerEmail];
  if (!user) return res.status(404).json({ success: false, error: "No matching record found." });
  if (user.recoveryCode !== code) {
    return res.status(400).json({ success: false, error: "Invalid registration security code." });
  }
  user.passwordHash = newPassword;
  delete user.recoveryCode;
  saveDB(db);
  res.json({ success: true, message: "Security settings successfully restored and updated!" });
});

// CORE SEEDS PROJECTS & CUSTOM TEMPLATES APIS
app.post("/api/projects/list", (req, res) => {
  const { email } = req.body;
  const db = loadDB();
  const lowerEmail = (email || "").toLowerCase().trim();
  const userProjects = db.projects.filter(p => p.userId === lowerEmail);
  res.json({ success: true, projects: userProjects });
});

app.post("/api/projects/save", (req, res) => {
  const { email, project } = req.body;
  if (!email || !project) {
    return res.status(400).json({ success: false, error: "Validation parameters skipped / omitted." });
  }
  const db = loadDB();
  const lowerEmail = email.toLowerCase().trim();
  
  const tagsList = project.tags || ["viral-short"];
  const existingIdx = db.projects.findIndex(p => p.id === project.id && p.userId === lowerEmail);
  
  const savedProject: ProjectData = {
    id: project.id || "proj_" + Date.now(),
    title: project.title || "My Viral Campaign",
    videoUrl: project.videoUrl || "",
    topic: project.topic || "",
    clips: project.clips || [],
    tags: tagsList,
    speakers: project.speakers || [],
    timestamp: project.timestamp || new Date().toISOString().split("T")[0],
    userId: lowerEmail
  };

  if (existingIdx >= 0) {
    db.projects[existingIdx] = savedProject;
  } else {
    db.projects.push(savedProject);
  }
  saveDB(db);
  res.json({ success: true, project: savedProject });
});

app.post("/api/projects/delete", (req, res) => {
  const { email, id } = req.body;
  if (!email || !id) return res.status(400).json({ success: false });
  const db = loadDB();
  const lowerEmail = email.toLowerCase().trim();
  db.projects = db.projects.filter(p => !(p.id === id && p.userId === lowerEmail));
  saveDB(db);
  res.json({ success: true });
});

app.post("/api/templates/list", (req, res) => {
  const { email } = req.body;
  const db = loadDB();
  const lowerEmail = (email || "").toLowerCase().trim();
  const userTemplates = db.templates.filter(t => t.userId === lowerEmail);
  res.json({ success: true, templates: userTemplates });
});

app.post("/api/templates/save", (req, res) => {
  const { email, template } = req.body;
  if (!email || !template) return res.status(400).json({ success: false });
  const db = loadDB();
  const lowerEmail = email.toLowerCase().trim();

  const brandTemplate: TemplateData = {
    id: template.id || "temp_" + Date.now(),
    name: template.name || "My Saved PresetStyle",
    fontFamily: template.fontFamily || "Space Grotesk",
    fontSize: template.fontSize || 22,
    primaryColor: template.primaryColor || "#FFFF00",
    strokeColor: template.strokeColor || "#000000",
    fontCase: template.fontCase || "uppercase",
    backgroundColor: template.backgroundColor || "rgba(0,0,0,0.6)",
    logoUrl: template.logoUrl || "",
    logoPosition: template.logoPosition || "top-right",
    userId: lowerEmail
  };

  const existingIdx = db.templates.findIndex(t => t.id === brandTemplate.id && t.userId === lowerEmail);
  if (existingIdx >= 0) {
    db.templates[existingIdx] = brandTemplate;
  } else {
    db.templates.push(brandTemplate);
  }
  saveDB(db);
  res.json({ success: true, template: brandTemplate });
});

app.post("/api/payment/checkout", (req, res) => {
  const { email, itemType } = req.body;
  if (!email || !itemType) return res.status(400).json({ success: false });
  const db = loadDB();
  const lowerEmail = email.toLowerCase().trim();
  const user = db.users[lowerEmail];
  if (!user) return res.status(404).json({ success: false, error: "User is not logged in." });

  if (itemType === "subscriber-pro") {
    user.credits = (user.credits || 0) + 500;
    user.tier = "pro";
  } else if (itemType === "subscriber-elite") {
    user.credits = (user.credits || 0) + 5000;
    user.tier = "enterprise";
  } else if (itemType === "pay-as-you-go") {
    user.credits = (user.credits || 0) + 120;
  }

  saveDB(db);
  res.json({ success: true, user: { email: user.email, name: user.name, credits: user.credits, tier: user.tier } });
});

// Initialize Gemini client if API key is present
const hasGeminiKey = process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== "MY_GEMINI_API_KEY";
let ai: GoogleGenAI | null = null;
if (hasGeminiKey) {
  try {
    ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
    console.log("Gemini client successfully initialized.");
  } catch (err) {
    console.error("Failed to initialize Gemini client:", err);
  }
} else {
  console.log("No valid GEMINI_API_KEY found, server will run in smart-mock simulation fallback mode.");
}

// Robust helper to extract dynamic JSON blocks from Gemini responses
function extractJSON(text: string): any {
  let raw = text.trim();

  // Try parsing plain JSON first
  try {
    return JSON.parse(raw);
  } catch (e) {
    // Strip markdown formatting fences block if returned by the model
    if (raw.includes("```")) {
      const match = /```(?:json)?\s*([\s\S]*?)\s*```/i.exec(raw);
      if (match && match[1]) {
        try {
          return JSON.parse(match[1].trim());
        } catch (innerErr) {
          raw = match[1].trim(); 
        }
      } else {
        raw = raw.replace(/```json/gi, "").replace(/```/g, "").trim();
        try {
          return JSON.parse(raw);
        } catch (innerErr) {
          // continue
        }
      }
    }

    // Balance brace scanning boundary extraction
    const firstBrace = raw.indexOf('{');
    if (firstBrace !== -1) {
      let depth = 0;
      let matchedIndex = -1;
      for (let i = firstBrace; i < raw.length; i++) {
        if (raw[i] === '{') {
          depth++;
        } else if (raw[i] === '}') {
          depth--;
          if (depth === 0) {
            matchedIndex = i;
            break;
          }
        }
      }
      if (matchedIndex !== -1) {
        const candidate = raw.slice(firstBrace, matchedIndex + 1);
        try {
          return JSON.parse(candidate);
        } catch (braceErr) {
          const lastBrace = raw.lastIndexOf('}');
          if (lastBrace > firstBrace) {
            try {
              return JSON.parse(raw.slice(firstBrace, lastBrace + 1));
            } catch (lastBraceErr) {
              // ignore
            }
          }
        }
      }
    }

    throw e;
  }
}

// 1. Core API endpoint: /api/analyze
app.post("/api/analyze", async (req, res) => {
  const { url = "", topic = "Tech Startup Advice", email = "" } = req.body;
  
  const cost = ai ? 15 : 0;
  const db = loadDB();
  let currentUserRecord = null;
  
  if (email) {
    const lowerEmail = email.toLowerCase().trim();
    currentUserRecord = db.users[lowerEmail];
    if (currentUserRecord) {
      if (currentUserRecord.credits < cost) {
        return res.status(402).json({
          success: false,
          error: `Insufficient credits. This AI analysis costs ${cost} credits. You only have ${currentUserRecord.credits} remaining. Please subscribe or buy pay-as-you-go credits on your dashboard!`
        });
      }
      currentUserRecord.credits -= cost;
      saveDB(db);
    }
  }

  // Extract a fallback subject name based on URL or Topic
  let subject = "AI Revolution";
  if (topic) {
    subject = topic;
  } else if (url) {
    // try to get clean name from domain/path
    try {
      const parsedUrl = new URL(url);
      subject = parsedUrl.pathname.replace(/[^a-zA-Z0-9]/g, " ").trim() || parsedUrl.hostname;
    } catch {
      subject = "My Shared Video";
    }
  }

  // Define fallback mock data in case Gemini is unavailable or errors
  const fallbackClips = [
    {
      id: "clip_1",
      title: `The Trillion Dollar Hook in ${subject}`,
      description: `An high-impact argument detailing why this particular domain is growing at an exponential Rate.`,
      startTime: 0,
      endTime: 22,
      duration: 22,
      viralScore: 98,
      speakerId: "speaker_a",
      facePositionX: 42,
      reason: "High pitch volume, fast pacing words, uses dynamic transition keywords, strong emotional engagement.",
      hashtags: ["viral", "trending", subject.toLowerCase().replace(/\s+/g, ""), "growth"],
      suggestedTitles: [
        `Why ${subject} is about to explode!`,
        "The $100B secret no one is sharing",
        "They didn't see this coming..."
      ],
      transcript: [
        { id: "w1", text: "Look,", start: 0.2, end: 0.6, speakerId: "speaker_a", emoji: "👀" },
        { id: "w2", text: "this", start: 0.7, end: 1.0, speakerId: "speaker_a" },
        { id: "w3", text: "is", start: 1.1, end: 1.3, speakerId: "speaker_a" },
        { id: "w4", text: "the", start: 1.4, end: 1.6, speakerId: "speaker_a" },
        { id: "w5", text: "single", start: 1.7, end: 2.1, speakerId: "speaker_a", emoji: "⚡" },
        { id: "w6", text: "most", start: 2.2, end: 2.5, speakerId: "speaker_a" },
        { id: "w7", text: "important", start: 2.6, end: 3.2, speakerId: "speaker_a", emoji: "💡" },
        { id: "w8", text: "trend", start: 3.3, end: 3.8, speakerId: "speaker_a" },
        { id: "w9", text: "of", start: 3.9, end: 4.1, speakerId: "speaker_a" },
        { id: "w10", text: "our", start: 4.2, end: 4.5, speakerId: "speaker_a" },
        { id: "w11", text: "generation.", start: 4.6, end: 5.5, speakerId: "speaker_a", emoji: "📈" },
        { id: "w12", text: "And", start: 5.9, end: 6.2, speakerId: "speaker_a" },
        { id: "w13", text: "if", start: 6.3, end: 6.5, speakerId: "speaker_a" },
        { id: "w14", text: "you", start: 6.6, end: 6.8, speakerId: "speaker_a" },
        { id: "w15", text: "are", start: 6.9, end: 7.1, speakerId: "speaker_a" },
        { id: "w16", text: "not", start: 7.2, end: 7.5, speakerId: "speaker_a", emoji: "❌" },
        { id: "w17", text: "capitalizing", start: 7.6, end: 8.3, speakerId: "speaker_a" },
        { id: "w18", text: "on", start: 8.4, end: 8.6, speakerId: "speaker_a" },
        { id: "w19", text: "it,", start: 8.7, end: 9.1, speakerId: "speaker_a" },
        { id: "w20", text: "you're", start: 9.4, end: 9.7, speakerId: "speaker_a" },
        { id: "w21", text: "getting", start: 9.8, end: 10.1, speakerId: "speaker_a" },
        { id: "w22", text: "left", start: 10.2, end: 10.5, speakerId: "speaker_a" },
        { id: "w23", text: "behind.", start: 10.6, end: 11.2, speakerId: "speaker_a", emoji: "💨" },
        { id: "w24", text: "It's", start: 11.8, end: 12.1, speakerId: "speaker_a" },
        { id: "w25", text: "mind-blowing,", start: 12.2, end: 13.0, speakerId: "speaker_a", emoji: "🤯", bRoll: "brain-explosion" },
        { id: "w26", text: "completely", start: 13.1, end: 13.6, speakerId: "speaker_a" },
        { id: "w27", text: "wild.", start: 13.7, end: 14.3, speakerId: "speaker_a" },
        { id: "w28", text: "Let's", start: 14.9, end: 15.2, speakerId: "speaker_a" },
        { id: "w29", text: "break", start: 15.3, end: 15.6, speakerId: "speaker_a", bRoll: "crunching-numbers" },
        { id: "w30", text: "down", start: 15.7, end: 15.9, speakerId: "speaker_a" },
        { id: "w31", text: "exactly", start: 16.0, end: 16.4, speakerId: "speaker_a" },
        { id: "w32", text: "how", start: 16.5, end: 16.7, speakerId: "speaker_a" },
        { id: "w33", text: "to", start: 16.8, end: 17.0, speakerId: "speaker_a" },
        { id: "w34", text: "master", start: 17.1, end: 17.6, speakerId: "speaker_a", emoji: "🏆" },
        { id: "w35", text: "this", start: 17.7, end: 17.9, speakerId: "speaker_a" },
        { id: "w36", text: "starting", start: 18.0, end: 18.4, speakerId: "speaker_a" },
        { id: "w37", text: "today.", start: 18.5, end: 19.3, speakerId: "speaker_a" },
        { id: "w38", text: "Ready?", start: 20.0, end: 20.8, speakerId: "speaker_a", emoji: "🔥" }
      ]
    },
    {
      id: "clip_2",
      title: "The Controversial Dilemma",
      description: `Debate discussing the underlying issues or counterarguments regarding ${subject}.`,
      startTime: 30,
      endTime: 53,
      duration: 23,
      viralScore: 91,
      speakerId: "speaker_b",
      facePositionX: 72,
      reason: "Contrast between speakers, emotional tone change, facial expressiveness is high, debate sparks high comment section activity.",
      hashtags: ["controversy", "debate", "deepthought", "opinion"],
      suggestedTitles: [
        "The dark side they hide from you",
        "Why everyone is wrong about this",
        "Stop making this rookie mistake"
      ],
      transcript: [
        { id: "w40", text: "Wait", start: 30.1, end: 30.5, speakerId: "speaker_b", emoji: "🛑" },
        { id: "w41", text: "a", start: 30.6, end: 30.8, speakerId: "speaker_b" },
        { id: "w42", text: "minute.", start: 30.9, end: 31.4, speakerId: "speaker_b" },
        { id: "w43", text: "Are", start: 31.8, end: 32.1, speakerId: "speaker_b" },
        { id: "w44", text: "we", start: 32.2, end: 32.4, speakerId: "speaker_b" },
        { id: "w45", text: "really", start: 32.5, end: 32.9, speakerId: "speaker_b", emoji: "🤔" },
        { id: "w46", text: "going", start: 33.0, end: 33.3, speakerId: "speaker_b" },
        { id: "w47", text: "to", start: 33.4, end: 33.6, speakerId: "speaker_b" },
        { id: "w48", text: "pretend", start: 33.7, end: 34.2, speakerId: "speaker_b" },
        { id: "w49", text: "there's", start: 34.3, end: 34.5, speakerId: "speaker_b" },
        { id: "w50", text: "no", start: 34.6, end: 34.9, speakerId: "speaker_b" },
        { id: "w51", text: "downside?", start: 35.0, end: 35.8, speakerId: "speaker_b", emoji: "⚠️", bRoll: "glitch-warning" },
        { id: "w52", text: "Because", start: 36.3, end: 36.7, speakerId: "speaker_b" },
        { id: "w53", text: "the", start: 36.8, end: 37.0, speakerId: "speaker_b" },
        { id: "w54", text: "truth", start: 37.1, end: 37.5, speakerId: "speaker_b" },
        { id: "w55", text: "is,", start: 37.6, end: 38.0, speakerId: "speaker_b" },
        { id: "w56", text: "it", start: 38.3, end: 38.5, speakerId: "speaker_b" },
        { id: "w57", text: "requires", start: 38.6, end: 39.2, speakerId: "speaker_b" },
        { id: "w58", text: "thousands", start: 39.3, end: 40.0, speakerId: "speaker_b" },
        { id: "w59", text: "of", start: 40.1, end: 40.3, speakerId: "speaker_b" },
        { id: "w60", text: "hours", start: 40.4, end: 40.9, speakerId: "speaker_b", emoji: "⏳" },
        { id: "w61", text: "of", start: 41.0, end: 41.2, speakerId: "speaker_b" },
        { id: "w62", text: "unseen", start: 41.3, end: 41.8, speakerId: "speaker_b" },
        { id: "w63", text: "grind.", start: 41.9, end: 42.6, speakerId: "speaker_b", bRoll: "person-office-late" },
        { id: "w64", text: "Most", start: 43.1, end: 43.5, speakerId: "speaker_b" },
        { id: "w65", text: "people", start: 43.6, end: 44.0, speakerId: "speaker_b", emoji: "👥" },
        { id: "w66", text: "just", start: 44.1, end: 44.3, speakerId: "speaker_b" },
        { id: "w67", text: "want", start: 44.4, end: 44.7, speakerId: "speaker_b" },
        { id: "w68", text: "the", start: 44.8, end: 44.9, speakerId: "speaker_b" },
        { id: "w69", text: "glory.", start: 45.0, end: 45.6, speakerId: "speaker_b", emoji: "✨" },
        { id: "w70", text: "But", start: 46.1, end: 46.4, speakerId: "speaker_b" },
        { id: "w71", text: "are", start: 46.5, end: 46.7, speakerId: "speaker_b" },
        { id: "w72", text: "you", start: 46.8, end: 47.0, speakerId: "speaker_b" },
        { id: "w73", text: "ready", start: 47.1, end: 47.4, speakerId: "speaker_b" },
        { id: "w74", text: "to", start: 47.5, end: 47.7, speakerId: "speaker_b" },
        { id: "w75", text: "fail", start: 47.8, end: 48.3, speakerId: "speaker_b", emoji: "💔" },
        { id: "w76", text: "ten", start: 48.4, end: 48.8, speakerId: "speaker_b" },
        { id: "w77", text: "times", start: 48.9, end: 49.3, speakerId: "speaker_b" },
        { id: "w78", text: "before", start: 49.4, end: 49.8, speakerId: "speaker_b" },
        { id: "w79", text: "getting", start: 49.9, end: 50.3, speakerId: "speaker_b" },
        { id: "w80", text: "one", start: 50.4, end: 50.7, speakerId: "speaker_b" },
        { id: "w81", text: "win?", start: 50.8, end: 51.5, speakerId: "speaker_b", emoji: "🏆" }
      ]
    },
    {
      id: "clip_3",
      title: `The Ultimate ${subject} Solution`,
      description: `Actionable, punchy takeaways summarizing the core answers or frameworks suggested.`,
      startTime: 60,
      endTime: 82,
      duration: 22,
      viralScore: 94,
      speakerId: "speaker_a",
      facePositionX: 42,
      reason: "Provides heavy educational value, structured listing format, high concentration of share-worthy quotes.",
      hashtags: ["learn", "success", "hack", "entrepreneur", subject.replace(/\s+/g, "").toLowerCase()],
      suggestedTitles: [
        "Do this for 30 days straight",
        "The cheat-code to double your results",
        "How to guarantee success"
      ],
      transcript: [
        { id: "w90", text: "So", start: 60.1, end: 60.4, speakerId: "speaker_a", emoji: "🎯" },
        { id: "w91", text: "here", start: 60.5, end: 60.7, speakerId: "speaker_a" },
        { id: "w92", text: "is", start: 60.8, end: 61.0, speakerId: "speaker_a" },
        { id: "w93", text: "the", start: 61.1, end: 61.3, speakerId: "speaker_a" },
        { id: "w94", text: "formula.", start: 61.4, end: 62.1, speakerId: "speaker_a", emoji: "🧪" },
        { id: "w95", text: "Step", start: 62.5, end: 62.9, speakerId: "speaker_a" },
        { id: "w96", text: "one:", start: 63.0, end: 63.6, speakerId: "speaker_a" },
        { id: "w97", text: "eliminate", start: 63.8, end: 64.5, speakerId: "speaker_a", emoji: "🗑️" },
        { id: "w98", text: "all", start: 64.6, end: 64.8, speakerId: "speaker_a" },
        { id: "w99", text: "the", start: 64.9, end: 65.1, speakerId: "speaker_a" },
        { id: "w100", text: "meaningless", start: 65.2, end: 65.9, speakerId: "speaker_a", bRoll: "distraction-scrolling" },
        { id: "w101", text: "noise.", start: 66.0, end: 66.6, speakerId: "speaker_a" },
        { id: "w102", text: "Step", start: 67.2, end: 67.6, speakerId: "speaker_a" },
        { id: "w103", text: "two:", start: 67.7, end: 68.3, speakerId: "speaker_a" },
        { id: "w104", text: "focus", start: 68.5, end: 69.1, speakerId: "speaker_a", emoji: "🔍" },
        { id: "w105", text: "obsessively", start: 69.2, end: 70.0, speakerId: "speaker_a" },
        { id: "w106", text: "on", start: 70.1, end: 70.3, speakerId: "speaker_a" },
        { id: "w107", text: "high-leverage", start: 70.4, end: 71.2, speakerId: "speaker_a" },
        { id: "w108", text: "activities.", start: 71.3, end: 72.1, speakerId: "speaker_a", bRoll: "growth-chart" },
        { id: "w109", text: "And", start: 72.7, end: 73.0, speakerId: "speaker_a" },
        { id: "w110", text: "step", start: 73.1, end: 73.4, speakerId: "speaker_a" },
        { id: "w111", text: "three:", start: 73.5, end: 74.1, speakerId: "speaker_a" },
        { id: "w112", text: "do", start: 74.4, end: 74.7, speakerId: "speaker_a" },
        { id: "w113", text: "not", start: 74.8, end: 75.1, speakerId: "speaker_a" },
        { id: "w114", text: "give", start: 75.2, end: 75.5, speakerId: "speaker_a" },
        { id: "w115", text: "up", start: 75.6, end: 75.9, speakerId: "speaker_a", emoji: "✊" },
        { id: "w116", text: "when", start: 76.0, end: 76.3, speakerId: "speaker_a" },
        { id: "w117", text: "it", start: 76.4, end: 76.6, speakerId: "speaker_a" },
        { id: "w118", text: "grows", start: 76.7, end: 77.1, speakerId: "speaker_a" },
        { id: "w119", text: "difficult.", start: 77.2, end: 77.9, speakerId: "speaker_a" },
        { id: "w120", text: "That is how", start: 78.3, end: 79.2, speakerId: "speaker_a" },
        { id: "w121", text: "winners", start: 79.3, end: 79.9, speakerId: "speaker_a", emoji: "🏆" },
        { id: "w122", text: "are built.", start: 80.0, end: 80.8, speakerId: "speaker_a" }
      ]
    }
  ];

  if (!ai) {
    // Return mock response immediately with adjusted topic subject
    return res.json({
      success: true,
      clips: fallbackClips,
      speakers: [
        { id: "speaker_a", name: "Speaker A(Host)", color: "#FF3366" },
        { id: "speaker_b", name: "Speaker B (Expert)", color: "#33CCFF" }
      ],
      aiPower: "simulated"
    });
  }

  try {
    const prompt = `
      You are an expert social media viral clip analyzer. Take this video details:
      URL: "${url}"
      Topic/Context: "${subject}"
      
      Suggest exactly 3 highly engaging short video clips (length 15 to 25 seconds).
      For each clip, you must output:
      1. A short viral descriptive title.
      2. A logical visual description / summary.
      3. A reason why this part will go viral (Viral hooks context).
      4. An estimated viral score from 80 to 99.
      5. Three alternative high-converting clickbait titles.
      6. A set of 4-5 hashtags.
      7. A short transcript array (of 15 to 20 words total per clip, evenly spaced timestamps starting from the start of the clip) containing word-by-word timestamps, a speakerId ("speaker_a" or "speaker_b"), and optional suggestion of an emoji or a b-roll visual asset keyword.
      
      Output ONLY a clean JSON object adhering to this schema:
      {
        "clips": [
          {
            "id": "string (uniq e.g. clip_1)",
            "title": "string",
            "description": "string",
            "startTime": number (start in seconds, e.g. 5),
            "endTime": number (end in seconds, e.g. 24),
            "duration": number,
            "viralScore": number,
            "reason": "string",
            "hashtags": ["string"],
            "suggestedTitles": ["string"],
            "speakerId": "speaker_a | speaker_b",
            "facePositionX": number (the center coordinate X of speaker from 0 to 100 on screen, e.g. 45),
            "transcript": [
              {
                "id": "string",
                "text": "string",
                "start": number (timestamp in seconds),
                "end": number (timestamp in seconds),
                "speakerId": "speaker_a | speaker_b",
                "emoji": "string (optional single emoji suggestion)",
                "bRoll": "string (optional broll asset keyword description)"
              }
            ]
          }
        ]
      }
      Do not include any letters or formatting like markdown \`\`\`json outside of the pure JSON content string.
    `;

    let response;
    let modelUsed = "gemini-3.5-flash";

    try {
      response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
        }
      });
    } catch (primaryErr: any) {
      const primaryErrStr = String(primaryErr?.message || primaryErr || "");
      const isPrimaryQuota = primaryErrStr.includes("quota") || 
                             primaryErrStr.includes("RESOURCE_EXHAUSTED") || 
                             primaryErrStr.includes("429") || 
                             (primaryErr?.status === "RESOURCE_EXHAUSTED");

      if (isPrimaryQuota) {
        console.warn("gemini-3.5-flash quota exceeded. Attempting fallback query using gemini-3.1-flash-lite...");
        try {
          modelUsed = "gemini-3.1-flash-lite";
          response = await ai.models.generateContent({
            model: "gemini-3.1-flash-lite",
            contents: prompt,
            config: {
              responseMimeType: "application/json",
            }
          });
        } catch (secondaryErr: any) {
          console.warn("Fallback model gemini-3.1-flash-lite also failed. Relying on mock pipelines...");
          throw secondaryErr;
        }
      } else {
        throw primaryErr;
      }
    }

    let rawText = response.text || "{}";
    const parsedData = extractJSON(rawText);
    
    // Supplement data if schema is partially empty
    if (!parsedData.clips || !Array.isArray(parsedData.clips) || parsedData.clips.length === 0) {
      throw new Error("Invalid output layout from Gemini");
    }

    res.json({
      success: true,
      clips: parsedData.clips,
      speakers: [
        { id: "speaker_a", name: "Speaker A", color: "#FF3366" },
        { id: "speaker_b", name: "Speaker B", color: "#33CCFF" }
      ],
      aiPower: modelUsed,
      quotaExceeded: false
    });

  } catch (error: any) {
    console.warn("Gemini query failed or returned bad JSON. Falling back to intelligent mock data. Error:", error);
    
    const errorStr = String(error?.message || error || "");
    const isQuotaError = errorStr.includes("quota") || 
                         errorStr.includes("RESOURCE_EXHAUSTED") || 
                         errorStr.includes("429") || 
                         (error?.status === "RESOURCE_EXHAUSTED");

    // Refund credits since they are viewing mock simulation
    if (email && cost > 0) {
      try {
        const dbRefund = loadDB();
        const refundUser = dbRefund.users[email.toLowerCase().trim()];
        if (refundUser) {
          refundUser.credits = (refundUser.credits || 0) + cost;
          saveDB(dbRefund);
          console.log(`[REFUND SUCCESS] Refunded ${cost} credits to ${email} due to Gemini API failure.`);
        }
      } catch (refundErr) {
        console.error("Failed to execute refund:", refundErr);
      }
    }

    // return smart mock with quota flag if appropriate
    res.json({
      success: true,
      clips: fallbackClips,
      speakers: [
        { id: "speaker_a", name: "Speaker A (Host)", color: "#FF3366" },
        { id: "speaker_b", name: "Speaker B (Expert)", color: "#33CCFF" }
      ],
      aiPower: "fallback-simulation",
      quotaExceeded: isQuotaError,
      errorMessage: error?.message || error?.toString() || "Unknown API error"
    });
  }
});

// 2. Serve static resources in production, or mount Vite SPA in development
async function start() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
    console.log("Vite dev middleware mounted.");
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
    console.log("Static files directory served from /dist in production.");
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`AI Clip Generator server running at http://localhost:${PORT}`);
  });
}

start();
