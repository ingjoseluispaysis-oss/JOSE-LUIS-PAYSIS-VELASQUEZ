import React, { useState } from "react";
import { AlertTriangle, ShieldAlert, CheckCircle2, Info, ArrowUpRight, ShieldCheck } from "lucide-react";
import { RiesgoItem } from "../types";

interface RiskMatrixProps {
  riesgos: RiesgoItem[];
  selectedRiskId?: string | null;
  onSelectRisk?: (riskId: string) => void;
}

export interface CellMeta {
  p: number; // 1 to 5
  i: number; // 1 to 5
  score: number;
  level: "Crítico" | "Alto" | "Medio" | "Bajo";
  bgClass: string;
  borderClass: string;
  textClass: string;
  label: string;
}

export function getRiskCoordinate(prob: number, impacto: number): { p: number; i: number } {
  const getP = (v: number) => {
    if (v <= 20) return 1;
    if (v <= 40) return 2;
    if (v <= 60) return 3;
    if (v <= 80) return 4;
    return 5;
  };
  return { p: getP(prob), i: getP(impacto) };
}

export function getCellMeta(p: number, i: number): CellMeta {
  const score = p * i;
  if (score >= 15) {
    return {
      p,
      i,
      score,
      level: "Crítico",
      bgClass: "bg-red-950/60 hover:bg-red-900/70",
      borderClass: "border-red-600/50",
      textClass: "text-red-300",
      label: "Crítico (15-25)",
    };
  }
  if (score >= 10) {
    return {
      p,
      i,
      score,
      level: "Alto",
      bgClass: "bg-amber-950/50 hover:bg-amber-900/60",
      borderClass: "border-amber-500/50",
      textClass: "text-amber-300",
      label: "Alto (10-14)",
    };
  }
  if (score >= 5) {
    return {
      p,
      i,
      score,
      level: "Medio",
      bgClass: "bg-yellow-950/40 hover:bg-yellow-900/50",
      borderClass: "border-yellow-600/40",
      textClass: "text-yellow-300",
      label: "Medio (5-9)",
    };
  }
  return {
    p,
    i,
    score,
    level: "Bajo",
    bgClass: "bg-emerald-950/40 hover:bg-emerald-900/50",
    borderClass: "border-emerald-600/40",
    textClass: "text-emerald-300",
    label: "Bajo (1-4)",
  };
}

