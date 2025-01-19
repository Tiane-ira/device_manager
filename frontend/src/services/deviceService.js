import { dbOperation } from '../db'

export const deviceService = {
    async getList() {
        try {
            return await dbOperation('devices', 'readonly', (store) => store.getAll())
        } catch (error) {
            console.error('获取设备列表失败:', error)
            throw error
        }
    },

    async add(device) {
        try {
            const newDevice = { ...device }
            delete newDevice.ID // 确保不包含id字段，让数据库自动生成
            return await dbOperation('devices', 'readwrite', (store) => store.add(newDevice))
        } catch (error) {
            console.error('添加设备失败:', error)
            throw error
        }
    },

    async update(device) {
        try {
            // 确保device对象包含id
            if (!device.ID) {
                throw new Error('更新设备时必须包含id')
            }
            // 先检查设备是否存在
            const existingDevice = await dbOperation('devices', 'readonly', (store) => store.get(device.ID))
            if (!existingDevice) {
                throw new Error('设备不存在')
            }
            // 更新设备信息
            return await dbOperation('devices', 'readwrite', (store) => store.put({
                ...existingDevice,
                ...device
            }))
        } catch (error) {
            console.error('更新设备失败:', error)
            throw error
        }
    },

    async delete(id) {
        try {
            // 先检查设备是否存在
            const device = await dbOperation('devices', 'readonly', (store) => store.get(Number(id)))
            if (!device) {
                throw new Error('设备不存在')
            }

            // 检查是否有关联的预约记录
            const reservations = await dbOperation('reservations', 'readonly', (store) => {
                const index = store.index('deviceId')
                return index.getAll(Number(id))
            })

            // 如果有未完成的预约，不允许删除
            if (reservations.some(r => r.status === '已预约')) {
                throw new Error('该设备有未完成的预约，无法删除')
            }

            // 执行删除操作
            await dbOperation('devices', 'readwrite', (store) => store.delete(Number(id)))
            return true
        } catch (error) {
            console.error('删除设备失败:', error)
            throw error
        }
    }
} 