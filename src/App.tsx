import { useState, useRef, useEffect } from "react";
import { Printer } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

type Message = {
  role: "user" | "model";
  text: string;
};

export default function App() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [autoPrint, setAutoPrint] = useState(true);
  const receiptEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    receiptEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMsg = input.trim();
    setInput("");
    
    const newMessages: Message[] = [...messages, { role: "user", text: userMsg }];
    setMessages(newMessages);
    setIsLoading(true);

    try {
      const history = messages.map(m => ({
        role: m.role,
        parts: [{ text: m.text }]
      }));

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ history, message: userMsg })
      });

      if (!res.ok) {
         const errorData = await res.json().catch(() => ({}));
         throw new Error(errorData.error || "Gagal menghubungi server");
      }

      const data = await res.json();
      setMessages((prev) => [...prev, { role: "model", text: data.text }]);
      if (autoPrint) {
        setTimeout(() => window.print(), 500);
      }
    } catch (error: any) {
      const errorMsg = error.message || "GAGAL MENCETAK RESPON.";
      setMessages((prev) => [...prev, { role: "model", text: `ERROR:\n${errorMsg}` }]);
    } finally {
      setIsLoading(false);
    }
  };

  const currentDate = new Date().toLocaleString("id-ID", {
    year: "numeric", month: "2-digit", day: "2-digit",
    hour: "2-digit", minute: "2-digit"
  });

  return (
    <>
    <div className="flex h-screen w-full bg-[#050505] text-[#e0e0e0] font-sans overflow-hidden print:hidden">
      
      {/* Sidebar - System Status & Log */}
      <aside className="hidden md:flex w-[320px] border-r border-[#1a1a1a] flex-col p-8 z-20 bg-[#050505]">
        <div className="mb-12">
          <h1 className="text-2xl font-light tracking-widest uppercase mb-1">kontolodon</h1>
          <p className="text-[10px] uppercase tracking-[0.2em] text-[#666]">jali simulator V. 3.6 G - F</p>
        </div>
        
        <div className="flex-grow space-y-8 overflow-y-auto">
          <div>
            <label className="text-[10px] uppercase tracking-widest text-[#444] mb-4 block">System Status</label>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-2 h-2 rounded-full bg-[#00ff66] shadow-[0_0_8px_#00ff66]"></div>
              <span className="text-xs font-mono tracking-tighter">PRINTER_ONLINE // 80MM_READY</span>
            </div>
            <div className="flex items-center gap-3">
              <div className={`w-2 h-2 rounded-full ${isLoading ? 'bg-[#ff9900] shadow-[0_0_8px_#ff9900] animate-pulse' : 'bg-[#00ff66] shadow-[0_0_8px_#00ff66]'}`}></div>
              <span className="text-xs font-mono tracking-tighter">{isLoading ? 'LLM_PROCESSING' : 'LLM_STABLE // LATEST_WEIGHTS'}</span>
            </div>
          </div>
          
          <div>
            <label className="text-[10px] uppercase tracking-widest text-[#444] mb-4 block">Session Log</label>
            <div className="space-y-4">
              {messages.filter(m => m.role === 'user').slice(-5).reverse().map((msg, idx) => (
                <div key={idx} className={`border-l border-[#222] pl-4 ${idx > 0 ? 'opacity-50' : ''}`}>
                  <p className="text-xs">User: '{msg.text.length > 25 ? msg.text.substring(0, 25) + '...' : msg.text}'</p>
                </div>
              ))}
              {messages.filter(m => m.role === 'user').length === 0 && (
                <div className="border-l border-[#222] pl-4 opacity-50">
                  <p className="text-[10px] text-[#888] font-mono">No queries yet</p>
                </div>
              )}
            </div>
          </div>
          
          <div className="mt-6 border-t border-[#1a1a1a] pt-6">
            <label className="text-[10px] uppercase tracking-widest text-[#444] mb-4 block">Hardware Config</label>
            <div className="flex items-center justify-between">
               <span className="text-xs font-mono tracking-tighter">AUTO_PRINT (FISIK)</span>
               <button 
                 type="button"
                 onClick={() => setAutoPrint(!autoPrint)}
                 className={`w-10 h-5 rounded-full relative transition-colors ${autoPrint ? 'bg-[#00ff66]' : 'bg-[#333]'}`}
               >
                  <div className={`w-3 h-3 bg-white rounded-full absolute top-1 transition-all ${autoPrint ? 'right-1' : 'left-1'}`}></div>
               </button>
            </div>
            <p className="text-[9px] text-[#666] mt-2 leading-tight">Browser akan memunculkan dialog print (kertas 80mm) otomatis setiap ada respon baru.</p>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-grow bg-[#050505] flex flex-col relative h-screen">
        {/* Messages area (Terminal style) */}
        <div className="flex-grow overflow-y-auto p-12 font-mono text-[13px] leading-relaxed space-y-6">
          <AnimatePresence>
            {messages.filter(msg => msg.role === 'user').map((msg, idx) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex flex-col gap-1 max-w-3xl"
              >
                <div className="font-bold text-[10px] text-[#555] uppercase tracking-wider mb-1">
                  USER_INPUT
                </div>
                <div className="whitespace-pre-wrap text-[#e0e0e0]">
                  {`> ${msg.text}`}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          <div ref={receiptEndRef} className="h-4" />
        </div>

        {/* Command Input */}
        <div className="p-8 border-t border-[#1a1a1a] bg-[#050505] z-30">
          <div className="max-w-3xl w-full flex flex-col gap-2">
            <div className="flex justify-between items-center">
              <p className="text-[10px] text-[#555] font-mono uppercase">Command Input</p>
              <button 
                type="button"
                onClick={() => window.print()}
                className="text-[10px] text-[#00ff66] border border-[#00ff66] px-2 py-1 rounded hover:bg-[#00ff66] hover:text-black transition-colors"
              >
                [ FORCE PRINT ]
              </button>
            </div>
            <form onSubmit={handleSubmit} className="relative flex items-center">
              <span className="absolute left-4 text-[#00ff66] font-mono">{'>'}</span>
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                disabled={isLoading}
                placeholder="Ketik pesan untuk instruksi sistem..."
                className="w-full bg-[#0a0a0a] border border-[#222] rounded text-[#00ff66] font-mono text-[13px] pl-10 pr-12 py-4 focus:outline-none focus:border-[#444] placeholder-[#333] transition-colors shadow-2xl"
                autoFocus
              />
              <button
                type="submit"
                disabled={isLoading || !input.trim()}
                className="absolute right-4 text-[#555] hover:text-[#00ff66] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Printer className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      </main>
    </div>

    {/* Physical Print Area (Visible only when printing) */}
    <div className="hidden print:block w-[72mm] mx-auto bg-white text-black font-mono text-[12px] p-0 m-0">
      <div className="whitespace-pre-wrap">
        {isLoading ? "" : (messages.filter(msg => msg.role === 'model').slice(-1)[0]?.text || "")}
      </div>
    </div>
    </>
  );
}
