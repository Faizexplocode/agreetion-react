'use client';

import { useState, useRef, useEffect } from 'react';
import { useAuthContext } from '@/lib/context/AuthContext';
import { findById } from '@/lib/firebase/users';
import type { User } from '@/types';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

const QUICK_PROMPTS = [
  { label: 'Harga Cabai Sekarang', icon: '🌶️', text: 'Berapa estimasi harga cabai merah di pasar saat ini? Kapan waktu terbaik jual?' },
  { label: 'Hama & Penyakit', icon: '🐛', text: 'Bagaimana cara mengatasi hama ulat grayak pada tanaman jagung secara organik?' },
  { label: 'Tips Panen', icon: '🌾', text: 'Apa saja tips memaksimalkan hasil panen dan kualitas komoditas sebelum dijual?' },
  { label: 'Hitung Keuntungan', icon: '💰', text: 'Bantu aku hitung estimasi keuntungan menanam tomat 1 hektar, dari bibit sampai panen.' },
  { label: 'Pupuk Organik', icon: '🌱', text: 'Bagaimana cara membuat pupuk kompos organik sendiri dari sisa tanaman?' },
  { label: 'Musim Tanam', icon: '🌤️', text: 'Komoditas apa yang cocok ditanam di musim hujan untuk hasil optimal?' },
];

function MarkdownText({ text }: { text: string }) {
  // Simple markdown: bold, bullet points, emojis
  const lines = text.split('\n');
  return (
    <div className="space-y-1">
      {lines.map((line, i) => {
        if (!line.trim()) return <br key={i} />;
        // Bold text
        const formatted = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        // Bullet points
        if (line.trim().startsWith('- ') || line.trim().startsWith('• ')) {
          return (
            <div key={i} className="flex gap-2">
              <span className="shrink-0 mt-0.5">•</span>
              <span dangerouslySetInnerHTML={{ __html: formatted.replace(/^[-•]\s*/, '') }} />
            </div>
          );
        }
        return <p key={i} dangerouslySetInnerHTML={{ __html: formatted }} />;
      })}
    </div>
  );
}

