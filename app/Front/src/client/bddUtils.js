/**
 * Cette fonction permet de convertir le time stamp en secondes 
 * @param {*} timestamp 
 * @returns un entier représentant ce temps en secondes
 */
export const calculerTempsTimestamp = function calculerTempsTimestamp(timestamp) {
    const jour = parseInt(timestamp.split('T')[0].split('-')[1]);
    const spliter = timestamp.split('T')[1].split(':');
    return jour * 24 * 3600 + parseInt(spliter[0]) * 3600 + parseInt(spliter[1]) * 60 + parseInt(spliter[2].split('.')[0]);
}