export const calculerTempsTimestamp = function calculerTempsTimestamp(timestamp) {
    const spliter = timestamp.split('T')[1].split(':');
    return spliter[0] * 3600 + spliter[1] * 60 + spliter[2].split('.');

}