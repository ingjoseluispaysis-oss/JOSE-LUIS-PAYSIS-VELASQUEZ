import React from "react";
import { Brain, Copy, X } from "lucide-react";

interface AIModalProps {
  isOpen: boolean;
  title: string;
  text: string;
  onClose: () => void;
}

export const AIModal: React.FC<AIModalProps> = ({ isOpen, title, text, onClose }) => {
  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="w-full max-w-2xl bg-[#0B1D3A] border border-[#1E3A5F] rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="p-4 border-b border-[#1E3A5F] flex justify-between items-center bg-[#030A18]">
          <h3 className="text-[13px] font-bold flex items-center gap-2 text-[#E6F1FF]">
            <Brain size={16} className="text-[#D4A574]" /> {title}
          </h3>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded bg-[#13274F] border border-[#1E3A5F] flex items-center justify-center text-[#8AA0C0] hover:text-white transition-colors"
          >
            <X size={14} />
          </button>
        </div>

        <div className="p-4 max-h-[60vh] overflow-auto">
          <pre className="whitespace-pre-wrap text-[11px] font-mono leading-relaxed text-[#E6F1FF]">
            {text}
          </pre>

          <div className="mt-4 p-3 rounded bg-[#020A1E] border border-[#D4A574]/30 text-[10px] font-mono">
            <div className="text-[#D4A574] font-bold mb-1">
              Base de conocimiento integrada: 10 PDFs, 51 hojas de sustento, Ley 29230 DS 038-2026-EF (64 artículos), PMBOK 8va Ed. (49 procesos), Lean Construction (5 principios), Last Planner System (5 niveles), VDC/BIM, Six Sigma DMAIC, PDCA, Kaizen, 5S, Kanban y A3.
            </div>
            <div className="text-[#8AA0C0]">
              Priorización multicriterio: Impacto &gt; Urgencia &gt; Criticidad | Modelos RICE, WSJF, Matriz Eisenhower y MoSCoW | ROI cuantificado | Acciones directas bajo la responsabilidad técnica del ING. JOSE LUIS PAYSIS VELASQUEZ CIP 101507.
            </div>
          </div>
        </div>

        <div className="p-3 border-t border-[#1E3A5F] flex justify-end gap-2 bg-[#030A18]">
          <button
            onClick={handleCopy}
            className="h-8 px-3 rounded bg-[#0B1D3A] border border-[#1E3A5F] text-[11px] flex items-center gap-1 text-[#E6F1FF] hover:bg-[#13274F] transition-colors"
          >
            <Copy size={12} /> Copiar
          </button>
          <button
            onClick={onClose}
            className="h-8 px-4 rounded bg-[#FEF3C7] text-[#1F1B18] text-[11px] font-bold hover:brightness-95 transition-all"
          >
            Cerrar ✓
          </button>
        </div>
      </div>
    </div>
  );
};
