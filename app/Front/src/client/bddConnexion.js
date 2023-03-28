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