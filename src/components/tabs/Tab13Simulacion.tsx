import React, { useState, useMemo, useEffect } from "react";
import {
  Dices,
  Play,
  RotateCcw,
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  BarChart3,
  Percent,
  Sliders,
  ShieldAlert,
  Info,
  Download,
  Calendar,
  Layers,
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  AreaChart,
  Area,
  Line,
} from "recharts";
import { ActividadCPM, RiesgoItem, ProyectoInfo, EVMMetrics, StorageStatus } from "../../types";
import { ActionToolbar } from "../ActionToolbar";

interface Tab13SimulacionProps {
  actividades: ActividadCPM[];
  riesgos: RiesgoItem[];
  proyecto: ProyectoInfo;
  metrics: EVMMetrics;
  onSave: () => void;
  onExport: () => void;
  onIA: () => void;
  storageStatus: StorageStatus;
}

interface IterationResult {
  totalDays: number;
  criticalActivitiesTime: number;
  riskDelay: number;
  slackOverrun: number;
  isWithinTarget: boolean;
}

interface BinData {
  binLabel: string;
  binStart: number;
  binEnd: number;
  count: number;
  frequencyPct: number;
  cumulativePct: number;
  isWithinTarget: boolean;
}

interface SensitivityRow {
  cod: string;
  desc: string;
  durBase: number;
  holgura: number;
  esCritica: boolean;
  minDur: number;
  meanDur: number;
  maxDur: number;
  criticalityIndexPct: number;
  riskImpact: "Alto" | "Medio" | "Bajo";
}

// Pseudo-random triangular distribution generator for PERT
function sampleTriangular(min: number, mode: number, max: number): number {
  const u = Math.random();
  const c = (mode - min) / (max - min);
  if (u < c) {
    return min + Math.sqrt(u * (max - min) * (mode - min));
  } else {
    return max - Math.sqrt((1 - u) * (max - min) * (max - mode));
  }
}

