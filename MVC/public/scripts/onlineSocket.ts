const promise = fetch("/account");

promise.then((value) => {
	const worker = new SharedWorker("/scripts/socketWorker.js");
	if (!value.ok)
		return;
	worker.port.start();

	worker.port.onmessage = (e) => {
		alert(e.data);
	}

	worker.port.postMessage("online");
});

