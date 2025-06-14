window.addEventListener('DOMContentLoaded', run);

function run() {
    const canv = document.querySelector('canvas#canv');
    let offScreenCanv = canv.transferControlToOffscreen();

    const worker = new Worker('modules/render.js', {
        type: 'module',
    });

    window.addEventListener('resize', () => {
        worker.postMessage({
            type: 'resize',
            w: window.innerWidth,
            h: window.innerHeight,
        });
    });

    // wait for mouse move to start
    window.addEventListener(
        'mousemove',
        () => {
            worker.postMessage(
                {
                    type: 'start',
                    canvas: offScreenCanv,
                    w: window.innerWidth,
                    h: window.innerHeight,
                },
                [offScreenCanv]
            );
        },
        { once: true }
    );

    window.addEventListener('mousemove', (ev) => {
        worker.postMessage({
            type: 'mousemove',
            x: ev.clientX,
            y: ev.clientY,
        });
    });

    const onMouseEvent = (ev) => {
        worker.postMessage({ type: ev.type });
    };

    window.addEventListener('mousedown', onMouseEvent);
    window.addEventListener('mouseup', onMouseEvent);

    worker.addEventListener('message', (ev) => {
        const { real, imag } = ev.data;

        const ac = new AudioContext();
        const wave = ac.createPeriodicWave(real, imag);

        const osc = ac.createOscillator();
        osc.setPeriodicWave(wave);
        osc.connect(ac.destination);

        osc.start();
    });
}