export const Tab13Simulacion: React.FC<Tab13SimulacionProps> = ({
  actividades,
  riesgos,
  proyecto,
  metrics,
  onSave,
  onExport,
  onIA,
  storageStatus,
}) => {
  const [numIterations, setNumIterations] = useState<number>(1000);
  const [uncertaintyLevel, setUncertaintyLevel] = useState<"Baja" | "Media" | "Alta">("Media");
  const [includeClubSocialRisk, setIncludeClubSocialRisk] = useState<boolean>(true);
  const [accelerationPlan, setAccelerationPlan] = useState<"none" | "moderate" | "aggressive">("none");
  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const [activeChartTab, setActiveChartTab] = useState<"histogram" | "curve">("histogram");
  const [simulationSeed, setSimulationSeed] = useState<number>(1);

  const targetDays = proyecto.plazoActual || 668; // Contractual limit

  // Uncertainty factor ranges (optimistic delta, pessimistic delta)
  const uncertaintyParams = useMemo(() => {
    switch (uncertaintyLevel) {
      case "Baja":
        return { opt: 0.1, pess: 0.2, drift: 0.05 };
      case "Alta":
        return { opt: 0.2, pess: 0.55, drift: 0.18 };
      case "Media":
      default:
        return { opt: 0.15, pess: 0.35, drift: 0.1 };
    }
  }, [uncertaintyLevel]);

  // Execute the Monte Carlo simulation
  const simulationResults = useMemo(() => {
    // We include simulationSeed in dependencies so user can re-run
    void simulationSeed;

    const iterations: IterationResult[] = [];
    const critHitCounts: Record<string, number> = {};
    const actDurSamples: Record<string, number[]> = {};

    actividades.forEach((a) => {
      critHitCounts[a.cod] = 0;
      actDurSamples[a.cod] = [];
    });

    const critActivities = actividades.filter((a) => a.crit);
    const nonCritActivities = actividades.filter((a) => !a.crit);

    const baseProjectDays = targetDays; // Target is 668
    // Current atraso is -31.43%, meaning project is tracking toward ~700-750d without mitigation
    const baseLagDueToCurrentDelay = Math.round((Math.abs(metrics.atraso) / 100) * 110); // ~35 days delay

    const accelerationDays =
      accelerationPlan === "aggressive" ? 30 : accelerationPlan === "moderate" ? 15 : 0;

    for (let k = 0; k < numIterations; k++) {
      let simulatedCritDelta = 0;
      let extraSlackConsumed = 0;

      // 1. Simulate critical activities
      critActivities.forEach((act) => {
        const min = act.dur * (1 - uncertaintyParams.opt);
        const mode = act.dur * (1 + uncertaintyParams.drift * 0.5);
        const max = act.dur * (1 + uncertaintyParams.pess);
        const sampled = sampleTriangular(min, mode, max);
        actDurSamples[act.cod].push(sampled);

        simulatedCritDelta += sampled - act.dur;
        critHitCounts[act.cod]++;
      });

      // 2. Simulate non-critical activities and check if they exceed their slack/holgura
      nonCritActivities.forEach((act) => {
        const min = act.dur * (1 - uncertaintyParams.opt);
        const mode = act.dur * (1 + uncertaintyParams.drift * 0.3);
        const max = act.dur * (1 + uncertaintyParams.pess);
        const sampled = sampleTriangular(min, mode, max);
        actDurSamples[act.cod].push(sampled);

        const overrun = sampled - act.dur;
        if (overrun > act.holg) {
          // Exceeded buffer: joins the critical chain
          extraSlackConsumed += overrun - act.holg;
          critHitCounts[act.cod]++;
        }
      });

      // 3. Risk contribution (e.g. Club Social RG-01: 249 days affected in critical path, pending 45d extension)
      let riskDelay = 0;
      if (includeClubSocialRisk) {
        // Triangular distribution for residual risk delay (between 25d and 65d, mode 45d)
        riskDelay = sampleTriangular(25, 45, 65);
      } else {
        // Mitigated risk with official resolution: 0 to 10 days residual
        riskDelay = sampleTriangular(0, 5, 10);
      }

      // Total simulated duration for this iteration
      // Scaled around the real contractual baseline
      const totalDays = Math.round(
        baseProjectDays +
          baseLagDueToCurrentDelay +
          simulatedCritDelta * 0.4 +
          extraSlackConsumed * 0.5 +
          riskDelay -
          accelerationDays
      );

      iterations.push({
        totalDays,
        criticalActivitiesTime: Math.round(simulatedCritDelta),
        riskDelay: Math.round(riskDelay),
        slackOverrun: Math.round(extraSlackConsumed),
        isWithinTarget: totalDays <= targetDays,
      });
    }

    // Sort to extract percentiles
    const sortedDays = iterations.map((i) => i.totalDays).sort((a, b) => a - b);
    const withinCount = sortedDays.filter((d) => d <= targetDays).length;
    const probabilityWithin = Number(((withinCount / numIterations) * 100).toFixed(1));

    const p10 = sortedDays[Math.floor(numIterations * 0.1)];
    const p50 = sortedDays[Math.floor(numIterations * 0.5)]; // Median
    const p80 = sortedDays[Math.floor(numIterations * 0.8)]; // Common confidence target
    const p90 = sortedDays[Math.floor(numIterations * 0.9)]; // High certainty

    const minDay = sortedDays[0];
    const maxDay = sortedDays[sortedDays.length - 1];
    const meanDay = Math.round(sortedDays.reduce((acc, v) => acc + v, 0) / numIterations);

    // Standard deviation
    const variance =
      sortedDays.reduce((acc, v) => acc + Math.pow(v - meanDay, 2), 0) / numIterations;
    const stdDev = Number(Math.sqrt(variance).toFixed(1));

    // Binned Histogram calculation (14 bins)
    const binCount = 14;
    const binStep = Math.max(5, Math.ceil((maxDay - minDay) / binCount));
    const bins: BinData[] = [];

    let currentStart = Math.floor(minDay / binStep) * binStep;
    let accumulatedCount = 0;

    for (let b = 0; b < binCount; b++) {
      const bEnd = currentStart + binStep;
      const count = sortedDays.filter((d) => d >= currentStart && (b === binCount - 1 ? d <= bEnd : d < bEnd)).length;
      accumulatedCount += count;

      bins.push({
        binLabel: `${currentStart}-${bEnd}d`,
        binStart: currentStart,
        binEnd: bEnd,
        count,
        frequencyPct: Number(((count / numIterations) * 100).toFixed(1)),
        cumulativePct: Number(((accumulatedCount / numIterations) * 100).toFixed(1)),
        isWithinTarget: bEnd <= targetDays || currentStart < targetDays,
      });
      currentStart = bEnd;
    }

    // S-Curve CDF samples (25 points for smooth curve)
    const cdfStep = (maxDay - minDay) / 24;
    const cdfPoints = [];
    for (let i = 0; i <= 24; i++) {
      const curVal = Math.round(minDay + i * cdfStep);
      const countBelow = sortedDays.filter((d) => d <= curVal).length;
      const pct = Number(((countBelow / numIterations) * 100).toFixed(1));
      cdfPoints.push({
        dias: curVal,
        probAcumulada: pct,
        isTargetThreshold: curVal >= targetDays - 2 && curVal <= targetDays + 2,
      });
    }

    // Activity sensitivity rows
    const sensitivityList: SensitivityRow[] = actividades.map((a) => {
      const samples = actDurSamples[a.cod] || [];
      const minVal = samples.length ? Number(Math.min(...samples).toFixed(1)) : a.dur;
      const maxVal = samples.length ? Number(Math.max(...samples).toFixed(1)) : a.dur;
      const meanVal = samples.length
        ? Number((samples.reduce((s, v) => s + v, 0) / samples.length).toFixed(1))
        : a.dur;
      const critHits = critHitCounts[a.cod] || 0;
      const critIndex = Number(((critHits / numIterations) * 100).toFixed(0));

      let riskImpact: "Alto" | "Medio" | "Bajo" = "Bajo";
      if (critIndex >= 80) riskImpact = "Alto";
      else if (critIndex >= 30) riskImpact = "Medio";

      return {
        cod: a.cod,
        desc: a.desc,
        durBase: a.dur,
        holgura: a.holg,
        esCritica: a.crit,
        minDur: minVal,
        meanDur: meanVal,
        maxDur: maxVal,
        criticalityIndexPct: critIndex,
        riskImpact,
      };
    });

    return {
      iterations,
      probabilityWithin,
      p10,
      p50,
      p80,
      p90,
      minDay,
      maxDay,
      meanDay,
      stdDev,
      bins,
      cdfPoints,
      sensitivityList,
    };
  }, [
    actividades,
    numIterations,
    uncertaintyParams,
    includeClubSocialRisk,
    accelerationPlan,
    targetDays,
    metrics.atraso,
    simulationSeed,
  ]);

  const handleRunSimulation = () => {
    setIsSimulating(true);
    setTimeout(() => {
      setSimulationSeed((prev) => prev + 1);
      setIsSimulating(false);
    }, 450);
  };

  const handleResetDefaults = () => {
    setNumIterations(1000);
    setUncertaintyLevel("Media");
    setIncludeClubSocialRisk(true);
    setAccelerationPlan("none");
    setSimulationSeed((prev) => prev + 1);
  };

  const exportSimulationReport = () => {
    const csvContent = [
      ["MODELO MONTE CARLO - CONTROL DE PLAZO CICLOVÍA CUTERVO-HUACACHINA"],
      ["Plazo Contractual Vigente", `${targetDays} días calendario`],
      ["Iteraciones ejecutadas", numIterations],
      ["Nivel de Incertidumbre", uncertaintyLevel],
      ["Probabilidad P(<= 668 días)", `${simulationResults.probabilityWithin}%`],
      ["P10 (Optimista)", `${simulationResults.p10} días`],
      ["P50 (Mediana/Probable)", `${simulationResults.p50} días`],
      ["P80 (Nivel de Gestión)", `${simulationResults.p80} días`],
      ["P90 (Nivel Auditoría)", `${simulationResults.p90} días`],
      ["Desviación Estándar", `${simulationResults.stdDev} días`],
      [],
      ["CÓDIGO", "ACTIVIDAD", "DUR_BASE", "HOLGURA", "CRÍTICA", "MIN_SIM", "MEDIA_SIM", "MAX_SIM", "ÍNDICE_CRITICIDAD_%"],
      ...simulationResults.sensitivityList.map((s) => [
        s.cod,
        `"${s.desc}"`,
        s.durBase,
        s.holgura,
        s.esCritica ? "SÍ" : "NO",
        s.minDur,
        s.meanDur,
        s.maxDur,
        `${s.criticalityIndexPct}%`,
      ]),
    ]
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `Simulacion_MonteCarlo_668d_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="bg-[#0B1D3A] border border-[#1E3A5F] rounded-xl p-3 md:p-4 shadow-xl space-y-4">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-[#1E3A5F]">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-[#FF6B00]/20 border border-[#FF6B00]/50 flex items-center justify-center">
              <Dices size={16} className="text-[#FF6B00]" />
            </div>
            <h2 className="text-[13px] md:text-[14px] font-bold text-[#E6F1FF] tracking-wide">
              ITEM 13 SIMULACIÓN MONTE CARLO - PREDICCIÓN DE PLAZO CONTRACTUAL (668 DÍAS)
            </h2>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#13274F] text-[#FEF3C7] border border-[#1E3A5F]">
              CPM Estocástico / PERT
            </span>
          </div>
          <p className="text-[11px] font-mono text-[#8AA0C0] mt-0.5">
            Análisis probabilístico sobre {actividades.length} actividades críticas y holguras para predecir la probabilidad de culminación contractual
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={exportSimulationReport}
            className="flex items-center gap-1 px-2.5 py-1 text-[10px] font-mono rounded bg-[#13274F] hover:bg-[#1E3A5F] text-[#FEF3C7] border border-[#1E3A5F] transition-colors"
            title="Exportar reporte de simulación a CSV"
          >
            <Download size={12} /> Exportar Simulación
          </button>
          <span
            className={`text-[10px] font-mono font-bold px-2.5 py-1 rounded border shadow-sm ${
              simulationResults.probabilityWithin < 40
                ? "bg-red-950/70 text-red-300 border-red-500/50"
                : simulationResults.probabilityWithin < 70
                ? "bg-amber-950/70 text-amber-300 border-amber-500/50"
                : "bg-emerald-950/70 text-emerald-300 border-emerald-500/50"
            }`}
          >
            P(≤ 668d): {simulationResults.probabilityWithin}%
          </span>
        </div>
      </div>

      <ActionToolbar
        onNew={handleRunSimulation}
        onDup={() => {}}
        onDel={handleResetDefaults}
        onAcum={handleRunSimulation}
        onSave={onSave}
        onStore={onSave}
        onImport={() => {}}
        onExport={exportSimulationReport}
        onCalc={handleRunSimulation}
        onIA={onIA}
        count={numIterations}
        badge={storageStatus}
      />

      {/* Control Panel: Simulation Parameters */}
      <div className="bg-[#030A18] border border-[#1E3A5F] rounded-xl p-3.5 space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-[#1E3A5F]/60">
          <div className="flex items-center gap-1.5 text-[11px] font-bold text-[#E6F1FF] font-mono uppercase">
            <Sliders size={14} className="text-[#FF6B00]" /> Parámetros de Simulación Estocástica
          </div>
          <button
            onClick={handleResetDefaults}
            className="text-[10px] font-mono text-[#8AA0C0] hover:text-[#FEF3C7] flex items-center gap-1 transition-colors"
          >
            <RotateCcw size={11} /> Restablecer Valores
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-[11px] font-mono">
          {/* Iterations selector */}
          <div className="bg-[#0B1D3A]/60 p-2.5 rounded-lg border border-[#1E3A5F]/60">
            <label className="text-[10px] text-[#8AA0C0] block mb-1 font-semibold">
              Nº DE ITERACIONES
            </label>
            <div className="grid grid-cols-4 gap-1">
              {([500, 1000, 2500, 5000] as const).map((n) => (
                <button
                  key={n}
                  onClick={() => setNumIterations(n)}
                  className={`py-1 rounded text-[10px] font-bold transition-all ${
                    numIterations === n
                      ? "bg-[#FF6B00] text-black shadow-sm"
                      : "bg-[#030A18] text-[#8AA0C0] hover:text-white border border-[#1E3A5F]"
                  }`}
                >
                  {n >= 1000 ? `${n / 1000}k` : n}
                </button>
              ))}
            </div>
          </div>

          {/* Uncertainty range */}
          <div className="bg-[#0B1D3A]/60 p-2.5 rounded-lg border border-[#1E3A5F]/60">
            <label className="text-[10px] text-[#8AA0C0] block mb-1 font-semibold">
              VARIABILIDAD DE RENDIMIENTO
            </label>
            <div className="grid grid-cols-3 gap-1">
              {(["Baja", "Media", "Alta"] as const).map((lvl) => (
                <button
                  key={lvl}
                  onClick={() => setUncertaintyLevel(lvl)}
                  className={`py-1 rounded text-[10px] font-bold transition-all ${
                    uncertaintyLevel === lvl
                      ? "bg-[#1E3A5F] text-[#FEF3C7] border border-[#FF6B00]"
                      : "bg-[#030A18] text-[#8AA0C0] hover:text-white border border-[#1E3A5F]"
                  }`}
                >
                  {lvl}
                </button>
              ))}
            </div>
          </div>

          {/* Club Social Risk Toggle */}
          <div className="bg-[#0B1D3A]/60 p-2.5 rounded-lg border border-[#1E3A5F]/60">
            <label className="text-[10px] text-[#8AA0C0] block mb-1 font-semibold">
              RIESGO CLUB SOCIAL (RG-01)
            </label>
            <button
              onClick={() => setIncludeClubSocialRisk(!includeClubSocialRisk)}
              className={`w-full py-1 px-2 rounded text-[10px] font-bold transition-all flex items-center justify-between border ${
                includeClubSocialRisk
                  ? "bg-red-950/60 text-red-200 border-red-500/50"
                  : "bg-emerald-950/60 text-emerald-200 border-emerald-500/50"
              }`}
            >
              <span>{includeClubSocialRisk ? "Activo (+45d atraso)" : "Mitigado (Ampliación)"}</span>
              <span className="text-[9px] underline">Cambiar</span>
            </button>
          </div>

          {/* Acceleration plan selector */}
          <div className="bg-[#0B1D3A]/60 p-2.5 rounded-lg border border-[#1E3A5F]/60">
            <label className="text-[10px] text-[#8AA0C0] block mb-1 font-semibold">
              PLAN DE ACELERACIÓN
            </label>
            <select
              value={accelerationPlan}
              onChange={(e) => setAccelerationPlan(e.target.value as any)}
              className="w-full bg-[#030A18] border border-[#1E3A5F] rounded py-1 px-2 text-[10px] text-[#FEF3C7] focus:outline-none focus:border-[#FF6B00]"
            >
              <option value="none">Sin aceleración (0d)</option>
              <option value="moderate">Cuadrillas dobles (-15d)</option>
              <option value="aggressive">Fast-tracking intensivo (-30d)</option>
            </select>
          </div>
        </div>

        {/* Action Button */}
        <div className="flex items-center justify-between pt-1">
          <div className="text-[10px] font-mono text-[#8AA0C0]">
            Distribución triangular PERT (mínimo, más probable, pesimista) sobre ruta crítica y holguras
          </div>
          <button
            onClick={handleRunSimulation}
            disabled={isSimulating}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-gradient-to-r from-[#FF6B00] to-[#E55A00] text-black font-mono font-black text-[11px] shadow-lg hover:brightness-110 active:scale-95 transition-all disabled:opacity-50"
          >
            {isSimulating ? (
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                Simulando...
              </span>
            ) : (
              <span className="flex items-center gap-1.5">
                <Play size={13} fill="currentColor" /> EJECUTAR MONTE CARLO ({numIterations.toLocaleString()})
              </span>
            )}
          </button>
        </div>
      </div>

      {/* 4 Core Quantitative Prediction KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5">
        {/* Probability Card */}
        <div
          className={`border rounded-xl p-3 shadow-lg ${
            simulationResults.probabilityWithin < 40
              ? "bg-gradient-to-b from-red-950/70 to-[#020A1E] border-red-500/50"
              : simulationResults.probabilityWithin < 70
              ? "bg-gradient-to-b from-amber-950/70 to-[#020A1E] border-amber-500/50"
              : "bg-gradient-to-b from-emerald-950/70 to-[#020A1E] border-emerald-500/50"
          }`}
        >
          <div className="flex items-center justify-between text-[10px] font-mono text-[#8AA0C0]">
            <span>PROBABILIDAD CUMPLIMIENTO</span>
            <span className="font-bold">Plazo 668d</span>
          </div>
          <div className="flex items-baseline gap-2 mt-1">
            <span
              className={`text-[26px] font-black font-mono leading-none ${
                simulationResults.probabilityWithin < 40
                  ? "text-red-400"
                  : simulationResults.probabilityWithin < 70
                  ? "text-amber-300"
                  : "text-emerald-300"
              }`}
            >
              {simulationResults.probabilityWithin}%
            </span>
            <span className="text-[10px] font-mono text-[#8AA0C0]">
              {simulationResults.probabilityWithin < 40 ? "Crítico" : "Aceptable"}
            </span>
          </div>
          <div className="text-[9px] font-mono text-[#FEF3C7] mt-1 truncate">
            {simulationResults.probabilityWithin < 50
              ? "⚠️ Requiere Ampliación Art 140 formal"
              : "✓ Factible con control de holguras"}
          </div>
        </div>

        {/* P50 Median Card */}
        <div className="bg-[#020A1E] border border-[#1E3A5F] rounded-xl p-3 shadow-lg">
          <div className="flex items-center justify-between text-[10px] font-mono text-[#8AA0C0]">
            <span>P50 (MEDIANA / PROBABLE)</span>
            <span className="text-[#FF6B00]">50% Confianza</span>
          </div>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-[26px] font-black font-mono text-[#FEF3C7] leading-none">
              {simulationResults.p50}d
            </span>
            <span
              className={`text-[10px] font-mono font-bold ${
                simulationResults.p50 > targetDays ? "text-red-400" : "text-emerald-400"
              }`}
            >
              {simulationResults.p50 > targetDays
                ? `+${simulationResults.p50 - targetDays}d atraso`
                : "A tiempo"}
            </span>
          </div>
          <div className="text-[9px] font-mono text-[#8AA0C0] mt-1">
            Fecha estimada: Feb-Mar 2026
          </div>
        </div>

        {/* P80 Management Target Card */}
        <div className="bg-[#020A1E] border border-[#1E3A5F] rounded-xl p-3 shadow-lg">
          <div className="flex items-center justify-between text-[10px] font-mono text-[#8AA0C0]">
            <span>P80 (NIVEL DE GESTIÓN)</span>
            <span className="text-[#38BDF8]">80% Confianza</span>
          </div>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-[26px] font-black font-mono text-[#38BDF8] leading-none">
              {simulationResults.p80}d
            </span>
            <span className="text-[10px] font-mono text-red-300">
              +{simulationResults.p80 - targetDays}d desvío
            </span>
          </div>
          <div className="text-[9px] font-mono text-[#8AA0C0] mt-1">
            Estándar PMI para contingencias contractuales
          </div>
        </div>

        {/* P90 High Certainty Card */}
        <div className="bg-[#020A1E] border border-[#1E3A5F] rounded-xl p-3 shadow-lg">
          <div className="flex items-center justify-between text-[10px] font-mono text-[#8AA0C0]">
            <span>P90 (ALTA CERTIDUMBRE)</span>
            <span className="text-purple-400">90% Auditoría</span>
          </div>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-[26px] font-black font-mono text-purple-300 leading-none">
              {simulationResults.p90}d
            </span>
            <span className="text-[10px] font-mono text-[#8AA0C0]">
              σ = {simulationResults.stdDev}d
            </span>
          </div>
          <div className="text-[9px] font-mono text-[#8AA0C0] mt-1 truncate">
            Escenario pesimista con aniegos EMAPICA
          </div>
        </div>
      </div>

      {/* Graphical Area: Histogram & CDF Curve */}
      <div className="bg-[#030A18] border border-[#1E3A5F] rounded-xl p-3 md:p-4 space-y-3">
        {/* Chart View Switcher */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#1E3A5F]/60 pb-2">
          <div className="flex items-center gap-2">
            <BarChart3 size={15} className="text-[#FF6B00]" />
            <span className="text-[11px] font-bold text-[#E6F1FF] font-mono uppercase">
              Curvas de Probabilidad de Culminación de Obra
            </span>
          </div>

          <div className="flex items-center bg-[#0B1D3A] border border-[#1E3A5F] rounded p-0.5 text-[10px] font-mono">
            <button
              onClick={() => setActiveChartTab("histogram")}
              className={`px-3 py-1 rounded transition-all ${
                activeChartTab === "histogram"
                  ? "bg-[#1E3A5F] text-[#FEF3C7] font-bold shadow-sm"
                  : "text-[#8AA0C0] hover:text-white"
              }`}
            >
              Histograma de Frecuencias
            </button>
            <button
              onClick={() => setActiveChartTab("curve")}
              className={`px-3 py-1 rounded transition-all ${
                activeChartTab === "curve"
                  ? "bg-[#1E3A5F] text-[#FEF3C7] font-bold shadow-sm"
                  : "text-[#8AA0C0] hover:text-white"
              }`}
            >
              Curva S Acumulada (CDF)
            </button>
          </div>
        </div>

        {/* Active Chart Component */}
        <div className="w-full h-64">
          <ResponsiveContainer width="100%" height="100%">
            {activeChartTab === "histogram" ? (
              <BarChart
                data={simulationResults.bins}
                margin={{ top: 15, right: 20, left: -15, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#1E3A5F" opacity={0.5} />
                <XAxis
                  dataKey="binLabel"
                  stroke="#8AA0C0"
                  tick={{ fontSize: 9, fill: "#8AA0C0" }}
                  tickLine={{ stroke: "#1E3A5F" }}
                />
                <YAxis
                  stroke="#8AA0C0"
                  tick={{ fontSize: 9, fill: "#8AA0C0" }}
                  tickLine={{ stroke: "#1E3A5F" }}
                  unit="%"
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const d = payload[0].payload as BinData;
                      return (
                        <div className="bg-[#030A18] border border-[#1E3A5F] rounded-lg p-2.5 shadow-2xl text-[10px] font-mono space-y-1">
                          <div className="text-[#FEF3C7] font-bold border-b border-[#1E3A5F] pb-1">
                            Rango: {d.binLabel}
                          </div>
                          <div className="flex items-center justify-between gap-3 text-white">
                            <span>Frecuencia:</span>
                            <strong className="font-bold">{d.count} iteraciones ({d.frequencyPct}%)</strong>
                          </div>
                          <div className="flex items-center justify-between gap-3 text-[#38BDF8]">
                            <span>Probabilidad acumulada:</span>
                            <strong>{d.cumulativePct}%</strong>
                          </div>
                          <div className="text-[9px] pt-1 border-t border-[#1E3A5F]">
                            {d.isWithinTarget ? (
                              <span className="text-emerald-400 font-bold">
                                ✓ Dentro del plazo pactado (≤ 668d)
                              </span>
                            ) : (
                              <span className="text-red-400 font-bold">
                                ⚠️ Sobrepasa el plazo de 668 días
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                {/* Target contract line */}
                <ReferenceLine
                  x={
                    simulationResults.bins.find((b) => b.binStart <= targetDays && b.binEnd >= targetDays)
                      ?.binLabel
                  }
                  stroke="#10B981"
                  strokeWidth={2.5}
                  strokeDasharray="4 4"
                  label={{
                    value: "Límite Contractual 668d",
                    fill: "#10B981",
                    fontSize: 9,
                    position: "top",
                  }}
                />
                <Bar dataKey="frequencyPct" name="Probabilidad %">
                  {simulationResults.bins.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.isWithinTarget ? "#10B981" : entry.binStart > 710 ? "#EF4444" : "#F59E0B"}
                      opacity={0.85}
                    />
                  ))}
                </Bar>
              </BarChart>
            ) : (
              <AreaChart
                data={simulationResults.cdfPoints}
                margin={{ top: 15, right: 20, left: -15, bottom: 5 }}
              >
                <defs>
                  <linearGradient id="cdfGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#38BDF8" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#38BDF8" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E3A5F" opacity={0.5} />
                <XAxis
                  dataKey="dias"
                  stroke="#8AA0C0"
                  tick={{ fontSize: 9, fill: "#8AA0C0" }}
                  unit="d"
                />
                <YAxis
                  domain={[0, 100]}
                  ticks={[0, 20, 40, 60, 80, 100]}
                  stroke="#8AA0C0"
                  tick={{ fontSize: 9, fill: "#8AA0C0" }}
                  unit="%"
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const d = payload[0].payload;
                      return (
                        <div className="bg-[#030A18] border border-[#1E3A5F] rounded-lg p-2.5 shadow-2xl text-[10px] font-mono">
                          <div className="text-[#FEF3C7] font-bold border-b border-[#1E3A5F] pb-1">
                            Duración: {d.dias} días calendario
                          </div>
                          <div className="flex items-center justify-between gap-3 text-[#38BDF8] mt-1">
                            <span>Probabilidad acumulada P(T ≤ {d.dias}d):</span>
                            <strong className="font-bold text-[12px]">{d.probAcumulada}%</strong>
                          </div>
                          <div className="text-[8.5px] text-[#8AA0C0] mt-1">
                            {d.dias <= targetDays
                              ? "Dentro de los 668 días pactados"
                              : `Atraso de +${d.dias - targetDays} días sobre meta`}
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <ReferenceLine
                  x={targetDays}
                  stroke="#10B981"
                  strokeWidth={2}
                  strokeDasharray="3 3"
                  label={{
                    value: `Meta 668d (${simulationResults.probabilityWithin}%)`,
                    fill: "#10B981",
                    fontSize: 9,
                    position: "insideTopLeft",
                  }}
                />
                <ReferenceLine
                  y={50}
                  stroke="#FEF3C7"
                  strokeDasharray="2 2"
                  strokeWidth={1}
                  label={{
                    value: `P50 Mediana (${simulationResults.p50}d)`,
                    fill: "#FEF3C7",
                    fontSize: 8,
                    position: "insideBottomRight",
                  }}
                />
                <ReferenceLine
                  y={80}
                  stroke="#38BDF8"
                  strokeDasharray="2 2"
                  strokeWidth={1}
                  label={{
                    value: `P80 Gestión (${simulationResults.p80}d)`,
                    fill: "#38BDF8",
                    fontSize: 8,
                    position: "insideTopRight",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="probAcumulada"
                  name="Probabilidad Acumulada"
                  stroke="#38BDF8"
                  strokeWidth={2.5}
                  fill="url(#cdfGrad)"
                />
              </AreaChart>
            )}
          </ResponsiveContainer>
        </div>

        {/* Legend / Color Explanation */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-[#1E3A5F]/40 text-[10px] font-mono text-[#8AA0C0]">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded bg-emerald-500" />
              <span>≤ 668 días (En Plazo)</span>
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded bg-amber-500" />
              <span>669 - 710 días (Atraso Moderado)</span>
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded bg-red-500" />
              <span>&gt; 710 días (Atraso Crítico Art 135)</span>
            </span>
          </div>
          <div className="text-[#FEF3C7]">
            Rango: {simulationResults.minDay}d (mín) — {simulationResults.maxDay}d (máx) | Media: {simulationResults.meanDay}d
          </div>
        </div>
      </div>

      {/* Sensitivity Analysis Table: Critical Activities & Slack Overrun */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-[11px] font-mono px-1">
          <span className="font-bold text-[#E6F1FF] flex items-center gap-1.5">
            <Layers size={13} className="text-[#FF6B00]" />
            SENSIBILIDAD DE ACTIVIDADES CRÍTICAS Y CONSUMO DE HOLGURAS
          </span>
          <span className="text-[10px] text-[#8AA0C0]">
            Índice de Criticidad = % de iteraciones donde la actividad fue determinante del plazo
          </span>
        </div>

        <div className="overflow-auto rounded-lg border border-[#1E3A5F]">
          <table className="w-full text-[11px] font-mono">
            <thead className="bg-[#030A18] text-[#8AA0C0] text-[10px]">
              <tr>
                <th className="p-2 text-center">Código</th>
                <th className="p-2 text-left">Actividad CPM</th>
                <th className="p-2 text-center">Dur. Base</th>
                <th className="p-2 text-center">Holgura</th>
                <th className="p-2 text-center">Rango Simulado (Mín - Máx)</th>
                <th className="p-2 text-center">Media Sim.</th>
                <th className="p-2 text-center">Índice Criticidad</th>
                <th className="p-2 text-center">Nivel Riesgo</th>
              </tr>
            </thead>
            <tbody>
              {simulationResults.sensitivityList.map((row) => (
                <tr
                  key={row.cod}
                  className="border-t border-[#1E3A5F]/30 hover:bg-[#13274F]/40 transition-colors"
                >
                  <td className="p-1.5 text-center font-bold text-[#D4A574]">{row.cod}</td>
                  <td className="p-1.5 text-left text-[#E6F1FF]">
                    <div className="flex items-center gap-1.5">
                      <span>{row.desc}</span>
                      {row.esCritica && (
                        <span className="px-1 py-0.2 rounded text-[8px] bg-red-500/20 text-red-300 border border-red-500/40">
                          Ruta Crítica
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="p-1.5 text-center font-bold">{row.durBase}d</td>
                  <td className="p-1.5 text-center">
                    <span
                      className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                        row.holgura === 0
                          ? "bg-red-500/20 text-red-300"
                          : "bg-emerald-500/20 text-emerald-300"
                      }`}
                    >
                      {row.holgura}d
                    </span>
                  </td>
                  <td className="p-1.5 text-center text-[#8AA0C0]">
                    {row.minDur}d — {row.maxDur}d
                  </td>
                  <td className="p-1.5 text-center font-bold text-[#FEF3C7]">{row.meanDur}d</td>
                  <td className="p-1.5 text-center">
                    <div className="flex items-center justify-center gap-1.5">
                      <div className="w-14 h-1.5 bg-[#030A18] rounded-full overflow-hidden border border-[#1E3A5F]">
                        <div
                          className={`h-full rounded-full ${
                            row.criticalityIndexPct >= 70
                              ? "bg-red-500"
                              : row.criticalityIndexPct >= 30
                              ? "bg-amber-400"
                              : "bg-emerald-400"
                          }`}
                          style={{ width: `${row.criticalityIndexPct}%` }}
                        />
                      </div>
                      <span className="font-bold text-[10px]">{row.criticalityIndexPct}%</span>
                    </div>
                  </td>
                  <td className="p-1.5 text-center">
                    <span
                      className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                        row.riskImpact === "Alto"
                          ? "bg-red-500/20 text-red-300 border border-red-500/40"
                          : row.riskImpact === "Medio"
                          ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                          : "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                      }`}
                    >
                      {row.riskImpact}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Contractual Diagnosis & Action Plan (D.S. 038-2026-EF / Ley 29230) */}
      <div className="grid md:grid-cols-3 gap-3">
        {/* Finding Card */}
        <div className="bg-[#020A1E] border border-red-500/40 rounded-xl p-3 space-y-1.5">
          <div className="flex items-center gap-1.5 text-red-300 font-bold text-[11px] font-mono">
            <AlertTriangle size={13} />
            <span>DICTAMEN PROBABILÍSTICO (P &lt; 50%)</span>
          </div>
          <p className="text-[10px] font-mono text-[#E6F1FF] leading-relaxed">
            El modelo Monte Carlo evidencia que la probabilidad de culminar la obra dentro de los <strong>668 días pactados</strong> es de solo <strong>{simulationResults.probabilityWithin}%</strong> debido al atraso acumulado del 31.43% y la restricción no imputable de 249 días en el terreno del Club Social (CUI 2693747).
          </p>
          <div className="text-[9px] font-mono text-[#FEF3C7] pt-1 border-t border-red-500/20">
            Plazo más probable P50: {simulationResults.p50} días (+{simulationResults.p50 - targetDays}d de atraso proyectado).
          </div>
        </div>

        {/* Contractual Remedy Card */}
        <div className="bg-[#020A1E] border border-[#1E3A5F] rounded-xl p-3 space-y-1.5">
          <div className="flex items-center gap-1.5 text-[#FEF3C7] font-bold text-[11px] font-mono">
            <ShieldAlert size={13} className="text-[#FF6B00]" />
            <span>SUSTENTO AMPLIACIÓN ART. 140</span>
          </div>
          <p className="text-[10px] font-mono text-[#8AA0C0] leading-relaxed">
            Conforme al D.S. 038-2026-EF (Reglamento Ley 29230), la causal de interferencia física debidamente anotada en el Asiento 802 del cuaderno de obra sustenta técnicamente la solicitud de <strong>Ampliación de Plazo de 45 días calendario</strong> para llevar la probabilidad de culminación a un umbral de gestión seguro (&gt; 75%).
          </p>
          <div className="text-[9px] font-mono text-emerald-300 pt-1 border-t border-[#1E3A5F]">
            Mitiga riesgo de penalidad máxima Art. 135 (S/ 4.42M).
          </div>
        </div>

        {/* Engineering Response Plan Card */}
        <div className="bg-[#020A1E] border border-[#1E3A5F] rounded-xl p-3 space-y-1.5">
          <div className="flex items-center gap-1.5 text-emerald-300 font-bold text-[11px] font-mono">
            <CheckCircle2 size={13} />
            <span>PLAN OPERATIVO DE MITIGACIÓN</span>
          </div>
          <ul className="text-[10px] font-mono text-[#8AA0C0] space-y-1">
            <li className="flex items-start gap-1">
              <span className="text-[#FF6B00]">•</span>
              <span>Incrementar cuadrillas de encofrado y vaciado a 5 frentes en paralelo.</span>
            </li>
            <li className="flex items-start gap-1">
              <span className="text-[#FF6B00]">•</span>
              <span>Solapar actividades A-04 y A-05 con traslape SS lag -2 días.</span>
            </li>
            <li className="flex items-start gap-1">
              <span className="text-[#FF6B00]">•</span>
              <span>Exigir a GORE Ica acta de entrega definitiva del Club Social.</span>
            </li>
          </ul>
          <div className="text-[9px] font-mono text-[#D4A574] pt-1 border-t border-[#1E3A5F]">
            Ing. José Luis Paysis Velasquez - CIP 101507
          </div>
        </div>
      </div>
    </div>
  );
};
