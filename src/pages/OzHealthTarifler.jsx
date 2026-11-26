import { useEffect, useMemo, useState } from 'react';
import {
  HeartPulse,
  Flame,
  Clock,
  Bookmark,
  X,
  PlusCircle,
  Check,
  Utensils,
  RefreshCw,
  ShieldCheck,
  Droplet,
} from 'lucide-react';
import { tarifServisi } from '../services/tarifServisi';

const SAGLIK_FILTRELERI = ['Tümü', 'Tansiyon Dostu', 'Şeker Dostu'];

function saglikEtiketleriniBelirle(tarif) {
  const metin = [
    tarif.baslik,
    tarif.kategori,
    ...(tarif.malzemeler || []).map((m) => m.ad),
  ]
    .join(' ')
    .toLowerCase();

  const karbonhidrat = tarif.besinDegerleri?.karbonhidrat ?? 40;

  // Tansiyon dostu: yüksek sodyum, işlenmiş et, yoğun tuzlu sos ve kızartmaları ele
  const tansiyonYasakli = [
    'soy sauce',
    'soya sosu',
    'bacon',
    'pastırma',
    'sucuk',
    'sosis',
    'salam',
    'sausage',
    'ham',
    'jambon',
    'turşu',
    'pickle',
    'anchovy',
    'hamsi konserve',
    'cips',
    'kızartma',
    'deep fry',
    'bulyon',
    'bouillon',
    'stock cube',
    'salça',
  ];
  const tansiyonDostu = !tansiyonYasakli.some((k) => metin.includes(k));

  // Şeker dostu: tatlı kategorisi, ilave şeker, şurup, çikolata ve yüksek karbonhidratı ele
  const sekerYasakli = [
    'tatlı',
    'dessert',
    'cake',
    'kek',
    'pasta',
    'sugar',
    'şeker',
    'honey',
    'bal',
    'syrup',
    'şurup',
    'chocolate',
    'çikolata',
    'caramel',
    'karamel',
    'jam',
    'reçel',
    'pudding',
    'puding',
    'pie',
    'tart',
    'brownie',
    'cookie',
    'kurabiye',
    'ice cream',
    'dondurma',
    'sweet',
    'pekmez',
  ];
  const sekerDostu =
    !sekerYasakli.some((k) => metin.includes(k)) && karbonhidrat <= 45;

  const etiketler = [];
  if (tansiyonDostu) etiketler.push('Tansiyon Dostu');
  if (sekerDostu) etiketler.push('Şeker Dostu');

  return etiketler;
}

