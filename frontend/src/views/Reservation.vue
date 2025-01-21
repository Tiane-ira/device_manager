<template>
    <div class="reservation">
        <el-card>
            <template #header>
                <div class="card-header">
                    <div class="header-left">
                        <span class="title">设备预约&nbsp;&nbsp;&nbsp;&nbsp;</span>
                        <el-select v-model="searchForm.deviceId" placeholder="请选择设备" clearable style="width: 220px;">
                            <el-option v-for="device in deviceList" :key="device.ID" :label="device.name"
                                :value="device.ID">
                                <div class="device-option">
                                    <span>{{ device.name }}</span>
                                    <el-tag size="small" :type="device.status === '可用' ? 'success' : 'danger'">
                                        {{ device.status }}
                                    </el-tag>
                                </div>
                            </el-option>
                        </el-select>
                        <el-tooltip
                            content="请先选择设备预约时段"
                            :disabled="selectedSlots.length > 0"
                            placement="top"
                        >
                            <el-button
                                type="primary"
                                @click="handleSubmitReservation"
                                :loading="submitting"
                                :disabled="selectedSlots.length === 0"
                            >
                                <el-icon><Check /></el-icon>
                                确认预约
                            </el-button>
                        </el-tooltip>
                    </div>
                    <div class="date-selector">
                        <el-button-group class="date-shortcuts">
                            <el-button @click="setToday">今天</el-button>
                            <el-button @click="addOneDay">+1天</el-button>
                        </el-button-group>
                        <el-date-picker v-model="selectedDateRange" type="daterange" range-separator="至"
                            start-placeholder="开始日期" end-placeholder="结束日期" format="YYYY-MM-DD"
                            value-format="YYYY-MM-DD" :disabled-date="disabledDate" @change="handleDateRangeChange" />
                    </div>
                </div>
            </template>

            <div class="device-section">

                <div class="section-title">
                    设备列表
                    <span class="selected-date">{{ selectedDate }} 预约情况</span>
                </div>
                <div class="device-list-container">
                    <el-row :gutter="24">
                        <el-col v-for="device in availableDevices" :key="device.ID" :span="6"
                            class="mb-4">
                            <el-card :class="['device-card', { 'selected': reservationForm.deviceId === device.ID }]"
                                shadow="hover">
                                <div class="device-header">
                                    <div class="device-info">
                                        <div class="device-name">
                                            <div>
                                                <el-icon>
                                                    <Monitor />
                                                </el-icon>
                                                {{ device.name }}
                                            </div>
                                            <div class="device-ip">IP: {{ device.ip }}</div>
                                            <div class="device-description">{{ device.description || '暂无描述' }}</div>
                                        </div>
                                    </div>
                                </div>
                                <div class="time-slots-grid">
                                    <div v-for="slot in allTimeSlots" :key="slot.ID" :class="['time-slot-item', {
                                        'reserved': isSlotReserved(device.ID, slot.ID),
                                        'selected': isSlotSelected(device.ID, slot.ID)
                                    }]" @click="toggleSlotSelection(device, slot)">
                                        <div class="time-slot-content">
                                            <div class="time-slot-name">{{ slot.name }}</div>
                                            <div class="time-slot-info">
                                                <div class="time-slot-time">
                                                    <el-icon>
                                                        <Timer />
                                                    </el-icon>
                                                    {{ slot.startTime }} - {{ slot.endTime }}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </el-card>
                        </el-col>
                    </el-row>
                </div>
            </div>
        </el-card>
    </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { Timer, Check, Monitor } from '@element-plus/icons-vue'
import dayjs from 'dayjs'
import { deviceApi, timeSlotApi, reservationApi } from '@/api'

const deviceList = ref([])
const searchForm = ref({
    deviceId: ''
})
const allTimeSlots = ref([])
const reservations = ref([])
const selectedDevice = ref(null)
const selectedSlots = ref([])
const user = JSON.parse(localStorage.getItem('user'))
const reservationForm = reactive({
    deviceId: ''
})

