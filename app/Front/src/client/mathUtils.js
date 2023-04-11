export const asc = function asc(arr) {
    return arr.sort((a, b) => a - b);
}

function quantile(arr, q) {
    const sorted = asc(arr);
    const pos = (sorted.length - 1) * q;
    const base = Math.floor(pos);
    const rest = pos - base;
    if (sorted[base + 1] !== undefined) {
        return sorted[base] + rest * (sorted[base + 1] - sorted[base]);
    } else {
        return sorted[base];
    }
}

export const calculerPremierQuartile = function calculerPremierQuartile(arr) {
    return quantile(arr, .25);
}

export const calculerMedian = function calculerMedian(arr) {
    return quantile(arr, .50);
}
export const calculerTroisiemeQuartile = function calculerTroisiemeQuartile(arr) {
    return quantile(arr, .75);
}

export const calculerDistance2D = function calculerDistance2D(x1, y1, x2, y2) {
    return Math.sqrt((x1 - x2) ** 2 + (y1 - y2) ** 2);
}

export const calculerDistance3D = function calculerDistance3D(x1, y1, z1, x2, y2, z2) {
    return Math.sqrt((x1 - x2) ** 2 + (y1 - y2) ** 2 + (z1 - z2) ** 2);
}

export const getEquationDroite2D = function getEquationDroite2D(x1, y1, x2, y2) {
    const a = (y2 - y1) / (x2 - x1);
    const b = y1 - a * x1;

    return [a, b];
}

export const getEquationDroite3D = function getEquationDroite3D(x1, y1, z1, x2, y2, z2) {
    const l = x2 - x1;
    const m = y2 - y1;
    const n = z2 - z1;
    const x = x1 + (x2 - x1) / 100;
    const y = y1 + (x - x1) * m / l;
    const z = z1 + (x - z1) * n / l;
    return [x, y, z];
}

export const calculerDiffRotation = function calculerDiffRotation(rx, ry, rz) {
    return Math.sqrt(rx ** 2 + ry ** 2 + rz ** 2);
}