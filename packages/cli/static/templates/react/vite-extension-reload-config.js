// vite-plugin-rolo-reload.js
export default function roloReloadPlugin() {
  return {
    name: 'rolo-reload-plugin',
    handleHotUpdate() {
      // Notify your WebSocket server on every file change
      try {
        const ws = new WebSocket('ws://localhost:35729');
        ws.onmessage = () => {
          console.log('[rolo] Reloading extension...');
          chrome.runtime.reload();
        };
      } catch (e) {
        console.warn('[rolo] Live reload disabled:', e.message);
      }
    },
  };
}
