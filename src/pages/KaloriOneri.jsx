import { useEffect, useMemo, useState } from 'react';
import {
  Flame,
  Clock,
  RefreshCw,
  Utensils,
  X,
  PlusCircle,
  Check,
  Sparkles,
} from 'lucide-react';
import { tarifServisi } from '../services/tarifServisi';

export default function KaloriOneri({ saglikVerisi, onKaloriEkle }) {
  const kalanKalori = Math.max(
    0,
    (saglikVerisi?.kaloriHedefi ?? 2200) - (saglikVerisi?.alinanKalori ?? 0)
  );

  const [hedefKalori, setHedefKalori] = useState('');
  const [filtreModu, setFiltreModu] = useState('altinda'); // 'altinda' | 'yakin'
  const [tumTarifler, setTumTarifler] = useState([]);
  const [yukleniyor, setYukleniyor] = useState(true);
  const [seciliTarif, setSeciliTarif] = useState(null);
  const [eklendiId, setEklendiId] = useState(null);

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

  const girilenSayi = Number(hedefKalori);

  const onerilenTarifler = useMemo(() => {
    if (!girilenSayi || girilenSayi <= 0 || !tumTarifler.length) return [];

    return tumTarifler
      .filter((tarif) => {
        const kcal = tarif.besinDegerleri?.kalori ?? 250;
        if (filtreModu === 'yakin') {
          return Math.abs(kcal - girilenSayi) <= 100;
        }
        return kcal <= girilenSayi;
      })
      .sort((a, b) => {
        const kcalA = a.besinDegerleri?.kalori ?? 250;
        const kcalB = b.besinDegerleri?.kalori ?? 250;
        return Math.abs(kcalA - girilenSayi) - Math.abs(kcalB - girilenSayi);
      })
      .slice(0, 24);
  }, [girilenSayi, filtreModu, tumTarifler]);

  const bunuYedim = (tarif) => {
    const kcal = tarif.besinDegerleri?.kalori ?? 250;
    onKaloriEkle?.(kcal);
    setEklendiId(tarif.id);
    setTimeout(() => setEklendiId(null), 2000);
  };

  return (
    <div className="space-y-5">
      {/* Üst Kart: Kalori Girişi */}
      <div className="rounded-2xl bg-white/90 dark:bg-zinc-900/90 border border-red-900/10 dark:border-red-500/20 p-5 shadow-sm space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-red-950/10 dark:bg-red-500/15 text-[#B71C1C] dark:text-red-400 flex items-center justify-center">
              <Flame className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold">Kaloriye Göre Yemek Öner</h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Hedef kalorini yaz, bütçene en uygun tarifleri sıralayalım
              </p>
            </div>
          </div>

          {kalanKalori > 0 && (
            <button
              type="button"
              onClick={() => setHedefKalori(String(kalanKalori))}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-950/10 dark:bg-red-500/15 text-[#B71C1C] dark:text-red-300 text-xs font-semibold hover:bg-red-950/20 transition-colors cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Kalan Kalorimi Kullan ({kalanKalori} kcal)</span>
            </button>
          )}
        </div>

        <div className="flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <input
              type="number"
              min="50"
              max="3000"
              value={hedefKalori}
              onChange={(e) => setHedefKalori(e.target.value)}
              placeholder="Kalori yaz (ör. 400, 600)..."
              className="w-full px-3.5 py-2.5 pr-14 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-sm outline-none focus:ring-2 focus:ring-[#B71C1C]"
            />
            <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-semibold text-zinc-400">
              kcal
            </span>
          </div>

          <div className="flex rounded-xl bg-zinc-100 dark:bg-zinc-800 p-1 gap-1">
            <button
              type="button"
              onClick={() => setFiltreModu('altinda')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                filtreModu === 'altinda'
                  ? 'bg-[#B71C1C] text-white'
                  : 'text-zinc-600 dark:text-zinc-300'
              }`}
            >
              Altında
            </button>
            <button
              type="button"
              onClick={() => setFiltreModu('yakin')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                filtreModu === 'yakin'
                  ? 'bg-[#B71C1C] text-white'
                  : 'text-zinc-600 dark:text-zinc-300'
              }`}
            >
              Yakın (±100)
            </button>
          </div>
        </div>
      </div>

      {/* Sonuçlar */}
      {!girilenSayi || girilenSayi <= 0 ? (
        <div className="rounded-2xl bg-white/90 dark:bg-zinc-900/90 border border-red-900/10 dark:border-red-500/20 p-8 text-center">
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Öneri görmek için yukarıya bir kalori değeri yaz.
          </p>
        </div>
      ) : yukleniyor ? (
        <div className="rounded-2xl bg-white/90 dark:bg-zinc-900/90 border border-red-900/10 dark:border-red-500/20 p-10 text-center space-y-2">
          <RefreshCw className="w-6 h-6 animate-spin mx-auto text-[#B71C1C] dark:text-red-400" />
          <p className="text-sm font-medium">Tarifler kalorine göre filtreleniyor...</p>
        </div>
      ) : onerilenTarifler.length === 0 ? (
        <div className="rounded-2xl bg-white/90 dark:bg-zinc-900/90 border border-red-900/10 dark:border-red-500/20 p-8 text-center">
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            {girilenSayi} kcal için uygun tarif bulunamadı. Kaloriyi biraz artırabilir veya modu değiştirebilirsin.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          <h3 className="text-sm font-bold px-1">
            {girilenSayi} kcal İçin Önerilen Tarifler ({onerilenTarifler.length})
          </h3>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {onerilenTarifler.map((tarif) => {
              const kcal = tarif.besinDegerleri?.kalori ?? 250;
              return (
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
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-[11px] font-semibold bg-[#B71C1C]/10 text-[#B71C1C] dark:bg-red-500/20 dark:text-red-300">
                        <Flame className="w-3 h-3" />
                        {kcal} kcal
                      </span>
                      <h4 className="text-sm font-bold line-clamp-1">{tarif.baslik}</h4>
                      <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                        {tarif.kategori} • {tarif.pisirilisSekli}
                      </p>
                    </div>
                  </div>

                  <div className="px-4 py-3 border-t border-zinc-200/70 dark:border-zinc-800 flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400">
                    <span>
                      P: {tarif.besinDegerleri?.protein ?? 0}g • K:{' '}
                      {tarif.besinDegerleri?.karbonhidrat ?? 0}g
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {tarif.sureDk} dk
                    </span>
                  </div>
                </div>
              );
            })}
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
                <span className="text-xs font-semibold text-[#B71C1C] dark:text-red-400">
                  {seciliTarif.besinDegerleri?.kalori ?? 250} kcal •{' '}
                  {seciliTarif.kategori}
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

            <div className="flex flex-wrap items-center justify-between gap-2 p-3 rounded-xl bg-zinc-100 dark:bg-zinc-800/80 text-xs">
              <div className="flex gap-3 font-medium">
                <span>Protein: {seciliTarif.besinDegerleri?.protein ?? 0}g</span>
                <span>Karb: {seciliTarif.besinDegerleri?.karbonhidrat ?? 0}g</span>
                <span>Yağ: {seciliTarif.besinDegerleri?.yag ?? 0}g</span>
              </div>

              <button
                type="button"
                onClick={() => bunuYedim(seciliTarif)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#B71C1C] hover:bg-[#991616] text-white font-semibold transition-colors cursor-pointer"
              >
                {eklendiId === seciliTarif.id ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>Eklendi</span>
                  </>
                ) : (
                  <>
                    <PlusCircle className="w-3.5 h-3.5" />
                    <span>
                      Bunu Yedim (+{seciliTarif.besinDegerleri?.kalori ?? 250} kcal)
                    </span>
                  </>
                )}
              </button>
            </div>

            <div className="space-y-2">
              <h4 className="font-semibold text-sm">Malzemeler</h4>
              <div className="flex flex-wrap gap-2">
                {seciliTarif.malzemeler.map((m, i) => (
                  <span
                    key={`${m.ad}-${i}`}
                    className="px-2.5 py-1 rounded-lg text-xs bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300"
                  >
                    {m.ad} {m.miktar ? `(${m.miktar})` : ''}
                  </span>
                ))}
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