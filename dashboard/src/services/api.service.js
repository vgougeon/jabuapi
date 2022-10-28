import axios from "axios"

class ApiService {
    constructor() {

    }

    get(table) {
        return axios.get(`/api/${table}`)
    }
}

export default new ApiService()