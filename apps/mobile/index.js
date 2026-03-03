import { registerRootComponent } from 'expo';

import App from './src/App';

if (typeof globalThis !== 'undefined' && globalThis.window) {
  const webWindow = globalThis.window;
  const webDocument = globalThis.document;

  const renderWebCrash = (title, detail) => {
    try {
      if (!webDocument) return;
      const root = webDocument.createElement('pre');
      root.style.whiteSpace = 'pre-wrap';
      root.style.padding = '16px';
      root.style.margin = '0';
      root.style.fontFamily = 'ui-monospace, SFMono-Regular, Menlo, monospace';
      root.style.fontSize = '13px';
      root.style.lineHeight = '1.4';
      root.style.color = '#7f1d1d';
      root.style.background = '#fef2f2';
      root.textContent = `${title}\n\n${String(detail ?? 'Unknown startup error')}`;
      webDocument.body.innerHTML = '';
      webDocument.body.appendChild(root);
    } catch {
      // noop
    }
  };

  webWindow.addEventListener('error', (event) => {
    renderWebCrash('Web startup error', event?.error?.stack || event?.message);
  });

  webWindow.addEventListener('unhandledrejection', (event) => {
    renderWebCrash('Unhandled promise rejection', event?.reason?.stack || event?.reason);
  });
}

registerRootComponent(App);
