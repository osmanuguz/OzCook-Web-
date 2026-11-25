import { useEffect, useMemo, useState } from 'react';
import {
  Plus,
  X,
  Refrigerator,
  Flame,
  Clock,
  CheckCircle2,
  RefreshCw,
  Utensils,
} from 'lucide-react';
import { tarifServisi } from '../services/tarifServisi';

const DOLAP_ANAHTARI = 'ozcook_dolap_malzemeleri_v1';

export default function Dolap() {
  const [malzemeler, setMalzemeler] = useState(() => {
    try {
      const kayit = localStorage.getItem(DOLAP_ANAHTARI);
      return kayit ? JSON.parse(kayit) : [];
    } catch {
      return [];
    }
  });

  const [yeniMalzeme, setYeniMalzeme] = useState('');
  const [tumTarifler, setTumTarifler] = useState([]);
  const [yukleniyor, setYukleniyor] = useState(true);
  const [seciliTarif, setSeciliTarif] = useState(null);

  useEffect(() => {
    localStorage.setItem(DOLAP_ANAHTARI, JSON.stringify(malzemeler));
  }, [malzemeler]);

  useEffect(() => {
    let aktif = true;
    (async () => {
      setYukleniyor(true);
      const liste = await tarifServisi.tumTarifleriGetir();
      if (aktif) {
        setTumTarifler(liste);
        setYukleniyor(false);
      }
    })();
    return () => {
      aktif = false;
    };
  }, []);

  const formGonder = (e) => {
    e.preventDefault();
    const parcalar = yeniMalzeme
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    if (!parcalar.length) return;

    setMalzemeler((prev) => {
      const guncel = [...prev];
      for (const item of parcalar) {
        const zatenVar = guncel.some(
          (m) => m.toLowerCase() === item.toLowerCase()
        );
        if (!zatenVar) guncel.push(item);
      }
      return guncel;
    });

    setYeniMalzeme('');
  };

  const malzemeSil = (ad) => {
    setMalzemeler((prev) => prev.filter((m) => m !== ad));
  };

  const eslesenTarifler = useMemo(() => {
    if (!malzemeler.length || !tumTarifler.length) return [];

    const kucukDolap = malzemeler.map((m) => m.toLowerCase());

    return tumTarifler
      .map((tarif) => {
        const eslesenler = [];
        for (const dolapItem of kucukDolap) {
          const varMi =
            tarif.etiketler?.some((etiket) => etiket.includes(dolapItem)) ||
            tarif.malzemeler?.some((m) =>
              m.ad.toLowerCase().includes(dolapItem)
            );
          if (varMi) {
            eslesenler.push(dolapItem);
          }
        }
        return {
          ...tarif,
          eslesenSayisi: eslesenler.length,
          eslesenler,
        };
      })
      .filter((t) => t.eslesenSayisi > 0)
      .sort((a, b) => b.eslesenSayisi - a.eslesenSayisi)
      .slice(0, 24);
  }, [malzemeler, tumTarifler]);

  return (
    <div className="space-y-5">
      {/* Üst Kart: Dolap Malzeme Girişi */}
      <div className="rounded-2xl bg-white/90 dark:bg-zinc-900/90 border border-red-900/10 dark:border-red-500/20 p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-red-950/10 dark:bg-red-500/15 text-[#B71C1C] dark:text-red-400 flex items-center justify-center">
              <Refrigerator className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold">Dolapta Ne Var?</h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Elindeki malzemeleri yaz, yapabileceğin tarifleri anında gör
              </p>
            </div>
          </div>

          {malzemeler.length > 0 && (
            <button
              type="button"
              onClick={() => setMalzemeler([])}
              className="text-xs text-zinc-500 hover:text-[#B71C1C] dark:hover:text-red-400 cursor-pointer"
            >
              Temizle
            </button>
          )}
        </div>

        <form onSubmit={formGonder} className="flex gap-2">
          <input
            type="text"
            value={yeniMalzeme}
            onChange={(e) => setYeniMalzeme(e.target.value)}
            placeholder="Malzeme yaz (ör. yumurta, tavuk, domates)..."
            className="flex-1 px-3.5 py-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-sm outline-none focus:ring-2 focus:ring-[#B71C1C]"
          />
          <button
            type="submit"
            className="inline-flex items-center gap-1 px-4 py-2.5 rounded-xl bg-[#B71C1C] hover:bg-[#991616] text-white text-xs font-semibold transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Ekle</span>
          </button>
        </form>

        {/* Seçili Dolap Malzemeleri */}
        <div className="space-y-2">
          <p className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">
            Dolabındakiler ({malzemeler.length})
          </p>
          {malzemeler.length === 0 ? (
            <p className="text-xs text-zinc-400">
              Henüz malzeme eklemedin. Yukarıya elindeki malzemeleri yazıp ekleyebilirsin.
            </p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {malzemeler.map((item) => (
                <span
                  key={item}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#B71C1C] text-white text-xs font-medium"
                >
                  <span>{item}</span>
                  <button
                    type="button"
                    onClick={() => malzemeSil(item)}
                    aria-label={`${item} sil`}
                    className="hover:bg-white/20 rounded-full p-0.5 cursor-pointer"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Eşleşen Tarifler */}
      {malzemeler.length === 0 ? (
        <div className="rounded-2xl bg-white/90 dark:bg-zinc-900/90 border border-red-900/10 dark:border-red-500/20 p-8 text-center">
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Tarif önerilerini görmek için dolabındaki malzemeleri yukarıdan ekle.
          </p>
        </div>
      ) : yukleniyor ? (
        <div className="rounded-2xl bg-white/90 dark:bg-zinc-900/90 border border-red-900/10 dark:border-red-500/20 p-10 text-center space-y-2">
          <RefreshCw className="w-6 h-6 animate-spin mx-auto text-[#B71C1C] dark:text-red-400" />
          <p className="text-sm font-medium">Tarifler eşleştiriliyor...</p>
        </div>
      ) : eslesenTarifler.length === 0 ? (
        <div className="rounded-2xl bg-white/90 dark:bg-zinc-900/90 border border-red-900/10 dark:border-red-500/20 p-8 text-center">
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Yazdığın malzemelerle eşleşen tarif bulunamadı. Farklı malzemeler eklemeyi dene.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          <h3 className="text-sm font-bold px-1">
            Senin İçin Eşleşen Tarifler ({eslesenTarifler.length})
          </h3>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {eslesenTarifler.map((tarif) => (
              <div
                key={tarif.id}
                onClick={() => setSeciliTarif(tarif)}
                className="rounded-2xl bg-white/90 dark:bg-zinc-900/90 border border-red-900/10 dark:border-red-500/20 overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between cursor-pointer"
              >
                <div>
                  {tarif.gorselUrl ? (
                    <img
                      src={tarif.gorselUrl}
                      alt={tarif.baslik}
                      loading="lazy"
                      className="w-full h-36 object-cover bg-zinc-200 dark:bg-zinc-800"
                    />
                  ) : (
                    <div className="w-full h-36 bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center">
                      <Utensils className="w-8 h-8 text-zinc-400" />
                    </div>
                  )}

                  <div className="p-4 space-y-2">
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-[11px] font-semibold bg-emerald-500/15 text-emerald-700 dark:text-emerald-400">
                      <CheckCircle2 className="w-3 h-3" />
                      {tarif.eslesenSayisi} malzeme elinde var
                    </span>
                    <h4 className="text-sm font-bold line-clamp-1">{tarif.baslik}</h4>
                    <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                      {tarif.kategori} • {tarif.pisirilisSekli}
                    </p>
                  </div>
                </div>

                <div className="px-4 py-3 border-t border-zinc-200/70 dark:border-zinc-800 flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400">
                  <span className="inline-flex items-center gap-1 font-medium text-zinc-700 dark:text-zinc-200">
                    <Flame className="w-3.5 h-3.5 text-[#B71C1C] dark:text-red-400" />
                    {tarif.besinDegerleri?.kalori ?? 250} kcal
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    {tarif.sureDk} dk
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tarif Detay Modalı */}
      {seciliTarif && (
        <div
          onClick={() => setSeciliTarif(null)}
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-xs p-4 flex items-center justify-center overflow-y-auto"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-2xl max-h-[88vh] overflow-y-auto rounded-2xl bg-white dark:bg-zinc-900 border border-red-900/20 shadow-xl p-5 space-y-4"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                  {seciliTarif.eslesenSayisi} malzeme dolabında mevcut
                </span>
                <h3 className="text-lg font-bold mt-0.5">{seciliTarif.baslik}</h3>
              </div>
              <button
                type="button"
                onClick={() => setSeciliTarif(null)}
                className="p-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {seciliTarif.gorselUrl && (
              <img
                src={seciliTarif.gorselUrl}
                alt={seciliTarif.baslik}
                className="w-full h-52 object-cover rounded-xl"
              />
            )}

            <div className="space-y-2">
              <h4 className="font-semibold text-sm">Malzemeler</h4>
              <div className="flex flex-wrap gap-2">
                {seciliTarif.malzemeler.map((m, i) => {
                  const eldeVar = malzemeler.some((dolapItem) =>
                    m.ad.toLowerCase().includes(dolapItem.toLowerCase())
                  );
                  return (
                    <span
                      key={`${m.ad}-${i}`}
                      className={`px-2.5 py-1 rounded-lg text-xs ${
                        eldeVar
                          ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 font-medium'
                          : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300'
                      }`}
                    >
                      {eldeVar ? '✓ ' : ''}
                      {m.ad} {m.miktar ? `(${m.miktar})` : ''}
                    </span>
                  );
                })}
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="font-semibold text-sm">Hazırlanışı</h4>
              <ol className="list-decimal list-inside space-y-1.5 text-xs leading-relaxed text-zinc-600 dark:text-zinc-300">
                {seciliTarif.yapilis.map((adim, idx) => (
                  <li key={idx}>{adim}</li>
                ))}
              </ol>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}