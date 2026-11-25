const BASE_URL = 'https://www.themealdb.com/api/json/v1/1';
const ONBELLEK_ANAHTARI = 'ozcook_themealdb_cache_v1';

const TR_TO_EN = {
  domates: 'tomato',
  salatalik: 'cucumber',
  salatalık: 'cucumber',
  yumurta: 'egg',
  biber: 'pepper',
  sogan: 'onion',
  soğan: 'onion',
  kiyma: 'beef',
  kıyma: 'beef',
  et: 'beef',
  tavuk: 'chicken',
  patates: 'potato',
  pirinc: 'rice',
  pirinç: 'rice',
  makarna: 'pasta',
  peynir: 'cheese',
  sarimsak: 'garlic',
  sarımsak: 'garlic',
  limon: 'lemon',
  havuc: 'carrot',
  havuç: 'carrot',
  mantar: 'mushroom',
  balık: 'salmon',
  balik: 'salmon',
  cikolata: 'chocolate',
  çikolata: 'chocolate',
  un: 'flour',
  seker: 'sugar',
  şeker: 'sugar',
  sut: 'milk',
  süt: 'milk',
  muz: 'banana',
  findik: 'hazelnut',
  fındık: 'hazelnut',
  elma: 'apple',
  çilek: 'strawberry',
  cilek: 'strawberry',
  tatli: 'cake',
  tatlı: 'cake',
  kek: 'cake',
  kurabiye: 'cookie',
  çorba: 'soup',
  corba: 'soup',
  salata: 'salad',
  kahvaltı: 'breakfast',
  kahvalti: 'breakfast',
  fırın: 'bake',
  firin: 'bake',
  ızgara: 'grill',
  izgara: 'grill',
};

const KATEGORI_TR = {
  beef: 'Et Yemekleri',
  chicken: 'Tavuk',
  dessert: 'Tatlı',
  lamb: 'Kuzu',
  miscellaneous: 'Genel',
  pasta: 'Makarna',
  pork: 'Et Yemekleri',
  seafood: 'Deniz Ürünleri',
  side: 'Yan Lezzet',
  starter: 'Başlangıç',
  vegan: 'Vegan',
  vegetarian: 'Vejetaryen',
  breakfast: 'Kahvaltılık',
  goat: 'Et Yemekleri',
};

const MALZEME_TR = {
  chicken: 'Tavuk',
  'chicken breast': 'Tavuk Göğsü',
  beef: 'Dana Eti',
  egg: 'Yumurta',
  eggs: 'Yumurta',
  milk: 'Süt',
  butter: 'Tereyağı',
  'olive oil': 'Zeytinyağı',
  oil: 'Sıvı Yağ',
  flour: 'Un',
  sugar: 'Şeker',
  salt: 'Tuz',
  pepper: 'Karabiber',
  onion: 'Soğan',
  garlic: 'Sarımsak',
  tomato: 'Domates',
  tomatoes: 'Domates',
  potato: 'Patates',
  potatoes: 'Patates',
  rice: 'Pirinç',
  cheese: 'Peynir',
  lemon: 'Limon',
  carrot: 'Havuç',
  mushroom: 'Mantar',
  salmon: 'Somon',
  chocolate: 'Çikolata',
  banana: 'Muz',
  cucumber: 'Salatalık',
  pasta: 'Makarna',
  spaghetti: 'Spagetti',
  yogurt: 'Yoğurt',
  lentils: 'Mercimek',
  chickpeas: 'Nohut',
  honey: 'Bal',
  walnuts: 'Ceviz',
  hazelnuts: 'Fındık',
  almonds: 'Badem',
};

function cevirKelime(metin) {
  const temiz = (metin || '').trim().toLowerCase();
  return TR_TO_EN[temiz] || temiz;
}

function kategoriCevir(hamKategori) {
  const key = (hamKategori || 'Genel').trim().toLowerCase();
  return KATEGORI_TR[key] || hamKategori || 'Genel';
}

function malzemeCevir(hamAd) {
  const key = (hamAd || '').trim().toLowerCase();
  return MALZEME_TR[key] || hamAd.trim();
}

