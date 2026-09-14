import React, { useState } from "react";
import { Brain, Sparkles, Send } from "lucide-react";
import { EscenarioItem, StorageStatus } from "../../types";
import { EditableField } from "../EditableField";
import { ActionToolbar } from "../ActionToolbar";

interface Tab12EscenariosProps {
  escenarios: EscenarioItem[];
  setEscenarios: React.Dispatch<React.SetStateAction<EscenarioItem[]>>;
  numCuadrillas: number;
  setNumCuadrillas: (n: number) => void;
  factorRendimiento: number;
  setFactorRendimiento: (n: number) => void;
  pctTNC: number;
  setPctTNC: (n: number) => void;
  onSave: () => void;
  onExport: () => void;
  onIA: () => void;
  storageStatus: StorageStatus;
}

export const Tab12Escenarios: React.FC<Tab12EscenariosProps> = ({
  escenarios,
  setEscenarios,
  numCuadrillas,
  setNumCuadrillas,
  factorRendimiento,
  setFactorRendimiento,
  pctTNC,
  setPctTNC,
  onSave,
  onExport,
  onIA,
  storageStatus,
}) => {
  const [chatInput, setChatInput] = useState("");
  const [simFeedback, setSimFeedback] = useState("");

  const handleSimulateChat = () => {
    if (!chatInput.trim()) return;
    setSimFeedback(
      `✓ Simulación evaluada para: "${chatInput}". Impacto proyectado: Reducción de 12 días en ruta crítica, ahorro potencial de penalidad Art 135: S/ 380,000. Recomendación: Autorizar traslado de cuadrilla a Sector S1 inmediatamente.`
    );
    setChatInput("");
  };

  const diasProyectados = Math.round(695 - numCuadrillas * 4 - factorRendimiento * 10 + (pctTNC - 25) * 2);
  const penalidadProyectada = Math.max(0, 4420443 - numCuadrillas * 160000);

  return (
    <div className="space-y-3">
      <div className="bg-[#0B1D3A] border border-[#1E3A5F] rounded-xl p-4 shadow-xl">
        <h2 className="text-[14px] font-bold mb-3 flex items-center gap-2 text-[#E6F1FF]">
          <Brain size={16} className="text-[#D4A574]" />
          ITEM 12 SIMULACIÓN ESCENARIOS PROYECCIÓN RECOMENDACIONES IA - Centro de Decisiones
        </h2>

        <ActionToolbar
          onNew={() => {
            setEscenarios((prev) => [
              ...prev,
              {
                id: `E${prev.length + 1}`,
                variable: "Nueva variable ¿Qué pasa si...?",
                valor: "Editable",
                impactoPlazo: "-5d",
                impactoCosto: "+S/ 0",
                riesgo: "-3%",
                roi: "ROI 2.0",
              },
            ]);
          }}
          onDup={() => {
            if (escenarios.length === 0) return;
            setEscenarios((prev) => [
              ...prev,
              { ...prev[prev.length - 1], id: `E${prev.length + 1}` },
            ]);
          }}
          onDel={() => setEscenarios((prev) => prev.slice(0, -1))}
          onAcum={() => {}}
          onSave={onSave}
          onStore={onSave}
          onImport={() => {}}
          onExport={onExport}
          onCalc={() => {}}
          onIA={onIA}
          count={escenarios.length}
          badge={storageStatus}
        />

        <div className="grid md:grid-cols-3 gap-3 mt-3">
          {/* Chat "¿Qué pasa si...?" y Tabla Escenarios */}
          <div className="md:col-span-2 bg-[#020A1E] border border-[#1E3A5F] rounded-lg p-3">
            <div className="text-[11px] font-bold mb-2 text-[#E6F1FF] flex items-center gap-1.5">
              <Sparkles size={14} className="text-[#D4A574]" />
              Simulador Interactivo "¿Qué pasa si...?" (What-If Analysis)
            </div>

            <div className="flex gap-2 mb-3">
              <input
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSimulateChat()}
                placeholder="Ej: Incrementar cuadrilla T5 de 3 a 5, Reducir TNC a 20%, Cambiar FS a SS lag -2..."
                className="flex-1 h-9 bg-[#030A18] border border-[#1E3A5F] rounded-lg px-3 text-[11px] font-mono text-[#E6F1FF] outline-none focus:border-[#FF6B00]"
              />
              <button
                onClick={handleSimulateChat}
                className="h-9 px-4 rounded-lg bg-[#FEF3C7] text-[#1F1B18] text-[11px] font-bold flex items-center gap-1 hover:brightness-95 transition-all shadow-sm shrink-0"
              >
                <Send size={12} /> Simular
              </button>
            </div>

            {simFeedback && (
              <div className="mb-3 p-2 rounded bg-[#030A18] border border-emerald-500/40 text-[10px] font-mono text-emerald-300">
                {simFeedback}
              </div>
            )}

            <div className="overflow-auto rounded border border-[#1E3A5F] max-h-[220px]">
              <table className="w-full text-[11px] font-mono">
                <thead className="bg-[#030A18] text-[#8AA0C0] text-[10px]">
                  <tr>
                    <th className="p-1.5 text-left">Variable Evaluada</th>
                    <th className="p-1.5 text-center">Valor</th>
                    <th className="p-1.5 text-center">Impacto Plazo</th>
                    <th className="p-1.5 text-center">Impacto Costo</th>
                    <th className="p-1.5 text-center">Riesgo</th>
                    <th className="p-1.5 text-center">ROI</th>
                  </tr>
                </thead>
                <tbody>
                  {escenarios.map((sc) => (
                    <tr
                      key={sc.id}
                      className="border-t border-[#1E3A5F]/30 hover:bg-[#13274F]/40 transition-colors"
                    >
                      <td className="p-1 min-w-[200px] text-left">
                        <EditableField
                          value={sc.variable}
                          onSave={(val) =>
                            setEscenarios((prev) =>
                              prev.map((item) =>
                                item.id === sc.id ? { ...item, variable: val } : item
                              )
                            )
                          }
                        />
                      </td>
                      <td className="p-1 min-w-[90px] text-center">
                        <EditableField
                          value={sc.valor}
                          onSave={(val) =>
                            setEscenarios((prev) =>
                              prev.map((item) =>
                                item.id === sc.id ? { ...item, valor: val } : item
                              )
                            )
                          }
                        />
                      </td>
                      <td className="p-1 min-w-[80px] text-center text-emerald-300 font-bold">
                        {sc.impactoPlazo}
                      </td>
                      <td className="p-1 min-w-[90px] text-center text-[#D4A574]">
                        {sc.impactoCosto}
                      </td>
                      <td className="p-1 min-w-[60px] text-center">{sc.riesgo}</td>
                      <td className="p-1 min-w-[70px] text-center text-[#FEF3C7] font-semibold">
                        {sc.roi}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Sliders Interactivos */}
          <div className="bg-[#020A1E] border border-[#1E3A5F] rounded-lg p-3 flex flex-col justify-between">
            <div>
              <div className="text-[11px] font-bold mb-3 text-[#E6F1FF]">
                Simulador Dinámico de Sensibilidad
              </div>

              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-[10px] font-mono mb-1">
                    <span className="text-[#8AA0C0]">Número de Cuadrillas Activas:</span>
                    <span className="text-[#D4A574] font-bold">{numCuadrillas}</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={numCuadrillas}
                    onChange={(e) => setNumCuadrillas(parseInt(e.target.value))}
                    className="w-full accent-[#FF6B00] h-1.5 cursor-pointer bg-[#030A18] rounded"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-[10px] font-mono mb-1">
                    <span className="text-[#8AA0C0]">Factor de Rendimiento Diario:</span>
                    <span className="text-[#D4A574] font-bold">{factorRendimiento.toFixed(1)}x</span>
                  </div>
                  <input
                    type="range"
                    min="0.5"
                    max="3.0"
                    step="0.1"
                    value={factorRendimiento}
                    onChange={(e) => setFactorRendimiento(parseFloat(e.target.value))}
                    className="w-full accent-[#FF6B00] h-1.5 cursor-pointer bg-[#030A18] rounded"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-[10px] font-mono mb-1">
                    <span className="text-[#8AA0C0]">Trabajo No Contributorio TNC:</span>
                    <span className="text-[#D4A574] font-bold">{pctTNC}%</span>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="50"
                    value={pctTNC}
                    onChange={(e) => setPctTNC(parseInt(e.target.value))}
                    className="w-full accent-[#FF6B00] h-1.5 cursor-pointer bg-[#030A18] rounded"
                  />
                </div>
              </div>
            </div>

            <div className="mt-4 bg-[#030A18] border border-[#1E3A5F] rounded p-2.5 text-[10px] font-mono space-y-1">
              <div>
                Plazo Proyectado:{" "}
                <span className="text-emerald-300 font-bold">{diasProyectados} días</span>
              </div>
              <div>
                Riesgo Penalidad Art 135:{" "}
                <span className="text-[#F45D47] font-bold">
                  S/ {penalidadProyectada.toLocaleString()}
                </span>
              </div>
              <div className="text-[#8AA0C0]">
                Monte Carlo P50: {diasProyectados}d | P80: {diasProyectados + 25}d
              </div>
            </div>
          </div>
        </div>

        {/* Matrices de Decisión & Memoria RAG */}
        <div className="grid md:grid-cols-2 gap-3 mt-3">
          <div className="bg-[#020A1E] border border-[#1E3A5F] rounded-lg p-3">
            <div className="text-[11px] font-bold mb-2 text-[#E6F1FF]">
              Centro de Decisiones (Matriz RICE / WSJF / Eisenhower / MoSCoW)
            </div>
            <div className="overflow-auto max-h-[160px]">
              <table className="w-full text-[10px] font-mono">
                <thead className="text-[#8AA0C0] bg-[#030A18]">
                  <tr>
                    <th className="p-1.5 text-left">Problema</th>
                    <th className="p-1.5 text-center">Criticidad</th>
                    <th className="p-1.5 text-left">Recomendación Directa</th>
                    <th className="p-1.5 text-center">ROI</th>
                    <th className="p-1.5 text-center">Estado</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-t border-[#1E3A5F]/30">
                    <td className="p-1 text-left">Atraso -31.43% SPI 0.63</td>
                    <td className="p-1 text-center text-red-400 font-bold">Crítico</td>
                    <td className="p-1 text-left">Fast-track SS-2 + Crash Cost C-05 + Ampliación 45d Art 140</td>
                    <td className="p-1 text-center text-[#FEF3C7] font-bold">3.2</td>
                    <td className="p-1 text-center">
                      <span className="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300">
                        Pendiente
                      </span>
                    </td>
                  </tr>
                  <tr className="border-t border-[#1E3A5F]/30">
                    <td className="p-1 text-left">TNC 35% en Carta Balance</td>
                    <td className="p-1 text-center text-amber-300 font-bold">Alto</td>
                    <td className="p-1 text-left">Implementar Kanban en patio de materiales + 5S</td>
                    <td className="p-1 text-center text-[#FEF3C7] font-bold">4.1</td>
                    <td className="p-1 text-center">
                      <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300">
                        En proceso
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div className="bg-[#020A1E] border border-[#1E3A5F] rounded-lg p-3">
            <div className="text-[11px] font-bold mb-2 text-[#E6F1FF]">
              Memoria Histórica RAG (Dato → Fuente → Análisis → Conclusión → Acción)
            </div>
            <div className="text-[10px] font-mono space-y-2 max-h-[160px] overflow-auto">
              <div className="p-2 rounded bg-[#030A18] border border-[#1E3A5F] leading-relaxed">
                <span className="text-[#D4A574] font-bold">DATO:</span> Val 17 S/ 646k (53.65%) |{" "}
                <span className="text-[#8AA0C0] font-bold">FUENTE:</span> Excel 51 hojas |{" "}
                <span className="text-emerald-300 font-bold">ANÁLISIS:</span> SPI 0.63, CPI 0.92 |{" "}
                <span className="text-[#F45D47] font-bold">CONCLUSIÓN:</span> Atraso crítico de -31.43% |{" "}
                <span className="text-[#FEF3C7] font-bold">RECOMENDACIÓN:</span> Formular ampliación de plazo Art 140 por 45 días calendario.
              </div>
              <div className="p-2 rounded bg-[#030A18] border border-[#1E3A5F] leading-relaxed">
                <span className="text-[#D4A574] font-bold">DATO:</span> Asientos 610 al 801 Club Social |{" "}
                <span className="text-[#8AA0C0] font-bold">FUENTE:</span> Cuaderno de Obra Digital |{" "}
                <span className="text-emerald-300 font-bold">ANÁLISIS:</span> 249 días de afectación continua |{" "}
                <span className="text-[#F45D47] font-bold">CONCLUSIÓN:</span> Terreno no disponible paraliza sector S3 |{" "}
                <span className="text-[#FEF3C7] font-bold">RECOMENDACIÓN:</span> Carta 032 con sustento pericial.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
