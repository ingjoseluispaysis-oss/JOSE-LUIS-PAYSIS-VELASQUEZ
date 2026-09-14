import React from "react";
import { Activity } from "lucide-react";
import { CuadrillaItem, EVMMetrics, MetradoDiarioRow, StorageStatus } from "../../types";
import { EditableField } from "../EditableField";
import { ActionToolbar } from "../ActionToolbar";

interface Tab6MetradosProps {
  metrados: MetradoDiarioRow[];
  setMetrados: React.Dispatch<React.SetStateAction<MetradoDiarioRow[]>>;
  cuadrillas: CuadrillaItem[];
  setCuadrillas: React.Dispatch<React.SetStateAction<CuadrillaItem[]>>;
  metrics: EVMMetrics;
  onAcumular: () => void;
  onSave: () => void;
  onExport: () => void;
  onIA: () => void;
  storageStatus: StorageStatus;
}

export const Tab6Metrados: React.FC<Tab6MetradosProps> = ({
  metrados,
  setMetrados,
  cuadrillas,
  setCuadrillas,
  metrics,
  onAcumular,
  onSave,
  onExport,
  onIA,
  storageStatus,
}) => {
  return (
    <div className="space-y-3">
      <div className="bg-[#0B1D3A] border border-[#1E3A5F] rounded-xl p-4 shadow-xl">
        <h2 className="text-[14px] font-bold mb-3 flex items-center gap-2 text-[#E6F1FF]">
          <Activity size={16} className="text-[#D4A574]" />
          ITEM 6 SUSTENTO METRADOS 8211 PBI PBD CUADRILLAS CARTA BALANCE 15MIN
        </h2>

        <ActionToolbar
          onNew={() => {
            setMetrados((prev) => [
              ...prev,
              {
                id: prev.length + 1,
                base: 100,
                ejec: 50,
                acum: 1200,
                saldo: 800,
                frente: "Frente A",
                fecha: new Date().toISOString().slice(0, 10),
              },
            ]);
          }}
          onDup={() => {
            if (metrados.length === 0) return;
            setMetrados((prev) => [
              ...prev,
              { ...prev[prev.length - 1], id: prev.length + 1 },
            ]);
          }}
          onDel={() => setMetrados((prev) => prev.slice(0, -1))}
          onAcum={onAcumular}
          onSave={onSave}
          onStore={onSave}
          onImport={() => {}}
          onExport={onExport}
          onCalc={() => {}}
          onIA={onIA}
          count={metrados.length + cuadrillas.length}
          badge={storageStatus}
        />

        <div className="grid md:grid-cols-3 gap-3 mt-3">
          {/* Metrados Diarios Table */}
          <div className="md:col-span-2 bg-[#020A1E] border border-[#1E3A5F] rounded-lg p-3">
            <div className="text-[11px] font-bold mb-2 text-[#E6F1FF]">
              Metrados Diarios Acumulables (Doble clic edita inline + acumula a mensual)
            </div>
            <div className="overflow-auto max-h-[260px]">
              <table className="w-full text-[11px] font-mono">
                <thead className="text-[#8AA0C0] text-[10px] bg-[#030A18]">
                  <tr>
                    <th className="p-1.5 text-center">Meta Base</th>
                    <th className="p-1.5 text-center">Ejec Hoy</th>
                    <th className="p-1.5 text-center">Acumulado</th>
                    <th className="p-1.5 text-center">Saldo</th>
                    <th className="p-1.5 text-center">Frente</th>
                    <th className="p-1.5 text-center">Fecha</th>
                  </tr>
                </thead>
                <tbody>
                  {metrados.map((row) => (
                    <tr
                      key={row.id}
                      className="border-t border-[#1E3A5F]/20 hover:bg-[#13274F]/40 transition-colors"
                    >
                      <td className="p-1 text-center">
                        <EditableField
                          value={row.base}
                          type="number"
                          onSave={(val) =>
                            setMetrados((prev) =>
                              prev.map((r) =>
                                r.id === row.id ? { ...r, base: val } : r
                              )
                            )
                          }
                        />
                      </td>
                      <td className="p-1 text-center">
                        <EditableField
                          value={row.ejec}
                          type="number"
                          onSave={(val) =>
                            setMetrados((prev) =>
                              prev.map((r) =>
                                r.id === row.id
                                  ? {
                                      ...r,
                                      ejec: val,
                                      acum: r.acum + val,
                                      saldo: Math.max(0, r.base - (r.acum + val)),
                                    }
                                  : r
                              )
                            )
                          }
                        />
                      </td>
                      <td className="p-1 text-center text-emerald-300 font-semibold">
                        {row.acum}
                      </td>
                      <td className="p-1 text-center text-[#8AA0C0]">
                        {row.saldo}
                      </td>
                      <td className="p-1 text-center">
                        <EditableField
                          value={row.frente}
                          onSave={(val) =>
                            setMetrados((prev) =>
                              prev.map((r) =>
                                r.id === row.id ? { ...r, frente: val } : r
                              )
                            )
                          }
                        />
                      </td>
                      <td className="p-1 text-center text-[#8AA0C0]">
                        {row.fecha}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Cuadrillas & Carta Balance */}
          <div className="bg-[#020A1E] border border-[#1E3A5F] rounded-lg p-3 flex flex-col justify-between">
            <div>
              <div className="text-[11px] font-bold mb-2 text-[#E6F1FF]">
                Rendimiento de Cuadrillas de Obra
              </div>
              <div className="space-y-2">
                {cuadrillas.map((c) => (
                  <div
                    key={c.id}
                    className="border border-[#1E3A5F]/50 rounded p-2 bg-[#030A18]"
                  >
                    <div className="flex justify-between items-center text-[11px] font-bold">
                      <span className="text-[#D4A574]">{c.id}</span>
                      <span className="text-[10px] text-[#8AA0C0]">{c.sector}</span>
                    </div>
                    <div className="text-[11px] mt-0.5">
                      <EditableField
                        value={c.nombre}
                        onSave={(val) =>
                          setCuadrillas((prev) =>
                            prev.map((item) =>
                              item.id === c.id ? { ...item, nombre: val } : item
                            )
                          )
                        }
                      />
                    </div>
                    <div className="grid grid-cols-3 gap-1 mt-1 text-[10px] font-mono">
                      <div>
                        Teor:{" "}
                        <EditableField
                          value={c.rendTeor}
                          type="number"
                          onSave={(val) =>
                            setCuadrillas((prev) =>
                              prev.map((item) =>
                                item.id === c.id ? { ...item, rendTeor: val } : item
                              )
                            )
                          }
                        />
                      </div>
                      <div>
                        Real:{" "}
                        <span
                          className={
                            c.rendReal < c.rendTeor * 0.85
                              ? "text-red-400 font-bold"
                              : "text-emerald-300 font-bold"
                          }
                        >
                          <EditableField
                            value={c.rendReal}
                            type="number"
                            onSave={(val) =>
                              setCuadrillas((prev) =>
                                prev.map((item) =>
                                  item.id === c.id ? { ...item, rendReal: val } : item
                                )
                              )
                            }
                          />
                        </span>
                      </div>
                      <div className="text-[#8AA0C0]">HH: {c.hh}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Carta Balance */}
            <div className="mt-3 bg-[#13274F]/70 border border-[#1E3A5F] rounded p-2.5 text-[10px] font-mono">
              <div className="flex justify-between items-center mb-1">
                <span className="font-bold text-[#E6F1FF]">
                  Carta Balance (384 observaciones 15 min):
                </span>
                <span className="text-[#D4A574]">TP {metrics.tp}% | Meta &gt;60%</span>
              </div>
              <div className="text-[#8AA0C0] mb-1.5">
                TP {metrics.tp}% (Verde) | TC {metrics.tc}% (Ámbar) | TNC {metrics.tnc}% (Rojo - Meta &lt;25%)
              </div>
              <div className="flex gap-1 h-2 rounded overflow-hidden">
                <div
                  className="bg-emerald-500 transition-all"
                  style={{ width: `${metrics.tp}%` }}
                  title={`TP Trabajo Productivo ${metrics.tp}%`}
                />
                <div
                  className="bg-amber-500 transition-all"
                  style={{ width: `${metrics.tc}%` }}
                  title={`TC Trabajo Contributorio ${metrics.tc}%`}
                />
                <div
                  className="bg-red-500 transition-all"
                  style={{ width: `${metrics.tnc}%` }}
                  title={`TNC Trabajo No Contributorio ${metrics.tnc}%`}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
