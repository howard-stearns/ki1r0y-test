const puppeteer = require('puppeteer');
const crypto = require('crypto');

(async () => {
    const browser = await puppeteer.launch({headless: true});
    const page = await browser.newPage();
    await page.goto(`file:///${__dirname}/SpecRunner.html`);
    page.on('console', msg => console.log(msg.text()));
    var fail = true;
    async function done() {
        await browser.close();
        process.exit(fail ? 1 : 0);
    }
    await page.exposeFunction('jasmineReporter', status => {
        if (status.overallStatus === 'passed') {
            fail = false;
        } else if (status.failedExpectations.length) {
            console.log(status.failedExpectations);
        }
        console.log(__dirname, status.overallStatus);
        done();
    });
    await page.exposeFunction('specReporter', status => {
        if (status.status === 'failed') {
            console.log(status.fullName, status.failedExpectations.map(x => x.message));
        }
    });
    await page.evaluate(() => {
        jasmine.getEnv().addReporter({
            specDone: window.specReporter,
            suiteDone: window.specReporter,
            jasmineDone: window.jasmineReporter
        });
    });
})();
