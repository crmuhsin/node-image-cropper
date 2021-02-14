function createTable(images) {
    let cardHolder = document.getElementById("cropped-list");
    let header = document.createElement('div');
    header.className = 'cropped-header';
    header.innerHTML = `
        <div class="informations">
            <h4>List of cropped Images </h4>
            <span class="file-name">${images[imageId].originalname}</span>
            <span class="file-size">${Math.ceil(images[imageId].size/1024)} KB</span>
            <span class="file-created_date">${moment.unix(images[imageId].created_date/1000).utc().format("DD/MM/YYYY")}</span>
        </div>
    `;
    cardHolder.appendChild(header);

    let body = document.createElement('div');
    body.className = 'cropped-body';
    for (item in images) {
        let image = images[item];
        if ( image.id === imageId && image.cropped.length === 0) {
            let card = document.createElement('div');
            card.className = 'card';
            card.innerText = "No cropped image found!!!"
            cardHolder.appendChild(card);
            return;
        }
        if (image.isCropped && image.croppedOf === imageId) {
            // console.log(image);
            let card = document.createElement('div');
            card.className = 'card';
            card.innerHTML = `
                <img src='${image.filename}' width="200" height="150"/>
                <div class="informations">
                    <span class="file-name">${image.originalname}</span>
                    <span class="file-size">${Math.ceil(image.size/1024)} KB</span>
                    <span class="file-created_date">${moment.unix(image.created_date/1000).utc().format("DD/MM/YYYY")}</span>
                </div>
                <div class="buttons cropper-buttons">
                    <button class="btn deletebtn" title="delete" onclick="deleteBtnMethod(${image.id})">
                        <i class="material-icons">delete</i>
                    </button>
                    <button class="btn viewbtn" title="download" onclick="downloadBtnMethod(${image.id}, '${image.originalname}')">
                        <i class="material-icons">download</i>
                    </button>
                </div>
            `;
            body.appendChild(card);
        }
    }
    cardHolder.appendChild(body);
}

function deleteBtnMethod(id) {
    var r = confirm("Are you sure you want to delete this image?");
    if (r == true) {
        removeImage(id);
    }
}

function downloadBtnMethod(id, image_name) {
    fetch('/download/' + id)
    .then((response) => {
        return response.blob()
    })
    .then((blob) => {
        var a = document.createElement("a");
        a.href = URL.createObjectURL(blob);
        a.setAttribute("download", image_name);
        a.click();
    });
}

function getImages() {
    fetch('/images').then((response) => {
        return response.json();
    }).then((data) => {
        images = data;
        createTable(images)
    })
}

function removeImage(id) {
    fetch('/images/' + id, { method: 'DELETE' })
        .then((response) => {
            return response;
        }).then((data) => {
            getImages();
        })
}


let query = window.location.search.substring(1);
imageId = query.split('=')[1];
getImages();
