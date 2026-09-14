import React from "react";
import { FileText, Clock3 } from "lucide-react";
import { ProyectoInfo, StorageStatus } from "../../types";
import { EditableField } from "../EditableField";
import { ActionToolbar } from "../ActionToolbar";

interface Tab1ProyectoProps {
  proyecto: ProyectoInfo;
  setProyecto: React.Dispatch<React.SetStateAction<ProyectoInfo>>;
  onSave: () => void;
  onAcumular: () => void;
  onExport: () => void;
  onIA: () => void;
  storageStatus: StorageStatus;
  lastSavedText: string;
}

export const Tab1Proyecto: React.FC<Tab1ProyectoProps> = ({
  proyecto,
  setProyecto,
  onSave,
  onAcumular,
  onExport,
  onIA,
  storageStatus,
  lastSavedText,
}) => {
  const fields = [
    { k: "cui", label: "CUI Proyecto", v: proyecto.cui, type: "text" as const },
    { k: "nombre", label: "Nombre Proyecto", v: proyecto.nombre, type: "text" as const },
    { k: "cliente", label: "Entidad / Cliente", v: proyecto.cliente, type: "text" as const },
    { k: "contratista", label: "Contratista Ejecutor", v: proyecto.contratista, type: "text" as const },
    { k: "supervision", label: "Supervisión", v: proyecto.supervision, type: "text" as const },
    { k: "jefe", label: "Jefe de Proyecto", v: proyecto.jefe, type: "text" as const },
    { k: "residente", label: "Residente de Obra", v: proyecto.residente, type: "text" as const },
    { k: "presupuestoConIGV", label: "Presupuesto con IGV (S/)", v: proyecto.presupuestoConIGV, type: "number" as const },
    { k: "presupuestoSinIGV", label: "Presupuesto sin IGV (S/)", v: proyecto.presupuestoSinIGV, type: "number" as const },
    { k: "plazoOrig", label: "Plazo Contractual (días)", v: proyecto.plazoOrig, type: "number" as const },
    { k: "plazoActual", label: "Plazo Vigente Ampliado (668d)", v: proyecto.plazoActual, type: "number" as const },
    { k: "inicio", label: "Fecha de Inicio Contractual", v: proyecto.inicio, type: "date" as const },
    { k: "fin", label: "Fecha de Término Proyectada", v: proyecto.fin, type: "date" as const },
  ];

  const duracionDias = Math.round(
    (new Date(proyecto.fin).getTime() - new Date(proyecto.inicio).getTime()) / 86400000
  );

  return (
    <div className="space-y-3">
      <div className="bg-[#0B1D3A] border border-[#1E3A5F] rounded-xl p-3 md:p-5 shadow-[0_8px_32px_rgba(0,0,0,0.4)]">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
          <h2 className="text-[14px] font-bold flex items-center gap-2 text-[#E6F1FF]">
            <FileText size={16} className="text-[#D4A574]" />
            ITEM 1 PROYECTO FICHA TÉCNICA - Editable Acumulable Guardable Almacenado
          </h2>
          <span className="text-[10px] font-mono px-2 py-1 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
            Guardado ✓ Almacenado ✓ {lastSavedText}
          </span>
        </div>

        <ActionToolbar
          onNew={() =>
            setProyecto((prev) => ({
              ...prev,
              historial: [
                ...prev.historial,
                `Nuevo evento registrado ${new Date().toLocaleDateString()}`,
              ],
            }))
          }
          onDup={() => {}}
          onDel={() =>
            setProyecto((prev) => ({
              ...prev,
              historial: prev.historial.slice(0, -1),
            }))
          }
          onAcum={onAcumular}
          onSave={onSave}
          onStore={onSave}
          onImport={() => {}}
          onExport={onExport}
          onCalc={() => {}}
          onIA={onIA}
          count={13 + proyecto.historial.length}
          badge={storageStatus}
        />

        <div className="grid md:grid-cols-3 gap-3 mt-4">
          {fields.map((field) => (
            <div
              key={field.k}
              className="bg-[#020A1E] border border-[#1E3A5F] rounded-lg p-2.5 hover:border-[#1E3A5F]/80 transition-colors"
            >
              <div className="text-[10px] text-[#8AA0C0] uppercase tracking-wide font-medium">
                {field.label}
              </div>
              <div className="mt-0.5">
                <EditableField
                  value={field.v}
                  type={field.type}
                  onSave={(newVal) =>
                    setProyecto((prev) => ({
                      ...prev,
                      [field.k]: newVal,
                    }))
                  }
                />
              </div>
            </div>
          ))}
        </div>

        {/* Historial acumulable */}
        <div className="mt-4 bg-[#030A18] border border-[#1E3A5F] rounded-lg p-3">
          <div className="text-[11px] font-bold mb-2 flex items-center gap-2 text-[#E6F1FF]">
            <Clock3 size={12} className="text-[#D4A574]" />
            Historial Acumulable de Cambios y Ampliaciones de Plazo (Editable inline)
          </div>
          <div className="space-y-1">
            {proyecto.historial.map((item, idx) => (
              <div key={idx} className="flex items-center gap-2 text-[11px] font-mono">
                <span className="text-[#8AA0C0]">{idx + 1}.</span>
                <div className="flex-1">
                  <EditableField
                    value={item}
                    onSave={(val) => {
                      const updated = [...proyecto.historial];
                      updated[idx] = val;
                      setProyecto({ ...proyecto, historial: updated });
                    }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="mt-3 pt-2 border-t border-[#1E3A5F]/40 text-[10px] text-[#D4A574] font-mono flex flex-wrap justify-between">
            <span>
              Cálculo de Plazo: Duración acumulada {isNaN(duracionDias) ? 668 : duracionDias} días calendario vs Contractual {proyecto.plazoOrig}d.
            </span>
            <span>
              Ampliación neta: +{proyecto.plazoActual - proyecto.plazoOrig} días (RER 469-2025).
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
