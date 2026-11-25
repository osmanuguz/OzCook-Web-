import { useEffect, useState } from 'react';
import { Home, SlidersHorizontal, Settings, ChefHat } from 'lucide-react';
import AnaSayfa from './pages/AnaSayfa';
import OzModlari from './pages/OzModlari';
import Ayarlar from './pages/Ayarlar';
import { saglikServisi } from './services/saglikServisi';

const TEMA_ANAHTARI = 'ozcook_koyu_tema';

export default function App() {
  const [aktifSekme, setAktifSekme] = useState('ana');
  const [saglikVerisi, setSaglikVerisi] = useState(() => saglikServisi.getir());
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

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 py-6 pb-24">
        {aktifSekme === 'ana' && (
          <AnaSayfa
            saglikVerisi={saglikVerisi}
            onModlaraGit={() => setAktifSekme('modlar')}
          />
        )}

        {aktifSekme === 'modlar' && (
          <OzModlari
            saglikVerisi={saglikVerisi}
            onSuEkle={(miktar = 1) =>
              setSaglikVerisi((prev) => saglikServisi.suEkle(prev, miktar))
            }
            onAdimEkle={(miktar) =>
              setSaglikVerisi((prev) => saglikServisi.adimEkle(prev, miktar))
            }
            onKaloriEkle={(miktar) =>
              setSaglikVerisi((prev) => saglikServisi.kaloriEkle(prev, miktar))
            }
            onUykuGuncelle={(saat) =>
              setSaglikVerisi((prev) => saglikServisi.uykuGuncelle(prev, saat))
            }
            onHedefGuncelle={(hedefler) =>
              setSaglikVerisi((prev) => saglikServisi.hedefleriGuncelle(prev, hedefler))
            }
          />
        )}

        {aktifSekme === 'ayarlar' && (
          <Ayarlar
            koyuTema={koyuTema}
            onKoyuTemaDegistir={setKoyuTema}
            saglikVerisi={saglikVerisi}
            onSenkronize={() => setSaglikVerisi((prev) => saglikServisi.senkronizeEt(prev))}
          />
        )}
      </main>

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