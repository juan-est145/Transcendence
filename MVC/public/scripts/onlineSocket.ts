const promise = fetch("/account");

promise.then((value) => {
	if (!value.ok)
		return;
	const worker = new SharedWorker("/scripts/socketWorker.js");
	worker.port.start();

	worker.port.onmessage = (e) => {
		alert(e.data);
	}

	//worker.port.postMessage("online");
});

