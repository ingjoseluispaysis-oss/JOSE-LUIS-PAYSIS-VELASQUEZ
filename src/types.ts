export interface ProyectoInfo {
  cui: string;
  nombre: string;
  cliente: string;
  contratista: string;
  supervision: string;
  jefe: string;
  residente: string;
  presupuestoConIGV: number;
  presupuestoSinIGV: number;
  plazoOrig: number;
  plazoActual: number;
  inicio: string;
  fin: string;
  montoContratado: number;
  historial: string[];
}

export interface NormaItem {
  id: string;
  art: string;
  desc: string;
  estado: 'Cumple' | 'No Cumple' | 'En proceso';
  evidencia: string;
  resp: string;
  fecha: string;
}

export interface ProcesoItem {
  id: string;
  proceso: string;
  tipo: 'Estratégico' | 'Operativo' | 'Soporte';
  desc: string;
  dueno: string;
  kpi: string;
  eff: number;
}

export interface SIPOCData {
  suppliers: string;
  inputs: string;
  process: string;
  outputs: string;
  customers: string;
}

export interface SQLSheetRow {
  id: number;
  codigo: string;
  descripcion: string;
  und: string;
  metrado: number;
  pu: number;
  parcial: number;
}

export interface SQLSheet {
  name: string;
  rows: SQLSheetRow[];
}

export interface ValorizacionRow {
  id: number;
  codigo: string;
  desc: string;
  und: string;
  metrado: number;
  pu: number;
  parcial: number;
  acum: number;
  saldo: number;
  avance: number;
  sector: string;
  // Official detailed fields from Valorización N° 17
  metradoAnt?: number;
  parcialAnt?: number;
  porcAnt?: number;
  metradoAct?: number;
  parcialAct?: number;
  porcAct?: number;
  metradoAcum?: number;
  parcialAcum?: number;
  saldoMetrado?: number;
  saldoMonto?: number;
  saldoPorc?: number;
}

export interface MetradoDiarioRow {
  id: number;
  base: number;
  ejec: number;
  acum: number;
  saldo: number;
  frente: string;
  fecha: string;
}

export interface CuadrillaItem {
  id: string;
  nombre: string;
  capataz: string;
  integ: number;
  rendTeor: number;
  rendReal: number;
  hh: number;
  costo: number;
  sector: string;
}

export interface ActividadCPM {
  cod: string;
  desc: string;
  dur: number;
  inicio: string;
  fin: string;
  pred: string;
  tipo: 'FS' | 'SS' | 'FF' | 'SF';
  lag: number;
  es: number;
  ef: number;
  ls: number;
  lf: number;
  holg: number;
  crit: boolean;
  avance: number;
}

export interface RestriccionItem {
  id: string;
  actividad: string;
  tipo: string;
  estado: 'OK' | 'NO';
  liberado: 'Si' | 'No';
  fechaLib: string;
  responsable: string;
}

export interface RiesgoItem {
  id: string;
  causa: string;
  inicio: string;
  fin: string;
  dias: number;
  evidencia: string;
  norma: string;
  prob: number;
  impacto: number;
  nivel: 'Crítico' | 'Alto' | 'Medio' | 'Bajo';
}

export interface EscenarioItem {
  id: string;
  variable: string;
  valor: string;
  impactoPlazo: string;
  impactoCosto: string;
  riesgo: string;
  roi: string;
}

export interface EVMMetrics {
  prog: number;
  ejec: number;
  atraso: number;
  spi: number;
  cpi: number;
  bac: number;
  ev: number;
  pv: number;
  ac: number;
  eac: number;
  vac: number;
  ppc: number;
  tp: number;
  tc: number;
  tnc: number;
}

export type StorageStatus = 'guardado' | 'pendiente' | 'no';

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant' | 'system';
  text: string;
  timestamp: string;
  category?: 'contractual' | 'evm' | 'campo' | 'legal' | 'calidad' | 'general';
  suggestedAction?: {
    tabId: number;
    label: string;
  };
}

export type QuickIndicatorId =
  | 'spi'
  | 'cpi'
  | 'ppc'
  | 'riesgos'
  | 'desvio'
  | 'tp'
  | 'plazo'
  | 'saldo'
  | 'montecarlo';

export interface QuickWidgetConfig {
  id: QuickIndicatorId;
  label: string;
  desc: string;
  category: 'evm' | 'lps' | 'riesgos' | 'contractual';
  enabled: boolean;
  order: number;
}
