import { useState, useEffect, useRef, useMemo } from "react";
import {
  FileText,
  Shield,
  Layers,
  Database,
  ChartColumn,
  Activity,
  Clock,
  Calendar,
  Target,
  Gauge,
  OctagonAlert,
  Brain,
  HardHat,
  Save,
  Calculator,
  Dices,
} from "lucide-react";

import {
  ProyectoInfo,
  NormaItem,
  ProcesoItem,
  SIPOCData,
  SQLSheet,
  ValorizacionRow,
  MetradoDiarioRow,
  CuadrillaItem,
  ActividadCPM,
  RestriccionItem,
  RiesgoItem,
  EscenarioItem,
  StorageStatus,
} from "./types";

import { STORAGE_KEY, DB_NAME, DB_STORES, saveRecord, getAllRecords } from "./services/db";
import { playBeep, playAlarmSound } from "./services/audio";
import { Header } from "./components/Header";
import { AIModal } from "./components/AIModal";
import { CriticalAlertModal } from "./components/CriticalAlertModal";
import { ChatBox } from "./components/ChatBox";
import { AudioChatModal } from "./components/AudioChatModal";
import { DashboardSummaryEVM } from "./components/DashboardSummaryEVM";
import { QuickIndicatorsPanel } from "./components/QuickIndicatorsPanel";
import {
  PARTIDAS_VALORIZACION_17,
  VALORIZACION_17_TOTALES,
} from "./data/valorizacion17Data";
import {
  ACTIVIDADES_CRONOGRAMA_668,
  CRONOGRAMA_METADATA,
} from "./data/cronograma668Data";

// Modular Tabs
import { Tab1Proyecto } from "./components/tabs/Tab1Proyecto";
import { Tab2Norma } from "./components/tabs/Tab2Norma";
import { Tab3Procesos } from "./components/tabs/Tab3Procesos";
import { Tab4SQL } from "./components/tabs/Tab4SQL";
import { Tab5Valorizacion } from "./components/tabs/Tab5Valorizacion";
import { Tab6Metrados } from "./components/tabs/Tab6Metrados";
import { Tab7CPM } from "./components/tabs/Tab7CPM";
import { Tab8Lookahead } from "./components/tabs/Tab8Lookahead";
import { Tab9Trenes } from "./components/tabs/Tab9Trenes";
import { Tab10Productividad } from "./components/tabs/Tab10Productividad";
import { Tab11Riesgos } from "./components/tabs/Tab11Riesgos";
import { Tab12Escenarios } from "./components/tabs/Tab12Escenarios";
import { Tab13Simulacion } from "./components/tabs/Tab13Simulacion";

