export interface NormaReglamentoArticulo {
  numero: string; // e.g., "Art. I", "Art. 96", "Art. 140", "Art. 135"
  titulo: string;
  capitulo: string;
  tituloGeneral: string;
  resumenClave: string;
  impactoDecision: string;
  textoCompleto: string;
  categoria: 'principios' | 'institucional' | 'financiamiento' | 'priorizacion' | 'seleccion' | 'convenio' | 'ejecucion' | 'supervision' | 'ciprl' | 'controversias' | 'especiales';
  etiquetas: string[];
}

export const DS_038_2026_EF_DATA: NormaReglamentoArticulo[] = [
  // TÍTULO PRELIMINAR
  {
    numero: "Art. I",
    titulo: "Objeto",
    capitulo: "Título Preliminar",
    tituloGeneral: "Disposiciones Generales",
    categoria: "principios",
    etiquetas: ["objeto", "reglamento", "ley 29230", "obras por impuestos"],
    resumenClave: "Dicta las disposiciones reglamentarias para la aplicación de la Ley N° 29230 (Ley de Obras por Impuestos), modificada por Ley N° 32460.",
    impactoDecision: "Marco normativo habilitante para el Convenio de Inversión celebrado entre Consorcio Los Flamencos y GORE ICA.",
    textoCompleto: "El presente Reglamento tiene por objeto dictar las disposiciones reglamentarias para la aplicación de la Ley N° 29230, Ley que impulsa la inversión pública regional y local con participación del sector privado, la cual regula el mecanismo de Obras por Impuestos."
  },
  {
    numero: "Art. II",
    titulo: "Ámbito de aplicación",
    capitulo: "Título Preliminar",
    tituloGeneral: "Disposiciones Generales",
    categoria: "principios",
    etiquetas: ["gobierno regional", "entidades", "universidades", "gobiernos locales"],
    resumenClave: "Aplica a Entidades Públicas del Gobierno Nacional, Gobiernos Regionales, Gobiernos Locales, Mancomunidades y Universidades Públicas.",
    impactoDecision: "Establece la competencia y sujeción legal obligatoria del GORE ICA en el marco del CUI 2264872.",
    textoCompleto: "El presente Reglamento se aplica a las Entidades Públicas del Gobierno Nacional, los Gobiernos Regionales, los Gobiernos Locales, las Juntas de Coordinación Interregional, las Mancomunidades Regionales, las Mancomunidades Municipales y las Universidades Públicas, en el marco de la Ley y otras Entidades Públicas autorizadas por Ley."
  },
  {
    numero: "Art. III",
    titulo: "Principios (11 Principios Rectores)",
    capitulo: "Título Preliminar",
    tituloGeneral: "Disposiciones Generales",
    categoria: "principios",
    etiquetas: ["principios", "enfoque de resultados", "confianza legítima", "equidad", "eficiencia", "trato directo"],
    resumenClave: "11 principios rectores: Libertad de concurrencia, Igualdad de trato, Transparencia, Competencia, Eficacia y Eficiencia, Enfoque de gestión por resultados (prevalece costo-beneficio y trato directo sobre arbitraje), Responsabilidad fiscal, Confianza legítima (entidad no puede variar arbitrariamente reglas), Sostenibilidad, Equidad e Integridad.",
    impactoDecision: "FUNDAMENTAL EN TOMA DE DECISIONES: El Inciso 6 (Enfoque por Resultados) obliga a la Entidad a optar por la alternativa más célere y el trato directo en lugar de litigios prolongados. El Inciso 8 (Confianza Legítima) prohíbe desconocer valorizaciones o plazos aprobados.",
    textoCompleto: "El mecanismo de Obras por Impuestos se desarrolla con fundamento en los siguientes principios: 1. Libertad de concurrencia. 2. Igualdad de trato. 3. Transparencia. 4. Competencia. 5. Eficacia y Eficiencia. 6. Enfoque de gestión por resultados: En caso de controversias, optar por el trato directo si es más conveniente en términos costo-beneficio; no exigir documentos que obren en la entidad. 7. Responsabilidad fiscal. 8. Confianza legítima: La entidad debe cumplir las normas sin actuar arbitrariamente ni variar intempestivamente sus actos. 9. Sostenibilidad. 10. Equidad. 11. Integridad."
  },
  {
    numero: "Art. IV",
    titulo: "Acrónimos",
    capitulo: "Título Preliminar",
    tituloGeneral: "Disposiciones Generales",
    categoria: "principios",
    etiquetas: ["acrónimos", "ciprl", "cipgn", "mef", "cui", "snpmgi", "cgr"],
    resumenClave: "Define 42 acrónimos clave: CIPRL, CIPGN, CUI, TMCA, CUT, MEF, Proinversión, CGR, SUNAT, SNPMGI, OPMI, UEI, UF, OECE.",
    impactoDecision: "Estandarización técnica y contractual de términos en valorizaciones, asientos y reclamos.",
    textoCompleto: "Contiene 42 acrónimos oficiales: APP, BIM, CGR, CMN, CIPGN, CIPRL, CUI, CUT, DCF, DGCP, DGPMACDF, DGPMI, DGPP, DGPPIP, DGTP, FIDT, FOCAM, FONCOMUN, FONCOR, IGV, IOARR, IPC, ISC, NIIF, MEF, MINEDU, MINJUS, MINSA, MVCS, OPMI, OECE, Proinversión, RNP, PIA, PMBSO, PMI, RUC, SEACE, Sedapal, SIAF-SP, SNA, SNC, SNPMGI, SNPP, SNT, SMV, SUNARP, SUNASS, SUNAT, TMCA, UEI, UF, UIT, UP."
  },
  {
    numero: "Art. V",
    titulo: "Definiciones (58 Definiciones Oficiales)",
    capitulo: "Título Preliminar",
    tituloGeneral: "Disposiciones Generales",
    categoria: "principios",
    etiquetas: ["definiciones", "cuaderno de incidencias", "ruta critica", "mayores gastos generales", "mayores metrados", "mayores trabajos"],
    resumenClave: "Define conceptos determinantes: Cuaderno de Incidencias (digital/físico), Ruta Crítica (CPM), Mayores Gastos Generales (Arts. 140 y 161), Mayores Metrados (Art. 139.7), Mayores Trabajos (adicionales), Menores Metrados, Conformidad de Calidad, Conformidad de Recepción, Liquidación de Convenio.",
    impactoDecision: "PRECISIÓN CONTRACTUAL: La definición 36 (Mayores Gastos Generales) ampara el resarcimiento por demoras no imputables al contratista. La definición 53 (Ruta Crítica) respalda que cualquier alteración en el camino crítico genera ampliación de plazo automática.",
    textoCompleto: "Regula 58 definiciones obligatorias: 1. Agrupamiento de Intervenciones; 6. Conformidad de Calidad; 7. Conformidad de Recepción; 12. Convenio de Inversión; 13. Costos de Gestión; 15. Cuaderno de Incidencias; 18. Deductivo; 24. Expediente Técnico; 26. Gastos Generales (fijos y variables); 34. Liquidación del Convenio; 36. Mayores Gastos Generales; 37. Mayores Metrados; 38. Mayores Trabajos; 39. Menores Metrados; 49. Programa de Ejecución (CPM); 53. Ruta Crítica (secuencia de holgura cero que determina el plazo mínimo); 57. Valorización de la Ejecución; entre otras."
  },

  // TÍTULO I: MARCO INSTITUCIONAL
  {
    numero: "Art. 2",
    titulo: "Delegación y desconcentración de facultades",
    capitulo: "Capítulo I - Entidad Pública",
    tituloGeneral: "Título I: Marco Institucional",
    categoria: "institucional",
    etiquetas: ["delegacion", "titular", "gobernador", "indedelegable", "resolucion"],
    resumenClave: "En Gobiernos Regionales, son indelegables: apelación, nulidades, contratación directa, firma de Convenio y adendas, actas de suspensión de plazo y aprobación de Mayores Trabajos.",
    impactoDecision: "Las adendas de plazo por la causal Club Social y el acta de suspensión deben ser firmadas obligatoriamente por el Gobernador Regional de Ica.",
    textoCompleto: "El titular de la Entidad Pública del Gobierno Regional, Gobierno Local o Universidad Pública puede desconcentrar en otros dependientes las facultades que la presente norma otorga, con excepción de: 1. Resolución de apelación. 2. Nulidad de selección. 3. Nulidad de oficio. 4. Autorización de contratación directa. 5. Suscripción del Convenio de Inversión y adendas. 6. Suscripción de actas de suspensión de plazo de ejecución. 7. Aprobación de los Mayores Trabajos."
  },
  {
    numero: "Art. 6",
    titulo: "Funciones de la DGPPIP",
    capitulo: "Capítulo II - Ministerio de Economía y Finanzas",
    tituloGeneral: "Título I: Marco Institucional",
    categoria: "institucional",
    etiquetas: ["dgppip", "mef", "opinion vinculante", "lineamientos"],
    resumenClave: "La DGPPIP emite opinión vinculante, exclusiva y excluyente sobre interpretación de la Ley 29230 y el Reglamento; monitorea todas las fases.",
    impactoDecision: "Cualquier controversia interpretativa con la Supervisión o el GORE ICA puede consultarse a la DGPPIP, cuya opinión es vinculante.",
    textoCompleto: "La DGPPIP es el órgano de línea del MEF que: 1. Emite opinión vinculante, exclusiva y excluyente sobre la interpretación y aplicación de la Ley y el Reglamento. 2. Establece lineamientos y formatos. 3. Canaliza consultas. 4. Monitorea todas las fases. 5. Revisa y registra convenios en la Plataforma de Documentos Valorados. 8. Determina los TMCA para emisión de CIPRL."
  },
  {
    numero: "Art. 7",
    titulo: "Participación de la DGTP",
    capitulo: "Capítulo II - Ministerio de Economía y Finanzas",
    tituloGeneral: "Título I: Marco Institucional",
    categoria: "institucional",
    etiquetas: ["dgtp", "ciprl", "emision", "cut", "deduccion 30%"],
    resumenClave: "La DGTP emite los CIPRL/CIPGN, administra la plataforma de documentos valorados, ejecuta la deducción del 30% del canon/regalías de la entidad.",
    impactoDecision: "Asegura el pago financiero del Contratista con títulos negociables independientemente del presupuesto ordinario de caja del GORE.",
    textoCompleto: "La DGTP: 1. Emite los certificados CIPRL y CIPGN verificando el cumplimiento de requisitos. 2. Administra la Plataforma de Documentos Valorados. 3. Ejecuta la deducción del 30% de recursos determinados para repago. 4. Dispone recursos según Art. 8.1 de la Ley. 5. Deduce asignaciones financieras."
  },
  {
    numero: "Art. 11",
    titulo: "Funciones de Proinversión",
    capitulo: "Capítulo III - Proinversión",
    tituloGeneral: "Título I: Marco Institucional",
    categoria: "institucional",
    etiquetas: ["proinversion", "asistencia tecnica", "trato directo", "seguimiento"],
    resumenClave: "Proinversión asiste técnicamente, hace seguimiento y puede emitir informe orientador en trato directo antes o durante su desarrollo (numeral 9).",
    impactoDecision: "Permite convocar a Proinversión para destrabar la negociación de ampliación de plazo en trato directo.",
    textoCompleto: "Proinversión cumple: Difusión, asistencia técnica, seguimiento de todas las fases, y numeral 9: 'Emitir un informe como criterio orientador para la toma de decisiones, a solicitud de alguna de las partes, antes o durante el desarrollo del trato directo.' Numeral 10: Desarrollar reuniones de articulación vinculantes."
  },
  {
    numero: "Art. 16",
    titulo: "Participación de la Contraloría General de la República (CGR)",
    capitulo: "Capítulo IV - Contraloría General de la República",
    tituloGeneral: "Título I: Marco Institucional",
    categoria: "institucional",
    etiquetas: ["cgr", "contraloria", "informe previo", "control concurrente", "cuaderno de incidencias"],
    resumenClave: "Emite Informe Previo que compromete capacidad financiera; accede a cuaderno de incidencias y frentes de obra; ejecuta control concurrente.",
    impactoDecision: "Todo expediente de ampliación y cuaderno de obra digital debe mantenerse auditado ante veedurías concurrentes de la CGR.",
    textoCompleto: "La CGR: 1. Emite Informe Previo sobre capacidad financiera del Estado. 2. Accede a los lugares de ejecución y al Cuaderno de Incidencias. 3. Realiza control concurrente conforme a la Ley N° 31358. 4. Emite recomendaciones derivadas del control."
  },

  // TÍTULO II: EJECUCIÓN, MODIFICACIONES Y SUSPENSIÓN
  {
    numero: "Art. 96",
    titulo: "Autorizaciones, licencias y disponibilidad de terrenos",
    capitulo: "Capítulo III - Proceso de Selección",
    tituloGeneral: "Título II: Disposiciones Generales",
    categoria: "ejecucion",
    etiquetas: ["terrenos", "disponibilidad de terreno", "interferencias", "licencias", "expropiaciones"],
    resumenClave: "LA ENTIDAD PÚBLICA ES EXCLUSIVAMENTE RESPONSABLE DE LA DISPONIBILIDAD FÍSICA DEL TERRENO, expropiaciones, liberación de interferencias y permisos.",
    impactoDecision: "DECISIÓN CRÍTICA: Deslinda totalmente la responsabilidad del Consorcio Los Flamencos por los 249 días de bloqueo del terreno Club Social Ica (CUI 2693747) y las redes de agua en Retamayo.",
    textoCompleto: "La Entidad Pública es responsable de la disponibilidad física del terreno, de las expropiaciones y/o interferencias, así como de la obtención de las licencias, autorizaciones, permisos, servidumbre o similares para la ejecución del proyecto, salvo que en las bases y Convenio se acuerde que la Empresa Privada es la encargada de dicha gestión..."
  },
  {
    numero: "Art. 125",
    titulo: "Vigencia y plazo de ejecución del Convenio de Inversión",
    capitulo: "Capítulo IV - Fase de Ejecución",
    tituloGeneral: "Título III: Fases del Mecanismo",
    categoria: "ejecucion",
    etiquetas: ["plazo", "dias calendario", "vigencia", "liquidacion"],
    resumenClave: "Inicia con la suscripción y culmina con la Liquidación y cancelación total con CIPRL. Los plazos en fase de ejecución se computan en DÍAS CALENDARIO.",
    impactoDecision: "Cómputo exacto de los 668 días calendario vigentes y contabilización estricta de plazos de mora y ampliación.",
    textoCompleto: "125.1 El Convenio de Inversión inicia con su suscripción y culmina con la Liquidación del Convenio y la respectiva cancelación del Monto Total mediante CIPRL o CIPGN. 125.2 Durante la fase de ejecución, los plazos se computan en días calendario. 125.3 El plazo rige desde el cumplimiento de condiciones del Art. 127."
  },
  {
    numero: "Art. 127",
    titulo: "Condiciones para el inicio de la ejecución de Obligaciones",
    capitulo: "Capítulo IV - Fase de Ejecución",
    tituloGeneral: "Título III: Fases del Mecanismo",
    categoria: "ejecucion",
    etiquetas: ["inicio de ejecucion", "entrega de terreno", "requisitos habilitantes"],
    resumenClave: "Requiere: Suscripción de Convenio, Contratación de Supervisión, Entrega de Expediente Técnico y Acta de Entrega de Terreno.",
    impactoDecision: "El cómputo de plazo no puede correr en sectores donde no se ha formalizado la entrega de terreno física y libre de interferencias.",
    textoCompleto: "127.1 Requisitos habilitantes: Suscripción del convenio, contratación de la Entidad Privada Supervisora, entrega del Expediente Técnico aprobado. 127.2 Cuando involucre ejecución física, la entrega de terreno constituye el hito que determina el inicio del plazo de ejecución mediante acta."
  },
  {
    numero: "Art. 128",
    titulo: "Suspensión del plazo de ejecución",
    capitulo: "Capítulo IV - Fase de Ejecución",
    tituloGeneral: "Título III: Fases del Mecanismo",
    categoria: "ejecucion",
    etiquetas: ["suspension", "acta de suspension", "mayores gastos generales", "ciprl trimestral"],
    resumenClave: "Se formaliza mediante acta suscrita por el Titular de la Entidad y el Contratista (indelegable). No genera mayores costos directos salvo resguardo y seguridad. Numeral 128.5: Si la Entidad no solicita el CIPRL trimestral en plazo, el Contratista puede suspender y SÍ TIENE DERECHO A MAYORES GASTOS GENERALES.",
    impactoDecision: "Si GORE ICA demora en trámites de CIPRL de la Valorización 17, el contratista tiene derecho a suspender cobrando Mayores Gastos Generales.",
    textoCompleto: "128.1 Por eventos no atribuibles que interrumpan la ejecución, se acuerda suspensión de plazo. 128.2 Se formaliza por acta entre titular y representante (indelegable en Gobiernos Regionales). 128.3 No exime a la entidad de tramitar CIPRL por avances previos. 128.4 No genera mayores gastos generales salvo seguridad. 128.5 La Empresa puede suspender si la Entidad no solicita CIPRL trimestral dentro de 5 días de requerida; en tal caso SÍ genera Mayores Gastos Generales debidamente acreditados."
  },
  {
    numero: "Art. 129",
    titulo: "Documento de trabajo (Modificaciones al Expediente Técnico)",
    capitulo: "Capítulo IV - Fase de Ejecución",
    tituloGeneral: "Título III: Fases del Mecanismo",
    categoria: "ejecucion",
    etiquetas: ["documento de trabajo", "expediente tecnico", "modificaciones", "suspension"],
    resumenClave: "Permite proponer modificaciones al Expediente Técnico dentro de los 15 días de suscrito el Convenio. La Entidad tiene 10 días para evaluar. Si aprueba, suspende plazos de obra hasta aprobar el nuevo estudio (máximo 15 días hábiles). Se reconoce hasta el 5% del monto total por elaboración.",
    impactoDecision: "Mecanismo para rediseñar sectores con interferencias de redes sanitarias o reformular especificaciones de pavimento.",
    textoCompleto: "129.1 Empresa presenta documento de trabajo dentro de 15 días de suscrito el Convenio proponiendo actualización de ET. 129.2 Contiene listado de cambios, justificación, cronograma y cotización. 129.3 Entidad evalúa en 10 días; si es conforme, dispone suspensión de plazos y autoriza estudio en 3 días. 129.5 Presentado el ET actualizado, Entidad aprueba en 15 días hábiles. 129.9 Se reconoce costo de estudio hasta 5% del Monto Total."
  },
  {
    numero: "Art. 132",
    titulo: "Fórmulas de reajuste",
    capitulo: "Capítulo IV - Fase de Ejecución",
    tituloGeneral: "Título III: Fases del Mecanismo",
    categoria: "financiamiento",
    etiquetas: ["reajuste", "formula polinomica", "k", "ds 011-79-vc", "ipc"],
    resumenClave: "En inversiones se aplica D.S. 011-79-VC (fórmulas polinómicas del presupuesto base). En valorizaciones mensuales se aplican los índices del mes previo y se regularizan en la liquidación.",
    impactoDecision: "Garantiza el reajuste económico de precios unitarios de asfalto, cemento y acero frente a la inflación en el CUI 2264872.",
    textoCompleto: "132.1 Expediente Técnico debe contener fórmulas de reajuste aplicables a valorizaciones mensuales. 132.2 Para inversiones se sujeta al D.S. N° 011-79-VC; se aplican los coeficientes e índices unificados publicados por INEI, actualizándose al mes de aprobación en la liquidación final."
  },
  {
    numero: "Art. 134",
    titulo: "Responsabilidad por incumplimiento de la Entidad Pública",
    capitulo: "Capítulo IV - Fase de Ejecución",
    tituloGeneral: "Título III: Fases del Mecanismo",
    categoria: "ejecucion",
    etiquetas: ["incumplimiento entidad", "mayores gastos generales", "denuncia cgr", "sancion funcionarios"],
    resumenClave: "Si la Entidad incumple obligaciones que afecten directamente el plazo de ejecución del Convenio, DA LUGAR AL RECONOCIMIENTO DE MAYORES GASTOS GENERALES debidamente sustentados. Si no emite CIPRL, queda impedida de suscribir nuevos convenios.",
    impactoDecision: "Soporte legal ineludible para cobrar gastos de dirección técnica, alquileres de campamento y fianzas durante los 249 días de atraso de terreno.",
    textoCompleto: "134.1 Incumplimiento de la Entidad impide firmar nuevos Convenios; se comunica a CGR y MEF. 134.3 Da lugar a procedimiento sancionador disciplinario contra funcionarios responsables. 134.4 El incumplimiento de obligaciones a cargo de la Entidad que afecten directamente el plazo da lugar al reconocimiento de los Mayores Gastos Generales en que incurra la Empresa Privada."
  },
  {
    numero: "Art. 135",
    titulo: "Responsabilidad por incumplimiento de la Empresa Privada y penalidades",
    capitulo: "Capítulo IV - Fase de Ejecución",
    tituloGeneral: "Título III: Fases del Mecanismo",
    categoria: "ejecucion",
    etiquetas: ["penalidades", "mora", "10%", "tope penalidad", "demora no imputable"],
    resumenClave: "Penalidad máxima por mora acumulada: DIEZ POR CIENTO (10%) del monto contractual (S/ 4,420,443.79). PÁRRAFO 135.7: NO CORRESPONDE APLICACIÓN DE PENALIDAD CUANDO EL INCUMPLIMIENTO O DEMORA SEA IMPUTABLE A LA ENTIDAD O POR CASO FORTUITO O FUERZA MAYOR; EN DICHO SUPUESTO PROCEDE LA AMPLIACIÓN DE PLAZO.",
    impactoDecision: "EL ARTÍCULO DE ORO PARA LA DEFENSA: El atraso de -31.43% provocado por la falta de entrega del Club Social no puede ser penalizado bajo el párrafo 135.7.",
    textoCompleto: "135.1 Retraso injustificado genera penalidad automática. 135.2 Se genera por cada día calendario de retraso. 135.3 Fórmula en Convenio. 135.5 La suma total no puede superar el 10% del monto total de la obligación (no incluye supervisión). 135.7 NO CORRESPONDE LA APLICACIÓN DE PENALIDAD cuando el incumplimiento o demora de parte de la Empresa Privada o el Ejecutor, sea imputable a la Entidad Pública o generada por caso fortuito o fuerza mayor. En dicho supuesto, se procede a la ampliación de los plazos de ejecución respectiva hasta que recupere el tiempo de demora causado."
  },
  {
    numero: "Art. 136",
    titulo: "Resolución del Convenio de Inversión",
    capitulo: "Capítulo IV - Fase de Ejecución",
    tituloGeneral: "Título III: Fases del Mecanismo",
    categoria: "ejecucion",
    etiquetas: ["resolucion", "carta notarial", "10 dias", "falta de terreno 3 meses"],
    resumenClave: "Causales de resolución de la Empresa: Entidad no entrega terreno en más de 3 meses tras cumplir requisitos (136.2.8), no aprueba documento de trabajo, incumple CIPRL o supera límites de variación. Procedimiento: Carta notarial con apercibimiento de 10 días (ampliable a 25).",
    impactoDecision: "Faculta al contratista a resolver el convenio si el GORE ICA supera los 3 meses sin entregar el terreno de Club Social, con reconocimiento de gastos e inventario.",
    textoCompleto: "136.1 Entidad resuelve por incumplimiento injustificado, tope 10% penalidad o paralización injustificada. 136.2 Empresa Privada puede resolver si: la Entidad no entrega terreno habiendo transcurrido más de 3 meses desde los requisitos habilitantes (numeral 8); incumple emisión de CIPRL; altera sustancialmente la concepción técnica. 136.4 Carta notarial dando plazo de 10 días (ampliable a 25) bajo apercibimiento."
  },
  {
    numero: "Art. 137",
    titulo: "Efectos de la resolución del Convenio",
    capitulo: "Capítulo IV - Fase de Ejecución",
    tituloGeneral: "Título III: Fases del Mecanismo",
    categoria: "ejecucion",
    etiquetas: ["efectos resolucion", "constatacion fisica", "inventario", "ciprl ejecutado"],
    resumenClave: "Paralización inmediata; constatación física e inventario notarial en mínimo 3 días hábiles. Emisión de Conformidad de Recepción de lo realmente ejecutado en 3 días para reconocimiento con CIPRL.",
    impactoDecision: "Protege la inversión realizada hasta el 53.65% (S/ 20.09M) garantizando su cobro íntegro mediante CIPRL en caso de resolución.",
    textoCompleto: "137.1 Paralización inmediata de obra y supervisión. 137.2 Carta notarial fija fecha de constatación con anticipación no menor a 3 días hábiles. 137.3 Reunión de partes con notario, levantamiento de acta y dentro de 3 días se emite conformidad de recepción y calidad de lo ejecutado para emisión de CIPRL."
  },
  {
    numero: "Art. 139",
    titulo: "Valorizaciones de obra",
    capitulo: "Capítulo IV - Fase de Ejecución",
    tituloGeneral: "Título III: Fases del Mecanismo",
    categoria: "financiamiento",
    etiquetas: ["valorizaciones", "plazos", "supervision 5 dias", "entidad mes siguiente", "mayores metrados"],
    resumenClave: "Formuladas mensualmente por el Ejecutor dentro de los 3 días del mes siguiente. Supervisión emite opinión en 5 días. La Entidad aprueba como máximo hasta el último día hábil del mes siguiente. Se formulan con metrados ejecutados x PU + GG + Utilidad + IGV. Numeral 139.7: Excepción por precios unitarios y mayores metrados.",
    impactoDecision: "Marco rector para la Valorización 17 (S/ 646,823.27) y su aprobación ineludible por supervisión y entidad.",
    textoCompleto: "139.1 Formuladas mensualmente por Ejecutor en primeros 3 días del mes siguiente. 139.2 y 139.3 Supervisión remite opinión en 5 días; Entidad aprueba hasta último día hábil del mes siguiente. 139.6 Criterios de formulación: metrados ejecutados x P.U. + Gastos Generales + Utilidad + IGV. 139.7 Mayores metrados se autorizan con anotación en cuaderno de incidencias."
  },
  {
    numero: "Art. 140",
    titulo: "Ampliación de plazos (Causales y Procedimiento Reglamentario)",
    capitulo: "Capítulo IV - Fase de Ejecución",
    tituloGeneral: "Título III: Fases del Mecanismo",
    categoria: "ejecucion",
    etiquetas: ["ampliacion de plazo", "art 140", "cuaderno de incidencias", "ruta critica", "silencio positivo"],
    resumenClave: "PROCEDIMIENTO EXACTO DE AMPLIACIÓN: 1. Ejecutor anota en Cuaderno de Incidencias el inicio y fin de la causal. 2. En 15 días de concluida solicita a Supervisión con copia a Entidad. 3. Supervisión opina en 5 días hábiles. 4. Titular de Entidad resuelve en 10 días hábiles (SILENCIO POSITIVO: de no resolver, se tiene por aprobado el informe supervisor, y si este no opinó, se aprueba la solicitud del contratista). 5. Se presenta nuevo CPM en 7 días hábiles. Atraso acumulado <80% obliga a nuevo cronograma de aceleración.",
    impactoDecision: "PIEZA MAESTRA DE DEFENSA: Ampara la solicitud de ampliación de plazo por 45 días calendario (Asiento 802) por afectación de la Ruta Crítica en sector Club Social, con aplicación del silencio administrativo positivo si el GORE Ica no responde en 10 días hábiles.",
    textoCompleto: "140.1 Causales: Atrasos/paralizaciones no atribuibles que modifiquen la Ruta Crítica; plazo adicional para Mayores Trabajos; otras en convenio. 140.2 Procedimiento: Anotación en Cuaderno de Incidencias de inicio y fin; solicitud en 15 días siguientes a supervisión con copia a entidad; supervisión opina en 5 días hábiles; Titular resuelve y notifica en 10 días hábiles. De no pronunciarse, SE TIENE POR APROBADA LA SOLICITUD. 140.4 Si valorización acumulada <80% de lo programado, se exige programa de aceleración en 7 días."
  },
  {
    numero: "Art. 142",
    titulo: "Mayores Trabajos (Adicionales de Obra)",
    capitulo: "Capítulo IV - Fase de Ejecución",
    tituloGeneral: "Título III: Fases del Mecanismo",
    categoria: "ejecucion",
    etiquetas: ["mayores trabajos", "adicionales", "expediente mayores trabajos", "adenda"],
    resumenClave: "Se anota en Cuaderno de Incidencias. Supervisión comunica a la Entidad en 3 días. Entidad autoriza expediente en 10 días. Contratista elabora expediente y supervisión evalúa en 5 días. Entidad aprueba por resolución en 10 días y suscribe adenda en 10 días hábiles. La demora genera Mayores Gastos Generales.",
    impactoDecision: "Regula el procedimiento para obras adicionales de saneamiento o muros de contención necesarios para la ciclovía.",
    textoCompleto: "142.1 Modificación de convenio por mayores trabajos indispensables. 142.2 Anotación en Cuaderno de Incidencias; supervisión comunica en 3 días; entidad autoriza en 10 días. 142.3 Empresa elabora expediente; supervisión opina en 5 días. 142.6 Aprobación por resolución en 10 días y suscripción de adenda en 10 días hábiles. 142.7 Demora de entidad genera mayores gastos generales."
  },
  {
    numero: "Art. 143",
    titulo: "Modificaciones al Convenio de Inversión (Adendas)",
    capitulo: "Capítulo IV - Fase de Ejecución",
    tituloGeneral: "Título III: Fases del Mecanismo",
    categoria: "ejecucion",
    etiquetas: ["adendas", "modificaciones", "limite variacion", "decimo tercera dcf"],
    resumenClave: "Se formalizan mediante adenda entre el Titular de la Entidad y la Empresa. Procede por aprobación de Expediente Técnico, Mayores Trabajos, Ampliaciones de Plazo y hechos sobrevinientes. Reconocidas según Décimo Tercera DCF de la Ley.",
    impactoDecision: "Marco para suscribir la Adenda N° 02 por ampliación de plazo a 668 días y futuros incrementos presupuestales debidamente sustentados.",
    textoCompleto: "143.1 Modificaciones se materializan mediante adendas suscritas por el titular y el representante de la Empresa. 143.3 Supuestos: Incorporación de ET, Mayores Trabajos, Deductivos, Ampliaciones de Plazo y hechos sobrevinientes. 143.5 Reconocimiento conforme a Décimo Tercera DCF de la Ley."
  },
  {
    numero: "Art. 145",
    titulo: "Culminación de la totalidad de las Inversiones",
    capitulo: "Capítulo IV - Fase de Ejecución",
    tituloGeneral: "Título III: Fases del Mecanismo",
    categoria: "ejecucion",
    etiquetas: ["culminacion", "recepcion de obra", "informe conformidad tecnica", "visita conjunta"],
    resumenClave: "Ejecutor anota culminación en Cuaderno de Incidencias. Supervisión en 7 días ratifica con Informe de Conformidad Técnica. En 20 días se realiza verificación conjunta de operatividad.",
    impactoDecision: "Hitos y plazos perentorios para la entrega de la ciclovía y evitar demoras de recepción imputables a la entidad.",
    textoCompleto: "145.1 Anotación de culminación en Cuaderno de Incidencias y solicitud de recepción. 145.2 Supervisión corrobora en 7 días y emite Informe de Conformidad Técnica. 145.3 Dentro de 20 días visita de verificación conjunta entre Entidad, Supervisión, Empresa y Ejecutor."
  },
  {
    numero: "Art. 146",
    titulo: "Recepción de las Inversiones y Conformidad",
    capitulo: "Capítulo IV - Fase de Ejecución",
    tituloGeneral: "Título III: Fases del Mecanismo",
    categoria: "ejecucion",
    etiquetas: ["recepcion", "conformidad de calidad", "consentimiento recepcion", "recepciones parciales"],
    resumenClave: "Supervisión emite Conformidad de Calidad y Entidad la Conformidad de Recepción. Si Entidad no se pronuncia en 5 días tras visita conjunta, QUEDA CONSENTIDA LA RECEPCIÓN si hay Conformidad de Calidad. La demora genera Mayores Gastos Generales.",
    impactoDecision: "Evita que la Entidad congele la entrega de obra; opera el consentimiento de recepción por silencio de 5 días hábiles.",
    textoCompleto: "146.1 Supervisión emite Conformidad de Calidad; Entidad emite Conformidad de Recepción. 146.3 Si Entidad no emite conformidad en 5 días tras visita conjunta, queda consentida si supervisor otorgó Conformidad de Calidad; el atraso genera mayores gastos generales. 146.5 Permite recepciones parciales de tramos diferenciados."
  },
  {
    numero: "Art. 147",
    titulo: "Observaciones a la culminación de Inversiones",
    capitulo: "Capítulo IV - Fase de Ejecución",
    tituloGeneral: "Título III: Fases del Mecanismo",
    categoria: "ejecucion",
    etiquetas: ["observaciones", "pliego de observaciones", "subsanacion", "45 dias"],
    resumenClave: "Plazo de subsanación: un décimo (1/10) del plazo o 45 días calendario, el que resulte mayor. Subsanadas, la Entidad verifica en 5 días sin poder formular nuevas observaciones.",
    impactoDecision: "Protección legal ante supervisión: no se pueden crear observaciones nuevas en la segunda inspección.",
    textoCompleto: "147.1 Se consignan en acta o pliego. Plazo de subsanación: 1/10 del plazo o 45 días calendario (el mayor), desde el 5to día de suscrita. 147.3 Verificación de subsanación en 5 días: PROHIBIDO formular nuevas observaciones."
  },
  {
    numero: "Art. 148",
    titulo: "Liquidación por obligación para Inversiones",
    capitulo: "Capítulo IV - Fase de Ejecución",
    tituloGeneral: "Título III: Fases del Mecanismo",
    categoria: "ejecucion",
    etiquetas: ["liquidacion", "60 dias", "consentimiento liquidacion", "carta notarial"],
    resumenClave: "Empresa presenta en 60 días calendario o 1/10 del plazo (el mayor). Entidad se pronuncia en 60 días. Si Entidad no se pronuncia, QUEDA CONSENTIDA LA LIQUIDACIÓN mediante carta notarial con valor de resolución.",
    impactoDecision: "Garantía de cierre económico célere y emisión del CIPRL final de liquidación.",
    textoCompleto: "148.1 Presentación en 60 días o 1/10 del plazo vigente (el mayor). 148.2 Entidad se pronuncia en 60 días. 148.4 Si la Entidad no se pronuncia en 60 días, la liquidación queda CONSENTIDA, invocándose mediante carta notarial con plenos efectos resolutivos."
  },

  // TÍTULO III: CIPRL, EMISIÓN Y NEGOCIABILIDAD
  {
    numero: "Art. 176",
    titulo: "Características del CIPRL y CIPGN",
    capitulo: "Capítulo IV - Fase de Ejecución",
    tituloGeneral: "Título III: Fases del Mecanismo",
    categoria: "ciprl",
    etiquetas: ["ciprl", "caracteristicas", "vigencia 10 anos", "fraccionable", "negociable"],
    resumenClave: "A la orden de la Empresa con RUC, expresado en Soles, cancelatorio para tributos recaudados por SUNAT (Renta, IGV, ISC), fraccionable, NEGOCIABLE Y VIGENCIA DE 10 AÑOS.",
    impactoDecision: "Respalda la liquidez financiera del Consorcio: los títulos se pueden negociar o endosar a terceros si no se aplican a rentas propias.",
    textoCompleto: "El CIPRL: 1. Se emite a la orden de la Empresa Privada con su RUC y nombre de la Entidad. 2. Expresado en Soles. 3. Carácter cancelatorio para pago de deuda tributaria según Art. 7.2 de la Ley. 4. Fraccionable. 5. Negociable. 6. Vigencia de 10 años. 8. No aplica comisión de recaudación SUNAT."
  },
  {
    numero: "Art. 177",
    titulo: "Condiciones para solicitar emisión de CIPRL",
    capitulo: "Capítulo IV - Fase de Ejecución",
    tituloGeneral: "Título III: Fases del Mecanismo",
    categoria: "ciprl",
    etiquetas: ["condiciones ciprl", "trimestral", "afectacion siaf", "cuentas cut"],
    resumenClave: "Para obras mayores a 5 meses, la entrega se realiza por AVANCES TRIMESTRALES con valorizaciones mensuales aprobadas por supervisión y registro SIAF.",
    impactoDecision: "Habilita la emisión periódica de CIPRL trimestrales sin tener que esperar a la culminación de los 668 días de obra.",
    textoCompleto: "177.1 Requisitos en convenio: funcionarios responsables de conformidades, aprobación de valorizaciones, afectación presupuestal y financiera en SIAF. 177.4 En obras >5 meses se emite por avances trimestrales según Art. 181. 177.13 Gasto girado en SIAF en 3 días de recibido el CIPRL."
  },
  {
    numero: "Art. 178",
    titulo: "Solicitud y emisión de los CIPRL o CIPGN",
    capitulo: "Capítulo IV - Fase de Ejecución",
    tituloGeneral: "Título III: Fases del Mecanismo",
    categoria: "ciprl",
    etiquetas: ["emision dgtp", "plazos dgtp", "tasa inflacion", "6 dias"],
    resumenClave: "Entidad solicita a DGTP en máximo 3 días de otorgadas conformidades o valorizaciones. DGTP emite electrónicamente en 6 DÍAS HÁBILES. Numeral 178.12: Si no se utiliza en el año fiscal, se actualiza reconociendo la TASA DE INFLACIÓN acumulada de los últimos 12 meses (no gravada con IR).",
    impactoDecision: "Blindaje financiero contra la devaluación monetaria del saldo por ejecutar (S/ 16.31M).",
    textoCompleto: "178.1 Entidad solicita en 3 días de aprobada la valorización trimestral. 178.8 DGTP emite electrónicamente dentro de 6 días hábiles. 178.12 CIPRL no utilizado en el ejercicio genera reconocimiento de inflación acumulada de 12 meses sin estar gravado con IR."
  },
  {
    numero: "Art. 180",
    titulo: "Emisión de CIPRL por la DGTP ante incumplimiento de la Entidad",
    capitulo: "Capítulo IV - Fase de Ejecución",
    tituloGeneral: "Título III: Fases del Mecanismo",
    categoria: "ciprl",
    etiquetas: ["emision directa mef", "incumplimiento entidad", "dgtp directa", "cgr"],
    resumenClave: "MECANISMO ANTIBLOQUEO: Si la Entidad no solicita el CIPRL, la Empresa comunica a DGPPIP. Si Entidad no responde en 5 días hábiles, DGTP EMITE Y ENTREGA DIRECTAMENTE EL CIPRL A LA EMPRESA EN 10 DÍAS HÁBILES deduciendo los fondos de la entidad.",
    impactoDecision: "HERRAMIENTA MÁXIMA DE COBRO: El contratista no depende del visto bueno político del GORE ICA; si los requisitos están cumplidos, el MEF emite el CIPRL de oficio.",
    textoCompleto: "180.1 Si Entidad no solicita CIPRL, Empresa comunica a DGPPIP. 180.2 DGPPIP corre traslado a Entidad por 5 días hábiles. 180.4 Si persiste incumplimiento, comunica a CGR y Entidad queda bloqueada de firmar nuevos convenios. 180.7 DGTP emite y entrega el CIPRL directamente a la Empresa Privada en no más de 10 días hábiles deduciendo de las transferencias del Gobierno Regional."
  },
  {
    numero: "Art. 181",
    titulo: "Emisión de CIPRL por avance",
    capitulo: "Capítulo IV - Fase de Ejecución",
    tituloGeneral: "Título III: Fases del Mecanismo",
    categoria: "ciprl",
    etiquetas: ["avance trimestral", "emision por avance", "valorizaciones"],
    resumenClave: "En obras de más de 5 meses, los certificados se emiten trimestralmente sobre la base de valorizaciones mensuales aprobadas por la supervisión.",
    impactoDecision: "Sustenta la periodicidad trimestral de canje de valorizaciones en el CUI 2264872.",
    textoCompleto: "1. En obras con plazo mayor a cinco (5) meses, la entrega de CIPRL se realiza por avances en la ejecución, pudiendo solicitarse a la recepción de cada avance, incluso por periodos menores a 3 meses. 2. Requiere cada valorización mensual aprobada con opinión favorable de la Entidad Privada Supervisora."
  },
  {
    numero: "Art. 183",
    titulo: "Utilización y aplicación del CIPRL ante SUNAT (Límite del 80%)",
    capitulo: "Capítulo IV - Fase de Ejecución",
    tituloGeneral: "Título III: Fases del Mecanismo",
    categoria: "ciprl",
    etiquetas: ["sunat", "80% impuesto", "renta", "igv", "tributos", "no multas"],
    resumenClave: "Se aplica contra deuda tributaria hasta por el OCHENTA POR CIENTO (80%) del Impuesto a la Renta (pagos a cuenta o regularización), ITAN o IGV. No aplica para multas.",
    impactoDecision: "Instruye la aplicación fiscal para el Consorcio o para los compradores de certificados en bolsa.",
    textoCompleto: "183.1 Aplica contra deuda tributaria hasta el límite del 80% para Renta (pagos a cuenta y anual), ITAN e IGV. No aplica para multas. 183.5 El saldo no aplicado se traslada al ejercicio siguiente con reconocimiento de inflación."
  },

  // TÍTULO IV: SOLUCIÓN DE CONTROVERSIAS
  {
    numero: "Art. 187",
    titulo: "Trato directo (Procedimiento Obligatorio y Efectos de Transacción)",
    capitulo: "Capítulo IV - Subcapítulo VIII Solución de Controversias",
    tituloGeneral: "Título III: Fases del Mecanismo",
    categoria: "controversias",
    etiquetas: ["trato directo", "solucion de controversias", "carta notarial", "10 dias", "transaccion", "no suspende obra"],
    resumenClave: "ETAPA PREVIA OBLIGATORIA: Se inicia por carta notarial detallando controversia y propuesta de solución (copia a Proinversión en 5 días). La otra parte responde en 10 DÍAS HÁBILES. El acuerdo formalizado en Acta tiene EFECTOS LEGALES DE TRANSACCIÓN Y COSA JUZGADA. Durante el trámite NO SE SUSPENDE LA OBRA NI EL RECONOCIMIENTO DE AVANCES.",
    impactoDecision: "CANAL IDEAL DE ACUERDO: Permite al Consorcio y al GORE ICA suscribir un acta de trato directo reconociendo la ampliación de plazo y mayores gastos generales sin ir a arbitraje.",
    textoCompleto: "187.1 Requisito previo a conciliación/arbitraje. El acuerdo tiene efecto vinculante y ejecutable con efectos legales de transacción. 187.2 No suspende plazo de obra ni reconocimiento de avances. 187.4 Inicia por carta notarial sustentando petición y solución; copia a Proinversión en 5 días. 187.5 Contraparte contesta en 10 días hábiles. Plazo de caducidad: 30 días hábiles. 187.6 Aplica a todos los aspectos salvo penalidades ya liquidadas. 187.8 Proinversión puede emitir informe orientador."
  },
  {
    numero: "Art. 188",
    titulo: "Prórroga del plazo de trato directo",
    capitulo: "Capítulo IV - Subcapítulo VIII Solución de Controversias",
    tituloGeneral: "Título III: Fases del Mecanismo",
    categoria: "controversias",
    etiquetas: ["prorroga trato directo", "peritaje", "60 dias habiles"],
    resumenClave: "Se puede prorrogar por única vez hasta por SESENTA (60) DÍAS HÁBILES adicionales si se requiere peritaje técnico o informe especializado. Si no responden en 5 días, se entiende aceptada la prórroga.",
    impactoDecision: "Otorga tiempo suficiente para realizar el peritaje técnico del impacto del Club Social en la Ruta Crítica sin que caduque el derecho arbitral.",
    textoCompleto: "El plazo de trato directo puede prorrogarse por única vez hasta por sesenta (60) días hábiles adicionales cuando se requiera peritaje, informe técnico o pronunciamiento especializado. La solicitud se responde en 5 días hábiles; de no pronunciarse, SE ENTIENDE POR ACEPTADA."
  },
  {
    numero: "Art. 189",
    titulo: "Conciliación y Arbitraje",
    capitulo: "Capítulo IV - Subcapítulo VIII Solución de Controversias",
    tituloGeneral: "Título III: Fases del Mecanismo",
    categoria: "controversias",
    etiquetas: ["arbitraje", "conciliacion", "laudo inapelable", "cosa juzgada"],
    resumenClave: "De no prosperar el trato directo, se acude a arbitraje institucional o conciliación en centro acreditado por MINJUS dentro de 30 días hábiles. El laudo arbitral es DEFINITIVO, INAPELABLE Y TIENE VALOR DE COSA JUZGADA.",
    impactoDecision: "Vía residual de protección en caso de negativa arbitraria de la Entidad a reconocer ampliaciones de plazo.",
    textoCompleto: "189.1 Partes someten controversias a conciliación o arbitraje según convenio. 189.2 Arbitraje institucional con reglamento institucional. 189.3 Conciliación facultativa previa ante centro MINJUS. 189.5 El laudo arbitral emitido es definitivo e inapelable, tiene el valor de cosa juzgada y se ejecuta como sentencia."
  },

  // DISPOSICIONES COMPLEMENTARIAS
  {
    numero: "Tercera DCF",
    titulo: "Remisión de documentación obligatoria a DGPPIP y Proinversión",
    capitulo: "Disposiciones Complementarias Finales",
    tituloGeneral: "Disposiciones Complementarias",
    categoria: "especiales",
    etiquetas: ["dcf", "remision", "adendas", "actas suspension", "10 dias"],
    resumenClave: "Entidades y Empresas Privadas deben remitir en 10 días hábiles copia de convenios, adendas, actas de suspensión de plazo, informes de conformidad y resoluciones a DGPPIP y Proinversión.",
    impactoDecision: "Garantiza la validez registral de las ampliaciones del proyecto Ciclovía Cutervo - Huacachina en los sistemas centrales del MEF.",
    textoCompleto: "Las Entidades Públicas y las Empresas Privadas deben remitir a la DGPPIP y Proinversión, bajo responsabilidad y dentro de los diez (10) días hábiles de suscritos: copia de convenios, adendas, actas de suspensión de plazo, contratos de supervisión, conformidades de calidad y recepción, y resoluciones de liquidación."
  },
  {
    numero: "Tercera DCT",
    titulo: "Emisión de CIPRL en mérito a Ley N° 32460",
    capitulo: "Disposiciones Complementarias Transitorias",
    tituloGeneral: "Disposiciones Transitorias",
    categoria: "especiales",
    etiquetas: ["dct", "ley 32460", "tmca", "cut 72 horas", "priorizacion"],
    resumenClave: "Gobiernos Regionales con TMCA derivado de Espacio Total financian CIPRL con fuentes de presupuesto institucional; los recursos deben estar en CUT con 72 horas de anticipación.",
    impactoDecision: "Regula el soporte presupuestario del GORE ICA para la emisión continua de certificados de inversión.",
    textoCompleto: "Para entidades con TMCA producto del Espacio Total: El financiamiento de CIPRL se cubre con presupuesto institucional en periodo no mayor a 2 años; fondos centralizados en CUT con mínimo 72 horas de anticipación a fechas de pago."
  }
];
