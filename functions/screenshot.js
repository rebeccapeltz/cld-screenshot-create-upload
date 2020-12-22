require('dotenv').config()
const cloudinary = require('cloudinary').v2
const chromium = require('chrome-aws-lambda');

const uploadImage = async base64String => {
  const publicId = `screenshots/${Date.now()}`;
  try {
    const response = await cloudinary.uploader.upload(base64String, {
      public_id: publicId
    });
    console.log("cloudinary upload success",response.secure_url);
    return response.secure_url;

  } catch (error) {
    console.log('cloudinary uploadImage error',JSON.stringify(error))
    return "cloudinary error";
  }
};


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

    const screenshot = await page.screenshot({ encoding: 'base64' });

    await browser.close();
    
    const cloudinaryImageUrl = await uploadImage(screenshot);
    console.log("cld",
    cloudinaryImageUrl);

    return {
        statusCode: 200,
        body: JSON.stringify({ 
            message: `Complete screenshot of ${pageToScreenshot}`, 
            buffer: screenshot 
        })
    }

}