// 添加日期范围选择相关
const selectedDateRange = ref([dayjs().format('YYYY-MM-DD'), dayjs().format('YYYY-MM-DD')])

// 计算属性：显示当前选择的日期范围
const selectedDate = computed(() => {
    const [startDate, endDate] = selectedDateRange.value
    return startDate === endDate ? startDate : `${startDate} 至 ${endDate}`
})

// 禁用过去的日期
const disabledDate = (time) => {
    return dayjs(time).isBefore(dayjs(), 'day')
}

// 处理日期范围变化
const handleDateRangeChange = () => {
    selectedDevice.value = null
    selectedSlots.value = []
    reservationForm.deviceId = ''
    fetchReservationsForDateRange()
}

// 设置日期范围为今天
const setToday = () => {
    const today = dayjs().format('YYYY-MM-DD')
    selectedDateRange.value = [today, today]
    handleDateRangeChange()
}

// 将结束日期增加一天
const addOneDay = () => {
    const [startDate, endDate] = selectedDateRange.value
    const newEndDate = dayjs(endDate).add(1, 'day').format('YYYY-MM-DD')
    selectedDateRange.value = [startDate, newEndDate]
    handleDateRangeChange()
}

// 获取设备列表
const fetchDevices = async () => {
    try {
        const data = await deviceApi.getList()
        deviceList.value = data
    } catch (error) {
        ElMessage.error('获取设备列表失败')
    }
}

// 获取所有时间段
const fetchTimeSlots = async () => {
    try {
        const data = await timeSlotApi.getList()
        allTimeSlots.value = data
    } catch (error) {
        ElMessage.error('获取时间段失败')
    }
}

// 获取选定日期范围内的预约记录
const fetchReservationsForDateRange = async () => {
    try {
        const [startDate, endDate] = selectedDateRange.value
        const params = {
            startDate,
            endDate
        }
        const data = await reservationApi.getRecords(params)
        reservations.value = data
    } catch (error) {
        ElMessage.error('获取预约记录失败')
    }
}

// 检查时间段是否已被预约
const isSlotReserved = (deviceId, slotId) => {
    return reservations.value.some(r =>
        r.deviceID === deviceId &&
        r.timeSlotID === slotId
    )
}

// 检查时间段是否被选中
const isSlotSelected = (deviceId, slotId) => {
    return selectedDevice.value?.ID === deviceId && selectedSlots.value.includes(slotId)
}

// 获取时间段信息
const getTimeSlotById = (slotId) => {
    return allTimeSlots.value.find(slot => slot.ID === slotId)
}

// 切换时间段选择
const toggleSlotSelection = (device, slot) => {
    if (isSlotReserved(device.ID, slot.ID)) {
        ElMessage.warning('该时间段已被预约')
        return
    }
    selectedDevice.value = device
    if (selectedSlots.value.includes(slot.ID)) {
        selectedSlots.value = selectedSlots.value.filter(id => id !== slot.ID)
    } else {
        selectedSlots.value.push(slot.ID)
    }
    reservationForm.deviceId = device.ID
}


const submitting = ref(false)

const handleSubmitReservation = async () => {
    if (submitting.value) return
    submitting.value = true
    try {
        const [startDate, endDate] = selectedDateRange.value
        const start = dayjs(startDate)
        const end = dayjs(endDate)

        // 遍历日期范围内的每一天
        for (let date = start; date.isBefore(end) || date.isSame(end, 'day'); date = date.add(1, 'day')) {
            for (const slotId of selectedSlots.value) {
                const data = {
                    deviceId: selectedDevice.value.ID,
                    deviceName: selectedDevice.value.name,
                    date: date.format('YYYY-MM-DD'),
                    timeSlotId: slotId,
                    timeSlotName: getTimeSlotById(slotId)?.name,
                    timeRange: `${getTimeSlotById(slotId)?.startTime} - ${getTimeSlotById(slotId)?.endTime}`,
                    userName: user.name
                }
                await reservationApi.create(data)
            }
        }

        ElMessage.success('预约成功')
        // 重置选择
        selectedDevice.value = null
        selectedSlots.value = []
        reservationForm.deviceId = ''
        // 刷新预约记录
        fetchReservationsForDateRange()
    } catch (error) {
        console.log(error);
        ElMessage.error('预约失败')
    } finally {
        submitting.value = false
    }
}

