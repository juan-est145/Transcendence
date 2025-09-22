const input = document.getElementById("avatar") as HTMLInputElement | null;

input?.addEventListener("change", (e) => {
	input.form?.submit();
});