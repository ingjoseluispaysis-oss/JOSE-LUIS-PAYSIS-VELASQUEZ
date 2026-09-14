import React from "react";
import { Target } from "lucide-react";
import { StorageStatus } from "../../types";
import { ActionToolbar } from "../ActionToolbar";

interface Tab9TrenesProps {
  onSave: () => void;
  onExport: () => void;
  onIA: () => void;
  storageStatus: StorageStatus;
}

export const Tab9Trenes: React.FC<Tab9TrenesProps> = ({
  onSave,
  onExport,
  onIA,
  storageStatus,
}) => {
  const trenes = [
    { t: "T1", act: "Trazo y Niveles", takt: "2d", buffer: "1d" },
    { t: "T2", act: "Excavación de Zanja", takt: "2d", buffer: "1d" },
    { t: "T3", act: "Base Granular Compactada", takt: "2d", buffer: "1d" },
    { t: "T4", act: "Encofrado Metálico", takt: "2d", buffer: "1d" },
    { t: "T5", act: "Vaciado Concreto f'c=175", takt: "2d", buffer: "1d" },
    { t: "T6", act: "Bruñado y Acabado", takt: "2d", buffer: "1d" },
    { t: "T7", act: "Curado Químico", takt: "2d", buffer: "1d" },
    { t: "T8", act: "Juntas de Dilatación", takt: "2d", buffer: "1d" },
  ];

  const cincoS = [
    { name: "Seiri (Clasificar)", score: 75, status: "✓ Aprobado" },
    { name: "Seiton (Ordenar)", score: 68, status: "⚠ En ajuste" },
    { name: "Seiso (Limpiar)", score: 82, status: "✓ Aprobado" },
    { name: "Seiketsu (Estandarizar)", score: 70, status: "✓ Aprobado" },
    { name: "Shitsuke (Disciplina)", score: 65, status: "⚠ En ajuste" },
  ];

  return (
    <div className="bg-[#0B1D3A] border border-[#1E3A5F] rounded-xl p-4 shadow-xl">
      <h2 className="text-[14px] font-bold mb-3 flex items-center gap-2 text-[#E6F1FF]">
        <Target size={16} className="text-[#D4A574]" />
        ITEM 9 TRENES DE TRABAJO 5S KANBAN 7 DESPERDICIOS - Lean Construction
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
        count={28}
        badge={storageStatus}
      />

      <div className="grid md:grid-cols-3 gap-3 mt-3">
        {/* Matriz de Trenes */}
        <div className="bg-[#020A1E] border border-[#1E3A5F] rounded-lg p-3">
          <div className="text-[11px] font-bold mb-2 text-[#E6F1FF]">
            Matriz Sectores S1-S5 x Trenes T1-T8 (Takt Time 2d)
          </div>
          <div className="space-y-1 max-h-[280px] overflow-auto">
            {trenes.map((item) => (
              <div
                key={item.t}
                className="flex items-center justify-between p-2 rounded bg-[#030A18] border border-[#1E3A5F]/40 text-[11px] font-mono"
              >
                <div className="flex items-center gap-2">
                  <span className="font-bold text-[#D4A574]">{item.t}</span>
                  <span className="text-[#E6F1FF]">{item.act}</span>
                </div>
                <div className="flex items-center gap-1 text-[10px]">
                  <span className="px-1.5 py-0.5 rounded bg-[#13274F] text-[#8AA0C0]">
                    Takt: {item.takt}
                  </span>
                  <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300">
                    Buf: {item.buffer}
                  </span>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-2 text-[10px] font-mono text-[#8AA0C0]">
            Ritmo estabilizado en 80-100 m2/día por sector.
          </div>
        </div>

        {/* 5S Scorecard */}
        <div className="bg-[#020A1E] border border-[#1E3A5F] rounded-lg p-3">
          <div className="text-[11px] font-bold mb-2 text-[#E6F1FF]">
            Auditoría 5S en Frente de Trabajo (Scorecard)
          </div>
          <div className="space-y-2">
            {cincoS.map((s) => (
              <div key={s.name} className="p-2 bg-[#030A18] rounded border border-[#1E3A5F]/40">
                <div className="flex justify-between text-[11px] font-mono mb-1">
                  <span className="text-[#E6F1FF]">{s.name}</span>
                  <span className={s.score >= 70 ? "text-emerald-300 font-bold" : "text-amber-300 font-bold"}>
                    {s.score}%
                  </span>
                </div>
                <div className="w-full h-1.5 bg-[#13274F] rounded overflow-hidden">
                  <div
                    className={s.score >= 70 ? "h-full bg-emerald-400" : "h-full bg-amber-400"}
                    style={{ width: `${s.score}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
          <div className="mt-3 text-[10px] font-mono text-[#D4A574]">
            Puntaje Global 5S: 72% | Meta: 85% para frentes urbanos.
          </div>
        </div>

        {/* 7 Desperdicios Lean */}
        <div className="bg-[#020A1E] border border-[#1E3A5F] rounded-lg p-3 flex flex-col justify-between">
          <div>
            <div className="text-[11px] font-bold mb-2 text-[#E6F1FF]">
              Diagnóstico de los 7 Desperdicios (Muda)
            </div>
            <div className="space-y-1 text-[10px] font-mono">
              {[
                { name: "1. Esperas (Material/Interferencia)", val: "32%", crit: true },
                { name: "2. Transporte y Acarreo", val: "23%", crit: true },
                { name: "3. Movimientos Innecesarios", val: "18%", crit: false },
                { name: "4. Inventario Excesivo en Obra", val: "15%", crit: false },
                { name: "5. Sobreproducción", val: "12%", crit: false },
                { name: "6. Sobreprocesamiento", val: "8%", crit: false },
                { name: "7. Defectos y Retrabajos", val: "5%", crit: false },
              ].map((m) => (
                <div
                  key={m.name}
                  className={`flex justify-between p-1.5 rounded ${
                    m.crit ? "bg-red-500/10 border border-red-500/30" : "bg-[#030A18]"
                  }`}
                >
                  <span className={m.crit ? "text-red-200" : "text-[#8AA0C0]"}>{m.name}</span>
                  <span className={m.crit ? "text-red-400 font-bold" : "text-emerald-300"}>
                    {m.val}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-3 p-2 bg-[#7B1C1C]/20 border border-[#7B1C1C]/40 rounded text-[10px] font-mono text-red-200">
            Foco de Mejora Kaizen: 55% del desperdicio proviene de esperas por interferencias y sobre-transporte. Contramedida: Kanban en patio de acopio y reprogramación de accesos.
          </div>
        </div>
      </div>
    </div>
  );
};
