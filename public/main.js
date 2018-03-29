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


const buttons = document.getElementsByClassName('fdc3');

for (let i = 0; i < buttons.length; i++) {
	buttons[i].onclick = (e) => {
		const context = contexts.filter(el => el.data[0].name === e.target.name);
		console.log(context)
		fdc3.open('ChartIQ', 'ViewChart', context[0])
	}
}

const fdc3 = {
	open: function(appName, intent, context) {
		function publishContext() {
			console.log(`Sending to ${appName} with intent ${intent}`)
			fin.desktop.InterApplicationBus.send(appMap[appName].uuid, intent, context);
		}

		function waitThenPublishContext(intent, context) {
			fin.desktop.InterApplicationBus.subscribe('*', 'subscription-confirmed', (m) => {
				fin.desktop.InterApplicationBus.send(m, intent, context);
				console.log(`Sent ${m} ${intent}`);
			});
		}

		fin.desktop.System.getAllApplications(apps => {
			apps.forEach(app => {
				if (app.uuid === appMap[appName].uuid) {
					if (!app.isRunning) {
						const wrappedApp = fin.desktop.Application.wrap(app.uuid);
						wrappedApp.run(() => {
							waitThenPublishContext(intent, context);
						})
					} else {
						console.log('App is running - publishing')
						publishContext();
					}
				}
			});

			const launchConfig = {
				name: appMap[appName].name,
				uuid: appMap[appName].uuid,
				url: appMap[appName].url,
				mainWindowOptions: {
					autoShow: true
				}
			}

			const launchedApp = new fin.desktop.Application(launchConfig,
				() => {
					launchedApp.run(() => {
							console.log(`Application ${appName} launched`);
							waitThenPublishContext(intent, context);
						},
						(e) => console.log(`Error launching ${appName}: ${e}`)
					);
				}
			);
		});
	}
}

const appMap = {
	ChartIQ: { 
		uuid: 'ChartIQ-Greenkey-Demo',
		name: 'ChartIQ',
		url: 'http://localhost:3000/chart-iq'
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
