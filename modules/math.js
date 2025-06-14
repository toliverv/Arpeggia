/**
 * Discrete Fourier transform
 * @param {number[]} x Signal with length N
 * @returns {[number[],number[]]} Corresponding real & imaginary components of N frequency bins
 */
export function DFT(x) {
    const N = x.length;

    const Xre = new Array(N);
    const Xim = new Array(N);

    for (let k = 0; k < N; k++) {
        let real = 0;
        let imag = 0;

        for (let n = 0; n < N; n++) {
            real += (x[n] * Math.cos((2 * Math.PI * k * n) / N)) / N;
            imag -= (x[n] * Math.sin((2 * Math.PI * k * n) / N)) / N;
        }
        Xre[k] = real;
        Xim[k] = imag;
    }

    return [Xre, Xim];
}
