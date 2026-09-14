import React from "react";
import { Database, MessageSquare, Sparkles, Radio } from "lucide-react";
import { LOS_FLAMENCOS_LOGO } from "../assets/logo";
import { EVMMetrics, StorageStatus } from "../types";

interface HeaderProps {
  storageStatus: StorageStatus;
  totalRecords: number;
  lastSavedText: string;
  metrics: EVMMetrics;
  storageKey: string;
  dbName: string;
  onOpenChat?: () => void;
  onOpenAudioChat?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  storageStatus,
  totalRecords,
  lastSavedText,
  metrics,
  storageKey,
  dbName,
  onOpenChat,
  onOpenAudioChat,
}) => {
  return (
    <header className="relative z-20 sticky top-0 backdrop-blur-xl bg-[#030A18]/90 border-b-2 border-[#7B1C1C] shadow-[0_4px_30px_rgba(0,0,0,0.6)]">
      <div className="border-b border-[#FF6B00]/30 h-1 w-full bg-gradient-to-r from-[#7B1C1C] via-[#FF6B00] to-[#D4A574]" />
      <div className="max-w-[1600px] mx-auto px-3 md:px-6 py-3 flex items-center gap-4">
        {/* Logo */}
        <div className="w-[68px] h-[68px] md:w-[84px] md:h-[84px] bg-white rounded-xl p-1.5 shadow-lg shrink-0 border border-[#1E3A5F] flex items-center justify-center">
          <img
            src={LOS_FLAMENCOS_LOGO}
            alt="Logo Consorcio Los Flamencos"
            className="w-full h-full object-contain rounded-lg"
          />
        </div>

        {/* Project Details */}
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-[13px] md:text-[18px] font-bold tracking-tight leading-tight text-[#E6F1FF]">
              DASHBOARD FINAL TODOS ITEMS EDITABLES ACUMULABLES GUARDABLES ALMACENADOS PERSISTENTES
            </h1>
            <span className="px-2 py-0.5 rounded bg-[#7B1C1C] text-white text-[10px] font-mono font-bold">
              CUI 2264872
            </span>
            <span className="px-2 py-0.5 rounded bg-[#0B1D3A] border border-[#1E3A5F] text-[#D4A574] text-[10px] font-mono font-bold">
              668d
            </span>
          </div>

          <div className="text-[11px] md:text-[12px] text-[#8AA0C0] mt-1 font-mono flex flex-wrap gap-x-3 gap-y-1 items-center">
            <span className="text-[#E6F1FF] font-semibold">
              ING. JOSE LUIS PAYSIS VELASQUEZ CIP 101507
            </span>
            <span className="text-[#D4A574]">CONSORCIO LOS FLAMENCOS</span>
            <span className="hidden md:inline">
              CICLOVIA CUTERVO-HUACACHINA • Ley 29230 DS 038-2026-EF
            </span>
            <span className="text-[#F45D47] font-bold">
              Val 17 S/646,823.27 Acum S/20.09M Saldo S/16.31M
            </span>
          </div>

          <div className="flex items-center gap-2 mt-2">
            <div className="flex items-center gap-1.5 text-[10px] font-mono px-2.5 py-1 rounded-full border bg-[#0B1D3A] border-[#1E3A5F]">
              <div
                className={`w-2 h-2 rounded-full ${
                  storageStatus === "guardado"
                    ? "bg-emerald-400 animate-pulse"
                    : storageStatus === "pendiente"
                    ? "bg-amber-400 animate-pulse"
                    : "bg-red-400"
                }`}
              />
              <span
                className={
                  storageStatus === "guardado"
                    ? "text-emerald-300"
                    : storageStatus === "pendiente"
                    ? "text-amber-300"
                    : "text-red-300"
                }
              >
                {storageStatus === "guardado"
                  ? `Almacenado ✓ ${totalRecords} regs • ${lastSavedText}`
                  : storageStatus === "pendiente"
                  ? "Pendiente guardar • auto 800ms"
                  : "No almacenado • cargando base Excel 51 hojas"}
              </span>
            </div>

            <div className="hidden md:flex items-center gap-1 text-[10px] font-mono text-[#8AA0C0]">
              <Database size={12} className="text-[#D4A574]" />
              <span>LocalStorage key {storageKey} + IndexedDB {dbName}</span>
            </div>

            {onOpenAudioChat && (
              <button
                onClick={onOpenAudioChat}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#030A18] hover:bg-[#0B1D3A] text-[#FEF3C7] border border-[#FF6B00] text-[10px] font-mono font-bold hover:brightness-110 active:scale-95 transition-all shadow-sm"
                title="Abrir Radio de Obra / Chat de Audio Interactivo por Voz"
              >
                <div className="relative">
                  <Radio size={12} className="text-[#FF6B00]" />
                  <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 bg-emerald-400 rounded-full animate-ping" />
                </div>
                <span>Audio Chat IA</span>
              </button>
            )}

            {onOpenChat && (
              <button
                onClick={onOpenChat}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-gradient-to-r from-[#7B1C1C] to-[#FF6B00] text-white text-[10px] font-mono font-bold hover:brightness-110 active:scale-95 transition-all shadow-sm border border-[#FF6B00]/40"
              >
                <MessageSquare size={12} />
                <span>Chatbox IA</span>
                <Sparkles size={10} className="text-[#FEF3C7]" />
              </button>
            )}
          </div>
        </div>

        {/* Global KPI Counters */}
        <div className="hidden lg:flex flex-col items-end gap-1 shrink-0">
          <div className="grid grid-cols-4 gap-1.5">
            <div className="bg-[#0B1D3A] border border-[#1E3A5F] rounded px-2 py-1 text-center min-w-[70px]">
              <div className="text-[9px] text-[#8AA0C0]">SPI</div>
              <div
                className={`text-[12px] font-bold font-mono ${
                  metrics.spi < 0.7 ? "text-red-400" : "text-emerald-300"
                }`}
              >
                {metrics.spi.toFixed(2)}
              </div>
            </div>

            <div className="bg-[#0B1D3A] border border-[#1E3A5F] rounded px-2 py-1 text-center min-w-[70px]">
              <div className="text-[9px] text-[#8AA0C0]">CPI</div>
              <div
                className={`text-[12px] font-bold font-mono ${
                  metrics.cpi < 0.9 ? "text-amber-300" : "text-emerald-300"
                }`}
              >
                {metrics.cpi.toFixed(2)}
              </div>
            </div>

            <div className="bg-[#0B1D3A] border border-[#1E3A5F] rounded px-2 py-1 text-center min-w-[70px]">
              <div className="text-[9px] text-[#8AA0C0]">PPC</div>
              <div className="text-[12px] font-bold font-mono text-[#D4A574]">
                {metrics.ppc}%
              </div>
            </div>

            <div className="bg-[#0B1D3A] border border-[#1E3A5F] rounded px-2 py-1 text-center min-w-[70px]">
              <div className="text-[9px] text-[#8AA0C0]">TP</div>
              <div className="text-[12px] font-bold font-mono text-emerald-300">
                {metrics.tp}%
              </div>
            </div>
          </div>

          <div className="text-[10px] font-mono text-[#F45D47] font-semibold">
            Prog {metrics.prog}% vs Ejec {metrics.ejec}% ATRASO {metrics.atraso.toFixed(2)}%
          </div>
        </div>
      </div>
    </header>
  );
};
