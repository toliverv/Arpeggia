import { StepEditor, BoundingBox } from './gui.js';

let handler, canv;

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
    20,
    drawStepEditor
);
const sequencer = new StepEditor(
    new BoundingBox(0.5, 0, 0.5, 0.2),
    5,
    drawStepEditor
);

waveform.steps[2].value = 0.5;
waveform.steps[3].value = 1;

const guiElements = [waveform, sequencer];

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

function drawBall(b) {
    b.pos.x += b.vel.x * dt;
    b.pos.y += b.vel.y * dt;

    checkCollisions(b);

    b.vel.y += G * dt;

    ctx.beginPath();
    ctx.arc(b.pos.x, b.pos.y, b.r, 0, 2 * Math.PI, false);
    ctx.fillStyle = b.color;
    ctx.fill();
    ctx.lineWidth = 1;
    ctx.strokeStyle = 'black';
    ctx.stroke();
    // ctx.closePath()
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
        ctx.lineWidth = U * 2;
        ctx.stroke();

        pxBounds.h -= U * 4;
        pxBounds.w -= U * 4;
        pxBounds.x += U * 2;
        pxBounds.y += U * 2;

        editor.steps.forEach((step, k) => {
            let x = pxBounds.x + (k / editor.steps.length) * pxBounds.w,
                y = pxBounds.y + (1 - step.value) * pxBounds.h,
                w = pxBounds.w / editor.steps.length,
                h = step.value * pxBounds.h;

            ctx.beginPath();
            ctx.rect(x, y, w, h);
            ctx.closePath();

            ctx.fillStyle = COLORS.sec;
            ctx.fill();

            ctx.beginPath();
            ctx.moveTo(x, y);
            ctx.lineTo(x + w, y);
            ctx.closePath();

            ctx.lineWidth = U;
            ctx.strokeStyle = COLORS.ter;
            ctx.stroke();
        });
    };
}

function resize(size) {
    canv.width = size[0];
    canv.height = size[1];
}

function click(pos) {}

function handleMessage(e) {
    switch (e.data['type']) {
        case 'start':
            canv = e.data['canvas'];
            ctx = canv.getContext('2d');

            drawFrame(performance.now());
            break;
        case 'resize':
            resize(e.data['size']);
            break;
        case 'click':
            click(e.data['pos']);
            break;
    }
}

self.addEventListener('message', handleMessage);
