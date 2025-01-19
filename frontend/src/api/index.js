import axios from 'axios'

const apiClient = axios.create({
    baseURL: '/api',
    headers: {
        'Content-Type': 'application/json'
    }
})

const handleResponse = (response) => {
    if (response.data.code === 200) {
        return response.data.data
    } else {
        throw new Error(response.data.msg)
    }
}

export const deviceApi = {
    async getList() {
        const response = await apiClient.get('/devices')
        return handleResponse(response)
    },
    async add(device) {
        const response = await apiClient.post('/devices', device)
        return handleResponse(response)
    },
    async update(device) {
        const response = await apiClient.put(`/devices/${device.ID}`, device)
        return handleResponse(response)
    },
    async delete(id) {
        const response = await apiClient.delete(`/devices/${id}`)
        return handleResponse(response)
    }
}

export const reservationApi = {
    async getRecords(params) {
        const response = await apiClient.get('/reservations', { params })
        return handleResponse(response)
    },
    async create(reservation) {
        const response = await apiClient.post('/reservations', reservation)
        return handleResponse(response)
    },
    async cancel(id) {
        const response = await apiClient.delete(`/reservations/${id}`)
        return handleResponse(response)
    }
}

export const userApi = {
    async login(credentials) {
        const response = await apiClient.post('/login', credentials)
        return handleResponse(response)
    },
    async register(userData) {
        const response = await apiClient.post('/register', userData)
        return handleResponse(response)
    }
}

export const timeSlotApi = {
    async getList() {
        const response = await apiClient.get('/time-slots')
        return handleResponse(response)
    },
    async add(timeSlot) {
        const response = await apiClient.post('/time-slots', timeSlot)
        return handleResponse(response)
    },
    async update(timeSlot) {
        const response = await apiClient.put(`/time-slots/${timeSlot.ID}`, timeSlot)
        return handleResponse(response)
    },
    async delete(id) {
        const response = await apiClient.delete(`/time-slots/${id}`)
        return handleResponse(response)
    }
}