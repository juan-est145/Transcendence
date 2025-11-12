
const clients = [];
const sendQueue = [];
let onlineSent = false;
let websocket = null;

const protocol = self.location.protocol === 'https:' ? 'wss:' : 'ws:';
const wsUrl = `${protocol}//${self.location.host}/account/online`;

function connect() {
	if (websocket) return;
	websocket = new WebSocket(wsUrl);
	websocket.addEventListener("open", () => {
		if (onlineSent)
			return;
		onlineSent = true;
		websocket.send("Ready for connection");
	});
	websocket.addEventListener("message", (e) => {
		clients.forEach((port) => port.postMessage(e.data));
	});
	websocket.addEventListener('close', () => {
		disconnect();
		// keep onlineSent true so we don't resend on reconnect; change if desired
	});
}

function disconnect() {
	if (websocket)
		websocket.close();
	websocket = null;
	onlineSent = false;
}

onconnect = (event) => {
	const port = event.ports[0];
	port.start();
	clients.push(port);

	port.addEventListener("close", () => {
		const i = clients.indexOf(port);
		if (i !== -1) clients.splice(i, 1);
	});

	port.addEventListener("message", (e) => {
		if (e.data === "online")
			connect();
		else
			disconnect();
	});

	//connect();
}