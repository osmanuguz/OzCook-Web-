import { useEffect, useMemo, useState } from 'react';
import {
  Search,
  Flame,
  Clock,
  Bookmark,
  RefreshCw,
  X,
  Utensils,
  Sparkles,
  PlusCircle,
  Check,
} from 'lucide-react';
import { tarifServisi } from '../services/tarifServisi';

const KATEGORILER = ['Tümü', 'Kahvaltılık', 'Salata', 'Tatlı', 'Kaydedilenler'];

function gununSeedDegeri() {
  const bugun = new Date();
  return (
    bugun.getFullYear() * 10000 +
    (bugun.getMonth() + 1) * 100 +
    bugun.getDate()
  );
}

function gununMenusunuSec(tarifler) {
  if (!tarifler.length) return [];

  const seed = gununSeedDegeri();
  const secilenler = [];
  const kullanilanIdler = new Set();

  const havuzdanSec = (etiket, adaylar) => {
    const uygun = adaylar.filter((t) => !kullanilanIdler.has(t.id));
    if (!uygun.length) return;
    const index = (seed + secilenler.length * 7) % uygun.length;
    const secilen = uygun[index];
    kullanilanIdler.add(secilen.id);
    secilenler.push({ ogun: etiket, tarif: secilen });
  };

  const kahvaltiAdaylari = tarifler.filter((t) =>
    tarifServisi.kategoriEslestiMi(t, 'Kahvaltılık')
  );
  const tatliSalataAdaylari = tarifler.filter(
    (t) =>
      tarifServisi.kategoriEslestiMi(t, 'Salata') ||
      tarifServisi.kategoriEslestiMi(t, 'Tatlı')
  );
  const anaYemekAdaylari = tarifler.filter(
    (t) =>
      !tarifServisi.kategoriEslestiMi(t, 'Kahvaltılık') &&
      !tarifServisi.kategoriEslestiMi(t, 'Tatlı')
  );

  havuzdanSec('Güne Başlangıç', kahvaltiAdaylari.length ? kahvaltiAdaylari : tarifler);
  havuzdanSec('Ana Öğün', anaYemekAdaylari.length ? anaYemekAdaylari : tarifler);
  havuzdanSec(
    'Yanında / Tatlı',
    tatliSalataAdaylari.length ? tatliSalataAdaylari : tarifler
  );

  return secilenler;
}

