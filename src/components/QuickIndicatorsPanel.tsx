import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  SlidersHorizontal,
  TrendingDown,
  TrendingUp,
  AlertTriangle,
  Clock,
  DollarSign,
  Target,
  ShieldAlert,
  Gauge,
  Activity,
  Calendar,
  Layers,
  Dices,
  Check,
  X,
  RotateCcw,
  Sparkles,
  ChevronRight,
  ChevronLeft,
  ChevronDown,
  ChevronUp,
  Maximize2,
  Minimize2,
  Columns,
  LayoutGrid,
  Info,
  Pin,
  PinOff,
} from "lucide-react";
import {
  EVMMetrics,
  RiesgoItem,
  ProyectoInfo,
  QuickIndicatorId,
  QuickWidgetConfig,
} from "../types";

interface QuickIndicatorsPanelProps {
  metrics: EVMMetrics;
  riesgos: RiesgoItem[];
  proyecto: ProyectoInfo;
  activeTab: number;
  onSelectTab: (tabId: number) => void;
}

const STORAGE_KEY = "control_obra_quick_widgets_v3";
const SLID_OPEN_KEY = "control_obra_quick_panel_slid_open_v3";
const VIEW_MODE_KEY = "control_obra_quick_panel_view_mode_v3";

const DEFAULT_WIDGETS: QuickWidgetConfig[] = [
  {
    id: "spi",
    label: "SPI (Cronograma)",
    desc: "Índice de desempeño del cronograma EVM. Meta ≥ 1.00.",
    category: "evm",
    enabled: true,
    order: 1,
  },
  {
    id: "cpi",
    label: "CPI (Costo)",
    desc: "Índice de eficiencia del costo EVM. Meta ≥ 1.00.",
    category: "evm",
    enabled: true,
    order: 2,
  },
  {
    id: "ppc",
    label: "PPC (Last Planner)",
    desc: "Porcentaje de Plan Cumplido en Lookahead 6 semanas. Meta ≥ 85%.",
    category: "lps",
    enabled: true,
    order: 3,
  },
  {
    id: "riesgos",
    label: "Riesgos Críticos",
    desc: "Matriz ISO 31000 con severidad 5x5 y causales Art 140 / 135.",
    category: "riesgos",
    enabled: true,
    order: 4,
  },
  {
    id: "desvio",
    label: "Desvío Físico",
    desc: "Brecha porcentual entre avance programado y ejecutado.",
    category: "contractual",
    enabled: true,
    order: 5,
  },
  {
    id: "tp",
    label: "Trabajo Productivo",
    desc: "Medición Lean Construction TP / TC / TNC en frentes activos.",
    category: "lps",
    enabled: false,
    order: 6,
  },
  {
    id: "plazo",
    label: "Plazo Contractual",
    desc: "Control de los 668 días calendario y fecha fin proyectada.",
    category: "contractual",
    enabled: false,
    order: 7,
  },
  {
    id: "saldo",
    label: "Saldo Valorizaciones",
    desc: "Monto restante por valorizar del presupuesto total contratado.",
    category: "evm",
    enabled: false,
    order: 8,
  },
  {
    id: "montecarlo",
    label: "Probabilidad MC P80",
    desc: "Simulación estocástica PERT para culminar en ≤668 días.",
    category: "contractual",
    enabled: false,
    order: 9,
  },
];