// 过滤出可用设备
const availableDevices = computed(() => {
    return deviceList.value.filter(device => {
        if (searchForm.value.deviceId) {
            return device.ID === searchForm.value.deviceId && device.status === '可用'
        }
        return device.status === '可用'
    })
})

onMounted(async () => {
    await fetchDevices()
    await fetchTimeSlots()
    await fetchReservationsForDateRange()
})
</script>

<style scoped>
.device-list-container {
    height: calc(100vh - 280px);
    overflow-y: auto;
    overflow-x: hidden;
    padding-right: 8px;
}

.device-list-container::-webkit-scrollbar {
    width: 6px;
}

.device-list-container::-webkit-scrollbar-thumb {
    background-color: var(--el-border-color-darker);
    border-radius: 3px;
}

.device-list-container::-webkit-scrollbar-track {
    background-color: var(--el-fill-color-light);
}

.device-card {
    height: auto;
    transition: all 0.3s;
    border-radius: 8px;
    overflow: hidden;
    margin-bottom: 16px;
}

.device-header {
    padding: 4px 0;
}

.device-name {
    font-size: 16px;
    font-weight: bold;
    color: var(--el-color-primary);
    display: flex;
    align-items: center;
    gap: 6px;
    margin-bottom: 4px;
}

.device-ip {
    color: var(--el-text-color-secondary);
    font-size: 13px;
    line-height: 1.2;
    margin-bottom: 2px;
}

.device-description {
    color: var(--el-text-color-regular);
    font-size: 13px;
    line-height: 1.2;
}

.time-slots-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 8px;
    padding: 8px 0;
}

.time-slot-item {
    border: 1px solid var(--el-color-success);
    border-radius: 6px;
    padding: 6px;
    cursor: pointer;
    transition: all 0.3s;
    position: relative;
    min-height: 60px;
}

.time-slot-item:hover:not(.reserved) {
    border-color: var(--el-color-primary);
    background-color: var(--el-color-primary-light-9);
}

.time-slot-item.reserved {
    border-color: var(--el-color-danger);
    background-color: var(--el-fill-color-light);
    opacity: 0.8;
    cursor: not-allowed;
}

.time-slot-item.selected {
    border: 2px solid var(--el-color-primary);
    background-color: var(--el-color-primary-light-9);
}

.time-slot-content {
    width: 100%;
}

.time-slot-name {
    font-weight: bold;
    margin-bottom: 8px;
    color: var(--el-text-color-primary);
}

.time-slot-info {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.time-slot-time {
    color: var(--el-text-color-secondary);
    font-size: 13px;
    display: flex;
    align-items: center;
    gap: 4px;
}

.time-slot-status {
    margin-left: 8px;
}

.section-title {
    font-size: 16px;
    font-weight: bold;
    margin: 0 0 20px;
    padding-left: 10px;
    margin-right: 20px;
    border-left: 4px solid var(--el-color-primary);
}

.submit-section {
    margin-top: 24px;
    text-align: center;
    padding: 16px;
    background-color: var(--el-fill-color-light);
    border-radius: 8px;
}

.submit-section .el-alert {
    margin-bottom: 16px;
}

:deep(.el-divider__text) {
    background-color: transparent;
}

/* 添加日期选择器样式 */
.card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.header-left {
    display: flex;
    align-items: center;
    gap: 16px;
}

.date-selector {
    margin-left: 20px;
    display: flex;
    align-items: center;
    gap: 12px;
}

.date-shortcuts {
    display: flex;
    gap: 8px;
}

.selected-date {
    font-size: 14px;
    color: var(--el-text-color-secondary);
    margin-left: 12px;
    font-weight: normal;
}
</style>