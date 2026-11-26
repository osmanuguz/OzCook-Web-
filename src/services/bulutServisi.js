import { signInWithPopup, signOut, onAuthStateChanged } from 'firebase/auth';
import { doc, onSnapshot, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db, googleProvider } from './firebase';

export const bulutServisi = {
  oturumDinle(callback) {
    return onAuthStateChanged(auth, callback);
  },

  async googleIleGiris() {
    const sonuc = await signInWithPopup(auth, googleProvider);
    return sonuc.user;
  },

  async cikisYap() {
    await signOut(auth);
  },

  kullaniciVerisiniDinle(uid, callback) {
    const ref = doc(db, 'users', uid);
    return onSnapshot(ref, (snap) => {
      if (snap.exists()) {
        callback(snap.data());
      } else {
        callback(null);
      }
    });
  },

  async veriyiKaydet(uid, veri) {
    if (!uid) return;
    const ref = doc(db, 'users', uid);
    await setDoc(
      ref,
      {
        ...veri,
        sonGuncelleme: serverTimestamp(),
      },
      { merge: true }
    );
  },
};