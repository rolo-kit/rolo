import { WebSocketServer } from 'ws';

export function setupWebsocketConnectionForReload() {
  const PORT_NO = 35729;
  const wss = new WebSocketServer({ port: PORT_NO });
  return wss;
}

export function notifyClients(wss: WebSocketServer) {
  wss.clients.forEach((client) => {
    if (client.readyState === 1) {
      client.send('reload');
    }
  });
}
