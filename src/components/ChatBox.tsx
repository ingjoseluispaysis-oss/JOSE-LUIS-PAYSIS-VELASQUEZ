import React, { useState, useRef, useEffect } from "react";
import {
  MessageSquare,
  X,
  Send,
  Minimize2,
  Maximize2,
  Trash2,
  Volume2,
  VolumeX,
  Copy,
  Check,
  Sparkles,
  ShieldAlert,
  ArrowRight,
  HardHat,
  Scale,
  TrendingDown,
  Bot,
  Radio,
  Mic,
  MicOff,
  Play,
  Square,
} from "lucide-react";
import { ChatMessage, EVMMetrics, ProyectoInfo, RiesgoItem } from "../types";
import {
  playBeep,
  playRadioChirp,
  speakText,
  stopSpeaking,
  isSpeaking,
  isSpeechRecognitionSupported,
  isSpeechSynthesisSupported,
} from "../services/audio";
import { generateAssistantResponse } from "../services/aiAssistant";

interface ChatBoxProps {
  isOpen: boolean;
  onClose: () => void;
  onOpen: () => void;
  onOpenAudioChat?: () => void;
  proyecto: ProyectoInfo;
  metrics: EVMMetrics;
  riesgos: RiesgoItem[];
  activeTab: number;
  onNavigateTab: (tabId: number) => void;
}

const CHAT_STORAGE_KEY = "ciclovia_chatbox_history_v1";

