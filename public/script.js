// function bufferToImageUrl(buffer) {
//   // See https://gist.github.com/candycode/f18ae1767b2b0aba568e

//   var arrayBufferView = new Uint8Array(buffer);
//   var blob = new Blob([arrayBufferView], { type: "image/jpeg" });
//   var urlCreator = window.URL || window.webkitURL;
//   var imageUrl = urlCreator.createObjectURL(blob);

//   return imageUrl;
// }

async function uploadToCloudinary(b64image, cloudname, preset) {
  let url = `https://api.cloudinary.com/v1_1/${cloudname}/upload`;
  // use current epic time for public id
  let id = `${Date.now()}`;
  var fd = new FormData();
  fd.append("upload_preset", preset);
  fd.append("file", b64image);
  fd.append("public_id",id);

  // prepare to post data as JSON
  const plainFormData = Object.fromEntries(fd.entries());
  const formDataJsonString = JSON.stringify(plainFormData);
  const fetchOptions = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: formDataJsonString,
  };
  const response = await fetch(url, fetchOptions);
  if (!response.ok) {
    const errorMessage = await response.text();
    throw new Error(errorMessage);
  }
  return response.json();
}

document
  .querySelector('button[type="submit"]')
  .addEventListener("click", (e) => {
    e.preventDefault();

    const urlSS = document.getElementById("url").value;
    const cloudname = document.getElementById("cloudname").value;
    const preset = document.getElementById("preset").value;

    /* validate input */
    let warning = "";
    warning += !urlSS ? "<li>Please enter a screenshot URL</li>" : "";
    warning += !cloudname ? "<li>Please enter Cloudinary CLOUD_NAME</li>" : "";
    warning += !preset
      ? "<li>Please enter a Cloudinary unsigned preset</li>"
      : "";
    if (warning)
      return (document.getElementById("warning").innerHTML = warning);

    /* get screenshot */
    let result = `<p>${urlSS}, ${cloudname}, ${preset}</p>`;

    document.getElementById("result").innerHTML = result + "Please wait...";

    const options = {
      method: "POST",
      headers: { "Content-Type": "application/json; charset=utf-8" },
      body: JSON.stringify({ urlSS: urlSS }),
    };

    fetch("/.netlify/functions/screenshot", options)
      .then((res) => res.json())
      .then(async (res) => {
        if (!res.b64image)
          return (document.getElementById("warning").innerHTML =
            "Error capturing screenshot");
        //upload screenshot to Cloudinary
        const response = await uploadToCloudinary(
          res.b64image,
          cloudname,
          preset
        );
        const img = document.createElement("img");
        // img.src = res.b64image;
        img.src = response.secureURL;
        document.getElementById("result").innerHTML = img.outerHTML;
      })
      .catch((err) => {
        console.log(err);
        document.getElementById(
          "result"
        ).textContent = `${err.toString()}`;
      });
  });