export default function App() {
  const [activeTab, setActiveTab] = useState<number>(1);
  const [storageStatus, setStorageStatus] = useState<StorageStatus>("no");
  const [lastSavedText, setLastSavedText] = useState<string>("—");
  const [totalRecords, setTotalRecords] = useState<number>(0);
  const [tabSelectionMsg, setTabSelectionMsg] = useState<string>("Item 1 FICHA seleccionado");

  // Critical Alert Modal State
  const [alertOpen, setAlertOpen] = useState(false);
  const [alertInfo, setAlertInfo] = useState({ title: "", msg: "", item: "5" });

  // AI Modal State
  const [aiModal, setAiModal] = useState({ open: false, title: "", text: "" });

  // Chatbox State
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isAudioChatOpen, setIsAudioChatOpen] = useState(false);

  const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null);

  // 1. Proyecto State
  const [proyecto, setProyecto] = useState<ProyectoInfo>({
    cui: "2264872",
    nombre:
      "CREACIÓN DE LA CICLOVÍA COMPRENDIDO ENTRE EL TRAMO AV. CUTERVO Y LA AV. HUACACHINA DEL DISTRITO DE ICA - ICA",
    cliente: "GOBIERNO REGIONAL DE ICA",
    contratista: "CONSORCIO LOS FLAMENCOS",
    supervision: "ING. ALAIN OMAR ROSAS LEON CIP: 47851",
    jefe: "ING. ALAIN OMAR ROSAS LEON CIP: 47851",
    residente: "ING. JOSÉ LUIS PAYSIS VELASQUÉZ CIP: 101507",
    presupuestoConIGV: 44204437.93,
    presupuestoSinIGV: 37461388.08,
    plazoOrig: 668,
    plazoActual: 668,
    inicio: "2025-04-26",
    fin: "2027-02-22",
    montoContratado: 44204437.93,
    historial: [
      "26/04/2025 Inicio contractual de plazo de ejecución (668 días calendario)",
      "11/03/2025 Suspensión temporal por no disponibilidad de terreno Club Social",
      "11/09/2026 Programación PA actualizada: 668 días, Hito Fin Proyectado 22/02/2027",
      "31/08/2026 Valorización N° 17: Avance Acumulado 53.65% (S/ 20,095,675.69) vs Programado 85.08% (Atraso -31.43%)",
    ],
  });

  // 2. Norma DS 038 State
  const [norma, setNorma] = useState<NormaItem[]>([
    { id: "1", art: "Art 19", desc: "Expediente técnico de obra", estado: "Cumple", evidencia: "ET aprobado RER 012-25", resp: "GORE ICA", fecha: "2025-01-10" },
    { id: "2", art: "Art 20", desc: "Disponibilidad de terreno", estado: "En proceso", evidencia: "Falta liberación Club Social Ica", resp: "Entidad", fecha: "2025-03-11" },
    { id: "3", art: "Art 83.3", desc: "Valorizaciones mensuales", estado: "Cumple", evidencia: "Val 17 presentada a tiempo", resp: "Contratista", fecha: "2025-10-31" },
    { id: "4", art: "Art 85", desc: "Suspensión de plazo de ejecución", estado: "Cumple", evidencia: "Acta de suspensión 11-03-25", resp: "Supervisión", fecha: "2025-03-11" },
    { id: "5", art: "Art 87", desc: "Ampliación de plazo por causal", estado: "En proceso", evidencia: "Carta 032 ampliación 45d", resp: "Residente", fecha: "2025-10-28" },
    { id: "6", art: "Art 96", desc: "Entrega de terreno parcial o total", estado: "No Cumple", evidencia: "Sector Club Social bloqueado 249d", resp: "Entidad", fecha: "2025-03-11" },
    { id: "7", art: "Art 132", desc: "Penalidades por mora", estado: "En proceso", evidencia: "Evaluación riesgo S/ 4.42M", resp: "Contratista", fecha: "2025-11-01" },
    { id: "8", art: "Art 135", desc: "Penalidad máxima 10% del contrato", estado: "En proceso", evidencia: "Avance 53.65% vs 85.08%", resp: "Jefe Proyecto", fecha: "2025-11-01" },
  ]);

  // 3. Procesos BPM & SIPOC State
  const [procesos, setProcesos] = useState<ProcesoItem[]>([
    { id: "P1", proceso: "Veredas concreto f'c=175 kg/cm2", tipo: "Operativo", desc: "Encofrado, vaciado, bruñado y curado", dueno: "Capataz C-03", kpi: "m2/día", eff: 68 },
    { id: "P2", proceso: "Sardineles peraltados", tipo: "Operativo", desc: "Excavación, encofrado y vaciado", dueno: "Capataz C-05", kpi: "ml/día", eff: 74 },
    { id: "P3", proceso: "Pavimento asfáltico ciclovía", tipo: "Operativo", desc: "Imprimación y carpeta asfáltica", dueno: "Subcontrata", kpi: "m2/día", eff: 55 },
    { id: "P4", proceso: "Gestión topográfica y niveles", tipo: "Soporte", desc: "Trazo, replanteo y cotas de rasante", dueno: "Topógrafo", kpi: "% precisión", eff: 92 },
  ]);

  const [sipoc, setSipoc] = useState<SIPOCData>({
    suppliers: "Cementos Inka, Agregados Ica, Aceros Arequipa",
    inputs: "Cemento Portland Tipo I, arena gruesa, piedra chancada, agua",
    process: "Trazo → Zanja → Base Granular → Encofrado → Vaciado → Bruñado → Curado",
    outputs: "Vereda peatonal concreto f'c=175 e=0.10m acabada",
    customers: "GORE ICA / Población urbana Huacachina",
  });

  // 4. SQL 51 Hojas State
  const [sheets, setSheets] = useState<SQLSheet[]>(() => {
    const arr: SQLSheet[] = [];
    for (let d = 0; d < 12; d++) {
      const rows = [];
      for (let y = 0; y < 15; y++) {
        rows.push({
          id: y + 1,
          codigo: `02.01.${String(d + 1).padStart(2, "0")}.${String(y + 1).padStart(2, "0")}`,
          descripcion: `Partida ${d + 1}-${y + 1} Veredas / Sardineles Ciclovía`,
          und: y % 2 === 0 ? "m2" : "ml",
          metrado: 120 + y * 12,
          pu: 45 + y * 3.5,
          parcial: (120 + y * 12) * (45 + y * 3.5),
        });
      }
      arr.push({ name: `Hoja_${d + 1}_Val17`, rows });
    }
    return arr;
  });
  const [activeSheetIndex, setActiveSheetIndex] = useState(0);
  const [sqlQuery, setSqlQuery] = useState(
    "SELECT codigo, descripcion, SUM(parcial) as total FROM Hoja_1 WHERE metrado > 100 GROUP BY codigo"
  );

  // 5. Valorización 17 Rows State (35 Partidas Oficiales del Cuadro Valorización N° 17)
  const [valRows, setValRows] = useState<ValorizacionRow[]>(PARTIDAS_VALORIZACION_17);

  // 6. Metrados Diarios & Cuadrillas State
  const [metrados, setMetrados] = useState<MetradoDiarioRow[]>(() =>
    Array.from({ length: 20 }, (_, d) => ({
      id: d + 1,
      base: 100 + d * 10,
      ejec: 53 + d * 5,
      acum: 1200 + d * 120,
      saldo: 800 - d * 20,
      frente: `Frente ${String.fromCharCode(65 + (d % 4))}`,
      fecha: `2025-10-${15 + (d % 15)}`,
    }))
  );

  const [cuadrillas, setCuadrillas] = useState<CuadrillaItem[]>([
    { id: "C-03", nombre: "Cuadrilla Veredas Elite", capataz: "M. Quispe", integ: 8, rendTeor: 15, rendReal: 12.5, hh: 64, costo: 18.5, sector: "S1-S2" },
    { id: "C-05", nombre: "Cuadrilla Sardineles", capataz: "J. Ramos", integ: 6, rendTeor: 18, rendReal: 14.8, hh: 48, costo: 18.5, sector: "S3" },
    { id: "C-07", nombre: "Cuadrilla Pavimentos", capataz: "L. Huamán", integ: 10, rendTeor: 20, rendReal: 16.2, hh: 80, costo: 19, sector: "S4-S5" },
  ]);

  // 7. CPM Actividades State (Cronograma Oficial PA 11/09/2026 - 668 Días)
  const [actividades, setActividades] = useState<ActividadCPM[]>(ACTIVIDADES_CRONOGRAMA_668);

  // 8. Lookahead Restricciones & Plan Semanal State
  const [restricciones, setRestricciones] = useState<RestriccionItem[]>([
    { id: "R-610", actividad: "Veredas S3 Club Social", tipo: "Terreno", estado: "NO", liberado: "No", fechaLib: "2025-11-15", responsable: "GORE ICA" },
    { id: "R-730", actividad: "Sardineles S4 Retamayo", tipo: "Interferencias", estado: "NO", liberado: "No", fechaLib: "2025-11-10", responsable: "EMAPICA" },
    { id: "R-774", actividad: "Pavimento S2", tipo: "Materiales", estado: "OK", liberado: "Si", fechaLib: "2025-10-30", responsable: "Logística" },
  ]);
  const [semanaData, setSemanaData] = useState<number[]>([85, 90, 95, 88, 92, 70, 0]);

  // 11. Riesgos State
  const [riesgos, setRiesgos] = useState<RiesgoItem[]>([
    { id: "RG-01", causa: "No entrega terreno Club Social CUI 2693747", inicio: "2025-03-11", fin: "2025-11-15", dias: 249, evidencia: "Asientos 610-801", norma: "Art 96 / Art 140", prob: 85, impacto: 90, nivel: "Crítico" },
    { id: "RG-02", causa: "Aniegos zona Retamayo interferencia saneamiento", inicio: "2025-08-12", fin: "2025-11-10", dias: 90, evidencia: "Carta 032 EMAPICA", norma: "Art 87", prob: 70, impacto: 75, nivel: "Alto" },
    { id: "RG-03", causa: "Atraso valorizaciones 16 tramitadas 09 pagadas", inicio: "2025-06-01", fin: "2025-11-01", dias: 153, evidencia: "Val 17 S/646k", norma: "Art 135-136", prob: 65, impacto: 80, nivel: "Alto" },
  ]);

  // 12. Escenarios State
  const [escenarios, setEscenarios] = useState<EscenarioItem[]>([
    { id: "E1", variable: "Incrementar cuadrilla T5 3→5", valor: "5 cuadrillas", impactoPlazo: "-15d", impactoCosto: "+S/ 12,000", riesgo: "-12%", roi: "ROI 3.2" },
    { id: "E2", variable: "Rendimiento 12.5→14.8 m2/día", valor: "14.8 m2", impactoPlazo: "-8d", impactoCosto: "+S/ 0", riesgo: "-5%", roi: "ROI 4.1" },
    { id: "E3", variable: "FS→SS lag -2 en veredas", valor: "SS-2", impactoPlazo: "-12d", impactoCosto: "+S/ 3,200", riesgo: "Media", roi: "ROI 2.8" },
  ]);
  const [numCuadrillas, setNumCuadrillas] = useState<number>(5);
  const [factorRendimiento, setFactorRendimiento] = useState<number>(1.5);
  const [pctTNC, setPctTNC] = useState<number>(35);

  // Computed EVM Metrics
  const metrics = useMemo(() => {
    const prog = 85.08;
    const ejec = 53.65;
    const atraso = ejec - prog; // -31.43%
    const spi = ejec / prog; // ~0.6306
    const cpi = 0.92;
    const bac = VALORIZACION_17_TOTALES.subtotal.presupuesto; // S/ 36,411,268.47
    const pv = bac * (prog / 100); // S/ 30,978,707.21
    const ev = bac * (ejec / 100); // S/ 19,534,645.53
    const ac = ev / cpi; // S/ 21,233,310.36
    const eac = bac / cpi; // S/ 39,577,465.73
    const vac = bac - eac; // -S/ 3,166,197.26

    return {
      prog,
      ejec,
      atraso,
      spi,
      cpi,
      bac,
      pv,
      ev,
      ac,
      eac,
      vac,
      ppc: 68,
      tp: 42,
      tc: 23,
      tnc: 35,
    };
  }, [proyecto.presupuestoConIGV]);

  // Initial Load from LocalStorage and IndexedDB
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.proyecto) setProyecto(parsed.proyecto);
        if (parsed.norma) setNorma(parsed.norma);
        if (parsed.valRows && parsed.valRows.length > 0 && parsed.valRows[0]?.metradoAnt !== undefined) {
          setValRows(parsed.valRows);
        } else {
          setValRows(PARTIDAS_VALORIZACION_17);
        }
        if (parsed.cpm && parsed.cpm.length > 0 && parsed.cpm[0]?.cod !== "A-01") {
          setActividades(parsed.cpm);
        } else {
          setActividades(ACTIVIDADES_CRONOGRAMA_668);
        }
        if (parsed.metrados) setMetrados(parsed.metrados);
        if (parsed.cuadrillas) setCuadrillas(parsed.cuadrillas);
        if (parsed.riesgos) setRiesgos(parsed.riesgos);
        if (parsed.escenarios) setEscenarios(parsed.escenarios);
        if (parsed.restricciones) setRestricciones(parsed.restricciones);

        setStorageStatus("guardado");
        setLastSavedText(new Date().toLocaleTimeString());
        setTotalRecords(
          (parsed.norma?.length || 0) +
            (parsed.valRows?.length || PARTIDAS_VALORIZACION_17.length) +
            (parsed.cpm?.length || ACTIVIDADES_CRONOGRAMA_668.length) +
            (parsed.metrados?.length || 0)
        );
      } catch (err) {
        console.warn("Could not parse saved storage", err);
      }
    } else {
      setStorageStatus("no");
    }

    getAllRecords("proyecto").then((records) => {
      if (records.length > 0) {
        setTotalRecords((prev) => prev + records.length);
      }
    });
  }, []);

  // Debounced auto-save listener
  useEffect(() => {
    if (storageStatus === "no") return;
    setStorageStatus("pendiente");

    if (autoSaveTimerRef.current) {
      clearTimeout(autoSaveTimerRef.current);
    }

    autoSaveTimerRef.current = setTimeout(() => {
      handleSaveAll(true);
    }, 800);

    return () => {
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current);
      }
    };
  }, [proyecto, norma, valRows, actividades, metrados, cuadrillas, riesgos, escenarios, restricciones]);

  // Master Save Function
  const handleSaveAll = async (isAuto = false) => {
    const dataToPersist = {
      proyecto,
      norma,
      valRows,
      cpm: actividades,
      metrados,
      cuadrillas,
      riesgos,
      escenarios,
      restricciones,
      timestamp: new Date().toISOString(),
      totalRegs:
        norma.length +
        valRows.length +
        actividades.length +
        metrados.length +
        cuadrillas.length +
        riesgos.length,
    };

    localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToPersist));

    try {
      await saveRecord("proyecto", { id: "proyecto_main", ...proyecto, ts: Date.now() });
      for (const row of valRows.slice(0, 20)) {
        await saveRecord("valorizaciones", { id: `val_${row.id}`, ...row });
      }
      for (const act of actividades) {
        await saveRecord("actividades", { id: act.cod, ...act });
      }
      for (const m of metrados.slice(0, 20)) {
        await saveRecord("metrados", { id: `met_${m.id}`, ...m });
      }
      for (const r of riesgos) {
        await saveRecord("riesgos", { id: r.id, ...r });
      }
    } catch (err) {
      console.warn("Error saving to IndexedDB:", err);
    }

    setStorageStatus("guardado");
    setLastSavedText(new Date().toLocaleTimeString());
    setTotalRecords(dataToPersist.totalRegs);

    if (!isAuto) {
      playBeep(880, 0.15);
    }

    // Critical check: if SPI < 0.70, trigger alert popup
    if (metrics.spi < 0.7) {
      setAlertInfo({
        title: `ALERTA CRÍTICA ITEM 5 - SPI ${metrics.spi.toFixed(2)}`,
        msg: `SPI ${metrics.spi.toFixed(2)} < 0.70 indica atraso crítico de ${metrics.atraso.toFixed(2)}%. La ruta crítica se encuentra comprometida en el Sector S3 por interferencias no resueltas. Acción recomendada: Implementar Crash Cost + Ampliación Art 140 por 45 días.`,
        item: "5",
      });
      if (!isAuto) {
        playAlarmSound();
        setAlertOpen(true);
      }
    }
  };

  // Acumular Function
  const handleAcumularAll = () => {
    setValRows((prev) =>
      prev.map((r) => ({
        ...r,
        acum: r.acum + 2,
        saldo: Math.max(0, r.saldo - 2),
        avance: Math.min(100, r.avance + 0.5),
      }))
    );
    setMetrados((prev) =>
      prev.map((m) => ({
        ...m,
        acum: m.acum + 10,
        saldo: Math.max(0, m.saldo - 10),
      }))
    );
    setActividades((prev) =>
      prev.map((a) => ({
        ...a,
        avance: Math.min(100, a.avance + 2),
      }))
    );
    handleSaveAll();
  };

  // Export CSV Function
  const handleExportCSV = () => {
    const csvContent =
      "Codigo,Descripcion,Metrado,PU,Parcial,Acumulado,Saldo,Avance,Sector\n" +
      valRows
        .map((r) =>
          [
            r.codigo,
            `"${r.desc}"`,
            r.metrado,
            r.pu,
            r.parcial,
            r.acum,
            r.saldo,
            r.avance,
            r.sector,
          ].join(",")
        )
        .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `valorizacion_17_cutervo_huacachina_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // AI Reports Database
  const triggerAIAnalysis = (tabId: number) => {
    const reports: Record<number, string> = {
      1: `ANÁLISIS INTELIGENTE ITEM 1 - PROYECTO FICHA TÉCNICA:
CUI 2264872 "CREACIÓN CICLOVIA CUTERVO-HUACACHINA" validado.
• Plazo contractual inicial: 540 días.
• Plazo vigente ampliado: 668 días según RER 469-2025, justificado por interferencias de saneamiento (CUI 2693747) y falta de disponibilidad de terreno en sector Club Social Ica.
• Presupuesto total: S/ 44,204,437.93 con IGV (S/ 37,461,388.08 sin IGV).
• Dirección técnica: Residente de Obra ING. JOSE LUIS PAYSIS VELASQUEZ CIP 101507.
Recomendación estratégica: Formalizar actualización de línea base en cronograma maestro y reprogramar trenes de trabajo en sectores S3-S4 para mitigar el riesgo de penalidad contractual según Art 135 (hasta S/ 4.42M).`,

      2: `ANÁLISIS INTELIGENTE ITEM 2 - NORMATIVA LEY 29230 / DS 038-2026-EF:
Evaluación de cumplimiento de 64 artículos: 50% de cumplimiento inicial (4 de 8 monitoreados).
• Art 96 (Entrega de terreno): NO CUMPLE. Terreno Club Social bloquea sector S3 desde 11-03-25 (249 días acumulados).
• Art 85 (Suspensión de plazo): CUMPLE. Acta de suspensión formal suscrita válidamente.
• Art 135 (Penalidad máxima 10%): EN EVALUACIÓN. Atraso actual del -31.43% (53.65% vs 85.08%) activa causal de apercibimiento si no se sustenta la ampliación de plazo.
Acción prioritaria: Asentar en cuaderno de obra el Asiento 802 y presentar Carta de Solicitud de Ampliación de Plazo según Art 140 por 45 días calendario, adjuntando informe de ruta crítica y peritaje de interferencias.`,

      3: `ANÁLISIS INTELIGENTE ITEM 3 - GESTIÓN DE PROCESOS BPM & SIPOC:
Eficiencia operativa promedio: 72.3%.
• Veredas de concreto f'c=175 kg/cm2 registra 68% de eficiencia por esperas en abastecimiento y retiro de desmonte.
• SIPOC Veredas: Cuello de botella detectado en la fase de "Vaciado → Acabado" debido a variabilidad en la llegada del concreto premezclado.
• Solución A3 Lean: Implementar sistema Kanban de reposición en patio de acopio y nivelación Heijunka con Takt Time de 2 días. Reducción estimada de desperdicios: 18% en tiempos muertos.`,

      4: `ANÁLISIS INTELIGENTE ITEM 4 - MOTOR SQL Y 51 HOJAS DE METRADOS:
Procesamiento de 8,211 registros vinculados a la Valorización N° 17.
• Consulta ejecutada con éxito sobre Hoja_1_Val17.
• Total metrado verificado: 1,890.00 m2 con un P.U. promedio de S/ 48.50.
• Consistencia metrado vs presupuesto base: 99.8% de correspondencia sin discrepancias aritméticas.
Recomendación: Automatizar exportación de partidas con avance menor al 50% para focalizar recursos de cuadrillas.`,

      5: `ANÁLISIS INTELIGENTE ITEM 5 - VALORIZACIÓN 17 & CURVA S EVM:
• Monto actual del mes 17: S/ 646,823.27 sin IGV.
• Acumulado ejecutado: S/ 20,095,675.69 (53.65%).
• Saldo financiero por ejecutar: S/ 16,315,592.78.
• Programado acumulado: 85.08% | ATRASO CRÍTICO: -31.43%.
Métricas de Valor Ganado:
- PV: S/ 37.61M | EV: S/ 23.72M | AC: S/ 25.78M
- SPI: 0.63 (Crítico < 0.70) | CPI: 0.92 (Desviación moderada)
- EAC: S/ 48.05M | VAC: -S/ 3.84M | TCPI: 0.88
Recomendación: Aplicar Crash Cost incorporando 2 cuadrillas adicionales de veredas y negociar Fast-Track con relación SS-2 para comprimir 15 días de la ruta crítica.`,

      6: `ANÁLISIS INTELIGENTE ITEM 6 - METRADOS & CARTA BALANCE 15 MIN:
Auditoría de 384 observaciones:
• Trabajo Productivo (TP): 42% (Meta Lean: ≥ 60%) → Brecha: -18%.
• Trabajo Contributorio (TC): 23%.
• Trabajo No Contributorio (TNC): 35% (Meta Lean: ≤ 25%) → Exceso: +10%.
Causas raíz del TNC: Esperas por interferencias no liberadas (42%) y transporte excesivo de agregados (31%).
Rendimiento de Cuadrilla C-03: 12.5 m2/día vs 15.0 m2/día teórico.
Recomendación: Reorganizar el frente con 5S y abastecer insumos antes del inicio de jornada (6:30 AM).`,

      7: `ANÁLISIS INTELIGENTE ITEM 7 - CRONOGRAMA MAESTRO CPM 668D:
• 4 de 7 macro-actividades se encuentran en Ruta Crítica con Holgura = 0:
  A-01 (Trazo) → A-02 (Excavación) → A-04 (Encofrado) → A-05 (Vaciado) → A-07 (Pavimento asfáltico).
• Actividad con mayor riesgo: A-07 Pavimento asfáltico (35 días) por superposición con obras de agua potable en Retamayo.
Simulación Monte Carlo: P50 = 695 días, P80 = 720 días. La probabilidad de culminación dentro de los 668 días es del 32% sin medidas de contingencia.`,

      8: `ANÁLISIS INTELIGENTE ITEM 8 - LAST PLANNER SYSTEM & LOOKAHEAD:
• PPC Semanal: 68% (Meta: ≥ 85%).
• PCR (Porcentaje de Causas de No Cumplimiento): 71.4%.
• Restricciones críticas activas: R-610 (Club Social) y R-730 (Interferencia Retamayo).
Acción preventiva: Elevar al nivel 3 de liberación ITE las cartas notariales de liberación de interferencias para EMAPICA y GORE ICA.`,

      11: `ANÁLISIS INTELIGENTE ITEM 11 - RIESGOS & RESTRICTIONS A3:
Matriz de Riesgos Priorizada:
• RG-01 (Club Social CUI 2693747): Severidad 76.5 (Crítico). 249 días de afectación. Causal tipificada en Art 96 y Art 140.
• RG-02 (Retamayo): Severidad 52.5 (Alto). 90 días de aniegos.
• RG-03 (Liquidez por valorizaciones pendientes): Severidad 52.0 (Alto).
Matriz de Evidencia:
- HECHO VERIFICADO: Terreno no entregado formalmente el 11-03-25.
- INFERENCIA: Desfase del 31.43% es atribuible a la Entidad.
- RECOMENDACIÓN: Generar Asiento 802 y presentar Carta de Ampliación de Plazo con peritaje técnico independiente.`,

      12: `ANÁLISIS INTELIGENTE ITEM 12 - SIMULACIÓN DE ESCENARIOS "¿QUÉ PASA SI...?":
Escenario Óptimo recomendado por Algoritmo de Decisión Multicriterio:
1. Incrementar cuadrillas de vaciado de 3 a 5 (+2 cuadrillas élite): Acelera 15 días con costo marginal de S/ 12,000 (ROI: 3.2).
2. Optimizar relaciones de precedencia a SS con Lag de -2 días en encofrado y vaciado: Reduce 12 días sin costo adicional.
3. Formular ampliación de plazo Art 140 por 45 días: Neutraliza totalmente el riesgo de penalidad por mora de S/ 4,420,443.79 (Art 135).
Resultado global: Obra culmina en plazo reprogramado y con balance financiero protegido.`,

      13: `ANÁLISIS INTELIGENTE ITEM 13 - MODELO MONTE CARLO (PERT ESTOCÁSTICO):
Dictamen Probabilístico sobre el Plazo de 668 Días (Ciclovía Cutervo-Huacachina):
1. Probabilidad de Cumplimiento Contractual: ~31.8% sin medidas de mitigación.
2. Mediana P50 (Plazo más probable): 702 días (+34 días sobre el límite de 668d).
3. Nivel de Gestión P80: 726 días calendario (+58 días de contingencia requerida).
4. Causal Crítica: La interferencia de 249 días en el Club Social CUI 2693747 agota la holgura de los frentes S3-S4.
5. Recomendación Pericial: Tramitar de inmediato la Ampliación de Plazo Art 140 (D.S. 038-2026-EF) por 45 días e implementar fast-tracking en encofrado/vaciado con doble turno.`,
    };

    const report =
      reports[tabId] ||
      `ANÁLISIS INTELIGENTE ITEM ${tabId}:
Evaluación completada sobre los datos almacenados de la Ciclovía Cutervo-Huacachina.
• Desempeño: SPI ${metrics.spi.toFixed(2)}, PPC ${metrics.ppc}%, TP ${metrics.tp}%.
• Conclusión: Mantener control riguroso de frentes y ejecutar protocolos de aseguramiento de calidad según Ley 29230.`;

    setAiModal({
      open: true,
      title: `IA Analiza Item ${tabId}`,
      text: report,
    });
  };

  const navItems = [
    { id: 1, label: "1 FICHA", icon: FileText },
    { id: 2, label: "2 NORMA 64 Arts", icon: Shield },
    { id: 3, label: "3 PROCESOS BPM", icon: Layers },
    { id: 4, label: "4 SQL 51 Hojas", icon: Database },
    { id: 5, label: "5 VAL 17 EVM", icon: ChartColumn },
    { id: 6, label: "6 METRADOS 8211", icon: Activity },
    { id: 7, label: "7 CPM 668d", icon: Clock },
    { id: 8, label: "8 LOOKAHEAD LPS", icon: Calendar },
    { id: 9, label: "9 TRENES 5S", icon: Target },
    { id: 10, label: "10 PROD EVM VDC", icon: Gauge },
    { id: 11, label: "11 RIESGOS", icon: OctagonAlert },
    { id: 12, label: "12 ESCENARIOS IA", icon: Brain },
    { id: 13, label: "13 SIMULACIÓN MC", icon: Dices },
  ];

  return (
    <div className="min-h-screen bg-[#020A1E] text-[#E6F1FF] font-[Inter] relative overflow-hidden flex flex-col justify-between">
      {/* Background Decor */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_#0A1931_0%,_#020A1E_60%,_#0F1E3D_100%)]" />
        <div className="absolute inset-0 bg-[#020A1E]/90" />
      </div>

      {/* Main Top Header */}
      <Header
        storageStatus={storageStatus}
        totalRecords={totalRecords}
        lastSavedText={lastSavedText}
        metrics={metrics}
        storageKey={STORAGE_KEY}
        dbName={DB_NAME}
        onOpenChat={() => setIsChatOpen((prev) => !prev)}
        onOpenAudioChat={() => setIsAudioChatOpen((prev) => !prev)}
      />

      {/* Navigation Subheader */}
      <div className="relative z-10 max-w-[1600px] w-full mx-auto px-2 md:px-6 mt-3">
        <div className="flex flex-col gap-2">
          <div className="text-[10px] font-mono text-[#8AA0C0] px-1 flex justify-between">
            <span>
              {tabSelectionMsg} • {totalRecords} registros en memoria • Clic guarda estado
            </span>
            <span className="text-[#D4A574]">
              {DB_STORES.length} almacenes IndexedDB activos
            </span>
          </div>

          <div className="flex gap-1.5 overflow-x-auto pb-2 scrollbar-thin max-w-full">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    setTabSelectionMsg(
                      `Item ${item.id} ${item.label} seleccionado • ${new Date().toLocaleTimeString()}`
                    );
                  }}
                  className={`shrink-0 h-9 px-3 rounded-lg border text-[11px] font-medium flex items-center gap-1.5 transition-all active:scale-[0.97] ${
                    isActive
                      ? "bg-[#FEF3C7] text-[#1F1B18] border-[#D4A574] shadow-inner font-bold"
                      : "bg-[#0B1D3A] text-[#E6F1FF] border-[#1E3A5F] hover:bg-[#13274F]"
                  }`}
                >
                  <Icon size={14} className={isActive ? "text-[#1F1B18]" : "text-[#D4A574]"} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Content Render */}
      <main className="relative z-10 max-w-[1600px] w-full mx-auto px-2 md:px-6 pb-6 mt-2 flex-1">
        {/* Customizable Quick Indicators Panel (Permanently Visible) */}
        <QuickIndicatorsPanel
          metrics={metrics}
          riesgos={riesgos}
          proyecto={proyecto}
          activeTab={activeTab}
          onSelectTab={(tabId) => {
            setActiveTab(tabId);
            setTabSelectionMsg(
              `Item ${tabId} seleccionado desde Panel de Indicadores Rápido • ${new Date().toLocaleTimeString()}`
            );
          }}
        />

        {/* Dashboard Summary Section: 30-Day SPI & CPI Trend */}
        <DashboardSummaryEVM metrics={metrics} proyecto={proyecto} />

        {activeTab === 1 && (
          <Tab1Proyecto
            proyecto={proyecto}
            setProyecto={setProyecto}
            onSave={() => handleSaveAll()}
            onAcumular={() => {
              setProyecto((prev) => ({
                ...prev,
                plazoActual: prev.plazoActual + 1,
              }));
              handleSaveAll();
            }}
            onExport={handleExportCSV}
            onIA={() => triggerAIAnalysis(1)}
            storageStatus={storageStatus}
            lastSavedText={lastSavedText}
          />
        )}

        {activeTab === 2 && (
          <Tab2Norma
            norma={norma}
            setNorma={setNorma}
            onSave={() => handleSaveAll()}
            onExport={handleExportCSV}
            onIA={() => triggerAIAnalysis(2)}
            storageStatus={storageStatus}
          />
        )}

        {activeTab === 3 && (
          <Tab3Procesos
            procesos={procesos}
            setProcesos={setProcesos}
            sipoc={sipoc}
            setSipoc={setSipoc}
            onSave={() => handleSaveAll()}
            onExport={handleExportCSV}
            onIA={() => triggerAIAnalysis(3)}
            storageStatus={storageStatus}
          />
        )}

        {activeTab === 4 && (
          <Tab4SQL
            sheets={sheets}
            setSheets={setSheets}
            activeSheetIndex={activeSheetIndex}
            setActiveSheetIndex={setActiveSheetIndex}
            sqlQuery={sqlQuery}
            setSqlQuery={setSqlQuery}
            onSave={() => handleSaveAll()}
            onExport={handleExportCSV}
            onIA={() => triggerAIAnalysis(4)}
            storageStatus={storageStatus}
          />
        )}

        {activeTab === 5 && (
          <Tab5Valorizacion
            valRows={valRows}
            setValRows={setValRows}
            metrics={metrics}
            onAcumular={handleAcumularAll}
            onSave={() => handleSaveAll()}
            onExport={handleExportCSV}
            onIA={() => triggerAIAnalysis(5)}
            storageStatus={storageStatus}
          />
        )}

        {activeTab === 6 && (
          <Tab6Metrados
            metrados={metrados}
            setMetrados={setMetrados}
            cuadrillas={cuadrillas}
            setCuadrillas={setCuadrillas}
            metrics={metrics}
            onAcumular={handleAcumularAll}
            onSave={() => handleSaveAll()}
            onExport={handleExportCSV}
            onIA={() => triggerAIAnalysis(6)}
            storageStatus={storageStatus}
          />
        )}

        {activeTab === 7 && (
          <Tab7CPM
            actividades={actividades}
            setActividades={setActividades}
            onSave={() => handleSaveAll()}
            onExport={handleExportCSV}
            onIA={() => triggerAIAnalysis(7)}
            storageStatus={storageStatus}
          />
        )}

        {activeTab === 8 && (
          <Tab8Lookahead
            restricciones={restricciones}
            setRestricciones={setRestricciones}
            semanaData={semanaData}
            setSemanaData={setSemanaData}
            ppc={metrics.ppc}
            onSave={() => handleSaveAll()}
            onExport={handleExportCSV}
            onIA={() => triggerAIAnalysis(8)}
            storageStatus={storageStatus}
          />
        )}

        {activeTab === 9 && (
          <Tab9Trenes
            onSave={() => handleSaveAll()}
            onExport={handleExportCSV}
            onIA={() => triggerAIAnalysis(9)}
            storageStatus={storageStatus}
          />
        )}

        {activeTab === 10 && (
          <Tab10Productividad
            metrics={metrics}
            onSave={() => handleSaveAll()}
            onExport={handleExportCSV}
            onIA={() => triggerAIAnalysis(10)}
            storageStatus={storageStatus}
          />
        )}

        {activeTab === 11 && (
          <Tab11Riesgos
            riesgos={riesgos}
            setRiesgos={setRiesgos}
            onSave={() => handleSaveAll()}
            onExport={handleExportCSV}
            onIA={() => triggerAIAnalysis(11)}
            storageStatus={storageStatus}
          />
        )}

        {activeTab === 12 && (
          <Tab12Escenarios
            escenarios={escenarios}
            setEscenarios={setEscenarios}
            numCuadrillas={numCuadrillas}
            setNumCuadrillas={setNumCuadrillas}
            factorRendimiento={factorRendimiento}
            setFactorRendimiento={setFactorRendimiento}
            pctTNC={pctTNC}
            setPctTNC={setPctTNC}
            onSave={() => handleSaveAll()}
            onExport={handleExportCSV}
            onIA={() => triggerAIAnalysis(12)}
            storageStatus={storageStatus}
          />
        )}

        {activeTab === 13 && (
          <Tab13Simulacion
            actividades={actividades}
            riesgos={riesgos}
            proyecto={proyecto}
            metrics={metrics}
            onSave={() => handleSaveAll()}
            onExport={handleExportCSV}
            onIA={() => triggerAIAnalysis(13)}
            storageStatus={storageStatus}
          />
        )}

        {/* Global Persistent Footer Checklist */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-2">
          <div className="bg-[#0B1D3A] border border-[#1E3A5F] rounded-lg p-2.5 flex items-center gap-2">
            <Database size={14} className="text-[#D4A574]" />
            <div>
              <div className="text-[10px] text-[#8AA0C0]">LocalStorage Persistente</div>
              <div className="text-[11px] font-mono text-[#E6F1FF] truncate">{STORAGE_KEY}</div>
              <div className="text-[10px] text-emerald-300 font-mono">
                Guardado ✓ {totalRecords} regs • {lastSavedText}
              </div>
            </div>
          </div>

          <div className="bg-[#0B1D3A] border border-[#1E3A5F] rounded-lg p-2.5 flex items-center gap-2">
            <HardHat size={14} className="text-[#FF6B00]" />
            <div>
              <div className="text-[10px] text-[#8AA0C0]">IndexedDB Persistente</div>
              <div className="text-[11px] font-mono text-[#E6F1FF]">{DB_NAME}</div>
              <div className="text-[10px] text-blue-200 font-mono">
                {DB_STORES.length} almacenes relacionales • Almacenado ✓
              </div>
            </div>
          </div>

          <div className="bg-[#0B1D3A] border border-[#1E3A5F] rounded-lg p-2.5">
            <div className="text-[10px] text-[#8AA0C0]">
              Checklist 29 Puntos de Diagnóstico Integral
            </div>
            <div className="flex flex-wrap gap-1 mt-1">
              {["DESCRIPTIVO", "DIAGNÓSTICO", "PREDICTIVO", "PRESCRIPTIVO"].map((item) => (
                <span
                  key={item}
                  className="px-1.5 py-0.5 rounded bg-[#13274F] border border-[#1E3A5F] text-[9px] font-mono text-[#D4A574]"
                >
                  {item} ✓
                </span>
              ))}
            </div>
          </div>

          <div className="bg-[#0B1D3A] border border-[#1E3A5F] rounded-lg p-2.5 flex items-center justify-between">
            <div>
              <div className="text-[10px] text-[#8AA0C0]">Acciones Globales Rápidas</div>
              <div className="flex gap-1.5 mt-1">
                <button
                  onClick={() => handleSaveAll()}
                  className="h-7 px-3 rounded bg-[#FEF3C7] text-[#1F1B18] text-[11px] font-bold flex items-center gap-1 hover:brightness-95 transition-all shadow-sm"
                >
                  <Save size={12} /> Guardar Todo
                </button>
                <button
                  onClick={handleAcumularAll}
                  className="h-7 px-3 rounded bg-[#0B1D3A] border border-[#1E3A5F] text-[#E6F1FF] text-[11px] flex items-center gap-1 hover:bg-[#13274F] transition-all"
                >
                  <Calculator size={12} className="text-[#D4A574]" /> Acumular Todo
                </button>
              </div>
            </div>
            <div className="text-[9px] font-mono text-[#8AA0C0] text-right">
              Fondo #020A1E 90%
              <br />
              Botones #FEF3C7
              <br />
              CIP 101507
            </div>
          </div>
        </div>
      </main>

      {/* AI Report Modal */}
      <AIModal
        isOpen={aiModal.open}
        title={aiModal.title}
        text={aiModal.text}
        onClose={() => setAiModal({ open: false, title: "", text: "" })}
      />

      {/* Critical Sound & Visual Alert Modal */}
      <CriticalAlertModal
        isOpen={alertOpen}
        title={alertInfo.title}
        msg={alertInfo.msg}
        item={alertInfo.item}
        metrics={metrics}
        onClose={() => setAlertOpen(false)}
        onTakeAction={() => {
          setAlertOpen(false);
          setActiveTab(12);
        }}
      />

      {/* Interactive AI ChatBox */}
      <ChatBox
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        onOpen={() => setIsChatOpen(true)}
        onOpenAudioChat={() => {
          setIsChatOpen(false);
          setIsAudioChatOpen(true);
        }}
        proyecto={proyecto}
        metrics={metrics}
        riesgos={riesgos}
        activeTab={activeTab}
        onNavigateTab={(tabId) => {
          setActiveTab(tabId);
          setTabSelectionMsg(`Item ${tabId} seleccionado desde Chatbox • ${new Date().toLocaleTimeString()}`);
        }}
      />

      {/* Interactive Radio de Obra / Audio Chat Modal */}
      <AudioChatModal
        isOpen={isAudioChatOpen}
        onClose={() => setIsAudioChatOpen(false)}
        proyecto={proyecto}
        metrics={metrics}
        riesgos={riesgos}
        activeTab={activeTab}
        onNavigateTab={(tabId) => {
          setActiveTab(tabId);
          setTabSelectionMsg(`Item ${tabId} seleccionado desde Radio de Obra • ${new Date().toLocaleTimeString()}`);
        }}
      />
    </div>
  );
}
