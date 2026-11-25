import { Moon, Sun, RefreshCw } from 'lucide-react';

export default function Ayarlar({
  koyuTema,
  onKoyuTemaDegistir,
  saglikVerisi,
  onSenkronize,
}) {
  return (
    <div className="space-y-4">
      <div className="rounded-2xl bg-white/90 dark:bg-zinc-900/90 border border-red-900/10 dark:border-red-500/20 p-5 shadow-sm space-y-4">
        <h2 className="text-lg font-bold">Görünüm & Tema</h2>

        <div className="flex items-center justify-between py-2">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-950/10 dark:bg-red-500/15 text-[#B71C1C] dark:text-red-400 flex items-center justify-center">
              {koyuTema ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
            </div>
            <div>
              <p className="font-medium text-sm">Koyu Tema</p>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Karanlık görünümü anında aç veya kapat
              </p>
            </div>
          </div>

          <button
            type="button"
            role="switch"
            aria-checked={koyuTema}
            onClick={() => onKoyuTemaDegistir(!koyuTema)}
            className={`w-12 h-7 rounded-full transition-colors p-1 cursor-pointer ${
              koyuTema ? 'bg-[#B71C1C]' : 'bg-zinc-300 dark:bg-zinc-700'
            }`}
          >
            <span
              className={`block w-5 h-5 rounded-full bg-white transition-transform ${
                koyuTema ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>
      </div>

      <div className="rounded-2xl bg-white/90 dark:bg-zinc-900/90 border border-red-900/10 dark:border-red-500/20 p-5 shadow-sm flex items-center justify-between gap-4">
        <div>
          <h3 className="font-semibold text-sm">Web Sağlık Senkronizasyonu</h3>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
            {saglikVerisi.sonSenkron
              ? `Son güncelleme: ${saglikVerisi.sonSenkron}`
              : 'Henüz manuel senkronizasyon yapılmadı'}
          </p>
        </div>
        <button
          type="button"
          onClick={onSenkronize}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#B71C1C] hover:bg-[#991616] text-white text-xs font-medium transition-colors cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Senkronize Et</span>
        </button>
      </div>
    </div>
  );
}