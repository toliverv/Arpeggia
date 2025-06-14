// interpret number x within two bounds as normalized value (from 0 to 1)
export function normalize(x, min, max) {
    return (x - min) / (max - min);
}

// round normalized floating point to nearest fraction with denominator d
function roundFract(x, d) {
    return Math.round(x * d) / d;
}

export class BoundingBox {
    /**
     * Construct bounding box
     * @param {number} x
     * @param {number} y
     * @param {number} w
     * @param {number} h
     */
    constructor(x, y, w, h) {
        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;
    }

    /**
     * Return true if point (x, y) is in box
     * @param {number} x
     * @param {number} y
     * @returns {Boolean}
     */
    collidesWith(x, y) {
        return this.x <= x <= this.x + this.w && this.y <= y <= this.y + this.h;
    }

    /**
     * @overload
     * @param {Object{x:number,y:number}} obj
     * @overload
     * @returns {Boolean}
     */
    collidesWith(obj) {
        return (
            this.x <= obj.x &&
            obj.x < this.x + this.w &&
            this.y <= obj.y &&
            obj.y < this.y + this.h
        );
    }

    /**
     * Transform box with normalizied coordinates to pixel coordinates
     * @param {number} width
     * @param {number} height
     * @returns {BoundingBox} Copy of box with transformed dimensions
     */
    toPixels(width, height) {
        return new BoundingBox(
            this.x * width,
            this.y * height,
            this.w * width,
            this.h * height
        );
    }
}

class Step {
    constructor(value = 0, active = false) {
        this.value = value;
        this.active = active;
    }
}

export class StepEditor {
    /**
     * Generalize StepEditor windows
     * @param {BoundingBox} box
     */
    constructor(box, numSteps, draw) {
        this.box = box;
        this.steps = [];

        for (let i = 0; i < numSteps; i++) {
            this.steps.push(new Step());
        }

        this.draw = draw(this);
        this.gradient = null;
    }

    /**
     * Sets property `gradient` to reusable linear gradient to draw bars
     * @param {CanvasRenderingContext2D} ctx
     * @param {string} color1
     * @param {string} color2
     * @param {number} canvasHeight
     */
    createGradient(ctx, color1, color2, canvasHeight) {
        this.gradient = ctx.createLinearGradient(
            0,
            (this.box.y + this.box.h) * canvasHeight,
            0,
            this.box.y * canvasHeight
        );

        this.gradient.addColorStop(0, color1);
        this.gradient.addColorStop(1, color2);
    }

    mouseEvent(mouseX, mouseY, mouseDown) {
        if (!this.box.collidesWith(mouseX, mouseY)) return;

        this.steps.forEach((step) => {
            step.active = false;
        });

        const targettedStep =
            steps[
                Math.floor(
                    normalize(mouseX, this.box.x, this.box.x + this.box.w) *
                        this.steps
                )
            ];

        if (mouseDown) {
            targettedStep.active = mouseDown;
            targettedStep.value = normalize(
                mouseY,
                this.box.y + this.box.h,
                this.box.y
            );
        }
    }
}
