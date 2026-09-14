import React from "react";
import { Calendar } from "lucide-react";
import { RestriccionItem, StorageStatus } from "../../types";
import { EditableField } from "../EditableField";
import { ActionToolbar } from "../ActionToolbar";

interface Tab8LookaheadProps {
  restricciones: RestriccionItem[];
  setRestricciones: React.Dispatch<React.SetStateAction<RestriccionItem[]>>;
  semanaData: number[];
  setSemanaData: React.Dispatch<React.SetStateAction<number[]>>;
  ppc: number;
  onSave: () => void;
  onExport: () => void;
  onIA: () => void;
  storageStatus: StorageStatus;
}

export const Tab8Lookahead: React.FC<Tab8LookaheadProps> = ({
  restricciones,
  setRestricciones,
  semanaData,
  setSemanaData,
  ppc,
  onSave,
  onExport,
  onIA,
  storageStatus,
}) => {
  const diasSemana = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];

  const abiertas = restricciones.filter((r) => r.estado === "NO").length;
  const liberadas = restricciones.filter((r) => r.estado === "OK").length;

  return (
    <div className="bg-[#0B1D3A] border border-[#1E3A5F] rounded-xl p-4 shadow-xl">
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
        <h2 className="text-[14px] font-bold flex items-center gap-2 text-[#E6F1FF]">
          <Calendar size={16} className="text-[#D4A574]" />
          ITEM 8 LOOKAHEAD 4-6 SEM ITE PLAN SEMANAL PPC LEAN LPS v3
        </h2>
        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#13274F] text-[#D4A574] border border-[#1E3A5F]">
          PPC Semanal: {ppc}% (Meta Lean: &ge; 85%)
        </span>
      </div>

      <ActionToolbar
        onNew={() => {
          setRestricciones((prev) => [
            ...prev,
            {
              id: `R-${Date.now()}`,
              actividad: "Nueva actividad Lookahead",
              tipo: "Información",
              estado: "NO",
              liberado: "No",
              fechaLib: new Date().toISOString().slice(0, 10),
              responsable: "Por asignar",
            },
          ]);
        }}
        onDup={() => {
          if (restricciones.length === 0) return;
          setRestricciones((prev) => [
            ...prev,
            { ...prev[prev.length - 1], id: `R-${Date.now()}` },
          ]);
        }}
        onDel={() => setRestricciones((prev) => prev.slice(0, -1))}
        onAcum={() => {}}
        onSave={onSave}
        onStore={onSave}
        onImport={() => {}}
        onExport={onExport}
        onCalc={() => {}}
        onIA={onIA}
        count={restricciones.length}
        badge={storageStatus}
      />

      <div className="grid md:grid-cols-2 gap-3 mt-3">
        {/* Matriz de Restricciones */}
        <div className="bg-[#020A1E] border border-[#1E3A5F] rounded-lg p-3">
          <div className="flex justify-between items-center mb-2">
            <div className="text-[11px] font-bold text-[#E6F1FF]">
              Matriz de Restricciones ITE (3 Niveles de Liberación)
            </div>
            <div className="text-[10px] font-mono text-[#8AA0C0]">
              {abiertas} abiertas • {liberadas} liberadas
            </div>
          </div>

          <div className="space-y-1.5 max-h-[300px] overflow-auto">
            {restricciones.map((r) => (
              <div
                key={r.id}
                className="flex items-center gap-2 p-2 rounded bg-[#030A18] border border-[#1E3A5F]/50 hover:bg-[#13274F]/30 transition-colors"
              >
                <div
                  className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                    r.estado === "OK" ? "bg-emerald-400" : "bg-red-400 animate-pulse"
                  }`}
                />
                <div className="flex-1 min-w-0 text-[11px] font-mono">
                  <EditableField
                    value={r.actividad}
                    onSave={(val) =>
                      setRestricciones((prev) =>
                        prev.map((item) =>
                          item.id === r.id ? { ...item, actividad: val } : item
                        )
                      )
                    }
                  />
                  <div className="text-[10px] text-[#8AA0C0] truncate mt-0.5">
                    Tipo: {r.tipo} | Resp: {r.responsable} | Vence: {r.fechaLib}
                  </div>
                </div>

                <div className="w-[80px]">
                  <EditableField
                    value={r.estado}
                    type="select"
                    options={["OK", "NO"]}
                    onSave={(val) =>
                      setRestricciones((prev) =>
                        prev.map((item) =>
                          item.id === r.id
                            ? {
                                ...item,
                                estado: val,
                                liberado: val === "OK" ? "Si" : "No",
                              }
                            : item
                        )
                      )
                    }
                  />
                </div>

                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-mono shrink-0 ${
                    r.liberado === "Si"
                      ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                      : "bg-red-500/20 text-red-300 border border-red-500/40"
                  }`}
                >
                  {r.liberado === "Si" ? "Liberado ✓" : "Bloqueado ✗"}
                </span>
              </div>
            ))}
          </div>

          <div className="mt-3 text-[10px] font-mono text-[#8AA0C0] bg-[#030A18] p-2 rounded border border-[#1E3A5F]">
            Causas de No Cumplimiento (CNC): Esperas Terreno (42%) | Interferencias (28%) | Información Técnica (18%) | Materiales (12%)
          </div>
        </div>

        {/* Plan Semanal & PPC */}
        <div className="bg-[#020A1E] border border-[#1E3A5F] rounded-lg p-3 flex flex-col justify-between">
          <div>
            <div className="text-[11px] font-bold mb-2 text-[#E6F1FF]">
              Plan Semanal Lunes a Domingo (Metrado Diario Planificado)
            </div>
            <div className="grid grid-cols-7 gap-1 text-[10px] font-mono">
              {diasSemana.map((dia, idx) => (
                <div
                  key={dia}
                  className="bg-[#030A18] border border-[#1E3A5F] rounded p-1.5 text-center flex flex-col justify-between min-h-[70px]"
                >
                  <div className="text-[#8AA0C0] font-medium truncate">{dia.slice(0, 3)}</div>
                  <div className="my-1">
                    <EditableField
                      value={semanaData[idx] ?? 90}
                      type="number"
                      onSave={(val) => {
                        const updated = [...semanaData];
                        updated[idx] = val;
                        setSemanaData(updated);
                      }}
                    />
                  </div>
                  <div className="w-full h-1.5 bg-[#13274F] rounded overflow-hidden">
                    <div
                      className="h-full bg-[#D4A574]"
                      style={{ width: `${Math.min(100, 50 + idx * 7)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-2">
            <div className="bg-[#030A18] border border-[#1E3A5F] rounded p-2.5 text-center">
              <div className="text-[9px] text-[#8AA0C0]">PPC SEMANAL</div>
              <div className="text-[18px] font-bold text-[#D4A574] font-mono">
                {ppc}%
              </div>
              <div className="text-[9px] text-amber-300">Brecha vs Meta: -17%</div>
            </div>

            <div className="bg-[#030A18] border border-[#1E3A5F] rounded p-2.5 text-center">
              <div className="text-[9px] text-[#8AA0C0]">PCR (RESTRICCIONES)</div>
              <div className="text-[18px] font-bold text-emerald-300 font-mono">
                71.4%
              </div>
              <div className="text-[9px] text-[#8AA0C0]">Liberadas a tiempo</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
