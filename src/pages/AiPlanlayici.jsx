import { useState } from 'react';
import {
  Sparkles,
  Send,
  CalendarDays,
  ChefHat,
  Loader2,
  Trash2,
  Flame,
} from 'lucide-react';
import { aiServisi } from '../services/aiServisi';

const GUNLER = [
  'Pazartesi',
  'Salı',
  'Çarşamba',
  'Perşembe',
  'Cuma',
  'Cumartesi',
  'Pazar',
];

const MODLAR = ['Genel', 'KYK Yurt', 'OzFit', 'OzHealth'];

const HIZLI_SORULAR = [
  'Elimde yumurta, yoğurt ve yulaf var; pratik ne yapabilirim?',
  'KYK yurdunda kettle ile yüksek proteinli akşam yemeği öner',
  'Kalan kalorime göre hafif bir akşam öğünü söyle',
];

export default function AiPlanlayici({
  saglikVerisi,
  haftalikPlan,
  onPlanGuncelle,
}) {
  const [altSekme, setAltSekme] = useState('asistan'); // 'asistan' | 'plan'
  const [seciliMod, setSeciliMod] = useState('Genel');

  // Asistan state'leri
  const [soru, setSoru] = useState('');
  const [mesajlar, setMesajlar] = useState([
    {
      rol: 'asistan',
      metin:
        'Selam! Ben Ozcook Mutfak Asistanı. Elindeki malzemeleri yazabilir, kalori tahmini isteyebilir veya moduna göre tarif sorabilirsin.',
    },
  ]);
  const [asistanYukleniyor, setAsistanYukleniyor] = useState(false);

  // Planlayıcı state'leri
  const [planNotu, setPlanNotu] = useState('');
  const [planYukleniyor, setPlanYukleniyor] = useState(false);
  const [hata, setHata] = useState('');

  const alinanKalori = saglikVerisi?.bugun?.kalori || 0;
  const kaloriHedefi = saglikVerisi?.hedefler?.kalori || 2000;

  const soruGonder = async (metinOverride) => {
    const icerik = (metinOverride ?? soru).trim();
    if (!icerik || asistanYukleniyor) return;

    setHata('');
    setSoru('');
    setMesajlar((prev) => [...prev, { rol: 'kullanici', metin: icerik }]);
    setAsistanYukleniyor(true);

    try {
      const yanit = await aiServisi.mutfakAsistaniSor(icerik, {
        alinanKalori,
        kaloriHedefi,
        mod: seciliMod,
      });
      setMesajlar((prev) => [...prev, { rol: 'asistan', metin: yanit }]);
    } catch (err) {
      setHata(err.message || 'Yapay zekaya bağlanırken bir hata oluştu.');
    } finally {
      setAsistanYukleniyor(false);
    }
  };

  const planOlustur = async () => {
    if (planYukleniyor) return;
    setHata('');
    setPlanYukleniyor(true);

    try {
      const yeniPlan = await aiServisi.haftalikPlanOlustur({
        mod: seciliMod,
        kaloriHedefi,
        not: planNotu.trim(),
      });
      onPlanGuncelle(yeniPlan);
    } catch (err) {
      setHata(err.message || 'Haftalık plan oluşturulurken bir hata oluştu.');
    } finally {
      setPlanYukleniyor(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Üst Sekme ve Mod Seçici */}
      <div className="rounded-2xl bg-white/90 dark:bg-zinc-900/90 border border-red-900/10 dark:border-red-500/20 p-4 shadow-sm space-y-3">
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => setAltSekme('asistan')}
            className={`inline-flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
              altSekme === 'asistan'
                ? 'bg-[#B71C1C] text-white'
                : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-200'
            }`}
          >
            <ChefHat className="w-4 h-4" />
            <span>Mutfak Asistanı</span>
          </button>

          <button
            type="button"
            onClick={() => setAltSekme('plan')}
            className={`inline-flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
              altSekme === 'plan'
                ? 'bg-[#B71C1C] text-white'
                : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-200'
            }`}
          >
            <CalendarDays className="w-4 h-4" />
            <span>Haftalık Plan</span>
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400 mr-1">
            Mod:
          </span>
          {MODLAR.map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setSeciliMod(m)}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                seciliMod === m
                  ? 'bg-[#B71C1C]/15 text-[#B71C1C] dark:bg-red-500/20 dark:text-red-300'
                  : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300'
              }`}
            >
              {m}
            </button>
          ))}
        </div>
      </div>

      {hata && (
        <div className="rounded-xl bg-red-500/10 border border-red-500/30 text-[#B71C1C] dark:text-red-300 px-4 py-3 text-xs font-medium">
          {hata}
        </div>
      )}

      {/* 1. MUTFAK ASİSTANI */}
      {altSekme === 'asistan' && (
        <div className="rounded-2xl bg-white/90 dark:bg-zinc-900/90 border border-red-900/10 dark:border-red-500/20 p-4 shadow-sm space-y-4">
          <div className="flex flex-wrap gap-1.5">
            {HIZLI_SORULAR.map((h) => (
              <button
                key={h}
                type="button"
                onClick={() => soruGonder(h)}
                disabled={asistanYukleniyor}
                className="text-left text-[11px] px-2.5 py-1.5 rounded-lg bg-zinc-100 dark:bg-zinc-800 hover:bg-red-900/10 text-zinc-700 dark:text-zinc-200 transition-colors cursor-pointer"
              >
                {h}
              </button>
            ))}
          </div>

          <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1">
            {mesajlar.map((m, i) => (
              <div
                key={i}
                className={`flex ${
                  m.rol === 'kullanici' ? 'justify-end' : 'justify-start'
                }`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-xs leading-relaxed whitespace-pre-wrap ${
                    m.rol === 'kullanici'
                      ? 'bg-[#B71C1C] text-white'
                      : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-100'
                  }`}
                >
                  {m.metin}
                </div>
              </div>
            ))}

            {asistanYukleniyor && (
              <div className="flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">
                <Loader2 className="w-4 h-4 animate-spin text-[#B71C1C]" />
                <span>Asistan düşünüyor...</span>
              </div>
            )}
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              soruGonder();
            }}
            className="flex gap-2"
          >
            <input
              type="text"
              value={soru}
              onChange={(e) => setSoru(e.target.value)}
              placeholder="Malzemelerini veya sorunu yaz..."
              className="flex-1 px-3.5 py-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-sm outline-none focus:ring-2 focus:ring-[#B71C1C]"
            />
            <button
              type="submit"
              disabled={asistanYukleniyor || !soru.trim()}
              className="inline-flex items-center justify-center px-4 py-2.5 rounded-xl bg-[#B71C1C] hover:bg-[#991616] disabled:opacity-50 text-white transition-colors cursor-pointer"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}

      {/* 2. HAFTALIK ÖĞÜN PLANLAYICI */}
      {altSekme === 'plan' && (
        <div className="space-y-4">
          <div className="rounded-2xl bg-white/90 dark:bg-zinc-900/90 border border-red-900/10 dark:border-red-500/20 p-4 shadow-sm space-y-3">
            <div className="flex items-center justify-between gap-2">
              <div>
                <h2 className="text-sm font-bold">7 Günlük Yapay Zeka Planı</h2>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  Hedef: ~{kaloriHedefi} kcal • Mod: {seciliMod}
                </p>
              </div>
              {haftalikPlan && (
                <button
                  type="button"
                  onClick={() => onPlanGuncelle(null)}
                  title="Planı Temizle"
                  className="p-2 rounded-lg bg-zinc-100 dark:bg-zinc-800 hover:text-[#B71C1C] transition-colors cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>

            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                value={planNotu}
                onChange={(e) => setPlanNotu(e.target.value)}
                placeholder="Ek not (ör. tavuk ağırlıklı, bütçe dostu, laktozsuz...)"
                className="flex-1 px-3.5 py-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-xs outline-none focus:ring-2 focus:ring-[#B71C1C]"
              />
              <button
                type="button"
                onClick={planOlustur}
                disabled={planYukleniyor}
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#B71C1C] hover:bg-[#991616] disabled:opacity-60 text-white text-xs font-semibold transition-colors cursor-pointer shrink-0"
              >
                {planYukleniyor ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Oluşturuluyor...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>7 Günlük Plan Oluştur</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {haftalikPlan ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {GUNLER.map((gun) => {
                const gunVerisi = haftalikPlan[gun];
                if (!gunVerisi) return null;
                const gunToplam =
                  (gunVerisi.kahvalti?.kalori || 0) +
                  (gunVerisi.ogle?.kalori || 0) +
                  (gunVerisi.aksam?.kalori || 0);

                return (
                  <div
                    key={gun}
                    className="rounded-2xl bg-white/90 dark:bg-zinc-900/90 border border-red-900/10 dark:border-red-500/20 p-4 shadow-sm space-y-2.5"
                  >
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-bold text-[#B71C1C] dark:text-red-400">
                        {gun}
                      </h3>
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-lg bg-[#B71C1C]/10 text-[#B71C1C] dark:text-red-300">
                        <Flame className="w-3 h-3" />
                        {gunToplam} kcal
                      </span>
                    </div>

                    <div className="space-y-1.5 text-xs">
                      <div className="p-2 rounded-xl bg-zinc-50 dark:bg-zinc-800/70">
                        <span className="font-semibold text-zinc-500 dark:text-zinc-400">
                          Kahvaltı:{' '}
                        </span>
                        <span>{gunVerisi.kahvalti?.ad}</span>
                        <span className="text-zinc-400 ml-1">
                          ({gunVerisi.kahvalti?.kalori} kcal)
                        </span>
                      </div>
                      <div className="p-2 rounded-xl bg-zinc-50 dark:bg-zinc-800/70">
                        <span className="font-semibold text-zinc-500 dark:text-zinc-400">
                          Öğle:{' '}
                        </span>
                        <span>{gunVerisi.ogle?.ad}</span>
                        <span className="text-zinc-400 ml-1">
                          ({gunVerisi.ogle?.kalori} kcal)
                        </span>
                      </div>
                      <div className="p-2 rounded-xl bg-zinc-50 dark:bg-zinc-800/70">
                        <span className="font-semibold text-zinc-500 dark:text-zinc-400">
                          Akşam:{' '}
                        </span>
                        <span>{gunVerisi.aksam?.ad}</span>
                        <span className="text-zinc-400 ml-1">
                          ({gunVerisi.aksam?.kalori} kcal)
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="rounded-2xl bg-white/70 dark:bg-zinc-900/70 border border-dashed border-zinc-300 dark:border-zinc-700 p-8 text-center text-xs text-zinc-500 dark:text-zinc-400">
              Henüz haftalık planın yok. Yukarıdan modunu seçip{' '}
              <strong>7 Günlük Plan Oluştur</strong> butonuna basabilirsin.
            </div>
          )}
        </div>
      )}
    </div>
  );
}