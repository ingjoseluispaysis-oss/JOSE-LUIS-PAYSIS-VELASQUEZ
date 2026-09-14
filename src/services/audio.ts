export function playBeep(freq = 880, duration = 0.15, type: OscillatorType = "sine"): void {
  try {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;

    const ctx = new AudioContextClass();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, ctx.currentTime);
    osc.connect(gain);
    gain.connect(ctx.destination);

    gain.gain.setValueAtTime(0.2, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + duration);
  } catch (e) {
    console.debug("Audio play blocked or unavailable", e);
  }
}

export function playAlarmSound(): void {
  try {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;

    const ctx = new AudioContextClass();
    const now = ctx.currentTime;
    
    // Two-tone high priority alarm
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = "sawtooth";
    osc1.frequency.setValueAtTime(880, now);
    osc1.frequency.setValueAtTime(587, now + 0.15);
    osc1.frequency.setValueAtTime(880, now + 0.3);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    gain1.gain.setValueAtTime(0.2, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.45);
    osc1.start(now);
    osc1.stop(now + 0.45);
  } catch (e) {
    console.debug("Alarm audio blocked", e);
  }
}

export function playRadioChirp(type: "start" | "end" = "start"): void {
  try {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;

    const ctx = new AudioContextClass();
    const now = ctx.currentTime;

    if (type === "start") {
      // Construction radio chirp-in (beep-up)
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(650, now);
      osc.frequency.exponentialRampToValueAtTime(1100, now + 0.08);
      osc.connect(gain);
      gain.connect(ctx.destination);
      gain.gain.setValueAtTime(0.18, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
      osc.start(now);
      osc.stop(now + 0.12);
    } else {
      // Radio squelch/release chirp (beep-down)
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "triangle";
      osc.frequency.setValueAtTime(1200, now);
      osc.frequency.exponentialRampToValueAtTime(450, now + 0.09);
      osc.connect(gain);
      gain.connect(ctx.destination);
      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.11);
      osc.start(now);
      osc.stop(now + 0.11);
    }
  } catch (e) {
    console.debug("Radio chirp blocked", e);
  }
}

// Text-to-Speech (TTS) helpers
export function isSpeechSynthesisSupported(): boolean {
  return typeof window !== "undefined" && "speechSynthesis" in window && "SpeechSynthesisUtterance" in window;
}

export function isSpeechRecognitionSupported(): boolean {
  return typeof window !== "undefined" && ("SpeechRecognition" in window || "webkitSpeechRecognition" in window);
}

export function cleanTextForSpeech(text: string): string {
  if (!text) return "";
  return text
    .replace(/[━─═_-]{3,}/g, " ") // Remove visual dividers
    .replace(/[*#`_~[\]()]/g, " ") // Remove markdown formatting chars
    .replace(/•/g, ". ") // Replace bullet points with pauses
    .replace(/\s+/g, " ") // Normalize spaces
    .replace(/S\/\.?\s*([\d,.]+)/g, "$1 soles") // Pronounce currency
    .replace(/CIP\s+(\d+)/gi, "CIP $1")
    .replace(/CUI\s+(\d+)/gi, "Código Único de Inversión $1")
    .replace(/SPI\s+([\d.]+)/gi, "Índice SPI $1")
    .replace(/D\.S\.\s*0?38-2026-EF/gi, "Decreto Supremo 038 de 2026 EF")
    .trim();
}

let activeUtterance: SpeechSynthesisUtterance | null = null;

export function stopSpeaking(): void {
  try {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      activeUtterance = null;
    }
  } catch (e) {
    console.debug("Stop speaking error", e);
  }
}

export function isSpeaking(): boolean {
  if (typeof window !== "undefined" && "speechSynthesis" in window) {
    return window.speechSynthesis.speaking;
  }
  return false;
}

export function speakText(
  text: string,
  options?: {
    rate?: number;
    pitch?: number;
    onStart?: () => void;
    onEnd?: () => void;
    onError?: (error: any) => void;
  }
): () => void {
  if (!isSpeechSynthesisSupported()) {
    console.warn("Speech synthesis not supported on this browser.");
    options?.onError?.(new Error("Speech synthesis not supported"));
    return () => {};
  }

  stopSpeaking();

  const cleaned = cleanTextForSpeech(text);
  if (!cleaned) {
    options?.onEnd?.();
    return () => {};
  }

  try {
    const utterance = new SpeechSynthesisUtterance(cleaned);
    activeUtterance = utterance;

    utterance.lang = "es-PE"; // Prefer Peruvian Spanish, falls back to standard es
    utterance.rate = options?.rate ?? 1.05; // Slightly conversational pace
    utterance.pitch = options?.pitch ?? 1.0;

    // Pick best Spanish voice if available
    const voices = window.speechSynthesis.getVoices();
    const spanishVoice =
      voices.find((v) => v.lang === "es-PE") ||
      voices.find((v) => v.lang === "es-419") ||
      voices.find((v) => v.lang === "es-US") ||
      voices.find((v) => v.lang.startsWith("es-") && (v.name.includes("Natural") || v.name.includes("Google") || v.name.includes("Sabina") || v.name.includes("Paulina"))) ||
      voices.find((v) => v.lang.startsWith("es"));

    if (spanishVoice) {
      utterance.voice = spanishVoice;
    }

    utterance.onstart = () => {
      options?.onStart?.();
    };

    utterance.onend = () => {
      activeUtterance = null;
      options?.onEnd?.();
    };

    utterance.onerror = (e) => {
      activeUtterance = null;
      console.debug("Utterance error or cancelled", e);
      options?.onError?.(e);
      options?.onEnd?.();
    };

    window.speechSynthesis.speak(utterance);

    return () => {
      stopSpeaking();
    };
  } catch (err) {
    console.warn("Error starting speech synthesis", err);
    options?.onError?.(err);
    return () => {};
  }
}

