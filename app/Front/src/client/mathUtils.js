function asc(arr) {
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