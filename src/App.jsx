import { useEffect, useState } from 'react';
import { Home, SlidersHorizontal, Settings, ChefHat } from 'lucide-react';

const TEMA_ANAHTARI = 'ozcook_koyu_tema';

export default function App() {
  const [aktifSekme, setAktifSekme] = useState('ana');
  const [koyuTema, setKoyuTema] = useState(() => {
    const kayitli = localStorage.getItem(TEMA_ANAHTARI);
    if (kayitli !== null) return kayitli === 'true';
    return window.matchMedia?.('(prefers-color-scheme: dark)').matches ?? false;
  });

  useEffect(() => {
    const root = document.documentElement;
    if (koyuTema) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem(TEMA_ANAHTARI, String(koyuTema));
  }, [koyuTema]);

  const basliklar = {
    ana: 'Ana Sayfa',
    modlar: 'Oz Modları',
    ayarlar: 'Ayarlar',
  };

  return (
    <div className="min-h-screen flex flex-col ozcook-bugulu-bg text-zinc-900 dark:text-zinc-100">
      {/* Üst Bar */}
      <header className="sticky top-0 z-20 bg-[#B71C1C] dark:bg-[#5E0D0D] text-white shadow-md">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-white text-[#B71C1C] flex items-center justify-center shadow-sm">
              <ChefHat className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-base font-bold leading-tight">{basliklar[aktifSekme]}</h1>
              <p className="text-[11px] text-white/85">Ozcook • Tarif, Kalori & Akıllı Mutfak</p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setAktifSekme('ayarlar')}
            aria-label="Ayarlar"
            className="p-2 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
          >
            <Settings className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Orta Alan */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 py-6">
        {aktifSekme === 'ana' && (
          <div className="rounded-2xl bg-white/85 dark:bg-zinc-900/85 border border-red-900/10 dark:border-red-500/20 p-6 shadow-sm">
            <h2 className="text-lg font-semibold mb-1">Ana Sayfa</h2>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              Tarif ve besin akışı için ilk adımı kurduk.
            </p>
          </div>
        )}

        {aktifSekme === 'modlar' && (
          <div className="rounded-2xl bg-white/85 dark:bg-zinc-900/85 border border-red-900/10 dark:border-red-500/20 p-6 shadow-sm">
            <h2 className="text-lg font-semibold mb-1">Oz Modları</h2>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              OzDay, OzFit ve OzHealth modları burada yer alacak.
            </p>
          </div>
        )}

        {aktifSekme === 'ayarlar' && (
          <div className="rounded-2xl bg-white/85 dark:bg-zinc-900/85 border border-red-900/10 dark:border-red-500/20 p-6 shadow-sm space-y-4">
            <h2 className="text-lg font-semibold">Ayarlar</h2>
            <div className="flex items-center justify-between py-2">
              <div>
                <p className="font-medium text-sm">Koyu Tema</p>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  Karanlık görünümü anında aç veya kapat
                </p>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={koyuTema}
                onClick={() => setKoyuTema((prev) => !prev)}
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
        )}
      </main>

      {/* Alt Navigasyon */}
      <nav className="sticky bottom-0 z-20 bg-[#B71C1C] dark:bg-[#5E0D0D] text-white border-t border-white/10 dark:border-red-500/20">
        <div className="max-w-5xl mx-auto px-4 h-16 grid grid-cols-3">
          <button
            type="button"
            onClick={() => setAktifSekme('ana')}
            className={`flex flex-col items-center justify-center gap-1 text-xs cursor-pointer ${
              aktifSekme === 'ana' ? 'text-white font-semibold' : 'text-white/70'
            }`}
          >
            <Home className="w-5 h-5" />
            <span>Ana Sayfa</span>
          </button>

          <button
            type="button"
            onClick={() => setAktifSekme('modlar')}
            className={`flex flex-col items-center justify-center gap-1 text-xs cursor-pointer ${
              aktifSekme === 'modlar' ? 'text-white font-semibold' : 'text-white/70'
            }`}
          >
            <SlidersHorizontal className="w-5 h-5" />
            <span>Oz Modları</span>
          </button>

          <button
            type="button"
            onClick={() => setAktifSekme('ayarlar')}
            className={`flex flex-col items-center justify-center gap-1 text-xs cursor-pointer ${
              aktifSekme === 'ayarlar' ? 'text-white font-semibold' : 'text-white/70'
            }`}
          >
            <Settings className="w-5 h-5" />
            <span>Ayarlar</span>
          </button>
        </div>
      </nav>
    </div>
  );
}