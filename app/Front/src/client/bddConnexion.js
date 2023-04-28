/**
 * envoie une requête HTTP GET à l'URL http://localhost:5500 
 * pour récupérer toutes les données de la base de données
 * @returns réponse sous forme d'objet JSON
 */
export const getAllLiveData = async function getAllLiveData() {
    return fetch("http://localhost:5500", {
        method: 'GET'
    })
        .then(response => response.json())
        .then(response => {
            return response;
        })
}
/**
 * envoie une requête HTTP GET à l'URL http://localhost:5500/inter/${deviceNumber} 
 * pour récupérer les données pour un dispositif spécifique 
 * @param {*} deviceNumber 
 * @returns le résultat de la réponse sous forme d'objet JSON
 */
export const getLiveDataDevice = function getLiveDataDevice(deviceNumber) {
    return fetch(`http://localhost:5500/inter/${deviceNumber}`, {
        method: 'GET'
    })
        .then(response => response.json())
        .then(response => {
            return response;
        })
}
/**
 * envoie une requête HTTP POST à l'URL http://localhost:5500/pcp
 * our récupérer tous les points de contrôle de la base de données 
 * @returns réponse sous forme d'objet JSON
 */
export const getControlPoints = async function getControlPoints() {
    return fetch(`http://localhost:5500/pcp`, {
        method: 'POST'
    })
        .then(response => response.json())
        .then(response => {
            return response;
        })
}
/**
 * envoie une requête HTTP GET à l'URL http://localhost:5500/noms 
 * pour récupérer tous les noms de dispositifs de la base de données 
 * @returns réponse sous forme d'objet JSON
 */
export const getNoms = async function getNoms() {
    return fetch(`http://localhost:5500/noms`, {
        method: 'GET'
    })
        .then(response => response.json())
        .then(response => {
            return response;
        })
}