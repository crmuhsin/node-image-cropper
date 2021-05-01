// Thresholds
const FULLSCREEN_MARGINS = -10;
const MARGINS = 4;

class Resizer {
    // Minimum resizable area
    minWidth = 60;
    minHeight = 40;

    // End of what's configurable.
    clicked = null;
    onRightEdge;
    onBottomEdge;
    onLeftEdge;
    onTopEdge;

    rightScreenEdge;
    bottomScreenEdge;

    preSnapped;

    b; x; y;

    redraw = false;

    pane = document.getElementById('pane');
    ghostpane = document.getElementById('ghostpane');
    mouseEvent;

    constructor() {
        // Mouse events
        this.pane.addEventListener('mousedown', (e) => this.onMouseDown(e));
        document.addEventListener('mousemove', (e) => this.onMove(e));
        document.addEventListener('mouseup', (e) => this.onUp(e));

        // Touch events	
        this.pane.addEventListener('touchstart', (e) => this.onTouchDown(e));
        document.addEventListener('touchmove', (e) => this.onTouchMove(e));
        document.addEventListener('touchend', (e) => this.onTouchEnd(e));
    }

    setBounds(element, x, y, w, h) {
        element.style.left = x + 'px';
        element.style.top = y + 'px';
        element.style.width = w + 'px';
        element.style.height = h + 'px';
    }

    hintHide() {
        this.setBounds(this.ghostpane, this.b.left, this.b.top, this.b.width, this.b.height);
        this.ghostpane.style.opacity = 0;

        // var b = ghostpane.getBoundingClientRect();
        // ghostpane.style.top = b.top + b.height / 2;
        // ghostpane.style.left = b.left + b.width / 2;
        // ghostpane.style.width = 0;
        // ghostpane.style.height = 0;
    }

    onTouchDown(e) {
        this.onDown(e.touches[0]);
        e.preventDefault();
    }

    onTouchMove(e) {
        this.onMove(e.touches[0]);
    }

    onTouchEnd(e) {
        if (e.touches.length == 0) this.onUp(e.changedTouches[0]);
    }

    onMouseDown(e) {
        this.onDown(e);
        e.preventDefault();
    }

    onDown(evt) {
        this.calc(evt);

        let isResizing = this.onRightEdge || this.onBottomEdge || this.onTopEdge || this.onLeftEdge;

        this.clicked = {
            x: this.x,
            y: this.y,
            cx: evt.clientX,
            cy: evt.clientY,
            w: this.b.width,
            h: this.b.height,
            isResizing: isResizing,
            isMoving: !isResizing && this.canMove(),
            onTopEdge: this.onTopEdge,
            onLeftEdge: this.onLeftEdge,
            onRightEdge: this.onRightEdge,
            onBottomEdge: this.onBottomEdge
        };
    }

    canMove() {
        return this.x > 0 && this.x < this.b.width && this.y > 0 && this.y < this.b.height && this.y < 30;
    }

    calc(evt) {
        this.b = this.pane.getBoundingClientRect();
        this.x = evt.clientX - this.b.left;
        this.y = evt.clientY - this.b.top;

        this.onTopEdge = this.y < MARGINS;
        this.onLeftEdge = this.x < MARGINS;
        this.onRightEdge = this.x >= this.b.width - MARGINS;
        this.onBottomEdge = this.y >= this.b.height - MARGINS;

        this.rightScreenEdge = window.innerWidth - MARGINS;
        this.bottomScreenEdge = window.innerHeight - MARGINS;
    }

    onMove(ee) {
        this.calc(ee);
        this.mouseEvent = ee;
        this.redraw = true;
    }

