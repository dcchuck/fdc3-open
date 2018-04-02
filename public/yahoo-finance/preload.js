document.addEventListener('DOMContentLoaded', () => {
	fin.desktop.main(() => {
		fin.desktop.InterApplicationBus.subscribe('*', 'ViewQuote', (m,u,n) => { 
			console.log('Message Received')
			const ticker = m.data[0].id.ticker
			window.location.href = `https://finance.yahoo.com/quote/${ticker}`
		}, () => {
			console.log('Successfully Subcribred');
			fin.desktop.InterApplicationBus.publish('subscription-confirmed', fin.desktop.Application.getCurrent().uuid);
		});
	});
	console.log('Preload Loaded');
});
