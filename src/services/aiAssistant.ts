import { EVMMetrics, ProyectoInfo, RiesgoItem } from "../types";

export interface AIResponse {
  text: string;
  shortVoiceSummary: string; // Crisp summary designed specifically for natural text-to-speech spoken delivery
  category: "contractual" | "evm" | "campo" | "legal" | "calidad" | "general";
  suggestedAction?: {
    tabId: number;
    label: string;
  };
}

export function generateAssistantResponse(
  userQuery: string,
  proyecto: ProyectoInfo,
  metrics: EVMMetrics,
  _riesgos: RiesgoItem[] = [],
  activeTab: number = 0
): AIResponse {
  const q = userQuery.toLowerCase();

  // 1. Asiento de Cuaderno de Obra
  if (q.includes("asiento") || q.includes("cuaderno") || q.includes("802") || q.includes("anotacion") || q.includes("anotación")) {
    return {
      text: `PROYECTO DE ASIENTO DIGITAL DE CUADERNO DE OBRA:

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ASIENTO N° 802 - DEL RESIDENTE DE OBRA
Fecha: ${new Date().toLocaleDateString('es-PE')} | Hora: 08:30 hrs
Obra: CREACIÓN CICLOVÍA CUTERVO-HUACACHINA (CUI 2264872)
Residente: ING. JOSE LUIS PAYSIS VELASQUEZ - CIP 101507
Contratista: CONSORCIO LOS FLAMENCOS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Se deja constancia en el presente cuaderno de obra digital de los siguientes hechos relevantes:

1. HECHO VERIFICADO:
Con fecha 11 de marzo de 2025 se suscribió el Acta de Suspensión por no disponibilidad física y legal del terreno en el sector Club Social Ica (CUI 2693747), acumulando a la fecha 249 DÍAS CALENDARIO de afectación directa y continua.

2. AFECTACIÓN A LA RUTA CRÍTICA:
La falta de entrega del referido terreno impide la continuidad de las actividades:
• A-04 Encofrado de Veredas Sector S3
• A-05 Vaciado de Concreto f'c=175 kg/cm2
• A-07 Pavimento Asfáltico
Ambas actividades cuentan con HOLGURA = 0, configurando atraso no imputable al Contratista según el Art. 96 y Art. 140 del D.S. 038-2026-EF (Ley 29230).

3. REQUERIMIENTO A LA SUPERVISIÓN Y ENTIDAD:
Se solicita formalmente al Consorcio Supervisor Cutervo Huacachina remitir informe de pronunciamiento técnico y trasladar al GORE ICA la exigencia de saneamiento físico perentorio, reservándonos el derecho a cuantificar los Mayores Gastos Generales debidamente acreditados y formalizar la Ampliación de Plazo N° 02 por 45 días calendario.`,
      shortVoiceSummary: `Atención Residente. He redactado el Asiento número 802 para el cuaderno de obra. En él se deja constancia de los 249 días de afectación en el terreno del Club Social Ica, la afectación directa a la ruta crítica con holgura cero en las veredas y pavimento del sector S3, amparado en los Artículos 96 y 140 del Decreto Supremo 038. Puedes copiar el texto completo con un solo clic.`,
      category: "contractual",
      suggestedAction: { tabId: 11, label: "Ver Asiento 802 en Item 11 Riesgos" },
    };
  }

  // 2. Justificación de Atraso / Art 140 / Ampliación / DS 038
  if (
    q.includes("atraso") ||
    q.includes("ampliacion") ||
    q.includes("ampliación") ||
    q.includes("art 140") ||
    q.includes("justificar") ||
    q.includes("31.43") ||
    q.includes("038") ||
    q.includes("norma") ||
    q.includes("reglamento")
  ) {
    return {
      text: `ESTRATEGIA TÉCNICO-LEGAL PARA SUSTENTO DE ATRASO (-31.43%) BAJO D.S. 038-2026-EF:

1. BASE NORMATIVA COMPLETA (D.S. N° 038-2026-EF / Ley 29230 modificada por Ley 32460):
• Art. III numeral 6 (Enfoque por Resultados) y numeral 8 (Confianza Legítima): La Entidad debe resolver mediante trato directo y no puede variar arbitrariamente sus actos ni perjudicar al ejecutor.
• Art. 96: La Entidad Pública es responsable exclusiva de la disponibilidad física del terreno, saneamiento de interferencias y licencias.
• Art. 134.4: El incumplimiento de obligaciones de la Entidad que afecte el plazo da lugar al reconocimiento de Mayores Gastos Generales debidamente sustentados.
• Art. 135.7: "NO CORRESPONDE LA APLICACIÓN DE PENALIDAD cuando el incumplimiento o demora sea imputable a la Entidad Pública o caso fortuito/fuerza mayor. En dicho supuesto, se procede a la ampliación de los plazos de ejecución".
• Art. 140: Procedimiento de Ampliación de Plazo con SILENCIO ADMINISTRATIVO POSITIVO. Si la Entidad no resuelve en 10 días hábiles, queda automáticamente aprobada la solicitud.
• Art. 187: Trato Directo obligatorio. Todo acuerdo suscrito en acta tiene EFECTOS LEGALES DE TRANSACCIÓN Y COSA JUZGADA.

2. ELEMENTOS DE PRUEBA (MATRIZ DE EVIDENCIA):
• Asiento 610: Constatación de bloqueo en Club Social Ica (249 días).
• Asiento 730: Notificación de interferencia de redes EMAPICA en Retamayo.
• Asientos 774 al 802: Registro diario de afectación de la Ruta Crítica (holgura = 0).
• Carta N° 032-2025-CLF/RO: Notificación de causal no imputable.

3. CONCLUSIÓN PARA TOMA DE DECISIONES:
El atraso actual no puede ser penalizado bajo ninguna circunstancia. El Consorcio debe exigir la emisión de la Adenda N° 02 de Ampliación de Plazo por 45 días calendario y el reconocimiento de los Mayores Gastos Generales.`,
      shortVoiceSummary: `Ingeniero, respecto al atraso de menos 31.43 por ciento, el Decreto Supremo 038 de 2026 en su Artículo 135 inciso 7 señala explícitamente que no corresponde aplicar penalidad cuando la demora sea imputable a la Entidad. Con los 249 días de bloqueo en Club Social y la interferencia de redes EMAPICA, la causal no es imputable al Consorcio. Corresponde formalizar la Ampliación de Plazo bajo el Artículo 140.`,
      category: "legal",
      suggestedAction: { tabId: 2, label: "Ver Íntegro del D.S. 038-2026-EF en Item 2" },
    };
  }

  // 3. Penalidades Art 135 / Art 132
  if (q.includes("penalidad") || q.includes("135") || q.includes("132") || q.includes("mora") || q.includes("multa")) {
    const maxPenalidad = (proyecto.presupuestoConIGV * 0.10).toLocaleString("es-PE", { minimumFractionDigits: 2 });
    return {
      text: `EVALUACIÓN DE RIESGO DE PENALIDAD POR MORA (ART. 135 D.S. 038-2026-EF):

• Presupuesto Contratado: S/ ${proyecto.presupuestoConIGV.toLocaleString()}
• Tope Máximo de Penalidad por Mora (10%): S/ ${maxPenalidad}
• Fórmula Reglamentaria:
  Penalidad Diaria = (0.10 × Monto Contrato) / (F × Plazo en Días)
  Donde F = 0.15 para obras mayores a 60 días.

DIAGNÓSTICO PREVENTIVO:
El atraso del -31.43% superaría el 80% del avance programado si la Entidad aplicara un apercibimiento sin considerar la causal eximente.
ACCIONES INMEDIATAS REQUERIDAS:
1. No aceptar valorizaciones de avance ficticio sin la debida salvedad de causal no imputable.
2. Ingresar la Carta de Ampliación de Plazo dentro de los 15 días posteriores al cese de la causal (o presentar solicitudes parciales si la causal es continua).
3. Con la aprobación de la ampliación de 45 días, el cronograma se reprograma y la penalidad potencial de S/ ${maxPenalidad} queda NEUTRALIZADA a S/ 0.00.`,
      shortVoiceSummary: `Sobre las penalidades: el tope máximo del 10 por ciento asciende a ${maxPenalidad} soles. Sin embargo, bajo el Artículo 135 del nuevo reglamento, la penalidad queda totalmente neutralizada a cero soles al configurarse la causal de atraso por falta de terreno no imputable al contratista.`,
      category: "contractual",
      suggestedAction: { tabId: 12, label: "Simular en Item 12 Escenarios" },
    };
  }

  // 4. Valorización 17 y EVM
  if (
    q.includes("val 17") ||
    q.includes("valorizacion") ||
    q.includes("valorización") ||
    q.includes("spi") ||
    q.includes("cpi") ||
    q.includes("curva s") ||
    q.includes("evm")
  ) {
    return {
      text: `INFORME EJECUTIVO DE VALORIZACIÓN N° 17 Y CURVA S (EVM):

1. RESUMEN ECONÓMICO:
• Monto Valorización 17: S/ 646,823.27 sin IGV
• Acumulado Ejecutado: S/ 20,095,675.69 (${metrics.ejec}%)
• Saldo Financiero por Ejecutar: S/ 16,315,592.78
• Avance Programado acumulado: ${metrics.prog}%
• Brecha de Atraso acumulado: ${metrics.atraso.toFixed(2)}%

2. MÉTRICAS EARNED VALUE MANAGEMENT (PMBOK 8va Edición):
• SPI (Schedule Performance Index): ${metrics.spi.toFixed(2)} [CRÍTICO < 0.70]
• CPI (Cost Performance Index): ${metrics.cpi.toFixed(2)} [MODERADO]
• BAC (Budget at Completion): S/ ${(metrics.bac / 1e6).toFixed(2)}M
• EV (Earned Value): S/ ${(metrics.ev / 1e6).toFixed(2)}M
• PV (Planned Value): S/ ${(metrics.pv / 1e6).toFixed(2)}M
• AC (Actual Cost estimado): S/ ${(metrics.ac / 1e6).toFixed(2)}M
• EAC (Estimado a la Conclusión): S/ ${(metrics.eac / 1e6).toFixed(2)}M
• VAC (Varianza a la Conclusión): S/ ${(metrics.vac / 1e6).toFixed(2)}M

Recomendación: Aplicar compresión Fast-Track en frentes liberados S1-S2 y reprogramar la Curva S con la ampliación de plazo aprobada.`,
      shortVoiceSummary: `Reporte de valorización 17 y métricas EVM: el avance ejecutado acumulado es del ${metrics.ejec} por ciento, con un valor ganado de 20 millones de soles. El índice de rendimiento del cronograma SPI es de ${metrics.spi.toFixed(2)}, situándose en nivel crítico debido a la paralización del sector S3. El CPI se mantiene estable en ${metrics.cpi.toFixed(2)}.`,
      category: "evm",
      suggestedAction: { tabId: 5, label: "Ir a Item 5 Curva S EVM" },
    };
  }

  // 5. Productividad, Lean, TNC, Carta Balance, Cuadrillas
  if (
    q.includes("tnc") ||
    q.includes("productividad") ||
    q.includes("cuadrilla") ||
    q.includes("carta balance") ||
    q.includes("lean") ||
    q.includes("rendimiento")
  ) {
    return {
      text: `DIAGNÓSTICO DE PRODUCTIVIDAD Y CARTA BALANCE (LEAN CONSTRUCTION):

Auditoría de 384 observaciones de campo:
• Trabajo Productivo (TP): ${metrics.tp}% (Meta Lean: ≥ 60%) → Brecha: -18%
• Trabajo Contributorio (TC): ${metrics.tc}%
• Trabajo No Contributorio (TNC): ${metrics.tnc}% (Meta Lean: ≤ 25%) → Desperdicio: +10%

DESGLOSE DEL TNC (35%):
1. 42% Esperas por interferencias no liberadas y falta de frente.
2. 31% Transporte excesivo de carretillas con agregado (distancias > 45m).
3. 27% Re-trabajos por rotura de sardineles durante el vaciado de sub-base.

PLAN DE ACCIÓN INMEDIATO (5S + KANBAN):
• Reorganizar el punto de acopio a no más de 15m del frente de vaciado.
• Cuadrilla C-03 (Veredas): Subir de 12.5 a 14.8 m2/día implementando encofrados metálicos modulares en lugar de madera rústica.
• Ganancia esperada: Reducción del TNC al 22% y recuperación de 8 días de plazo.`,
      shortVoiceSummary: `En productividad de campo, el Trabajo No Contributorio se encuentra en 35 por ciento, superando la meta Lean del 25 por ciento. El 42 por ciento de las pérdidas corresponden a esperas por falta de frente y traslados excesivos. Reorganizando el acopio a 15 metros y usando encofrados modulares en veredas recuperaremos 8 días de plazo.`,
      category: "campo",
      suggestedAction: { tabId: 6, label: "Ver Carta Balance en Item 6 Metrados" },
    };
  }

  // 6. CPM, Ruta Crítica, Plazo
  if (
    q.includes("cpm") ||
    q.includes("ruta critica") ||
    q.includes("ruta crítica") ||
    q.includes("cronograma") ||
    q.includes("holgura") ||
    q.includes("plazo")
  ) {
    return {
      text: `ANÁLISIS DE RUTA CRÍTICA CPM (${proyecto.plazoActual} DÍAS CALENDARIO):

1. ACTIVIDADES EN RUTA CRÍTICA (HOLGURA TOTAL = 0):
• A-01: Trazo y replanteo general (12d) → Concluido 100%
• A-02: Excavación veredas S1 (18d) → Avance 85%
• A-04: Encofrado veredas S1 (20d) → Avance 65%
• A-05: Vaciado concreto f'c=175 S1 (25d) → Avance 58%
• A-07: Pavimento asfáltico S1 (35d) → Avance 22% (Cuello de botella)

2. ACTIVIDADES NO CRÍTICAS:
• A-03: Base granular S1-S2 (Holgura = 7d)
• A-06: Sardineles peraltados S1-S3 (Holgura = 7d)

3. SIMULACIÓN PROBABILÍSTICA MONTE CARLO:
• P50 (Más probable sin contingencia): 695 días
• P80 (Conservador): 720 días
• Probabilidad de culminar en ${proyecto.plazoActual} días: 32% (Requiere aceleración de cuadrillas T5 y liberación urgente de S3).`,
      shortVoiceSummary: `El análisis CPM sobre el plazo vigente de ${proyecto.plazoActual} días indica que las actividades críticas con holgura cero son el encofrado, vaciado de concreto y pavimento asfáltico. La probabilidad de culminar en fecha sin contingencia es del 32 por ciento, lo que hace indispensable consolidar la Ampliación de Plazo de 45 días.`,
      category: "evm",
      suggestedAction: { tabId: 7, label: "Ver Diagrama CPM en Item 7" },
    };
  }

  // Default intelligent guidance
  return {
    text: `ANÁLISIS TÉCNICO VIRTUAL:
He procesado tu consulta: "${userQuery}".

RESUMEN DE SITUACIÓN EN OBRA:
• Proyecto: ${proyecto.nombre} (CUI ${proyecto.cui})
• Contratista: ${proyecto.contratista} | Residente: ${proyecto.residente}
• Avance Físico Actual: ${metrics.ejec}% vs Programado ${metrics.prog}% (Desviación: ${metrics.atraso.toFixed(2)}%)
• Estado Operativo: SPI ${metrics.spi.toFixed(2)}, CPI ${metrics.cpi.toFixed(2)}, PPC Semanal ${metrics.ppc}%

RECOMENDACIONES DIRECTAS:
1. Si requieres sustentar causales de plazo, consulta sobre el "Asiento 802" o "Art 140".
2. Si deseas evaluar impacto financiero, revisa el cálculo de "Penalidad Art 135" o "EVM Curva S".
3. Para optimizar cuadrillas en campo, consulta sobre "Carta Balance" o "Rendimiento C-03".

¿Deseas que profundice en alguna de estas alternativas?`,
    shortVoiceSummary: `Consulta procesada para la Ciclovía Cutervo Huacachina. Avance actual al ${metrics.ejec} por ciento con desviación de menos ${metrics.atraso.toFixed(2)} por ciento y SPI de ${metrics.spi.toFixed(2)}. Puedes pedirme redactar el Asiento 802, evaluar la penalidad del Artículo 135 o analizar la ruta crítica.`,
    category: "general",
    suggestedAction: { tabId: activeTab, label: `Permanecer en Item ${activeTab}` },
  };
}
