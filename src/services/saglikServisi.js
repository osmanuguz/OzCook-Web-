const DEPO_ANAHTARI = 'ozcook_saglik_verileri_v1';

const VARSAYILAN_VERI = {
  adim: 6420,
  adimHedefi: 10000,
  suBardak: 6,
  suHedefi: 8,
  alinanKalori: 1680,
  yakilanKalori: 420,
  kaloriHedefi: 2200,
  uykuSaat: 7.5,
  googleBagli: false,
  sonSenkron: null,
};

function simdiSaat() {
  return new Date().toLocaleTimeString('tr-TR', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

export const saglikServisi = {
  getir() {
    try {
      const kayit = localStorage.getItem(DEPO_ANAHTARI);
      if (!kayit) return { ...VARSAYILAN_VERI };
      return { ...VARSAYILAN_VERI, ...JSON.parse(kayit) };
    } catch {
      return { ...VARSAYILAN_VERI };
    }
  },

  kaydet(yeniVeri) {
    localStorage.setItem(DEPO_ANAHTARI, JSON.stringify(yeniVeri));
    return yeniVeri;
  },

  suEkle(mevcut, miktar = 1) {
    return this.kaydet({
      ...mevcut,
      suBardak: Math.max(0, mevcut.suBardak + miktar),
      sonSenkron: simdiSaat(),
    });
  },

  adimEkle(mevcut, miktar = 1000) {
    const yeniAdim = Math.max(0, mevcut.adim + miktar);
    return this.kaydet({
      ...mevcut,
      adim: yeniAdim,
      yakilanKalori: Math.max(0, mevcut.yakilanKalori + Math.round(miktar * 0.04)),
      sonSenkron: simdiSaat(),
    });
  },

  kaloriEkle(mevcut, miktar) {
    const sayi = Number(miktar) || 0;
    return this.kaydet({
      ...mevcut,
      alinanKalori: Math.max(0, mevcut.alinanKalori + sayi),
      sonSenkron: simdiSaat(),
    });
  },

  uykuGuncelle(mevcut, yeniSaat) {
    const sayi = Math.min(24, Math.max(0, Number(yeniSaat) || 0));
    return this.kaydet({
      ...mevcut,
      uykuSaat: Number(sayi.toFixed(1)),
      sonSenkron: simdiSaat(),
    });
  },

  hedefleriGuncelle(mevcut, yeniHedefler) {
    return this.kaydet({
      ...mevcut,
      kaloriHedefi: Math.max(500, Number(yeniHedefler.kaloriHedefi) || mevcut.kaloriHedefi),
      suHedefi: Math.max(1, Number(yeniHedefler.suHedefi) || mevcut.suHedefi),
      adimHedefi: Math.max(1000, Number(yeniHedefler.adimHedefi) || mevcut.adimHedefi),
      sonSenkron: simdiSaat(),
    });
  },

  senkronizeEt(mevcut) {
    return this.kaydet({
      ...mevcut,
      sonSenkron: simdiSaat(),
    });
  },
};