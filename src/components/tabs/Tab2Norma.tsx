import React, { useState, useMemo } from "react";
import {
  Shield,
  Search,
  BookOpen,
  Filter,
  Scale,
  FileText,
  AlertTriangle,
  Clock,
  Coins,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Copy,
  Check,
  Building,
  Sparkles,
  ExternalLink,
  HelpCircle,
} from "lucide-react";
import { DS_038_2026_EF_DATA, NormaReglamentoArticulo } from "../../data/normaDS038";
import { NormaItem, StorageStatus } from "../../types";
import { EditableField } from "../EditableField";
import { ActionToolbar } from "../ActionToolbar";
import { playBeep } from "../../services/audio";

interface Tab2NormaProps {
  norma: NormaItem[];
  setNorma: React.Dispatch<React.SetStateAction<NormaItem[]>>;
  onSave: () => void;
  onExport: () => void;
  onIA: () => void;
  storageStatus: StorageStatus;
}

export const Tab2Norma: React.FC<Tab2NormaProps> = ({
  norma,
  setNorma,
  onSave,
  onExport,
  onIA,
  storageStatus,
}) => {
  // Navigation View: 'matriz' (checklist de cumplimiento) vs 'integro' (normativa completa para toma de decisiones)
  const [viewMode, setViewMode] = useState<"integro" | "matriz">("integro");

  // Filter & Search states for the full DS 038-2026-EF regulation
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [expandedArt, setExpandedArt] = useState<string | null>("Art. 140");
  const [copiedArt, setCopiedArt] = useState<string | null>(null);

  // Stats for the matrix
  const cumpleCount = norma.filter((i) => i.estado === "Cumple").length;
  const procesoCount = norma.filter((i) => i.estado === "En proceso").length;
  const noCumpleCount = norma.filter((i) => i.estado === "No Cumple").length;
  const pctCumplimiento = norma.length > 0 ? (cumpleCount / norma.length) * 100 : 0;

  // Filtered normative articles
  const filteredArticles = useMemo(() => {
    return DS_038_2026_EF_DATA.filter((item) => {
      const matchCategory =
        selectedCategory === "all" || item.categoria === selectedCategory;
      const term = searchTerm.toLowerCase();
      const matchSearch =
        item.numero.toLowerCase().includes(term) ||
        item.titulo.toLowerCase().includes(term) ||
        item.resumenClave.toLowerCase().includes(term) ||
        item.impactoDecision.toLowerCase().includes(term) ||
        item.textoCompleto.toLowerCase().includes(term) ||
        item.etiquetas.some((tag) => tag.toLowerCase().includes(term));
      return matchCategory && matchSearch;
    });
  }, [searchTerm, selectedCategory]);

  const handleCopyText = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedArt(id);
    playBeep(980, 0.08);
    setTimeout(() => setCopiedArt(null), 2000);
  };

  const handleAddNew = () => {
    setNorma((prev) => [
      ...prev,
      {
        id: `${Date.now()}`,
        art: "Art Nuevo",
        desc: "Descripción editable de la norma DS 038",
        estado: "En proceso",
        evidencia: "Por adjuntar documento de sustento",
        resp: "Residente",
        fecha: new Date().toISOString().slice(0, 10),
      },
    ]);
  };

  const handleDuplicate = () => {
    if (norma.length === 0) return;
    setNorma((prev) => [
      ...prev,
      { ...prev[prev.length - 1], id: `${Date.now()}` },
    ]);
  };

  const handleDelete = () => {
    setNorma((prev) => prev.slice(0, -1));
  };

  return (
    <div className="bg-[#0B1D3A] border border-[#1E3A5F] rounded-xl p-3 md:p-5 shadow-xl space-y-4">
      {/* Header with Title and View Switcher */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-[#1E3A5F] pb-3">
        <div>
          <h2 className="text-[15px] font-bold flex items-center gap-2 text-[#E6F1FF]">
            <Shield size={18} className="text-[#FF6B00]" />
            REGLAMENTO DE LA LEY N° 29230 (D.S. N° 038-2026-EF)
          </h2>
          <p className="text-[11px] font-mono text-[#8AA0C0] mt-0.5">
            Publicado en El Peruano el 13 de marzo de 2026 • 209 Artículos, 5 Títulos, 13 Disposiciones Complementarias
          </p>
        </div>

        {/* View Switcher Toggle */}
        <div className="flex items-center gap-1.5 bg-[#020A1E] border border-[#1E3A5F] p-1 rounded-xl shrink-0">
          <button
            onClick={() => setViewMode("integro")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all ${
              viewMode === "integro"
                ? "bg-[#FEF3C7] text-[#1F1B18] shadow-md"
                : "text-[#8AA0C0] hover:text-[#E6F1FF]"
            }`}
          >
            <BookOpen size={13} />
            <span>Íntegro Normativo & Decisiones</span>
            <span className="px-1.5 py-0.2 rounded-full bg-[#1F1B18]/10 text-[9px] font-mono">
              {DS_038_2026_EF_DATA.length}
            </span>
          </button>

          <button
            onClick={() => setViewMode("matriz")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all ${
              viewMode === "matriz"
                ? "bg-[#FEF3C7] text-[#1F1B18] shadow-md"
                : "text-[#8AA0C0] hover:text-[#E6F1FF]"
            }`}
          >
            <CheckCircle2 size={13} />
            <span>Matriz de Cumplimiento (64 Arts)</span>
            <span className="px-1.5 py-0.2 rounded-full bg-[#1F1B18]/10 text-[9px] font-mono">
              {norma.length}
            </span>
          </button>
        </div>
      </div>

      {/* VIEW MODE 1: ÍNTEGRO NORMATIVO PARA TOMA DE DECISIONES */}
      {viewMode === "integro" && (
        <div className="space-y-4">
          {/* Decision-Making Quick Guidance Banner */}
          <div className="bg-gradient-to-r from-[#0F2746] via-[#0B1D3A] to-[#1A2E05] border border-[#D4A574]/40 rounded-xl p-3.5 shadow-lg">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#D4A574]/20 border border-[#D4A574]/50 flex items-center justify-center shrink-0 text-[#FEF3C7]">
                <Scale size={20} />
              </div>
              <div className="text-[11px] space-y-1">
                <div className="font-bold text-[#FEF3C7] flex items-center gap-1.5 text-[12px]">
                  <span>Módulo de Soporte Jurídico para la Toma de Decisiones en Obra</span>
                  <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[9px] font-mono">
                    D.S. 038-2026-EF VIGENTE
                  </span>
                </div>
                <p className="text-[#E6F1FF]/90 leading-relaxed font-sans">
                  Contiene el articulado íntegro y sistemático del nuevo reglamento de Obras por Impuestos para fundamentar
                  <strong> suspensiones de plazo</strong> (Art. 128), <strong>ampliaciones de plazo</strong> (Art. 140),
                  <strong> deslinde de penalidades</strong> (Art. 135.7), <strong>valorizaciones y mayores metrados</strong> (Art. 139),
                  <strong> emisión directa de CIPRL por el MEF</strong> (Art. 180) y <strong>solución de controversias por trato directo vinculante</strong> (Art. 187).
                </p>
                <div className="flex flex-wrap gap-2 pt-1">
                  <span className="inline-flex items-center gap-1 text-[10px] font-mono text-[#D4A574] bg-[#020A1E] px-2 py-0.5 rounded border border-[#1E3A5F]">
                    ⚖️ Art. 96: Terreno exclusivo de Entidad
                  </span>
                  <span className="inline-flex items-center gap-1 text-[10px] font-mono text-emerald-400 bg-[#020A1E] px-2 py-0.5 rounded border border-[#1E3A5F]">
                    🛡️ Art. 135.7: Inexigibilidad de penalidad por causa no imputable
                  </span>
                  <span className="inline-flex items-center gap-1 text-[10px] font-mono text-amber-300 bg-[#020A1E] px-2 py-0.5 rounded border border-[#1E3A5F]">
                    ⏳ Art. 140: Silencio positivo en 10d
                  </span>
                  <span className="inline-flex items-center gap-1 text-[10px] font-mono text-blue-300 bg-[#020A1E] px-2 py-0.5 rounded border border-[#1E3A5F]">
                    📜 Art. 187: Trato directo con efecto de transacción
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Search and Category Filter Bar */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
            {/* Search Input */}
            <div className="md:col-span-2 relative">
              <Search size={15} className="absolute left-3 top-2.5 text-[#8AA0C0]" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar por artículo, título o materia (ej: '140', 'penalidad', 'terreno', 'CIPRL', 'cuaderno')..."
                className="w-full bg-[#020A1E] border border-[#1E3A5F] rounded-xl pl-9 pr-3 py-2 text-[11px] font-mono text-[#E6F1FF] placeholder-[#8AA0C0]/50 outline-none focus:border-[#FF6B00] transition-colors"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm("")}
                  className="absolute right-3 top-2 text-[10px] text-[#8AA0C0] hover:text-[#E6F1FF] font-mono"
                >
                  Limpiar
                </button>
              )}
            </div>

            {/* Category Select */}
            <div className="relative">
              <Filter size={14} className="absolute left-3 top-2.5 text-[#8AA0C0]" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full bg-[#020A1E] border border-[#1E3A5F] rounded-xl pl-8 pr-3 py-2 text-[11px] font-mono text-[#E6F1FF] outline-none focus:border-[#FF6B00] transition-colors cursor-pointer"
              >
                <option value="all">Todas las Categorías ({DS_038_2026_EF_DATA.length})</option>
                <option value="principios">Título Preliminar & Principios</option>
                <option value="institucional">Marco Institucional (MEF, Proinversión, CGR)</option>
                <option value="ejecucion">Ejecución, Plazos & Penalidades</option>
                <option value="financiamiento">Financiamiento & Valorizaciones</option>
                <option value="ciprl">Títulos CIPRL & Emisión MEF</option>
                <option value="controversias">Trato Directo & Controversias</option>
                <option value="especiales">Disposiciones Complementarias</option>
              </select>
            </div>
          </div>

          {/* Quick Filter Chips */}
          <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {[
              { label: "Todo", cat: "all" },
              { label: "⏳ Art. 140 Ampliaciones", query: "140" },
              { label: "💰 Art. 135 Penalidades", query: "135" },
              { label: "🚧 Art. 96 Terrenos", query: "96" },
              { label: "⏸️ Art. 128 Suspensión", query: "128" },
              { label: "📊 Art. 139 Valorizaciones", query: "139" },
              { label: "🏦 Art. 180 Emisión MEF", query: "180" },
              { label: "🤝 Art. 187 Trato Directo", query: "187" },
              { label: "📝 Cuaderno de Incidencias", query: "cuaderno" },
            ].map((chip, idx) => (
              <button
                key={idx}
                onClick={() => {
                  if (chip.cat) {
                    setSelectedCategory(chip.cat);
                    setSearchTerm("");
                  } else if (chip.query) {
                    setSearchTerm(chip.query);
                  }
                }}
                className={`shrink-0 px-2.5 py-1 rounded-lg text-[10px] font-mono transition-all border ${
                  searchTerm === chip.query || (chip.cat && selectedCategory === chip.cat)
                    ? "bg-[#D4A574] text-[#1F1B18] font-bold border-[#D4A574]"
                    : "bg-[#020A1E] text-[#8AA0C0] hover:text-[#E6F1FF] border-[#1E3A5F]"
                }`}
              >
                {chip.label}
              </button>
            ))}
          </div>

          {/* Articles Stream */}
          <div className="space-y-3">
            {filteredArticles.length === 0 ? (
              <div className="text-center py-10 bg-[#020A1E] rounded-xl border border-[#1E3A5F]">
                <HelpCircle size={28} className="mx-auto text-[#8AA0C0] mb-2" />
                <div className="text-[#E6F1FF] font-bold text-[13px]">
                  No se encontraron artículos con el criterio de búsqueda
                </div>
                <div className="text-[#8AA0C0] text-[11px] font-mono mt-1">
                  Intenta buscar por número de artículo (ej. '140') o palabra clave ('penalidad', 'terreno').
                </div>
              </div>
            ) : (
              filteredArticles.map((art) => {
                const isExpanded = expandedArt === art.numero;

                return (
                  <div
                    key={art.numero}
                    className={`rounded-xl border transition-all duration-200 overflow-hidden ${
                      isExpanded
                        ? "bg-[#020A1E] border-[#D4A574] shadow-lg ring-1 ring-[#D4A574]/30"
                        : "bg-[#020A1E]/80 border-[#1E3A5F] hover:border-[#8AA0C0]/50"
                    }`}
                  >
                    {/* Header Row */}
                    <div
                      onClick={() => setExpandedArt(isExpanded ? null : art.numero)}
                      className="p-3.5 flex items-start justify-between gap-3 cursor-pointer select-none"
                    >
                      <div className="flex items-start gap-3 min-w-0">
                        <div className="px-2.5 py-1 rounded-lg bg-gradient-to-br from-[#7B1C1C] to-[#FF6B00] text-white font-mono font-bold text-[11px] shrink-0 shadow-inner">
                          {art.numero}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="text-[13px] font-bold text-[#E6F1FF] truncate">
                              {art.titulo}
                            </h3>
                            <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-[#1E3A5F]/60 text-[#8AA0C0]">
                              {art.capitulo}
                            </span>
                          </div>
                          <p className="text-[11px] text-[#8AA0C0] mt-1 font-sans line-clamp-2">
                            {art.resumenClave}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCopyText(art.numero, `${art.numero} ${art.titulo}\n\n${art.textoCompleto}\n\n[Impacto en Decisión]: ${art.impactoDecision}`);
                          }}
                          className="w-7 h-7 rounded-lg border border-[#1E3A5F] bg-[#030A18] text-[#8AA0C0] hover:text-[#E6F1FF] flex items-center justify-center transition-colors"
                          title="Copiar contenido de artículo"
                        >
                          {copiedArt === art.numero ? (
                            <Check size={13} className="text-emerald-400" />
                          ) : (
                            <Copy size={13} />
                          )}
                        </button>
                        <div className="w-7 h-7 rounded-lg border border-[#1E3A5F] bg-[#030A18] text-[#8AA0C0] flex items-center justify-center">
                          {isExpanded ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
                        </div>
                      </div>
                    </div>

                    {/* Expanded Detail View */}
                    {isExpanded && (
                      <div className="p-4 border-t border-[#1E3A5F] bg-[#030A18]/60 space-y-3 font-[Inter]">
                        {/* Impacto en Toma de Decisiones Box */}
                        <div className="bg-gradient-to-r from-[#1A2E05] to-[#020A1E] border-l-4 border-emerald-400 p-3 rounded-r-xl">
                          <div className="text-[11px] font-bold font-mono text-emerald-300 uppercase flex items-center gap-1.5 mb-1">
                            <Sparkles size={13} />
                            <span>Aplicación Práctica para la Toma de Decisiones en Obra:</span>
                          </div>
                          <p className="text-[11px] font-mono text-[#E6F1FF] leading-relaxed">
                            {art.impactoDecision}
                          </p>
                        </div>

                        {/* Texto Completo / Literal del Reglamento */}
                        <div className="bg-[#020A1E] border border-[#1E3A5F] rounded-xl p-3.5 space-y-1.5">
                          <div className="text-[10px] font-mono text-[#8AA0C0] uppercase flex items-center justify-between">
                            <span>Texto Reglamentario Oficial (D.S. 038-2026-EF):</span>
                            <span className="text-[9px] text-[#D4A574]">El Peruano 13/03/2026</span>
                          </div>
                          <div className="text-[11px] font-mono text-[#E6F1FF] leading-relaxed whitespace-pre-wrap select-text">
                            {art.textoCompleto}
                          </div>
                        </div>

                        {/* Tags and Metadata Footer */}
                        <div className="flex items-center justify-between flex-wrap gap-2 pt-1 text-[10px] font-mono text-[#8AA0C0]">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-[#8AA0C0]">Etiquetas:</span>
                            {art.etiquetas.map((t, i) => (
                              <span
                                key={i}
                                className="px-2 py-0.5 rounded bg-[#0B1D3A] border border-[#1E3A5F] text-[#D4A574]"
                              >
                                #{t}
                              </span>
                            ))}
                          </div>
                          <button
                            onClick={() =>
                              handleCopyText(
                                `${art.numero}-full`,
                                `DECRETO SUPREMO N° 038-2026-EF (REGLAMENTO LEY N° 29230)\n${art.numero} - ${art.titulo}\n\n${art.textoCompleto}\n\nSUSTENTO DE DECISIÓN:\n${art.impactoDecision}`
                              )
                            }
                            className="text-[#FEF3C7] hover:underline flex items-center gap-1"
                          >
                            <Copy size={11} />
                            <span>Copiar con encabezado formal para Asiento/Carta</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* VIEW MODE 2: MATRIZ DE CUMPLIMIENTO (64 ARTÍCULOS VINCULADOS A CONTRATO) */}
      {viewMode === "matriz" && (
        <div className="space-y-4">
          <ActionToolbar
            onNew={handleAddNew}
            onDup={handleDuplicate}
            onDel={handleDelete}
            onAcum={() => {}}
            onSave={onSave}
            onStore={onSave}
            onImport={() => {}}
            onExport={onExport}
            onCalc={() => {}}
            onIA={onIA}
            count={norma.length}
            badge={storageStatus}
          />

          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            <div className="bg-[#020A1E] border border-[#1E3A5F] rounded-lg p-2 text-center">
              <div className="text-[10px] text-[#8AA0C0]">Cumplimiento Acumulado</div>
              <div className="text-[18px] font-bold font-mono text-emerald-300">
                {pctCumplimiento.toFixed(1)}%
              </div>
            </div>
            <div className="bg-[#020A1E] border border-[#1E3A5F] rounded-lg p-2 text-center">
              <div className="text-[10px] text-[#8AA0C0]">Cumple (Verde)</div>
              <div className="text-[16px] font-bold text-emerald-400 font-mono">
                {cumpleCount}
              </div>
            </div>
            <div className="bg-[#020A1E] border border-[#1E3A5F] rounded-lg p-2 text-center">
              <div className="text-[10px] text-[#8AA0C0]">En proceso (Ámbar)</div>
              <div className="text-[16px] font-bold text-amber-300 font-mono">
                {procesoCount}
              </div>
            </div>
            <div className="bg-[#020A1E] border border-red-500/30 rounded-lg p-2 text-center">
              <div className="text-[10px] text-red-300">No Cumple (Crítico)</div>
              <div className="text-[16px] font-bold text-red-400 font-mono">
                {noCumpleCount}
              </div>
            </div>
          </div>

          <div className="overflow-auto rounded-lg border border-[#1E3A5F]">
            <table className="w-full text-[11px] font-mono">
              <thead className="bg-[#030A18] text-[#8AA0C0] text-[10px] uppercase">
                <tr>
                  <th className="p-2 text-left">Artículo</th>
                  <th className="p-2 text-left">Descripción Obligación</th>
                  <th className="p-2 text-center">Estado</th>
                  <th className="p-2 text-left">Evidencia Documental</th>
                  <th className="p-2 text-center">Responsable</th>
                  <th className="p-2 text-center">Fecha Límite</th>
                </tr>
              </thead>
              <tbody>
                {norma.map((row) => (
                  <tr
                    key={row.id}
                    className="border-t border-[#1E3A5F]/50 hover:bg-[#13274F]/40 transition-colors"
                  >
                    <td className="p-1 min-w-[90px]">
                      <EditableField
                        value={row.art}
                        onSave={(val) =>
                          setNorma((prev) =>
                            prev.map((item) =>
                              item.id === row.id ? { ...item, art: val } : item
                            )
                          )
                        }
                      />
                    </td>
                    <td className="p-1 min-w-[220px]">
                      <EditableField
                        value={row.desc}
                        onSave={(val) =>
                          setNorma((prev) =>
                            prev.map((item) =>
                              item.id === row.id ? { ...item, desc: val } : item
                            )
                          )
                        }
                      />
                    </td>
                    <td className="p-1 min-w-[110px] text-center">
                      <EditableField
                        value={row.estado}
                        type="select"
                        options={["Cumple", "No Cumple", "En proceso"]}
                        onSave={(val) =>
                          setNorma((prev) =>
                            prev.map((item) =>
                              item.id === row.id ? { ...item, estado: val } : item
                            )
                          )
                        }
                      />
                    </td>
                    <td className="p-1 min-w-[200px]">
                      <EditableField
                        value={row.evidencia}
                        onSave={(val) =>
                          setNorma((prev) =>
                            prev.map((item) =>
                              item.id === row.id ? { ...item, evidencia: val } : item
                            )
                          )
                        }
                      />
                    </td>
                    <td className="p-1 min-w-[100px] text-center">
                      <EditableField
                        value={row.resp}
                        onSave={(val) =>
                          setNorma((prev) =>
                            prev.map((item) =>
                              item.id === row.id ? { ...item, resp: val } : item
                            )
                          )
                        }
                      />
                    </td>
                    <td className="p-1 min-w-[100px] text-center">
                      <EditableField
                        value={row.fecha}
                        type="date"
                        onSave={(val) =>
                          setNorma((prev) =>
                            prev.map((item) =>
                              item.id === row.id ? { ...item, fecha: val } : item
                            )
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
