class Cropper {

    proportion = .8;
    theImage = "https://s3-us-west-2.amazonaws.com/s.cdpn.io/222579/beagle400.jpg";

    canvas1 = document.getElementById("canvas1");
    canvas2 = document.getElementById("canvas2");
    context1;
    context2;

    canvasWidth = 400;
    canvasHeight = 400;
    canvasX;
    canvasY;

    isDragging1 = false;
    isDragging2 = false;

    selectionY = 20;
    selectionX = 130;
    selectionWidth = 200;
    selectionHeight = 200;

    ratio = 4;

    mousePos1 = {
        x: 0,
        y: 0
    };
    mousePos2 = {
        x: 0,
        y: 0
    };

    resultFile;
    imageId;
    draw = {}

    constructor() {
        this.context1 = this.canvas1.getContext("2d");
        this.context2 = this.canvas2.getContext("2d");
        this.canvas1.width = this.canvasWidth;
        this.canvas2.width = this.canvasWidth;
        this.canvasX = this.canvasWidth / 2;
        this.canvas1.height = this.canvasHeight;
        this.canvas2.height = this.canvasHeight
        this.canvasY = this.canvasHeight / 2;
        this.draw = {
            x: ~~(this.canvasX - this.selectionWidth * this.proportion / 2),
            y: ~~(this.canvasY - this.selectionHeight * this.proportion / 2)
        }

        this.croppingBars = this.getCroppingBars();
        this.croppedObject = this.getImgObject();
        this.img = new Image();
        this.getImage();
    }

    getCroppingBars() { // cropping bars
        return {
            "whiteBar": {
                color: "white",
                x: 0,
                y: this.selectionY,
                w: this.canvasWidth,
                h: this.ratio,
                bool: false,
            },
            "yellowBar": {
                color: "yellow",
                x: this.selectionX,
                y: 0,
                w: this.ratio,
                h: this.canvasHeight,
                bool: false,
            },
            "orangeBar": {
                color: "orange",
                x: 0,
                y: this.selectionY + this.selectionHeight,
                w: this.canvasWidth,
                h: this.ratio,
                bool: false,
            },
            "redBar": {
                color: "red",
                x: this.selectionX + this.selectionWidth,
                y: 0,
                w: this.ratio,
                h: this.canvasHeight,
                bool: false,
            }
        }
    }

    drawGuides() {
        for (let k in this.croppingBars) {
            this.context1.fillStyle = this.croppingBars[k].color;
            this.context1.beginPath();
            this.context1.fillRect(this.croppingBars[k].x, this.croppingBars[k].y, this.croppingBars[k].w, this.croppingBars[k].h);
        }
    }

    getImgObject() {
        return {
            selectionX: this.croppingBars.yellowBar.x,
            selectionY: this.croppingBars.whiteBar.y,
            selectionWidth: this.croppingBars.redBar.x - this.croppingBars.yellowBar.x,
            selectionHeight: this.croppingBars.orangeBar.y - this.croppingBars.whiteBar.y,
            width: ~~((this.croppingBars.redBar.x - this.croppingBars.yellowBar.x) * this.proportion),
            height: ~~((this.croppingBars.orangeBar.y - this.croppingBars.whiteBar.y) * this.proportion),
            x: this.draw.x,
            y: this.draw.y
        }
    }

    drawCroppedImage() {
        this.context2.drawImage(this.img, this.croppedObject.selectionX, this.croppedObject.selectionY, this.croppedObject.selectionWidth, this.croppedObject.selectionHeight, this.croppedObject.x, this.croppedObject.y, this.croppedObject.width, this.croppedObject.height);

        const blob = this.dataURItoBlob(this.canvas2.toDataURL());
        this.resultFile = new File([blob], "cropped.jpg");

        this.drawImageinCanvas();
    }

    dataURItoBlob(dataURI) {
        var byteString = atob(dataURI.split(',')[1]);
        var mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];
        var ab = new ArrayBuffer(byteString.length);
        var ia = new Uint8Array(ab);
        for (var i = 0; i < byteString.length; i++) {
            ia[i] = byteString.charCodeAt(i);
        }
        return new Blob([ab], { type: 'image/jpeg' });
    }

    outlineImage() {
        this.context2.beginPath();
        this.context2.rect(this.croppedObject.x, this.croppedObject.y, this.croppedObject.width, this.croppedObject.height);
    }

    cursorStyleC1() {
        this.canvas1.style.cursor = "default";
        //croppingBars[k].bool = false;
        for (let k in this.croppingBars) {
            this.context1.beginPath();
            this.context1.rect(this.croppingBars[k].x - 10, this.croppingBars[k].y - 10, this.croppingBars[k].w + 20, this.croppingBars[k].h + 20);
            if (this.context1.isPointInPath(this.mousePos1.x, this.mousePos1.y)) {
                if (k == "whiteBar" || k == "orangeBar") {
                    this.canvas1.style.cursor = "row-resize";
                } else {
                    this.canvas1.style.cursor = "col-resize";
                }
                break;
            } else {
                this.canvas1.style.cursor = "default";
            }
        }
    }

    cursorStyleC2() {
        this.canvas2.style.cursor = "default";
        this.outlineImage();
        if (this.context2.isPointInPath(this.mousePos2.x, this.mousePos2.y)) {
            this.canvas2.style.cursor = "move";
        } else {
            this.canvas2.style.cursor = "default";
        }
    }

    getImage() {
        let query = window.location.search.substring(1);
        this.imageId = query.split('=')[1];
        fetch('/images/' + this.imageId).then((response) => {
            return response.json();
        }).then((data) => {
            this.theImage = data.filename;
            this.loadFile();
        })
    }

    loadFile() {
        this.img.src = this.theImage;
        this.img.onload = () => {
            this.resizeCanvas();

            this.croppingBars = this.getCroppingBars();
            this.drawCroppedImage();
        }
    };

    drawImageinCanvas() {
        this.context1.clearRect(0, 0, this.canvasWidth, this.canvasHeight);

        this.context1.save();
        this.context1.translate(0, 0);
        this.context1.scale(1, 1);
        this.context1.drawImage(this.img, 0, 0);

        this.context1.restore();

        this.drawGuides();
    }

    resizeCanvas() {
        var width = this.img.width;
        var height = this.img.height;

        this.canvasWidth = width;
        this.canvasHeight = height;

        this.canvas1.width = this.canvasWidth
        this.canvas2.width = this.canvasWidth;
        this.canvas1.height = this.canvasHeight;
        this.canvas2.height = this.canvasHeight
    }

    oMousePos(canvas, evt) {
        var rect = canvas.getBoundingClientRect();
        return {
            x: Math.round(evt.clientX - rect.left),
            y: Math.round(evt.clientY - rect.top)
        }
    }
}

