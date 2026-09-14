import React from "react";
import { Gauge } from "lucide-react";
import { EVMMetrics, StorageStatus } from "../../types";
import { ActionToolbar } from "../ActionToolbar";

interface Tab10ProductividadProps {
  metrics: EVMMetrics;
  onSave: () => void;
  onExport: () => void;
  onIA: () => void;
  storageStatus: StorageStatus;
}

export const Tab10Productividad: React.FC<Tab10ProductividadProps> = ({
  metrics,
  onSave,
  onExport,
  onIA,
  storageStatus,
}) => {
  const kpis = [
    { label: "Trabajo Productivo (TP)", v: `${metrics.tp}%`, meta: "≥ 60%", ok: metrics.tp >= 60 },
    { label: "Plan Cumplido (PPC)", v: `${metrics.ppc}%`, meta: "≥ 85%", ok: metrics.ppc >= 85 },
    { label: "Índice Cronograma (SPI)", v: metrics.spi.toFixed(2), meta: "≥ 0.90", ok: metrics.spi >= 0.9 },
    { label: "Índice Costo (CPI)", v: metrics.cpi.toFixed(2), meta: "≥ 0.95", ok: metrics.cpi >= 0.95 },
  ];

  return (
    <div className="bg-[#0B1D3A] border border-[#1E3A5F] rounded-xl p-4 shadow-xl">
      <h2 className="text-[14px] font-bold mb-3 flex items-center gap-2 text-[#E6F1FF]">
        <Gauge size={16} className="text-[#D4A574]" />
        ITEM 10 CENTRO PRODUCTIVIDAD EVM PMBOK 8 VDC POWER BI - Métricas de Control
      </h2>

      <ActionToolbar
        onNew={() => {}}
        onDup={() => {}}
        onDel={() => {}}
        onAcum={() => {}}
        onSave={onSave}
        onStore={onSave}
        onImport={() => {}}
        onExport={onExport}
        onCalc={() => {}}
        onIA={onIA}
        count={24}
        badge={storageStatus}
      />

      <div className="grid md:grid-cols-3 gap-3 mt-3">
        {/* Semáforos de Control */}
        <div className="bg-[#020A1E] border border-[#1E3A5F] rounded-lg p-3">
          <div className="text-[11px] font-bold mb-3 text-[#E6F1FF]">
            Semáforos de Desempeño Operativo y Contractual
          </div>
          <div className="space-y-2.5">
            {kpis.map((kpi) => (
              <div
                key={kpi.label}
                className="flex items-center justify-between p-2 rounded bg-[#030A18] border border-[#1E3A5F]/40"
              >
                <div className="flex items-center gap-2">
                  <div
                    className={`w-3 h-3 rounded-full shrink-0 ${
                      kpi.ok ? "bg-emerald-400" : "bg-red-400 animate-pulse"
                    }`}
                  />
                  <div>
                    <div className="text-[11px] font-medium text-[#E6F1FF]">{kpi.label}</div>
                    <div className="text-[9px] text-[#8AA0C0]">Meta: {kpi.meta}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div
                    className={`text-[12px] font-bold font-mono ${
                      kpi.ok ? "text-emerald-300" : "text-red-400"
                    }`}
                  >
                    {kpi.v}
                  </div>
                  <span
                    className={`px-1.5 py-0.5 rounded text-[8px] font-mono ${
                      kpi.ok ? "bg-emerald-500/20 text-emerald-300" : "bg-red-500/20 text-red-300"
                    }`}
                  >
                    {kpi.ok ? "VERDE" : "ROJO CRÍTICO"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Fórmulas EVM */}
        <div className="bg-[#020A1E] border border-[#1E3A5F] rounded-lg p-3">
          <div className="text-[11px] font-bold mb-2 text-[#E6F1FF]">
            Métricas de Valor Ganado (EVM PMBOK 8va Edición)
          </div>
          <div className="space-y-1 text-[11px] font-mono">
            <div className="flex justify-between p-1.5 bg-[#030A18] rounded">
              <span className="text-[#8AA0C0]">Presupuesto Base (BAC):</span>
              <span className="text-[#FEF3C7]">S/ {(metrics.bac / 1e6).toFixed(2)} M</span>
            </div>
            <div className="flex justify-between p-1.5 bg-[#030A18] rounded">
              <span className="text-[#8AA0C0]">Valor Planificado (PV):</span>
              <span className="text-[#D4A574]">S/ {(metrics.pv / 1e6).toFixed(2)} M</span>
            </div>
            <div className="flex justify-between p-1.5 bg-[#030A18] rounded">
              <span className="text-[#8AA0C0]">Valor Ganado (EV):</span>
              <span className="text-emerald-300">S/ {(metrics.ev / 1e6).toFixed(2)} M</span>
            </div>
            <div className="flex justify-between p-1.5 bg-[#030A18] rounded">
              <span className="text-[#8AA0C0]">Costo Real Incurrido (AC):</span>
              <span className="text-[#F45D47]">S/ {(metrics.ac / 1e6).toFixed(2)} M</span>
            </div>
            <div className="flex justify-between p-1.5 bg-[#030A18] rounded">
              <span className="text-[#8AA0C0]">Variación Cronograma (SV):</span>
              <span className="text-red-400 font-bold">-S/ 13.89 M</span>
            </div>
            <div className="flex justify-between p-1.5 bg-[#030A18] rounded">
              <span className="text-[#8AA0C0]">Variación Costo (CV):</span>
              <span className="text-amber-300">-S/ 2.06 M</span>
            </div>
          </div>
        </div>

        {/* Proyecciones EAC / VAC / VDC */}
        <div className="bg-[#020A1E] border border-[#1E3A5F] rounded-lg p-3 flex flex-col justify-between">
          <div>
            <div className="text-[11px] font-bold mb-2 text-[#E6F1FF]">
              Proyecciones VDC / BIM / Power BI
            </div>
            <div className="space-y-1.5 text-[10px] font-mono">
              <div className="p-2 rounded bg-[#030A18] border border-[#1E3A5F]">
                <div className="text-[#8AA0C0]">Estimación al Término (EAC):</div>
                <div className="text-[13px] font-bold text-[#D4A574]">S/ 48,048,302.10</div>
                <div className="text-[9px] text-red-300">Sobrecosto proyectado: +S/ 3.84 M</div>
              </div>
              <div className="p-2 rounded bg-[#030A18] border border-[#1E3A5F]">
                <div className="text-[#8AA0C0]">Variación a la Conclusión (VAC):</div>
                <div className="text-[13px] font-bold text-red-400">-S/ 3,843,864.17</div>
              </div>
              <div className="p-2 rounded bg-[#030A18] border border-[#1E3A5F]">
                <div className="text-[#8AA0C0]">Índice de Desempeño TCPI:</div>
                <div className="text-[13px] font-bold text-emerald-300">0.88</div>
                <div className="text-[9px] text-[#8AA0C0]">Factible de cumplir con refuerzo</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
