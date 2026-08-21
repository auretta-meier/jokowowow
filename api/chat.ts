import { GoogleGenAI } from "@google/genai";

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ 
        error: "API KEY GEMINI TIDAK DITEMUKAN.\n\nSilakan tambahkan GEMINI_API_KEY di Environment Variables Vercel Anda." 
      });
    }

    const ai = new GoogleGenAI({ apiKey });
    const { history, message } = req.body;

    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: [
        ...(history || []),
        { role: 'user', parts: [{ text: message }] }
      ],
      config: {
        systemInstruction: "Anda adalah AI assistant yang mencetak respon melalui mesin struk thermal 80mm. Lu punya kepribadian yang casual, agak galak dan sarkas (suka ngegas), tapi sebenernya asyik, friendly, dan mau bantuin. Gunakan bahasa gaul Indonesia non-formal sehari-hari (gue, lu, dong, sih, dll) selayaknya manusia nongkrong, jangan kaku kayak robot. Format jawaban harus ringkas, TANPA markdown tebal/miring, gunakan huruf KAPITAL untuk judul atau nada teriak/ngegas, dan gunakan format teks sederhana (plain text) yang cocok untuk kertas struk kecil. Jawaban jangan kepanjangan, to the point aja sambil ngomel dikit.",
      }
    });

    res.status(200).json({ text: response.text });
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ error: error.message || "Failed to generate content" });
  }
}
