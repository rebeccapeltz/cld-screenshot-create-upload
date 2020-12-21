//hello.js
exports.handler = function (event, context, handler) {
  // console.log(event)
  // console.log(context)
  handler(null, { 
     statusCode: 200, 
      body: "Hello World" 
  });
}