export const QuickIndicatorsPanel: React.FC<QuickIndicatorsPanelProps> = ({
  metrics,
  riesgos,
  proyecto,
  activeTab,
  onSelectTab,
}) => {
  // Panel Slidable / Deslizable State (Default is collapsed / slid closed so it does not block tabs permanently)
  const [isSlidOpen, setIsSlidOpen] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem(SLID_OPEN_KEY);
      return saved === "true"; // Defaults to false if not saved
    } catch {
      return false;
    }
  });

  // Display mode: 'carousel' (Deslizable horizontal con flechas) vs 'grid' (Cuadrícula completa)
  const [viewMode, setViewMode] = useState<"carousel" | "grid">(() => {
    try {
      const saved = localStorage.getItem(VIEW_MODE_KEY);
      return saved === "grid" ? "grid" : "carousel";
    } catch {
      return "carousel";
    }
  });

  const [compactMode, setCompactMode] = useState<boolean>(() => {
    try {
      return localStorage.getItem("control_obra_widget_compact_v3") === "true";
    } catch {
      return false;
    }
  });

  const [widgets, setWidgets] = useState<QuickWidgetConfig[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed: QuickWidgetConfig[] = JSON.parse(saved);
        const map = new Map(parsed.map((p) => [p.id, p]));
        return DEFAULT_WIDGETS.map((def) => map.get(def.id) || def).sort(
          (a, b) => a.order - b.order
        );
      }
    } catch {
      // Fallback
    }
    return DEFAULT_WIDGETS;
  });

  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [selectedPreset, setSelectedPreset] = useState<string>("custom");

  // Ref for the horizontal sliding container
  const carouselRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState<boolean>(false);
  const [canScrollRight, setCanScrollRight] = useState<boolean>(true);

  // Persistence
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(widgets));
      localStorage.setItem(SLID_OPEN_KEY, String(isSlidOpen));
      localStorage.setItem(VIEW_MODE_KEY, viewMode);
      localStorage.setItem("control_obra_widget_compact_v3", String(compactMode));
    } catch {
      // Ignore
    }
  }, [widgets, isSlidOpen, viewMode, compactMode]);

  // Derived statistics for widget contents
  const activeRiesgosCriticos = useMemo(() => {
    return riesgos.filter(
      (r) => r.nivel === "Crítico" || r.prob * r.impacto >= 5000
    );
  }, [riesgos]);

  const totalDiasImpactoRiesgos = useMemo(() => {
    return riesgos.reduce((acc, r) => acc + (r.dias || 0), 0);
  }, [riesgos]);

  const enabledWidgets = useMemo(() => {
    return widgets.filter((w) => w.enabled).sort((a, b) => a.order - b.order);
  }, [widgets]);

  // Handle carousel scroll status
  const updateScrollButtons = () => {
    if (!carouselRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = carouselRef.current;
    setCanScrollLeft(scrollLeft > 5);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 5);
  };

  useEffect(() => {
    if (isSlidOpen && viewMode === "carousel") {
      updateScrollButtons();
    }
  }, [isSlidOpen, viewMode, enabledWidgets]);

  const slideCarousel = (direction: "left" | "right") => {
    if (!carouselRef.current) return;
    const scrollAmount = 300;
    carouselRef.current.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    });
    setTimeout(updateScrollButtons, 350);
  };

  const toggleWidget = (id: QuickIndicatorId) => {
    setWidgets((prev) =>
      prev.map((w) => (w.id === id ? { ...w, enabled: !w.enabled } : w))
    );
  };

  const applyPreset = (presetKey: string) => {
    setSelectedPreset(presetKey);
    setWidgets((prev) => {
      let targetIds: QuickIndicatorId[] = [];
      if (presetKey === "core") {
        targetIds = ["spi", "cpi", "ppc", "riesgos"];
      } else if (presetKey === "evm") {
        targetIds = ["spi", "cpi", "desvio", "saldo"];
      } else if (presetKey === "lean") {
        targetIds = ["ppc", "tp", "riesgos", "plazo"];
      } else if (presetKey === "all") {
        targetIds = prev.map((w) => w.id);
      }

      return prev.map((w) => ({
        ...w,
        enabled: targetIds.includes(w.id),
      }));
    });
  };

  const resetDefaults = () => {
    setWidgets(DEFAULT_WIDGETS);
    setSelectedPreset("core");
  };

  // Render individual widget card
  const renderWidget = (w: QuickWidgetConfig, index: number) => {
    // Dynamic width for carousel vs grid
    const cardWidthClass =
      viewMode === "carousel"
        ? "w-[270px] sm:w-[290px] shrink-0"
        : "w-full";

    switch (w.id) {
      case "spi": {
        const isCritical = metrics.spi < 0.7;
        const isWarning = metrics.spi >= 0.7 && metrics.spi < 0.9;
        const targetTab = 5;

        return (
          <div
            key={w.id}
            id={`quick-widget-${w.id}`}
            onClick={() => onSelectTab(targetTab)}
            className={`${cardWidthClass} group relative rounded-xl border p-3 cursor-pointer transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl select-none ${
              activeTab === targetTab
                ? "bg-[#102A4E] border-[#FF6B00] ring-1 ring-[#FF6B00]/40"
                : isCritical
                ? "bg-[#0B1D3A]/95 border-red-500/40 hover:border-red-400 hover:bg-red-950/20"
                : isWarning
                ? "bg-[#0B1D3A]/95 border-amber-500/40 hover:border-amber-400"
                : "bg-[#0B1D3A]/95 border-emerald-500/40 hover:border-emerald-400"
            }`}
            title="Haga clic para ir a Valorizaciones y Curva S (Item 5)"
          >
            <div className="flex items-center justify-between gap-1 mb-1.5">
              <div className="flex items-center gap-1.5 min-w-0">
                <div
                  className={`w-2 h-2 rounded-full ${
                    isCritical
                      ? "bg-red-500 animate-ping"
                      : isWarning
                      ? "bg-amber-400"
                      : "bg-emerald-400"
                  }`}
                />
                <span className="text-[10.5px] font-mono font-bold tracking-wider text-[#8AA0C0] uppercase truncate">
                  SPI Cronograma
                </span>
              </div>
              <div className="flex items-center gap-1">
                <span
                  className={`text-[9px] font-mono px-1.5 py-0.2 rounded font-bold ${
                    isCritical
                      ? "bg-red-500/20 text-red-300 border border-red-500/40"
                      : isWarning
                      ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                      : "bg-emerald-500/20 text-emerald-300"
                  }`}
                >
                  {isCritical ? "CRÍTICO" : isWarning ? "ALERTA" : "OK"}
                </span>
                <ChevronRight
                  size={11}
                  className="text-[#8AA0C0] opacity-0 group-hover:opacity-100 transition-opacity"
                />
              </div>
            </div>

            <div className="flex items-baseline justify-between gap-2">
              <div
                className={`text-[22px] font-mono font-extrabold tracking-tight ${
                  isCritical
                    ? "text-red-400"
                    : isWarning
                    ? "text-amber-300"
                    : "text-emerald-300"
                }`}
              >
                {metrics.spi.toFixed(2)}
              </div>
              <div className="text-[10px] font-mono text-right text-[#8AA0C0]">
                <span>Meta ≥ 1.00</span>
                <span className="block text-red-400 font-bold">
                  Δ -{(1 - metrics.spi).toFixed(2)}
                </span>
              </div>
            </div>

            {!compactMode && (
              <>
                <div className="w-full bg-[#030A18] h-1.5 rounded-full mt-2 overflow-hidden border border-[#1E3A5F]/40 relative">
                  <div
                    className={`h-full rounded-full transition-all ${
                      isCritical
                        ? "bg-red-500"
                        : isWarning
                        ? "bg-amber-400"
                        : "bg-emerald-400"
                    }`}
                    style={{ width: `${Math.min(100, metrics.spi * 100)}%` }}
                  />
                </div>

                <div className="mt-2 pt-1.5 border-t border-[#1E3A5F]/40 flex items-center justify-between text-[9px] font-mono text-[#8AA0C0]">
                  <span className="truncate">
                    Atraso: {metrics.atraso.toFixed(1)}%
                  </span>
                  <span className="text-[#FF6B00] shrink-0 font-bold">
                    Item 5 EVM &rarr;
                  </span>
                </div>
              </>
            )}
          </div>
        );
      }

      case "cpi": {
        const isCritical = metrics.cpi < 0.85;
        const isWarning = metrics.cpi >= 0.85 && metrics.cpi < 1.0;
        const targetTab = 5;

        return (
          <div
            key={w.id}
            id={`quick-widget-${w.id}`}
            onClick={() => onSelectTab(targetTab)}
            className={`${cardWidthClass} group relative rounded-xl border p-3 cursor-pointer transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl select-none ${
              activeTab === targetTab
                ? "bg-[#102A4E] border-[#38BDF8] ring-1 ring-[#38BDF8]/40"
                : isCritical
                ? "bg-[#0B1D3A]/95 border-red-500/40 hover:border-red-400"
                : isWarning
                ? "bg-[#0B1D3A]/95 border-amber-500/40 hover:border-amber-400"
                : "bg-[#0B1D3A]/95 border-emerald-500/40 hover:border-emerald-400"
            }`}
            title="Haga clic para ir a Control de Costos (Item 5)"
          >
            <div className="flex items-center justify-between gap-1 mb-1.5">
              <div className="flex items-center gap-1.5 min-w-0">
                <div
                  className={`w-2 h-2 rounded-full ${
                    isCritical
                      ? "bg-red-500"
                      : isWarning
                      ? "bg-amber-400"
                      : "bg-emerald-400"
                  }`}
                />
                <span className="text-[10.5px] font-mono font-bold tracking-wider text-[#8AA0C0] uppercase truncate">
                  CPI Costo
                </span>
              </div>
              <div className="flex items-center gap-1">
                <span
                  className={`text-[9px] font-mono px-1.5 py-0.2 rounded font-bold ${
                    isCritical
                      ? "bg-red-500/20 text-red-300"
                      : isWarning
                      ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                      : "bg-emerald-500/20 text-emerald-300"
                  }`}
                >
                  {metrics.cpi >= 1.0 ? "EFICIENTE" : "SOBRECOSTO"}
                </span>
                <ChevronRight
                  size={11}
                  className="text-[#8AA0C0] opacity-0 group-hover:opacity-100 transition-opacity"
                />
              </div>
            </div>

            <div className="flex items-baseline justify-between gap-2">
              <div
                className={`text-[22px] font-mono font-extrabold tracking-tight ${
                  isCritical
                    ? "text-red-400"
                    : isWarning
                    ? "text-amber-300"
                    : "text-emerald-300"
                }`}
              >
                {metrics.cpi.toFixed(2)}
              </div>
              <div className="text-[10px] font-mono text-right text-[#8AA0C0]">
                <span>EAC: S/ 39.58M</span>
                <span className="block text-amber-300 font-bold">
                  BAC: S/ 36.41M
                </span>
              </div>
            </div>

            {!compactMode && (
              <>
                <div className="w-full bg-[#030A18] h-1.5 rounded-full mt-2 overflow-hidden border border-[#1E3A5F]/40">
                  <div
                    className={`h-full rounded-full transition-all ${
                      isCritical
                        ? "bg-red-500"
                        : isWarning
                        ? "bg-amber-400"
                        : "bg-emerald-400"
                    }`}
                    style={{ width: `${Math.min(100, metrics.cpi * 100)}%` }}
                  />
                </div>

                <div className="mt-2 pt-1.5 border-t border-[#1E3A5F]/40 flex items-center justify-between text-[9px] font-mono text-[#8AA0C0]">
                  <span className="truncate">EV S/19.53M vs AC S/21.23M</span>
                  <span className="text-[#38BDF8] shrink-0 font-bold">
                    Item 5 Costos &rarr;
                  </span>
                </div>
              </>
            )}
          </div>
        );
      }

      case "ppc": {
        const isGood = metrics.ppc >= 80;
        const targetTab = 8;

        return (
          <div
            key={w.id}
            id={`quick-widget-${w.id}`}
            onClick={() => onSelectTab(targetTab)}
            className={`${cardWidthClass} group relative rounded-xl border p-3 cursor-pointer transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl select-none ${
              activeTab === targetTab
                ? "bg-[#102A4E] border-[#38BDF8] ring-1 ring-[#38BDF8]/40"
                : isGood
                ? "bg-[#0B1D3A]/95 border-emerald-500/40 hover:border-emerald-400"
                : "bg-[#0B1D3A]/95 border-[#D4A574]/40 hover:border-[#D4A574]"
            }`}
            title="Haga clic para ir a Lookahead LPS (Item 8)"
          >
            <div className="flex items-center justify-between gap-1 mb-1.5">
              <div className="flex items-center gap-1.5 min-w-0">
                <Target size={12} className="text-[#D4A574]" />
                <span className="text-[10.5px] font-mono font-bold tracking-wider text-[#8AA0C0] uppercase truncate">
                  PPC Last Planner
                </span>
              </div>
              <div className="flex items-center gap-1">
                <span className="text-[9px] font-mono px-1.5 py-0.2 rounded font-bold bg-[#13274F] text-[#D4A574] border border-[#1E3A5F]">
                  Meta 85%
                </span>
                <ChevronRight
                  size={11}
                  className="text-[#8AA0C0] opacity-0 group-hover:opacity-100 transition-opacity"
                />
              </div>
            </div>

            <div className="flex items-baseline justify-between gap-2">
              <div className="text-[22px] font-mono font-extrabold tracking-tight text-[#D4A574]">
                {metrics.ppc}%
              </div>
              <div className="text-[10px] font-mono text-right text-[#8AA0C0]">
                <span>Sprints 6 sem</span>
                <span className="block text-emerald-400 font-bold">
                  1/3 Restr. Lib
                </span>
              </div>
            </div>

            {!compactMode && (
              <>
                <div className="w-full bg-[#030A18] h-1.5 rounded-full mt-2 overflow-hidden border border-[#1E3A5F]/40">
                  <div
                    className="h-full bg-gradient-to-r from-[#D4A574] to-[#FEF3C7] rounded-full transition-all"
                    style={{ width: `${Math.min(100, metrics.ppc)}%` }}
                  />
                </div>

                <div className="mt-2 pt-1.5 border-t border-[#1E3A5F]/40 flex items-center justify-between text-[9px] font-mono text-[#8AA0C0]">
                  <span className="truncate">Plan Semanal Confiable</span>
                  <span className="text-[#D4A574] shrink-0 font-bold">
                    Item 8 LPS &rarr;
                  </span>
                </div>
              </>
            )}
          </div>
        );
      }

      case "riesgos": {
        const critCount = activeRiesgosCriticos.length;
        const targetTab = 11;

        return (
          <div
            key={w.id}
            id={`quick-widget-${w.id}`}
            onClick={() => onSelectTab(targetTab)}
            className={`${cardWidthClass} group relative rounded-xl border p-3 cursor-pointer transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl select-none ${
              activeTab === targetTab
                ? "bg-[#102A4E] border-[#38BDF8] ring-1 ring-[#38BDF8]/40"
                : critCount > 0
                ? "bg-[#0B1D3A]/95 border-red-500/50 hover:border-red-400 hover:bg-red-950/20"
                : "bg-[#0B1D3A]/95 border-[#1E3A5F] hover:border-[#D4A574]"
            }`}
            title="Haga clic para ver Matriz de Riesgos ISO 31000 (Item 11)"
          >
            <div className="flex items-center justify-between gap-1 mb-1.5">
              <div className="flex items-center gap-1.5 min-w-0">
                <ShieldAlert size={12} className="text-red-400" />
                <span className="text-[10.5px] font-mono font-bold tracking-wider text-[#8AA0C0] uppercase truncate">
                  Riesgos ISO 31000
                </span>
              </div>
              <div className="flex items-center gap-1">
                <span className="text-[9px] font-mono px-1.5 py-0.2 rounded font-bold bg-red-500/20 text-red-300 border border-red-500/50 animate-pulse">
                  {critCount} CRÍTICOS
                </span>
                <ChevronRight
                  size={11}
                  className="text-[#8AA0C0] opacity-0 group-hover:opacity-100 transition-opacity"
                />
              </div>
            </div>

            <div className="flex items-baseline justify-between gap-2">
              <div className="text-[22px] font-mono font-extrabold tracking-tight text-red-400">
                25
                <span className="text-[13px] text-[#8AA0C0] font-normal">
                  /25 Máx
                </span>
              </div>
              <div className="text-[10px] font-mono text-right text-[#8AA0C0]">
                <span>RG-01 Club Social</span>
                <span className="block text-red-400 font-bold">
                  {totalDiasImpactoRiesgos}d impacto
                </span>
              </div>
            </div>

            {!compactMode && (
              <>
                <div className="w-full bg-[#030A18] h-1.5 rounded-full mt-2 overflow-hidden border border-[#1E3A5F]/40">
                  <div
                    className="h-full bg-gradient-to-r from-amber-500 to-red-600 rounded-full"
                    style={{ width: "90%" }}
                  />
                </div>

                <div className="mt-2 pt-1.5 border-t border-[#1E3A5F]/40 flex items-center justify-between text-[9px] font-mono text-[#8AA0C0]">
                  <span className="truncate">Sustento Art 140 / Mora 135</span>
                  <span className="text-red-400 shrink-0 font-bold">
                    Item 11 Riesgos &rarr;
                  </span>
                </div>
              </>
            )}
          </div>
        );
      }

      case "desvio": {
        const targetTab = 5;
        return (
          <div
            key={w.id}
            id={`quick-widget-${w.id}`}
            onClick={() => onSelectTab(targetTab)}
            className={`${cardWidthClass} group relative rounded-xl border border-red-500/40 bg-[#0B1D3A]/95 p-3 cursor-pointer transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl select-none`}
            title="Haga clic para ver el Desvío en Valorizaciones (Item 5)"
          >
            <div className="flex items-center justify-between gap-1 mb-1.5">
              <span className="text-[10.5px] font-mono font-bold tracking-wider text-[#8AA0C0] uppercase">
                Desvío Físico
              </span>
              <span className="text-[9px] font-mono px-1.5 py-0.2 rounded font-bold bg-red-500/20 text-red-300">
                ATRASO
              </span>
            </div>
            <div className="flex items-baseline justify-between gap-2">
              <div className="text-[22px] font-mono font-extrabold text-red-400">
                {metrics.atraso.toFixed(2)}%
              </div>
              <div className="text-[10px] font-mono text-right text-[#8AA0C0]">
                <span>Prog: {metrics.prog.toFixed(1)}%</span>
                <span className="block text-emerald-300 font-bold">
                  Ejec: {metrics.ejec.toFixed(1)}%
                </span>
              </div>
            </div>
            {!compactMode && (
              <div className="mt-2 pt-1.5 border-t border-[#1E3A5F]/40 flex items-center justify-between text-[9px] font-mono text-[#8AA0C0]">
                <span>Brecha acumulada</span>
                <span className="text-[#FF6B00] font-bold">Item 5 &rarr;</span>
              </div>
            )}
          </div>
        );
      }

      case "tp": {
        const targetTab = 10;
        return (
          <div
            key={w.id}
            id={`quick-widget-${w.id}`}
            onClick={() => onSelectTab(targetTab)}
            className={`${cardWidthClass} group relative rounded-xl border border-emerald-500/40 bg-[#0B1D3A]/95 p-3 cursor-pointer transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl select-none`}
            title="Haga clic para ver Productividad Lean (Item 10)"
          >
            <div className="flex items-center justify-between gap-1 mb-1.5">
              <span className="text-[10.5px] font-mono font-bold tracking-wider text-[#8AA0C0] uppercase">
                Trabajo Productivo
              </span>
              <span className="text-[9px] font-mono px-1.5 py-0.2 rounded font-bold bg-emerald-500/20 text-emerald-300">
                LEAN
              </span>
            </div>
            <div className="flex items-baseline justify-between gap-2">
              <div className="text-[22px] font-mono font-extrabold text-emerald-300">
                {metrics.tp}%
              </div>
              <div className="text-[10px] font-mono text-right text-[#8AA0C0]">
                <span>TC: {metrics.tc}%</span>
                <span className="block text-amber-300 font-bold">
                  TNC: {metrics.tnc}%
                </span>
              </div>
            </div>
            {!compactMode && (
              <div className="mt-2 pt-1.5 border-t border-[#1E3A5F]/40 flex items-center justify-between text-[9px] font-mono text-[#8AA0C0]">
                <span>Eficiencia cuadrillas campo</span>
                <span className="text-emerald-400 font-bold">Item 10 &rarr;</span>
              </div>
            )}
          </div>
        );
      }

      case "plazo": {
        const targetTab = 7;
        return (
          <div
            key={w.id}
            id={`quick-widget-${w.id}`}
            onClick={() => onSelectTab(targetTab)}
            className={`${cardWidthClass} group relative rounded-xl border border-[#D4A574]/40 bg-[#0B1D3A]/95 p-3 cursor-pointer transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl select-none`}
            title="Haga clic para ver Cronograma CPM (Item 7)"
          >
            <div className="flex items-center justify-between gap-1 mb-1.5">
              <span className="text-[10.5px] font-mono font-bold tracking-wider text-[#8AA0C0] uppercase">
                Plazo Contractual
              </span>
              <span className="text-[9px] font-mono px-1.5 py-0.2 rounded font-bold bg-[#13274F] text-[#FEF3C7]">
                CPM 668d
              </span>
            </div>
            <div className="flex items-baseline justify-between gap-2">
              <div className="text-[22px] font-mono font-extrabold text-[#FEF3C7]">
                {proyecto.plazoActual}d
              </div>
              <div className="text-[10px] font-mono text-right text-[#8AA0C0]">
                <span>Límite 668d</span>
                <span className="block text-amber-300 font-bold">
                  Fin: 22/02/2027
                </span>
              </div>
            </div>
            {!compactMode && (
              <div className="mt-2 pt-1.5 border-t border-[#1E3A5F]/40 flex items-center justify-between text-[9px] font-mono text-[#8AA0C0]">
                <span>Gantt interactivo con arrastre</span>
                <span className="text-[#D4A574] font-bold">Item 7 &rarr;</span>
              </div>
            )}
          </div>
        );
      }

      case "saldo": {
        const targetTab = 5;
        return (
          <div
            key={w.id}
            id={`quick-widget-${w.id}`}
            onClick={() => onSelectTab(targetTab)}
            className={`${cardWidthClass} group relative rounded-xl border border-[#1E3A5F] bg-[#0B1D3A]/95 p-3 cursor-pointer transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl select-none`}
            title="Haga clic para ver Saldo de Obra (Item 5)"
          >
            <div className="flex items-center justify-between gap-1 mb-1.5">
              <span className="text-[10.5px] font-mono font-bold tracking-wider text-[#8AA0C0] uppercase">
                Saldo Valorizaciones
              </span>
              <span className="text-[9px] font-mono px-1.5 py-0.2 rounded font-bold bg-[#13274F] text-[#38BDF8]">
                44.8%
              </span>
            </div>
            <div className="flex items-baseline justify-between gap-2">
              <div className="text-[20px] font-mono font-extrabold text-[#38BDF8]">
                S/ 16.31M
              </div>
              <div className="text-[10px] font-mono text-right text-[#8AA0C0]">
                <span>Acum: S/20.10M</span>
                <span className="block text-emerald-300 font-bold">
                  Val 17: S/646k
                </span>
              </div>
            </div>
            {!compactMode && (
              <div className="mt-2 pt-1.5 border-t border-[#1E3A5F]/40 flex items-center justify-between text-[9px] font-mono text-[#8AA0C0]">
                <span>Presupuesto total S/ 36.41M</span>
                <span className="text-[#38BDF8] font-bold">Item 5 &rarr;</span>
              </div>
            )}
          </div>
        );
      }

      case "montecarlo": {
        const targetTab = 13;
        return (
          <div
            key={w.id}
            id={`quick-widget-${w.id}`}
            onClick={() => onSelectTab(targetTab)}
            className={`${cardWidthClass} group relative rounded-xl border border-amber-500/40 bg-[#0B1D3A]/95 p-3 cursor-pointer transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl select-none`}
            title="Haga clic para ir a Simulación Monte Carlo (Item 13)"
          >
            <div className="flex items-center justify-between gap-1 mb-1.5">
              <span className="text-[10.5px] font-mono font-bold tracking-wider text-[#8AA0C0] uppercase">
                Probabilidad MC
              </span>
              <span className="text-[9px] font-mono px-1.5 py-0.2 rounded font-bold bg-amber-500/20 text-amber-300">
                P(&le;668d)
              </span>
            </div>
            <div className="flex items-baseline justify-between gap-2">
              <div className="text-[22px] font-mono font-extrabold text-amber-300">
                31.8%
              </div>
              <div className="text-[10px] font-mono text-right text-[#8AA0C0]">
                <span>P50: 702d</span>
                <span className="block text-red-400 font-bold">P80: 726d</span>
              </div>
            </div>
            {!compactMode && (
              <div className="mt-2 pt-1.5 border-t border-[#1E3A5F]/40 flex items-center justify-between text-[9px] font-mono text-[#8AA0C0]">
                <span>Simulación estocástica PERT</span>
                <span className="text-amber-300 font-bold">Item 13 &rarr;</span>
              </div>
            )}
          </div>
        );
      }

      default:
        return null;
    }
  };

  return (
    <div
      id="quick-indicators-slidable-wrapper"
      className="mb-3 bg-gradient-to-r from-[#030A18] via-[#0B1D3A] to-[#030A18] border border-[#1E3A5F] rounded-xl shadow-lg transition-all duration-300 overflow-hidden"
    >
      {/* 
        BARRA DESLIZANTE PRINCIPAL (Slide Header / Mini Bar)
        Siempre compacta y no invasiva: Permite deslizar para abrir o cerrar
      */}
      <div
        className={`px-3 py-2 flex flex-wrap items-center justify-between gap-2 transition-colors select-none ${
          isSlidOpen ? "border-b border-[#1E3A5F]/70 bg-[#0B1D3A]/80" : "hover:bg-[#0B1D3A]/50"
        }`}
      >
        {/* Left Side: Click to Slide Toggle & Title */}
        <div
          onClick={() => setIsSlidOpen(!isSlidOpen)}
          className="flex items-center gap-2 cursor-pointer group"
          title={isSlidOpen ? "Deslizar para ocultar panel" : "Deslizar para abrir panel de indicadores"}
        >
          <div className="w-6 h-6 rounded-md bg-[#FF6B00]/20 border border-[#FF6B00]/40 flex items-center justify-center group-hover:scale-105 transition-transform">
            <Gauge size={14} className="text-[#FF6B00]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-[11.5px] md:text-[12px] font-bold text-[#E6F1FF] tracking-wide flex items-center gap-1.5">
                PANEL DE INDICADORES RÁPIDOS
                <span className="px-1.5 py-0.2 rounded text-[9px] font-mono font-semibold bg-[#13274F] text-[#38BDF8] border border-[#1E3A5F]">
                  {isSlidOpen ? "DESPLEGADO" : "DESLIZABLE"}
                </span>
                <span className="text-[9px] font-mono text-[#8AA0C0] hidden sm:inline">
                  ({enabledWidgets.length} activos)
                </span>
              </h3>
            </div>
          </div>
        </div>

        {/* Center: Live summary chips when slid closed (shows key metrics without taking full screen) */}
        {!isSlidOpen && (
          <div
            onClick={() => setIsSlidOpen(true)}
            className="flex items-center gap-2 flex-wrap cursor-pointer text-[10px] font-mono"
            title="Haga clic aquí para deslizar y ver los detalles"
          >
            <span className="px-2 py-0.5 rounded bg-red-500/15 border border-red-500/30 text-red-300 font-bold">
              SPI: {metrics.spi.toFixed(2)}
            </span>
            <span className="px-2 py-0.5 rounded bg-[#38BDF8]/15 border border-[#38BDF8]/30 text-[#38BDF8] font-bold">
              CPI: {metrics.cpi.toFixed(2)}
            </span>
            <span className="px-2 py-0.5 rounded bg-[#D4A574]/15 border border-[#D4A574]/30 text-[#D4A574] font-bold hidden md:inline">
              PPC: {metrics.ppc}%
            </span>
            <span className="px-2 py-0.5 rounded bg-red-500/15 border border-red-500/30 text-red-300 font-bold hidden lg:inline">
              {activeRiesgosCriticos.length} Riesgos Críticos
            </span>
          </div>
        )}

        {/* Right Controls: Slide Toggle Button + Customization + View Mode */}
        <div className="flex items-center gap-1.5">
          {isSlidOpen && (
            <>
              {/* Carousel vs Grid View Mode Toggle */}
              <div
                className="flex items-center bg-[#030A18] border border-[#1E3A5F] rounded p-0.5 text-[10px] font-mono"
                title="Cambiar entre modo carrusel deslizable horizontal y cuadrícula"
              >
                <button
                  onClick={() => setViewMode("carousel")}
                  className={`p-1 rounded flex items-center gap-1 transition-colors ${
                    viewMode === "carousel"
                      ? "bg-[#1E3A5F] text-[#FEF3C7] font-bold"
                      : "text-[#8AA0C0] hover:text-white"
                  }`}
                  title="Modo carrusel deslizable horizontal"
                >
                  <Columns size={12} />
                  <span className="hidden xl:inline">Carrusel</span>
                </button>
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-1 rounded flex items-center gap-1 transition-colors ${
                    viewMode === "grid"
                      ? "bg-[#1E3A5F] text-[#FEF3C7] font-bold"
                      : "text-[#8AA0C0] hover:text-white"
                  }`}
                  title="Modo cuadrícula completa"
                >
                  <LayoutGrid size={12} />
                  <span className="hidden xl:inline">Cuadrícula</span>
                </button>
              </div>

              {/* Compact Mode Toggle */}
              <button
                onClick={() => setCompactMode(!compactMode)}
                className="p-1 px-1.5 rounded bg-[#030A18] border border-[#1E3A5F] text-[#8AA0C0] hover:text-[#FEF3C7] text-[10px] font-mono transition-colors"
                title={compactMode ? "Vista detallada" : "Vista compacta"}
              >
                {compactMode ? <Maximize2 size={12} /> : <Minimize2 size={12} />}
              </button>

              {/* Customize Button */}
              <button
                onClick={() => setIsModalOpen(true)}
                className="flex items-center gap-1 p-1 px-2 rounded bg-[#0B1D3A] border border-[#38BDF8]/40 text-[#FEF3C7] text-[10px] font-mono hover:bg-[#1E3A5F] transition-colors"
                title="Personalizar qué indicadores mostrar"
              >
                <SlidersHorizontal size={11} className="text-[#FF6B00]" />
                <span className="hidden sm:inline">Configurar</span>
              </button>
            </>
          )}

          {/* Primary Slide Trigger Button */}
          <button
            id="btn-slide-toggle-indicators"
            onClick={() => setIsSlidOpen(!isSlidOpen)}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg border text-[11px] font-mono font-bold transition-all shadow-md active:scale-95 ${
              isSlidOpen
                ? "bg-[#1E3A5F] border-[#38BDF8]/50 text-[#FEF3C7] hover:bg-[#254B7A]"
                : "bg-gradient-to-r from-[#FF6B00] to-[#E55A00] border-[#FF6B00] text-black hover:brightness-110"
            }`}
          >
            {isSlidOpen ? (
              <>
                <span>Ocultar Panel</span>
                <ChevronUp size={14} />
              </>
            ) : (
              <>
                <span>Deslizar Panel</span>
                <ChevronDown size={14} />
              </>
            )}
          </button>
        </div>
      </div>

      {/* 
        CONTENIDO DESLIZABLE (Sliding Body Drawer)
        Solo se renderiza o despliega cuando isSlidOpen es true
      */}
      <div
        className={`transition-all duration-300 ease-in-out ${
          isSlidOpen
            ? "max-h-[850px] opacity-100 p-3 pt-2.5 overflow-visible"
            : "max-h-0 opacity-0 p-0 overflow-hidden pointer-events-none"
        }`}
      >
        {/* Navigation Toolbar for Carousel Mode */}
        {viewMode === "carousel" && enabledWidgets.length > 0 && (
          <div className="flex items-center justify-between gap-2 mb-2 px-1 text-[10.5px] font-mono text-[#8AA0C0]">
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1 text-[#D4A574] font-semibold">
                <Columns size={12} />
                <span>Deslizar horizontalmente con flechas o rueda del mouse</span>
              </span>
              <span className="text-[9px] text-[#8AA0C0] hidden md:inline">
                • {enabledWidgets.length} indicadores disponibles
              </span>
            </div>

            {/* Horizontal Slide Controls (Left / Right Arrow Buttons) */}
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => slideCarousel("left")}
                disabled={!canScrollLeft}
                className={`p-1.5 rounded-md border flex items-center gap-1 transition-all ${
                  canScrollLeft
                    ? "bg-[#0B1D3A] border-[#38BDF8]/50 text-[#FEF3C7] hover:bg-[#1E3A5F] shadow-sm"
                    : "bg-[#020A1E] border-[#1E3A5F]/40 text-[#8AA0C0]/40 cursor-not-allowed"
                }`}
                title="Deslizar hacia la izquierda"
              >
                <ChevronLeft size={14} />
                <span className="text-[9px] hidden sm:inline font-bold">Izq</span>
              </button>

              <button
                onClick={() => slideCarousel("right")}
                disabled={!canScrollRight}
                className={`p-1.5 rounded-md border flex items-center gap-1 transition-all ${
                  canScrollRight
                    ? "bg-[#0B1D3A] border-[#38BDF8]/50 text-[#FEF3C7] hover:bg-[#1E3A5F] shadow-sm"
                    : "bg-[#020A1E] border-[#1E3A5F]/40 text-[#8AA0C0]/40 cursor-not-allowed"
                }`}
                title="Deslizar hacia la derecha"
              >
                <span className="text-[9px] hidden sm:inline font-bold">Der</span>
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}

        {/* Widgets Render: Carousel Mode (Deslizable horizontal) vs Grid Mode */}
        {enabledWidgets.length === 0 ? (
          <div className="py-6 text-center text-xs font-mono text-[#8AA0C0] bg-[#020A1E]/50 rounded-lg border border-dashed border-[#1E3A5F]">
            <p>No hay indicadores seleccionados en este momento.</p>
            <button
              onClick={() => applyPreset("core")}
              className="mt-2 px-3 py-1 rounded bg-[#FF6B00] text-black font-bold text-[10px]"
            >
              Activar Cuarteto Esencial (SPI, CPI, PPC, Riesgos)
            </button>
          </div>
        ) : viewMode === "carousel" ? (
          /* Horizontal Carousel (Deslizable horizontalmente) */
          <div
            ref={carouselRef}
            onScroll={updateScrollButtons}
            className="flex items-stretch gap-3 overflow-x-auto pb-2 scroll-smooth no-scrollbar snap-x snap-mandatory"
            style={{ scrollbarWidth: "thin" }}
          >
            {enabledWidgets.map((w, idx) => (
              <div key={w.id} className="snap-start shrink-0">
                {renderWidget(w, idx)}
              </div>
            ))}
          </div>
        ) : (
          /* Grid Mode (Cuadrícula responsiva) */
          <div
            className={`grid gap-2.5 transition-all duration-200 ${
              enabledWidgets.length === 1
                ? "grid-cols-1"
                : enabledWidgets.length === 2
                ? "grid-cols-1 sm:grid-cols-2"
                : enabledWidgets.length === 3
                ? "grid-cols-1 sm:grid-cols-3"
                : enabledWidgets.length === 4
                ? "grid-cols-2 lg:grid-cols-4"
                : "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5"
            }`}
          >
            {enabledWidgets.map((w, idx) => renderWidget(w, idx))}
          </div>
        )}

        {/* Footer info when slid open */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 mt-1 border-t border-[#1E3A5F]/40 text-[9.5px] font-mono text-[#8AA0C0]">
          <div className="flex items-center gap-1.5">
            <Info size={11} className="text-[#38BDF8]" />
            <span>
              Panel deslizable: Haga clic en cualquier indicador para saltar directamente a su módulo.
            </span>
          </div>
          <button
            onClick={() => setIsSlidOpen(false)}
            className="text-[#FF6B00] hover:underline flex items-center gap-1 font-semibold"
          >
            <ChevronUp size={12} />
            <span>Deslizar para ocultar y ganar espacio de trabajo</span>
          </button>
        </div>
      </div>

      {/* Modal de Personalización */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/75 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-[#030A18] border-2 border-[#1E3A5F] rounded-2xl max-w-2xl w-full p-4 md:p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-[#1E3A5F]">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-[#FF6B00]/20 border border-[#FF6B00] flex items-center justify-center">
                  <SlidersHorizontal size={18} className="text-[#FF6B00]" />
                </div>
                <div>
                  <h3 className="text-[14px] font-bold text-[#E6F1FF] tracking-wide">
                    PERSONALIZAR PANEL DESLIZABLE
                  </h3>
                  <p className="text-[11px] font-mono text-[#8AA0C0]">
                    Active o desactive los indicadores que se mostrarán en el carrusel deslizable.
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-lg text-[#8AA0C0] hover:text-white hover:bg-[#1E3A5F] transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Presets Row */}
            <div className="space-y-1.5">
              <span className="text-[10px] font-mono text-[#8AA0C0] uppercase font-bold tracking-wider">
                Configuraciones Rápidas (Presets):
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[10.5px] font-mono">
                <button
                  onClick={() => applyPreset("core")}
                  className={`p-2 rounded-lg border text-left transition-colors ${
                    selectedPreset === "core"
                      ? "bg-[#1E3A5F] border-[#FF6B00] text-[#FEF3C7] font-bold"
                      : "bg-[#0B1D3A] border-[#1E3A5F] text-[#8AA0C0] hover:text-white"
                  }`}
                >
                  <div className="font-bold flex items-center gap-1 text-[#FF6B00]">
                    <Sparkles size={11} />
                    <span>Cuarteto Clave</span>
                  </div>
                  <div className="text-[9px] opacity-80 mt-0.5">
                    SPI, CPI, PPC, Riesgos
                  </div>
                </button>

                <button
                  onClick={() => applyPreset("evm")}
                  className={`p-2 rounded-lg border text-left transition-colors ${
                    selectedPreset === "evm"
                      ? "bg-[#1E3A5F] border-[#38BDF8] text-[#FEF3C7] font-bold"
                      : "bg-[#0B1D3A] border-[#1E3A5F] text-[#8AA0C0] hover:text-white"
                  }`}
                >
                  <div className="font-bold text-[#38BDF8]">EVM y Costos</div>
                  <div className="text-[9px] opacity-80 mt-0.5">
                    SPI, CPI, Desvío, Saldo
                  </div>
                </button>

                <button
                  onClick={() => applyPreset("lean")}
                  className={`p-2 rounded-lg border text-left transition-colors ${
                    selectedPreset === "lean"
                      ? "bg-[#1E3A5F] border-emerald-400 text-[#FEF3C7] font-bold"
                      : "bg-[#0B1D3A] border-[#1E3A5F] text-[#8AA0C0] hover:text-white"
                  }`}
                >
                  <div className="font-bold text-emerald-400">Lean y Campo</div>
                  <div className="text-[9px] opacity-80 mt-0.5">
                    PPC, TP, Riesgos, Plazo
                  </div>
                </button>

                <button
                  onClick={() => applyPreset("all")}
                  className={`p-2 rounded-lg border text-left transition-colors ${
                    selectedPreset === "all"
                      ? "bg-[#1E3A5F] border-[#FEF3C7] text-[#FEF3C7] font-bold"
                      : "bg-[#0B1D3A] border-[#1E3A5F] text-[#8AA0C0] hover:text-white"
                  }`}
                >
                  <div className="font-bold text-[#FEF3C7]">
                    Todos ({widgets.length})
                  </div>
                  <div className="text-[9px] opacity-80 mt-0.5">
                    Panel integral completo
                  </div>
                </button>
              </div>
            </div>

            {/* Checklist of Available Indicators */}
            <div className="space-y-2">
              <span className="text-[10px] font-mono text-[#8AA0C0] uppercase font-bold tracking-wider">
                Lista Individual de Indicadores:
              </span>

              <div className="space-y-1.5 max-h-[300px] overflow-y-auto pr-1">
                {widgets.map((w) => {
                  return (
                    <div
                      key={w.id}
                      onClick={() => toggleWidget(w.id)}
                      className={`flex items-center justify-between p-2.5 rounded-lg border cursor-pointer transition-all ${
                        w.enabled
                          ? "bg-[#0B1D3A] border-[#38BDF8]/60 text-[#E6F1FF]"
                          : "bg-[#0B1D3A]/40 border-[#1E3A5F]/50 text-[#8AA0C0] opacity-70 hover:opacity-100"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-5 h-5 rounded flex items-center justify-center border transition-colors ${
                            w.enabled
                              ? "bg-[#FF6B00] border-[#FF6B00] text-black"
                              : "border-[#1E3A5F] bg-[#030A18]"
                          }`}
                        >
                          {w.enabled && <Check size={14} strokeWidth={3} />}
                        </div>

                        <div>
                          <div className="text-[12px] font-mono font-bold flex items-center gap-2">
                            <span>{w.label}</span>
                            {w.id === "spi" && (
                              <span className="text-[9px] px-1.5 py-0.2 rounded bg-red-500/20 text-red-300">
                                Crítico 0.63
                              </span>
                            )}
                            {w.id === "cpi" && (
                              <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300">
                                0.92
                              </span>
                            )}
                            {w.id === "ppc" && (
                              <span className="text-[9px] px-1.5 py-0.2 rounded bg-[#13274F] text-[#D4A574]">
                                68%
                              </span>
                            )}
                            {w.id === "riesgos" && (
                              <span className="text-[9px] px-1.5 py-0.2 rounded bg-red-500/20 text-red-300">
                                {activeRiesgosCriticos.length} Activos
                              </span>
                            )}
                          </div>
                          <div className="text-[10px] font-mono text-[#8AA0C0]">
                            {w.desc}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1">
                        <span className="text-[9px] font-mono px-2 py-0.5 rounded uppercase font-bold text-[#8AA0C0] bg-[#030A18]">
                          {w.category}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Density & Style Options */}
            <div className="pt-2 border-t border-[#1E3A5F] flex flex-wrap items-center justify-between gap-3 text-[11px] font-mono">
              <div className="flex items-center gap-2">
                <button
                  onClick={resetDefaults}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#0B1D3A] hover:bg-[#1E3A5F] text-[#8AA0C0] hover:text-white border border-[#1E3A5F] transition-colors"
                >
                  <RotateCcw size={12} />
                  <span>Restablecer</span>
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-1.5 rounded-lg bg-[#FF6B00] hover:bg-[#E55A00] text-black font-bold transition-colors shadow-lg"
                >
                  Guardar y Aplicar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
