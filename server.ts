import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";

async function startServer() {
  const app = express();
  const PORT = 3000;
  
  app.use(express.json());

  let aiClient: GoogleGenAI | null = null;
  function getAi() {
    if (!aiClient) {
        if (!process.env.GEMINI_API_KEY) {
            throw new Error("API KEY GEMINI TIDAK DITEMUKAN.\n\nSilakan tambahkan GEMINI_API_KEY di panel Secrets (Pengaturan) AI Studio Anda.");
        }
        aiClient = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    }
    return aiClient;
  }

  // API routes
  app.post("/api/chat", async (req, res) => {
    try {
      const ai = getAi();
      const { history, message } = req.body;
      
      const response = await ai.models.generateContent({
          model: 'gemini-3.6-flash',
          contents: [
              ...history,
              { role: 'user', parts: [{ text: message }] }
          ],
          config: {
              systemInstruction: "Anda adalah AI assistant. Lu punya kepribadian yang casual, agak galak dan sarkas (suka ngegas), tapi sebenernya asyik, friendly, dan mau bantuin. Gunakan bahasa gaul Indonesia non-formal sehari-hari (gue, lu, dong, sih, dll). Format jawaban harus ringkas, TANPA markdown tebal/miring. Jawab secara langsung murni teks balasan. SANGAT PENTING: DILARANG KERAS menambahkan header, footer, garis pemisah, atau embel-embel seperti '---STRUK---' atau 'AI:'. Jawab langsung ke intinya.",
          }
      });

      res.json({ text: response.text });
    } catch (error: any) {
      console.error(error);
      res.status(500).json({ error: error.message || "Failed to generate content" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
