export const calculerTempsTimestamp = function calculerTempsTimestamp(timestamp) {
    const spliter = timestamp.split('T')[1].split(':');
    return parseInt(spliter[0]) * 3600 + parseInt(spliter[1]) * 60 + parseInt(spliter[2].split('.')[0]);

}