const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const MODEL = 'gemini-3.8-flash';
const ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`;

async function geminiIstekAt(prompt, jsonModu = false) {
  if (!API_KEY) {
    throw new Error(
      'VITE_GEMINI_API_KEY bulunamadı. .env dosyasını kontrol edip geliştirme sunucusunu (npm run dev) yeniden başlat.'
    );
  }

  const generationConfig = {
    thinkingConfig: {
      thinkingBudget: 0,
    },
  };

  if (jsonModu) {
    generationConfig.responseMimeType = 'application/json';
  }

  const body = {
    contents: [{ parts: [{ text: prompt }] }],
    generationConfig,
  };

  const res = await fetch(`${ENDPOINT}?key=${API_KEY}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const hata = await res.json().catch(() => ({}));
    throw new Error(hata?.error?.message || `API Hatası: ${res.status}`);
  }

  const data = await res.json();
  const metin = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!metin) {
    throw new Error('Yapay zekadan boş yanıt döndü.');
  }
  return metin;
}

export const aiServisi = {
  // 1) Yapay Zeka Mutfak Asistanı Sohbeti
  async mutfakAsistaniSor(soru, baglam = {}) {
    const {
      alinanKalori = 0,
      kaloriHedefi = 2000,
      mod = 'Genel',
    } = baglam;

    const kalanKalori = Math.max(0, kaloriHedefi - alinanKalori);

    const prompt = `Sen Ozcook uygulamasının samimi, pratik ve bilgili Türkçe mutfak asistanısın.
Kullanıcının güncel durumu:
- Aktif mod: ${mod}
- Bugün alınan kalori: ${alinanKalori} kcal / Hedef: ${kaloriHedefi} kcal (Kalan: ${kalanKalori} kcal)

Kurallar:
- Yanıtların kısa, net, uygulanabilir ve Türkçe olsun.
- Tarif verirken yaklaşık kalori/protein tahmini ekle.
- Eğer mod "KYK Yurt" ise sadece kettle, tost makinesi veya elektrikli ocakla yapılabilecek pratik öneriler ver.
- Eğer mod "OzHealth" ise düşük tuzlu ve ilave şekersiz öneriler ver.

Kullanıcının sorusu: ${soru}`;

    return geminiIstekAt(prompt, false);
  },

  // 2) 7 Günlük Haftalık Öğün Planı Oluşturma
  async haftalikPlanOlustur({ mod = 'Genel', kaloriHedefi = 2000, not = '' }) {
    const prompt = `Ozcook uygulaması için 7 günlük Türkçe öğün planı oluştur.
Kriterler:
- Mod: ${mod} (KYK Yurt ise sadece kettle/elektrikli tencere/pratik yurt yemekleri; OzFit ise hedef kaloriye uygun dengeli makrolar; OzHealth ise düşük sodyum ve şekersiz)
- Günlük kalori hedefi: yaklaşık ${kaloriHedefi} kcal
- Ek kullanıcı notu: ${not || 'Yok'}

Sadece aşağıdaki JSON formatında yanıt ver:
{
  "Pazartesi": {
    "kahvalti": { "ad": "...", "kalori": 450 },
    "ogle": { "ad": "...", "kalori": 650 },
    "aksam": { "ad": "...", "kalori": 700 }
  },
  "Salı": { "kahvalti": { "ad": "...", "kalori": 0 }, "ogle": { "ad": "...", "kalori": 0 }, "aksam": { "ad": "...", "kalori": 0 } },
  "Çarşamba": { "kahvalti": { "ad": "...", "kalori": 0 }, "ogle": { "ad": "...", "kalori": 0 }, "aksam": { "ad": "...", "kalori": 0 } },
  "Perşembe": { "kahvalti": { "ad": "...", "kalori": 0 }, "ogle": { "ad": "...", "kalori": 0 }, "aksam": { "ad": "...", "kalori": 0 } },
  "Cuma": { "kahvalti": { "ad": "...", "kalori": 0 }, "ogle": { "ad": "...", "kalori": 0 }, "aksam": { "ad": "...", "kalori": 0 } },
  "Cumartesi": { "kahvalti": { "ad": "...", "kalori": 0 }, "ogle": { "ad": "...", "kalori": 0 }, "aksam": { "ad": "...", "kalori": 0 } },
  "Pazar": { "kahvalti": { "ad": "...", "kalori": 0 }, "ogle": { "ad": "...", "kalori": 0 }, "aksam": { "ad": "...", "kalori": 0 } }
}`;

    const hamJson = await geminiIstekAt(prompt, true);
    return JSON.parse(hamJson);
  },
};