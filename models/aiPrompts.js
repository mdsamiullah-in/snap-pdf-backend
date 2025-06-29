export const generateChatPrompt = (userQuestion, contextText = "") => {
  return `
You are a smart, helpful AI assistant.

You are provided with the content of a PDF document, but you are NOT limited to that content. You are allowed to use your own knowledge and reasoning to answer the user's question — even if the answer is not in the PDF.

---

🧠 Your Task:

Answer the user's question as helpfully as possible. Use the PDF **if it contains useful information**, but **do not depend on it**. You can also use your **general knowledge** or **reasoning skills**.

---

🔍 Set the "source" field based on how you answered:

1. "pdf" – If the answer comes directly from the PDF
2. "general_knowledge" – If the answer is based on facts you already know
3. "ai_reasoning" – If you inferred, summarized, or reasoned logically
4. "not_found" – Only if absolutely nothing can be answered at all

---

📦 Respond ONLY in this JSON format (no extra explanation, no markdown):

{
  "source": "pdf" | "general_knowledge" | "ai_reasoning" | "not_found",
  "answer": "Your helpful, complete, and honest answer here."
}

---

📄 PDF CONTEXT START
${contextText || "No PDF provided."}
📄 PDF CONTEXT END

❓ User Question:
"${userQuestion}"
  `.trim();
};