function pisirilisBelirle(kategori, talimat, etiketler) {
  const birlesik = `${kategori} ${talimat} ${etiketler.join(' ')}`.toLowerCase();
  if (
    birlesik.includes('bake') ||
    birlesik.includes('oven') ||
    birlesik.includes('roast') ||
    birlesik.includes('fırın')
  ) {
    return 'Fırın';
  }
  if (
    birlesik.includes('salad') ||
    birlesik.includes('chill') ||
    birlesik.includes('refrigerate') ||
    birlesik.includes('no cook') ||
    birlesik.includes('salata')
  ) {
    return 'Pişirmesiz';
  }
  return 'Ocak';
}

function miktarKatsayisi(miktar) {
  const temiz = (miktar || '').trim().toLowerCase();
  if (!temiz || temiz === 'yeterince') return 1.0;

  let deger = 1.0;
  const kesirMatch = temiz.match(/(\d+)\s*\/\s*(\d+)/);
  if (kesirMatch) {
    const pay = parseFloat(kesirMatch[1]) || 1;
    const payda = parseFloat(kesirMatch[2]) || 1;
    if (payda !== 0) deger = pay / payda;
  } else {
    const sayiMatch = temiz.match(/(\d+(?:[.,]\d+)?)/);
    if (sayiMatch) {
      const hamSayi = parseFloat(sayiMatch[1].replace(',', '.'));
      if (!Number.isNaN(hamSayi) && hamSayi > 0) {
        deger = hamSayi > 30 ? hamSayi / 100.0 : hamSayi;
      }
    }
  }

  return Math.min(2.5, Math.max(0.4, deger));
}

function kelimeIceriyorMu(metin, anahtarlar) {
  return anahtarlar.some((kelime) => metin.includes(kelime));
}

function besinDegerleriniHesapla(kategori, malzemeler, porsiyon = 2) {
  const porsiyonSayisi = porsiyon <= 0 ? 1 : porsiyon;
  const kat = (kategori || '').toLowerCase().trim();

  let protein = 14.0;
  let karb = 30.0;
  let yag = 11.0;

  if (
    kat.includes('beef') ||
    kat.includes('lamb') ||
    kat.includes('pork') ||
    kat.includes('dana') ||
    kat.includes('kuzu') ||
    kat.includes('et')
  ) {
    protein = 26.0;
    karb = 18.0;
    yag = 17.0;
  } else if (
    kat.includes('chicken') ||
    kat.includes('seafood') ||
    kat.includes('tavuk') ||
    kat.includes('deniz') ||
    kat.includes('balık')
  ) {
    protein = 25.0;
    karb = 16.0;
    yag = 11.0;
  } else if (
    kat.includes('pasta') ||
    kat.includes('rice') ||
    kat.includes('makarna') ||
    kat.includes('pilav')
  ) {
    protein = 12.0;
    karb = 46.0;
    yag = 10.0;
  } else if (
    kat.includes('dessert') ||
    kat.includes('baking') ||
    kat.includes('tatlı')
  ) {
    protein = 6.0;
    karb = 52.0;
    yag = 17.0;
  } else if (
    kat.includes('vegetarian') ||
    kat.includes('vegan') ||
    kat.includes('vejetaryen')
  ) {
    protein = 15.0;
    karb = 32.0;
    yag = 10.5;
  } else if (kat.includes('breakfast') || kat.includes('kahvaltı')) {
    protein = 15.0;
    karb = 28.0;
    yag = 12.5;
  }

  for (const m of malzemeler) {
    const ad = (m.ad || '').toLowerCase();
    const katsayi = miktarKatsayisi(m.miktar);

    if (
      kelimeIceriyorMu(ad, [
        'chicken', 'beef', 'steak', 'lamb', 'pork', 'fish', 'salmon', 'tuna',
        'shrimp', 'prawn', 'egg', 'tofu', 'lentil', 'chickpea', 'bean',
        'cheese', 'yogurt', 'milk', 'tavuk', 'et', 'kıyma', 'balık', 'somon',
        'yumurta', 'peynir', 'yoğurt', 'süt', 'mercimek', 'nohut',
      ])
    ) {
      protein += 5.0 * katsayi;
      yag += 1.4 * katsayi;
    }

    if (
      kelimeIceriyorMu(ad, [
        'rice', 'pasta', 'spaghetti', 'noodle', 'flour', 'bread', 'potato',
        'sugar', 'honey', 'corn', 'oat', 'pirinç', 'makarna', 'un', 'ekmek',
        'patates', 'şeker', 'bal', 'mısır', 'yulaf',
      ])
    ) {
      karb += 6.5 * katsayi;
    }

    if (
      kelimeIceriyorMu(ad, [
        'oil', 'olive oil', 'butter', 'ghee', 'cream', 'mayo', 'walnut',
        'almond', 'hazelnut', 'peanut', 'avocado', 'yağ', 'zeytinyağı',
        'tereyağı', 'krema', 'ceviz', 'fındık', 'badem', 'avokado',
      ])
    ) {
      yag += 4.5 * katsayi;
    }
  }

  const pProtein = Math.min(75.0, Math.max(3.0, protein / porsiyonSayisi));
  const pKarb = Math.min(120.0, Math.max(5.0, karb / porsiyonSayisi));
  const pYag = Math.min(65.0, Math.max(2.0, yag / porsiyonSayisi));

  const kalori = Math.min(
    1400,
    Math.max(90, Math.round(pProtein * 4 + pKarb * 4 + pYag * 9))
  );

  return {
    kalori,
    protein: Number(pProtein.toFixed(1)),
    karbonhidrat: Number(pKarb.toFixed(1)),
    yag: Number(pYag.toFixed(1)),
  };
}

