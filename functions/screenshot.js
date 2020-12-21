require('dotenv').config()
const cloudinary = require('cloudinary').v2
const chromium = require('chrome-aws-lambda');

// const bufferToString=>(){
//     // See https://gist.github.com/candycode/f18ae1767b2b0aba568e

//     var arrayBufferView = new Uint8Array( buffer );
//     var blob = new Blob( [ arrayBufferView ], { type: "image/jpeg" } );
//     var urlCreator = window.URL || window.webkitURL;
//     var imageUrl = urlCreator.createObjectURL( blob );

//     return imageUrl;
// }


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

    
    cloudinary.uploader.upload(screenshot.toString('base64'), {
      public_id: `screenshots/${Date.now()}`,
      type: 'auto'
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