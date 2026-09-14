import React, { useState } from "react";
import { Clock, Calendar, RotateCcw, AlertTriangle, CheckCircle2, GitBranch } from "lucide-react";
import { ActividadCPM, StorageStatus } from "../../types";
import { EditableField } from "../EditableField";
import { ActionToolbar } from "../ActionToolbar";
import { GanttChartCPM } from "../GanttChartCPM";
import {
  ACTIVIDADES_CRONOGRAMA_668,
  CRONOGRAMA_METADATA,
} from "../../data/cronograma668Data";

interface Tab7CPMProps {
  actividades: ActividadCPM[];
  setActividades: React.Dispatch<React.SetStateAction<ActividadCPM[]>>;
  onSave: () => void;
  onExport: () => void;
  onIA: () => void;
  storageStatus: StorageStatus;
}

export const Tab7CPM: React.FC<Tab7CPMProps> = ({
  actividades,
  setActividades,
  onSave,
  onExport,
  onIA,
  storageStatus,
}) => {
  const [activeView, setActiveView] = useState<"both" | "gantt" | "table">("both");

  const handleAddNew = () => {
    const lastAct = actividades[actividades.length - 1];
    const newCod = `0${actividades.length + 1}.00`;
    const newInicio = lastAct ? lastAct.fin : "2026-11-01";
    const newFin = "2026-11-30";

    setActividades((prev) => [
      ...prev,
      {
        cod: newCod,
        desc: "Nueva actividad programada editable",
        dur: 30,
        inicio: newInicio,
        fin: newFin,
        pred: lastAct ? lastAct.cod : "-",
        tipo: "FS",
        lag: 0,
        es: lastAct ? lastAct.ef : 0,
        ef: (lastAct ? lastAct.ef : 0) + 30,
        ls: lastAct ? lastAct.ef : 0,
        lf: (lastAct ? lastAct.ef : 0) + 30,
        holg: 0,
        crit: true,
        avance: 0,
      },
    ]);
  };

  const handleDuplicate = () => {
    if (actividades.length === 0) return;
    setActividades((prev) => [
      ...prev,
      { ...prev[prev.length - 1], cod: `${prev[prev.length - 1].cod}-B` },
    ]);
  };

  const handleDelete = () => {
    setActividades((prev) => prev.slice(0, -1));
  };

  const handleResetOficial = () => {
    if (
      window.confirm(
        "¿Desea restaurar las actividades y plazos oficiales del Cronograma PA actualizado (11/09/2026 - 668 días)?"
      )
    ) {
      setActividades(ACTIVIDADES_CRONOGRAMA_668);
    }
  };

  const handleRecalculateCPM = () => {
    setActividades((prev) => {
      let currentES = 0;
      return prev.map((act, idx) => {
        const es = currentES;
        const ef = es + act.dur;
        const holg = act.holg;
        const crit = holg === 0;
        if (crit) currentES = ef;
        return {
          ...act,
          es,
          ef,
          holg,
          crit,
        };
      });
    });
  };

  const critCount = actividades.filter((a) => a.crit).length;

  return (
    <div className="bg-[#0B1D3A] border border-[#1E3A5F] rounded-xl p-3 md:p-4 shadow-xl space-y-4">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-[#1E3A5F]">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-[13px] md:text-[14px] font-bold flex items-center gap-2 text-[#E6F1FF]">
              <Clock size={16} className="text-[#FF6B00]" />
              ITEM 7 CRONOGRAMA PA 668 DÍAS - RUTA CRÍTICA CPM Y DIAGRAMA DE GANTT
            </h2>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#FF6B00]/20 text-[#FF6B00] border border-[#FF6B00]/40 font-bold">
              Versión: 11/09/2026
            </span>
          </div>
          <p className="text-[10px] font-mono text-[#8AA0C0] mt-0.5">
            Plazo de Ejecución: 668 días calendario • Comienzo: 26/04/2025 • Fin Contractual: 17/10/2026 • Fin Proyectado Reprogramado: 22/02/2027 (+128d)
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* View Mode Toggle */}
          <div className="flex items-center bg-[#030A18] border border-[#1E3A5F] rounded p-0.5 text-[10px] font-mono">
            <button
              onClick={() => setActiveView("both")}
              className={`px-2 py-1 rounded transition-colors ${
                activeView === "both"
                  ? "bg-[#1E3A5F] text-[#FEF3C7] font-bold"
                  : "text-[#8AA0C0] hover:text-white"
              }`}
            >
              Gantt + Tabla
            </button>
            <button
              onClick={() => setActiveView("gantt")}
              className={`px-2 py-1 rounded transition-colors ${
                activeView === "gantt"
                  ? "bg-[#1E3A5F] text-[#FEF3C7] font-bold"
                  : "text-[#8AA0C0] hover:text-white"
              }`}
            >
              Solo Gantt
            </button>
            <button
              onClick={() => setActiveView("table")}
              className={`px-2 py-1 rounded transition-colors ${
                activeView === "table"
                  ? "bg-[#1E3A5F] text-[#FEF3C7] font-bold"
                  : "text-[#8AA0C0] hover:text-white"
              }`}
            >
              Solo Tabla
            </button>
          </div>

          <button
            onClick={handleResetOficial}
            title="Restablecer actividades al cronograma oficial PA (11/09/2026)"
            className="px-2.5 py-1 rounded text-[11px] font-mono bg-[#030A18] border border-[#FF6B00]/40 text-[#FF6B00] hover:bg-[#FF6B00]/10 transition-colors flex items-center gap-1"
          >
            <RotateCcw size={12} />
            Restablecer Cronograma PA
          </button>

          <span className="text-[10px] font-mono px-2 py-1 rounded bg-red-500/20 text-red-300 border border-red-500/40">
            {critCount} en Ruta Crítica (Holgura = 0)
          </span>
        </div>
      </div>

      <ActionToolbar
        onNew={handleAddNew}
        onDup={handleDuplicate}
        onDel={handleDelete}
        onAcum={() => {
          setActividades((prev) =>
            prev.map((a) => ({ ...a, avance: Math.min(100, a.avance + 5) }))
          );
        }}
        onSave={onSave}
        onStore={onSave}
        onImport={() => {}}
        onExport={onExport}
        onCalc={handleRecalculateCPM}
        onIA={onIA}
        count={actividades.length}
        badge={storageStatus}
      />

      {/* Contractual Schedule Metadata Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-2 text-center font-mono">
        <div className="bg-[#020A1E] border border-[#1E3A5F] rounded p-2">
          <div className="text-[9px] text-[#8AA0C0]">PLAZO CONTRACTUAL</div>
          <div className="text-[14px] font-bold text-[#D4A574]">{CRONOGRAMA_METADATA.duracionTotalDias} días</div>
          <div className="text-[8px] text-[#8AA0C0]">Calendario aprobado</div>
        </div>

        <div className="bg-[#020A1E] border border-[#1E3A5F] rounded p-2">
          <div className="text-[9px] text-[#8AA0C0]">FECHA COMIENZO</div>
          <div className="text-[13px] font-bold text-[#E6F1FF]">{CRONOGRAMA_METADATA.fechaComienzo}</div>
          <div className="text-[8px] text-[#8AA0C0]">Inicio contractual</div>
        </div>

        <div className="bg-[#020A1E] border border-[#1E3A5F] rounded p-2">
          <div className="text-[9px] text-[#8AA0C0]">FIN CONTRACTUAL</div>
          <div className="text-[13px] font-bold text-amber-300">{CRONOGRAMA_METADATA.fechaFinContractual}</div>
          <div className="text-[8px] text-[#8AA0C0]">Hito original 540d/668d</div>
        </div>

        <div className="bg-[#020A1E] border border-red-500/30 rounded p-2">
          <div className="text-[9px] text-red-300">FIN REPROGRAMADO PA</div>
          <div className="text-[13px] font-bold text-red-400">{CRONOGRAMA_METADATA.fechaFinReprogramada}</div>
          <div className="text-[8px] text-red-300">+128 días acumulados</div>
        </div>

        <div className="bg-[#020A1E] border border-[#1E3A5F] rounded p-2">
          <div className="text-[9px] text-[#8AA0C0]">HITO FIN DE OBRA</div>
          <div className="text-[12px] font-bold text-emerald-400">ID 305 (0 días)</div>
          <div className="text-[8px] text-[#8AA0C0]">Ruta Crítica Absoluta</div>
        </div>
      </div>

      {/* Interactive Gantt Chart with Drag & Drop */}
      {(activeView === "both" || activeView === "gantt") && (
        <GanttChartCPM
          actividades={actividades}
          setActividades={setActividades}
          contractualDays={668}
        />
      )}

      {/* CPM Table with Inicio and Fin Dates */}
      {(activeView === "both" || activeView === "table") && (
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-[11px] font-mono px-1">
            <span className="font-bold text-[#E6F1FF] flex items-center gap-1.5">
              <Calendar size={13} className="text-[#FF6B00]" />
              TABLA DE ACTIVIDADES CRONOGRAMA PA 668 DÍAS - RED CPM Y HOLGURAS
            </span>
            <span className="text-[10px] text-[#8AA0C0]">
              Arrastre en el Gantt o edite directamente para simular reprogramaciones en tiempo real
            </span>
          </div>

          <div className="overflow-auto rounded-lg border border-[#1E3A5F] bg-[#030A18] max-h-[400px]">
            <table className="w-full text-[11px] font-mono">
              <thead className="sticky top-0 bg-[#030A18] text-[#8AA0C0] text-[10px] border-b border-[#1E3A5F] z-10">
                <tr>
                  <th className="p-2 text-center">COD</th>
                  <th className="p-2 text-left">DESCRIPCIÓN ACTIVIDAD</th>
                  <th className="p-2 text-center">DUR (d)</th>
                  <th className="p-2 text-center">INICIO</th>
                  <th className="p-2 text-center">FIN</th>
                  <th className="p-2 text-center">TIPO</th>
                  <th className="p-2 text-center">LAG</th>
                  <th className="p-2 text-center">PRED</th>
                  <th className="p-2 text-center">ES</th>
                  <th className="p-2 text-center">EF</th>
                  <th className="p-2 text-center">HOLG</th>
                  <th className="p-2 text-center">ESTADO</th>
                  <th className="p-2 text-center">% AV</th>
                </tr>
              </thead>
              <tbody>
                {actividades.map((act) => (
                  <tr
                    key={act.cod}
                    className={`border-t border-[#1E3A5F]/30 transition-colors hover:bg-[#13274F]/40 ${
                      act.crit ? "bg-red-500/10" : ""
                    }`}
                  >
                    <td className="p-1 min-w-[70px] text-center font-bold">
                      <EditableField
                        value={act.cod}
                        onSave={(val) =>
                          setActividades((prev) =>
                            prev.map((a) => (a.cod === act.cod ? { ...a, cod: val } : a))
                          )
                        }
                      />
                    </td>
                    <td className="p-1 min-w-[220px] text-left">
                      <EditableField
                        value={act.desc}
                        onSave={(val) =>
                          setActividades((prev) =>
                            prev.map((a) => (a.cod === act.cod ? { ...a, desc: val } : a))
                          )
                        }
                      />
                    </td>
                    <td className="p-1 min-w-[55px] text-center">
                      <EditableField
                        value={act.dur}
                        type="number"
                        onSave={(val) =>
                          setActividades((prev) =>
                            prev.map((a) => (a.cod === act.cod ? { ...a, dur: val } : a))
                          )
                        }
                      />
                    </td>
                    {/* Inicio Date editable */}
                    <td className="p-1 min-w-[95px] text-center text-[#FEF3C7]">
                      <EditableField
                        value={act.inicio}
                        onSave={(val) =>
                          setActividades((prev) =>
                            prev.map((a) => (a.cod === act.cod ? { ...a, inicio: val } : a))
                          )
                        }
                      />
                    </td>
                    {/* Fin Date editable */}
                    <td className="p-1 min-w-[95px] text-center text-[#38BDF8]">
                      <EditableField
                        value={act.fin}
                        onSave={(val) =>
                          setActividades((prev) =>
                            prev.map((a) => (a.cod === act.cod ? { ...a, fin: val } : a))
                          )
                        }
                      />
                    </td>
                    <td className="p-1 min-w-[55px] text-center">
                      <EditableField
                        value={act.tipo}
                        type="select"
                        options={["FS", "SS", "FF", "SF"]}
                        onSave={(val) =>
                          setActividades((prev) =>
                            prev.map((a) => (a.cod === act.cod ? { ...a, tipo: val } : a))
                          )
                        }
                      />
                    </td>
                    <td className="p-1 min-w-[45px] text-center">
                      <EditableField
                        value={act.lag}
                        type="number"
                        onSave={(val) =>
                          setActividades((prev) =>
                            prev.map((a) => (a.cod === act.cod ? { ...a, lag: val } : a))
                          )
                        }
                      />
                    </td>
                    <td className="p-1 min-w-[65px] text-center">
                      <EditableField
                        value={act.pred}
                        onSave={(val) =>
                          setActividades((prev) =>
                            prev.map((a) => (a.cod === act.cod ? { ...a, pred: val } : a))
                          )
                        }
                      />
                    </td>
                    <td className="p-1 min-w-[45px] text-center text-[#8AA0C0]">{act.es}</td>
                    <td className="p-1 min-w-[45px] text-center text-[#8AA0C0]">{act.ef}</td>
                    <td
                      className={`p-1 min-w-[55px] text-center font-bold ${
                        act.holg === 0 ? "text-red-400" : "text-emerald-300"
                      }`}
                    >
                      {act.holg}d
                    </td>
                    <td className="p-1 min-w-[70px] text-center">
                      {act.crit ? (
                        <span className="px-1.5 py-0.5 rounded bg-red-500/20 text-red-300 text-[9px] font-bold border border-red-500/40">
                          CRÍTICA
                        </span>
                      ) : (
                        <span className="px-1.5 py-0.5 rounded bg-[#13274F] text-[#8AA0C0] text-[9px]">
                          Holg {act.holg}d
                        </span>
                      )}
                    </td>
                    <td className="p-1 min-w-[65px] text-center">
                      <EditableField
                        value={act.avance}
                        type="number"
                        onSave={(val) =>
                          setActividades((prev) =>
                            prev.map((a) => (a.cod === act.cod ? { ...a, avance: val } : a))
                          )
                        }
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
