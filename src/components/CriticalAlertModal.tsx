import React from "react";
import { AlertTriangle, Target, X } from "lucide-react";
import { EVMMetrics } from "../types";

interface CriticalAlertModalProps {
  isOpen: boolean;
  title: string;
  msg: string;
  item: string;
  metrics: EVMMetrics;
  onClose: () => void;
  onTakeAction: () => void;
}

export const CriticalAlertModal: React.FC<CriticalAlertModalProps> = ({
  isOpen,
  title,
  msg,
  item,
  metrics,
  onClose,
  onTakeAction,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-start justify-center pt-6 p-4 bg-red-950/40 backdrop-blur-sm">
      <div className="w-full max-w-lg bg-[#1a0a0a] border-2 border-red-500 rounded-xl shadow-[0_0_40px_rgba(239,68,68,0.5)] overflow-hidden">
        <div className="bg-red-600 text-white p-3 flex items-center gap-3">
          <AlertTriangle size={22} className="animate-bounce shrink-0" />
          <div className="flex-1 min-w-0">
            <div className="text-[13px] font-bold tracking-wide">{title}</div>
            <div className="text-[11px] opacity-90 truncate">
              ALERTA CRÍTICA ITEM {item} - Llamada sonora + notificación preventiva
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded bg-black/20 flex items-center justify-center hover:bg-black/40 transition-colors"
          >
            <X size={14} />
          </button>
        </div>

        <div className="p-4">
          <div className="text-[12px] font-mono leading-relaxed text-red-100">
            {msg}
          </div>

          <div className="mt-3 p-2 rounded bg-black/30 border border-red-500/30 text-[10px] font-mono text-red-200">
            <div className="font-bold text-red-400">Qué ocurrió:</div>
            SPI {metrics.spi.toFixed(2)} &lt; 0.7 indica atraso de {metrics.atraso.toFixed(2)}% con ruta crítica comprometida.
            <div className="font-bold mt-1 text-red-400">Por qué importa:</div>
            Riesgo inminente de aplicación de penalidad por mora Art 135 (hasta 10% = S/4.42M) y causal de resolución según Art 136.
            <div className="font-bold mt-1 text-red-400">Qué hacer:</div>
            Tomar acción en Centro de Decisiones (Item 12), activar Fast-Track/Crash Cost y formular ampliación de plazo según Art 140 por 45 días calendario.
          </div>

          <div className="mt-4 flex gap-2">
            <button
              onClick={onTakeAction}
              className="flex-1 h-9 rounded bg-[#FEF3C7] text-[#1F1B18] text-[11px] font-bold flex items-center justify-center gap-2 hover:brightness-95 transition-all shadow-md"
            >
              <Target size={14} /> Tomar Acción → Centro Decisiones
            </button>
            <button
              onClick={onClose}
              className="h-9 px-4 rounded bg-[#0B1D3A] border border-[#1E3A5F] text-white text-[11px] hover:bg-[#13274F] transition-colors"
            >
              Silenciar Llamada
            </button>
          </div>

          <div className="mt-2 text-[9px] font-mono text-red-300/70">
            Umbrales monitoreados: SPI &lt; 0.70 | CPI &lt; 0.90 | PPC &lt; 70% | TP &lt; 50% | TNC &gt; 30% | Restricción vence &lt; 3d | Desviación avance &gt; 10% | Riesgo penalidad Art 135
          </div>
        </div>
      </div>
    </div>
  );
};
