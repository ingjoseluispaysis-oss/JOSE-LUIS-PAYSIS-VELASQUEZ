import React, { useState, useRef, useEffect, useMemo, useCallback } from "react";
import {
  Calendar,
  Clock,
  RotateCcw,
  ZoomIn,
  ZoomOut,
  GitBranch,
  Layers,
  AlertTriangle,
  CheckCircle2,
  MoveHorizontal,
  ArrowRight,
  Info,
  Maximize2,
} from "lucide-react";
import { ActividadCPM } from "../types";

interface GanttChartCPMProps {
  actividades: ActividadCPM[];
  setActividades: React.Dispatch<React.SetStateAction<ActividadCPM[]>>;
  contractualDays?: number;
}

interface DragState {
  type: "move" | "resize";
  actCod: string;
  startX: number;
  initialInicio: string;
  initialFin: string;
  initialDur: number;
  initialEs: number;
  initialEf: number;
}

// Date helpers using local date arithmetic to avoid timezone shifts
function parseDate(dateStr: string): Date {
  const parts = dateStr.split("-").map(Number);
  if (parts.length !== 3 || isNaN(parts[0]) || isNaN(parts[1]) || isNaN(parts[2])) {
    return new Date(2025, 3, 26); // Default 2025-04-26
  }
  return new Date(parts[0], parts[1] - 1, parts[2]);
}

function formatDate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function addDaysToDate(dateStr: string, days: number): string {
  const dt = parseDate(dateStr);
  dt.setDate(dt.getDate() + days);
  return formatDate(dt);
}

function dateDiffInDays(fromStr: string, toStr: string): number {
  const d1 = parseDate(fromStr);
  const d2 = parseDate(toStr);
  const diffMs = d2.getTime() - d1.getTime();
  return Math.round(diffMs / (1000 * 60 * 60 * 24));
}