export default function AIConsultantPage() {
  const { user } = useAuthContext();
  const [userProfile, setUserProfile] = useState<User | null>(null);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: `Halo! 👋 Saya **AI Konsultan Pertanian TaniPro**.\n\nSaya siap membantu kamu dengan:\n- 🌾 Teknik budidaya & penanganan hama\n- 💰 Strategi harga & analisis pasar\n- 📦 Tips pascapanen & penyimpanan\n- 📊 Perhitungan biaya & keuntungan\n\nAda yang bisa saya bantu hari ini?`,
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (user?.id) {
      findById(user.id).then(setUserProfile);
    }
  }, [user]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (text: string) => {
    if (!text.trim() || loading) return;

    const userMsg: Message = { role: 'user', content: text.trim(), timestamp: new Date() };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newMessages.map(m => ({ role: m.role, content: m.content })),
          userContext: userProfile ? {
            name: userProfile.full_name,
            commodities: userProfile.commodities,
            city: userProfile.city,
            province: userProfile.province,
          } : null,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Error');

      setMessages(prev => [...prev, {
        role: 'assistant',
        content: data.response,
        timestamp: new Date(),
      }]);
    } catch {
      // PROTOTYPE FALLBACK
      const lowerInput = text.toLowerCase();
      let dummyResponse = "Terima kasih atas pertanyaannya! Saat ini sistem AI sedang dalam mode purwarupa (prototype). Untuk info lebih akurat, silakan konsultasi ke penyuluh pertanian setempat.";
      
      if (lowerInput.includes('harga') || lowerInput.includes('cabai')) {
        dummyResponse = "**Estimasi Harga Cabai Merah (Jawa Barat):**\n- **Harga Petani:** Rp40.000 - Rp45.000/kg\n- **Harga Pasar Tradisional:** Rp55.000 - Rp65.000/kg\n\n*Tips:* Waktu terbaik menjual adalah saat stok di pengepul mulai menipis, biasanya di pagi hari atau hari menjelang akhir pekan. Hindari memanen saat hujan deras untuk mencegah pembusukan.";
      } else if (lowerInput.includes('hama') || lowerInput.includes('ulat')) {
        dummyResponse = "**Mengatasi Ulat Grayak Secara Organik:**\n1. **Semprotan Neem Oil:** Campurkan 1 sdm minyak mimba (neem oil) dengan 1 liter air dan sedikit sabun cuci piring. Semprotkan di pagi atau sore hari.\n2. **Rotasi Tanaman:** Hindari menanam jagung terus-menerus di lahan yang sama.\n3. **Predator Alami:** Pelihara predator alami seperti kumbang kubah (ladybugs).\n4. **Perangkap Feromon:** Gunakan perangkap feromon untuk menangkap ngengat jantan sebelum berkembang biak.";
      } else if (lowerInput.includes('panen') || lowerInput.includes('kualitas')) {
        dummyResponse = "**Tips Memaksimalkan Kualitas Panen:**\n- Lakukan pemanenan di **pagi hari** setelah embun kering, agar kesegaran lebih terjaga.\n- Sortir hasil panen segera (pisahkan yang rusak/busuk).\n- Gunakan keranjang bersih dengan sirkulasi udara yang baik (jangan gunakan karung plastik tertutup rapat).\n- Simpan di tempat teduh (hindari sinar matahari langsung) sebelum proses distribusi.";
      } else if (lowerInput.includes('hitung') || lowerInput.includes('keuntungan')) {
        dummyResponse = "**Simulasi Keuntungan 1 Ha Tomat:**\n- **Estimasi Biaya Produksi:** Rp45.000.000 (bibit, pupuk, tenaga kerja, pestisida organik)\n- **Estimasi Hasil Panen:** 25.000 kg (25 ton)\n- **Harga Jual Rata-Rata:** Rp5.000/kg (ke pengepul)\n- **Pendapatan Kotor:** Rp125.000.000\n- **Estimasi Laba Bersih:** Rp125M - Rp45M = **Rp80.000.000** per musim tanam.\n\n*Catatan:* Perhitungan ini adalah estimasi ideal. Faktor cuaca dan fluktuasi harga pasar bisa sangat mempengaruhi hasil nyata.";
      } else if (lowerInput.includes('pupuk') || lowerInput.includes('kompos')) {
        dummyResponse = "**Cara Membuat Pupuk Kompos Organik:**\n1. Kumpulkan sisa tanaman (daun kering, batang jagung, dll) dan kotoran ternak.\n2. Cincang bahan menjadi potongan kecil.\n3. Susun berlapis: bahan coklat (kering), bahan hijau (basah), dan kotoran ternak.\n4. Tambahkan larutan EM4 dan air secukupnya agar lembap (tidak terlalu basah).\n5. Tutup tumpukan dengan terpal. Aduk setiap minggu.\n6. Kompos siap pakai dalam 3-4 minggu saat berubah warna menjadi hitam dan berbau seperti tanah hutan.";
      } else if (lowerInput.includes('musim') || lowerInput.includes('hujan')) {
        dummyResponse = "**Komoditas Cocok untuk Musim Hujan:**\n- Padi sawah\n- Kangkung\n- Bayam\n- Sawi\n- Terong\n- Pare\n\n*Peringatan:* Jika menanam cabai atau tomat di musim hujan, waspadai serangan jamur (antraknosa) dan gunakan mulsa plastik serta perbaiki drainase bedengan agar akar tidak terendam air.";
      }

      setMessages(prev => [...prev, {
        role: 'assistant',
        content: `*(Mode Demo)*\n\n${dummyResponse}`,
        timestamp: new Date(),
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  const formatTime = (date: Date) =>
    date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-4 mb-4 flex-shrink-0">
        <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl"
          style={{ background: 'linear-gradient(135deg, var(--tanipro-forest), var(--tanipro-moss))' }}>
          🤖
        </div>
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--tanipro-forest)' }}>
            AI Konsultan Pertanian
          </h1>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            <p className="text-xs" style={{ color: 'var(--tanipro-mid-gray)' }}>
              Powered by Gemini AI · Online
            </p>
          </div>
        </div>
      </div>

      {/* Quick Prompts */}
      {messages.length <= 1 && (
        <div className="flex gap-2 flex-wrap mb-3 flex-shrink-0">
          {QUICK_PROMPTS.map(p => (
            <button key={p.label} onClick={() => sendMessage(p.text)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all hover:scale-105"
              style={{ background: 'var(--tanipro-warm-gray)', color: 'var(--tanipro-forest)', border: '1px solid var(--border)' }}>
              <span>{p.icon}</span> {p.label}
            </button>
          ))}
        </div>
      )}

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto rounded-2xl p-4 space-y-4 mb-4"
        style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
        {messages.map((msg, i) => (
          <div key={i} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
            {/* Avatar */}
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm shrink-0 ${msg.role === 'user' ? 'text-white' : ''}`}
              style={msg.role === 'user'
                ? { background: 'var(--tanipro-forest)' }
                : { background: 'linear-gradient(135deg, var(--tanipro-moss), var(--tanipro-leaf))' }}>
              {msg.role === 'user' ? (user?.full_name.charAt(0).toUpperCase() ?? '👤') : '🤖'}
            </div>

            {/* Bubble */}
            <div className={`max-w-[80%] ${msg.role === 'user' ? 'items-end' : 'items-start'} flex flex-col gap-1`}>
              <div className={`px-4 py-3 rounded-2xl text-sm leading-relaxed ${msg.role === 'user' ? 'rounded-tr-sm' : 'rounded-tl-sm'}`}
                style={msg.role === 'user'
                  ? { background: 'var(--tanipro-forest)', color: 'white' }
                  : { background: 'var(--tanipro-warm-gray)', color: 'var(--tanipro-charcoal)' }}>
                <MarkdownText text={msg.content} />
              </div>
              <span className="text-[10px] text-gray-400 px-1">{formatTime(msg.timestamp)}</span>
            </div>
          </div>
        ))}

        {/* Typing indicator */}
        {loading && (
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm"
              style={{ background: 'linear-gradient(135deg, var(--tanipro-moss), var(--tanipro-leaf))' }}>🤖</div>
            <div className="px-4 py-3 rounded-2xl rounded-tl-sm flex items-center gap-1"
              style={{ background: 'var(--tanipro-warm-gray)' }}>
              {[0, 1, 2].map(i => (
                <div key={i} className="w-2 h-2 rounded-full animate-bounce"
                  style={{ background: 'var(--tanipro-moss)', animationDelay: `${i * 150}ms` }} />
              ))}
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input Area */}
      <div className="flex-shrink-0 flex gap-2">
        <div className="flex-1 relative">
          <textarea
            ref={textareaRef}
            rows={1}
            placeholder="Tanya apa saja tentang pertanian... (Enter untuk kirim, Shift+Enter baris baru)"
            value={input}
            onChange={e => {
              setInput(e.target.value);
              e.target.style.height = 'auto';
              e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px';
            }}
            onKeyDown={handleKeyDown}
            disabled={loading}
            className="w-full resize-none border border-gray-200 dark:border-gray-700 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--tanipro-moss)] bg-white dark:bg-gray-900 text-gray-900 dark:text-white disabled:opacity-60 transition-all"
            style={{ minHeight: '48px', maxHeight: '120px' }}
          />
        </div>
        <button
          onClick={() => sendMessage(input)}
          disabled={loading || !input.trim()}
          className="w-12 h-12 rounded-2xl flex items-center justify-center text-white transition-all hover:scale-105 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
          style={{ background: 'linear-gradient(135deg, var(--tanipro-forest), var(--tanipro-moss))' }}
        >
          {loading ? (
            <div className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
          ) : (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          )}
        </button>
      </div>

      {/* Disclaimer */}
      <p className="text-[10px] text-center text-gray-400 mt-2 flex-shrink-0">
        AI dapat membuat kesalahan. Verifikasi info penting dengan ahli pertanian setempat.
      </p>
    </div>
  );
}
