window.addEventListener('DOMContentLoaded', run);

function run() {
    const canv = document.querySelector('canvas#canv');
    let offScreenCanv = canv.transferControlToOffscreen();

    const worker = new Worker('modules/render.js', {
        type: 'module',
    });

    worker.postMessage(
        {
            type: 'start',
            canvas: offScreenCanv,
        },
        [offScreenCanv]
    );

    window.addEventListener('resize', () => {
        worker.postMessage({
            type: 'resize',
            size: [window.innerWidth, window.innerHeight],
        });
    });
    worker.postMessage({
        type: 'resize',
        size: [window.innerWidth, window.innerHeight],
    });

    canv.addEventListener('click', (e) => {
        worker.postMessage({
            type: 'click',
            pos: [e.clientX, e.clientY],
        });
    });
}