export const RiskMatrix5x5: React.FC<RiskMatrixProps> = ({
  riesgos,
  selectedRiskId: externalSelectedId,
  onSelectRisk,
}) => {
  const [internalSelectedId, setInternalSelectedId] = useState<string | null>(null);
  const selectedId = externalSelectedId !== undefined ? externalSelectedId : internalSelectedId;

  const handleSelect = (id: string) => {
    if (onSelectRisk) onSelectRisk(id);
    setInternalSelectedId(id);
  };

  // Group risks by (p, i) coordinate
  const matrixCells: Record<string, RiesgoItem[]> = {};
  for (let p = 1; p <= 5; p++) {
    for (let i = 1; i <= 5; i++) {
      matrixCells[`${p}-${i}`] = [];
    }
  }

  let totalCriticos = 0;
  let totalAltos = 0;
  let totalMedios = 0;
  let totalBajos = 0;

  riesgos.forEach((r) => {
    const { p, i } = getRiskCoordinate(r.prob, r.impacto);
    const key = `${p}-${i}`;
    if (matrixCells[key]) {
      matrixCells[key].push(r);
    }
    const score = p * i;
    if (score >= 15) totalCriticos++;
    else if (score >= 10) totalAltos++;
    else if (score >= 5) totalMedios++;
    else totalBajos++;
  });

  const selectedRisk = riesgos.find((r) => r.id === selectedId) || riesgos[0];

  const probLabels = [
    { p: 5, label: "5 - Muy Alta", range: "> 80%" },
    { p: 4, label: "4 - Alta", range: "61 - 80%" },
    { p: 3, label: "3 - Media", range: "41 - 60%" },
    { p: 2, label: "2 - Baja", range: "21 - 40%" },
    { p: 1, label: "1 - Muy Baja", range: "≤ 20%" },
  ];

  const impactoLabels = [
    { i: 1, label: "1 - Insignificante", range: "≤ 20%" },
    { i: 2, label: "2 - Menor", range: "21 - 40%" },
    { i: 3, label: "3 - Moderado", range: "41 - 60%" },
    { i: 4, label: "4 - Mayor", range: "61 - 80%" },
    { i: 5, label: "5 - Catastrófico", range: "> 80%" },
  ];

  return (
    <div className="bg-[#030A18] border border-[#1E3A5F] rounded-xl p-3 md:p-4 shadow-2xl space-y-4">
      {/* Top Header & Metrics Summary */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pb-3 border-b border-[#1E3A5F]/60">
        <div>
          <div className="flex items-center gap-2">
            <ShieldAlert size={18} className="text-[#FF6B00]" />
            <h3 className="text-[13px] md:text-[14px] font-bold text-[#E6F1FF] tracking-wide">
              MATRIZ DE RIESGOS 5×5 (PROBABILIDAD vs. IMPACTO)
            </h3>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#13274F] text-[#FEF3C7] border border-[#1E3A5F]">
              ISO 31000 / PMBOK 7 / D.S. 038-2026-EF
            </span>
          </div>
          <p className="text-[11px] font-mono text-[#8AA0C0] mt-0.5">
            Mapeo automático de {riesgos.length} riesgos según severidad en ruta crítica y contractual
          </p>
        </div>

        {/* Criticality Badges Counter */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-red-950/70 border border-red-500/50 text-red-200 text-[10px] font-mono font-bold shadow-sm">
            <span className="w-2 h-2 rounded-full bg-red-400 animate-ping" />
            <span>Crítico: {totalCriticos}</span>
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-amber-950/70 border border-amber-500/50 text-amber-200 text-[10px] font-mono font-bold shadow-sm">
            <span className="w-2 h-2 rounded-full bg-amber-400" />
            <span>Alto: {totalAltos}</span>
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-yellow-950/60 border border-yellow-500/50 text-yellow-200 text-[10px] font-mono font-bold shadow-sm">
            <span className="w-2 h-2 rounded-full bg-yellow-400" />
            <span>Medio: {totalMedios}</span>
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-emerald-950/60 border border-emerald-500/50 text-emerald-200 text-[10px] font-mono font-bold shadow-sm">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span>Bajo: {totalBajos}</span>
          </div>
        </div>
      </div>

      {/* Main Content: 5x5 Grid + Detail Panel */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-4">
        {/* The 5x5 Matrix Grid (8 cols) */}
        <div className="xl:col-span-8 flex flex-col">
          <div className="overflow-x-auto pb-1">
            <div className="min-w-[500px]">
              {/* Matrix Layout with Axis Labels */}
              <div className="flex">
                {/* Y-Axis Title Rotated */}
                <div className="w-8 flex items-center justify-center">
                  <span className="-rotate-90 whitespace-nowrap text-[10px] font-bold uppercase tracking-widest text-[#FF6B00] flex items-center gap-1 font-mono">
                    <ArrowUpRight size={12} className="rotate-45" /> PROBABILIDAD (P)
                  </span>
                </div>

                {/* Grid proper */}
                <div className="flex-1 flex flex-col">
                  {/* Rows 5 down to 1 */}
                  {probLabels.map(({ p, label, range }) => (
                    <div key={p} className="flex items-stretch mb-1 gap-1">
                      {/* Row Label */}
                      <div className="w-24 shrink-0 flex flex-col justify-center text-right pr-2 font-mono">
                        <span className="text-[10px] font-bold text-[#E6F1FF] leading-tight">
                          {label}
                        </span>
                        <span className="text-[8px] text-[#8AA0C0]">{range}</span>
                      </div>

                      {/* 5 Cells across Impact 1 to 5 */}
                      <div className="flex-1 grid grid-cols-5 gap-1">
                        {[1, 2, 3, 4, 5].map((i) => {
                          const meta = getCellMeta(p, i);
                          const cellRisks = matrixCells[`${p}-${i}`] || [];
                          const hasRisks = cellRisks.length > 0;

                          return (
                            <div
                              key={i}
                              className={`relative min-h-[58px] p-1.5 rounded border transition-all flex flex-col justify-between ${
                                meta.bgClass
                              } ${meta.borderClass} ${
                                hasRisks ? "ring-1 ring-white/20 shadow-md" : "opacity-80"
                              }`}
                            >
                              {/* Cell Score Header */}
                              <div className="flex items-center justify-between text-[8px] font-mono opacity-60">
                                <span>
                                  P{p}×I{i}
                                </span>
                                <span className="font-bold">{meta.score}</span>
                              </div>

                              {/* Plotted Risk Badges */}
                              <div className="flex flex-wrap gap-1 my-1">
                                {cellRisks.map((rg) => {
                                  const isSelected = selectedId === rg.id;
                                  return (
                                    <button
                                      key={rg.id}
                                      onClick={() => handleSelect(rg.id)}
                                      title={`${rg.id}: ${rg.causa} (${rg.dias}d afectados)`}
                                      className={`group relative text-[9px] font-mono font-bold px-1.5 py-0.5 rounded shadow transition-all active:scale-95 ${
                                        isSelected
                                          ? "bg-white text-[#030A18] ring-2 ring-[#FF6B00] font-black scale-105 z-10"
                                          : meta.level === "Crítico"
                                          ? "bg-red-500 text-white hover:bg-red-400"
                                          : meta.level === "Alto"
                                          ? "bg-amber-500 text-black hover:bg-amber-400"
                                          : meta.level === "Medio"
                                          ? "bg-yellow-500 text-black hover:bg-yellow-400"
                                          : "bg-emerald-500 text-white hover:bg-emerald-400"
                                      }`}
                                    >
                                      <span>{rg.id}</span>
                                      {rg.dias > 100 && (
                                        <span className="ml-1 text-[7px] opacity-90">
                                          ({rg.dias}d)
                                        </span>
                                      )}
                                    </button>
                                  );
                                })}
                              </div>

                              {/* Cell Level Text */}
                              <div className="text-[7.5px] font-mono uppercase tracking-wider text-right opacity-70">
                                {meta.level}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}

                  {/* X-Axis Header/Labels */}
                  <div className="flex items-stretch mt-1 gap-1">
                    <div className="w-24 shrink-0" />
                    <div className="flex-1 grid grid-cols-5 gap-1">
                      {impactoLabels.map(({ i, label, range }) => (
                        <div
                          key={i}
                          className="text-center font-mono py-1 px-0.5 bg-[#0A1931]/60 rounded border border-[#1E3A5F]/40"
                        >
                          <div className="text-[9px] font-bold text-[#E6F1FF] truncate">
                            {label}
                          </div>
                          <div className="text-[8px] text-[#8AA0C0]">{range}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* X-Axis Title */}
                  <div className="text-center mt-2 font-mono text-[10px] font-bold uppercase tracking-widest text-[#FF6B00] flex items-center justify-center gap-1">
                    IMPACTO EN PLAZO / COSTO (I) <ArrowUpRight size={12} className="rotate-45" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Matrix Legend / Color Key */}
          <div className="mt-3 pt-2.5 border-t border-[#1E3A5F]/50 flex flex-wrap items-center justify-between gap-2 text-[10px] font-mono">
            <div className="flex items-center gap-3">
              <span className="text-[#8AA0C0] font-semibold">Niveles de Criticidad:</span>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded bg-red-600 border border-red-400" />
                <span className="text-red-300">Crítico (15-25)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded bg-amber-500 border border-amber-300" />
                <span className="text-amber-300">Alto (10-14)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded bg-yellow-500 border border-yellow-300" />
                <span className="text-yellow-300">Medio (5-9)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded bg-emerald-500 border border-emerald-300" />
                <span className="text-emerald-300">Bajo (1-4)</span>
              </div>
            </div>
            <div className="text-[#FEF3C7] text-[9px]">
              Fórmula: Score = P (1..5) × I (1..5)
            </div>
          </div>
        </div>

        {/* Selected Risk Inspection Card (4 cols) */}
        <div className="xl:col-span-4 bg-[#0A1931]/90 border border-[#1E3A5F] rounded-lg p-3.5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-2 border-b border-[#1E3A5F]">
              <div className="flex items-center gap-1.5">
                <Info size={14} className="text-[#FF6B00]" />
                <span className="text-[11px] font-bold text-[#E6F1FF] uppercase font-mono">
                  Detalle del Riesgo Mapeado
                </span>
              </div>
              {selectedRisk && (
                <span
                  className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded border ${
                    selectedRisk.nivel === "Crítico"
                      ? "bg-red-500/20 text-red-300 border-red-500/40"
                      : selectedRisk.nivel === "Alto"
                      ? "bg-amber-500/20 text-amber-300 border-amber-500/40"
                      : "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
                  }`}
                >
                  {selectedRisk.nivel}
                </span>
              )}
            </div>

            {selectedRisk ? (
              <div className="mt-3 space-y-2.5 text-[11px] font-mono">
                {/* ID & Causa */}
                <div>
                  <div className="text-[9px] text-[#8AA0C0] uppercase">Código y Causal</div>
                  <div className="font-bold text-[#FEF3C7] text-[12px] flex items-center gap-1.5">
                    <span className="px-1.5 py-0.5 rounded bg-[#13274F] text-[#D4A574]">
                      {selectedRisk.id}
                    </span>
                    <span className="line-clamp-2">{selectedRisk.causa}</span>
                  </div>
                </div>

                {/* P & I Score Metric */}
                {(() => {
                  const { p, i } = getRiskCoordinate(selectedRisk.prob, selectedRisk.impacto);
                  const meta = getCellMeta(p, i);
                  return (
                    <div className="grid grid-cols-3 gap-1.5 bg-[#030A18] p-2 rounded border border-[#1E3A5F]/60 text-center">
                      <div>
                        <div className="text-[8px] text-[#8AA0C0]">Probabilidad</div>
                        <div className="font-bold text-white text-[12px]">
                          {selectedRisk.prob}%
                        </div>
                        <div className="text-[8px] text-[#FF6B00]">Nivel P{p}</div>
                      </div>
                      <div>
                        <div className="text-[8px] text-[#8AA0C0]">Impacto</div>
                        <div className="font-bold text-white text-[12px]">
                          {selectedRisk.impacto}%
                        </div>
                        <div className="text-[8px] text-[#FF6B00]">Nivel I{i}</div>
                      </div>
                      <div>
                        <div className="text-[8px] text-[#8AA0C0]">Severidad</div>
                        <div className={`font-bold text-[12px] ${meta.textClass}`}>
                          {meta.score} / 25
                        </div>
                        <div className={`text-[8px] font-bold ${meta.textClass}`}>
                          {meta.level}
                        </div>
                      </div>
                    </div>
                  );
                })()}

                {/* Days & Dates */}
                <div className="grid grid-cols-2 gap-2 text-[10px]">
                  <div className="bg-[#030A18] p-2 rounded border border-[#1E3A5F]/40">
                    <div className="text-[#8AA0C0] text-[8px]">Afectación Ruta Crítica</div>
                    <div className="text-red-300 font-bold text-[12px]">
                      {selectedRisk.dias} días
                    </div>
                    <div className="text-[8px] text-[#8AA0C0]">
                      {selectedRisk.inicio} → {selectedRisk.fin}
                    </div>
                  </div>
                  <div className="bg-[#030A18] p-2 rounded border border-[#1E3A5F]/40">
                    <div className="text-[#8AA0C0] text-[8px]">Norma Aplicable</div>
                    <div className="text-[#FEF3C7] font-bold text-[11px] truncate">
                      {selectedRisk.norma}
                    </div>
                    <div className="text-[8px] text-[#8AA0C0]">D.S. 038-2026-EF</div>
                  </div>
                </div>

                {/* Evidencia Documental */}
                <div className="bg-[#030A18] p-2 rounded border border-[#1E3A5F]/40">
                  <div className="text-[8px] text-[#8AA0C0]">Evidencia Documental Registrada</div>
                  <div className="text-[#E6F1FF] text-[10px] mt-0.5">
                    {selectedRisk.evidencia}
                  </div>
                </div>

                {/* Action Recommendation */}
                <div className="p-2 rounded bg-gradient-to-r from-red-950/40 to-[#0A1931] border border-red-500/30">
                  <div className="flex items-center gap-1 text-[9px] font-bold text-red-300 uppercase">
                    <AlertTriangle size={11} /> Plan de Respuesta Recomendado
                  </div>
                  <div className="text-[9px] text-[#FEF3C7] mt-0.5 leading-relaxed">
                    {selectedRisk.id === "RG-01"
                      ? "Aperturar Asiento 802 en cuaderno de obra y remitir Carta de Ampliación de Plazo Art 140 por 45 días calendario con informe pericial de interferencia Club Social."
                      : selectedRisk.id === "RG-02"
                      ? "Coordinar intervención de bombeo de aniegos con EMAPICA y activar Art 87 para reprogramación de frente Retamayo sin penalidad."
                      : "Sustentar devengado de valorizaciones conforme Art 135-136 para evitar desabastecimiento financiero de cuadrillas."}
                  </div>
                </div>
              </div>
            ) : (
              <div className="py-8 text-center text-[#8AA0C0] text-[11px] font-mono">
                Selecciona un riesgo en la matriz para ver su detalle
              </div>
            )}
          </div>

          <div className="mt-3 pt-2 border-t border-[#1E3A5F]/60 flex items-center justify-between text-[9px] font-mono text-[#8AA0C0]">
            <span className="flex items-center gap-1">
              <CheckCircle2 size={11} className="text-emerald-400" /> Matriz sincronizada
            </span>
            <span>Clic en [RG-xx] para enfocar</span>
          </div>
        </div>
      </div>
    </div>
  );
};
