const FAVORI_ANAHTARI = 'ozcook_kaydedilen_tarifler_v1';

export const favoriServisi = {
  getir() {
    try {
      const ham = localStorage.getItem(FAVORI_ANAHTARI);
      if (!ham) return [];
      const liste = JSON.parse(ham);
      return Array.isArray(liste) ? liste : [];
    } catch {
      return [];
    }
  },

  kaydet(liste) {
    try {
      localStorage.setItem(FAVORI_ANAHTARI, JSON.stringify(liste));
    } catch {
      // Depolama doluysa sessizce geç
    }
  },

  degistir(mevcutListe, tarif) {
    const varMi = mevcutListe.some((t) => t.id === tarif.id);
    const yeniListe = varMi
      ? mevcutListe.filter((t) => t.id !== tarif.id)
      : [tarif, ...mevcutListe];
    this.kaydet(yeniListe);
    return yeniListe;
  },

  kayitliMi(mevcutListe, tarifId) {
    return mevcutListe.some((t) => t.id === tarifId);
  },
};