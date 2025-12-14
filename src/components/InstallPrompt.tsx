'use client';

import { useState, useEffect } from 'react';
import { Download, X, Share } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // Verifica se já foi instalado ou se o usuário já recusou recentemente
    const dismissed = localStorage.getItem('pwa-install-dismissed');
    if (dismissed) {
      const dismissedTime = parseInt(dismissed);
      // Não mostra novamente por 7 dias após recusar
      if (Date.now() - dismissedTime < 7 * 24 * 60 * 60 * 1000) {
        return;
      }
    }

    // Verifica se já está instalado como PWA
    if (window.matchMedia('(display-mode: standalone)').matches) {
      return;
    }

    // Detecta iOS
    const isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as unknown as { MSStream?: unknown }).MSStream;

    // Verifica se está no Safari (não em outros browsers do iOS)
    const isSafari = /^((?!chrome|android|crios|fxios).)*safari/i.test(navigator.userAgent);

    if (isIOSDevice && isSafari) {
      setIsIOS(true);
      // Pequeno delay para não aparecer junto com a splash screen
      setTimeout(() => setShowPrompt(true), 2000);
      return;
    }

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      // Pequeno delay para não aparecer junto com a splash screen
      setTimeout(() => setShowPrompt(true), 2000);
    };

    window.addEventListener('beforeinstallprompt', handler);

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === 'accepted') {
      setShowPrompt(false);
    }
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem('pwa-install-dismissed', Date.now().toString());
  };

  if (!showPrompt || (!deferredPrompt && !isIOS)) return null;

  // UI específica para iOS
  if (isIOS) {
    return (
      <div className="fixed bottom-0 left-0 right-0 z-50 p-4 animate-slide-up">
        <div className="max-w-lg mx-auto bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden">
          <div className="bg-gradient-to-r from-orange-500 to-orange-600 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center">
                  <Download className="w-6 h-6 text-orange-500" />
                </div>
                <div>
                  <h3 className="text-white font-bold text-lg">Instalar MD-Look</h3>
                  <p className="text-orange-100 text-sm">Acesso rápido na sua tela inicial</p>
                </div>
              </div>
              <button
                onClick={handleDismiss}
                className="text-white/80 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="p-4">
            <p className="text-gray-600 text-sm mb-3">
              Para instalar, toque no botão de compartilhar
              <Share className="w-4 h-4 inline mx-1 text-blue-500" />
              e depois em <strong>&quot;Adicionar à Tela de Início&quot;</strong>
            </p>
            <button
              onClick={handleDismiss}
              className="w-full py-3 px-4 bg-orange-500 rounded-xl text-white font-medium hover:bg-orange-600 transition-colors"
            >
              Entendi
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 animate-slide-up">
      <div className="max-w-lg mx-auto bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden">
        <div className="bg-gradient-to-r from-orange-500 to-orange-600 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center">
                <Download className="w-6 h-6 text-orange-500" />
              </div>
              <div>
                <h3 className="text-white font-bold text-lg">Instalar MD-Look</h3>
                <p className="text-orange-100 text-sm">Acesso rápido na sua tela inicial</p>
              </div>
            </div>
            <button
              onClick={handleDismiss}
              className="text-white/80 hover:text-white p-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-4 flex gap-3">
          <button
            onClick={handleDismiss}
            className="flex-1 py-3 px-4 border border-gray-300 rounded-xl text-gray-700 font-medium hover:bg-gray-50 transition-colors"
          >
            Agora não
          </button>
          <button
            onClick={handleInstall}
            className="flex-1 py-3 px-4 bg-orange-500 rounded-xl text-white font-medium hover:bg-orange-600 transition-colors"
          >
            Instalar
          </button>
        </div>
      </div>
    </div>
  );
}
