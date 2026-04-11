import { GoogleGenerativeAI } from '@google/generative-ai';
import Story from '../models/storyModel.js';
import FamilyCircle from '../models/familyCircleModel.js';

// Basic HTML Stripper for Defense in Depth
const stripHtml = (html) => {
  return html.replace(/<[^>]*>?/gm, '');
};

//  SECURITY FIX: In-Memory Rate Limiter to protect Gemini API Quota
const aiRateLimits = new Map();
const RATE_LIMIT_WINDOW_MS = 10000; // 10 seconds cooldown per user

const checkRateLimit = (userId) => {
  const now = Date.now();
  const lastReq = aiRateLimits.get(String(userId)) || 0;
  if (now - lastReq < RATE_LIMIT_WINDOW_MS) {
    const timeLeft = Math.ceil((RATE_LIMIT_WINDOW_MS - (now - lastReq)) / 1000);
    throw new Error(`RATE_LIMIT:${timeLeft}`);
  }
  aiRateLimits.set(String(userId), now);
};

// ==============================================
// 🔮 1. THE FAMILY ORACLE (Chat with History)
// ==============================================
export const askOracle = async (req, res) => {
  try {
    if (!process.env.GEMINI_API_KEY) {
      console.error("❌ CRITICAL ERROR: GEMINI_API_KEY is missing or undefined!");
      return res.status(500).json({ message: "Internal server error" });
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const { circleId, question } = req.body;

    if (!circleId || !question) {
      return res.status(400).json({ message: "Circle ID and Question are required!" });
    }

    // SECURITY FIX: Payload Size Limit (Token Protection)
    if (String(question).trim().length > 300) {
      return res.status(400).json({ message: "Question is too long (Max 300 characters)." });
    }

    //  SECURITY FIX: Apply Rate Limiter
    checkRateLimit(req.user._id);

    const isMember = await FamilyCircle.exists({ _id: circleId, members: req.user._id });
    if (!isMember) {
      return res.status(403).json({ message: "The Oracle only speaks to verified family members." });
    }

    const stories = await Story.find({
      $or: [{ originCircleId: circleId }, { sharedWith: circleId }]
    }).populate('user', 'name');

    if (!stories || stories.length === 0) {
      return res.status(200).json({ answer: "Hmm... The vault is empty right now. Add some memories first so I can weave a story for you! ✨" });
    }

    const familyHistory = stories.map((s, index) => {
      const dateObj = s.milestoneDate ? new Date(s.milestoneDate) : new Date(s.createdAt);
      const date = dateObj.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
      const author = s.user ? s.user.name : "A Family Member";
      return `[Memory ${index + 1}] Title: ${s.title} | Date: ${date} | Added by: ${author} | Details: ${s.content}`;
    }).join('\n\n');

    const prompt = `You are 'The Family Oracle', an emotional, warm, and wise family historian for the Legacy Trunk app. 
    Below is the private history of this family extracted from their digital vault:
    
    --- FAMILY HISTORY ---
    ${familyHistory}
    ----------------------
    
    User's Question: "${question}"
    
    Instructions:
    1. Answer the user's question accurately based ONLY on the provided family history. Do not invent facts.
    2. Keep the tone emotional, nostalgic, and warm.
    3. Use a mix of English and Hindi words (Hinglish) if it feels natural.
    4. If the answer cannot be found, politely say: "I've searched the trunk, but it seems this memory hasn't been added yet."
    5. Keep it concise but magical. Add a couple of warm emojis.
    6. CRITICAL: Do NOT output any HTML tags like <script>, <img>, or <iframe>. Only plain text.`;

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    const result = await model.generateContent(prompt);
    
    if (!result || !result.response) throw new Error("Gemini API returned an empty response.");
    
    const safeAnswer = stripHtml(result.response.text());
    res.status(200).json({ answer: safeAnswer });

  } catch (error) {
    if (error.message.startsWith('RATE_LIMIT')) {
      const seconds = error.message.split(':')[1];
      return res.status(429).json({ message: `The Oracle needs to rest. Please wait ${seconds} seconds.` });
    }
    console.error("🔮 ORACLE ERROR:", error.message);
    res.status(500).json({ message: "The Oracle is resting right now." });
  }
};

// ==============================================
//  2. AI COPILOT: ENHANCE STORY
// ==============================================
export const enhanceStory = async (req, res) => {
  try {
    if (!process.env.GEMINI_API_KEY) return res.status(500).json({ message: "Internal server error" });
    
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const { text, tone } = req.body; 

    if (!text) return res.status(400).json({ message: "Rough text is required!" });

    //  SECURITY FIX: Payload Size Limit (Max 3000 chars for enhancement)
    if (String(text).trim().length > 3000) {
      return res.status(400).json({ message: "Text is too long for enhancement (Max 3000 characters)." });
    }

    //  SECURITY FIX: Apply Rate Limiter
    checkRateLimit(req.user._id);

    const selectedTone = tone || "Nostalgic and Warm";

    const prompt = `You are an expert storyteller for a family vault app. 
    Take the following rough notes written by a user and transform them into a beautifully written, engaging paragraph.
    
    Rough Notes: "${text}"
    Target Tone: ${selectedTone}
    
    Instructions:
    1. Do not invent new facts, just polish and expand the existing notes beautifully.
    2. Write in a conversational "Hinglish" (Hindi + English) style that Indian families use on WhatsApp.
    3. Add suitable emojis.
    4. Output ONLY the finalized story paragraph, nothing else. No introductory text.
    5. CRITICAL: Do NOT output any HTML tags. Only plain text.`;

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    const result = await model.generateContent(prompt);
    
    const safeText = stripHtml(result.response.text().trim());
    res.status(200).json({ enhancedText: safeText });

  } catch (error) {
    if (error.message.startsWith('RATE_LIMIT')) {
      const seconds = error.message.split(':')[1];
      return res.status(429).json({ message: `Please wait ${seconds} seconds before enhancing again.` });
    }
    console.error("✨ ENHANCE ERROR:", error.message);
    res.status(500).json({ message: "Failed to enhance story." });
  }
};

// ==============================================
//  3. AI COPILOT: GENERATE TITLE
// ==============================================
export const generateTitle = async (req, res) => {
  try {
    if (!process.env.GEMINI_API_KEY) return res.status(500).json({ message: "Internal server error" });
    
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const { storyText } = req.body;

    if (!storyText) return res.status(400).json({ message: "Story text is required to generate a title!" });

    //  SECURITY FIX: Payload Size Limit (Max 5000 chars to read for title)
    if (String(storyText).trim().length > 5000) {
      return res.status(400).json({ message: "Story is too long for title generation (Max 5000 characters)." });
    }

    //  SECURITY FIX: Apply Rate Limiter
    checkRateLimit(req.user._id);

    const prompt = `Read the following family story and generate exactly ONE short, catchy, and emotional title for it. 
    
    Story: "${storyText}"
    
    Instructions:
    1. Keep it under 6 words if possible.
    2. Include one relevant emoji at the end.
    3. Output ONLY the title string, no quotes, no markdown, no intro text.
    4. CRITICAL: Do NOT output any HTML tags.`;

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    const result = await model.generateContent(prompt);
    
    let cleanTitle = stripHtml(result.response.text().replace(/["*]/g, '').trim());

    res.status(200).json({ title: cleanTitle });

  } catch (error) {
    if (error.message.startsWith('RATE_LIMIT')) {
      const seconds = error.message.split(':')[1];
      return res.status(429).json({ message: `Please wait ${seconds} seconds before generating another title.` });
    }
    console.error("🪄 TITLE ERROR:", error.message);
    res.status(500).json({ message: "Failed to generate title." });
  }
};