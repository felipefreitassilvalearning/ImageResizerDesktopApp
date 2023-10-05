const form = document.querySelector('#img-form');
const img = document.querySelector('#img');
const outputPath = document.querySelector('#output-path');
const filename = document.querySelector('#filename');
const heightInput = document.querySelector('#height');
const widthInput = document.querySelector('#width');


img.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!isFileImage(file)) {
        alertError('Please select an image file');
        return;
    }

    const image = new Image()
    image.src = URL.createObjectURL(file)
    image.onload = () => {
        heightInput.value = image.height
        widthInput.value = image.width
    }

    form.style.display = 'block';
    filename.innerText = file.name;
    outputPath.innerText = path.join(os.HOME_DIR, 'imageresizer')
})

form.addEventListener('submit', (e) => {
    e.preventDefault();

    const width = widthInput.value;
    const height = heightInput.value;
    const imgPath = img.files[0].path;

    if (!img.files[0]) {
        alertError('Please select an image file');
        return;
    }

    if (!width || !height) {
        alertError('Please enter a width and height');
        return;
    }

    ipcRenderer.send('image:resize', {
        imgPath,
        width,
        height
    })
})

ipcRenderer.on('image:done', (e, { dest, filename }) => {
    alertSuccess(`Image resized to ${dest}/${filename}`)
})

function isFileImage(file) {
    const acceptedImageTypes = ['image/gif', 'image/jpeg', 'image/png'];
    return file && acceptedImageTypes.includes(file['type'])
}

function alertError(message) {
    Toastify.toast({
        text: message,
        duration: 5000,
        style: {
            background: 'red',
            color: 'white',
            textAlign: 'center'
        }
    });
}

function alertSuccess(message) {
    Toastify.toast({
        text: message,
        duration: 5000,
        style: {
            background: 'green',
            color: 'white',
            textAlign: 'center'
        }
    });
}
