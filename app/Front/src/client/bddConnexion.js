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

export const getLiveDataDevice = async function getLiveDataDevice(deviceNumber) {
    return fetch(`http://localhost:5500/device/${deviceNumber}`, {
        method: 'GET'
    })
        .then(response => response.json())
        .then(response => {

            //console.log("bddConnection.response");
            //console.log(response);

            return response;
        })
}

export const getControlPoints = async function getControlPoints() {
    return fetch(`http://localhost:5500/controlPoints`, {
        method: 'GET'
    })
        .then(response => response.json())
        .then(response => {

            //console.log("getControlPoints.response");
            //console.log(response);

            return response;
        })
}