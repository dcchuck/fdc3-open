/* global fin */
document.addEventListener('DOMContentLoaded', () => {
    const ofVersion = document.getElementById('no-openfin');
    if (typeof fin !== 'undefined') {
        init();
    } else {
        ofVersion.innerText = 'OpenFin is not available - you are probably running in a browser.';
    }
});

function init () {
    fin.desktop.System.getVersion(version => {
        console.log(version);
    });
}


const chartIQButtons = document.getElementsByClassName('chart-iq');

for (let i = 0; i < chartIQButtons.length; i++) {
	chartIQButtons[i].onclick = (e) => {
		const context = contexts.filter(el => el.data[0].name === e.target.name);
		console.log(context)
		fdc3.open('ChartIQ', 'ViewChart', context[0])
	}
}

const yahooFinanceButtons = document.getElementsByClassName('yahoo-finance');

for (let i = 0; i < yahooFinanceButtons.length; i++) {
	yahooFinanceButtons[i].onclick = (e) => {
		const context = contexts.filter(el => el.data[0].name === e.target.name);
		console.log(context)
		fdc3.open('YahooFinance', 'ViewQuote', context[0])
	}
}

const fdc3 = {
	open: function(appName, intent, context) {
		function publishContext() {
			console.log(`Sending to ${appName} with intent ${intent}`)
			fin.desktop.InterApplicationBus.send(appMap[appName].uuid, intent, context);
		}

		function waitThenPublishContext(intent, context) {
			function listener (m) {
				fin.desktop.InterApplicationBus.send(m, intent, context);
				console.log(`Sent ${m} ${intent}`);
				fin.desktop.InterApplicationBus.unsubscribe('*', 'subscription-confirmed', listener);
			}
			fin.desktop.InterApplicationBus.subscribe('*', 'subscription-confirmed', listener);
		}

		let appWasLaunched = false;
		fin.desktop.System.getAllApplications(apps => {
			apps.forEach(app => {
				if (app.uuid === appMap[appName].uuid) {
					appWasLaunched = true;
					if (!app.isRunning) {
						const wrappedApp = fin.desktop.Application.wrap(app.uuid);
						wrappedApp.run(() => {
							console.log('App was launched but not running; Running and then publishing');
							waitThenPublishContext(intent, context);
						})
					} else {
						console.log('App is running - publishing');
						publishContext();
					}
				}
			});

			if (!appWasLaunched) {
				fin.desktop.Application.createFromManifest(appMap[appName].manifest, app => {
					app.run(() => {
						waitThenPublishContext(intent, context);
					});
				});
			}
		});
	}
}

const appMap = {
	ChartIQ: { 
		uuid: 'ChartIQ-GreenKey-Demo',
		name: 'ChartIQ',
		url: 'http://localhost:3000/chart-iq',
		manifest: 'http://localhost:3000/chart-iq/app.json'
	},
	YahooFinance: {
		manifest: 'http://localhost:3000/yahoo-finance/app.json',
		uuid: 'yahoo-finance-demo',
		name: 'YahooFinance'
	}
}

const contexts = [
	{
		object: 'fdc3-context',
		definition: 'https://github.com/FDC3/ContextData/blob/master/Specification-Draft.MD',
		version: '0.0.1',
		data: [
			{
				type: 'security',
				name: 'Apple',
				id: {
					ticker: 'aapl',
					ISIN: 'US0378331005',
					CUSIP: '037833100',
					FIGI: 'BBG000B9XRY4',
					default: 'aapl'
				}
			}
		]
	},
	{
		object: 'fdc3-context',
		definition: 'https://github.com/FDC3/ContextData/blob/master/Specification-Draft.MD',
		version: '0.0.1',
		data: [
			{
				type: 'security',
				name: 'IBM',
				id: {
					ticker: 'ibm',
					ISIN: 'US4592001014',
					default: 'ibm'
				}
			}
		]
	}
]