export default function OzHealthTarifler({
  kaydedilenler = [],
  onFavoriDegistir,
  onKaloriEkle,
}) {
  const [tumTarifler, setTumTarifler] = useState([]);
  const [yukleniyor, setYukleniyor] = useState(true);
  const [seciliFiltre, setSeciliFiltre] = useState('Tümü');
  const [seciliTarif, setSeciliTarif] = useState(null);
  const [eklendiId, setEklendiId] = useState(null);

  useEffect(() => {
    let aktif = true;
    (async () => {
      setYukleniyor(true);
      try {
        const liste = await tarifServisi.tumTarifleriGetir();
        if (aktif) {
          setTumTarifler(liste);
        }
      } finally {
        if (aktif) {
          setYukleniyor(false);
        }
      }
    })();
    return () => {
      aktif = false;
    };
  }, []);

  const saglikliTarifler = useMemo(() => {
    return tumTarifler
      .map((tarif) => {
        const saglikEtiketleri = saglikEtiketleriniBelirle(tarif);
        if (!saglikEtiketleri.length) return null;
        return { ...tarif, saglikEtiketleri };
      })
      .filter(Boolean);
  }, [tumTarifler]);

  const filtrelenmisTarifler = useMemo(() => {
    if (seciliFiltre === 'Tümü') return saglikliTarifler;
    return saglikliTarifler.filter((t) =>
      t.saglikEtiketleri.includes(seciliFiltre)
    );
  }, [saglikliTarifler, seciliFiltre]);

  const kayitliMi = (id) => kaydedilenler.some((t) => t.id === id);

  const kaydetButonunaBas = (e, tarif) => {
    e.stopPropagation();
    onFavoriDegistir?.(tarif);
  };

  const bunuYedim = (tarif) => {
    const kcal = tarif.besinDegerleri?.kalori ?? 250;
    onKaloriEkle?.(kcal);
    setEklendiId(tarif.id);
    setTimeout(() => setEklendiId(null), 2000);
  };

  return (
    <div className="space-y-4">
      {/* Filtre ve Bilgilendirme Kartı */}
      <div className="rounded-2xl bg-white/90 dark:bg-zinc-900/90 border border-red-900/10 dark:border-red-500/20 p-5 shadow-sm space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#B71C1C]/10 dark:bg-red-500/15 text-[#B71C1C] dark:text-red-400 flex items-center justify-center">
              <HeartPulse className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold">Tansiyon & Şeker Dostu Tarifler</h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Düşük sodyumlu ve ilave şekersiz, dengeli öğün önerileri
              </p>
            </div>
          </div>

          <span className="px-2.5 py-1 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-xs font-semibold text-zinc-600 dark:text-zinc-300">
            {filtrelenmisTarifler.length} tarif
          </span>
        </div>

        <div className="flex flex-wrap gap-2">
          {SAGLIK_FILTRELERI.map((filtre) => (
            <button
              key={filtre}
              type="button"
              onClick={() => setSeciliFiltre(filtre)}
              className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                seciliFiltre === filtre
                  ? 'bg-[#B71C1C] text-white'
                  : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-red-900/10'
              }`}
            >
              {filtre === 'Tansiyon Dostu' && <ShieldCheck className="w-3.5 h-3.5" />}
              {filtre === 'Şeker Dostu' && <Droplet className="w-3.5 h-3.5" />}
              <span>{filtre}</span>
            </button>
          ))}
        </div>

        <p className="text-[11px] text-zinc-500 dark:text-zinc-400 bg-zinc-100/80 dark:bg-zinc-800/60 px-3 py-2 rounded-xl">
          Not: Bu filtreler genel beslenme rehberliği sunar; pişirirken tuz ve yağ miktarını doktorunun önerisine göre ayarla.
        </p>
      </div>

      {/* Tarif Listesi */}
      {yukleniyor ? (
        <div className="rounded-2xl bg-white/90 dark:bg-zinc-900/90 border border-red-900/10 dark:border-red-500/20 p-10 text-center space-y-2">
          <RefreshCw className="w-6 h-6 animate-spin mx-auto text-[#B71C1C] dark:text-red-400" />
          <p className="text-sm font-medium">Sağlık dostu tarifler filtreleniyor...</p>
        </div>
      ) : filtrelenmisTarifler.length === 0 ? (
        <div className="rounded-2xl bg-white/90 dark:bg-zinc-900/90 border border-red-900/10 dark:border-red-500/20 p-8 text-center">
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Bu filtreye uygun tarif bulunamadı.
          </p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtrelenmisTarifler.map((tarif) => {
            const kayitli = kayitliMi(tarif.id);
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
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex flex-wrap gap-1">
                        {tarif.saglikEtiketleri.map((etiket) => (
                          <span
                            key={etiket}
                            className={`inline-block px-2 py-0.5 rounded-lg text-[10px] font-semibold ${
                              etiket === 'Tansiyon Dostu'
                                ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300'
                                : 'bg-sky-500/15 text-sky-700 dark:text-sky-300'
                            }`}
                          >
                            {etiket}
                          </span>
                        ))}
                      </div>
                      <button
                        type="button"
                        onClick={(e) => kaydetButonunaBas(e, tarif)}
                        aria-label="Tarifi kaydet"
                        className="p-1.5 rounded-lg hover:bg-red-500/10 transition-colors cursor-pointer shrink-0"
                      >
                        <Bookmark
                          className={`w-4 h-4 ${
                            kayitli
                              ? 'fill-[#B71C1C] text-[#B71C1C] dark:fill-red-400 dark:text-red-400'
                              : 'text-zinc-400'
                          }`}
                        />
                      </button>
                    </div>

                    <h4 className="text-sm font-bold line-clamp-1">{tarif.baslik}</h4>
                    <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                      Karb: {tarif.besinDegerleri?.karbonhidrat ?? 0}g • P:{' '}
                      {tarif.besinDegerleri?.protein ?? 0}g
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
            );
          })}
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
                <div className="flex flex-wrap gap-1.5 mb-1">
                  {seciliTarif.saglikEtiketleri.map((etiket) => (
                    <span
                      key={etiket}
                      className={`px-2 py-0.5 rounded-lg text-[10px] font-semibold ${
                        etiket === 'Tansiyon Dostu'
                          ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300'
                          : 'bg-sky-500/15 text-sky-700 dark:text-sky-300'
                      }`}
                    >
                      {etiket}
                    </span>
                  ))}
                </div>
                <h3 className="text-lg font-bold">{seciliTarif.baslik}</h3>
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

            <div className="flex flex-wrap items-center justify-between gap-2">
              <button
                type="button"
                onClick={(e) => kaydetButonunaBas(e, seciliTarif)}
                className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                  kayitliMi(seciliTarif.id)
                    ? 'bg-[#B71C1C]/15 text-[#B71C1C] dark:bg-red-500/20 dark:text-red-300'
                    : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-200 hover:bg-red-900/10'
                }`}
              >
                <Bookmark
                  className={`w-3.5 h-3.5 ${
                    kayitliMi(seciliTarif.id) ? 'fill-current' : ''
                  }`}
                />
                <span>{kayitliMi(seciliTarif.id) ? 'Kaydedildi' : 'Tarifi Kaydet'}</span>
              </button>

              <button
                type="button"
                onClick={() => bunuYedim(seciliTarif)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#B71C1C] hover:bg-[#991616] text-white text-xs font-semibold transition-colors cursor-pointer"
              >
                {eklendiId === seciliTarif.id ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>Kaloriye Eklendi</span>
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

            <div className="grid grid-cols-4 gap-2 text-center text-xs">
              <div className="p-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-800">
                <p className="text-zinc-500">Kalori</p>
                <p className="font-bold mt-0.5">
                  {seciliTarif.besinDegerleri?.kalori ?? 250} kcal
                </p>
              </div>
              <div className="p-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-800">
                <p className="text-zinc-500">Protein</p>
                <p className="font-bold mt-0.5">
                  {seciliTarif.besinDegerleri?.protein ?? 0} g
                </p>
              </div>
              <div className="p-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-800">
                <p className="text-zinc-500">Karb</p>
                <p className="font-bold mt-0.5">
                  {seciliTarif.besinDegerleri?.karbonhidrat ?? 0} g
                </p>
              </div>
              <div className="p-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-800">
                <p className="text-zinc-500">Yağ</p>
                <p className="font-bold mt-0.5">
                  {seciliTarif.besinDegerleri?.yag ?? 0} g
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="font-semibold text-sm">Malzemeler</h4>
              <div className="flex flex-wrap gap-2">
                {seciliTarif.malzemeler.map((m, i) => (
                  <span
                    key={`${m.ad}-${i}`}
                    className="px-2.5 py-1 rounded-lg bg-red-950/5 dark:bg-red-500/10 text-xs"
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