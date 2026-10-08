const { Builder, By, until } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');

async function run() {
    let options = new chrome.Options();
    options.addArguments('--headless');
    options.addArguments('--window-size=1920,1080');
    let driver = await new Builder().forBrowser('chrome').setChromeOptions(options).build();

    try {
        console.log('Navigating to login...');
        await driver.get('http://localhost:8000/login.html');
        
        let emailInput = await driver.findElement(By.name('loginEmail'));
        let pwInput = await driver.findElement(By.name('loginPassword'));
        
        // Use angular input
        await driver.executeScript(`
            arguments[0].value = 'admin@tce.edu';
            arguments[0].dispatchEvent(new Event('input', {bubbles: true}));
            arguments[0].dispatchEvent(new Event('change', {bubbles: true}));
            
            arguments[1].value = 'Hod@12345';
            arguments[1].dispatchEvent(new Event('input', {bubbles: true}));
            arguments[1].dispatchEvent(new Event('change', {bubbles: true}));
        `, emailInput, pwInput);
        
        let loginBtn = await driver.findElement(By.css('button[type="submit"]'));
        await loginBtn.click();
        
        console.log('Waiting for modal...');
        let popupBtn = await driver.wait(until.elementLocated(By.xpath("//button[contains(text(), 'Continue to Dashboard')]")), 5000);
        await driver.wait(until.elementIsVisible(popupBtn), 5000);
        await popupBtn.click();
        
        await driver.wait(until.urlContains('hod-dashboard.html'), 5000);
        console.log('Logged into HOD Dashboard.');
        
        // Dump currentUser from scope
        let hodScopeUser = await driver.executeScript('return angular.element(document.body).scope().currentUser;');
        console.log('HOD Dashboard currentUser:', hodScopeUser);
        
        console.log('Navigating to Venue Booking...');
        let venueBtn = await driver.findElement(By.xpath("//li[contains(text(), 'Venue Bookings')]"));
        await venueBtn.click();
        
        await driver.wait(until.urlContains('venue-booking.html'), 5000);
        console.log('Reached Venue Booking.');
        
        let venueScopeUser = await driver.executeScript('return angular.element(document.body).scope().currentUser;');
        console.log('Venue Booking currentUser:', venueScopeUser);
        
        let session = await driver.executeScript('return window.sessionStorage.getItem("authUser")');
        console.log('sessionStorage authUser:', session);
        
    } catch(e) {
        console.error(e);
    } finally {
        await driver.quit();
    }
}
run();
