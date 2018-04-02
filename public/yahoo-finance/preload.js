document.addEventListener('DOMContentLoaded', () => {
	fin.desktop.main(() => {
		const childWin = new fin.desktop.Window({
			name: 'dummy',
			url: 'https://finance.yahoo.com/quote/appl',
			autoShow: true
		}, () => {
			childWin.addEventListener('close-requested', () => {
				fin.desktop.Application.getCurrent().close();
			});

			fin.desktop.InterApplicationBus.subscribe('*', 'ViewQuote', (m,u,n) => { 
				console.log('Message Received')
				const thisApp = fin.desktop.Application.getCurrent();
				const childWin = fin.desktop.Window.wrap(thisApp.uuid, 'dummy');
				const childWinNativeWindow = childWin.getNativeWindow();
				const ticker = m.data[0].id.ticker
				childWinNativeWindow.location.href = `https://finance.yahoo.com/quote/${ticker}`
			}, () => {
				console.log('Successfully Subcribred');
				fin.desktop.InterApplicationBus.publish('subscription-confirmed', fin.desktop.Application.getCurrent().uuid);
			});
		})
	});
	console.log('Preload Loaded');
});