export const ChatBox: React.FC<ChatBoxProps> = ({
  isOpen,
  onClose,
  onOpen,
  onOpenAudioChat,
  proyecto,
  metrics,
  riesgos,
  activeTab,
  onNavigateTab,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    try {
      const saved = localStorage.getItem(CHAT_STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {
      // fallback
    }
    return [
      {
        id: "msg-init-1",
        sender: "assistant",
        text: `¡Hola, Colega! Soy el Asistente Técnico y Contractual de la Ciclovía Cutervo - Huacachina (CUI 2264872).
Estoy conectado en tiempo real con los 12 módulos de control del proyecto:
• Estado del proyecto: SPI ${metrics.spi.toFixed(2)} (Atraso ${metrics.atraso.toFixed(2)}%) | Avance Ejecutado ${metrics.ejec}%
• Plazo vigente: ${proyecto.plazoActual} días calendario (RER 469-2025)
• Presupuesto: S/ ${proyecto.presupuestoConIGV.toLocaleString()} con IGV
• Residente: ING. JOSE LUIS PAYSIS VELASQUEZ (CIP 101507)

¿En qué puedo asistirte hoy? Puedes escribir o hablarme por voz para redactar un asiento de cuaderno de obra, sustentar ampliaciones de plazo (Art 140), analizar la ruta crítica o simular penalidades (Art 135).`,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        category: "general",
        suggestedAction: { tabId: 11, label: "Ver Item 11 Riesgos y Asiento 802" },
      },
    ];
  });

  const [inputMessage, setInputMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [playingMsgId, setPlayingMsgId] = useState<string | null>(null);
  const [isDictating, setIsDictating] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLTextAreaElement | null>(null);
  const recognitionRef = useRef<any>(null);

  // Setup Speech Recognition for direct dictation in the input box
  useEffect(() => {
    if (typeof window === "undefined") return;
    const SpeechRec = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRec) {
      try {
        const rec = new SpeechRec();
        rec.continuous = false;
        rec.interimResults = true;
        rec.lang = "es-PE";

        rec.onstart = () => {
          setIsDictating(true);
          playRadioChirp("start");
        };

        rec.onresult = (event: any) => {
          let transcript = "";
          for (let i = event.resultIndex; i < event.results.length; ++i) {
            transcript += event.results[i][0].transcript;
          }
          if (transcript) {
            setInputMessage((prev) => (prev ? prev + " " + transcript : transcript));
          }
        };

        rec.onerror = () => {
          setIsDictating(false);
          playRadioChirp("end");
        };

        rec.onend = () => {
          setIsDictating(false);
          playRadioChirp("end");
        };

        recognitionRef.current = rec;
      } catch (e) {
        console.warn("SpeechRec setup failed", e);
      }
    }
  }, []);

  const toggleDictation = () => {
    if (!recognitionRef.current) {
      alert("El reconocimiento de voz por micrófono no está disponible en este navegador.");
      return;
    }

    if (isDictating) {
      recognitionRef.current.stop();
      setIsDictating(false);
    } else {
      stopSpeaking();
      setPlayingMsgId(null);
      try {
        recognitionRef.current.start();
      } catch {
        setIsDictating(false);
      }
    }
  };

  // Stop speaking when chat is closed
  useEffect(() => {
    if (!isOpen) {
      stopSpeaking();
      setPlayingMsgId(null);
      if (isDictating && recognitionRef.current) {
        recognitionRef.current.stop();
      }
    }
  }, [isOpen]);

  // Auto-scroll to bottom of messages
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen, isTyping]);

  // Persist messages
  useEffect(() => {
    try {
      localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(messages));
    } catch (e) {
      console.warn("Error saving chat history", e);
    }
  }, [messages]);

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    if (soundEnabled) playBeep(980, 0.1);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleClearHistory = () => {
    if (window.confirm("¿Deseas reiniciar la conversación del Asistente Técnico?")) {
      stopSpeaking();
      setPlayingMsgId(null);
      const initMsg: ChatMessage = {
        id: `msg-${Date.now()}`,
        sender: "system",
        text: "Historial de conversación reiniciado. Todos los parámetros técnicos del proyecto continúan sincronizados.",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setMessages([initMsg]);
      localStorage.removeItem(CHAT_STORAGE_KEY);
      if (soundEnabled) playBeep(440, 0.1);
    }
  };

  const handleToggleSpeak = (msgId: string, text: string) => {
    if (playingMsgId === msgId) {
      stopSpeaking();
      setPlayingMsgId(null);
    } else {
      stopSpeaking();
      setPlayingMsgId(msgId);
      speakText(text, {
        onEnd: () => setPlayingMsgId(null),
        onError: () => setPlayingMsgId(null),
      });
    }
  };

  const handleSendMessage = (textToSend?: string) => {
    const text = (textToSend || inputMessage).trim();
    if (!text) return;

    if (soundEnabled) playBeep(880, 0.08);

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: "user",
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputMessage("");
    setIsTyping(true);

    // Simulate realistic AI thought delay
    setTimeout(() => {
      const response = generateAssistantResponse(text, proyecto, metrics, riesgos, activeTab);
      const botMsg: ChatMessage = {
        id: `bot-${Date.now()}`,
        sender: "assistant",
        text: response.text,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        category: response.category,
        suggestedAction: response.suggestedAction,
      };

      setMessages((prev) => [...prev, botMsg]);
      setIsTyping(false);
      if (soundEnabled) playBeep(659, 0.12);
    }, 550);
  };

  const quickChips = [
    { label: "✍️ Redactar Asiento 802", query: "Redactar Asiento 802 de Cuaderno de Obra por falta de terreno Club Social" },
    { label: "⚠️ Justificar atraso -31.43%", query: "¿Cómo justificar técnicamente el atraso del -31.43% ante el GORE ICA y Supervisión según Art 140?" },
    { label: "💰 Cálculo Penalidad Art 135", query: "¿Cuál es el cálculo exacto de la penalidad máxima por mora del 10% bajo el Art 135?" },
    { label: "🚧 Club Social (249 días)", query: "Estado y estrategia de defensa para la causal de terreno Club Social Ica" },
    { label: "📊 Valorización 17 y EVM", query: "Resumen ejecutivo de la Valorización 17 y métricas EVM SPI CPI" },
    { label: "⏱️ Reducir TNC 35% en Veredas", query: "¿Cómo optimizar la productividad de la cuadrilla C-03 de veredas y reducir el TNC del 35%?" },
  ];

  return (
    <>
      {/* Floating Action Buttons */}
      {!isOpen && (
        <div className="fixed bottom-4 right-4 z-40 flex items-center gap-2">
          {/* Audio Chat Quick Launch Button */}
          {onOpenAudioChat && (
            <button
              onClick={onOpenAudioChat}
              className="flex items-center gap-2 px-3.5 h-12 rounded-full bg-[#030A18] hover:bg-[#0B1D3A] text-[#FEF3C7] shadow-[0_8px_25px_rgba(0,0,0,0.7)] border-2 border-[#FF6B00] hover:scale-105 active:scale-95 transition-all duration-200 group"
              title="Abrir Radio de Obra / Chat de Audio Interactivo"
            >
              <div className="relative">
                <Radio size={18} className="text-[#FF6B00] group-hover:animate-pulse" />
                <span className="absolute -top-1 -right-1 w-2 h-2 bg-emerald-400 rounded-full animate-ping" />
              </div>
              <div className="flex flex-col text-left">
                <span className="text-[11px] font-bold leading-none text-[#FF6B00]">
                  RADIO DE OBRA
                </span>
                <span className="text-[8px] font-mono text-[#D4A574] leading-tight">
                  Chat de Audio IA
                </span>
              </div>
            </button>
          )}

          {/* Standard Chatbox Button */}
          <button
            onClick={onOpen}
            className="group flex items-center gap-2.5 px-4 h-12 rounded-full bg-gradient-to-r from-[#7B1C1C] via-[#991B1B] to-[#FF6B00] text-white shadow-[0_8px_25px_rgba(255,107,0,0.4)] border border-[#FF6B00]/50 hover:brightness-110 active:scale-95 transition-all duration-200"
            title="Abrir Chatbox Asistente Técnico"
          >
            <div className="relative">
              <MessageSquare size={20} className="animate-pulse" />
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 rounded-full ring-2 ring-[#7B1C1C]" />
            </div>
            <div className="flex flex-col text-left">
              <span className="text-[12px] font-bold leading-none tracking-wide flex items-center gap-1">
                CHATBOX IA OBRA
                <Sparkles size={11} className="text-[#FEF3C7]" />
              </span>
              <span className="text-[9px] font-mono text-[#FEF3C7]/90 leading-tight">
                CIP 101507 • CUI 2264872
              </span>
            </div>
          </button>
        </div>
      )}

      {/* Main ChatBox Window */}
      {isOpen && (
        <div
          className={`fixed z-50 transition-all duration-300 flex flex-col bg-[#030A18] border-2 border-[#1E3A5F] shadow-[0_12px_45px_rgba(0,0,0,0.85)] rounded-2xl overflow-hidden backdrop-blur-2xl ${
            isExpanded
              ? "bottom-3 right-3 left-3 md:left-auto md:w-[840px] h-[90vh] max-h-[820px]"
              : "bottom-4 right-4 w-[calc(100vw-32px)] sm:w-[480px] h-[650px] max-h-[85vh]"
          }`}
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-[#0B1D3A] via-[#102A4E] to-[#0B1D3A] border-b border-[#1E3A5F] p-3 flex items-center justify-between gap-2 shrink-0">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#7B1C1C] to-[#FF6B00] border border-[#FF6B00]/40 flex items-center justify-center shrink-0 shadow-inner">
                <Bot size={20} className="text-white" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="text-[13px] font-bold text-[#E6F1FF] truncate">
                    ASISTENTE TÉCNICO & CONTRACTUAL
                  </h3>
                  <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[9px] font-mono font-bold shrink-0">
                    ACTIVO
                  </span>
                </div>
                <div className="text-[10px] font-mono text-[#8AA0C0] truncate">
                  Ciclovía Cutervo-Huacachina • Ing. Paysis CIP 101507
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1 shrink-0">
              {/* Audio Chat Mode Switch */}
              {onOpenAudioChat && (
                <button
                  onClick={() => {
                    stopSpeaking();
                    onOpenAudioChat();
                  }}
                  className="px-2 py-1 rounded-lg border border-[#FF6B00]/50 bg-[#FF6B00]/15 text-[#FF6B00] hover:bg-[#FF6B00]/25 text-[10px] font-mono font-bold flex items-center gap-1 transition-all"
                  title="Cambiar a Modo Audio Walkie-Talkie / Radio de Obra"
                >
                  <Radio size={12} className="animate-pulse" />
                  <span className="hidden sm:inline">Modo Audio</span>
                </button>
              )}

              <button
                onClick={() => setSoundEnabled(!soundEnabled)}
                className="w-7 h-7 rounded-lg border border-[#1E3A5F] bg-[#030A18]/50 text-[#8AA0C0] hover:text-[#E6F1FF] flex items-center justify-center transition-colors"
                title={soundEnabled ? "Silenciar audio" : "Activar audio"}
              >
                {soundEnabled ? <Volume2 size={13} /> : <VolumeX size={13} />}
              </button>

              <button
                onClick={handleClearHistory}
                className="w-7 h-7 rounded-lg border border-[#1E3A5F] bg-[#030A18]/50 text-[#8AA0C0] hover:text-red-400 flex items-center justify-center transition-colors"
                title="Limpiar conversación"
              >
                <Trash2 size={13} />
              </button>

              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="w-7 h-7 rounded-lg border border-[#1E3A5F] bg-[#030A18]/50 text-[#8AA0C0] hover:text-[#E6F1FF] flex items-center justify-center transition-colors hidden sm:flex"
                title={isExpanded ? "Reducir ventana" : "Maximizar ventana"}
              >
                {isExpanded ? <Minimize2 size={13} /> : <Maximize2 size={13} />}
              </button>

              <button
                onClick={onClose}
                className="w-7 h-7 rounded-lg border border-red-500/30 bg-red-500/10 text-red-300 hover:bg-red-500/20 flex items-center justify-center transition-colors ml-1"
                title="Cerrar Chatbox"
              >
                <X size={15} />
              </button>
            </div>
          </div>

          {/* Real-time Project Status Bar */}
          <div className="bg-[#020A1E] border-b border-[#1E3A5F]/70 px-3 py-1.5 flex items-center justify-between text-[10px] font-mono shrink-0">
            <div className="flex items-center gap-3">
              <span className="text-[#8AA0C0]">
                SPI: <strong className={metrics.spi < 0.7 ? "text-red-400" : "text-emerald-300"}>{metrics.spi.toFixed(2)}</strong>
              </span>
              <span className="text-[#8AA0C0]">
                Atraso: <strong className="text-red-400">{metrics.atraso.toFixed(2)}%</strong>
              </span>
              <span className="text-[#8AA0C0] hidden sm:inline">
                Plazo: <strong className="text-[#D4A574]">{proyecto.plazoActual}d</strong>
              </span>
            </div>
            <span className="text-[#FEF3C7] text-[9px] bg-[#1E3A5F]/50 px-2 py-0.5 rounded">
              Pestaña activa: Item {activeTab}
            </span>
          </div>

          {/* Quick Prompts Carousel */}
          <div className="bg-[#030A18] px-3 py-2 border-b border-[#1E3A5F]/50 overflow-x-auto scrollbar-none flex gap-1.5 shrink-0">
            {quickChips.map((chip, idx) => (
              <button
                key={idx}
                onClick={() => handleSendMessage(chip.query)}
                className="shrink-0 px-2.5 py-1 rounded-lg bg-[#0B1D3A] hover:bg-[#13274F] border border-[#1E3A5F] text-[#D4A574] text-[10px] font-medium transition-all active:scale-95 whitespace-nowrap"
              >
                {chip.label}
              </button>
            ))}
          </div>

          {/* Messages Stream */}
          <div className="flex-1 overflow-y-auto p-3 space-y-3 font-[Inter] bg-[#020A1E]/80">
            {messages.map((msg) => {
              const isUser = msg.sender === "user";
              const isSystem = msg.sender === "system";
              const isPlayingThis = playingMsgId === msg.id;

              if (isSystem) {
                return (
                  <div key={msg.id} className="text-center my-2">
                    <span className="inline-block px-3 py-1 rounded-full bg-[#1E3A5F]/40 border border-[#1E3A5F] text-[#8AA0C0] text-[10px] font-mono">
                      {msg.text}
                    </span>
                  </div>
                );
              }

              return (
                <div
                  key={msg.id}
                  className={`flex flex-col ${isUser ? "items-end" : "items-start"}`}
                >
                  <div className="flex items-center gap-1.5 mb-1 px-1">
                    <span className="text-[10px] font-mono text-[#8AA0C0]">
                      {isUser ? "Tú (Residente)" : "Ing. Asistente Técnico IA"}
                    </span>
                    <span className="text-[9px] font-mono text-[#8AA0C0]/60">
                      {msg.timestamp}
                    </span>
                  </div>

                  <div
                    className={`relative group max-w-[92%] rounded-xl p-3 text-[11px] leading-relaxed shadow-lg ${
                      isUser
                        ? "bg-gradient-to-br from-[#1E3A5F] to-[#0F2746] text-[#E6F1FF] border border-[#D4A574]/40 rounded-tr-none"
                        : "bg-[#0B1D3A] text-[#E6F1FF] border border-[#1E3A5F] rounded-tl-none font-mono"
                    }`}
                  >
                    <div className="whitespace-pre-wrap select-text break-words">
                      {msg.text}
                    </div>

                    {/* Action Bar for Bot Messages (Audio, Copy, Link) */}
                    {!isUser && (
                      <div className="mt-2.5 pt-2 border-t border-[#1E3A5F] flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5">
                          {/* Audio playback button */}
                          <button
                            onClick={() => handleToggleSpeak(msg.id, msg.text)}
                            className={`px-2 py-1 rounded text-[10px] font-mono flex items-center gap-1 transition-all ${
                              isPlayingThis
                                ? "bg-[#FF6B00] text-[#030A18] font-bold animate-pulse"
                                : "bg-[#030A18] hover:bg-[#13274F] border border-[#1E3A5F] text-[#D4A574] hover:text-[#FEF3C7]"
                            }`}
                            title={isPlayingThis ? "Detener voz" : "Escuchar respuesta en voz alta"}
                          >
                            {isPlayingThis ? <Square size={10} /> : <Volume2 size={11} />}
                            <span>{isPlayingThis ? "Pausar" : "Escuchar"}</span>
                          </button>

                          {/* Copy button */}
                          <button
                            onClick={() => handleCopy(msg.id, msg.text)}
                            className="px-2 py-1 rounded bg-[#030A18] hover:bg-[#13274F] border border-[#1E3A5F] text-[#8AA0C0] hover:text-[#E6F1FF] text-[10px] font-mono flex items-center gap-1 transition-all"
                            title="Copiar texto para Cuaderno de Obra o Carta"
                          >
                            {copiedId === msg.id ? (
                              <>
                                <Check size={11} className="text-emerald-400" />
                                <span className="text-emerald-400">Copiado</span>
                              </>
                            ) : (
                              <>
                                <Copy size={11} />
                                <span>Copiar</span>
                              </>
                            )}
                          </button>
                        </div>

                        {msg.suggestedAction && (
                          <button
                            onClick={() => onNavigateTab(msg.suggestedAction!.tabId)}
                            className="text-[10px] font-mono font-bold text-[#FF6B00] hover:text-[#FEF3C7] flex items-center gap-1 transition-colors"
                          >
                            <span>{msg.suggestedAction.label}</span>
                            <ArrowRight size={12} />
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            {isTyping && (
              <div className="flex items-center gap-2 text-[#8AA0C0] text-[11px] font-mono p-2">
                <div className="w-6 h-6 rounded-lg bg-[#0B1D3A] border border-[#1E3A5F] flex items-center justify-center">
                  <Bot size={14} className="text-[#FF6B00] animate-spin" />
                </div>
                <span>Analizando normativas, metrados y ruta crítica...</span>
                <span className="inline-flex gap-1">
                  <span className="w-1.5 h-1.5 bg-[#D4A574] rounded-full animate-bounce [animation-delay:-0.3s]" />
                  <span className="w-1.5 h-1.5 bg-[#D4A574] rounded-full animate-bounce [animation-delay:-0.15s]" />
                  <span className="w-1.5 h-1.5 bg-[#D4A574] rounded-full animate-bounce" />
                </span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Box Footer */}
          <div className="p-3 bg-[#030A18] border-t border-[#1E3A5F] shrink-0">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="flex items-end gap-2"
            >
              <div className="flex-1 bg-[#020A1E] border border-[#1E3A5F] rounded-xl px-3 py-2 focus-within:border-[#FF6B00] transition-colors relative">
                <textarea
                  ref={inputRef}
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                  rows={isExpanded ? 3 : 2}
                  placeholder={
                    isDictating
                      ? "Escuchando tu voz por el micrófono... (habla ahora)"
                      : "Escribe o pulsa el micrófono para dictar (ej: 'Redacta Asiento 802', 'Penalidad Art 135')..."
                  }
                  className="w-full bg-transparent text-[11px] font-mono text-[#E6F1FF] placeholder-[#8AA0C0]/50 outline-none resize-none leading-relaxed pr-8"
                />
                
                {/* Voice Dictation Mic Button inside textarea */}
                <button
                  type="button"
                  onClick={toggleDictation}
                  className={`absolute right-2.5 top-2.5 w-6 h-6 rounded-full flex items-center justify-center transition-all ${
                    isDictating
                      ? "bg-red-500 text-white animate-pulse shadow-[0_0_10px_rgba(239,68,68,0.7)]"
                      : "bg-[#1E3A5F]/50 text-[#8AA0C0] hover:text-[#FEF3C7] hover:bg-[#1E3A5F]"
                  }`}
                  title={isDictating ? "Detener dictado de voz" : "Dictar consulta con el micrófono"}
                >
                  {isDictating ? <MicOff size={13} /> : <Mic size={13} />}
                </button>

                <div className="flex items-center justify-between text-[9px] font-mono text-[#8AA0C0] pt-1 border-t border-[#1E3A5F]/40">
                  <span className="flex items-center gap-2">
                    <span>Enter envía</span>
                    <span>•</span>
                    <span className="text-[#D4A574]">Micrófono para dictar</span>
                  </span>
                  <span>CUI 2264872</span>
                </div>
              </div>

              <button
                type="submit"
                disabled={!inputMessage.trim()}
                className={`h-11 px-4 rounded-xl flex items-center justify-center gap-1.5 text-[11px] font-bold transition-all shadow-md shrink-0 ${
                  inputMessage.trim()
                    ? "bg-[#FEF3C7] text-[#1F1B18] hover:brightness-95 active:scale-95 cursor-pointer"
                    : "bg-[#1E3A5F]/40 text-[#8AA0C0]/50 cursor-not-allowed border border-[#1E3A5F]"
                }`}
              >
                <Send size={14} />
                <span className="hidden sm:inline">Enviar</span>
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

