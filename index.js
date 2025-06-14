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
    const ac = new AudioContext();
    const osc = ac.createOscillator();
    osc.connect(ac.destination);

    worker.addEventListener('message', (ev) => {
        switch (ev.data.type) {
            case 'init':
                osc.start();
                break;
            case 'waveform':
                const { real, imag } = ev.data;

                const wave = ac.createPeriodicWave(real, imag);
                osc.setPeriodicWave(wave);
                break;
            case 'sequence':
                const vals = ev.data.values;
                break;
        }
    });

    // wait for mouse clip to start
    window.addEventListener(
        'mousedown',
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
}
