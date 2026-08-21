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
    <div className="flex h-screen w-full bg-[#050505] text-[#e0e0e0] font-sans overflow-hidden">
      
      {/* Sidebar - System Status & Log */}
      <aside className="hidden md:flex w-[320px] border-r border-[#1a1a1a] flex-col p-8 z-20 bg-[#050505]">
        <div className="mb-12">
          <h1 className="text-2xl font-light tracking-widest uppercase mb-1">TRANSCRIPT</h1>
          <p className="text-[10px] uppercase tracking-[0.2em] text-[#666]">Thermal AI Interface v2.4</p>
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
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-grow bg-[#0d0d0d] flex flex-col items-center justify-start pt-12 relative h-screen">
        <div className="absolute top-0 w-full h-[60px] bg-gradient-to-b from-[#0d0d0d] to-transparent z-20 pointer-events-none"></div>
        <div className="absolute top-0 right-0 p-12 text-right pointer-events-none hidden lg:block">
          <div className="text-[60px] font-black opacity-5 select-none">80MM</div>
          <div className="text-xs font-mono text-[#333]">PRINTER_BUF: {isLoading ? '99%' : '0%'}</div>
        </div>

        <div className="w-[420px] flex flex-col items-center">
          {/* Printer Top Hardware */}
          <div className="w-[440px] h-[30px] bg-[#1a1a1a] rounded-t-lg border-x border-t border-[#333] flex items-center justify-center relative z-20">
            <div className="w-[380px] h-[4px] bg-[#050505] rounded-full shadow-inner"></div>
          </div>

          {/* Paper Container */}
          <div className="w-[380px] bg-[#f9f9f9] shadow-[0_30px_60px_-15px_rgba(0,0,0,0.8)] min-h-[500px] max-h-[65vh] overflow-y-auto receipt-scrollbar relative z-10 flex flex-col">
            <div className="p-10 flex flex-col gap-4 text-[#111] font-mono text-[13px] leading-relaxed pb-12">
              
              {/* Header */}
              <div className="text-center border-b border-black/10 pb-6 mb-2">
                <h2 className="text-lg font-bold tracking-tighter uppercase">AI TRANSCRIPT</h2>
                <p className="text-[10px] tracking-widest">NO. 8829-X / {currentDate.split(" ")[0].replace(/\//g, ".")}</p>
                <div className="mt-2 text-[10px] flex justify-between">
                  <span>TIME: {currentDate.split(" ")[1]}</span>
                  <span>CORE: G-3.6</span>
                </div>
              </div>

              {/* Messages */}
              <div className="flex flex-col gap-6">
                <AnimatePresence>
                    {messages.map((msg, idx) => (
                      <motion.div 
                        key={idx}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex flex-col gap-1"
                      >
                        {msg.role === 'user' ? (
                            <>
                                <div className="font-bold text-[10px] text-[#555] uppercase tracking-wider mb-1">USER INPUT:</div>
                                <div className="uppercase break-words">'{msg.text}'</div>
                            </>
                        ) : (
                            <>
                                <div className="font-bold text-[10px] text-[#555] uppercase tracking-wider mb-1 mt-2">AI RESPONSE:</div>
                                <div className="whitespace-pre-wrap break-words">{msg.text}</div>
                                <div className="text-center mt-6 flex justify-center">
                                  <div className="w-16 h-16 border-[2px] border-black border-dashed flex items-center justify-center opacity-20">
                                    <span className="text-[8px]">QR AUTH</span>
                                  </div>
                                </div>
                            </>
                        )}
                      </motion.div>
                    ))}
                    
                    {isLoading && (
                      <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex flex-col gap-1 mt-2"
                      >
                        <div className="font-bold text-[10px] text-[#555] uppercase tracking-wider mb-1">SYSTEM:</div>
                        <div className="animate-pulse">PROCESSING...</div>
                      </motion.div>
                    )}
                </AnimatePresence>
                <div ref={receiptEndRef} className="h-4" />
              </div>

            </div>
          </div>
          
          {/* Paper Bottom Edge (Jagged) */}
          <div className="w-[380px] h-3 bg-[#f9f9f9] receipt-edge z-10 filter drop-shadow-[0_10px_8px_rgba(0,0,0,0.5)]"></div>
          <div className="text-[10px] text-center opacity-30 mt-4 font-mono tracking-widest hidden md:block">
             <p>---- END OF TRANSMISSION ----</p>
             <p className="mt-1">PRINTED BY THERMAL-CORE™</p>
          </div>
        </div>

        {/* Input Area */}
        <div className="mt-auto mb-8 w-full max-w-[420px] z-30 px-4 pt-8">
          <div className="bg-[#111] p-2 rounded border border-[#222] shadow-2xl relative">
            <p className="absolute -top-6 left-1 text-[10px] text-[#555] font-mono uppercase">Command Input</p>
            <form onSubmit={handleSubmit} className="relative flex items-center">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                disabled={isLoading}
                placeholder="Ketik pesan untuk mencetak..."
                className="w-full bg-transparent text-[#e0e0e0] text-xs px-3 py-2 pr-12 focus:outline-none placeholder-[#555] font-sans"
              />
              <button
                type="submit"
                disabled={isLoading || !input.trim()}
                className="absolute right-1 p-2 text-[#666] hover:text-[#e0e0e0] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Printer className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}
