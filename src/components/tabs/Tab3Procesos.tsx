import React from "react";
import { Layers } from "lucide-react";
import { ProcesoItem, SIPOCData, StorageStatus } from "../../types";
import { EditableField } from "../EditableField";
import { ActionToolbar } from "../ActionToolbar";

interface Tab3ProcesosProps {
  procesos: ProcesoItem[];
  setProcesos: React.Dispatch<React.SetStateAction<ProcesoItem[]>>;
  sipoc: SIPOCData;
  setSipoc: React.Dispatch<React.SetStateAction<SIPOCData>>;
  onSave: () => void;
  onExport: () => void;
  onIA: () => void;
  storageStatus: StorageStatus;
}

export const Tab3Procesos: React.FC<Tab3ProcesosProps> = ({
  procesos,
  setProcesos,
  sipoc,
  setSipoc,
  onSave,
  onExport,
  onIA,
  storageStatus,
}) => {
  const avgEfficiency =
    procesos.length > 0
      ? procesos.reduce((acc, p) => acc + p.eff, 0) / procesos.length
      : 0;

  return (
    <div className="space-y-3">
      <div className="bg-[#0B1D3A] border border-[#1E3A5F] rounded-xl p-4 shadow-xl">
        <h2 className="text-[14px] font-bold mb-3 flex items-center gap-2 text-[#E6F1FF]">
          <Layers size={16} className="text-[#D4A574]" />
          ITEM 3 GESTIÓN PROCESOS BPM SIPOC A3 - Eficiencia Operativa
        </h2>

        <ActionToolbar
          onNew={() =>
            setProcesos((prev) => [
              ...prev,
              {
                id: `P${prev.length + 1}`,
                proceso: "Nuevo proceso constructivo",
                tipo: "Operativo",
                desc: "Descripción editable de fases y controles",
                dueno: "Ing. Residente",
                kpi: "% cumplimiento",
                eff: 70,
              },
            ])
          }
          onDup={() => {
            if (procesos.length === 0) return;
            setProcesos((prev) => [
              ...prev,
              { ...prev[prev.length - 1], id: `P${prev.length + 1}` },
            ]);
          }}
          onDel={() => setProcesos((prev) => prev.slice(0, -1))}
          onAcum={() => {
            setProcesos((prev) =>
              prev.map((p) => ({ ...p, eff: Math.min(100, p.eff + 2) }))
            );
          }}
          onSave={onSave}
          onStore={onSave}
          onImport={() => {}}
          onExport={onExport}
          onCalc={() => {}}
          onIA={onIA}
          count={procesos.length}
          badge={storageStatus}
        />

        <div className="grid md:grid-cols-2 gap-3 mt-3">
          {/* Mapa de Procesos */}
          <div className="bg-[#020A1E] border border-[#1E3A5F] rounded-lg p-3">
            <div className="text-[11px] font-bold mb-2 text-[#E6F1FF]">
              Mapa de Procesos Constructivos (BPM Editable)
            </div>
            <div className="overflow-auto max-h-[300px]">
              <table className="w-full text-[11px] font-mono">
                <thead className="text-[#8AA0C0] text-[10px] bg-[#030A18]">
                  <tr>
                    <th className="p-1.5 text-left">Proceso</th>
                    <th className="p-1.5 text-left">Tipo</th>
                    <th className="p-1.5 text-left">Dueño</th>
                    <th className="p-1.5 text-center">Eff %</th>
                  </tr>
                </thead>
                <tbody>
                  {procesos.map((proc) => (
                    <tr key={proc.id} className="border-t border-[#1E3A5F]/30 hover:bg-[#13274F]/40">
                      <td className="p-1">
                        <EditableField
                          value={proc.proceso}
                          onSave={(val) =>
                            setProcesos((prev) =>
                              prev.map((item) =>
                                item.id === proc.id ? { ...item, proceso: val } : item
                              )
                            )
                          }
                        />
                      </td>
                      <td className="p-1">
                        <EditableField
                          value={proc.tipo}
                          type="select"
                          options={["Estratégico", "Operativo", "Soporte"]}
                          onSave={(val) =>
                            setProcesos((prev) =>
                              prev.map((item) =>
                                item.id === proc.id ? { ...item, tipo: val } : item
                              )
                            )
                          }
                        />
                      </td>
                      <td className="p-1">
                        <EditableField
                          value={proc.dueno}
                          onSave={(val) =>
                            setProcesos((prev) =>
                              prev.map((item) =>
                                item.id === proc.id ? { ...item, dueno: val } : item
                              )
                            )
                          }
                        />
                      </td>
                      <td className="p-1 text-center">
                        <EditableField
                          value={proc.eff}
                          type="number"
                          onSave={(val) =>
                            setProcesos((prev) =>
                              prev.map((item) =>
                                item.id === proc.id ? { ...item, eff: val } : item
                              )
                            )
                          }
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mt-2 text-[10px] text-[#D4A574] font-mono">
              Eficiencia acumulada promedio: {avgEfficiency.toFixed(1)}% | Meta Lean: &gt;80%
            </div>
          </div>

          {/* SIPOC + A3 */}
          <div className="bg-[#020A1E] border border-[#1E3A5F] rounded-lg p-3 flex flex-col justify-between">
            <div>
              <div className="text-[11px] font-bold mb-2 text-[#E6F1FF]">
                Matriz SIPOC Veredas (Editable inline)
              </div>
              {(["suppliers", "inputs", "process", "outputs", "customers"] as const).map(
                (key) => (
                  <div key={key} className="mb-2">
                    <div className="text-[10px] text-[#8AA0C0] uppercase font-semibold">
                      {key}
                    </div>
                    <EditableField
                      value={sipoc[key]}
                      onSave={(val) => setSipoc((prev) => ({ ...prev, [key]: val }))}
                    />
                  </div>
                )
              )}
            </div>

            <div className="mt-3 p-2.5 bg-[#7B1C1C]/20 border border-[#7B1C1C]/40 rounded text-[10px] font-mono leading-relaxed">
              <span className="font-bold text-[#FF6B00]">Plantilla A3 Lean: </span>
              Título: &quot;Atraso Veredas S3 Sector Club Social&quot; | Contexto: &quot;Interferencia CUI 2693747&quot; | Causa Raíz: &quot;Espera material (32%) + Accesos no liberados (249d)&quot; | Contramedida: Kanban en patio de acopio + Nivelación Heijunka | Seguimiento diario PPC.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
