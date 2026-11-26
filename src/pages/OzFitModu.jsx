import { useEffect, useMemo, useState } from 'react';
import {
  TrendingDown,
  TrendingUp,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Flame,
  Clock,
  Bookmark,
  X,
  PlusCircle,
  Check,
  Utensils,
  RefreshCw,
  Sparkles,
} from 'lucide-react';
import { tarifServisi } from '../services/tarifServisi';

const HEDEF_ANAHTARI = 'ozcook_ozfit_hedef_v1';
const TAKVIM_ANAHTARI = 'ozcook_ozfit_takvim_v1';

const GUN_ISIMLERI = ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'];
const AY_ISIMLERI = [
  'Ocak',
  'Şubat',
  'Mart',
  'Nisan',
  'Mayıs',
  'Haziran',
  'Temmuz',
  'Ağustos',
  'Eylül',
  'Ekim',
  'Kasım',
  'Aralık',
];

function tarihAnahtari(yil, ay, gun) {
  const m = String(ay + 1).padStart(2, '0');
  const d = String(gun).padStart(2, '0');
  return `${yil}-${m}-${d}`;
}

export default function OzFitModu({
  saglikVerisi,
  kaydedilenler = [],
  onFavoriDegistir,
  onKaloriEkle,
  onHedefGuncelle,
}) {
  const [fitHedef, setFitHedef] = useState(() => {
    return localStorage.getItem(HEDEF_ANAHTARI) || 'diyet';
  });

  const [tamamlananGunler, setTamamlananGunler] = useState(() => {
    try {
      const kayit = localStorage.getItem(TAKVIM_ANAHTARI);
      return kayit ? JSON.parse(kayit) : {};
    } catch {
      return {};
    }
  });

  const bugun = new Date();
  const [gorunenYil, setGorunenYil] = useState(bugun.getFullYear());
  const [gorunenAy, setGorunenAy] = useState(bugun.getMonth());

  const [tumTarifler, setTumTarifler] = useState([]);
  const [yukleniyor, setYukleniyor] = useState(true);
  const [seciliTarif, setSeciliTarif] = useState(null);
  const [eklendiId, setEklendiId] = useState(null);
  const [hedefUygulandi, setHedefUygulandi] = useState(false);

  useEffect(() => {
    localStorage.setItem(HEDEF_ANAHTARI, fitHedef);
  }, [fitHedef]);

  useEffect(() => {
    localStorage.setItem(TAKVIM_ANAHTARI, JSON.stringify(tamamlananGunler));
  }, [tamamlananGunler]);

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

  const onerilenKalori = fitHedef === 'diyet' ? 1800 : 2800;

  const kaloriHedefiniUygula = () => {
    onHedefGuncelle?.({
      kaloriHedefi: onerilenKalori,
      suHedefi: saglikVerisi.suHedefi,
      adimHedefi: saglikVerisi.adimHedefi,
    });
    setHedefUygulandi(true);
    setTimeout(() => setHedefUygulandi(false), 2000);
  };

  // Takvim hesaplamaları
  const ayinIlkGunu = new Date(gorunenYil, gorunenAy, 1);
  const ilkGunIndeks = (ayinIlkGunu.getDay() + 6) % 7; // Pazartesi = 0
  const aydakiGunSayisi = new Date(gorunenYil, gorunenAy + 1, 0).getDate();

  const takvimHucreleri = useMemo(() => {
    const hucreler = [];
    for (let i = 0; i < ilkGunIndeks; i += 1) {
      hucreler.push(null);
    }
    for (let gun = 1; gun <= aydakiGunSayisi; gun += 1) {
      hucreler.push(gun);
    }
    return hucreler;
  }, [ilkGunIndeks, aydakiGunSayisi]);

  const gunuDegistir = (gun) => {
    const anahtar = tarihAnahtari(gorunenYil, gorunenAy, gun);
    setTamamlananGunler((prev) => {
      const kopya = { ...prev };
      if (kopya[anahtar]) {
        delete kopya[anahtar];
      } else {
        kopya[anahtar] = fitHedef;
      }
      return kopya;
    });
  };

  const oncekiAy = () => {
    if (gorunenAy === 0) {
      setGorunenAy(11);
      setGorunenYil((y) => y - 1);
    } else {
      setGorunenAy((a) => a - 1);
    }
  };

  const sonrakiAy = () => {
    if (gorunenAy === 11) {
      setGorunenAy(0);
      setGorunenYil((y) => y + 1);
    } else {
      setGorunenAy((a) => a + 1);
    }
  };

  const buAyTamamlananSayisi = useMemo(() => {
    const onek = `${gorunenYil}-${String(gorunenAy + 1).padStart(2, '0')}-`;
    return Object.keys(tamamlananGunler).filter((k) => k.startsWith(onek)).length;
  }, [tamamlananGunler, gorunenYil, gorunenAy]);

  const bugunAnahtari = tarihAnahtari(
    bugun.getFullYear(),
    bugun.getMonth(),
    bugun.getDate()
  );

  // Hedefe uygun tarif önerileri
  const hedefTarifleri = useMemo(() => {
    if (!tumTarifler.length) return [];
    if (fitHedef === 'diyet') {
      return [...tumTarifler]
        .filter((t) => (t.besinDegerleri?.kalori ?? 300) <= 450)
        .sort(
          (a, b) =>
            (a.besinDegerleri?.kalori ?? 300) - (b.besinDegerleri?.kalori ?? 300)
        )
        .slice(0, 12);
    }
    return [...tumTarifler]
      .filter((t) => (t.besinDegerleri?.kalori ?? 300) >= 420)
      .sort(
        (a, b) =>
          (b.besinDegerleri?.kalori ?? 300) - (a.besinDegerleri?.kalori ?? 300)
      )
      .slice(0, 12);
  }, [tumTarifler, fitHedef]);

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
    <div className="space-y-5">
      {/* Diyet / Kilo Alma Seçici */}
      <div className="rounded-2xl bg-white/90 dark:bg-zinc-900/90 border border-red-900/10 dark:border-red-500/20 p-5 shadow-sm space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h3 className="text-base font-bold">Hedefini Seç</h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Seçimine göre kalori hedefin ve tarif önerilerin otomatik şekillenir
            </p>
          </div>
          <button
            type="button"
            onClick={kaloriHedefiniUygula}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#B71C1C]/10 dark:bg-red-500/15 text-[#B71C1C] dark:text-red-300 text-xs font-semibold hover:bg-[#B71C1C]/20 transition-colors cursor-pointer"
          >
            {hedefUygulandi ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>Hedef Güncellendi ({onerilenKalori} kcal)</span>
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5" />
                <span>Hedefimi {onerilenKalori} kcal Yap</span>
              </>
            )}
          </button>
        </div>

        <div className="grid sm:grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setFitHedef('diyet')}
            className={`p-4 rounded-xl border text-left transition-all cursor-pointer flex items-start gap-3 ${
              fitHedef === 'diyet'
                ? 'bg-[#B71C1C]/10 dark:bg-red-500/15 border-[#B71C1C] dark:border-red-400'
                : 'bg-zinc-50 dark:bg-zinc-800/60 border-zinc-200 dark:border-zinc-700 hover:border-red-900/30'
            }`}
          >
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                fitHedef === 'diyet'
                  ? 'bg-[#B71C1C] text-white'
                  : 'bg-zinc-200 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-300'
              }`}
            >
              <TrendingDown className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-bold">Diyet (Kilo Verme)</p>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                Kalori açığı odaklı, 450 kcal altı hafif ve tok tutan öğünler
              </p>
            </div>
          </button>

          <button
            type="button"
            onClick={() => setFitHedef('kiloAlma')}
            className={`p-4 rounded-xl border text-left transition-all cursor-pointer flex items-start gap-3 ${
              fitHedef === 'kiloAlma'
                ? 'bg-[#B71C1C]/10 dark:bg-red-500/15 border-[#B71C1C] dark:border-red-400'
                : 'bg-zinc-50 dark:bg-zinc-800/60 border-zinc-200 dark:border-zinc-700 hover:border-red-900/30'
            }`}
          >
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                fitHedef === 'kiloAlma'
                  ? 'bg-[#B71C1C] text-white'
                  : 'bg-zinc-200 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-300'
              }`}
            >
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-bold">Kilo Alma (Hacim)</p>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                Kalori fazlası odaklı, yüksek kalorili ve protein destekli öğünler
              </p>
            </div>
          </button>
        </div>
      </div>

      {/* Günlük Takip Takvimi */}
      <div className="rounded-2xl bg-white/90 dark:bg-zinc-900/90 border border-red-900/10 dark:border-red-500/20 p-5 shadow-sm space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <CalendarDays className="w-5 h-5 text-[#B71C1C] dark:text-red-400" />
            <div>
              <h3 className="text-sm font-bold">Günlük Takvim</h3>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                Hedefine uyduğun günlere tıklayıp işaretle
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 text-xs font-semibold">
              <CheckCircle2 className="w-3.5 h-3.5" />
              {buAyTamamlananSayisi} gün tamamlandı
            </span>

            <div className="flex items-center gap-1 bg-zinc-100 dark:bg-zinc-800 rounded-xl p-1">
              <button
                type="button"
                onClick={oncekiAy}
                aria-label="Önceki ay"
                className="p-1 rounded-lg hover:bg-white dark:hover:bg-zinc-700 cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-xs font-semibold px-2 min-w-[96px] text-center">
                {AY_ISIMLERI[gorunenAy]} {gorunenYil}
              </span>
              <button
                type="button"
                onClick={sonrakiAy}
                aria-label="Sonraki ay"
                className="p-1 rounded-lg hover:bg-white dark:hover:bg-zinc-700 cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-1.5 text-center">
          {GUN_ISIMLERI.map((gun) => (
            <div
              key={gun}
              className="text-[11px] font-semibold text-zinc-400 py-1"
            >
              {gun}
            </div>
          ))}

          {takvimHucreleri.map((gun, idx) => {
            if (!gun) {
              return <div key={`bos-${idx}`} className="h-10" />;
            }
            const anahtar = tarihAnahtari(gorunenYil, gorunenAy, gun);
            const tamamlandi = Boolean(tamamlananGunler[anahtar]);
            const bugunMu = anahtar === bugunAnahtari;

            return (
              <button
                key={anahtar}
                type="button"
                onClick={() => gunuDegistir(gun)}
                className={`h-10 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center justify-center relative ${
                  tamamlandi
                    ? 'bg-[#B71C1C] text-white shadow-sm'
                    : bugunMu
                    ? 'bg-red-950/10 dark:bg-red-500/20 text-[#B71C1C] dark:text-red-300 ring-1 ring-[#B71C1C]'
                    : 'bg-zinc-100/80 dark:bg-zinc-800/70 text-zinc-700 dark:text-zinc-300 hover:bg-red-900/10'
                }`}
              >
                <span>{gun}</span>
                {tamamlandi && (
                  <Check className="w-3 h-3 absolute top-1 right-1 opacity-90" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Hedefe Uygun Tarif Önerileri */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold px-1">
          {fitHedef === 'diyet'
            ? 'Diyet İçin Önerilen Hafif Tarifler'
            : 'Kilo Alma İçin Yüksek Kalorili Tarifler'}{' '}
          ({hedefTarifleri.length})
        </h3>

        {yukleniyor ? (
          <div className="rounded-2xl bg-white/90 dark:bg-zinc-900/90 border border-red-900/10 dark:border-red-500/20 p-10 text-center space-y-2">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto text-[#B71C1C] dark:text-red-400" />
            <p className="text-sm font-medium">Hedefine uygun tarifler hazırlanıyor...</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {hedefTarifleri.map((tarif) => {
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
                          {fitHedef === 'diyet' ? 'Diyet Dostu' : 'Yüksek Kalori'}
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
                        P: {tarif.besinDegerleri?.protein ?? 0}g • K:{' '}
                        {tarif.besinDegerleri?.karbonhidrat ?? 0}g
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
      </div>

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
                  OzFit • {fitHedef === 'diyet' ? 'Diyet' : 'Kilo Alma'} •{' '}
                  {seciliTarif.sureDk} dk
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