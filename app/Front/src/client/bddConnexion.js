export const getAllLiveData = async function getAllLiveData() {
    return fetch("http://localhost:3000", {
        method: 'GET'
    })
        .then(response => response.json())
        .then(response => {

            console.log("_________________");
            console.log(response);

            return response;
        })
}