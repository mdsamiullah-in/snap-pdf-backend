import { GoogleGenerativeAI } from '@google/generative-ai';
import { generateChatPrompt } from '../models/aiPrompts.js';
import ChatModel from '../models/chat.models.js';

const GEMINI_API_KEY = 'AIzaSyBaWDDh2FURIThDoZsGrrnW1pHQi5tGmvA';
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

const cleanAIText = (raw) =>
  raw.replace(/```json/g, '').replace(/```/g, '').replace(/^[^{\[]+/, '').trim();

const tryParseJSON = (text) => {
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
};

const autoFallbackResponse = (question) => ({
  source: 'fallback',
  answer: `I'm sorry, I couldn't fully process your request. Please try rephrasing or ask a different question related to: "${question}".`,
});

const maxRetries = 2;

const generateGeneralPrompt = (question) =>
  `You are a smart AI assistant. Answer the following question:\n\n${question}`;

/**
 * POST /api/chat/
 * Accepts an array of chat prompts, returns Gemini answers and saves to DB
 */
export const getAIResponse = async (req, res) => {
  const chatArray = req.body;

  if (!Array.isArray(chatArray) || chatArray.length === 0) {
    return res.status(400).json({
      message: '❌ Request body must be an array of chat objects.',
    });
  }

  const savedChats = [];

  for (const chat of chatArray) {
    const {
      userQuestion,
      pdfText = "",
      fileId,
      fileTitle = "",
      config = {},
    } = chat;

    if (!userQuestion?.trim() || !fileId) {
      console.warn("⚠️ Skipped due to missing userQuestion or fileId.");
      continue;
    }

    // 👇 Choose between document-based or general prompt
    const prompt = pdfText.trim()
      ? generateChatPrompt(userQuestion, pdfText)
      : generateGeneralPrompt(userQuestion);

    let attempt = 0;
    let rawText = '';
    let finalAnswer = autoFallbackResponse(userQuestion);

    while (attempt <= maxRetries) {
      try {
        const result = await model.generateContent({
          contents: [{ role: 'user', parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: config.temperature || 0.4,
            maxOutputTokens: config.maxTokens || 2048,
            topK: config.topK || 40,
            topP: config.topP || 0.95,
            stopSequences: config.stopSequences || [],
          },
        });

        const response = result.response;
        rawText = response.text();
        const cleaned = cleanAIText(rawText);
        const parsed = tryParseJSON(cleaned);

        if (
          parsed &&
          typeof parsed === 'object' &&
          typeof parsed.source === 'string' &&
          typeof parsed.answer === 'string'
        ) {
          finalAnswer = {
            source: pdfText.trim() ? 'document' : 'general',
            answer: parsed.answer,
          };
        } else {
          finalAnswer = {
            source: 'parse-error',
            answer: `AI response was not in valid JSON format. Raw text: ${rawText}`,
          };
        }

        break;
      } catch (error) {
        console.error(`❌ Gemini attempt ${attempt + 1} failed:`, error.message || error);
        if (error.response?.promptFeedback?.blockReason) {
          return res.status(400).json({
            source: 'safety-system',
            answer: `Blocked by Gemini safety filters: ${error.response.promptFeedback.blockReason}`,
          });
        }
        attempt++;
      }
    }

    // ✅ Save to DB
    try {
      const saved = await ChatModel.create({
        question: userQuestion,
        answer: finalAnswer.answer,
        source: finalAnswer.source,
        fileId,
        fileTitle,
        user: req.user?.id || null,
      });

      savedChats.push(saved);
    } catch (err) {
      console.error("❌ Failed to save chat to DB:", err.message);
    }
  }

  return res.status(200).json({
    message: '✅ All AI responses processed and saved.',
    data: savedChats,
  });
};


/**
 * GET /api/chat/:fileId
 * Fetch chat history for a user for a given file
 */
export const getChatsByFileAndUser = async (req, res) => {
  const { fileId } = req.params;
  const userId = req.user?.id;

  if (!userId) {
    return res.status(401).json({ error: "❌ Unauthorized. User not logged in." });
  }

  if (!fileId) {
    return res.status(400).json({ error: "❌ File ID is required." });
  }

  try {
    const chats = await ChatModel.find({ user: userId, fileId }).sort({ createdAt: 1 });
    return res.status(200).json({ chats });
  } catch (err) {
    console.error("❌ Error fetching chats:", err.message);
    return res.status(500).json({ error: "❌ Failed to load chats." });
  }
};


/**
 * DELETE /api/chat/:chatId
 * Delete a single chat entry (only if owned by user)
 */
export const deleteChat = async (req, res) => {
  const { chatId } = req.params;
  const userId = req.user?.id;

  if (!userId) {
    return res.status(401).json({ error: "❌ Unauthorized. User not logged in." });
  }

  try {
    const chat = await ChatModel.findOne({ _id: chatId, user: userId });

    if (!chat) {
      return res.status(404).json({ error: "❌ Chat not found or access denied." });
    }

    await ChatModel.deleteOne({ _id: chatId });
    return res.status(200).json({ message: "✅ Chat deleted." });
  } catch (err) {
    console.error("❌ Failed to delete chat:", err.message);
    return res.status(500).json({ error: "❌ Internal server error." });
  }
};
