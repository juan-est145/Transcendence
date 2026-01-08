document.addEventListener('DOMContentLoaded', function() {
	const generateBtn = document.getElementById('generate-btn');
	if (generateBtn) {
		generateBtn.addEventListener('click', async () => {
			try {
				const response = await fetch('/2FA/generate', {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json'
					},
					body: JSON.stringify({})
				});
				const data = await response.json();
				if (response.ok && data.qrCode) {
					const qrCodeElement = document.getElementById('qr-code');
					const manualSecretElement = document.getElementById('manual-secret');
					const secretInputElement = document.getElementById('secret-input') as HTMLInputElement;
					const qrSectionElement = document.getElementById('qr-section') as HTMLElement;
					if (qrCodeElement && manualSecretElement && secretInputElement && qrSectionElement) {
						if (data.qrCode.startsWith('data:image/')) {
							qrCodeElement.innerHTML = `<img src="${data.qrCode}" alt="QR Code" class="mx-auto border rounded-lg">`;
						} else if (data.qrCode.includes('<svg')) {
							qrCodeElement.innerHTML = data.qrCode;
						} else {
							qrCodeElement.innerHTML = `<img src="data:image/png;base64,${data.qrCode}" alt="QR Code" class="mx-auto border rounded-lg">`;
						}
						manualSecretElement.textContent = data.secret;
						secretInputElement.value = data.secret;
						qrSectionElement.style.display = 'block';
						generateBtn.style.display = 'none';
					}
				} else {
					alert('Error generating QR code: ' + (data.error || 'Unknown error'));
				}
			} catch (error) {
				console.error('Error:', error);
				alert('Connection error: ' + (error as Error).message);
			}
		});
	}
	const verifyForm = document.getElementById('verify-form');
	if (verifyForm) {
		verifyForm.addEventListener('submit', async (e) => {
			e.preventDefault();
			const formData = new FormData(e.target as HTMLFormElement);
			try {
				const response = await fetch('/2FA/verify', {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json'
					},
					body: JSON.stringify({
						token: formData.get('token')
					})
				});
				const data = await response.json();
				if (response.ok && data.success) {
					alert('✅ Token verified successfully');
				} else {
					alert('❌ ' + (data.error || 'Invalid token'));
				}
				(e.target as HTMLFormElement).reset();
			} catch (error) {
				console.error('Error:', error);
				alert('Connection error: ' + (error as Error).message);
			}
		});
	}
});