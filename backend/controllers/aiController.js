import { GoogleGenerativeAI } from '@google/generative-ai';
import Story from '../models/storyModel.js';

// ==============================================
// 🔮 1. THE FAMILY ORACLE (Chat with History)
// ==============================================
export const askOracle = async (req, res) => {
  try {
    if (!process.env.GEMINI_API_KEY) {
      console.error("❌ CRITICAL ERROR: GEMINI_API_KEY is missing or undefined!");
      return res.status(500).json({ message: "API Key not loaded in backend." });
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const { circleId, question } = req.body;

    if (!circleId || !question) {
      return res.status(400).json({ message: "Circle ID and Question are required!" });
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
    5. Keep it concise but magical. Add a couple of warm emojis.`;

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    const result = await model.generateContent(prompt);
    
    if (!result || !result.response) throw new Error("Gemini API returned an empty response.");
    
    res.status(200).json({ answer: result.response.text() });

  } catch (error) {
    console.error("🔮 ORACLE ERROR:", error);
    res.status(500).json({ message: "The Oracle is resting right now.", error: error.message });
  }
};

// ==============================================
// ✨ 2. AI COPILOT: ENHANCE STORY
// ==============================================
export const enhanceStory = async (req, res) => {
  try {
    if (!process.env.GEMINI_API_KEY) return res.status(500).json({ message: "API Key missing." });
    
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const { text, tone } = req.body; // Tone can be 'Funny', 'Emotional', or 'Nostalgic'

    if (!text) return res.status(400).json({ message: "Rough text is required!" });

    const selectedTone = tone || "Nostalgic and Warm";

    const prompt = `You are an expert storyteller for a family vault app. 
    Take the following rough notes written by a user and transform them into a beautifully written, engaging paragraph.
    
    Rough Notes: "${text}"
    Target Tone: ${selectedTone}
    
    Instructions:
    1. Do not invent new facts, just polish and expand the existing notes beautifully.
    2. Write in a conversational "Hinglish" (Hindi + English) style that Indian families use on WhatsApp.
    3. Add suitable emojis.
    4. Output ONLY the finalized story paragraph, nothing else. No introductory text like "Here is your story:".`;

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    const result = await model.generateContent(prompt);
    
    res.status(200).json({ enhancedText: result.response.text().trim() });

  } catch (error) {
    console.error("✨ ENHANCE ERROR:", error);
    res.status(500).json({ message: "Failed to enhance story.", error: error.message });
  }
};

// ==============================================
// 🪄 3. AI COPILOT: GENERATE TITLE
// ==============================================
export const generateTitle = async (req, res) => {
  try {
    if (!process.env.GEMINI_API_KEY) return res.status(500).json({ message: "API Key missing." });
    
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const { storyText } = req.body;

    if (!storyText) return res.status(400).json({ message: "Story text is required to generate a title!" });

    const prompt = `Read the following family story and generate exactly ONE short, catchy, and emotional title for it. 
    
    Story: "${storyText}"
    
    Instructions:
    1. Keep it under 6 words if possible.
    2. Include one relevant emoji at the end.
    3. Output ONLY the title string, no quotes, no markdown, no intro text.`;

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    const result = await model.generateContent(prompt);
    
    // Remove any accidental quotes or asterisks the AI might add
    let cleanTitle = result.response.text().replace(/["*]/g, '').trim();

    res.status(200).json({ title: cleanTitle });

  } catch (error) {
    console.error("🪄 TITLE ERROR:", error);
    res.status(500).json({ message: "Failed to generate title.", error: error.message });
  }
};

