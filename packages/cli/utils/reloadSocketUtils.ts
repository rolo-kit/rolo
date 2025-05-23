import WebSocket, { WebSocketServer } from 'ws';

export function setupWebsocketConnectionForReload() {
  const PORT_NO = 35729;
  const wss = new WebSocketServer({ port: PORT_NO });
  return wss;
}

export function closeWebsocketServer(wss: WebSocketServer) {
  return new Promise<void>((resolve, reject) => {
    wss.close((err?: Error) => {
      if (err) reject(err);
      else resolve();
    });
  });
}

export function notifyClients(wss: WebSocketServer) {
  wss.clients.forEach((client: WebSocket) => {
    if (client.readyState === 1) {
      client.send('reload');
    }
  });
}
