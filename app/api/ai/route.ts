import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const SYSTEM_PROMPT = `Kamu adalah AI Konsultan Pertanian TaniPro, asisten cerdas yang membantu petani Indonesia.

Keahlianmu meliputi:
- 🌾 Teknik budidaya tanaman (sayuran, buah, biji-bijian, rempah)
- 💊 Penanganan hama dan penyakit tanaman
- 💧 Manajemen irigasi dan nutrisi tanah
- 💰 Strategi harga komoditas dan analisis pasar
- 📦 Tips pascapanen dan penyimpanan
- 🌤️ Panduan bercocok tanam sesuai musim
- 📊 Perhitungan biaya produksi dan keuntungan

Panduan menjawab:
- Gunakan bahasa Indonesia yang ramah, jelas, dan mudah dipahami petani
- Berikan jawaban praktis dan actionable
- Sertakan angka/data konkret jika relevan
- Gunakan emoji untuk membuat respons lebih menarik
- Kalau ditanya soal harga, berikan range estimasi pasar umum Indonesia
- Jika tidak tahu jawaban pasti, akui dan berikan saran umum
- Maksimal 400 kata per jawaban kecuali diminta lebih detail`;

export async function POST(req: NextRequest) {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    console.error('[AI] GEMINI_API_KEY is undefined. Make sure .env.local exists and server was restarted.');
    return NextResponse.json(
      { error: 'GEMINI_API_KEY belum dikonfigurasi di server.' },
      { status: 500 },
    );
  }

  try {
    const { messages, userContext } = await req.json();

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

    const contextualPrompt = userContext
      ? `${SYSTEM_PROMPT}\n\nKonteks Petani:\n- Nama: ${userContext.name}\n- Komoditas: ${userContext.commodities?.join(', ') ?? 'belum diisi'}\n- Lokasi: ${userContext.city ?? 'belum diisi'}, ${userContext.province ?? ''}`
      : SYSTEM_PROMPT;

    const history = messages.slice(0, -1).map((m: { role: string; content: string }) => ({
      role: m.role === 'user' ? 'user' : 'model',
      parts: [{ text: m.content }],
    }));

    const chat = model.startChat({
      history: [
        { role: 'user', parts: [{ text: 'Siapa kamu?' }] },
        {
          role: 'model',
          parts: [
            {
              text:
                contextualPrompt +
                '\n\nSaya adalah AI Konsultan Pertanian TaniPro! Saya siap membantu kamu dengan pertanyaan seputar pertanian, harga komoditas, penanganan hama, dan strategi bisnis pertanian. Apa yang bisa saya bantu?',
            },
          ],
        },
        ...history,
      ],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 1024,
      },
    });

    const lastMessage = messages[messages.length - 1];
    const result = await chat.sendMessage(lastMessage.content);
    const response = result.response.text();

    return NextResponse.json({ response });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error('[AI] Error detail:', message);
    return NextResponse.json(
      { error: `Gemini error: ${message}` },
      { status: 500 },
    );
  }
}