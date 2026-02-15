GitHub Copilot

Cause
- Your worker never listens for messages from pages, so worker.port.postMessage("online") is ignored.
- The worker currently sends a WS message only inside websocket.onopen. If the worker+WS opened earlier (before you logged in), that open already fired and no further message is sent — so you only see a message after restarting the worker (closing all tabs).

Fix
- Add a port message handler in the worker that sends immediately if WS is open (or queues until open).
- Track that you already sent the single "online" ping (onlineSent) so you only send once per worker lifetime.

Replace socketWorker.js with this minimal, robust version:

````javascript
const clients = [];
let websocket = null;
let onlineSent = false;
const sendQueue = [];

console.log('[SharedWorker] loaded');

function connect() {
  if (websocket) return;
  const protocol = self.location.protocol === 'https:' ? 'wss:' : 'ws:';
  const wsUrl = `${protocol}//${self.location.host}/account/online`;
  console.log('[SharedWorker] connecting to', wsUrl);
  websocket = new WebSocket(wsUrl);

  websocket.addEventListener('open', () => {
    console.log('[SharedWorker] ws open');
    // flush queue
    while (sendQueue.length && websocket.readyState === WebSocket.OPEN) {
      websocket.send(sendQueue.shift());
    }
  });

  websocket.addEventListener('message', (ev) => {
    console.log('[SharedWorker] ws message', ev.data);
    clients.forEach(p => p.postMessage({ type: 'ws-message', data: ev.data }));
  });

  websocket.addEventListener('close', () => {
    console.log('[SharedWorker] ws closed');
    websocket = null;
    // keep onlineSent true so we don't resend on reconnect; change if desired
  });

  websocket.addEventListener('error', (err) => {
    console.error('[SharedWorker] ws error', err);
  });
}

function sendOrQueue(msg) {
  if (websocket && websocket.readyState === WebSocket.OPEN) websocket.send(msg);
  else sendQueue.push(msg);
}

onconnect = (event) => {
  const port = event.ports[0];
  port.start();
  clients.push(port);
  console.log('[SharedWorker] page connected, clients=', clients.length);

  // ensure WS exists
  connect();

  // let page know worker is ready
  port.postMessage({ type: 'worker-ready', wsState: websocket ? websocket.readyState : null });

  port.addEventListener('message', (e) => {
    const msg = e.data;
    console.log('[SharedWorker] message from page:', msg);

    if (msg === 'online' || (msg && msg.type === 'online')) {
      if (!onlineSent) {
        onlineSent = true;
        // change payload to whatever server expects
        sendOrQueue('ClientOnline');
        port.postMessage({ type: 'ack', for: 'online' });
      } else {
        port.postMessage({ type: 'ack', for: 'online', note: 'already-sent' });
      }
      return;
    }

    if (msg && msg.type === 'send') {
      sendOrQueue(msg.payload);
      return;
    }
  });

  port.addEventListener('messageerror', () => {/* ignore */});
  port.addEventListener('close', () => {
    const i = clients.indexOf(port);
    if (i !== -1) clients.splice(i, 1);
    console.log('[SharedWorker] page disconnected, clients=', clients.length);
  });
};
````

Client note (optional)
- Your current client code may remain, but you can wait for a worker ack if you want confirmation:

worker.port.onmessage = (e) => {
  if (e.data?.type === 'ack' && e.data.for === 'online') console.log('online acknowledged');
};

Debug tips
- Open DevTools Console for the page to see the worker console.log messages.
- Check Network → WS to see the /account/online connection.
- Verify GET socketWorker.js happened when the worker was created.
- From Console try: worker = new SharedWorker('/scripts/socketWorker.js'); worker.port.start(); worker.port.postMessage('online') and watch logs.

This will ensure exactly one "online" message per worker lifecycle and that messages sent after login are honored.