export function mealToTarif(json) {
  const malzemeler = [];
  const etiketler = [];

  for (let i = 1; i <= 20; i++) {
    const hamAd = (json[`strIngredient${i}`] || '').toString().trim();
    const hamMiktar = (json[`strMeasure${i}`] || '').toString().trim();
    if (hamAd) {
      const trAd = malzemeCevir(hamAd);
      malzemeler.push({
        ad: trAd,
        miktar: hamMiktar || 'Yeterince',
      });
      etiketler.push(hamAd.toLowerCase(), trAd.toLowerCase());
    }
  }

  const hamKategori = (json.strCategory || 'Genel').toString();
  const kategori = kategoriCevir(hamKategori);
  const baslik = (json.strMeal || 'İsimsiz Tarif').toString();
  const rawTalimat = (json.strInstructions || '').toString();

  const adimlar = rawTalimat
    .split(/\r?\n|\.\s+/)
    .map((e) => e.trim())
    .filter((e) => e.length > 3);

  const pisirilisSekli = pisirilisBelirle(hamKategori, rawTalimat, etiketler);
  const malzemeSayisi = malzemeler.length === 0 ? 4 : malzemeler.length;
  const porsiyon = 2;
  const makro = besinDegerleriniHesapla(kategori, malzemeler, porsiyon);

  return {
    id: (json.idMeal || '').toString(),
    baslik,
    kategori,
    pisirilisSekli,
    sureDk: Math.min(90, Math.max(15, 15 + malzemeSayisi * 3)),
    porsiyon,
    gorselUrl: (json.strMealThumb || '').toString(),
    videoUrl: (json.strYoutube || '').toString(),
    besinDegerleri: makro,
    malzemeler,
    etiketler,
    yapilis: adimlar.length > 0 ? adimlar : ['Hazırlanış adımı bulunamadı.'],
  };
}

function hamVerileriListele(hamYemekler) {
  const harita = new Map();
  for (const item of hamYemekler || []) {
    if (item && typeof item === 'object') {
      const tarif = mealToTarif(item);
      if (tarif.id) {
        harita.set(tarif.id, tarif);
      }
    }
  }
  return Array.from(harita.values()).sort((a, b) =>
    a.baslik.toLowerCase().localeCompare(b.baslik.toLowerCase())
  );
}

let bellekTarifler = null;
let devamEdenIstek = null;

