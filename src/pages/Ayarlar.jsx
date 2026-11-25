import { useState } from 'react';
import { Moon, Sun, RefreshCw, User, RotateCcw, Trash2, Check } from 'lucide-react';

const HEDEFLER = ['Kilo Vermek', 'Formu Korumak', 'Kas Kazanmak', 'Sağlıklı Beslenme'];

function vkiHesapla(boyCm, kiloKg) {
  const boyMetre = Number(boyCm) / 100;
  if (!boyMetre || boyMetre <= 0) return { deger: 0, durum: '-' };
  const vki = Number(kiloKg) / (boyMetre * boyMetre);
  let durum = 'Normal';
  if (vki < 18.5) durum = 'Zayıf';
  else if (vki >= 25 && vki < 30) durum = 'Fazla Kilolu';
  else if (vki >= 30) durum = 'Obez';
  return { deger: vki.toFixed(1), durum };
}

export default function Ayarlar({
  koyuTema,
  onKoyuTemaDegistir,
  saglikVerisi,
  onSenkronize,
  onProfilGuncelle,
  onGunuSifirla,
}) {
  const [profilForm, setProfilForm] = useState({
    ad: saglikVerisi.profil?.ad ?? 'Ozcook Kullanıcısı',
    boy: saglikVerisi.profil?.boy ?? 175,
    kilo: saglikVerisi.profil?.kilo ?? 70,
    yas: saglikVerisi.profil?.yas ?? 20,
    hedef: saglikVerisi.profil?.hedef ?? 'Formu Korumak',
  });
  const [kaydedildi, setKaydedildi] = useState(false);
  const [bildirim, setBildirim] = useState('');

  const vki = vkiHesapla(profilForm.boy, profilForm.kilo);

  const profilKaydet = (e) => {
    e.preventDefault();
    onProfilGuncelle(profilForm);
    setKaydedildi(true);
    setTimeout(() => setKaydedildi(false), 2000);
  };

  const onbellekTemizle = () => {
    localStorage.removeItem('ozcook_themealdb_cache_v1');
    setBildirim('Tarif önbelleği temizlendi. Ana Sayfa yenilendiğinde tarifler tekrar çekilecek.');
    setTimeout(() => setBildirim(''), 3500);
  };

  const gunuSifirlaOnay = () => {
    onGunuSifirla();
    setBildirim('Günlük adım, su ve kalori verileri sıfırlandı.');
    setTimeout(() => setBildirim(''), 3000);
  };

  return (
    <div className="space-y-4">
      {bildirim && (
        <div className="rounded-xl bg-[#B71C1C]/10 dark:bg-red-500/15 border border-[#B71C1C]/20 px-4 py-3 text-xs font-medium text-[#B71C1C] dark:text-red-300">
          {bildirim}
        </div>
      )}

      {/* Kişisel Profil */}
      <form
        onSubmit={profilKaydet}
        className="rounded-2xl bg-white/90 dark:bg-zinc-900/90 border border-red-900/10 dark:border-red-500/20 p-5 shadow-sm space-y-4"
      >
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-red-950/10 dark:bg-red-500/15 text-[#B71C1C] dark:text-red-400 flex items-center justify-center">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold">Kişisel Profil</h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Vücut ölçülerin ve beslenme hedefin
              </p>
            </div>
          </div>

          <div className="px-3 py-1.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-xs">
            <span className="text-zinc-500 dark:text-zinc-400">VKİ: </span>
            <strong className="text-[#B71C1C] dark:text-red-400">{vki.deger}</strong>
            <span className="text-zinc-500 dark:text-zinc-400"> ({vki.durum})</span>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-3 text-xs">
          <label className="space-y-1 sm:col-span-2">
            <span className="text-zinc-500 dark:text-zinc-400">Ad Soyad</span>
            <input
              type="text"
              value={profilForm.ad}
              onChange={(e) => setProfilForm({ ...profilForm, ad: e.target.value })}
              className="w-full px-3 py-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 outline-none focus:ring-2 focus:ring-[#B71C1C]"
            />
          </label>

          <label className="space-y-1">
            <span className="text-zinc-500 dark:text-zinc-400">Boy (cm)</span>
            <input
              type="number"
              min="100"
              max="250"
              value={profilForm.boy}
              onChange={(e) => setProfilForm({ ...profilForm, boy: e.target.value })}
              className="w-full px-3 py-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 outline-none focus:ring-2 focus:ring-[#B71C1C]"
            />
          </label>

          <label className="space-y-1">
            <span className="text-zinc-500 dark:text-zinc-400">Kilo (kg)</span>
            <input
              type="number"
              min="30"
              max="300"
              value={profilForm.kilo}
              onChange={(e) => setProfilForm({ ...profilForm, kilo: e.target.value })}
              className="w-full px-3 py-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 outline-none focus:ring-2 focus:ring-[#B71C1C]"
            />
          </label>

          <label className="space-y-1">
            <span className="text-zinc-500 dark:text-zinc-400">Yaş</span>
            <input
              type="number"
              min="10"
              max="120"
              value={profilForm.yas}
              onChange={(e) => setProfilForm({ ...profilForm, yas: e.target.value })}
              className="w-full px-3 py-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 outline-none focus:ring-2 focus:ring-[#B71C1C]"
            />
          </label>

          <label className="space-y-1">
            <span className="text-zinc-500 dark:text-zinc-400">Hedef</span>
            <select
              value={profilForm.hedef}
              onChange={(e) => setProfilForm({ ...profilForm, hedef: e.target.value })}
              className="w-full px-3 py-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 outline-none focus:ring-2 focus:ring-[#B71C1C]"
            >
              {HEDEFLER.map((h) => (
                <option key={h} value={h}>
                  {h}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#B71C1C] hover:bg-[#991616] text-white text-xs font-semibold transition-colors cursor-pointer"
          >
            {kaydedildi && <Check className="w-3.5 h-3.5" />}
            <span>{kaydedildi ? 'Kaydedildi' : 'Profili Kaydet'}</span>
          </button>
        </div>
      </form>

      {/* Görünüm & Tema */}
      <div className="rounded-2xl bg-white/90 dark:bg-zinc-900/90 border border-red-900/10 dark:border-red-500/20 p-5 shadow-sm space-y-4">
        <h2 className="text-base font-bold">Görünüm & Tema</h2>

        <div className="flex items-center justify-between py-1">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-950/10 dark:bg-red-500/15 text-[#B71C1C] dark:text-red-400 flex items-center justify-center">
              {koyuTema ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
            </div>
            <div>
              <p className="font-medium text-sm">Koyu Tema</p>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Karanlık görünümü anında aç veya kapat
              </p>
            </div>
          </div>

          <button
            type="button"
            role="switch"
            aria-checked={koyuTema}
            onClick={() => onKoyuTemaDegistir(!koyuTema)}
            className={`w-12 h-7 rounded-full transition-colors p-1 cursor-pointer ${
              koyuTema ? 'bg-[#B71C1C]' : 'bg-zinc-300 dark:bg-zinc-700'
            }`}
          >
            <span
              className={`block w-5 h-5 rounded-full bg-white transition-transform ${
                koyuTema ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>
      </div>

      {/* Veri Yönetimi & Senkronizasyon */}
      <div className="rounded-2xl bg-white/90 dark:bg-zinc-900/90 border border-red-900/10 dark:border-red-500/20 p-5 shadow-sm space-y-4">
        <h2 className="text-base font-bold">Veri Yönetimi</h2>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="font-semibold text-sm">Web Sağlık Senkronizasyonu</h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
              {saglikVerisi.sonSenkron
                ? `Son güncelleme: ${saglikVerisi.sonSenkron}`
                : 'Henüz manuel senkronizasyon yapılmadı'}
            </p>
          </div>
          <button
            type="button"
            onClick={onSenkronize}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#B71C1C] hover:bg-[#991616] text-white text-xs font-medium transition-colors cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Senkronize Et</span>
          </button>
        </div>

        <div className="pt-3 border-t border-zinc-200/70 dark:border-zinc-800 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={gunuSifirlaOnay}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:bg-red-900/10 text-xs font-medium transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5 text-[#B71C1C] dark:text-red-400" />
            <span>Günlük Verileri Sıfırla</span>
          </button>

          <button
            type="button"
            onClick={onbellekTemizle}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:bg-red-900/10 text-xs font-medium transition-colors cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5 text-[#B71C1C] dark:text-red-400" />
            <span>Tarif Önbelleğini Temizle</span>
          </button>
        </div>
      </div>
    </div>
  );
}