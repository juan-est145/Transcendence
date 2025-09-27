const form: HTMLFormElement | null = document.getElementById('friendRequestForm') as HTMLFormElement;
if (!form) {
	throw new Error("A form with an action of '/friends/friendRequest/:username' is required");
}

form.addEventListener("submit", addInputAndSubmit);




function addInputAndSubmit(e: SubmitEvent) {
	e.preventDefault();
	const input = document.createElement('input');
	input.type = 'hidden';
	input.name = 'action';
	const submitter = e.submitter as HTMLButtonElement | null;
	if (submitter) {
		if (submitter.id === 'acceptBtn') {
			input.value = "ACCEPT";

		} else if (submitter.id === 'rejectBtn') {
			input.value = "DELETE";
		} else {
			throw new Error("There can only be two buttons with id's of acceptBtn and rejectBtn");
		}
	}
	if (!form) {
		throw new Error("A form with an action of '/friends/friendRequest/:username' is required");
	}
	form.appendChild(input);
	form.submit();
}