export const tarifServisi = {
  kategoriEslestiMi(tarif, seciliKategori) {
    if (!seciliKategori || seciliKategori === 'Tümü') return true;
    const kat = (tarif.kategori || '').toLowerCase();
    const baslik = (tarif.baslik || '').toLowerCase();
    const etiketler = (tarif.etiketler || []).join(' ');

    if (seciliKategori === 'Kahvaltılık') {
      return (
        kat.includes('kahvaltı') ||
        kat.includes('breakfast') ||
        baslik.includes('egg') ||
        baslik.includes('omlet') ||
        baslik.includes('pancake')
      );
    }
    if (seciliKategori === 'Salata') {
      return (
        kat.includes('salata') ||
        kat.includes('salad') ||
        baslik.includes('salad') ||
        etiketler.includes('lettuce') ||
        etiketler.includes('cucumber')
      );
    }
    if (seciliKategori === 'Tatlı') {
      return (
        kat.includes('tatlı') ||
        kat.includes('dessert') ||
        baslik.includes('cake') ||
        baslik.includes('pie') ||
        baslik.includes('cookie') ||
        baslik.includes('chocolate')
      );
    }
    return true;
  },

  async tumTarifleriGetir({ zorlaYenile = false } = {}) {
    if (!zorlaYenile && bellekTarifler?.length) {
      return bellekTarifler;
    }

    if (!zorlaYenile) {
      try {
        const kayitli = localStorage.getItem(ONBELLEK_ANAHTARI);
        if (kayitli) {
          const parsed = JSON.parse(kayitli);
          if (Array.isArray(parsed) && parsed.length > 0) {
            bellekTarifler = parsed;
            return parsed;
          }
        }
      } catch {}
    }

    if (!zorlaYenile && devamEdenIstek) {
      return devamEdenIstek;
    }

    devamEdenIstek = (async () => {
      const harfler = 'abcdefghijklmnopqrstuvwxyz'.split('');
      const tumHam = [];
      const grupBoyutu = 7;

      for (let i = 0; i < harfler.length; i += grupBoyutu) {
        const grup = harfler.slice(i, i + grupBoyutu);
        await Promise.all(
          grup.map(async (harf) => {
            try {
              const res = await fetch(`${BASE_URL}/search.php?f=${harf}`);
              if (res.ok) {
                const data = await res.json();
                if (Array.isArray(data?.meals)) {
                  tumHam.push(...data.meals);
                }
              }
            } catch {}
          })
        );
      }

      const liste = hamVerileriListele(tumHam);
      if (liste.length > 0) {
        bellekTarifler = liste;
        try {
          localStorage.setItem(ONBELLEK_ANAHTARI, JSON.stringify(liste));
        } catch {}
      }
      return liste;
    })();

    try {
      return await devamEdenIstek;
    } finally {
      devamEdenIstek = null;
    }
  },

  async tarifAra(sorgu) {
    const temiz = (sorgu || '').trim();
    if (!temiz) return this.tumTarifleriGetir();

    const enSorgu = cevirKelime(temiz);
    const harita = new Map();

    try {
      const [isimRes, malzemeRes] = await Promise.all([
        fetch(`${BASE_URL}/search.php?s=${encodeURIComponent(enSorgu)}`),
        fetch(`${BASE_URL}/filter.php?i=${encodeURIComponent(enSorgu)}`),
      ]);

      if (isimRes.ok) {
        const data = await isimRes.json();
        if (Array.isArray(data?.meals)) {
          for (const m of data.meals) {
            const t = mealToTarif(m);
            if (t.id) harita.set(t.id, t);
          }
        }
      }

      if (malzemeRes.ok) {
        const data = await malzemeRes.json();
        if (Array.isArray(data?.meals)) {
          const eksikIdler = data.meals
            .map((m) => m?.idMeal)
            .filter((id) => id && !harita.has(id))
            .slice(0, 12);

          await Promise.all(
            eksikIdler.map(async (id) => {
              const detay = await this.detayGetir(id);
              if (detay?.id) harita.set(detay.id, detay);
            })
          );
        }
      }
    } catch {}

    if (harita.size > 0) {
      return Array.from(harita.values());
    }

    const tumu = await this.tumTarifleriGetir();
    const kucuk = temiz.toLowerCase();
    const kucukEn = enSorgu.toLowerCase();
    return tumu.filter(
      (t) =>
        t.baslik.toLowerCase().includes(kucuk) ||
        t.baslik.toLowerCase().includes(kucukEn) ||
        t.kategori.toLowerCase().includes(kucuk) ||
        t.etiketler.some((e) => e.includes(kucuk) || e.includes(kucukEn))
    );
  },

  async detayGetir(id) {
    if (!id) return null;
    try {
      const res = await fetch(`${BASE_URL}/lookup.php?i=${encodeURIComponent(id)}`);
      if (!res.ok) return null;
      const data = await res.json();
      const first = data?.meals?.[0];
      return first ? mealToTarif(first) : null;
    } catch {
      return null;
    }
  },
};