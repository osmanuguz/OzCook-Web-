import { useEffect, useRef, useState } from 'react';
import {
  Home,
  SlidersHorizontal,
  Settings,
  ChefHat,
  Refrigerator,
  LogIn,
  LogOut,
  CloudCheck,
} from 'lucide-react';
import AnaSayfa from './pages/AnaSayfa';
import Dolap from './pages/Dolap';
import OzModlari from './pages/OzModlari';
import Ayarlar from './pages/Ayarlar';
import { saglikServisi } from './services/saglikServisi';
import { favoriServisi } from './services/favoriServisi';
import { bulutServisi } from './services/bulutServisi';

const TEMA_ANAHTARI = 'ozcook_koyu_tema';

export default function App() {
  const [aktifSekme, setAktifSekme] = useState('ana');
  const [saglikVerisi, setSaglikVerisi] = useState(() => saglikServisi.getir());
  const [kaydedilenler, setKaydedilenler] = useState(() => favoriServisi.getir());
  const [kullanici, setKullanici] = useState(null);
  const [bulutDurumu, setBulutDurumu] = useState('');
  const [koyuTema, setKoyuTema] = useState(() => {
    const kayitli = localStorage.getItem(TEMA_ANAHTARI);
    if (kayitli !== null) return kayitli === 'true';
    return window.matchMedia?.('(prefers-color-scheme: dark)').matches ?? false;
  });

  const buluttanGeldiRef = useRef(false);

  useEffect(() => {
    const root = document.documentElement;
    if (koyuTema) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem(TEMA_ANAHTARI, String(koyuTema));
  }, [koyuTema]);

  useEffect(() => {
    const aboneligiBitir = bulutServisi.oturumDinle((user) => {
      setKullanici(user);
      if (!user) {
        setBulutDurumu('');
      }
    });
    return () => aboneligiBitir();
  }, []);

  useEffect(() => {
    if (!kullanici) return undefined;

    const aboneligiBitir = bulutServisi.kullaniciVerisiniDinle(
      kullanici.uid,
      (veri) => {
        if (!veri) {
          bulutServisi.veriyiKaydet(kullanici.uid, {
            saglikVerisi,
            kaydedilenler,
          });
          setBulutDurumu('Senkronize');
          return;
        }

        buluttanGeldiRef.current = true;
        if (veri.saglikVerisi) {
          setSaglikVerisi(veri.saglikVerisi);
        }
        if (Array.isArray(veri.kaydedilenler)) {
          setKaydedilenler(veri.kaydedilenler);
          favoriServisi.kaydet(veri.kaydedilenler);
        }
        setBulutDurumu('Senkronize');
      }
    );

    return () => aboneligiBitir();
  }, [kullanici]);

  useEffect(() => {
    if (!kullanici) return;
    if (buluttanGeldiRef.current) {
      buluttanGeldiRef.current = false;
      return;
    }

    bulutServisi
      .veriyiKaydet(kullanici.uid, {
        saglikVerisi,
        kaydedilenler,
      })
      .then(() => setBulutDurumu('Senkronize'))
      .catch(() => setBulutDurumu('Hata'));
  }, [saglikVerisi, kaydedilenler, kullanici]);

  const googleGirisYap = async () => {
    try {
      await bulutServisi.googleIleGiris();
    } catch (err) {
      console.error('Google giriş hatası:', err);
    }
  };

  const cikisYap = async () => {
    try {
      await bulutServisi.cikisYap();
    } catch (err) {
      console.error('Çıkış hatası:', err);
    }
  };

  const favoriDegistir = (tarif) => {
    setKaydedilenler((prev) => favoriServisi.degistir(prev, tarif));
  };

  const basliklar = {
    ana: 'Ana Sayfa',
    dolap: 'Dolapta Ne Var?',
    modlar: 'Oz Modları',
    ayarlar: 'Ayarlar',
  };

  return (
    <div className="min-h-screen flex flex-col ozcook-bugulu-bg text-zinc-900 dark:text-zinc-100">
      <header className="sticky top-0 z-20 bg-[#B71C1C] dark:bg-[#5E0D0D] text-white shadow-md">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between gap-2">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-lg bg-white text-[#B71C1C] flex items-center justify-center shadow-sm shrink-0">
              <ChefHat className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h1 className="text-base font-bold leading-tight truncate">
                {basliklar[aktifSekme]}
              </h1>
              <p className="text-[11px] text-white/85 truncate flex items-center gap-1">
                <span>
                  {kullanici?.displayName || saglikVerisi.profil?.ad || 'Ozcook'}
                </span>
                {bulutDurumu === 'Senkronize' && (
                  <span className="inline-flex items-center gap-0.5 text-emerald-200">
                    • <CloudCheck className="w-3 h-3" /> Bulut
                  </span>
                )}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {kullanici ? (
              <button
                type="button"
                onClick={cikisYap}
                title="Çıkış Yap"
                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white/15 hover:bg-white/25 text-xs font-medium transition-colors cursor-pointer"
              >
                {kullanici.photoURL && (
                  <img
                    src={kullanici.photoURL}
                    alt={kullanici.displayName || 'Profil'}
                    className="w-5 h-5 rounded-full"
                  />
                )}
                <LogOut className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={googleGirisYap}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white text-[#B71C1C] hover:bg-zinc-100 text-xs font-semibold transition-colors cursor-pointer"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Google Giriş</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => setAktifSekme('ayarlar')}
              aria-label="Ayarlar"
              className="p-2 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
            >
              <Settings className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 py-6 pb-24">
        {aktifSekme === 'ana' && (
          <AnaSayfa
            saglikVerisi={saglikVerisi}
            kaydedilenler={kaydedilenler}
            onFavoriDegistir={favoriDegistir}
            onKaloriEkle={(miktar) =>
              setSaglikVerisi((prev) => saglikServisi.kaloriEkle(prev, miktar))
            }
            onModlaraGit={() => setAktifSekme('modlar')}
          />
        )}

        {aktifSekme === 'dolap' && <Dolap />}

        {aktifSekme === 'modlar' && (
          <OzModlari
            saglikVerisi={saglikVerisi}
            kaydedilenler={kaydedilenler}
            onFavoriDegistir={favoriDegistir}
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
            kullanici={kullanici}
            bulutDurumu={bulutDurumu}
            onGoogleGiris={googleGirisYap}
            onCikisYap={cikisYap}
            onSenkronize={() => setSaglikVerisi((prev) => saglikServisi.senkronizeEt(prev))}
            onProfilGuncelle={(profil) =>
              setSaglikVerisi((prev) => saglikServisi.profilGuncelle(prev, profil))
            }
            onGunuSifirla={() =>
              setSaglikVerisi((prev) => saglikServisi.gunuSifirla(prev))
            }
          />
        )}
      </main>

      <nav className="sticky bottom-0 z-20 bg-[#B71C1C] dark:bg-[#5E0D0D] text-white border-t border-white/10 dark:border-red-500/20">
        <div className="max-w-5xl mx-auto px-4 h-16 grid grid-cols-4">
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
            onClick={() => setAktifSekme('dolap')}
            className={`flex flex-col items-center justify-center gap-1 text-xs cursor-pointer ${
              aktifSekme === 'dolap' ? 'text-white font-semibold' : 'text-white/70'
            }`}
          >
            <Refrigerator className="w-5 h-5" />
            <span>Dolap</span>
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