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

  suEkle(mevcut) {
    return this.kaydet({
      ...mevcut,
      suBardak: mevcut.suBardak + 1,
      sonSenkron: new Date().toLocaleTimeString('tr-TR', {
        hour: '2-digit',
        minute: '2-digit',
      }),
    });
  },

  adimEkle(mevcut, miktar = 1000) {
    const yeniAdim = mevcut.adim + miktar;
    return this.kaydet({
      ...mevcut,
      adim: yeniAdim,
      yakilanKalori: mevcut.yakilanKalori + Math.round(miktar * 0.04),
      sonSenkron: new Date().toLocaleTimeString('tr-TR', {
        hour: '2-digit',
        minute: '2-digit',
      }),
    });
  },

  senkronizeEt(mevcut) {
    return this.kaydet({
      ...mevcut,
      sonSenkron: new Date().toLocaleTimeString('tr-TR', {
        hour: '2-digit',
        minute: '2-digit',
      }),
    });
  },
};