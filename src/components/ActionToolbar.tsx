import React from "react";
import {
  Plus,
  Copy,
  Trash2,
  Calculator,
  Save,
  Database,
  Upload,
  Download,
  Zap,
  Brain,
  Check,
} from "lucide-react";
import { StorageStatus } from "../types";

interface ActionToolbarProps {
  onNew: () => void;
  onDup: () => void;
  onDel: () => void;
  onAcum: () => void;
  onSave: () => void;
  onStore: () => void;
  onImport: () => void;
  onExport: () => void;
  onCalc: () => void;
  onIA: () => void;
  count: number;
  badge: StorageStatus;
}

export const ActionToolbar: React.FC<ActionToolbarProps> = ({
  onNew,
  onDup,
  onDel,
  onAcum,
  onSave,
  onStore,
  onImport,
  onExport,
  onCalc,
  onIA,
  count,
  badge,
}) => {
  return (
    <div className="flex flex-wrap gap-1.5 p-2 bg-[#030A18]/90 rounded-lg border border-[#1E3A5F]/60 backdrop-blur-md items-center">
      <button
        onClick={onNew}
        className="h-7 px-2.5 rounded-md text-[11px] font-medium transition-all flex items-center gap-1 border active:scale-[0.97] bg-[#0B1D3A] text-[#E6F1FF] border-[#1E3A5F] hover:bg-[#13274F]"
        title="Crear nueva fila en esta sección"
      >
        <Plus size={12} />
        <span>Nueva Fila</span>
      </button>

      <button
        onClick={onDup}
        className="h-7 px-2.5 rounded-md text-[11px] font-medium transition-all flex items-center gap-1 border active:scale-[0.97] bg-[#0B1D3A] text-[#E6F1FF] border-[#1E3A5F] hover:bg-[#13274F]"
        title="Duplicar el registro activo"
      >
        <Copy size={12} />
        <span>Duplicar</span>
      </button>

      <button
        onClick={onDel}
        className="h-7 px-2.5 rounded-md text-[11px] font-medium transition-all flex items-center gap-1 border active:scale-[0.97] bg-[#0B1D3A] text-[#E6F1FF] border-[#1E3A5F] hover:bg-[#13274F]"
        title="Eliminar último registro"
      >
        <Trash2 size={12} />
        <span>Eliminar</span>
      </button>

      <button
        onClick={onAcum}
        className="h-7 px-2.5 rounded-md text-[11px] font-medium transition-all flex items-center gap-1 border active:scale-[0.97] bg-[#0B1D3A] text-[#E6F1FF] border-[#D4A574]/60 hover:bg-[#13274F]"
        title="Acumular metrados y calcular avances progresivos"
      >
        <Calculator size={12} className="text-[#D4A574]" />
        <span>Acumular</span>
      </button>

      <button
        onClick={onSave}
        className="h-7 px-3 rounded-md text-[11px] font-bold transition-all flex items-center gap-1 border border-[#D4A574] active:scale-[0.97] bg-[#FEF3C7] text-[#1F1B18] hover:brightness-95 shadow-sm"
        title="Guardar cambios de forma inmediata"
      >
        <Save size={12} />
        <span>Guardar</span>
      </button>

      <button
        onClick={onStore}
        className="h-7 px-2.5 rounded-md text-[11px] font-medium transition-all flex items-center gap-1 border active:scale-[0.97] bg-[#0B1D3A] text-[#D4A574] border-[#D4A574]/60 hover:bg-[#13274F]"
        title="Persistir en LocalStorage e IndexedDB"
      >
        <Database size={12} />
        <span>Almacenar</span>
      </button>

      <button
        onClick={onImport}
        className="h-7 px-2.5 rounded-md text-[11px] font-medium transition-all flex items-center gap-1 border active:scale-[0.97] bg-[#0B1D3A] text-[#E6F1FF] border-[#1E3A5F] hover:bg-[#13274F]"
        title="Cargar datos CSV o respaldo JSON"
      >
        <Upload size={12} />
        <span>Importar</span>
      </button>

      <button
        onClick={onExport}
        className="h-7 px-2.5 rounded-md text-[11px] font-medium transition-all flex items-center gap-1 border active:scale-[0.97] bg-[#0B1D3A] text-[#E6F1FF] border-[#1E3A5F] hover:bg-[#13274F]"
        title="Exportar archivo CSV con datos actuales"
      >
        <Download size={12} />
        <span>Exportar</span>
      </button>

      <button
        onClick={onCalc}
        className="h-7 px-2.5 rounded-md text-[11px] font-medium transition-all flex items-center gap-1 border active:scale-[0.97] bg-[#0B1D3A] text-[#E6F1FF] border-[#1E3A5F] hover:bg-[#13274F]"
        title="Recalcular métricas de avance y balances"
      >
        <Zap size={12} className="text-[#FF6B00]" />
        <span>Nuevo Cálculo</span>
      </button>

      <button
        onClick={onIA}
        className="h-7 px-3 rounded-md text-[11px] font-medium transition-all flex items-center gap-1 border border-[#FF6B00] active:scale-[0.97] bg-[#7B1C1C] text-white hover:bg-[#9A2222] shadow-sm"
        title="Ejecutar análisis inteligente para esta sección"
      >
        <Brain size={12} className="text-[#D4A574]" />
        <span>IA Analiza</span>
      </button>

      <div className="ml-auto flex items-center gap-2">
        <span className="text-[10px] text-[#8AA0C0] font-mono whitespace-nowrap">
          {count} regs
        </span>

        {badge === "guardado" && (
          <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] flex items-center gap-1 font-mono whitespace-nowrap">
            <Check size={10} /> Guardado ✓
          </span>
        )}
        {badge === "guardado" && (
          <span className="hidden sm:inline px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-200 border border-blue-500/40 text-[10px] font-mono whitespace-nowrap">
            Almacenado en LS+IDB ✓
          </span>
        )}
        {badge === "pendiente" && (
          <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-200 border border-amber-500/40 text-[10px] font-mono whitespace-nowrap">
            Pendiente guardar
          </span>
        )}
        {badge === "no" && (
          <span className="px-2 py-0.5 rounded-full bg-red-500/20 text-red-300 border border-red-500/40 text-[10px] font-mono whitespace-nowrap">
            No almacenado
          </span>
        )}
      </div>
    </div>
  );
};
