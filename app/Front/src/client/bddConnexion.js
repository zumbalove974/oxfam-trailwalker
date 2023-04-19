export const getAllLiveData = async function getAllLiveData() {
    return fetch("http://localhost:5500", {
        method: 'GET'
    })
        .then(response => response.json())
        .then(response => {

            // console.log("bddConnection.response");
            // console.log(response);

            return response;
        })
}

export const getLiveDataDevice = function getLiveDataDevice(deviceNumber) {
    return fetch(`http://localhost:5500/inter/${deviceNumber}`, {
        method: 'GET'
    })
        .then(response => response.json())
        .then(response => {

            return response;
        })
}


export const getControlPoints = async function getControlPoints() {
    return fetch(`http://localhost:5500/pcp`, {
        method: 'POST'
    })
        .then(response => response.json())
        .then(response => {
            return response;
        })
}

export const getNoms = async function getNoms() {
    return fetch(`http://localhost:5500/noms`, {
        method: 'GET'
    })
        .then(response => response.json())
        .then(response => {
            return response;
        })
}