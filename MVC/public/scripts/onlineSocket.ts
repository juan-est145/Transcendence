const promise = fetch("/account");

promise.then((value) => {
	const worker = new SharedWorker("/scripts/socketWorker.js");
	worker.port.start();
	if (!value.ok) {
		worker.port.postMessage("offline");
		return;
	}

	worker.port.postMessage("online");
	
});

