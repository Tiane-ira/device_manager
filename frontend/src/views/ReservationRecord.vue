<template>
    <div class="reservation-record">
        <el-card>
            <template #header>
                <div class="card-header">
                    <span class="title">预约记录</span>
                    <el-button type="primary" @click="exportToExcel">
                        <el-icon>
                            <Download />
                        </el-icon>
                        导出Excel
                    </el-button>
                </div>
            </template>

            <el-form :inline="true" :model="searchForm" class="search-form">
                <el-form-item label="设备名称">
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
                </el-form-item>
                <el-form-item label="预约日期">
                    <el-date-picker v-model="searchForm.dateRange" type="daterange" range-separator="至"
                        start-placeholder="开始日期" end-placeholder="结束日期" value-format="YYYY-MM-DD"
                        style="width: 320px;" />
                </el-form-item>
                <el-form-item>
                    <el-button type="primary" @click="handleSearch">
                        <el-icon>
                            <Search />
                        </el-icon>
                        查询
                    </el-button>
                    <el-button @click="resetSearch">
                        <el-icon>
                            <Refresh />
                        </el-icon>
                        重置
                    </el-button>
                </el-form-item>
                <el-form-item>
                    <el-checkbox v-model="isExport">全量导出</el-checkbox>
                </el-form-item>
            </el-form>

            <el-table :data="recordList" border stripe v-loading="loading">
                <el-table-column prop="deviceName" label="设备名称" />
                <el-table-column prop="date" label="预约日期" width="120" />
                <el-table-column label="时间段" width="120">
                    <template #default="{ row }">
                        <div class="time-slot-info">
                            <span class="time-slot-name">{{ row.timeSlotName }}</span>
                            <span class="time-range">{{ row.timeRange }}</span>
                        </div>
                    </template>
                </el-table-column>
                <el-table-column prop="userName" label="预约人" width="100" />
                <el-table-column prop="CreatedAt" label="创建时间" :formatter="dateFormat" width="180" />
                <el-table-column label="操作" width="120" align="center" fixed="right">
                    <template #default="{ row }">
                        <el-button type="danger" link @click="handleDelete(row)"
                            :disabled="isFutureReservation(row.date)">
                            <el-icon>
                                <Delete />
                            </el-icon>
                            删除
                        </el-button>
                    </template>
                </el-table-column>
            </el-table>
        </el-card>
    </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Download, Search, Refresh, Close, Delete } from '@element-plus/icons-vue'
import * as XLSX from 'xlsx'
import dayjs from 'dayjs'
import { deviceApi, reservationApi } from '@/api'

const loading = ref(false)
const isExport = ref(false)
const deviceList = ref([])
const recordList = ref([])

const searchForm = reactive({
    deviceId: '',
    dateRange: []
})

const dateFormat = (row, column) => {
    return dayjs(row[column.property]).format('YYYY-MM-DD HH:mm:ss')
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

// 获取预约记录
const fetchRecords = async () => {
    loading.value = true
    try {
        const params = {
            deviceId: searchForm.deviceId,
            startDate: searchForm.dateRange?.[0],
            endDate: searchForm.dateRange?.[1]
        }
        const data = await reservationApi.getRecords(params)
        recordList.value = data
    } catch (error) {
        ElMessage.error('获取预约记录失败')
    } finally {
        loading.value = false
    }
}

const handleSearch = () => {
    fetchRecords()
}

const resetSearch = () => {
    searchForm.deviceId = ''
    searchForm.dateRange = [dayjs().format('YYYY-MM-DD'), dayjs().add(1, 'day').format('YYYY-MM-DD')]
    isExport.value = false
    handleSearch()
}

const handleDelete = (row) => {
    ElMessageBox.confirm('确认删除该预约？', '提示', {
        type: 'warning'
    }).then(async () => {
        try {
            await reservationApi.cancel(row.ID)
            ElMessage.success('删除成功')
            fetchRecords()
        } catch (error) {
            ElMessage.error('删除失败')
        }
    })
}

const exportToExcel = async () => {
    let exportList = []
    try {
        const params = {
            deviceId: searchForm.deviceId,
            startDate: searchForm.dateRange?.[0],
            endDate: searchForm.dateRange?.[1],
            isExport: isExport.value ? "1" : ""
        }
        exportList = await reservationApi.getRecords(params)
    } catch (error) {
        ElMessage.error('导出数据失败:' + error)
        return
    }
    const deviceMap = deviceList.value.reduce((map, item) => {
        map[item.ID] = item
        return map
    }, {})
    const data = exportList.map(item => ({
        '设备名称': item.deviceName,
        'IP地址': deviceMap[item.deviceID]?.ip,
        '设备描述': deviceMap[item.deviceID]?.description,
        '预约日期': item.date,
        '时间段': item.timeSlotName,
        '预约人': item.userName,
        '创建时间': dateFormat(item, 'CreatedAt')
    }))

    const ws = XLSX.utils.json_to_sheet(data)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, '预约记录')
    XLSX.writeFile(wb, `预约记录-${dayjs().format('YYYY-MM-DD')}.xlsx`)
}

const isFutureReservation = (date) => {
    const today = dayjs().startOf('day')
    const reservationDate = dayjs(date)
    return reservationDate.isBefore(today)
}

onMounted(() => {
    searchForm.dateRange = [dayjs().format('YYYY-MM-DD'), dayjs().add(1, 'day').format('YYYY-MM-DD')]
    fetchDevices()
    fetchRecords()
})
</script>

<style scoped>
.card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.title {
    font-size: 16px;
    font-weight: bold;
}

.search-form {
    margin-bottom: 20px;
    padding: 18px;
    border-radius: 4px;
    border: 1px solid var(--el-border-color-light);
    background-color: var(--el-fill-color-blank);
}

.device-option {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 4px 0;
}

.time-slot-info {
    display: flex;
    flex-direction: column;
    gap: 4px;
}

.time-slot-name {
    font-weight: bold;
}

.time-range {
    color: var(--el-text-color-secondary);
    font-size: 13px;
}

.pagination {
    margin-top: 20px;
    display: flex;
    justify-content: flex-end;
}

:deep(.el-button--link) {
    display: inline-flex;
    align-items: center;
    gap: 4px;
}

:deep(.el-form-item) {
    margin-bottom: 0;
    margin-right: 18px;
}

:deep(.el-table) {
    margin-top: 8px;
}
</style>