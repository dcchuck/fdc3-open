const APP_DIRECTORY_URL = 'http://localhost:3000/appDirectory.json'

/*
id shape:
    {
        "name":"basictemplateEditMe",
        "uuid":"basictemplateEditMe",
        "parentFrame":"basictemplateEditMe",
        "entityType":"window"
    }
*/

const registeredApps = [];

function removeAppFromRegisteredApps(uuid) {
    registeredApps.forEach((el, index) => {
        if (el.uuid === uuid) {
            registeredApps.splice(index, 1);
        }
    })
}

async function main () {
    const fdc3Service = await fin.desktop.Service.register('fdc3');
    fdc3Service.onConnection((id) => {
        registeredApps.push(id);
        const wrappedApp = fin.desktop.Application.wrap(id.uuid);
        wrappedApp.addEventListener('closed', () => removeAppFromRegisteredApps(id.uuid));
        wrappedApp.addEventListener('crashed', () => removeAppFromRegisteredApps(id.uuid));
        console.log(`New connection from ${JSON.stringify(id)}`);
    });

    fdc3Service.register('open', (payload) => {
        console.log(payload);
        fdc3.open(payload.appName, payload.intent, payload.context)
    });
    fdc3Service.register('get', (payload) => fdc3.get(payload.appName, payload.intent));
}

main().then(() => console.log(`Service successfully registered`));

const fdc3 = {
	open: function(appName, intent, context) {
        console.log(arguments);
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
				const configObject = appMap[appName].configObject;
				const app = new fin.desktop.Application(configObject, () => {
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
		manifest: 'http://localhost:3000/chart-iq/app.json',
		configObject: {
			name: 'ChartIQ',
			url: 'http://localhost:3000/chart-iq',
			uuid: 'ChartIQ-GreenKey-Demo',
			mainWindowOptions: {
				autoShow: true
			}
		}
	},
	YahooFinance: {
		manifest: 'http://localhost:3000/yahoo-finance/app.json',
		uuid: 'yahoo-finance-demo',
		name: 'YahooFinance',
		configObject: {
			name: 'YahooFinance',
			url: 'https://finance.yahoo.com',
			uuid: 'yahoo-finance-demo',
			mainWindowOptions: {
				autoShow: true,
				preload: 'http://localhost:3000/yahoo-finance/preload.js'
			}
		}
	},
	ResearchExchange: {
		uuid: 'ResearchExchange-0n4u9uobd519oj4nkz5ru7syvi',
		name: 'ResearchExchange',
		configObject: {
			name: 'ResearchExchange',
			url: 'https://www.rsrchx.com/login',
			uuid: 'ResearchExchange-0n4u9uobd519oj4nkz5ru7syvi',
			mainWindowOptions: {
				autoShow: true
			}
		}
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