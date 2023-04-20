/**
 * Fonction qui prend un tableau en entrée et renvoie le même tableau trié par ordre croissant.
 * @param {Array} arr - Le tableau à trier.
 * @returns {Array} - Le même tableau trié par ordre croissant.
 */
export const asc = function asc(arr) {
    if (arr.length == 1) {
        return arr;
    }
    return arr.sort((a, b) => a - b);
}

/**
 * Cette fonction calcule le quantile "q" d'un tableau "arr".
 * @param {*} arr  Le tableau d'entrée
 * @param {*} q Le quantile recherché (un nombre compris entre 0 et 1)
 * @returns  Le quantile "q" du tableau "arr"
 */
function quantile(arr, q) {
    const sorted = asc(arr);
    const pos = (sorted.length - 1) * q;
    const base = Math.floor(pos);
    return sorted[base];
}

/**
 * Le premier quartile est une mesure statistique qui correspond à la valeur au-dessous de laquelle se situe le quart inférieur (25%) des données  
 * @param {*} arr Le tableau d'entrée
 * @returns le premier quartile de ce tableau
 */
export const calculerPremierQuartile = function calculerPremierQuartile(arr) {
    return quantile(arr, .25);
}
/**
 * La médiane est la valeur centrale d'un ensemble de données triées, 
 * ou la moyenne des deux valeurs centrales si l'ensemble de données a un nombre pair de valeurs.
 * @param {*} arr Le tableau d'entrée
 * @returns la médiane
 */
export const calculerMedian = function calculerMedian(arr) {
    return quantile(arr, .50);
}
/**
 * Le troisième quartile est une mesure statistique qui correspond à la valeur au-dessus de laquelle se situe le quart supérieur (75%) des données 
 * @param {*} arr Le tableau d'entrée
 * @returns le troisième quartile 
 */
export const calculerTroisiemeQuartile = function calculerTroisiemeQuartile(arr) {
    return quantile(arr, .75);
}
/**
 *  Calcule la distance entre deux points (x1, y1) et (x2, y2) dans un plan 2D en utilisant le théorème de Pythagore.
 * @param {*} x1 La coordonnée x du premier point
 * @param {*} y1 La coordonnée y du premier point
 * @param {*} x2 La coordonnée x du deuxième point
 * @param {*} y2 La coordonnée y du deuxième point
 * @returns La distance entre les deux points
 */
export const calculerDistance2D = function calculerDistance2D(x1, y1, x2, y2) {
    return Math.sqrt((x1 - x2) ** 2 + (y1 - y2) ** 2);
}
/**
 * Calcule la distance euclidienne entre deux points en 3 dimensions (x, y, z)
 * @param {*} x1 La coordonnée x du premier point
 * @param {*} y1 La coordonnée y du premier point
 * @param {*} z1 Coordonnée z du premier point
 * @param {*} x2 La coordonnée x du deuxième point
 * @param {*} y2 La coordonnée y du deuxième point
 * @param {*} z2 Coordonnée z du deuxième point
 * @returns La distance euclidienne entre les deux points
 */
export const calculerDistance3D = function calculerDistance3D(x1, y1, z1, x2, y2, z2) {
    return Math.sqrt((x1 - x2) ** 2 + (y1 - y2) ** 2 + (z1 - z2) ** 2);
}
/**
 * Calcule l'équation d'une ligne droite dans l'espace 2D passant par deux points donnés (x1, y1) et (x2, y2).
 * @param {*} x1 La coordonnée x du premier point
 * @param {*} y1 La coordonnée y du premier point
 * @param {*} x2 La coordonnée x du deuxième point
 * @param {*} y2 La coordonnée y du deuxième point
 * @returns Un tableau contenant la pente 'a' et l'ordonnée à l'origine 'b' de l'équation de la droite.
 */
export const getEquationDroite2D = function getEquationDroite2D(x1, y1, x2, y2) {
    const a = (y2 - y1) / (x2 - x1);
    const b = y1 - a * x1;
    return [a, b];
}
/**
 * Calcule l'équation d'une droite dans l'espace 3D à partir de deux points.
 * @param {*} x1 La coordonnée x du premier point
 * @param {*} y1 La coordonnée y du premier point
 * @param {*} z1 Coordonnée z du premier point
 * @param {*} x2 La coordonnée x du deuxième point
 * @param {*} y2 La coordonnée y du deuxième point
 * @param {*} z2 Coordonnée z du deuxième point
 * @returns un tableau contenant les coordonnées (x, y, z) d'un point appartenant à la droite passant par les points (x1, y1, z1) et (x2, y2, z2)
 */
export const getEquationDroite3D = function getEquationDroite3D(x1, y1, z1, x2, y2, z2) {
    const l = x2 - x1;
    const m = y2 - y1;
    const n = z2 - z1;
    const x = x1 + (x2 - x1) / 100;
    const y = y1 + (x - x1) * m / l;
    const z = z1 + (x - z1) * n / l;
    return [x, y, z];
}
/**
 *  Calcule la différence des angles de rotation entre un objet pivoté et son état d'origine.
 * @param {*} rx L'angle de rotation en radians autour de l'axe x
 * @param {*} ry L'angle de rotation en radians autour de l'axe des y
 * @param {*} rz L'angle de rotation en radians autour de l'axe z
 * @returns La différence des angles de rotation sous la forme d'une valeur scalaire unique.
 */
export const calculerDiffRotation = function calculerDiffRotation(rx, ry, rz) {
    return Math.sqrt(rx ** 2 + ry ** 2 + rz ** 2);
}
/**
 * Tronque un nombre en précisant le nombre de décimales à conserver.
 * @param {*} nombre Le nombre à tronquer.
 * @param {*} decimal Le nombre de décimales à conserver.
 * @returns Le nombre tronqué.
 */
export const tronquer = function tronquer(nombre, decimal) {
    return Math.round(nombre * (10 ** decimal)) / (10 ** decimal);
}

