import { useState } from 'react';
import {
  Flame,
  Footprints,
  Droplets,
  HeartPulse,
  Plus,
  Minus,
  Moon,
  Target,
} from 'lucide-react';

function IlerlemeCubugu({ deger, hedef }) {
  const yuzde = Math.min(100, Math.round((deger / Math.max(1, hedef)) * 100));
  return (
    <div className="space-y-1">
      <div className="h-2.5 w-full rounded-full bg-zinc-200 dark:bg-zinc-800 overflow-hidden">
        <div
          className="h-full rounded-full bg-[#B71C1C] dark:bg-red-500 transition-all duration-300"
          style={{ width: `${yuzde}%` }}
        />
      </div>
      <p className="text-[11px] text-right text-zinc-500 dark:text-zinc-400">%{yuzde}</p>
    </div>
  );
}

export default function OzModlari({
  saglikVerisi,
  onSuEkle,
  onAdimEkle,
  onKaloriEkle,
  onUykuGuncelle,
  onHedefGuncelle,
}) {
  const [seciliMod, setSeciliMod] = useState('OzDay');
  const [manuelKalori, setManuelKalori] = useState('');
  const [hedefAcik, setHedefAcik] = useState(false);
  const [hedefForm, setHedefForm] = useState({
    kaloriHedefi: saglikVerisi.kaloriHedefi,
    suHedefi: saglikVerisi.suHedefi,
    adimHedefi: saglikVerisi.adimHedefi,
  });

  const modlar = ['OzDay', 'OzFit', 'OzHealth'];

  const kaloriGonder = (e) => {
    e.preventDefault();
    const miktar = parseInt(manuelKalori, 10);
    if (!Number.isNaN(miktar) && miktar > 0) {
      onKaloriEkle(miktar);
      setManuelKalori('');
    }
  };

  const hedefKaydet = (e) => {
    e.preventDefault();
    onHedefGuncelle(hedefForm);
    setHedefAcik(false);
  };

  return (
    <div className="space-y-4">
      {/* Mod Seçici ve Hedef Butonu */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex-1 grid grid-cols-3 gap-2 p-1 rounded-2xl bg-white/80 dark:bg-zinc-900/80 border border-red-900/10 dark:border-red-500/20">
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

        <button
          type="button"
          onClick={() => setHedefAcik(!hedefAcik)}
          className="inline-flex items-center gap-1.5 px-3.5 py-3 rounded-2xl bg-white/90 dark:bg-zinc-900/90 border border-red-900/10 dark:border-red-500/20 text-xs font-semibold hover:bg-red-900/5 cursor-pointer"
        >
          <Target className="w-4 h-4 text-[#B71C1C] dark:text-red-400" />
          <span>Hedefler</span>
        </button>
      </div>

      {/* Hedef Düzenleme Paneli */}
      {hedefAcik && (
        <form
          onSubmit={hedefKaydet}
          className="rounded-2xl bg-white/90 dark:bg-zinc-900/90 border border-red-900/15 dark:border-red-500/25 p-4 space-y-3"
        >
          <h3 className="text-sm font-bold">Günlük Hedeflerini Güncelle</h3>
          <div className="grid sm:grid-cols-3 gap-3 text-xs">
            <label className="space-y-1">
              <span className="text-zinc-500 dark:text-zinc-400">Kalori Hedefi (kcal)</span>
              <input
                type="number"
                value={hedefForm.kaloriHedefi}
                onChange={(e) => setHedefForm({ ...hedefForm, kaloriHedefi: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 outline-none focus:ring-2 focus:ring-[#B71C1C]"
              />
            </label>
            <label className="space-y-1">
              <span className="text-zinc-500 dark:text-zinc-400">Su Hedefi (bardak)</span>
              <input
                type="number"
                value={hedefForm.suHedefi}
                onChange={(e) => setHedefForm({ ...hedefForm, suHedefi: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 outline-none focus:ring-2 focus:ring-[#B71C1C]"
              />
            </label>
            <label className="space-y-1">
              <span className="text-zinc-500 dark:text-zinc-400">Adım Hedefi</span>
              <input
                type="number"
                value={hedefForm.adimHedefi}
                onChange={(e) => setHedefForm({ ...hedefForm, adimHedefi: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 outline-none focus:ring-2 focus:ring-[#B71C1C]"
              />
            </label>
          </div>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setHedefAcik(false)}
              className="px-3 py-1.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-xs font-medium cursor-pointer"
            >
              Vazgeç
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 rounded-xl bg-[#B71C1C] text-white text-xs font-semibold cursor-pointer"
            >
              Kaydet
            </button>
          </div>
        </form>
      )}

      {/* OZDAY */}
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
            <IlerlemeCubugu
              deger={saglikVerisi.alinanKalori}
              hedef={saglikVerisi.kaloriHedefi}
            />
            <form onSubmit={kaloriGonder} className="flex gap-2 pt-1">
              <input
                type="number"
                min="1"
                placeholder="Örn: 350 kcal"
                value={manuelKalori}
                onChange={(e) => setManuelKalori(e.target.value)}
                className="flex-1 px-3 py-1.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-xs outline-none focus:ring-2 focus:ring-[#B71C1C]"
              />
              <button
                type="submit"
                className="px-3 py-1.5 rounded-xl bg-[#B71C1C] text-white text-xs font-semibold cursor-pointer"
              >
                + Ekle
              </button>
            </form>
          </div>

          <div className="rounded-2xl bg-white/90 dark:bg-zinc-900/90 border border-red-900/10 dark:border-red-500/20 p-5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-[#B71C1C] dark:text-red-400">
                Su Takibi
              </span>
              <Droplets className="w-4 h-4 text-[#B71C1C] dark:text-red-400" />
            </div>
            <p className="text-2xl font-bold">
              {saglikVerisi.suBardak}{' '}
              <span className="text-sm font-normal text-zinc-500">
                / {saglikVerisi.suHedefi} bardak
              </span>
            </p>
            <IlerlemeCubugu
              deger={saglikVerisi.suBardak}
              hedef={saglikVerisi.suHedefi}
            />
            <div className="flex items-center gap-2 pt-1">
              <button
                type="button"
                onClick={() => onSuEkle(-1)}
                className="inline-flex items-center justify-center p-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:bg-red-900/10 cursor-pointer"
                aria-label="Su azalt"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => onSuEkle(1)}
                className="flex-1 inline-flex items-center justify-center gap-1 px-3 py-2 rounded-xl bg-[#B71C1C] text-white text-xs font-semibold cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+1 Bardak Ekle</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* OZFIT */}
      {seciliMod === 'OzFit' && (
        <div className="rounded-2xl bg-white/90 dark:bg-zinc-900/90 border border-red-900/10 dark:border-red-500/20 p-5 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Footprints className="w-5 h-5 text-[#B71C1C] dark:text-red-400" />
              <h3 className="font-semibold">OzFit Hareket & Adım</h3>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => onAdimEkle(500)}
                className="px-3 py-1.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-xs font-medium hover:bg-red-900/10 cursor-pointer"
              >
                +500
              </button>
              <button
                type="button"
                onClick={() => onAdimEkle(1000)}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-[#B71C1C] text-white text-xs font-semibold cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>1.000 Adım</span>
              </button>
            </div>
          </div>

          <p className="text-2xl font-bold">
            {saglikVerisi.adim.toLocaleString('tr-TR')}{' '}
            <span className="text-sm font-normal text-zinc-500">
              / {saglikVerisi.adimHedefi.toLocaleString('tr-TR')} adım
            </span>
          </p>
          <IlerlemeCubugu deger={saglikVerisi.adim} hedef={saglikVerisi.adimHedefi} />
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            Tahmini yakılan kalori: <strong>{saglikVerisi.yakilanKalori} kcal</strong>
          </p>
        </div>
      )}

      {/* OZHEALTH */}
      {seciliMod === 'OzHealth' && (
        <div className="rounded-2xl bg-white/90 dark:bg-zinc-900/90 border border-red-900/10 dark:border-red-500/20 p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <HeartPulse className="w-5 h-5 text-[#B71C1C] dark:text-red-400" />
              <h3 className="font-semibold">OzHealth Uyku & Denge</h3>
            </div>
            <Moon className="w-4 h-4 text-[#B71C1C] dark:text-red-400" />
          </div>

          <div className="flex items-center justify-between">
            <p className="text-2xl font-bold">
              {saglikVerisi.uykuSaat}{' '}
              <span className="text-sm font-normal text-zinc-500">/ 8 saat</span>
            </p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => onUykuGuncelle(saglikVerisi.uykuSaat - 0.5)}
                className="px-3 py-1.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-xs font-semibold cursor-pointer"
              >
                -0.5 sa
              </button>
              <button
                type="button"
                onClick={() => onUykuGuncelle(saglikVerisi.uykuSaat + 0.5)}
                className="px-3 py-1.5 rounded-xl bg-[#B71C1C] text-white text-xs font-semibold cursor-pointer"
              >
                +0.5 sa
              </button>
            </div>
          </div>

          <IlerlemeCubugu deger={saglikVerisi.uykuSaat} hedef={8} />
        </div>
      )}
    </div>
  );
}