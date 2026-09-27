import React, { useState } from 'react';
import { Download, Share, PlusSquare, X, Smartphone, CheckCircle2 } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { triggerHaptic } from '../utils/feedback';

export const PWAInstallBanner: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  // If already running in standalone PWA mode or dismissed, don't show
  if (isInstalled || dismissed) {
    return null;
  }

  // If not installable and not iOS, skip
  if (!isInstallable && !isIOS) {
    return null;
  }

  const handleInstallClick = () => {
    triggerHaptic('medium');
    if (isInstallable) {
      install();
    } else if (isIOS) {
      setShowIOSGuide(true);
    }
  };

  return (
    <>
      <div className="mx-4 my-2 p-3 bg-gradient-to-r from-orange-500 via-[#FF5722] to-amber-600 text-white rounded-2xl shadow-sm flex items-center justify-between gap-3 relative overflow-hidden">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
            <Smartphone className="w-5 h-5 text-white" />
          </div>
          <div className="min-w-0">
            <h4 className="text-xs font-black truncate">Install JOBit App</h4>
            <p className="text-[11px] text-orange-100 truncate">
              {isIOS ? 'Add to Home Screen for 1-tap booking' : 'Install native smartphone experience'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={handleInstallClick}
            className="bg-white text-[#FF5722] hover:bg-orange-50 px-3 py-1.5 rounded-xl font-extrabold text-xs shadow-xs active:scale-95 transition flex items-center gap-1"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Install</span>
          </button>
          <button
            onClick={() => setDismissed(true)}
            className="p-1 rounded-lg text-white/70 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* iOS Safari Guided Instructions Modal */}
      {showIOSGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-xs rounded-3xl bg-white p-5 shadow-2xl text-stone-900 animate-in zoom-in-95 duration-200">
            <div className="w-12 h-12 rounded-2xl bg-orange-100 text-[#FF5722] flex items-center justify-center mx-auto mb-3">
              <Smartphone className="w-6 h-6" />
            </div>
            <h3 className="text-base font-extrabold text-center">Install on iPhone / iPad</h3>
            <p className="mt-1 text-xs text-stone-500 text-center">
              Install JOBit as a standalone app in Safari:
            </p>

            <div className="mt-4 space-y-2.5 text-xs text-stone-700 bg-stone-50 p-3 rounded-2xl border border-stone-200">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-orange-100 text-[#FF5722] font-bold text-xs flex items-center justify-center shrink-0">
                  1
                </div>
                <span>
                  Tap the <strong className="inline-flex items-center gap-0.5"><Share className="w-3.5 h-3.5 inline text-sky-600" /> Share</strong> button in Safari toolbar.
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-orange-100 text-[#FF5722] font-bold text-xs flex items-center justify-center shrink-0">
                  2
                </div>
                <span>
                  Scroll down & select <strong className="inline-flex items-center gap-0.5"><PlusSquare className="w-3.5 h-3.5 inline text-stone-700" /> Add to Home Screen</strong>.
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-orange-100 text-[#FF5722] font-bold text-xs flex items-center justify-center shrink-0">
                  3
                </div>
                <span>
                  Tap <strong>Add</strong>. Launch from your home screen anytime!
                </span>
              </div>
            </div>

            <button
              onClick={() => setShowIOSGuide(false)}
              className="mt-4 w-full rounded-xl bg-[#FF5722] py-2.5 text-xs font-bold text-white shadow-sm active:scale-98 transition"
            >
              Got it
            </button>
          </div>
        </div>
      )}
    </>
  );
};