const cropper = new Cropper();

let deltaX, deltaY;

function uploadCroppedImage() {
    if (cropper.resultFile) {
        const formData = new FormData();
        formData.append('file', cropper.resultFile);
        formData.append('isCropped', true);
        formData.append('croppedOf', cropper.imageId);
        formData.append('croppedOfName', cropper.theImage);

        fetch('/upload-image', {
            method: 'POST',
            body: formData
        }).then(() => {
            location.reload();
            return false;
        })

    }
}
let uploadBtn = document.getElementById('upload-btn');
uploadBtn.addEventListener('click', uploadCroppedImage)

cropper.canvas1.addEventListener('mousedown', function (evt) {
    cropper.isDragging1 = true;
  
    cropper.mousePos1 = cropper.oMousePos(cropper.canvas1, evt);
    for (let k in cropper.croppingBars) {
      cropper.context1.beginPath();
      cropper.context1.rect(cropper.croppingBars[k].x - 10, cropper.croppingBars[k].y - 10, cropper.croppingBars[k].w + 20, cropper.croppingBars[k].h + 20);
      if (cropper.context1.isPointInPath(cropper.mousePos1.x, cropper.mousePos1.y)) {
        cropper.croppingBars[k].bool = true;
        if (k == "whiteBar" || k == "orangeBar") {
          cropper.croppingBars[k].y = cropper.mousePos1.y;
        } else {
          cropper.croppingBars[k].x = cropper.mousePos1.x;
        }
        break;
      } else {
        cropper.croppingBars[k].bool = false;
      }
    }
  }, false);
  
  cropper.canvas2.addEventListener('mousedown', function (evt) {
    cropper.mousePos2 = cropper.oMousePos(cropper.canvas2, evt);
    cropper.outlineImage()
    if (cropper.context2.isPointInPath(cropper.mousePos2.x, cropper.mousePos2.y)) {
      cropper.isDragging2 = true;
  
      deltaX = cropper.mousePos2.x - cropper.croppedObject.x;
      deltaY = cropper.mousePos2.y - cropper.croppedObject.y;
    }
  }, false);
  
  // mousemove ***************************
  cropper.canvas1.addEventListener('mousemove', function (evt) {
    cropper.mousePos1 = cropper.oMousePos(cropper.canvas1, evt); //console.log(mousePos)	
    cropper.cursorStyleC1();
  
    if (cropper.isDragging1 == true) {
      cropper.context1.clearRect(0, 0, cropper.canvasWidth, cropper.canvasHeight);
  
      for (let k in cropper.croppingBars) {
        if (cropper.croppingBars[k].bool) {
          if (k == "whiteBar" || k == "orangeBar") {
            cropper.croppingBars[k].y = cropper.mousePos1.y;
          } else {
            cropper.croppingBars[k].x = cropper.mousePos1.x;
          }
          break;
        }
      }
  
      cropper.drawGuides();
      cropper.context2.clearRect(0, 0, cropper.canvasWidth, cropper.canvasHeight);
      cropper.croppedObject = cropper.getImgObject();
      cropper.drawCroppedImage();
    }
  }, false);
  
  cropper.canvas2.addEventListener('mousemove', function (evt) {
    cropper.mousePos2 = cropper.oMousePos(cropper.canvas2, evt);
  
    if (cropper.isDragging2 == true) {
      cropper.context2.clearRect(0, 0, cropper.canvasWidth, cropper.canvasHeight);
      cropper.draw.x = cropper.mousePos2.x - deltaX;
      cropper.draw.y = cropper.mousePos2.y - deltaY;
      cropper.croppedObject = cropper.getImgObject(cropper.croppingBars, cropper.draw);
      cropper.drawCroppedImage();
    }
    cropper.cursorStyleC2();
  }, false);
  
  // mouseup ***************************
  cropper.canvas1.addEventListener('mouseup', function (evt) {
    cropper.isDragging1 = false;
    for (let k in cropper.croppingBars) {
      cropper.croppingBars[k].bool = false;
    }
  }, false);
  
  cropper.canvas2.addEventListener('mouseup', function (evt) {
    cropper.isDragging2 = false;
  
  }, false);
  
  // mouseout ***************************
  cropper.canvas1.addEventListener('mouseout', function (evt) {
    cropper.isDragging1 = false;
    for (let k in cropper.croppingBars) {
      cropper.croppingBars[k].bool = false;
    }
  }, false);
  
  cropper.canvas2.addEventListener('mouseout', function (evt) {
    cropper.isDragging2 = false;
  
  }, false);
  