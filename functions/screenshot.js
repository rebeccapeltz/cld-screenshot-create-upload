// require("dotenv").config();
// const cloudinary = require('cloudinary').v2;
// cloudinary.config();
const chromium = require("chrome-aws-lambda");

exports.handler = async (event, context) => {
  const urlSS = JSON.parse(event.body).urlSS;

  const browser = await chromium.puppeteer.launch({
    executablePath: await chromium.executablePath,
    args: chromium.args,
    defaultViewport: chromium.defaultViewport,
    headless: chromium.headless,
  });

  const page = await browser.newPage();

  await page.goto(urlSS);

  // const screenshot = await page.screenshot({ encoding: 'binary' });
  // const screenshot = '';

  const base64 = await page.screenshot({ encoding: "base64" })
  const b64image = "data:image/png;base64," + base64.toString("base64");
  console.log(b64image);

  await browser.close();

  // const cloudinaryImageUrl = await uploadImage(b64image);
  // console.log("cld",cloudinaryImageUrl);

  return {
    statusCode: 200,
    body: JSON.stringify({
      message: `Screenshot of ${urlSS}`,
      b64image: b64image
    }),
  };
  
};
