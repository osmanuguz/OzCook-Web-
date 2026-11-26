import { useState } from 'react';
import {
  Moon,
  Sun,
  User,
  RefreshCw,
  RotateCcw,
  LogIn,
  LogOut,
  CloudCheck,
  Check,
} from 'lucide-react';

export default function Ayarlar({
  koyuTema,
  onKoyuTemaDegistir,
  saglikVerisi,
  kullanici,
  bulutDurumu,
  onGoogleGiris,
  onCikisYap,
  onSenkronize,
  onProfilGuncelle,
  onGunuSifirla,
}) {
  const [ad, setAd] = useState(saglikVerisi.profil?.ad || '');
  const [kaydedildi, setKaydedildi] = useState(false);

  const profilKaydet = (e) => {
    e.preventDefault();
    onProfilGuncelle?.({ ...saglikVerisi.profil, ad: ad.trim() || 'Ozcook Kullanıcısı' });
    setKaydedildi(true);
    setTimeout(() => setKaydedildi(false), 2000);
  };

  return (
    <div className="space-y-4">
      {/* Google Hesabı & Bulut Senkronizasyonu */}
      <div className="rounded-2xl bg-white/90 dark:bg-zinc-900/90 border border-red-900/10 dark:border-red-500/20 p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between gap-2">
          <div>
            <h2 className="text-base font-bold">Google Hesabı & Bulut Eşitleme</h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
              Verilerini ve kaydettiğin tarifleri web ve mobil arasında anlık senkronize et
            </p>
          </div>
          {bulutDurumu === 'Senkronize' && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 text-xs font-semibold shrink-0">
              <CloudCheck className="w-3.5 h-3.5" />
              Senkronize
            </span>
          )}
        </div>

        {kullanici ? (
          <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/70 border border-zinc-200/70 dark:border-zinc-700/60">
            <div className="flex items-center gap-3 min-w-0">
              {kullanici.photoURL ? (
                <img
                  src={kullanici.photoURL}
                  alt={kullanici.displayName || 'Profil'}
                  className="w-10 h-10 rounded-full shrink-0"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-[#B71C1C]/15 text-[#B71C1C] dark:text-red-300 flex items-center justify-center shrink-0">
                  <User className="w-5 h-5" />
                </div>
              )}
              <div className="min-w-0">
                <p className="text-sm font-bold truncate">
                  {kullanici.displayName || 'Google Kullanıcısı'}
                </p>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 truncate">
                  {kullanici.email}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onCikisYap}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-zinc-200/80 dark:bg-zinc-700 hover:bg-red-500/15 hover:text-[#B71C1C] dark:hover:text-red-300 text-xs font-semibold transition-colors cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Çıkış Yap</span>
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={onGoogleGiris}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#B71C1C] hover:bg-[#991616] text-white text-xs font-semibold transition-colors cursor-pointer"
          >
            <LogIn className="w-4 h-4" />
            <span>Google ile Giriş Yap</span>
          </button>
        )}
      </div>

      {/* Görünüm / Tema */}
      <div className="rounded-2xl bg-white/90 dark:bg-zinc-900/90 border border-red-900/10 dark:border-red-500/20 p-5 shadow-sm flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#B71C1C]/10 dark:bg-red-500/15 text-[#B71C1C] dark:text-red-400 flex items-center justify-center">
            {koyuTema ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
          </div>
          <div>
            <h3 className="text-sm font-bold">Koyu Tema</h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              {koyuTema ? 'Koyu görünüm aktif' : 'Açık görünüm aktif'}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => onKoyuTemaDegistir(!koyuTema)}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
            koyuTema
              ? 'bg-[#B71C1C] text-white'
              : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-200 hover:bg-red-900/10'
          }`}
        >
          {koyuTema ? 'Açık Temaya Geç' : 'Koyu Temaya Geç'}
        </button>
      </div>

      {/* Profil Bilgisi */}
      <form
        onSubmit={profilKaydet}
        className="rounded-2xl bg-white/90 dark:bg-zinc-900/90 border border-red-900/10 dark:border-red-500/20 p-5 shadow-sm space-y-3"
      >
        <div className="flex items-center gap-2">
          <User className="w-4 h-4 text-[#B71C1C] dark:text-red-400" />
          <h3 className="text-sm font-bold">Profil Adı</h3>
        </div>

        <div className="flex gap-2">
          <input
            type="text"
            value={ad}
            onChange={(e) => setAd(e.target.value)}
            placeholder="Adın (ör. Osman)"
            className="flex-1 px-3.5 py-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-sm outline-none focus:ring-2 focus:ring-[#B71C1C]"
          />
          <button
            type="submit"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#B71C1C] hover:bg-[#991616] text-white text-xs font-semibold transition-colors cursor-pointer"
          >
            {kaydedildi ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>Kaydedildi</span>
              </>
            ) : (
              <span>Kaydet</span>
            )}
          </button>
        </div>
      </form>

      {/* Veri Yönetimi */}
      <div className="rounded-2xl bg-white/90 dark:bg-zinc-900/90 border border-red-900/10 dark:border-red-500/20 p-5 shadow-sm flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-bold">Günlük Veriler</h3>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
            Bugünkü kalori, su ve adım verilerini yenile veya sıfırla
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onSenkronize}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:bg-red-900/10 text-xs font-semibold transition-colors cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Senkronize Et</span>
          </button>

          <button
            type="button"
            onClick={onGunuSifirla}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-red-500/10 text-[#B71C1C] dark:text-red-400 hover:bg-red-500/20 text-xs font-semibold transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Günü Sıfırla</span>
          </button>
        </div>
      </div>
    </div>
  );
}