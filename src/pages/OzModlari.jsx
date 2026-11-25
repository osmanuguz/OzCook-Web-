import { useState } from 'react';
import { Flame, Footprints, Droplets, HeartPulse, Plus } from 'lucide-react';

export default function OzModlari({ saglikVerisi, onSuEkle, onAdimEkle }) {
  const [seciliMod, setSeciliMod] = useState('OzDay');
  const modlar = ['OzDay', 'OzFit', 'OzHealth'];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-2 p-1 rounded-2xl bg-white/80 dark:bg-zinc-900/80 border border-red-900/10 dark:border-red-500/20">
        {modlar.map((mod) => (
          <button
            key={mod}
            type="button"
            onClick={() => setSeciliMod(mod)}
            className={`py-2.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
              seciliMod === mod
                ? 'bg-[#B71C1C] text-white shadow-sm'
                : 'text-zinc-600 dark:text-zinc-300 hover:bg-red-900/5'
            }`}
          >
            {mod}
          </button>
        ))}
      </div>

      {seciliMod === 'OzDay' && (
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="rounded-2xl bg-white/90 dark:bg-zinc-900/90 border border-red-900/10 dark:border-red-500/20 p-5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-[#B71C1C] dark:text-red-400">
                Günlük Kalori
              </span>
              <Flame className="w-4 h-4 text-[#B71C1C] dark:text-red-400" />
            </div>
            <p className="text-2xl font-bold">
              {saglikVerisi.alinanKalori}{' '}
              <span className="text-sm font-normal text-zinc-500">
                / {saglikVerisi.kaloriHedefi} kcal
              </span>
            </p>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Tahmini yakılan: {saglikVerisi.yakilanKalori} kcal
            </p>
          </div>

          <div className="rounded-2xl bg-white/90 dark:bg-zinc-900/90 border border-red-900/10 dark:border-red-500/20 p-5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-[#B71C1C] dark:text-red-400">
                Su Takibi
              </span>
              <Droplets className="w-4 h-4 text-[#B71C1C] dark:text-red-400" />
            </div>
            <div className="flex items-center justify-between">
              <p className="text-2xl font-bold">
                {saglikVerisi.suBardak}{' '}
                <span className="text-sm font-normal text-zinc-500">
                  / {saglikVerisi.suHedefi} bardak
                </span>
              </p>
              <button
                type="button"
                onClick={onSuEkle}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-[#B71C1C] text-white text-xs font-medium cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+1 Bardak</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {seciliMod === 'OzFit' && (
        <div className="rounded-2xl bg-white/90 dark:bg-zinc-900/90 border border-red-900/10 dark:border-red-500/20 p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Footprints className="w-5 h-5 text-[#B71C1C] dark:text-red-400" />
              <h3 className="font-semibold">OzFit Hareket & Adım</h3>
            </div>
            <button
              type="button"
              onClick={() => onAdimEkle(1000)}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-[#B71C1C] text-white text-xs font-medium cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>1.000 Adım Ekle</span>
            </button>
          </div>
          <p className="text-2xl font-bold">
            {saglikVerisi.adim.toLocaleString('tr-TR')}{' '}
            <span className="text-sm font-normal text-zinc-500">
              / {saglikVerisi.adimHedefi.toLocaleString('tr-TR')} adım
            </span>
          </p>
        </div>
      )}

      {seciliMod === 'OzHealth' && (
        <div className="rounded-2xl bg-white/90 dark:bg-zinc-900/90 border border-red-900/10 dark:border-red-500/20 p-5 space-y-2">
          <div className="flex items-center gap-2">
            <HeartPulse className="w-5 h-5 text-[#B71C1C] dark:text-red-400" />
            <h3 className="font-semibold">OzHealth Özet</h3>
          </div>
          <p className="text-sm text-zinc-600 dark:text-zinc-300">
            Ortalama uyku süresi: <strong>{saglikVerisi.uykuSaat} saat</strong> • Web
            senkronizasyon modu aktif.
          </p>
        </div>
      )}
    </div>
  );
}