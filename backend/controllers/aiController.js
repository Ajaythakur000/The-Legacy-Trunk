import { GoogleGenerativeAI } from '@google/generative-ai';
import Story from '../models/storyModel.js';

export const askOracle = async (req, res) => {
  try {
    // 🔥 FIX 1: Check if API Key is actually loaded from .env
    if (!process.env.GEMINI_API_KEY) {
      console.error("❌ CRITICAL ERROR: GEMINI_API_KEY is missing or undefined! Check your .env file.");
      return res.status(500).json({ message: "API Key not loaded in backend." });
    }

    // 🔥 FIX 2: Initialize inside the function to ensure .env is fully loaded
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

    const { circleId, question } = req.body;

    if (!circleId || !question) {
      return res.status(400).json({ message: "Circle ID and Question are required!" });
    }

    // 1️⃣ DATABASE FETCH
    const stories = await Story.find({
      $or: [
        { originCircleId: circleId },
        { sharedWith: circleId }
      ]
    }).populate('user', 'name');

    if (!stories || stories.length === 0) {
      return res.status(200).json({ 
        answer: "Hmm... The vault is empty right now. Add some memories first so I can weave a story for you! ✨" 
      });
    }

    // 2️⃣ CONTEXT BUILDER
    const familyHistory = stories.map((s, index) => {
      const dateObj = s.milestoneDate ? new Date(s.milestoneDate) : new Date(s.createdAt);
      const date = dateObj.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
      const author = s.user ? s.user.name : "A Family Member";
      
      return `[Memory ${index + 1}] Title: ${s.title} | Date: ${date} | Added by: ${author} | Details: ${s.content}`;
    }).join('\n\n');

    // 3️⃣ PROMPT ENGINEERING
    const prompt = `You are 'The Family Oracle', an emotional, warm, and wise family historian for the Legacy Trunk app. 
    Below is the private history of this family extracted from their digital vault:
    
    --- FAMILY HISTORY ---
    ${familyHistory}
    ----------------------
    
    User's Question: "${question}"
    
    Instructions:
    1. Answer the user's question accurately based ONLY on the provided family history. Do not invent facts.
    2. Keep the tone emotional, nostalgic, and warm, like a wise elder recounting a memory.
    3. Use a mix of English and Hindi words (Hinglish) if it feels natural (e.g., "Arre wah!", "Kya din the wo!"), but keep it classy.
    4. If the answer cannot be found in the history, politely say: "I've searched the trunk, but it seems this memory hasn't been added yet. Perhaps it's time to write it down?"
    5. Keep it concise but magical. Add a couple of warm emojis.`;

    // 4️⃣ CALL GEMINI
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    const result = await model.generateContent(prompt);
    
    // Safety check just in case Gemini blocks the response
    if (!result || !result.response) {
        throw new Error("Gemini API returned an empty response.");
    }
    
    const responseText = result.response.text();

    // 5️⃣ RETURN ANSWER TO FRONTEND
    res.status(200).json({ answer: responseText });

  } catch (error) {
    // 🔥 FIX 3: Print the ACTUAL error in the backend terminal
    console.error("🔮 ORACLE FATAL ERROR 🔮");
    console.error(error);
    res.status(500).json({ message: "The Oracle is resting right now.", error: error.message });
  }
};