    animate() {
        requestAnimationFrame(() => this.animate());
        if (!this.redraw) {
            return;
        }

        this.redraw = false;

        if (this.clicked && this.clicked.isResizing) {

            if (this.clicked.onRightEdge) this.pane.style.width = Math.max(this.x, this.minWidth) + 'px';
            if (this.clicked.onBottomEdge) this.pane.style.height = Math.max(this.y, this.minHeight) + 'px';

            if (this.clicked.onLeftEdge) {
                let currentWidth = Math.max(this.clicked.cx - this.mouseEvent.clientX + this.clicked.w, this.minWidth);
                if (currentWidth > this.minWidth) {
                    this.pane.style.width = currentWidth + 'px';
                    this.pane.style.left = this.mouseEvent.clientX + 'px';
                }
            }

            if (this.clicked.onTopEdge) {
                let currentHeight = Math.max(this.clicked.cy - this.mouseEvent.clientY + this.clicked.h, this.minHeight);
                if (currentHeight > this.minHeight) {
                    this.pane.style.height = currentHeight + 'px';
                    this.pane.style.top = this.mouseEvent.clientY + 'px';
                }
            }

            this.hintHide();

            return;
        }

        if (this.clicked && this.clicked.isMoving) {

            if (this.b.top < FULLSCREEN_MARGINS || this.b.left < FULLSCREEN_MARGINS || this.b.right > window.innerWidth - FULLSCREEN_MARGINS || this.b.bottom > window.innerHeight - FULLSCREEN_MARGINS) {
                // hintFull();
                this.setBounds(this.ghostpane, 0, 0, window.innerWidth, window.innerHeight);
                this.ghostpane.style.opacity = 0.2;
            } else if (this.b.top < MARGINS) {
                // hintTop();
                this.setBounds(this.ghostpane, 0, 0, window.innerWidth, window.innerHeight / 2);
                this.ghostpane.style.opacity = 0.2;
            } else if (this.b.left < MARGINS) {
                // hintLeft();
                this.setBounds(this.ghostpane, 0, 0, window.innerWidth / 2, window.innerHeight);
                this.ghostpane.style.opacity = 0.2;
            } else if (this.b.right > this.rightScreenEdge) {
                // hintRight();
                this.setBounds(this.ghostpane, window.innerWidth / 2, 0, window.innerWidth / 2, window.innerHeight);
                this.ghostpane.style.opacity = 0.2;
            } else if (this.b.bottom > this.bottomScreenEdge) {
                // hintBottom();
                this.setBounds(this.ghostpane, 0, window.innerHeight / 2, window.innerWidth, window.innerWidth / 2);
                this.ghostpane.style.opacity = 0.2;
            } else {
                this.hintHide();
            }

            if (this.preSnapped) {
                this.setBounds(this.pane,
                    this.mouseEvent.clientX - this.preSnapped.width / 2,
                    this.mouseEvent.clientY - Math.min(this.clicked.y, this.preSnapped.height),
                    this.preSnapped.width,
                    this.preSnapped.height
                );
                return;
            }

            // moving
            this.pane.style.top = (this.mouseEvent.clientY - this.clicked.y) + 'px';
            this.pane.style.left = (this.mouseEvent.clientX - this.clicked.x) + 'px';

            return;
        }

        // This code executes when mouse moves without clicking

        // style cursor
        if (this.onRightEdge && this.onBottomEdge || this.onLeftEdge && this.onTopEdge) {
            this.pane.style.cursor = 'nwse-resize';
        } else if (this.onRightEdge && this.onTopEdge || this.onBottomEdge && this.onLeftEdge) {
            this.pane.style.cursor = 'nesw-resize';
        } else if (this.onRightEdge || this.onLeftEdge) {
            this.pane.style.cursor = 'ew-resize';
        } else if (this.onBottomEdge || this.onTopEdge) {
            this.pane.style.cursor = 'ns-resize';
        } else if (this.canMove()) {
            this.pane.style.cursor = 'move';
        } else {
            this.pane.style.cursor = 'default';
        }
    }

    onUp(e) {
        this.calc(e);

        if (this.clicked && this.clicked.isMoving) {
            // Snap
            let snapped = {
                width: this.b.width,
                height: this.b.height
            };

            if (this.b.top < FULLSCREEN_MARGINS || this.b.left < FULLSCREEN_MARGINS || this.b.right > window.innerWidth - FULLSCREEN_MARGINS || this.b.bottom > window.innerHeight - FULLSCREEN_MARGINS) {
                // hintFull();
                this.setBounds(this.pane, 0, 0, window.innerWidth, window.innerHeight);
                this.preSnapped = snapped;
            } else if (this.b.top < MARGINS) {
                // hintTop();
                this.setBounds(this.pane, 0, 0, window.innerWidth, window.innerHeight / 2);
                this.preSnapped = snapped;
            } else if (this.b.left < MARGINS) {
                // hintLeft();
                this.setBounds(this.pane, 0, 0, window.innerWidth / 2, window.innerHeight);
                this.preSnapped = snapped;
            } else if (this.b.right > this.rightScreenEdge) {
                // hintRight();
                this.setBounds(this.pane, window.innerWidth / 2, 0, window.innerWidth / 2, window.innerHeight);
                this.preSnapped = snapped;
            } else if (this.b.bottom > this.bottomScreenEdge) {
                // hintBottom();
                this.setBounds(this.pane, 0, window.innerHeight / 2, window.innerWidth, window.innerWidth / 2);
                this.preSnapped = snapped;
            } else {
                this.preSnapped = null;
            }

            this.hintHide();

        }

        this.clicked = null;

    }
}

const resizer = new Resizer();
resizer.animate();