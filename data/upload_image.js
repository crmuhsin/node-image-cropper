const multer = require("multer");
const helpers = require('../helpers');
const path = require('path');
const fs = require('fs');

const now = Date.now();

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploaded_files/');
    },

    // By default, multer removes file extensions so let's add them back
    filename: function (req, file, cb) {
        cb(null, file.originalname + '-' + now + path.extname(file.originalname));
    }
});

const dataPath = './data/image_data.json';

const readFile = (
    callback,
    returnJson = false,
    filePath = dataPath,
    encoding = 'utf8'
) => {
    fs.readFile(filePath, encoding, (err, data) => {
        if (err) {
            throw err;
        }
        callback(returnJson ? JSON.parse(data) : data);
    });
};

const writeFile = (
    fileData,
    callback,
    filePath = dataPath,
    encoding = 'utf8'
) => {
    fs.writeFile(filePath, fileData, encoding, err => {
        if (err) {
            throw err;
        }
        callback();
    });
};

const uploadRoutes = (app) => {

    app.post('/upload-image', (req, res) => {
        let upload = multer({ storage: storage, fileFilter: helpers.imageFilter }).any();

        upload(req, res, function (err) {
            // console.log(req.files);
            if (req.fileValidationError) {
                return res.send(req.fileValidationError);
            }
            else if (!req.files) {
                return res.send('Please select an image to upload');
            }
            else if (err instanceof multer.MulterError) {
                return res.send(err);
            }
            else if (err) {
                return res.send(err);
            }

            readFile(data => {
                const newUserId = now.toString();
                let bodyInfo = req.body;
                const imageId = bodyInfo.croppedOf;
                bodyInfo.id = newUserId;
                delete bodyInfo.upload_image;
                // add the new user
                let fileInfo = req.files[0];
                if (bodyInfo.isCropped) {
                    bodyInfo.originalname = bodyInfo.croppedOfName + fileInfo.originalname;

                    // update file info
                    data[imageId].cropped.push(bodyInfo.id);
                } else {
                    bodyInfo.originalname = fileInfo.originalname;
                }
                bodyInfo.filename = fileInfo.originalname + '-' + now + path.extname(fileInfo.originalname)
                bodyInfo.source_url = fileInfo.destination + fileInfo.filename;
                bodyInfo.size = fileInfo.size;
                bodyInfo.created_date = JSON.stringify(now);
                bodyInfo.cropped = [];

                data[newUserId] = bodyInfo;
                writeFile(JSON.stringify(data, null, 2), () => {
                    res.status(200);
                });
                
                if (bodyInfo.isCropped) {
                    res.redirect('back');
                } else {
                    res.redirect(`./cropper.html?image=${newUserId}`);
                }
            }, true);

        });
    });

    app.get('/images', (req, res) => {
        readFile(data => {
            res.send(data);
        }, true);
    });

    app.get('/images/:id', (req, res) => {
        readFile(data => {
            res.send(data[req.params.id]);
        }, true);
    });

    app.get('/download/:id', function (req, res) {
        readFile(data => {
            const imageId = req.params['id'];
            const file = `${__dirname}/${data[imageId].source_url}`;
            res.download(file, data[imageId].originalname); // Set disposition and send it.
            // console.log(data[imageId].originalname);
        }, true);
    });

    app.delete('/images/:id', (req, res) => {
        readFile(data => {
            // add the new user
            const imageId = req.params['id'];
            fs.unlink(data[imageId].source_url, (err) => {
                if (err) {
                    console.error(err)
                    return
                }
            })
            delete data[imageId];

            writeFile(JSON.stringify(data, null, 2), () => {
                res.status(200).send(`images id:${imageId} removed`);
            });
        }, true);
    });

}

module.exports = uploadRoutes;