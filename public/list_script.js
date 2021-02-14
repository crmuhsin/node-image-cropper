function createTable(images) {
    let cardHolder = document.getElementById("card-holder");
    cardHolder.innerText = "";
    for (item in images) {
        let image = images[item];
        if (!image.isCropped) {
            let card = document.createElement('div');
            card.className = 'card';
            card.innerHTML = `
                <img src='${image.filename}' width="200" height="150"/>
                <span class="file-name">${image.originalname}</span>
                <div class="buttons">
                    <button class="btn deletebtn" title="delete" onclick="deleteBtnMethod(${image.id})">
                        <i class="material-icons">delete</i>
                    </button>
                    <button class="btn viewbtn" title="view" onclick="viewBtnMethod(${image.id})">
                        <i class="material-icons">visibility</i>
                    </button>
                    <button class="btn downloadbtn" title="download" onclick="downloadBtnMethod(${image.id}, '${image.originalname}')">
                        <i class="material-icons">download</i>
                    </button>
                </div>
            `;
            cardHolder.appendChild(card);
        }
    }
}

function deleteBtnMethod(id) {
    var r = confirm("Are you sure you want to delete this image?");
    if (r == true) {
        removeImage(id);
    }
}

function viewBtnMethod(id) {
    var a = document.createElement("a");
        a.href = `cropper.html?image=${id}`;
        a.click();
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

// async function updateUser(id) {
//     if (username.value && password.value && proffession.value) {
//         let user = {
//             name: username.value,
//             password: password.value,
//             proffession: proffession.value,
//             id: id
//         };
//         const response = await fetch('/users/' + id, {
//             method: 'PUT',
//             headers: { 'Content-Type': 'application/json' },
//             body: JSON.stringify(user)
//         });
//         username.value = '';
//         password.value = '';
//         proffession.value = '';
//         getImages();
//         var submitBtn = document.getElementById('submit');
//         submitBtn.innerText = 'Submit'
//         submitBtn.removeEventListener('click', updateUser);
//         submitBtn.addEventListener('click', createUser);
//         return response;
//     }
// }

// async function createUser() {
//     if (username.value && password.value && proffession.value) {
//         let user = {
//             name: username.value,
//             password: password.value,
//             proffession: proffession.value
//         };
//         const response = await fetch('/users', {
//             method: 'POST',
//             headers: { 'Content-Type': 'application/json' },
//             body: JSON.stringify(user)
//         });
//         username.value = '';
//         password.value = '';
//         proffession.value = '';
//         getUsers();
//         return response;
//     }
// }
getImages();
