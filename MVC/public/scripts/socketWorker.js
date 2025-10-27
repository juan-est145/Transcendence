
const clients = [];

const protocol = self.location.protocol === 'https:' ? 'wss:' : 'ws:';
const wsUrl = `${protocol}//${self.location.host}/account/online`;

const websocket = new WebSocket(wsUrl);

websocket.addEventListener("open", () => {
	websocket.send("Ready for connection");
});

websocket.addEventListener("message", (event) => {
	clients.forEach((port) => port.postMessage(event.data));
});

onconnect = (event) => {
	const port = event.ports[0];
	port.start();
	clients.push(port);
}