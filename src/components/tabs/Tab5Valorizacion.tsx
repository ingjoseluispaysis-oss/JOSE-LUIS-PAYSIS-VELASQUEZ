import React, { useState, useMemo } from "react";
import {
  ChartColumn,
  Search,
  RotateCcw,
  SlidersHorizontal,
  TableProperties,
  ArrowUpDown,
  Building2,
  FileSpreadsheet,
  AlertOctagon,
  CheckCircle2,
  Info,
} from "lucide-react";
import { EVMMetrics, StorageStatus, ValorizacionRow } from "../../types";
import { EditableField } from "../EditableField";
import { ActionToolbar } from "../ActionToolbar";
import {
  PARTIDAS_VALORIZACION_17,
  VALORIZACION_17_TOTALES,
} from "../../data/valorizacion17Data";

interface Tab5ValorizacionProps {
  valRows: ValorizacionRow[];
  setValRows: React.Dispatch<React.SetStateAction<ValorizacionRow[]>>;
  metrics: EVMMetrics;
  onAcumular: () => void;
  onSave: () => void;
  onExport: () => void;
  onIA: () => void;
  storageStatus: StorageStatus;
}

export const Tab5Valorizacion: React.FC<Tab5ValorizacionProps> = ({
  valRows,
  setValRows,
  metrics,
  onAcumular,
  onSave,
  onExport,
  onIA,
  storageStatus,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("TODAS");
  const [viewMode, setViewMode] = useState<"oficial" | "compacto">("oficial");
  const [showResumenOficial, setShowResumenOficial] = useState(true);

  // Derive categories from partidas
  const categories = useMemo(() => {
    const cats = new Set<string>();
    valRows.forEach((r) => {
      if (r.categoria) cats.add(r.categoria);
    });
    return ["TODAS", ...Array.from(cats)];
  }, [valRows]);

  // Filtered rows
  const filteredRows = useMemo(() => {
    return valRows.filter((r) => {
      const matchSearch =
        r.codigo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.desc.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (r.sector && r.sector.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchCat =
        selectedCategory === "TODAS" || r.categoria === selectedCategory;
      return matchSearch && matchCat;
    });
  }, [valRows, searchTerm, selectedCategory]);

  // Totals of current rows in table
  const totals = useMemo(() => {
    return valRows.reduce(
      (acc, r) => {
        acc.parcialTotal += r.parcial || 0;
        acc.parcialAnt += r.parcialAnt || 0;
        acc.parcialAct += r.parcialAct || (r.parcial * ((r.porcAct || 0) / 100));
        acc.parcialAcum += (r.pu * r.acum) || 0;
        acc.parcialSaldo += (r.pu * r.saldo) || 0;
        return acc;
      },
      {
        parcialTotal: 0,
        parcialAnt: 0,
        parcialAct: 0,
        parcialAcum: 0,
        parcialSaldo: 0,
      }
    );
  }, [valRows]);

  const handleAddNew = () => {
    setValRows((prev) => [
      ...prev,
      {
        id: prev.length + 1,
        codigo: `02.04.${String(prev.length + 1).padStart(2, "0")}`,
        desc: "Nueva partida de vereda / sardinel / pavimento",
        und: "m2",
        metrado: 100,
        pu: 45.0,
        parcial: 4500.0,
        acum: 53.65,
        saldo: 46.35,
        avance: 53.65,
        sector: "S1-S2",
        metradoAnt: 50,
        parcialAnt: 2250,
        porcAnt: 50,
        metradoAct: 3.65,
        parcialAct: 164.25,
        porcAct: 3.65,
        metradoAcum: 53.65,
        parcialAcum: 2414.25,
        porcAcum: 53.65,
        metradoSaldo: 46.35,
        parcialSaldo: 2085.75,
        porcSaldo: 46.35,
        categoria: "02 VEREDAS",
      },
    ]);
  };

  const handleDuplicate = () => {
    if (valRows.length === 0) return;
    setValRows((prev) => [
      ...prev,
      { ...prev[prev.length - 1], id: prev.length + 1 },
    ]);
  };

  const handleDelete = () => {
    setValRows((prev) => prev.slice(0, -1));
  };

  const handleResetOficial = () => {
    if (
      window.confirm(
        "¿Desea restaurar las 35 partidas oficiales de la Valorización N° 17 (Agosto 2026)?"
      )
    ) {
      setValRows(PARTIDAS_VALORIZACION_17);
      setSelectedCategory("TODAS");
      setSearchTerm("");
    }
  };

  const handleRecalculate = () => {
    setValRows((prev) =>
      prev.map((row) => {
        const parcial = row.metrado * row.pu;
        const metradoAcum = (row.metradoAnt || 0) + (row.metradoAct || 0);
        const parcialAcum = metradoAcum * row.pu;
        const porcAcum = row.metrado > 0 ? (metradoAcum / row.metrado) * 100 : 0;
        const metradoSaldo = Math.max(0, row.metrado - metradoAcum);
        const parcialSaldo = metradoSaldo * row.pu;
        const porcSaldo = row.metrado > 0 ? (metradoSaldo / row.metrado) * 100 : 0;

        return {
          ...row,
          parcial,
          acum: metradoAcum,
          saldo: metradoSaldo,
          avance: porcAcum,
          metradoAcum,
          parcialAcum,
          porcAcum,
          metradoSaldo,
          parcialSaldo,
          porcSaldo,
        };
      })
    );
  };

  return (
    <div className="bg-[#0B1D3A] border border-[#1E3A5F] rounded-xl p-3 md:p-4 shadow-xl space-y-4">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-[#1E3A5F]">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-[13px] md:text-[15px] font-bold flex items-center gap-2 text-[#E6F1FF]">
              <ChartColumn size={17} className="text-[#F45D47]" />
              ITEM 5 VALORIZACIÓN DE OBRA N° 17 - AGOSTO 2026 (01/08/2026 AL 31/08/2026)
            </h2>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30">
              CUI 2264872
            </span>
          </div>
          <p className="text-[10px] font-mono text-[#8AA0C0] mt-0.5">
            CONSORCIO LOS FLAMENCOS • Residente: ING. JOSÉ LUIS PAYSIS VELASQUÉZ (CIP 101507) • Supervisión: ING. ALAIN OMAR ROSAS LEON (CIP 47851)
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowResumenOficial((prev) => !prev)}
            className={`px-2.5 py-1 rounded text-[11px] font-mono border transition-colors flex items-center gap-1.5 ${
              showResumenOficial
                ? "bg-[#1E3A5F] text-[#FEF3C7] border-[#D4A574]"
                : "bg-[#030A18] text-[#8AA0C0] border-[#1E3A5F] hover:text-white"
            }`}
          >
            <TableProperties size={13} />
            {showResumenOficial ? "Ocultar Resumen Oficial" : "Ver Resumen Oficial (Pág 7)"}
          </button>

          <button
            onClick={handleResetOficial}
            title="Restaurar partidas y metrados al archivo oficial de la Valorización N° 17"
            className="px-2.5 py-1 rounded text-[11px] font-mono bg-[#030A18] border border-[#FF6B00]/40 text-[#FF6B00] hover:bg-[#FF6B00]/10 transition-colors flex items-center gap-1"
          >
            <RotateCcw size={12} />
            Restablecer Oficial Val 17
          </button>
        </div>
      </div>

      <ActionToolbar
        onNew={handleAddNew}
        onDup={handleDuplicate}
        onDel={handleDelete}
        onAcum={onAcumular}
        onSave={onSave}
        onStore={onSave}
        onImport={() => {}}
        onExport={onExport}
        onCalc={handleRecalculate}
        onIA={onIA}
        count={valRows.length}
        badge={storageStatus}
      />

      {/* Official Summary Table from Page 7 of Valorización N° 17 */}
      {showResumenOficial && (
        <div className="bg-[#030A18] border border-[#1E3A5F] rounded-xl p-3 shadow-inner">
          <div className="flex flex-wrap items-center justify-between gap-2 pb-2 mb-2 border-b border-[#1E3A5F]/60">
            <div className="flex items-center gap-2">
              <FileSpreadsheet size={15} className="text-[#D4A574]" />
              <span className="text-[12px] font-bold text-[#E6F1FF]">
                CUADRO OFICIAL DE RESUMEN ECONÓMICO - VALORIZACIÓN N° 17
              </span>
              <span className="text-[10px] font-mono text-[#8AA0C0]">
                (D.S. 038-2026-EF / Ley 29230 OxI)
              </span>
            </div>
            <div className="flex items-center gap-3 text-[10px] font-mono">
              <span className="text-[#8AA0C0]">
                Ppto Contratado c/IGV:{" "}
                <strong className="text-[#E6F1FF]">
                  S/ {VALORIZACION_17_TOTALES.presupuestoContratadoConIGV.toLocaleString("es-PE", { minimumFractionDigits: 2 })}
                </strong>
              </span>
              <span className="text-[#8AA0C0]">
                Ppto Modificado s/IGV:{" "}
                <strong className="text-[#D4A574]">
                  S/ {VALORIZACION_17_TOTALES.subtotal.presupuesto.toLocaleString("es-PE", { minimumFractionDigits: 2 })}
                </strong>
              </span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-[11px] font-mono">
              <thead>
                <tr className="bg-[#0B1D3A] text-[#8AA0C0] text-[10px]">
                  <th className="p-1.5 text-left">DESCRIPCIÓN</th>
                  <th className="p-1.5 text-right">PRESUPUESTO MODIFICADO</th>
                  <th className="p-1.5 text-right">ANTERIOR (Val 1-16)</th>
                  <th className="p-1.5 text-right bg-[#FF6B00]/10 text-[#FF6B00]">
                    ACTUAL MES 17
                  </th>
                  <th className="p-1.5 text-right bg-emerald-500/10 text-emerald-300">
                    ACUMULADO ACTUAL
                  </th>
                  <th className="p-1.5 text-right text-[#8AA0C0]">SALDO POR EJECUTAR</th>
                  <th className="p-1.5 text-center">% ACUM</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1E3A5F]/40">
                <tr>
                  <td className="p-1.5 font-medium text-[#E6F1FF]">Costo Directo (C.D.)</td>
                  <td className="p-1.5 text-right text-[#8AA0C0]">
                    S/ {VALORIZACION_17_TOTALES.costoDirecto.presupuesto.toLocaleString("es-PE", { minimumFractionDigits: 2 })}
                  </td>
                  <td className="p-1.5 text-right text-[#8AA0C0]">
                    S/ {VALORIZACION_17_TOTALES.costoDirecto.anterior.toLocaleString("es-PE", { minimumFractionDigits: 2 })}
                  </td>
                  <td className="p-1.5 text-right font-semibold text-[#FEF3C7] bg-[#FF6B00]/5">
                    S/ {VALORIZACION_17_TOTALES.costoDirecto.actual.toLocaleString("es-PE", { minimumFractionDigits: 2 })}
                  </td>
                  <td className="p-1.5 text-right font-semibold text-emerald-300 bg-emerald-500/5">
                    S/ {VALORIZACION_17_TOTALES.costoDirecto.acumulado.toLocaleString("es-PE", { minimumFractionDigits: 2 })}
                  </td>
                  <td className="p-1.5 text-right text-[#8AA0C0]">
                    S/ {VALORIZACION_17_TOTALES.costoDirecto.saldo.toLocaleString("es-PE", { minimumFractionDigits: 2 })}
                  </td>
                  <td className="p-1.5 text-center text-emerald-400 font-bold">55.19%</td>
                </tr>

                <tr>
                  <td className="p-1.5 text-[#8AA0C0]">Gastos Generales (10.000%)</td>
                  <td className="p-1.5 text-right text-[#8AA0C0]">
                    S/ {VALORIZACION_17_TOTALES.gastosGenerales.presupuesto.toLocaleString("es-PE", { minimumFractionDigits: 2 })}
                  </td>
                  <td className="p-1.5 text-right text-[#8AA0C0]">
                    S/ {VALORIZACION_17_TOTALES.gastosGenerales.anterior.toLocaleString("es-PE", { minimumFractionDigits: 2 })}
                  </td>
                  <td className="p-1.5 text-right text-[#FEF3C7] bg-[#FF6B00]/5">
                    S/ {VALORIZACION_17_TOTALES.gastosGenerales.actual.toLocaleString("es-PE", { minimumFractionDigits: 2 })}
                  </td>
                  <td className="p-1.5 text-right text-emerald-300 bg-emerald-500/5">
                    S/ {VALORIZACION_17_TOTALES.gastosGenerales.acumulado.toLocaleString("es-PE", { minimumFractionDigits: 2 })}
                  </td>
                  <td className="p-1.5 text-right text-[#8AA0C0]">
                    S/ {VALORIZACION_17_TOTALES.gastosGenerales.saldo.toLocaleString("es-PE", { minimumFractionDigits: 2 })}
                  </td>
                  <td className="p-1.5 text-center text-[#8AA0C0]">55.19%</td>
                </tr>

                <tr>
                  <td className="p-1.5 text-[#8AA0C0]">Utilidad (7.000%)</td>
                  <td className="p-1.5 text-right text-[#8AA0C0]">
                    S/ {VALORIZACION_17_TOTALES.utilidad.presupuesto.toLocaleString("es-PE", { minimumFractionDigits: 2 })}
                  </td>
                  <td className="p-1.5 text-right text-[#8AA0C0]">
                    S/ {VALORIZACION_17_TOTALES.utilidad.anterior.toLocaleString("es-PE", { minimumFractionDigits: 2 })}
                  </td>
                  <td className="p-1.5 text-right text-[#FEF3C7] bg-[#FF6B00]/5">
                    S/ {VALORIZACION_17_TOTALES.utilidad.actual.toLocaleString("es-PE", { minimumFractionDigits: 2 })}
                  </td>
                  <td className="p-1.5 text-right text-emerald-300 bg-emerald-500/5">
                    S/ {VALORIZACION_17_TOTALES.utilidad.acumulado.toLocaleString("es-PE", { minimumFractionDigits: 2 })}
                  </td>
                  <td className="p-1.5 text-right text-[#8AA0C0]">
                    S/ {VALORIZACION_17_TOTALES.utilidad.saldo.toLocaleString("es-PE", { minimumFractionDigits: 2 })}
                  </td>
                  <td className="p-1.5 text-center text-[#8AA0C0]">55.19%</td>
                </tr>

                {/* Sub Total */}
                <tr className="bg-[#13274F]/40 font-bold">
                  <td className="p-2 text-[#D4A574] flex items-center gap-1.5">
                    <span>SUB TOTAL (Sin IGV)</span>
                    <span className="text-[9px] font-normal px-1 py-0.2 bg-[#D4A574]/20 rounded text-[#D4A574]">
                      Base EVM
                    </span>
                  </td>
                  <td className="p-2 text-right text-[#D4A574]">
                    S/ {VALORIZACION_17_TOTALES.subtotal.presupuesto.toLocaleString("es-PE", { minimumFractionDigits: 2 })}
                  </td>
                  <td className="p-2 text-right text-[#8AA0C0]">
                    S/ {VALORIZACION_17_TOTALES.subtotal.anterior.toLocaleString("es-PE", { minimumFractionDigits: 2 })} (51.92%)
                  </td>
                  <td className="p-2 text-right text-[#FEF3C7] bg-[#FF6B00]/10 font-mono">
                    S/ {VALORIZACION_17_TOTALES.subtotal.actual.toLocaleString("es-PE", { minimumFractionDigits: 2 })} ({VALORIZACION_17_TOTALES.avances.ejecMes.toFixed(2)}%)
                  </td>
                  <td className="p-2 text-right text-emerald-300 bg-emerald-500/10 font-mono">
                    S/ {VALORIZACION_17_TOTALES.subtotal.acumulado.toLocaleString("es-PE", { minimumFractionDigits: 2 })}
                  </td>
                  <td className="p-2 text-right text-[#8AA0C0]">
                    S/ {VALORIZACION_17_TOTALES.subtotal.saldo.toLocaleString("es-PE", { minimumFractionDigits: 2 })} (43.55%)
                  </td>
                  <td className="p-2 text-center text-emerald-400 font-extrabold text-[12px]">
                    {VALORIZACION_17_TOTALES.avances.ejecAcum.toFixed(2)}%
                  </td>
                </tr>

                <tr>
                  <td className="p-1.5 text-[#8AA0C0]">Impuesto General a las Ventas (IGV 18%)</td>
                  <td className="p-1.5 text-right text-[#8AA0C0]">
                    S/ {VALORIZACION_17_TOTALES.igv.presupuesto.toLocaleString("es-PE", { minimumFractionDigits: 2 })}
                  </td>
                  <td className="p-1.5 text-right text-[#8AA0C0]">
                    S/ {VALORIZACION_17_TOTALES.igv.anterior.toLocaleString("es-PE", { minimumFractionDigits: 2 })}
                  </td>
                  <td className="p-1.5 text-right text-[#FEF3C7] bg-[#FF6B00]/5">
                    S/ {VALORIZACION_17_TOTALES.igv.actual.toLocaleString("es-PE", { minimumFractionDigits: 2 })}
                  </td>
                  <td className="p-1.5 text-right text-emerald-300 bg-emerald-500/5">
                    S/ {VALORIZACION_17_TOTALES.igv.acumulado.toLocaleString("es-PE", { minimumFractionDigits: 2 })}
                  </td>
                  <td className="p-1.5 text-right text-[#8AA0C0]">
                    S/ {VALORIZACION_17_TOTALES.igv.saldo.toLocaleString("es-PE", { minimumFractionDigits: 2 })}
                  </td>
                  <td className="p-1.5 text-center text-[#8AA0C0]">55.19%</td>
                </tr>

                {/* Total c/ IGV */}
                <tr className="bg-[#020A1E] font-bold border-t-2 border-[#1E3A5F]">
                  <td className="p-2 text-white">TOTAL CON IGV (S/)</td>
                  <td className="p-2 text-right text-white">
                    S/ {VALORIZACION_17_TOTALES.totalConIGV.presupuesto.toLocaleString("es-PE", { minimumFractionDigits: 2 })}
                  </td>
                  <td className="p-2 text-right text-[#8AA0C0]">
                    S/ {VALORIZACION_17_TOTALES.totalConIGV.anterior.toLocaleString("es-PE", { minimumFractionDigits: 2 })}
                  </td>
                  <td className="p-2 text-right text-[#FEF3C7] bg-[#FF6B00]/10">
                    S/ {VALORIZACION_17_TOTALES.totalConIGV.actual.toLocaleString("es-PE", { minimumFractionDigits: 2 })}
                  </td>
                  <td className="p-2 text-right text-emerald-300 bg-emerald-500/10">
                    S/ {VALORIZACION_17_TOTALES.totalConIGV.acumulado.toLocaleString("es-PE", { minimumFractionDigits: 2 })}
                  </td>
                  <td className="p-2 text-right text-[#8AA0C0]">
                    S/ {VALORIZACION_17_TOTALES.totalConIGV.saldo.toLocaleString("es-PE", { minimumFractionDigits: 2 })}
                  </td>
                  <td className="p-2 text-center text-emerald-400">55.19%</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Legal / Contractual status banner */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-2 mt-3 pt-2 border-t border-[#1E3A5F]/60">
            <div className="bg-[#0B1D3A] border border-[#1E3A5F] rounded p-2 text-center">
              <div className="text-[9px] text-[#8AA0C0]">AVANCE PROGRAMADO ACUMULADO</div>
              <div className="text-[14px] font-bold text-[#D4A574] font-mono">
                {VALORIZACION_17_TOTALES.avances.progAcum.toFixed(2)}%
              </div>
              <div className="text-[8px] text-[#8AA0C0]">Ant: 78.37% | Mes: 6.71%</div>
            </div>

            <div className="bg-[#0B1D3A] border border-[#1E3A5F] rounded p-2 text-center">
              <div className="text-[9px] text-[#8AA0C0]">AVANCE EJECUTADO REAL ACUMULADO</div>
              <div className="text-[14px] font-bold text-emerald-400 font-mono">
                {VALORIZACION_17_TOTALES.avances.ejecAcum.toFixed(2)}%
              </div>
              <div className="text-[8px] text-[#8AA0C0]">Ant: 51.92% | Mes: 1.73%</div>
            </div>

            <div className="bg-[#0B1D3A] border border-red-500/40 rounded p-2 text-center">
              <div className="text-[9px] text-red-300">ESTADO DE ATRASO ACUMULADO</div>
              <div className="text-[14px] font-bold text-red-400 font-mono">
                {VALORIZACION_17_TOTALES.avances.atrasoFisico.toFixed(2)}%
              </div>
              <div className="text-[8px] text-red-400 font-semibold">OBRA ATRASADA (&gt; 5% y &gt; 15%)</div>
            </div>

            <div className="bg-[#0B1D3A] border border-amber-500/30 rounded p-2 text-center">
              <div className="text-[9px] text-amber-300">ESTADO CONTRACTUAL (D.S. 038-2026-EF)</div>
              <div className="text-[11px] font-bold text-amber-200 font-mono mt-0.5">
                Reprogramación Acelerada
              </div>
              <div className="text-[8px] text-[#8AA0C0]">Aplica Cronograma PA (11/09/2026)</div>
            </div>
          </div>
        </div>
      )}

      {/* Visual S-Curve & Comparison */}
      <div className="bg-[#020A1E] border border-[#1E3A5F] rounded-lg p-3 relative overflow-hidden">
        <div className="flex flex-wrap justify-between items-center text-[10px] text-[#8AA0C0] mb-2 font-mono gap-2">
          <span className="font-semibold text-[#E6F1FF]">
            Curva S Valorización N° 17: Programado Acumulado 85.08% vs Real Ejecutado 53.65%
          </span>
          <span className="text-red-400 font-semibold flex items-center gap-1">
            <AlertOctagon size={12} />
            Brecha de Atraso Crítico: -31.43% | SPI: {metrics.spi.toFixed(2)} | CPI: {metrics.cpi.toFixed(2)}
          </span>
        </div>

        <svg viewBox="0 0 600 85" className="w-full h-[85px]">
          {/* Grid lines */}
          <line x1="0" y1="20" x2="600" y2="20" stroke="#1E3A5F" strokeWidth="0.5" strokeDasharray="2 2" />
          <line x1="0" y1="50" x2="600" y2="50" stroke="#1E3A5F" strokeWidth="0.5" strokeDasharray="2 2" />
          <line x1="0" y1="78" x2="600" y2="78" stroke="#1E3A5F" strokeWidth="0.5" />

          {/* Delay area filled between curves */}
          <path
            d="M0 78 Q150 72 300 35 T600 12 L600 48 Q450 62 300 62 T0 78 Z"
            fill="rgba(244,93,71,0.18)"
          />

          {/* Programmed line */}
          <path
            d="M0 78 Q150 72 300 35 T600 12"
            fill="none"
            stroke="#D4A574"
            strokeWidth="2.5"
            strokeDasharray="4 2"
          />

          {/* Executed line */}
          <path
            d="M0 78 Q150 75 300 62 T600 48"
            fill="none"
            stroke="#F45D47"
            strokeWidth="2.5"
          />

          <text x="15" y="15" fontSize="9" fill="#D4A574" fontFamily="JetBrains Mono">
            --- Programado: 85.08% (PV: S/ 30.98M)
          </text>
          <text x="15" y="28" fontSize="9" fill="#F45D47" fontFamily="JetBrains Mono">
            — Real Ejecutado: 53.65% (EV: S/ 19.53M) | Val 17: S/ 646k (1.73%)
          </text>
        </svg>
      </div>

      {/* Partidas Controls & Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
        <div className="flex flex-wrap items-center gap-2 flex-1 min-w-[280px]">
          {/* Search box */}
          <div className="relative flex-1 min-w-[200px] max-w-md">
            <Search
              size={13}
              className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[#8AA0C0]"
            />
            <input
              type="text"
              placeholder="Buscar por código (ej: 02.04), descripción o sector..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-7 pr-2 py-1.5 bg-[#030A18] border border-[#1E3A5F] rounded text-[11px] font-mono text-[#E6F1FF] placeholder-[#8AA0C0]/50 focus:outline-none focus:border-[#D4A574]"
            />
          </div>

          {/* Category filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-2 py-1.5 bg-[#030A18] border border-[#1E3A5F] rounded text-[11px] font-mono text-[#E6F1FF] focus:outline-none focus:border-[#D4A574]"
          >
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        {/* View Mode */}
        <div className="flex items-center bg-[#030A18] border border-[#1E3A5F] rounded p-0.5 text-[10px] font-mono">
          <button
            onClick={() => setViewMode("oficial")}
            className={`px-2 py-1 rounded transition-colors ${
              viewMode === "oficial"
                ? "bg-[#1E3A5F] text-[#FEF3C7] font-bold"
                : "text-[#8AA0C0] hover:text-white"
            }`}
          >
            Detalle Oficial Completo
          </button>
          <button
            onClick={() => setViewMode("compacto")}
            className={`px-2 py-1 rounded transition-colors ${
              viewMode === "compacto"
                ? "bg-[#1E3A5F] text-[#FEF3C7] font-bold"
                : "text-[#8AA0C0] hover:text-white"
            }`}
          >
            Edición Rápida
          </button>
        </div>
      </div>

      {/* Partidas Table */}
      <div className="overflow-auto rounded border border-[#1E3A5F] max-h-[460px]">
        <table className="w-full text-[11px] font-mono">
          <thead className="sticky top-0 bg-[#030A18] text-[#8AA0C0] text-[10px] border-b border-[#1E3A5F] z-10">
            {viewMode === "oficial" ? (
              <>
                <tr>
                  <th rowSpan={2} className="p-1.5 text-center border-r border-[#1E3A5F]">
                    ITEM
                  </th>
                  <th rowSpan={2} className="p-1.5 text-left border-r border-[#1E3A5F]">
                    DESCRIPCIÓN DE PARTIDA
                  </th>
                  <th rowSpan={2} className="p-1.5 text-center border-r border-[#1E3A5F]">
                    UND
                  </th>
                  <th colSpan={3} className="p-1 text-center border-r border-[#1E3A5F] bg-[#0B1D3A]">
                    PRESUPUESTO MODIFICADO
                  </th>
                  <th colSpan={3} className="p-1 text-center border-r border-[#1E3A5F] bg-[#020A1E]">
                    ANTERIOR (Val 1-16)
                  </th>
                  <th colSpan={3} className="p-1 text-center border-r border-[#1E3A5F] bg-[#FF6B00]/15 text-[#FF6B00]">
                    ACTUAL (Mes 17)
                  </th>
                  <th colSpan={3} className="p-1 text-center border-r border-[#1E3A5F] bg-emerald-500/15 text-emerald-300">
                    ACUMULADO ACTUAL
                  </th>
                  <th colSpan={3} className="p-1 text-center bg-[#020A1E]">
                    SALDO POR EJECUTAR
                  </th>
                </tr>
                <tr className="border-t border-[#1E3A5F]/60 text-[9px]">
                  {/* Presupuesto */}
                  <th className="p-1 text-right">Metrado</th>
                  <th className="p-1 text-right">P.U. (S/)</th>
                  <th className="p-1 text-right border-r border-[#1E3A5F]">Parcial (S/)</th>
                  {/* Anterior */}
                  <th className="p-1 text-right">Metrado</th>
                  <th className="p-1 text-right">Parcial (S/)</th>
                  <th className="p-1 text-right border-r border-[#1E3A5F]">% Ant</th>
                  {/* Actual Mes 17 */}
                  <th className="p-1 text-right bg-[#FF6B00]/10">Metrado</th>
                  <th className="p-1 text-right bg-[#FF6B00]/10">Parcial (S/)</th>
                  <th className="p-1 text-right border-r border-[#1E3A5F] bg-[#FF6B00]/10">% Act</th>
                  {/* Acumulado */}
                  <th className="p-1 text-right bg-emerald-500/10">Metrado</th>
                  <th className="p-1 text-right bg-emerald-500/10">Parcial (S/)</th>
                  <th className="p-1 text-right border-r border-[#1E3A5F] bg-emerald-500/10 font-bold">% Acum</th>
                  {/* Saldo */}
                  <th className="p-1 text-right">Metrado</th>
                  <th className="p-1 text-right">Parcial (S/)</th>
                  <th className="p-1 text-right">% Saldo</th>
                </tr>
              </>
            ) : (
              <tr>
                <th className="p-1.5 text-center">Código</th>
                <th className="p-1.5 text-left">Descripción Partida</th>
                <th className="p-1.5 text-center">Und</th>
                <th className="p-1.5 text-right">Metrado Ppto</th>
                <th className="p-1.5 text-right">P.U.</th>
                <th className="p-1.5 text-right">Parcial S/</th>
                <th className="p-1.5 text-right bg-[#FF6B00]/10 text-[#FF6B00]">Mes 17 Metrado</th>
                <th className="p-1.5 text-right bg-[#FF6B00]/10 text-[#FF6B00]">Mes 17 Parcial</th>
                <th className="p-1.5 text-right bg-emerald-500/10 text-emerald-300">Acum Metrado</th>
                <th className="p-1.5 text-right bg-emerald-500/10 text-emerald-300">Acum Parcial</th>
                <th className="p-1.5 text-right">Saldo</th>
                <th className="p-1.5 text-center">% Avance</th>
                <th className="p-1.5 text-center">Sector</th>
              </tr>
            )}
          </thead>

          <tbody className="divide-y divide-[#1E3A5F]/30">
            {filteredRows.map((row) => {
              const metradoAnt = row.metradoAnt ?? 0;
              const parcialAnt = row.parcialAnt ?? (metradoAnt * row.pu);
              const porcAnt = row.porcAnt ?? (row.metrado > 0 ? (metradoAnt / row.metrado) * 100 : 0);

              const metradoAct = row.metradoAct ?? 0;
              const parcialAct = row.parcialAct ?? (metradoAct * row.pu);
              const porcAct = row.porcAct ?? (row.metrado > 0 ? (metradoAct / row.metrado) * 100 : 0);

              const metradoAcum = row.metradoAcum ?? row.acum;
              const parcialAcum = row.parcialAcum ?? (metradoAcum * row.pu);
              const porcAcum = row.porcAcum ?? (row.metrado > 0 ? (metradoAcum / row.metrado) * 100 : 0);

              const metradoSaldo = row.metradoSaldo ?? row.saldo;
              const parcialSaldo = row.parcialSaldo ?? (metradoSaldo * row.pu);
              const porcSaldo = row.porcSaldo ?? (row.metrado > 0 ? (metradoSaldo / row.metrado) * 100 : 0);

              return (
                <tr
                  key={row.id}
                  className="hover:bg-[#13274F]/40 transition-colors"
                >
                  <td className="p-1 text-center font-bold text-[#D4A574] border-r border-[#1E3A5F]/40 whitespace-nowrap">
                    <EditableField
                      value={row.codigo}
                      onSave={(val) =>
                        setValRows((prev) =>
                          prev.map((r) => (r.id === row.id ? { ...r, codigo: val } : r))
                        )
                      }
                    />
                  </td>

                  <td className="p-1 text-left min-w-[220px] max-w-[320px] border-r border-[#1E3A5F]/40">
                    <div className="truncate" title={row.desc}>
                      <EditableField
                        value={row.desc}
                        onSave={(val) =>
                          setValRows((prev) =>
                            prev.map((r) => (r.id === row.id ? { ...r, desc: val } : r))
                          )
                        }
                      />
                    </div>
                  </td>

                  <td className="p-1 text-center text-[#8AA0C0] border-r border-[#1E3A5F]/40 whitespace-nowrap">
                    <EditableField
                      value={row.und}
                      onSave={(val) =>
                        setValRows((prev) =>
                          prev.map((r) => (r.id === row.id ? { ...r, und: val } : r))
                        )
                      }
                    />
                  </td>

                  {viewMode === "oficial" ? (
                    <>
                      {/* Presupuesto */}
                      <td className="p-1 text-right whitespace-nowrap">
                        <EditableField
                          value={row.metrado}
                          type="number"
                          onSave={(val) =>
                            setValRows((prev) =>
                              prev.map((r) =>
                                r.id === row.id
                                  ? {
                                      ...r,
                                      metrado: val,
                                      parcial: val * r.pu,
                                      saldo: Math.max(0, val - r.acum),
                                    }
                                  : r
                              )
                            )
                          }
                        />
                      </td>
                      <td className="p-1 text-right text-[#8AA0C0] whitespace-nowrap">
                        {row.pu.toFixed(2)}
                      </td>
                      <td className="p-1 text-right font-medium text-[#D4A574] border-r border-[#1E3A5F]/40 whitespace-nowrap">
                        {row.parcial.toLocaleString("es-PE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>

                      {/* Anterior */}
                      <td className="p-1 text-right text-[#8AA0C0] whitespace-nowrap">
                        {metradoAnt.toLocaleString("es-PE", { maximumFractionDigits: 2 })}
                      </td>
                      <td className="p-1 text-right text-[#8AA0C0] whitespace-nowrap">
                        {parcialAnt.toLocaleString("es-PE", { maximumFractionDigits: 0 })}
                      </td>
                      <td className="p-1 text-right text-[#8AA0C0] border-r border-[#1E3A5F]/40 whitespace-nowrap">
                        {porcAnt.toFixed(1)}%
                      </td>

                      {/* Actual Mes 17 */}
                      <td className="p-1 text-right bg-[#FF6B00]/5 font-semibold text-[#FEF3C7] whitespace-nowrap">
                        <EditableField
                          value={metradoAct}
                          type="number"
                          onSave={(val) =>
                            setValRows((prev) =>
                              prev.map((r) => {
                                if (r.id !== row.id) return r;
                                const newAct = val;
                                const newAcum = (r.metradoAnt || 0) + newAct;
                                const newSaldo = Math.max(0, r.metrado - newAcum);
                                return {
                                  ...r,
                                  metradoAct: newAct,
                                  parcialAct: newAct * r.pu,
                                  porcAct: r.metrado > 0 ? (newAct / r.metrado) * 100 : 0,
                                  acum: newAcum,
                                  metradoAcum: newAcum,
                                  parcialAcum: newAcum * r.pu,
                                  porcAcum: r.metrado > 0 ? (newAcum / r.metrado) * 100 : 0,
                                  saldo: newSaldo,
                                  metradoSaldo: newSaldo,
                                  parcialSaldo: newSaldo * r.pu,
                                  avance: r.metrado > 0 ? (newAcum / r.metrado) * 100 : 0,
                                };
                              })
                            )
                          }
                        />
                      </td>
                      <td className="p-1 text-right bg-[#FF6B00]/5 text-[#FEF3C7] whitespace-nowrap">
                        {parcialAct.toLocaleString("es-PE", { maximumFractionDigits: 0 })}
                      </td>
                      <td className="p-1 text-right bg-[#FF6B00]/5 text-[#FEF3C7] border-r border-[#1E3A5F]/40 whitespace-nowrap">
                        {porcAct.toFixed(1)}%
                      </td>

                      {/* Acumulado */}
                      <td className="p-1 text-right bg-emerald-500/5 text-emerald-300 font-semibold whitespace-nowrap">
                        {metradoAcum.toLocaleString("es-PE", { maximumFractionDigits: 2 })}
                      </td>
                      <td className="p-1 text-right bg-emerald-500/5 text-emerald-300 whitespace-nowrap">
                        {parcialAcum.toLocaleString("es-PE", { maximumFractionDigits: 0 })}
                      </td>
                      <td className="p-1 text-right bg-emerald-500/5 border-r border-[#1E3A5F]/40 whitespace-nowrap">
                        <span
                          className={`px-1 rounded text-[10px] font-bold ${
                            porcAcum < 50
                              ? "text-red-400"
                              : porcAcum < 80
                              ? "text-amber-300"
                              : "text-emerald-300"
                          }`}
                        >
                          {porcAcum.toFixed(1)}%
                        </span>
                      </td>

                      {/* Saldo */}
                      <td className="p-1 text-right text-[#8AA0C0] whitespace-nowrap">
                        {metradoSaldo.toLocaleString("es-PE", { maximumFractionDigits: 2 })}
                      </td>
                      <td className="p-1 text-right text-[#8AA0C0] whitespace-nowrap">
                        {parcialSaldo.toLocaleString("es-PE", { maximumFractionDigits: 0 })}
                      </td>
                      <td className="p-1 text-right text-[#8AA0C0] whitespace-nowrap">
                        {porcSaldo.toFixed(1)}%
                      </td>
                    </>
                  ) : (
                    <>
                      <td className="p-1 text-right whitespace-nowrap">{row.metrado}</td>
                      <td className="p-1 text-right text-[#8AA0C0] whitespace-nowrap">{row.pu.toFixed(2)}</td>
                      <td className="p-1 text-right text-[#D4A574] font-semibold whitespace-nowrap">
                        S/ {row.parcial.toLocaleString("es-PE", { maximumFractionDigits: 0 })}
                      </td>
                      <td className="p-1 text-right bg-[#FF6B00]/5 text-[#FEF3C7] font-semibold whitespace-nowrap">
                        {metradoAct.toFixed(1)}
                      </td>
                      <td className="p-1 text-right bg-[#FF6B00]/5 text-[#FEF3C7] whitespace-nowrap">
                        S/ {parcialAct.toLocaleString("es-PE", { maximumFractionDigits: 0 })}
                      </td>
                      <td className="p-1 text-right bg-emerald-500/5 text-emerald-300 font-semibold whitespace-nowrap">
                        {metradoAcum.toFixed(1)}
                      </td>
                      <td className="p-1 text-right bg-emerald-500/5 text-emerald-300 whitespace-nowrap">
                        S/ {parcialAcum.toLocaleString("es-PE", { maximumFractionDigits: 0 })}
                      </td>
                      <td className="p-1 text-right text-[#8AA0C0] whitespace-nowrap">
                        {metradoSaldo.toFixed(1)}
                      </td>
                      <td className="p-1 text-center whitespace-nowrap">
                        <span
                          className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${
                            porcAcum < 50
                              ? "bg-red-500/20 text-red-300"
                              : porcAcum < 80
                              ? "bg-amber-500/20 text-amber-300"
                              : "bg-emerald-500/20 text-emerald-300"
                          }`}
                        >
                          {porcAcum.toFixed(1)}%
                        </span>
                      </td>
                      <td className="p-1 text-center whitespace-nowrap">
                        <EditableField
                          value={row.sector || "S1"}
                          onSave={(val) =>
                            setValRows((prev) =>
                              prev.map((r) => (r.id === row.id ? { ...r, sector: val } : r))
                            )
                          }
                        />
                      </td>
                    </>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Footer / Summary count */}
      <div className="flex flex-wrap items-center justify-between text-[10px] font-mono text-[#8AA0C0] pt-1">
        <div>
          Mostrando {filteredRows.length} de {valRows.length} partidas oficiales de la Valorización N° 17
        </div>
        <div className="flex items-center gap-3">
          <span>
            Total Parcial: <strong className="text-[#D4A574]">S/ {totals.parcialTotal.toLocaleString("es-PE", { maximumFractionDigits: 0 })}</strong>
          </span>
          <span>
            Total Mes 17: <strong className="text-[#FEF3C7]">S/ {totals.parcialAct.toLocaleString("es-PE", { maximumFractionDigits: 0 })}</strong>
          </span>
          <span>
            Total Acumulado: <strong className="text-emerald-400">S/ {totals.parcialAcum.toLocaleString("es-PE", { maximumFractionDigits: 0 })}</strong>
          </span>
        </div>
      </div>
    </div>
  );
};
