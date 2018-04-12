/* global fin */
document.addEventListener('DOMContentLoaded', () => {
    const ofVersion = document.getElementById('no-openfin');
    if (typeof fin !== 'undefined') {
        init();
    } else {
        ofVersion.innerText = 'OpenFin is not available - you are probably running in a browser.';
    }
});

let fdc3;

function init () {
    fin.desktop.System.getVersion(version => {
        console.log(version);
    });

    const fdc3ServiceApp = new fin.desktop.Application({
        name: 'fdc3-service',
        url: 'http://localhost:3000/fdc3Service.html',
        uuid: 'fdc3-service',
        mainWindowOptions: {
            autoShow: true
        }
    }, () => {
        fdc3ServiceApp.run();
    }, (e) => {
        console.log(`Error launching app: ${e}`);
    });

    fin.desktop.Service.onServiceConnect({ name: 'fdc3-service', uuid: 'fdc3-service' }, service => {
        const serviceDiv = document.getElementById('service-div');
        serviceDiv.innerText = 'FDC3 Service Registered';
        connectToFDC3Service().then((fdc3ServiceInterface) => fdc3 = fdc3ServiceInterface);
    })

    async function connectToFDC3Service () {
        const serviceClient = await fin.desktop.Service.connect({uuid:'fdc3-service'});
        serviceClient.onServiceDisconnect( service => {
            //handle disconnected service
        });
        return {
            open: (appName, intent, context) => serviceClient.dispatch('open', { appName: appName, intent: intent, context: context }),
            get: (appName, intent) => serviceClient.dispatch('get', { appName: appName, inent: intent })
        }
    }
}

// Button Event Listeners

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

const rsrchxButtons = document.getElementsByClassName('rsrchx');

for (let i = 0; i < yahooFinanceButtons.length; i++) {
	rsrchxButtons[i].onclick = (e) => {
		const context = contexts.filter(el => el.data[0].name === e.target.name);
		console.log(context)
		// RSRCHXchange has implemented a non-FDC3 standard we'll piggy back off of here
		fdc3.open('ResearchExchange', 'rsrchx-search-request', { text: context[0].data[0].id.ticker });
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