export default function AnaSayfa({
  saglikVerisi,
  kaydedilenler = [],
  onFavoriDegistir,
  onKaloriEkle,
  onModlaraGit,
}) {
  const [tarifler, setTarifler] = useState([]);
  const [yukleniyor, setYukleniyor] = useState(true);
  const [hata, setHata] = useState('');
  const [arama, setArama] = useState('');
  const [seciliKategori, setSeciliKategori] = useState('Tümü');
  const [seciliTarif, setSeciliTarif] = useState(null);
  const [eklendiId, setEklendiId] = useState(null);

  const tarifleriYukle = async ({ zorlaYenile = false, sorgu = '' } = {}) => {
    setYukleniyor(true);
    setHata('');
    try {
      const liste = sorgu.trim()
        ? await tarifServisi.tarifAra(sorgu)
        : await tarifServisi.tumTarifleriGetir({ zorlaYenile });

      setTarifler(liste);
      if (!liste.length) {
        setHata('Tarif bulunamadı veya API yanıtı boş döndü.');
      }
    } catch {
      setHata('TheMealDB tarifleri yüklenirken bir hata oluştu.');
    } finally {
      setYukleniyor(false);
    }
  };

  useEffect(() => {
    tarifleriYukle();
  }, []);

  const aramaYap = (e) => {
    e.preventDefault();
    tarifleriYukle({ sorgu: arama });
  };

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

  const gununMenusu = useMemo(() => gununMenusunuSec(tarifler), [tarifler]);
  const gununToplamKalorisi = useMemo(
    () =>
      gununMenusu.reduce(
        (toplam, item) => toplam + (item.tarif.besinDegerleri?.kalori ?? 250),
        0
      ),
    [gununMenusu]
  );

  const gorunenTarifler =
    seciliKategori === 'Kaydedilenler'
      ? kaydedilenler
      : tarifler.filter((tarif) =>
          tarifServisi.kategoriEslestiMi(tarif, seciliKategori)
        );

  return (
    <div className="space-y-5">
      {/* Üst Özet Kartı */}
      <div className="rounded-2xl bg-white/90 dark:bg-zinc-900/90 border border-red-900/10 dark:border-red-500/20 p-5 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold">Ozcook Mutfak & Sağlık Özeti</h2>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
            Bugün {saglikVerisi.alinanKalori} kcal •{' '}
            {saglikVerisi.adim.toLocaleString('tr-TR')} adım •{' '}
            {saglikVerisi.suBardak}/{saglikVerisi.suHedefi} bardak su
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => tarifleriYukle({ zorlaYenile: true, sorgu: arama })}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:bg-red-900/10 text-xs font-medium transition-colors cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${yukleniyor ? 'animate-spin' : ''}`} />
            <span>Yenile</span>
          </button>

          <button
            type="button"
            onClick={onModlaraGit}
            className="px-4 py-2 rounded-xl bg-[#B71C1C] hover:bg-[#991616] text-white text-xs font-semibold transition-colors cursor-pointer"
          >
            Oz Modlarına Git
          </button>
        </div>
      </div>

      {/* Günün Menüsü */}
      {!yukleniyor && gununMenusu.length > 0 && !arama.trim() && (
        <div className="rounded-2xl bg-white/90 dark:bg-zinc-900/90 border border-red-900/15 dark:border-red-500/25 p-5 shadow-sm space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-[#B71C1C]/10 dark:bg-red-500/20 text-[#B71C1C] dark:text-red-400 flex items-center justify-center">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold">Günün Menüsü</h3>
                <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                  Bugün senin için seçilen dengeli öğün önerileri
                </p>
              </div>
            </div>
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-[#B71C1C]/10 dark:bg-red-500/20 text-[#B71C1C] dark:text-red-300 text-xs font-semibold">
              <Flame className="w-3.5 h-3.5" />
              Toplam ~{gununToplamKalorisi} kcal
            </span>
          </div>

          <div className="grid sm:grid-cols-3 gap-3">
            {gununMenusu.map(({ ogun, tarif }) => {
              const kayitli = kayitliMi(tarif.id);
              return (
                <div
                  key={`${ogun}-${tarif.id}`}
                  onClick={() => setSeciliTarif(tarif)}
                  className="rounded-xl bg-zinc-50 dark:bg-zinc-800/70 border border-zinc-200/70 dark:border-zinc-700/60 overflow-hidden hover:border-[#B71C1C]/50 transition-colors cursor-pointer flex flex-col justify-between"
                >
                  <div>
                    {tarif.gorselUrl ? (
                      <img
                        src={tarif.gorselUrl}
                        alt={tarif.baslik}
                        loading="lazy"
                        className="w-full h-28 object-cover"
                      />
                    ) : (
                      <div className="w-full h-28 bg-zinc-200 dark:bg-zinc-700 flex items-center justify-center">
                        <Utensils className="w-6 h-6 text-zinc-400" />
                      </div>
                    )}
                    <div className="p-3 space-y-1">
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-[#B71C1C] dark:text-red-400">
                          {ogun}
                        </span>
                        <button
                          type="button"
                          onClick={(e) => kaydetButonunaBas(e, tarif)}
                          aria-label="Tarifi kaydet"
                          className="p-1 rounded-md hover:bg-red-500/10 cursor-pointer"
                        >
                          <Bookmark
                            className={`w-3.5 h-3.5 ${
                              kayitli
                                ? 'fill-[#B71C1C] text-[#B71C1C] dark:fill-red-400 dark:text-red-400'
                                : 'text-zinc-400'
                            }`}
                          />
                        </button>
                      </div>
                      <h4 className="text-xs font-bold line-clamp-1">{tarif.baslik}</h4>
                    </div>
                  </div>
                  <div className="px-3 pb-2.5 flex items-center justify-between text-[11px] text-zinc-500 dark:text-zinc-400">
                    <span>{tarif.besinDegerleri?.kalori ?? 250} kcal</span>
                    <span>{tarif.sureDk} dk</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Arama ve Kategori Filtreleri */}
      <div className="rounded-2xl bg-white/90 dark:bg-zinc-900/90 border border-red-900/10 dark:border-red-500/20 p-4 shadow-sm space-y-3">
        <form onSubmit={aramaYap} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={arama}
              onChange={(e) => {
                setArama(e.target.value);
                if (!e.target.value.trim()) {
                  tarifleriYukle({ sorgu: '' });
                }
              }}
              placeholder="Tarif veya malzeme ara (ör. tavuk, makarna, egg, cake)..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-sm outline-none focus:ring-2 focus:ring-[#B71C1C]"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2.5 rounded-xl bg-[#B71C1C] hover:bg-[#991616] text-white text-xs font-semibold transition-colors cursor-pointer"
          >
            Ara
          </button>
        </form>

        <div className="flex flex-wrap gap-2">
          {KATEGORILER.map((kat) => (
            <button
              key={kat}
              type="button"
              onClick={() => setSeciliKategori(kat)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-colors cursor-pointer ${
                seciliKategori === kat
                  ? 'bg-[#B71C1C] text-white'
                  : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-red-900/10'
              }`}
            >
              {kat === 'Kaydedilenler' && <Bookmark className="w-3.5 h-3.5" />}
              <span>
                {kat === 'Kaydedilenler' ? `${kat} (${kaydedilenler.length})` : kat}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Tarif Listesi */}
      {yukleniyor && seciliKategori !== 'Kaydedilenler' ? (
        <div className="rounded-2xl bg-white/90 dark:bg-zinc-900/90 border border-red-900/10 dark:border-red-500/20 p-10 text-center space-y-2">
          <RefreshCw className="w-6 h-6 animate-spin mx-auto text-[#B71C1C] dark:text-red-400" />
          <p className="text-sm font-medium">TheMealDB tarifleri yükleniyor...</p>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            İlk yüklemede tarifler önbelleğe alınıyor.
          </p>
        </div>
      ) : seciliKategori === 'Kaydedilenler' && gorunenTarifler.length === 0 ? (
        <div className="rounded-2xl bg-white/90 dark:bg-zinc-900/90 border border-red-900/10 dark:border-red-500/20 p-8 text-center space-y-2">
          <Bookmark className="w-7 h-7 mx-auto text-zinc-400" />
          <p className="text-sm font-medium">Henüz kaydettiğin bir tarif yok.</p>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            Beğendiğin tariflerin üzerindeki kaydet ikonuna basarak burada toplayabilirsin.
          </p>
        </div>
      ) : hata && gorunenTarifler.length === 0 ? (
        <div className="rounded-2xl bg-white/90 dark:bg-zinc-900/90 border border-red-900/10 dark:border-red-500/20 p-8 text-center space-y-3">
          <p className="text-sm font-medium text-[#B71C1C] dark:text-red-400">{hata}</p>
          <button
            type="button"
            onClick={() => tarifleriYukle({ zorlaYenile: true })}
            className="px-4 py-2 rounded-xl bg-[#B71C1C] text-white text-xs font-semibold cursor-pointer"
          >
            Tekrar Dene
          </button>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {gorunenTarifler.map((tarif) => {
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
                      className="w-full h-40 object-cover bg-zinc-200 dark:bg-zinc-800"
                    />
                  ) : (
                    <div className="w-full h-40 bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center">
                      <Utensils className="w-8 h-8 text-zinc-400" />
                    </div>
                  )}

                  <div className="p-4 space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <span className="inline-block px-2.5 py-0.5 rounded-lg text-[11px] font-semibold bg-red-950/10 dark:bg-red-500/15 text-[#B71C1C] dark:text-red-400">
                        {tarif.kategori} • {tarif.pisirilisSekli}
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

                    <h3 className="text-sm font-bold line-clamp-1">{tarif.baslik}</h3>
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
                  {seciliTarif.kategori} • {seciliTarif.pisirilisSekli} • {seciliTarif.sureDk} dk
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
                <p className="font-bold mt-0.5">{seciliTarif.besinDegerleri.kalori} kcal</p>
              </div>
              <div className="p-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-800">
                <p className="text-zinc-500">Protein</p>
                <p className="font-bold mt-0.5">{seciliTarif.besinDegerleri.protein} g</p>
              </div>
              <div className="p-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-800">
                <p className="text-zinc-500">Karb</p>
                <p className="font-bold mt-0.5">{seciliTarif.besinDegerleri.karbonhidrat} g</p>
              </div>
              <div className="p-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-800">
                <p className="text-zinc-500">Yağ</p>
                <p className="font-bold mt-0.5">{seciliTarif.besinDegerleri.yag} g</p>
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