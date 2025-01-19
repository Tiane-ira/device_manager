import { deviceService } from '../services/deviceService'
import { timeSlotService } from '../services/timeSlotService'
import { reservationService } from '../services/reservationService'

export const mockApi = {
    // 设备相关
    'GET /api/device/list': () => ({
        code: 200,
        data: deviceService.getList()
    }),
    'POST /api/device/add': (data) => {
        const id = deviceService.add(data)
        return { code: 200, message: '添加成功', data: { id } }
    },
    'PUT /api/device/:id': (data) => {
        deviceService.update(data)
        return { code: 200, message: '更新成功' }
    },
    'DELETE /api/device/:id': (id) => {
        deviceService.delete(id)
        return { code: 200, message: '删除成功' }
    },

    // 时间段相关
    'GET /api/timeSlot/list': () => ({
        code: 200,
        data: timeSlotService.getList()
    }),
    'POST /api/timeSlot/add': (data) => {
        const id = timeSlotService.add(data)
        return { code: 200, message: '添加成功', data: { id } }
    },
    'PUT /api/timeSlot/:id': (data) => {
        timeSlotService.update(data)
        return { code: 200, message: '更新成功' }
    },
    'DELETE /api/timeSlot/:id': (id) => {
        timeSlotService.delete(id)
        return { code: 200, message: '删除成功' }
    },

    // 预约相关
    'GET /api/reservation/availableTimeSlots': (params) => ({
        code: 200,
        data: reservationService.getAvailableTimeSlots(params.date, params.deviceId)
    }),
    'POST /api/reservation/create': (data) => {
        const id = reservationService.create(data)
        return { code: 200, message: '预约成功', data: { id } }
    },
    'PUT /api/reservation/:id/cancel': (id) => {
        reservationService.cancel(id)
        return { code: 200, message: '取消成功' }
    },
    'GET /api/reservation/records': (params) => {
        const records = reservationService.getRecords(params)
        return {
            code: 200,
            data: {
                list: records,
                total: records.length
            }
        }
    }
} 