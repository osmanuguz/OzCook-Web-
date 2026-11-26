import { useEffect, useMemo, useState } from 'react';
import {
  Building2,
  Flame,
  Clock,
  Bookmark,
  X,
  PlusCircle,
  Check,
  Coffee,
  Zap,
  Utensils,
  RefreshCw,
} from 'lucide-react';
import { tarifServisi } from '../services/tarifServisi';

const EKIPMAN_FILTRELERI = ['Tümü', 'Elektrikli Ocak', 'Kettle', 'Pişirmesiz'];

function kykYontemiBelirle(tarif) {
  const metin = [
    tarif.baslik,
    tarif.kategori,
    tarif.pisirilisSekli,
    ...(tarif.yapilis || []),
  ]
    .join(' ')
    .toLowerCase();

  // Fırın, ızgara veya mangal gerektiren tarifleri yurda uygun olmadığı için ele
  const yasakliKelimeler = [
    'fırın',
    'firin',
    'oven',
    'bake',
    'roast',
    'broil',
    'ızgara',
    'izgara',
    'grill',
    'mangal',
    'barbekü',
    'bbq',
    'preheat',
    'derece',
    '°c',
    '°f',
  ];
  if (yasakliKelimeler.some((k) => metin.includes(k))) {
    return null;
  }

  // Pişirme gerektirmeyenler
  const pisirmeFiilleri = [
    'pişir',
    'kaynat',
    'kızart',
    'haşla',
    'kavur',
    'sote',
    'ısıt',
    'tava',
    'tencere',
    'boil',
    'fry',
    'cook',
    'simmer',
    'heat',
    'pan',
    'pot',
  ];
  const pisirmesizMi =
    (metin.includes('salata') ||
      metin.includes('salad') ||
      metin.includes('pişirmesiz') ||
      metin.includes('sandviç') ||
      metin.includes('sandwich')) &&
    !pisirmeFiilleri.some((k) => metin.includes(k));

  if (pisirmesizMi) {
    return 'Pişirmesiz';
  }

  // Sadece sıcak su / haşlama ile Kettle'da yapılabilecekler
  const kettleKelimeleri = [
    'kettle',
    'kaynar su',
    'sıcak su',
    'noodle',
    'yulaf',
    'oat',
    'porridge',
    'kuskus',
    'couscous',
    'haşla',
    'poach',
  ];
  const tavaKelimeleri = ['kızart', 'kavur', 'sote', 'fry', 'sauté', 'tava', 'pan'];
  if (
    kettleKelimeleri.some((k) => metin.includes(k)) &&
    !tavaKelimeleri.some((k) => metin.includes(k))
  ) {
    return 'Kettle';
  }

  // Fırın gerektirmeyen diğer ocak/tava/tencere tarifleri -> Elektrikli Ocak
  return 'Elektrikli Ocak';
}

export default function KykYurtModu({
  kaydedilenler = [],
  onFavoriDegistir,
  onKaloriEkle,
}) {
  const [tumTarifler, setTumTarifler] = useState([]);
  const [yukleniyor, setYukleniyor] = useState(true);
  const [seciliEkipman, setSeciliEkipman] = useState('Tümü');
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

  const kykUygunTarifler = useMemo(() => {
    return tumTarifler
      .map((tarif) => {
        const ekipman = kykYontemiBelirle(tarif);
        if (!ekipman) return null;
        return { ...tarif, kykEkipman: ekipman };
      })
      .filter(Boolean);
  }, [tumTarifler]);

  const filtrelenmisTarifler = useMemo(() => {
    if (seciliEkipman === 'Tümü') return kykUygunTarifler;
    return kykUygunTarifler.filter((t) => t.kykEkipman === seciliEkipman);
  }, [kykUygunTarifler, seciliEkipman]);

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
      {/* Üst Bilgi & Filtre Kartı */}
      <div className="rounded-2xl bg-white/90 dark:bg-zinc-900/90 border border-red-900/10 dark:border-red-500/20 p-5 shadow-sm space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#B71C1C]/10 dark:bg-red-500/15 text-[#B71C1C] dark:text-red-400 flex items-center justify-center">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold">KYK Yurt Modu</h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Fırınsız, ızgarasız — elektrikli ocak, kettle veya pişirmesiz API tarifleri
              </p>
            </div>
          </div>

          <span className="px-2.5 py-1 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-xs font-semibold text-zinc-600 dark:text-zinc-300">
            {filtrelenmisTarifler.length} tarif
          </span>
        </div>

        <div className="flex flex-wrap gap-2">
          {EKIPMAN_FILTRELERI.map((ekipman) => (
            <button
              key={ekipman}
              type="button"
              onClick={() => setSeciliEkipman(ekipman)}
              className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                seciliEkipman === ekipman
                  ? 'bg-[#B71C1C] text-white'
                  : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-red-900/10'
              }`}
            >
              {ekipman === 'Elektrikli Ocak' && <Flame className="w-3.5 h-3.5" />}
              {ekipman === 'Kettle' && <Coffee className="w-3.5 h-3.5" />}
              {ekipman === 'Pişirmesiz' && <Zap className="w-3.5 h-3.5" />}
              <span>{ekipman}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Tarif Listesi */}
      {yukleniyor ? (
        <div className="rounded-2xl bg-white/90 dark:bg-zinc-900/90 border border-red-900/10 dark:border-red-500/20 p-10 text-center space-y-2">
          <RefreshCw className="w-6 h-6 animate-spin mx-auto text-[#B71C1C] dark:text-red-400" />
          <p className="text-sm font-medium">Yurda uygun tarifler filtreleniyor...</p>
        </div>
      ) : filtrelenmisTarifler.length === 0 ? (
        <div className="rounded-2xl bg-white/90 dark:bg-zinc-900/90 border border-red-900/10 dark:border-red-500/20 p-8 text-center">
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Bu ekipman filtresine uygun tarif bulunamadı. Diğer filtreleri deneyebilirsin.
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
                    <div className="flex items-center justify-between gap-2">
                      <span className="inline-block px-2.5 py-0.5 rounded-lg text-[11px] font-semibold bg-[#B71C1C]/10 dark:bg-red-500/15 text-[#B71C1C] dark:text-red-300">
                        {tarif.kykEkipman}
                      </span>
                      <button
                        type="button"
                        onClick={(e) => kaydetButonunaBas(e, tarif)}
                        aria-label="Tarifi kaydet"
                        className="p-1.5 rounded-lg hover:bg-red-500/10 transition-colors cursor-pointer"
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
                      {tarif.kategori} • P: {tarif.besinDegerleri?.protein ?? 0}g
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
                <span className="text-xs font-semibold text-[#B71C1C] dark:text-red-400">
                  KYK Yurt • {seciliTarif.kykEkipman} • {seciliTarif.sureDk} dk
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