export const GanttChartCPM: React.FC<GanttChartCPMProps> = ({
  actividades,
  setActividades,
  contractualDays = 668,
}) => {
  const [dayWidth, setDayWidth] = useState<number>(24); // pixels per calendar day
  const [showDependencies, setShowDependencies] = useState<boolean>(true);
  const [cascadeMode, setCascadeMode] = useState<boolean>(true);
  const [filterCriticalOnly, setFilterCriticalOnly] = useState<boolean>(false);
  const [hoveredAct, setHoveredAct] = useState<string | null>(null);
  const [dragState, setDragState] = useState<DragState | null>(null);
  const [simulatedChangeNotice, setSimulatedChangeNotice] = useState<string | null>(null);

  // Baseline copy to allow reset
  const baselineSchedule = useRef<ActividadCPM[]>(JSON.parse(JSON.stringify(actividades)));

  const containerRef = useRef<HTMLDivElement>(null);
  const timelineScrollRef = useRef<HTMLDivElement>(null);

  // Determine global start and finish dates of the timeline
  const { minDateStr, maxDateStr, totalDaysCount, timelineOriginDate } = useMemo(() => {
    if (actividades.length === 0) {
      return {
        minDateStr: "2025-04-20",
        maxDateStr: "2025-09-30",
        totalDaysCount: 160,
        timelineOriginDate: parseDate("2025-04-20"),
      };
    }

    let minTime = Infinity;
    let maxTime = -Infinity;

    actividades.forEach((a) => {
      const s = parseDate(a.inicio).getTime();
      const e = parseDate(a.fin).getTime();
      if (s < minTime) minTime = s;
      if (e > maxTime) maxTime = e;
    });

    // Add buffers: 5 days before, 25 days after
    const originDate = new Date(minTime);
    originDate.setDate(originDate.getDate() - 5);

    const endDate = new Date(maxTime);
    endDate.setDate(endDate.getDate() + 25);

    const minStr = formatDate(originDate);
    const maxStr = formatDate(endDate);
    const count = dateDiffInDays(minStr, maxStr) + 1;

    return {
      minDateStr: minStr,
      maxDateStr: maxStr,
      totalDaysCount: Math.max(80, count),
      timelineOriginDate: originDate,
    };
  }, [actividades]);

  // Generate calendar day ticks and month segments
  const { dayTicks, monthHeaders } = useMemo(() => {
    const days = [];
    const months: { name: string; startDayIndex: number; daysCount: number }[] = [];

    let curMonthName = "";
    let curMonthStart = 0;
    let curMonthCount = 0;

    const monthNames = [
      "ENE", "FEB", "MAR", "ABR", "MAY", "JUN",
      "JUL", "AGO", "SET", "OCT", "NOV", "DIC"
    ];

    for (let i = 0; i < totalDaysCount; i++) {
      const d = new Date(timelineOriginDate);
      d.setDate(d.getDate() + i);
      const dayNum = d.getDate();
      const monthIdx = d.getMonth();
      const year = d.getFullYear();
      const monthLabel = `${monthNames[monthIdx]} ${year}`;
      const isWeekend = d.getDay() === 0 || d.getDay() === 6;
      const isFirstDayOfMonth = dayNum === 1;

      days.push({
        index: i,
        dateStr: formatDate(d),
        dayNum,
        isWeekend,
        isFirstDayOfMonth,
      });

      if (monthLabel !== curMonthName) {
        if (curMonthCount > 0) {
          months.push({
            name: curMonthName,
            startDayIndex: curMonthStart,
            daysCount: curMonthCount,
          });
        }
        curMonthName = monthLabel;
        curMonthStart = i;
        curMonthCount = 1;
      } else {
        curMonthCount++;
      }
    }

    if (curMonthCount > 0) {
      months.push({
        name: curMonthName,
        startDayIndex: curMonthStart,
        daysCount: curMonthCount,
      });
    }

    return { dayTicks: days, monthHeaders: months };
  }, [totalDaysCount, timelineOriginDate]);

  // Convert a date string into an X offset (pixels)
  const getXForDate = useCallback(
    (dateStr: string) => {
      const diff = dateDiffInDays(minDateStr, dateStr);
      return diff * dayWidth;
    },
    [minDateStr, dayWidth]
  );

  // Active activities to display
  const displayedActividades = useMemo(() => {
    if (filterCriticalOnly) {
      return actividades.filter((a) => a.crit);
    }
    return actividades;
  }, [actividades, filterCriticalOnly]);

  // Calculate project finish and overall stats
  const projectStats = useMemo(() => {
    if (actividades.length === 0) return { finishDate: "—", totalSpanDays: 0, criticalCount: 0 };

    let earliestStart = actividades[0].inicio;
    let latestFinish = actividades[0].fin;
    let criticalCount = 0;

    actividades.forEach((a) => {
      if (a.crit) criticalCount++;
      if (a.inicio < earliestStart) earliestStart = a.inicio;
      if (a.fin > latestFinish) latestFinish = a.fin;
    });

    const totalSpanDays = dateDiffInDays(earliestStart, latestFinish) + 1;

    return {
      startDate: earliestStart,
      finishDate: latestFinish,
      totalSpanDays,
      criticalCount,
    };
  }, [actividades]);

  // Recalculate CPM cascade when an activity shifts or resizes
  const propagateSchedule = useCallback(
    (updatedActs: ActividadCPM[], seedCod: string): ActividadCPM[] => {
      if (!cascadeMode) return updatedActs;

      // Topological or iterative forward pass
      const map = new Map<string, ActividadCPM>();
      updatedActs.forEach((a) => map.set(a.cod, { ...a }));

      let changed = true;
      let iterations = 0;

      while (changed && iterations < 20) {
        changed = false;
        iterations++;

        updatedActs.forEach((act) => {
          const current = map.get(act.cod)!;
          if (current.pred && current.pred !== "-") {
            const predAct = map.get(current.pred);
            if (predAct) {
              let targetStartDate = current.inicio;

              if (current.tipo === "FS") {
                // Successor start = Predecessor End + 1 + Lag
                const minStart = addDaysToDate(predAct.fin, 1 + current.lag);
                if (dateDiffInDays(targetStartDate, minStart) > 0) {
                  targetStartDate = minStart;
                }
              } else if (current.tipo === "SS") {
                // Successor start = Predecessor Start + Lag
                const minStart = addDaysToDate(predAct.inicio, current.lag);
                if (dateDiffInDays(targetStartDate, minStart) > 0) {
                  targetStartDate = minStart;
                }
              } else if (current.tipo === "FF") {
                // Successor finish >= Predecessor finish + lag
                const minFinish = addDaysToDate(predAct.fin, current.lag);
                const currentFinish = current.fin;
                if (dateDiffInDays(currentFinish, minFinish) > 0) {
                  targetStartDate = addDaysToDate(minFinish, -(current.dur - 1));
                }
              }

              if (targetStartDate !== current.inicio) {
                const newFin = addDaysToDate(targetStartDate, current.dur - 1);
                current.inicio = targetStartDate;
                current.fin = newFin;
                changed = true;
              }
            }
          }
        });
      }

      // Recalculate ES, EF, Holgura and Criticality
      let minProjDate = "";
      map.forEach((a) => {
        if (!minProjDate || a.inicio < minProjDate) minProjDate = a.inicio;
      });

      const result: ActividadCPM[] = [];
      map.forEach((act) => {
        const es = dateDiffInDays(minProjDate, act.inicio);
        const ef = es + act.dur;
        result.push({
          ...act,
          es,
          ef,
        });
      });

      // Simple backward pass for slack
      const maxEF = Math.max(...result.map((r) => r.ef));
      return result.map((act) => {
        // Holgura estimation: if it is part of the latest chain, holgura = 0
        const successors = result.filter((s) => s.pred === act.cod);
        let minSuccES = maxEF;
        if (successors.length > 0) {
          minSuccES = Math.min(...successors.map((s) => s.es));
        }
        const freeFloat = Math.max(0, minSuccES - act.ef);
        const isCritical = freeFloat === 0;

        return {
          ...act,
          holg: freeFloat,
          crit: isCritical,
        };
      });
    },
    [cascadeMode]
  );

  // Mouse drag handlers
  const handleMouseDown = (
    e: React.MouseEvent,
    act: ActividadCPM,
    type: "move" | "resize"
  ) => {
    e.preventDefault();
    e.stopPropagation();

    setDragState({
      type,
      actCod: act.cod,
      startX: e.clientX,
      initialInicio: act.inicio,
      initialFin: act.fin,
      initialDur: act.dur,
      initialEs: act.es,
      initialEf: act.ef,
    });
  };

  useEffect(() => {
    if (!dragState) return;

    const handleMouseMove = (e: MouseEvent) => {
      const deltaX = e.clientX - dragState.startX;
      const deltaDays = Math.round(deltaX / dayWidth);

      if (deltaDays === 0) return;

      if (dragState.type === "move") {
        const newInicio = addDaysToDate(dragState.initialInicio, deltaDays);
        const newFin = addDaysToDate(dragState.initialFin, deltaDays);

        setActividades((prev) => {
          const updated = prev.map((a) => {
            if (a.cod === dragState.actCod) {
              return {
                ...a,
                inicio: newInicio,
                fin: newFin,
              };
            }
            return a;
          });

          return propagateSchedule(updated, dragState.actCod);
        });

        setSimulatedChangeNotice(
          `Simulando: ${dragState.actCod} desplazada ${deltaDays > 0 ? `+${deltaDays}` : deltaDays}d → Nueva fecha fin: ${newFin}`
        );
      } else if (dragState.type === "resize") {
        const newDur = Math.max(1, dragState.initialDur + deltaDays);
        const newFin = addDaysToDate(dragState.initialInicio, newDur - 1);

        setActividades((prev) => {
          const updated = prev.map((a) => {
            if (a.cod === dragState.actCod) {
              return {
                ...a,
                dur: newDur,
                fin: newFin,
              };
            }
            return a;
          });

          return propagateSchedule(updated, dragState.actCod);
        });

        setSimulatedChangeNotice(
          `Simulando: ${dragState.actCod} duración modificada a ${newDur}d (${deltaDays > 0 ? `+${deltaDays}` : deltaDays}d) → Nueva fecha fin: ${newFin}`
        );
      }
    };

    const handleMouseUp = () => {
      setDragState(null);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [dragState, dayWidth, propagateSchedule, setActividades]);

  // Reset to initial baseline
  const handleResetToBaseline = () => {
    setActividades(JSON.parse(JSON.stringify(baselineSchedule.current)));
    setSimulatedChangeNotice("Cronograma restablecido a los valores contractuales de línea base.");
    setTimeout(() => setSimulatedChangeNotice(null), 3500);
  };

  // Build dependency SVG paths between predecessor and successor bars
  const dependencyLines = useMemo(() => {
    if (!showDependencies) return [];

    const lines: {
      key: string;
      d: string;
      isCritical: boolean;
    }[] = [];

    const rowHeight = 38;
    const barHeight = 22;
    const topOffset = 42; // Below the timeline header

    displayedActividades.forEach((act, actIndex) => {
      if (!act.pred || act.pred === "-") return;

      const predIndex = displayedActividades.findIndex((a) => a.cod === act.pred);
      if (predIndex === -1) return;

      const predAct = displayedActividades[predIndex];

      // End of predecessor bar
      const predEndX = getXForDate(predAct.fin) + dayWidth;
      const predY = topOffset + predIndex * rowHeight + rowHeight / 2;

      // Start of current bar
      const actStartX = getXForDate(act.inicio);
      const actY = topOffset + actIndex * rowHeight + rowHeight / 2;

      const isCriticalLink = act.crit && predAct.crit;

      let pathD = "";
      if (actStartX >= predEndX) {
        // Simple forward connection with right angle
        const midX = predEndX + Math.max(6, (actStartX - predEndX) / 2);
        pathD = `M ${predEndX} ${predY} L ${midX} ${predY} L ${midX} ${actY} L ${actStartX} ${actY}`;
      } else {
        // Predecessor finishes after successor starts (e.g. SS with negative lag or overlap)
        const bendX = predEndX + 8;
        const midY = (predY + actY) / 2;
        pathD = `M ${predEndX} ${predY} L ${bendX} ${predY} L ${bendX} ${midY} L ${actStartX - 8} ${midY} L ${actStartX - 8} ${actY} L ${actStartX} ${actY}`;
      }

      lines.push({
        key: `${predAct.cod}->${act.cod}`,
        d: pathD,
        isCritical: isCriticalLink,
      });
    });

    return lines;
  }, [displayedActividades, showDependencies, getXForDate, dayWidth]);

  return (
    <div className="bg-[#030A18] border border-[#1E3A5F] rounded-xl p-3 md:p-4 space-y-3 shadow-2xl">
      {/* Gantt Controls & Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-[#1E3A5F]">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-[#FF6B00]/20 border border-[#FF6B00]/50 flex items-center justify-center">
            <MoveHorizontal size={16} className="text-[#FF6B00]" />
          </div>
          <div>
            <h3 className="text-[13px] font-bold text-[#E6F1FF] tracking-wide flex items-center gap-2">
              DIAGRAMA DE GANTT CPM INTERACTIVO
              <span className="text-[9px] font-mono font-normal px-2 py-0.5 rounded bg-[#13274F] text-[#38BDF8] border border-[#1E3A5F]">
                Arrastre de Actividades & Simulación en Tiempo Real
              </span>
            </h3>
            <p className="text-[10px] font-mono text-[#8AA0C0]">
              Arrastre el cuerpo de la barra para desplazar la fecha de inicio, o el borde derecho para alterar la duración.
            </p>
          </div>
        </div>

        {/* Toolbar Buttons */}
        <div className="flex flex-wrap items-center gap-1.5 text-[10px] font-mono">
          {/* Zoom controls */}
          <div className="flex items-center bg-[#0B1D3A] border border-[#1E3A5F] rounded px-1.5 py-0.5 gap-1">
            <span className="text-[#8AA0C0] text-[9px]">Escala:</span>
            <button
              onClick={() => setDayWidth((w) => Math.max(14, w - 4))}
              className="p-1 text-[#8AA0C0] hover:text-white transition-colors"
              title="Reducir zoom"
            >
              <ZoomOut size={12} />
            </button>
            <span className="text-[#FEF3C7] font-bold w-7 text-center">{dayWidth}px</span>
            <button
              onClick={() => setDayWidth((w) => Math.min(50, w + 4))}
              className="p-1 text-[#8AA0C0] hover:text-white transition-colors"
              title="Aumentar zoom"
            >
              <ZoomIn size={12} />
            </button>
          </div>

          {/* Cascade Toggle */}
          <button
            onClick={() => setCascadeMode(!cascadeMode)}
            className={`flex items-center gap-1 px-2 py-1 rounded border transition-colors ${
              cascadeMode
                ? "bg-emerald-950/70 text-emerald-300 border-emerald-500/50"
                : "bg-[#0B1D3A] text-[#8AA0C0] border-[#1E3A5F]"
            }`}
            title="Activa o desactiva el desplazamiento automático en cascada de actividades sucesoras"
          >
            <GitBranch size={11} />
            <span>Cascada CPM: {cascadeMode ? "ON" : "OFF"}</span>
          </button>

          {/* Dependencies Lines Toggle */}
          <button
            onClick={() => setShowDependencies(!showDependencies)}
            className={`flex items-center gap-1 px-2 py-1 rounded border transition-colors ${
              showDependencies
                ? "bg-[#1E3A5F] text-[#FEF3C7] border-[#38BDF8]/60"
                : "bg-[#0B1D3A] text-[#8AA0C0] border-[#1E3A5F]"
            }`}
          >
            <Layers size={11} />
            <span>Vínculos FS/SS</span>
          </button>

          {/* Filter Critical Only */}
          <button
            onClick={() => setFilterCriticalOnly(!filterCriticalOnly)}
            className={`flex items-center gap-1 px-2 py-1 rounded border transition-colors ${
              filterCriticalOnly
                ? "bg-red-950/80 text-red-300 border-red-500/60"
                : "bg-[#0B1D3A] text-[#8AA0C0] border-[#1E3A5F]"
            }`}
          >
            <AlertTriangle size={11} />
            <span>Solo Ruta Crítica</span>
          </button>

          {/* Reset button */}
          <button
            onClick={handleResetToBaseline}
            className="flex items-center gap-1 px-2 py-1 rounded bg-[#0B1D3A] hover:bg-[#1E3A5F] text-[#FEF3C7] border border-[#1E3A5F] transition-colors"
            title="Restablecer fechas y duraciones al estado contractual original"
          >
            <RotateCcw size={11} />
            <span>Restablecer</span>
          </button>
        </div>
      </div>

      {/* Real-time Status / Notification Pill */}
      {simulatedChangeNotice && (
        <div className="bg-gradient-to-r from-[#13274F] to-[#0B1D3A] border border-[#FF6B00]/40 rounded-lg p-2 flex items-center justify-between gap-2 text-[10px] font-mono text-[#FEF3C7] animate-pulse">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#FF6B00]" />
            <span>{simulatedChangeNotice}</span>
          </div>
          <span className="text-[9px] text-[#8AA0C0]">Fechas actualizadas en la tabla CPM</span>
        </div>
      )}

      {/* KPI Banner for Schedule Simulation */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[10px] font-mono">
        <div className="bg-[#0B1D3A] border border-[#1E3A5F] rounded-lg p-2">
          <span className="text-[#8AA0C0] block text-[9px]">INICIO DEL CRONOGRAMA</span>
          <span className="text-[#E6F1FF] font-bold text-[12px]">{projectStats.startDate}</span>
        </div>

        <div className="bg-[#0B1D3A] border border-[#1E3A5F] rounded-lg p-2">
          <span className="text-[#8AA0C0] block text-[9px]">FIN PROYECTADO CPM</span>
          <span className="text-[#FEF3C7] font-bold text-[12px]">{projectStats.finishDate}</span>
        </div>

        <div className="bg-[#0B1D3A] border border-[#1E3A5F] rounded-lg p-2">
          <span className="text-[#8AA0C0] block text-[9px]">DURACIÓN ESTIMADA FRENTE A LÍMITE</span>
          <div className="flex items-baseline gap-1.5">
            <span className="text-[#38BDF8] font-bold text-[12px]">{projectStats.totalSpanDays}d</span>
            <span className="text-[#8AA0C0] text-[9px]">/ 668d Contractuales</span>
          </div>
        </div>

        <div className="bg-[#0B1D3A] border border-[#1E3A5F] rounded-lg p-2">
          <span className="text-[#8AA0C0] block text-[9px]">ACTIVIDADES EN RUTA CRÍTICA</span>
          <div className="flex items-center justify-between">
            <span className="text-red-400 font-bold text-[12px]">{projectStats.criticalCount} Críticas</span>
            <span className="text-[9px] text-emerald-300">
              {actividades.length - projectStats.criticalCount} con Holgura
            </span>
          </div>
        </div>
      </div>

      {/* Dual Panel Gantt View: Left Table + Right Interactive Timeline Canvas */}
      <div
        ref={containerRef}
        className="flex border border-[#1E3A5F] rounded-lg overflow-hidden bg-[#020A1E]"
        style={{ height: `${Math.max(340, displayedActividades.length * 40 + 75)}px` }}
      >
        {/* Left Side: Activity Details Panel (Sticky) */}
        <div className="w-[300px] min-w-[280px] border-r border-[#1E3A5F] bg-[#030A18] flex flex-col shrink-0 select-none z-10">
          {/* Left Header */}
          <div className="h-[42px] border-b border-[#1E3A5F] px-2 flex items-center justify-between text-[10px] font-mono text-[#8AA0C0] font-bold bg-[#0B1D3A]/60">
            <span className="w-12 text-center">CÓD</span>
            <span className="flex-1 px-1">ACTIVIDAD</span>
            <span className="w-12 text-center">DUR</span>
            <span className="w-12 text-center">HOLG</span>
          </div>

          {/* Left Rows */}
          <div className="flex-1 overflow-y-hidden">
            {displayedActividades.map((act) => (
              <div
                key={act.cod}
                onMouseEnter={() => setHoveredAct(act.cod)}
                onMouseLeave={() => setHoveredAct(null)}
                className={`h-[38px] px-2 flex items-center justify-between text-[10px] font-mono border-b border-[#1E3A5F]/40 transition-colors ${
                  hoveredAct === act.cod
                    ? "bg-[#13274F]/80"
                    : act.crit
                    ? "bg-red-950/20"
                    : "hover:bg-[#13274F]/40"
                }`}
              >
                <span
                  className={`w-12 text-center font-bold px-1 py-0.5 rounded text-[9px] ${
                    act.crit
                      ? "bg-red-500/20 text-red-300 border border-red-500/40"
                      : "bg-[#1E3A5F]/50 text-[#D4A574]"
                  }`}
                >
                  {act.cod}
                </span>
                <div className="flex-1 px-1.5 truncate">
                  <span className="text-[#E6F1FF] font-medium text-[10.5px] truncate block">
                    {act.desc}
                  </span>
                  <span className="text-[8px] text-[#8AA0C0]">
                    {act.inicio} → {act.fin}
                  </span>
                </div>
                <span className="w-12 text-center font-bold text-[#FEF3C7]">{act.dur}d</span>
                <span
                  className={`w-12 text-center font-bold ${
                    act.holg === 0 ? "text-red-400" : "text-emerald-400"
                  }`}
                >
                  {act.holg}d
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Right Side: Interactive Gantt Canvas */}
        <div
          ref={timelineScrollRef}
          className="flex-1 overflow-x-auto overflow-y-auto relative select-none"
        >
          <div
            className="relative"
            style={{
              width: `${totalDaysCount * dayWidth}px`,
              minHeight: "100%",
            }}
          >
            {/* Timeline Header: 2 tiers (Months on top, Days below) */}
            <div className="sticky top-0 z-20 bg-[#030A18] border-b border-[#1E3A5F]">
              {/* Month Tier */}
              <div className="h-5 flex border-b border-[#1E3A5F]/60 text-[9px] font-mono font-bold text-[#38BDF8]">
                {monthHeaders.map((m) => (
                  <div
                    key={`${m.name}-${m.startDayIndex}`}
                    className="border-r border-[#1E3A5F]/60 px-2 flex items-center justify-start truncate bg-[#0B1D3A]/40"
                    style={{ width: `${m.daysCount * dayWidth}px` }}
                  >
                    {m.name}
                  </div>
                ))}
              </div>

              {/* Day Tier */}
              <div className="h-[21px] flex text-[8.5px] font-mono text-[#8AA0C0]">
                {dayTicks.map((d) => (
                  <div
                    key={d.index}
                    className={`border-r border-[#1E3A5F]/40 flex items-center justify-center ${
                      d.isWeekend ? "bg-white/[0.02] text-[#8AA0C0]/60" : ""
                    } ${d.isFirstDayOfMonth ? "border-l-2 border-l-[#38BDF8]/60 font-bold" : ""}`}
                    style={{ width: `${dayWidth}px` }}
                    title={d.dateStr}
                  >
                    {dayWidth >= 22 ? d.dayNum : d.dayNum % 5 === 0 ? d.dayNum : ""}
                  </div>
                ))}
              </div>
            </div>

            {/* Vertical Day Grid Lines Background */}
            <div className="absolute inset-0 top-[42px] pointer-events-none flex">
              {dayTicks.map((d) => (
                <div
                  key={d.index}
                  className={`border-r border-[#1E3A5F]/20 h-full ${
                    d.isWeekend ? "bg-white/[0.015]" : ""
                  } ${d.isFirstDayOfMonth ? "border-r border-r-[#38BDF8]/30" : ""}`}
                  style={{ width: `${dayWidth}px` }}
                />
              ))}
            </div>

            {/* SVG Layer for Precedence / Dependency Arrows */}
            <svg
              className="absolute inset-0 pointer-events-none z-10"
              style={{
                width: `${totalDaysCount * dayWidth}px`,
                height: `${displayedActividades.length * 38 + 50}px`,
              }}
            >
              <defs>
                <marker
                  id="arrow-normal"
                  viewBox="0 0 10 10"
                  refX="8"
                  refY="5"
                  markerWidth="5"
                  markerHeight="5"
                  orient="auto"
                >
                  <path d="M 0 1 L 9 5 L 0 9 z" fill="#D4A574" />
                </marker>
                <marker
                  id="arrow-critical"
                  viewBox="0 0 10 10"
                  refX="8"
                  refY="5"
                  markerWidth="6"
                  markerHeight="6"
                  orient="auto"
                >
                  <path d="M 0 1 L 9 5 L 0 9 z" fill="#EF4444" />
                </marker>
              </defs>
              {dependencyLines.map((line) => (
                <path
                  key={line.key}
                  d={line.d}
                  fill="none"
                  stroke={line.isCritical ? "#EF4444" : "#D4A574"}
                  strokeWidth={line.isCritical ? 2 : 1.3}
                  strokeDasharray={line.isCritical ? "none" : "3,3"}
                  markerEnd={line.isCritical ? "url(#arrow-critical)" : "url(#arrow-normal)"}
                  opacity={0.8}
                />
              ))}
            </svg>

            {/* Activity Bars Container */}
            <div className="relative pt-2" style={{ top: "0px" }}>
              {displayedActividades.map((act, index) => {
                const barLeft = getXForDate(act.inicio);
                const barWidth = Math.max(dayWidth, act.dur * dayWidth);
                const slackWidth = act.holg * dayWidth;
                const isHovered = hoveredAct === act.cod;
                const isDraggingThis = dragState?.actCod === act.cod;

                return (
                  <div
                    key={act.cod}
                    onMouseEnter={() => setHoveredAct(act.cod)}
                    onMouseLeave={() => setHoveredAct(null)}
                    className={`h-[38px] relative flex items-center border-b border-[#1E3A5F]/30 transition-colors ${
                      isHovered ? "bg-[#13274F]/30" : ""
                    }`}
                  >
                    {/* Free Float / Slack Extension Box (Dashed) */}
                    {act.holg > 0 && (
                      <div
                        className="absolute h-5 border border-dashed border-emerald-500/50 bg-emerald-500/10 rounded-r flex items-center justify-end px-1.5 pointer-events-none"
                        style={{
                          left: `${barLeft + barWidth}px`,
                          width: `${slackWidth}px`,
                        }}
                        title={`Holgura libre de ${act.cod}: ${act.holg} días`}
                      >
                        <span className="text-[8px] font-mono text-emerald-400 font-bold">
                          +{act.holg}d
                        </span>
                      </div>
                    )}

                    {/* Main Draggable Bar */}
                    <div
                      onMouseDown={(e) => handleMouseDown(e, act, "move")}
                      className={`absolute h-6 rounded-md shadow-lg flex items-center px-2 cursor-grab active:cursor-grabbing select-none group transition-shadow ${
                        act.crit
                          ? "bg-gradient-to-r from-red-600 via-red-500 to-amber-600 border border-red-400/60 shadow-[0_0_12px_rgba(239,68,68,0.35)]"
                          : "bg-gradient-to-r from-[#D4A574] via-[#E2B784] to-[#C09260] border border-[#FEF3C7]/40 text-black font-semibold shadow-[0_0_8px_rgba(212,165,116,0.2)]"
                      } ${isDraggingThis ? "ring-2 ring-white scale-[1.01] z-30" : "z-20"}`}
                      style={{
                        left: `${barLeft}px`,
                        width: `${barWidth}px`,
                      }}
                      title={`${act.cod}: ${act.desc}\nInicio: ${act.inicio} | Fin: ${act.fin}\nDuración: ${act.dur} días | Avance: ${act.avance}%`}
                    >
                      {/* Inner Progress Fill */}
                      <div
                        className="absolute left-0 top-0 bottom-0 bg-black/25 rounded-l-md pointer-events-none"
                        style={{ width: `${Math.min(100, act.avance)}%` }}
                      />

                      {/* Bar Text Label */}
                      <div className="relative z-10 flex items-center justify-between w-full pointer-events-none overflow-hidden text-[9.5px] font-mono text-white leading-none">
                        <span className="font-bold truncate drop-shadow-sm flex items-center gap-1">
                          {act.cod}
                          {barWidth > 120 && (
                            <span className="text-[8.5px] opacity-90 truncate max-w-[120px]">
                              - {act.desc}
                            </span>
                          )}
                        </span>
                        <span className="text-[8.5px] opacity-95 shrink-0 ml-1 font-bold">
                          {act.dur}d ({act.avance}%)
                        </span>
                      </div>

                      {/* Right Resize Handle Grip */}
                      <div
                        onMouseDown={(e) => handleMouseDown(e, act, "resize")}
                        className="absolute right-0 top-0 bottom-0 w-3 hover:w-3.5 bg-black/20 hover:bg-white/40 cursor-ew-resize rounded-r-md flex items-center justify-center transition-all z-20 group-hover:opacity-100 opacity-70"
                        title="Arrastre hacia la derecha o izquierda para modificar la duración"
                      >
                        <div className="w-1 h-3 border-r-2 border-white/80" />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Legend & Instructions Footer */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-[10px] font-mono text-[#8AA0C0] pt-1">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="w-3.5 h-3 rounded bg-gradient-to-r from-red-600 to-amber-600 border border-red-400" />
            <span className="text-red-300 font-bold">Ruta Crítica (Holgura = 0)</span>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="w-3.5 h-3 rounded bg-gradient-to-r from-[#D4A574] to-[#C09260] border border-[#FEF3C7]/40" />
            <span className="text-[#D4A574]">Actividades con Holgura</span>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="w-4 h-3 border border-dashed border-emerald-500 bg-emerald-500/20 rounded" />
            <span className="text-emerald-300">Holgura Libre Disponible</span>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-black/40 border border-white/40" />
            <span>% Avance Ejecutado</span>
          </div>
        </div>

        <div className="flex items-center gap-1 text-[#FEF3C7]">
          <Info size={12} className="text-[#FF6B00]" />
          <span>Haga clic y arrastre las barras para simular escenarios de aceleración o demoras</span>
        </div>
      </div>
    </div>
  );
};
