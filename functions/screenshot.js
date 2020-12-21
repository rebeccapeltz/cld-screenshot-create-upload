require('dotenv').config()
const cloudinary = require('cloudinary').v2
const chromium = require('chrome-aws-lambda');

exports.handler = async (event, context) => {

    const pageToScreenshot = JSON.parse(event.body).pageToScreenshot;

    const browser = await chromium.puppeteer.launch({
        executablePath: await chromium.executablePath,
        args: chromium.args,
        defaultViewport: chromium.defaultViewport,
        headless: chromium.headless,
    });
    
    const page = await browser.newPage();

    await page.goto(pageToScreenshot);

    const screenshot = await page.screenshot({ encoding: 'binary' });

    await browser.close();

    
    cloudinary.uploader.upload(screenshot, {
      public_id: `screenshots\${Date.now()}`,
      type: 'public'
    })
    .then(uploadResult => {
      console.log(uploadResult)
    })
    .catch(error => console.error(error))

    return {
        statusCode: 200,
        body: JSON.stringify({ 
            message: `Complete screenshot of ${pageToScreenshot}`, 
            buffer: screenshot 
        })
    }

}