import { dbOperation } from '../db'

export const reservationService = {
    async getAvailableTimeSlots(date, deviceId) {
        // 获取所有时间段
        const timeSlots = await dbOperation('timeSlots', 'readonly', (store) => store.getAll())

        // 获取当天该设备的预约记录
        const reservations = await dbOperation('reservations', 'readonly', (store) => {
            const index = store.index('date')
            return index.getAll(date)
        })

        // 过滤掉已被预约的时间段
        return timeSlots.filter(slot =>
            !reservations.some(r =>
                r.timeSlotId === slot.ID &&
                r.deviceId === deviceId &&
                r.status === '已预约'
            )
        )
    },

    async create(reservation) {
        // 获取当前用户
        const userStr = localStorage.getItem('user')
        if (!userStr) {
            throw new Error('请先登录')
        }
        const user = JSON.parse(userStr)

        // 创建预约记录，包含用户信息
        const newReservation = {
            ...reservation,
            userId: user.ID,
            userName: user.name,
            status: '已预约',
            createTime: new Date().toLocaleString()
        }

        return dbOperation('reservations', 'readwrite', (store) =>
            store.add(newReservation)
        )
    },

    async getRecords(params) {
        // 获取所有预约记录
        const reservations = await dbOperation('reservations', 'readonly', (store) => store.getAll())

        // 根据条件过滤
        let filtered = reservations

        if (params.deviceId) {
            filtered = filtered.filter(r => r.deviceId === params.deviceId)
        }
        if (params.startDate) {
            filtered = filtered.filter(r => r.date >= params.startDate)
        }
        if (params.endDate) {
            filtered = filtered.filter(r => r.date <= params.endDate)
        }

        // 按创建时间倒序排序
        return filtered.sort((a, b) =>
            new Date(b.createTime) - new Date(a.createTime)
        )
    },

    async cancel(id) {
        return dbOperation('reservations', 'readwrite', async (store) => {
            const reservation = await store.get(id)
            if (reservation) {
                // 删除预约记录
                return store.delete(id)
            }
            throw new Error('预约记录不存在')
        })
    }
} 