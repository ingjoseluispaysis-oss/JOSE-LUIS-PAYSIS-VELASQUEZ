import React, { useState, useEffect, useRef } from "react";
import {
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  X,
  Radio,
  Sparkles,
  ArrowRight,
  Copy,
  Check,
  RefreshCw,
  Send,
  Sliders,
  ShieldCheck,
  AlertCircle,
  Play,
  Square,
  MessageSquare,
} from "lucide-react";
import { EVMMetrics, ProyectoInfo, RiesgoItem } from "../types";
import {
  playRadioChirp,
  playBeep,
  speakText,
  stopSpeaking,
  isSpeaking,
  isSpeechRecognitionSupported,
  isSpeechSynthesisSupported,
} from "../services/audio";
import { generateAssistantResponse, AIResponse } from "../services/aiAssistant";

interface AudioMessage {
  id: string;
  sender: "user" | "assistant";
  transcript: string;
  response?: AIResponse;
  timestamp: string;
}

interface AudioChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenTextChat: () => void;
  proyecto: ProyectoInfo;
  metrics: EVMMetrics;
  riesgos: RiesgoItem[];
  activeTab: number;
  onNavigateTab: (tabId: number) => void;
}

export const AudioChatModal: React.FC<AudioChatModalProps> = ({
  isOpen,
  onClose,
  onOpenTextChat,
  proyecto,
  metrics,
  riesgos,
  activeTab,
  onNavigateTab,
}) => {
  // Voice states
  const [isListening, setIsListening] = useState(false);
  const [isSpeakingState, setIsSpeakingState] = useState(false);
  const [interimTranscript, setInterimTranscript] = useState("");
  const [speechRate, setSpeechRate] = useState<number>(1.1);
  const [autoSpeak, setAutoSpeak] = useState(true);
  const [handsFree, setHandsFree] = useState(false);
  const [textInputFallback, setTextInputFallback] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [currentlyPlayingId, setCurrentlyPlayingId] = useState<string | null>(null);
  const [micError, setMicError] = useState<string | null>(null);

  // Recognition ref
  const recognitionRef = useRef<any>(null);
  const transcriptEndRef = useRef<HTMLDivElement | null>(null);
  const waveCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  const [history, setHistory] = useState<AudioMessage[]>([
    {
      id: "audio-init-1",
      sender: "assistant",
      transcript: `Canal de Audio y Radio de Obra conectado. Soy tu Asistente Técnico y Contractual por Voz para la Ciclovía Cutervo - Huacachina (CUI 2264872). Pulsa el botón del micrófono o selecciona una consulta rápida para interactuar por voz.`,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      response: {
        text: `Canal de Audio y Radio de Obra conectado. Residente: ING. JOSE LUIS PAYSIS VELASQUEZ (CIP 101507).
• Estado: SPI ${metrics.spi.toFixed(2)} | Atraso ${metrics.atraso.toFixed(2)}%
• Plazo: ${proyecto.plazoActual} días (RER 469-2025)
• Normativa Activa: D.S. 038-2026-EF / Ley 29230 (Ley 32460).`,
        shortVoiceSummary: `Canal de Radio de Obra conectado para la Ciclovía Cutervo Huacachina. Avance actual al ${metrics.ejec} por ciento con SPI de ${metrics.spi.toFixed(2)}. Pulsa el micrófono para hablar o formular consultas sobre el Asiento 802 o el Decreto Supremo 038.`,
        category: "general",
        suggestedAction: { tabId: 2, label: "Ver Íntegro D.S. 038 en Item 2" },
      },
    },
  ]);

  // Setup Web Speech Recognition
  useEffect(() => {
    if (typeof window === "undefined") return;

    const SpeechRecognitionClass =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognitionClass) {
      try {
        const recognition = new SpeechRecognitionClass();
        recognition.continuous = false;
        recognition.interimResults = true;
        recognition.lang = "es-PE"; // Peruvian Spanish

        recognition.onstart = () => {
          setIsListening(true);
          setMicError(null);
          playRadioChirp("start");
        };

        recognition.onresult = (event: any) => {
          let currentInterim = "";
          let finalTranscript = "";

          for (let i = event.resultIndex; i < event.results.length; ++i) {
            if (event.results[i].isFinal) {
              finalTranscript += event.results[i][0].transcript;
            } else {
              currentInterim += event.results[i][0].transcript;
            }
          }

          setInterimTranscript(currentInterim);

          if (finalTranscript.trim()) {
            handleProcessUserQuery(finalTranscript.trim());
          }
        };

        recognition.onerror = (event: any) => {
          console.warn("Speech recognition error:", event.error);
          setIsListening(false);
          setInterimTranscript("");
          playRadioChirp("end");
          if (event.error === "not-allowed") {
            setMicError("Permiso de micrófono denegado. Puedes usar la caja de texto inferior.");
          } else if (event.error !== "no-speech") {
            setMicError(`Aviso de voz: ${event.error}`);
          }
        };

        recognition.onend = () => {
          setIsListening(false);
          setInterimTranscript("");
          playRadioChirp("end");
        };

        recognitionRef.current = recognition;
      } catch (e) {
        console.warn("Failed to instantiate SpeechRecognition", e);
      }
    }

    return () => {
      stopSpeaking();
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch {
          // ignore
        }
      }
    };
  }, []);

  // Waveform visualization animation
  useEffect(() => {
    const canvas = waveCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let phase = 0;
    const renderWave = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const width = canvas.width;
      const height = canvas.height;
      const centerY = height / 2;

      const isActive = isListening || isSpeakingState;
      const barCount = 36;
      const barWidth = width / barCount;

      for (let i = 0; i < barCount; i++) {
        const x = i * barWidth + barWidth / 2;
        let amplitude = 4;

        if (isSpeakingState) {
          // Energetic orange-amber wave for assistant voice
          amplitude = Math.sin(phase + i * 0.4) * 22 + Math.cos(phase * 1.5 + i * 0.2) * 12 + 10;
        } else if (isListening) {
          // Emerald pulsing wave for user mic input
          amplitude = Math.sin(phase * 2 + i * 0.3) * 24 + Math.random() * 12 + 6;
        } else {
          // Idle calm baseline wave
          amplitude = Math.sin(phase * 0.5 + i * 0.2) * 3 + 2;
        }

        const barHeight = Math.max(4, Math.min(height - 6, Math.abs(amplitude)));

        const gradient = ctx.createLinearGradient(0, centerY - barHeight / 2, 0, centerY + barHeight / 2);
        if (isSpeakingState) {
          gradient.addColorStop(0, "#FF6B00");
          gradient.addColorStop(0.5, "#FEF3C7");
          gradient.addColorStop(1, "#991B1B");
        } else if (isListening) {
          gradient.addColorStop(0, "#10B981");
          gradient.addColorStop(0.5, "#34D399");
          gradient.addColorStop(1, "#047857");
        } else {
          gradient.addColorStop(0, "#1E3A5F");
          gradient.addColorStop(1, "#0B1D3A");
        }

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.roundRect(x - 2, centerY - barHeight / 2, 4, barHeight, 2);
        ctx.fill();
      }

      phase += isActive ? 0.12 : 0.03;
      animationFrameRef.current = requestAnimationFrame(renderWave);
    };

    renderWave();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isListening, isSpeakingState]);

  // Scroll to bottom
  useEffect(() => {
    if (isOpen) {
      transcriptEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [history, interimTranscript, isListening, isSpeakingState, isOpen]);

  // Handle User Query (from voice recognition, quick prompt, or text input)
  const handleProcessUserQuery = (text: string) => {
    if (!text.trim()) return;

    const userMsgId = `usr-${Date.now()}`;
    const userMsg: AudioMessage = {
      id: userMsgId,
      sender: "user",
      transcript: text,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setHistory((prev) => [...prev, userMsg]);
    setInterimTranscript("");
    setIsListening(false);

    // Generate technical response
    const botResponse = generateAssistantResponse(text, proyecto, metrics, riesgos, activeTab);
    const botMsgId = `bot-${Date.now()}`;
    const botMsg: AudioMessage = {
      id: botMsgId,
      sender: "assistant",
      transcript: botResponse.shortVoiceSummary || botResponse.text,
      response: botResponse,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setTimeout(() => {
      setHistory((prev) => [...prev, botMsg]);

      // Speak response out loud if autoSpeak is active
      if (autoSpeak && isSpeechSynthesisSupported()) {
        speakAudioResponse(botMsgId, botResponse.shortVoiceSummary || botResponse.text);
      }
    }, 450);
  };

  const speakAudioResponse = (msgId: string, textToSpeak: string) => {
    stopSpeaking();
    setCurrentlyPlayingId(msgId);
    setIsSpeakingState(true);

    speakText(textToSpeak, {
      rate: speechRate,
      onStart: () => {
        setIsSpeakingState(true);
        setCurrentlyPlayingId(msgId);
      },
      onEnd: () => {
        setIsSpeakingState(false);
        setCurrentlyPlayingId(null);
        if (handsFree) {
          setTimeout(() => {
            toggleMicrophone();
          }, 600);
        }
      },
      onError: () => {
        setIsSpeakingState(false);
        setCurrentlyPlayingId(null);
      },
    });
  };

  const stopCurrentAudio = () => {
    stopSpeaking();
    setIsSpeakingState(false);
    setCurrentlyPlayingId(null);
  };

  const toggleMicrophone = () => {
    if (isListening) {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch {
          // ignore
        }
      }
      setIsListening(false);
    } else {
      stopCurrentAudio();
      setMicError(null);
      if (recognitionRef.current) {
        try {
          recognitionRef.current.start();
        } catch (e: any) {
          console.warn("Error starting recognition", e);
          setIsListening(false);
        }
      } else {
        setMicError("Reconocimiento de voz no disponible en este navegador. Usa el teclado.");
      }
    }
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    playBeep(980, 0.08);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const quickVoicePrompts = [
    { label: "✍️ Redactar Asiento 802", query: "Redactar Asiento 802 para cuaderno de obra por falta de terreno" },
    { label: "⚠️ Sustentar atraso -31.43%", query: "¿Cómo sustentar técnicamente el atraso de 31% ante GORE ICA?" },
    { label: "💰 Penalidad Art. 135", query: "¿Cuál es la penalidad máxima bajo el Artículo 135 del Decreto Supremo 038?" },
    { label: "🚧 Club Social (249 días)", query: "¿Cuál es la estrategia contractual por el bloqueo del Club Social Ica?" },
    { label: "⏱️ Productividad y TNC 35%", query: "¿Cómo reducir el Trabajo No Contributorio en cuadrillas de veredas?" },
    { label: "📊 Estado Curva S y SPI", query: "¿Cuál es el resumen de la Valorización 17 y la Curva S?" },
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-3xl h-[92vh] max-h-[760px] bg-[#030A18] border-2 border-[#FF6B00]/40 rounded-2xl shadow-[0_20px_60px_rgba(255,107,0,0.25)] flex flex-col overflow-hidden text-white font-[Inter]">
        
        {/* Top Header - Radio Station Style */}
        <div className="bg-gradient-to-r from-[#0B1D3A] via-[#102A4E] to-[#0B1D3A] border-b border-[#1E3A5F] px-4 py-3 flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-[#7B1C1C] via-[#B91C1C] to-[#FF6B00] border border-[#FF6B00]/60 flex items-center justify-center shadow-lg shrink-0">
              <Radio size={22} className={isListening || isSpeakingState ? "animate-pulse text-[#FEF3C7]" : "text-white"} />
              {(isListening || isSpeakingState) && (
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-400 rounded-full animate-ping" />
              )}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h2 className="text-[14px] font-extrabold tracking-wide text-[#E6F1FF] flex items-center gap-1.5 truncate">
                  RADIO DE OBRA • CHAT DE AUDIO INTERACTIVO
                </h2>
                <span className="px-2 py-0.5 rounded bg-[#FF6B00]/20 text-[#FF6B00] border border-[#FF6B00]/40 text-[9px] font-mono font-bold shrink-0">
                  VOZ IA EN VIVO
                </span>
              </div>
              <p className="text-[10px] font-mono text-[#8AA0C0] truncate">
                Ciclovía Cutervo-Huacachina (CUI 2264872) • Ing. Residente CIP 101507
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {/* Switch to text chat */}
            <button
              onClick={() => {
                stopCurrentAudio();
                onOpenTextChat();
                onClose();
              }}
              className="px-2.5 py-1.5 rounded-lg border border-[#1E3A5F] bg-[#0B1D3A] text-[#8AA0C0] hover:text-[#FEF3C7] text-[11px] font-mono flex items-center gap-1.5 transition-colors hidden sm:flex"
              title="Abrir vista de chat tradicional por texto"
            >
              <MessageSquare size={13} />
              <span>Modo Texto</span>
            </button>

            {/* Audio speech rate selector */}
            <button
              onClick={() => {
                const nextRate = speechRate === 1.0 ? 1.2 : speechRate === 1.2 ? 1.4 : 1.0;
                setSpeechRate(nextRate);
                playBeep(700, 0.05);
              }}
              className="px-2 py-1 rounded-lg border border-[#1E3A5F] bg-[#0B1D3A] text-[#D4A574] text-[10px] font-mono hover:border-[#D4A574] transition-colors"
              title="Velocidad de reproducción de voz"
            >
              {speechRate}x
            </button>

            {/* Auto speak toggle */}
            <button
              onClick={() => setAutoSpeak(!autoSpeak)}
              className={`w-8 h-8 rounded-lg border flex items-center justify-center transition-colors ${
                autoSpeak
                  ? "bg-[#FEF3C7]/10 text-[#FEF3C7] border-[#FEF3C7]/40"
                  : "bg-[#0B1D3A] text-[#8AA0C0] border-[#1E3A5F]"
              }`}
              title={autoSpeak ? "Voz automática activada" : "Voz automática desactivada"}
            >
              {autoSpeak ? <Volume2 size={15} /> : <VolumeX size={15} />}
            </button>

            {/* Close modal */}
            <button
              onClick={() => {
                stopCurrentAudio();
                onClose();
              }}
              className="w-8 h-8 rounded-lg border border-red-500/30 bg-red-500/10 text-red-300 hover:bg-red-500/20 flex items-center justify-center transition-colors ml-1"
              title="Cerrar Audio Chat"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Dynamic Soundwave & Visualizer Console */}
        <div className="bg-gradient-to-b from-[#020A1E] to-[#030A18] border-b border-[#1E3A5F] px-4 py-3 flex flex-col items-center justify-center shrink-0 relative overflow-hidden">
          {/* Status indicators */}
          <div className="w-full flex items-center justify-between text-[10px] font-mono text-[#8AA0C0] mb-2 z-10">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1">
                <span className={`w-2 h-2 rounded-full ${isListening ? "bg-emerald-400 animate-ping" : isSpeakingState ? "bg-[#FF6B00] animate-pulse" : "bg-emerald-500"}`} />
                <span className="font-bold text-[#E6F1FF]">
                  {isListening ? "ESC叩NDOTE EN VIVO..." : isSpeakingState ? "ASISTENTE HABLANDO..." : "EN ESPERA DE AUDIO"}
                </span>
              </span>
              <span className="text-[#8AA0C0]/60 hidden sm:inline">• Frecuencia: 142.5 MHz (Canal Obra)</span>
            </div>

            <div className="flex items-center gap-3">
              <label className="flex items-center gap-1.5 cursor-pointer text-[#D4A574] hover:text-[#FEF3C7]">
                <input
                  type="checkbox"
                  checked={handsFree}
                  onChange={(e) => setHandsFree(e.target.checked)}
                  className="rounded border-[#1E3A5F] bg-[#0B1D3A] text-[#FF6B00] focus:ring-0 w-3 h-3"
                />
                <span>Manos Libres (Continuo)</span>
              </label>

              {isSpeakingState && (
                <button
                  onClick={stopCurrentAudio}
                  className="px-2 py-0.5 rounded bg-red-500/20 text-red-300 border border-red-500/30 text-[9px] font-mono flex items-center gap-1 hover:bg-red-500/30"
                >
                  <Square size={10} />
                  <span>Silenciar voz</span>
                </button>
              )}
            </div>
          </div>

          {/* Soundwave canvas */}
          <div className="w-full max-w-md h-14 relative flex items-center justify-center">
            <canvas
              ref={waveCanvasRef}
              width={420}
              height={56}
              className="w-full h-full block rounded-lg"
            />
          </div>

          {/* Interim transcript live preview */}
          {isListening && (
            <div className="mt-2 text-center text-[12px] font-mono text-emerald-300 bg-emerald-950/40 border border-emerald-500/30 px-3 py-1 rounded-full animate-pulse">
              🎤 {interimTranscript || "Habla ahora, el sistema está escuchando..."}
            </div>
          )}

          {micError && (
            <div className="mt-2 text-center text-[11px] font-mono text-amber-300 bg-amber-950/40 border border-amber-500/30 px-3 py-1 rounded-md flex items-center gap-1.5">
              <AlertCircle size={13} />
              <span>{micError}</span>
            </div>
          )}
        </div>

        {/* Quick Voice Prompt Pills */}
        <div className="bg-[#030A18] px-3 py-2 border-b border-[#1E3A5F]/60 overflow-x-auto scrollbar-none flex gap-1.5 shrink-0">
          {quickVoicePrompts.map((item, idx) => (
            <button
              key={idx}
              onClick={() => handleProcessUserQuery(item.query)}
              className="shrink-0 px-2.5 py-1 rounded-lg bg-[#0B1D3A] hover:bg-[#13274F] border border-[#1E3A5F] text-[#D4A574] hover:text-[#FEF3C7] text-[10px] font-medium transition-all active:scale-95 whitespace-nowrap flex items-center gap-1.5"
            >
              <span>{item.label}</span>
            </button>
          ))}
        </div>

        {/* Conversation Stream */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#020A1E]/80">
          {history.map((msg) => {
            const isUser = msg.sender === "user";
            const isPlayingThis = currentlyPlayingId === msg.id && isSpeakingState;

            return (
              <div
                key={msg.id}
                className={`flex flex-col ${isUser ? "items-end" : "items-start"}`}
              >
                <div className="flex items-center gap-2 mb-1 px-1 text-[10px] font-mono text-[#8AA0C0]">
                  <span>{isUser ? "Tú (Residente de Obra)" : "Ing. Asistente Técnico (Voz)"}</span>
                  <span>•</span>
                  <span>{msg.timestamp}</span>
                </div>

                <div
                  className={`relative max-w-[92%] sm:max-w-[85%] rounded-2xl p-3.5 text-[11px] leading-relaxed shadow-lg ${
                    isUser
                      ? "bg-gradient-to-br from-[#1E3A5F] to-[#0F2746] text-[#E6F1FF] border border-[#D4A574]/40 rounded-tr-none"
                      : "bg-[#0B1D3A] text-[#E6F1FF] border border-[#1E3A5F] rounded-tl-none font-mono"
                  }`}
                >
                  <div className="whitespace-pre-wrap select-text break-words">
                    {msg.transcript}
                  </div>

                  {/* Audio Controls & Actions on Bot Message */}
                  {!isUser && msg.response && (
                    <div className="mt-3 pt-2.5 border-t border-[#1E3A5F] flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5">
                        {/* Play/Stop speech button */}
                        <button
                          onClick={() => {
                            if (isPlayingThis) {
                              stopCurrentAudio();
                            } else {
                              speakAudioResponse(msg.id, msg.response?.shortVoiceSummary || msg.response!.text);
                            }
                          }}
                          className={`px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold flex items-center gap-1.5 transition-all ${
                            isPlayingThis
                              ? "bg-[#FF6B00] text-[#030A18] animate-pulse shadow-[0_0_12px_rgba(255,107,0,0.6)]"
                              : "bg-[#030A18] hover:bg-[#13274F] border border-[#1E3A5F] text-[#FEF3C7]"
                          }`}
                          title={isPlayingThis ? "Detener reproducción" : "Escuchar respuesta en voz alta"}
                        >
                          {isPlayingThis ? <Square size={11} /> : <Volume2 size={11} />}
                          <span>{isPlayingThis ? "Reproduciendo..." : "Escuchar Voz"}</span>
                        </button>

                        {/* Copy full technical text */}
                        <button
                          onClick={() => handleCopy(msg.id, msg.response!.text)}
                          className="px-2 py-1 rounded-lg bg-[#030A18] hover:bg-[#13274F] border border-[#1E3A5F] text-[#8AA0C0] hover:text-[#E6F1FF] text-[10px] font-mono flex items-center gap-1 transition-all"
                          title="Copiar texto técnico completo"
                        >
                          {copiedId === msg.id ? (
                            <>
                              <Check size={11} className="text-emerald-400" />
                              <span className="text-emerald-400">Copiado</span>
                            </>
                          ) : (
                            <>
                              <Copy size={11} />
                              <span>Copiar Texto</span>
                            </>
                          )}
                        </button>
                      </div>

                      {/* Navigation Link to Module */}
                      {msg.response.suggestedAction && (
                        <button
                          onClick={() => {
                            stopCurrentAudio();
                            onNavigateTab(msg.response!.suggestedAction!.tabId);
                            onClose();
                          }}
                          className="text-[10px] font-mono font-bold text-[#FF6B00] hover:text-[#FEF3C7] flex items-center gap-1 transition-colors"
                        >
                          <span>{msg.response.suggestedAction.label}</span>
                          <ArrowRight size={12} />
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
          <div ref={transcriptEndRef} />
        </div>

        {/* Bottom PTT (Push-To-Talk) & Voice Control Bar */}
        <div className="bg-[#030A18] border-t border-[#1E3A5F] p-4 flex flex-col gap-3 shrink-0">
          <div className="flex items-center justify-center gap-4">
            {/* Main Interactive Mic Button */}
            <button
              onClick={toggleMicrophone}
              className={`group relative flex items-center gap-3 px-6 h-14 rounded-full font-bold text-[13px] tracking-wide transition-all shadow-xl active:scale-95 ${
                isListening
                  ? "bg-gradient-to-r from-emerald-600 to-teal-500 text-white shadow-[0_0_30px_rgba(16,185,129,0.5)] border-2 border-emerald-300 animate-pulse"
                  : "bg-gradient-to-r from-[#7B1C1C] via-[#991B1B] to-[#FF6B00] text-white shadow-[0_8px_25px_rgba(255,107,0,0.4)] border border-[#FF6B00]/60 hover:brightness-110"
              }`}
              title={isListening ? "Pulsar para terminar de hablar" : "Pulsar para hablar al micrófono"}
            >
              <div className="w-8 h-8 rounded-full bg-white/15 flex items-center justify-center shrink-0">
                {isListening ? <MicOff size={18} /> : <Mic size={18} />}
              </div>
              <div className="flex flex-col text-left">
                <span>{isListening ? "TRANSMITIENDO AUDIO..." : "PULSAR PARA HABLAR"}</span>
                <span className="text-[9px] font-mono opacity-80 font-normal">
                  {isListening ? "Haz clic al terminar tu consulta" : "Voz en español (Perú) con audio interactivo"}
                </span>
              </div>
            </button>
          </div>

          {/* Quick text input fallback */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (textInputFallback.trim()) {
                handleProcessUserQuery(textInputFallback);
                setTextInputFallback("");
              }
            }}
            className="flex items-center gap-2 max-w-xl mx-auto w-full pt-1"
          >
            <input
              type="text"
              value={textInputFallback}
              onChange={(e) => setTextInputFallback(e.target.value)}
              placeholder="O escribe una consulta técnica por teclado aquí..."
              className="flex-1 bg-[#020A1E] border border-[#1E3A5F] rounded-xl px-3.5 py-2 text-[11px] font-mono text-[#E6F1FF] placeholder-[#8AA0C0]/50 outline-none focus:border-[#FF6B00]"
            />
            <button
              type="submit"
              disabled={!textInputFallback.trim()}
              className="h-9 px-3 rounded-xl bg-[#FEF3C7] text-[#1F1B18] text-[11px] font-bold hover:brightness-95 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 shrink-0"
            >
              <Send size={12} />
              <span>Enviar</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
