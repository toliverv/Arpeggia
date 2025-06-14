// interpret number x within two bounds as normalized value (from 0 to 1)
export function normalize(x, min, max, confine = false) {
    const ans = (x - min) / (max - min);
    if (!confine) return ans;
    else if (ans > 1) return 1;
    else if (ans < 0) return 0;
    else return ans;
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

export class StepEditor {
    /**
     * Generalize StepEditor windows
     * @param {BoundingBox} box
     * @param {number} numSteps
     * @param {number} grid
     * @param {()=>void} update
     * @param {()=>()=>void} draw
     */
    constructor(box, numSteps, grid = 0, update, draw) {
        this.box = box;
        this.steps = new Array(numSteps).fill(0);

        this.grid = grid;

        this.update = update;
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

    set(n, value) {
        if (this.grid) this.steps[n] = roundFract(value, this.grid);
        else this.steps[n] = value;
    }

    /**
     * @returns {number[]} Signed ([-1, 1]) float values of each step
     */
    getSigned() {
        return this.steps.map((x) => x * 2 - 1);
    }
}
