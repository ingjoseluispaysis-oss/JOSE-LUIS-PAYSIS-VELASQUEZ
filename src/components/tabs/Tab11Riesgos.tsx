import React, { useState } from "react";
import { OctagonAlert, Table, LayoutGrid } from "lucide-react";
import { RiesgoItem, StorageStatus } from "../../types";
import { EditableField } from "../EditableField";
import { ActionToolbar } from "../ActionToolbar";
import { RiskMatrix5x5, getRiskCoordinate, getCellMeta } from "../RiskMatrix5x5";

interface Tab11RiesgosProps {
  riesgos: RiesgoItem[];
  setRiesgos: React.Dispatch<React.SetStateAction<RiesgoItem[]>>;
  onSave: () => void;
  onExport: () => void;
  onIA: () => void;
  storageStatus: StorageStatus;
}

export const Tab11Riesgos: React.FC<Tab11RiesgosProps> = ({
  riesgos,
  setRiesgos,
  onSave,
  onExport,
  onIA,
  storageStatus,
}) => {
  const [selectedRiskId, setSelectedRiskId] = useState<string | null>("RG-01");
  const [viewMode, setViewMode] = useState<"both" | "matrix" | "table">("both");

  const computeNivel = (prob: number, impacto: number): 'Crítico' | 'Alto' | 'Medio' | 'Bajo' => {
    const { p, i } = getRiskCoordinate(prob, impacto);
    return getCellMeta(p, i).level;
  };

  const handleAddNew = () => {
    const newId = `RG-0${riesgos.length + 1}`;
    const newProb = 65;
    const newImpacto = 70;
    const newNivel = computeNivel(newProb, newImpacto);

    setRiesgos((prev) => [
      ...prev,
      {
        id: newId,
        causa: "Nueva causal de riesgo o restricción técnica",
        inicio: new Date().toISOString().slice(0, 10),
        fin: "2025-12-01",
        dias: 20,
        evidencia: "Asiento de cuaderno de obra",
        norma: "Art 140",
        prob: newProb,
        impacto: newImpacto,
        nivel: newNivel,
      },
    ]);
    setSelectedRiskId(newId);
  };

  return (
    <div className="bg-[#0B1D3A] border border-[#1E3A5F] rounded-xl p-4 shadow-xl space-y-4">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-[14px] font-bold flex items-center gap-2 text-[#E6F1FF]">
          <OctagonAlert size={16} className="text-red-400" />
          ITEM 11 RIESGOS RESTRICCIONES AMPLIACIONES PLAZO EVIDENCIA ALERTAS A3
        </h2>
        <div className="flex items-center gap-2">
          {/* View Mode Switcher */}
          <div className="flex items-center bg-[#030A18] border border-[#1E3A5F] rounded p-0.5 text-[10px] font-mono">
            <button
              onClick={() => setViewMode("both")}
              className={`px-2 py-0.5 rounded transition-all ${
                viewMode === "both"
                  ? "bg-[#1E3A5F] text-[#FEF3C7] font-bold"
                  : "text-[#8AA0C0] hover:text-white"
              }`}
            >
              Matriz + Tabla
            </button>
            <button
              onClick={() => setViewMode("matrix")}
              className={`px-2 py-0.5 rounded transition-all flex items-center gap-1 ${
                viewMode === "matrix"
                  ? "bg-[#1E3A5F] text-[#FEF3C7] font-bold"
                  : "text-[#8AA0C0] hover:text-white"
              }`}
            >
              <LayoutGrid size={11} /> Matriz 5x5
            </button>
            <button
              onClick={() => setViewMode("table")}
              className={`px-2 py-0.5 rounded transition-all flex items-center gap-1 ${
                viewMode === "table"
                  ? "bg-[#1E3A5F] text-[#FEF3C7] font-bold"
                  : "text-[#8AA0C0] hover:text-white"
              }`}
            >
              <Table size={11} /> Tabla Detallada
            </button>
          </div>

          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-red-500/20 text-red-300 border border-red-500/40 font-bold">
            Riesgo Crítico: No entrega terreno Club Social (249 días)
          </span>
        </div>
      </div>

      <ActionToolbar
        onNew={handleAddNew}
        onDup={() => {
          if (riesgos.length === 0) return;
          const last = riesgos[riesgos.length - 1];
          const newId = `RG-${riesgos.length + 1}`;
          setRiesgos((prev) => [
            ...prev,
            { ...last, id: newId },
          ]);
          setSelectedRiskId(newId);
        }}
        onDel={() => {
          setRiesgos((prev) => prev.slice(0, -1));
          if (riesgos.length > 1) {
            setSelectedRiskId(riesgos[riesgos.length - 2].id);
          }
        }}
        onAcum={() => {
          setRiesgos((prev) =>
            prev.map((r) => {
              const newProb = Math.min(95, r.prob + 2);
              return {
                ...r,
                dias: r.dias + 1,
                prob: newProb,
                nivel: computeNivel(newProb, r.impacto),
              };
            })
          );
        }}
        onSave={onSave}
        onStore={onSave}
        onImport={() => {}}
        onExport={onExport}
        onCalc={() => {}}
        onIA={onIA}
        count={riesgos.length}
        badge={storageStatus}
      />

      {/* 5x5 Visual Risk Matrix */}
      {(viewMode === "both" || viewMode === "matrix") && (
        <RiskMatrix5x5
          riesgos={riesgos}
          selectedRiskId={selectedRiskId}
          onSelectRisk={(id) => setSelectedRiskId(id)}
        />
      )}

      {/* Riesgos Table */}
      {(viewMode === "both" || viewMode === "table") && (
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-[11px] font-mono px-1">
            <span className="font-bold text-[#E6F1FF] flex items-center gap-1.5">
              <Table size={13} className="text-[#FF6B00]" />
              REGISTRO CONTRACTUAL DE RIESGOS Y RESTRICCIONES (D.S. 038-2026-EF)
            </span>
            <span className="text-[10px] text-[#8AA0C0]">
              Haz clic en una fila para enfocar en la Matriz 5x5
            </span>
          </div>

          <div className="overflow-auto rounded border border-[#1E3A5F]">
            <table className="w-full text-[11px] font-mono">
              <thead className="bg-[#030A18] text-[#8AA0C0] text-[10px]">
                <tr>
                  <th className="p-2 text-center">ID</th>
                  <th className="p-2 text-left">Causal / Restricción</th>
                  <th className="p-2 text-center">Inicio</th>
                  <th className="p-2 text-center">Fin Estimado</th>
                  <th className="p-2 text-center">Días Afect.</th>
                  <th className="p-2 text-left">Evidencia Documental</th>
                  <th className="p-2 text-center">Norma</th>
                  <th className="p-2 text-center">Prob %</th>
                  <th className="p-2 text-center">Imp %</th>
                  <th className="p-2 text-center">Nivel</th>
                </tr>
              </thead>
              <tbody>
                {riesgos.map((rg) => {
                  const isSelected = selectedRiskId === rg.id;
                  return (
                    <tr
                      key={rg.id}
                      onClick={() => setSelectedRiskId(rg.id)}
                      className={`border-t border-[#1E3A5F]/30 cursor-pointer transition-colors ${
                        isSelected
                          ? "bg-[#1E3A5F]/60 border-l-2 border-l-[#FF6B00]"
                          : "hover:bg-[#13274F]/40"
                      }`}
                    >
                      <td className="p-1 min-w-[70px] text-center font-bold text-[#D4A574]">
                        {rg.id}
                      </td>
                      <td className="p-1 min-w-[240px] text-left">
                        <EditableField
                          value={rg.causa}
                          onSave={(val) =>
                            setRiesgos((prev) =>
                              prev.map((r) => (r.id === rg.id ? { ...r, causa: val } : r))
                            )
                          }
                        />
                      </td>
                      <td className="p-1 min-w-[90px] text-center">
                        <EditableField
                          value={rg.inicio}
                          type="date"
                          onSave={(val) =>
                            setRiesgos((prev) =>
                              prev.map((r) => (r.id === rg.id ? { ...r, inicio: val } : r))
                            )
                          }
                        />
                      </td>
                      <td className="p-1 min-w-[90px] text-center text-[#8AA0C0]">
                        {rg.fin}
                      </td>
                      <td className="p-1 min-w-[70px] text-center text-[#F45D47] font-bold">
                        {rg.dias}d
                      </td>
                      <td className="p-1 min-w-[180px] text-left">
                        <EditableField
                          value={rg.evidencia}
                          onSave={(val) =>
                            setRiesgos((prev) =>
                              prev.map((r) => (r.id === rg.id ? { ...r, evidencia: val } : r))
                            )
                          }
                        />
                      </td>
                      <td className="p-1 min-w-[70px] text-center text-[#8AA0C0]">
                        {rg.norma}
                      </td>
                      <td className="p-1 min-w-[60px] text-center">
                        <EditableField
                          value={rg.prob}
                          type="number"
                          onSave={(val) => {
                            const newProb = Number(val);
                            setRiesgos((prev) =>
                              prev.map((r) =>
                                r.id === rg.id
                                  ? {
                                      ...r,
                                      prob: newProb,
                                      nivel: computeNivel(newProb, r.impacto),
                                    }
                                  : r
                              )
                            );
                          }}
                        />
                      </td>
                      <td className="p-1 min-w-[60px] text-center">
                        <EditableField
                          value={rg.impacto}
                          type="number"
                          onSave={(val) => {
                            const newImpacto = Number(val);
                            setRiesgos((prev) =>
                              prev.map((r) =>
                                r.id === rg.id
                                  ? {
                                      ...r,
                                      impacto: newImpacto,
                                      nivel: computeNivel(r.prob, newImpacto),
                                    }
                                  : r
                              )
                            );
                          }}
                        />
                      </td>
                      <td className="p-1 min-w-[80px] text-center">
                        <span
                          className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                            rg.nivel === "Crítico"
                              ? "bg-red-500/20 text-red-300 border border-red-500/40"
                              : rg.nivel === "Alto"
                              ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                              : rg.nivel === "Medio"
                              ? "bg-yellow-500/20 text-yellow-300 border border-yellow-500/40"
                              : "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                          }`}
                        >
                          {rg.nivel}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Asiento 802, Timeline & Monte Carlo */}
      <div className="mt-3 grid md:grid-cols-3 gap-2">
        <div className="bg-[#020A1E] border border-red-500/40 rounded p-3">
          <div className="text-[11px] font-bold text-red-300 mb-1">
            Asiento 802 Carta Ampliación Art 140 (45 días)
          </div>
          <div className="text-[10px] font-mono leading-relaxed text-[#E6F1FF]">
            Causal saneamiento CUI 2693747 Club Social Ica | HECHO VERIFICADO: Terreno no entregado formalmente desde 11-03-25 | INFERENCIA: Atraso acumulado del 31.43% | SUPUESTO: Liberación el 15-11-25 | FALTANTE: Oficio definitivo de la Entidad. Días afectados en ruta crítica: 249 días.
          </div>
          <div className="mt-2 text-[10px] text-[#FEF3C7] font-semibold">
            Responsable: ING. JOSE LUIS PAYSIS VELASQUEZ CIP 101507
          </div>
        </div>

        <div className="bg-[#020A1E] border border-[#1E3A5F] rounded p-3">
          <div className="text-[11px] font-bold text-[#E6F1FF] mb-1">
            Línea de Tiempo Asientos Cuaderno de Obra
          </div>
          <div className="space-y-1 text-[10px] font-mono">
            <div className="text-[#D4A574]">• Asiento 610: Inicio de restricción terreno Club Social</div>
            <div className="text-[#8AA0C0]">• Asiento 730: Notificación interferencia saneamiento Retamayo</div>
            <div className="text-red-300">• Asientos 774-801: Afectación continua de ruta crítica S3</div>
            <div className="text-emerald-300 font-bold">• Asiento 802: Sustento formal ampliación de plazo 45d</div>
          </div>
        </div>

        <div className="bg-[#020A1E] border border-[#1E3A5F] rounded p-3">
          <div className="text-[11px] font-bold text-[#E6F1FF] mb-1">
            Simulación Monte Carlo (1,000 Iteraciones)
          </div>
          <div className="text-[10px] font-mono text-[#8AA0C0]">
            P50 (Probable): 695 días | P80 (Conservador): 720 días | P90: 755 días
          </div>
          <div className="mt-2 h-12 flex items-end gap-1 px-1">
            {[35, 55, 75, 95, 70, 45, 25].map((val, idx) => (
              <div
                key={idx}
                className="flex-1 bg-[#D4A574] rounded-t hover:bg-[#FF6B00] transition-colors"
                style={{ height: `${val}%` }}
                title={`Iteración ${idx + 1}: ${val}%`}
              />
            ))}
          </div>
          <div className="mt-1 text-[9px] font-mono text-red-300">
            Probabilidad de atraso sin mitigación: 68% (Riesgo Art 135: S/ 4.42M)
          </div>
        </div>
      </div>
    </div>
  );
};

