export function resize(img, max_height, max_width, type) {
    const canvas = document.createElement('canvas');

    let width = img.width;
    let height = img.height;

    // calculate the width and height, constraining the proportions
    if (width > height) {
        if (width > max_width) {
            height = Math.round(height *= max_width / width);
            width = max_width;
        }
    } else {
        if (height > max_height) {
            width = Math.round(width *= max_height / height);
            height = max_height;
        }
    }

    // resize the canvas and draw the image data into it
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(img, 0, 0, width, height);

    return canvas.toDataURL(type, 0.7); // get the data from canvas as 70% JPG (can be also PNG, etc.)
}

export function processFile(dataURI, max_height, max_width, type = "image/jpeg") {
    console.log('process', dataURI.length);
    return new Promise(res => {
        const bytes = dataURI.split(',')[0].indexOf('base64') >= 0 ?
            atob(dataURI.split(',')[1]) :
            decodeURI(dataURI.split(',')[1]);
        const mime = dataURI.split(',')[0].split(':')[1].split(';')[0];
        const max = bytes.length;
        const ia = new Uint8Array(max);
        for (let i = 0; i < max; i++) {
            ia[i] = bytes.charCodeAt(i);
        }
        const blob = new Blob([ia], {type: mime});

        window.URL = window.URL || window.webkitURL;
        const blobURL = window.URL.createObjectURL(blob); // and get its URL

        const image = new Image(); // helper Image object
        image.src = blobURL;
        image.onload = () => { // have to wait till it's loaded
            const resized = resize(image, max_height, max_width, type);
            console.log('resized ', resized.length);
            res(resized); // send it to canvas
        }
    })
}
