import { StepEditor, BoundingBox, normalize } from './gui.js';
import { DFT } from './math.js';

let handler;

/**@type {HTMLCanvasElement} */
let canv;

/** @type {CanvasRenderingContext2D} */
let ctx;

const COLORS = {
    light: '#f4effa',
    prim: '#2f184b',
    sec: '#532b88',
    ter: '#9b72cf',
    highlight: '#c8b1e4',
};

// standard line width unit
const U = 2;

const waveform = new StepEditor(
    new BoundingBox(0, 0, 0.5, 0.2),
    30,
    drawStepEditor
);
const sequencer = new StepEditor(
    new BoundingBox(0.5, 0, 0.5, 0.2),
    5,
    drawStepEditor
);

waveform.steps.forEach((step, k) => {
    step.value =
        0.5 * (-Math.cos((k / waveform.steps.length) * 2 * Math.PI) - 1) + 1;
});

const guiElements = [waveform, sequencer];

const mouse = { x: -1, y: -1, down: undefined };

let t, dt;
function drawFrame(timestamp) {
    dt = timestamp - t;
    t = timestamp;

    // ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    ctx.fillStyle = COLORS.light;
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    guiElements.forEach((elem) => {
        elem.draw();
    });

    handler = self.requestAnimationFrame(drawFrame);
}

/**
 * Return callback to render step editor on canvas
 * @param {StepEditor} editor
 */
function drawStepEditor(editor) {
    return () => {
        const pxBounds = editor.box.toPixels(canv.width, canv.height);

        ctx.beginPath();
        ctx.roundRect(pxBounds.x, pxBounds.y, pxBounds.w, pxBounds.h, U * 4);
        ctx.closePath();

        ctx.fillStyle = COLORS.prim;
        ctx.fill();

        ctx.strokeStyle = COLORS.sec;
        ctx.lineWidth = U;
        ctx.stroke();

        pxBounds.w -= U * 6;
        pxBounds.x += U * 3;

        pxBounds.h -= U * 2;
        pxBounds.y += U * 2;

        editor.steps.forEach((step, k) => {
            const bounds = new BoundingBox(
                pxBounds.x + (k / editor.steps.length) * pxBounds.w,
                pxBounds.y,
                pxBounds.w / editor.steps.length,
                pxBounds.h
            );
            const active = bounds.collidesWith(mouse) && mouse.down;
            if (active) {
                step.value = normalize(mouse.y, bounds.y + bounds.h, bounds.y);
            }

            const bar = new BoundingBox(
                pxBounds.x + (k / editor.steps.length) * pxBounds.w,
                pxBounds.y + (1 - step.value) * pxBounds.h,
                pxBounds.w / editor.steps.length,
                step.value * pxBounds.h
            );
            const highlighted = active || bar.collidesWith(mouse);

            ctx.beginPath();
            ctx.rect(bar.x, bar.y, bar.w, bar.h);
            ctx.closePath();

            ctx.fillStyle = highlighted ? COLORS.highlight : editor.gradient;
            ctx.fill();

            ctx.beginPath();
            ctx.moveTo(bar.x, bar.y);
            ctx.lineTo(bar.x + bar.w, bar.y);
            ctx.closePath();

            ctx.lineWidth = U;
            ctx.strokeStyle = COLORS.ter;
            ctx.stroke();
        });
    };
}

function resize(w, h) {
    canv.width = w;
    canv.height = h;

    guiElements.forEach((elem) => {
        elem.createGradient(ctx, COLORS.prim, COLORS.sec, canv.height);
    });
}

/**
 * Use values in step editor to create PeriodicWave
 */
function getWaveform() {
    // signal normalized to [-1.0, 1.0]
    const x = waveform.steps.map((step) => step.value * 2 - 1);
    const [real, imag] = DFT(x);

    postMessage({
        real: real,
        imag: imag,
    });
}

self.addEventListener('message', (ev) => {
    switch (ev.data.type) {
        case 'start':
            canv = ev.data.canvas;
            ctx = canv.getContext('2d');

            resize(ev.data.w, ev.data.h);

            drawFrame(performance.now());
            break;
        case 'resize':
            resize(ev.data.w, ev.data.h);
            break;
        case 'mousemove':
            mouse.x = ev.data.x;
            mouse.y = ev.data.y;
            break;
        case 'mousedown':
            mouse.down = true;

            break;
        case 'mouseup':
            mouse.down = false;
            getWaveform();
            break;
    }
});
