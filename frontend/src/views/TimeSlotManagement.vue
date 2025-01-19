<template>
    <div class="time-slot-management">
        <el-card>
            <template #header>
                <div class="card-header">
                    <span class="title">时间段管理</span>
                    <div class="header-operations">
                        <el-button type="primary" @click="handleAdd">
                            <el-icon>
                                <Plus />
                            </el-icon>添加时间段
                        </el-button>
                    </div>
                </div>
            </template>

            <el-table :data="timeSlotList" border>
                <el-table-column prop="name" label="时间段名称" />
                <el-table-column label="开始时间">
                    <template #default="{ row }">
                        {{ row.startTime }}
                    </template>
                </el-table-column>
                <el-table-column label="结束时间">
                    <template #default="{ row }">
                        {{ row.endTime }}
                    </template>
                </el-table-column>
                <el-table-column label="操作" width="200">
                    <template #default="{ row }">
                        <el-button type="primary" link @click="handleEdit(row)">编辑</el-button>
                        <el-button type="danger" link @click="handleDelete(row)">删除</el-button>
                    </template>
                </el-table-column>
            </el-table>
        </el-card>

        <el-dialog v-model="dialogVisible" :title="formType === 'add' ? '添加时间段' : '编辑时间段'" width="500px">
            <el-form ref="formRef" :model="timeSlotForm" :rules="rules" label-width="100px">
                <el-form-item label="时间段名称" prop="name">
                    <el-input v-model="timeSlotForm.name" />
                </el-form-item>
                <el-form-item label="时间范围" prop="timeRange">
                    <el-time-picker v-model="timeSlotForm.timeRange" is-range range-separator="至"
                        start-placeholder="开始时间" end-placeholder="结束时间" format="HH:mm" />
                </el-form-item>
            </el-form>
            <template #footer>
                <el-button @click="dialogVisible = false">取消</el-button>
                <el-button type="primary" @click="handleSubmit">确定</el-button>
            </template>
        </el-dialog>
    </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import { timeSlotApi } from '@/api'
import dayjs from 'dayjs'

const timeSlotList = ref([])
const dialogVisible = ref(false)
const formType = ref('add')
const timeSlotForm = reactive({
    name: '',
    timeRange: []
})

const rules = {
    name: [{ required: true, message: '请输入时间段名称', trigger: 'blur' }],
    timeRange: [{ required: true, message: '请选择时间范围', trigger: 'change' }]
}

// 获取时间段列表
const fetchTimeSlotList = async () => {
    try {
        const data = await timeSlotApi.getList()
        console.log(data);
        // 不需要对时间进行格式化，直接使用数据库中的格式
        timeSlotList.value = data
    } catch (error) {
        ElMessage.error('获取时间段列表失败')
    }
}

const handleAdd = () => {
    formType.value = 'add'
    timeSlotForm.name = ''
    timeSlotForm.timeRange = []
    dialogVisible.value = true
}

const handleEdit = (row) => {
    formType.value = 'edit'
    timeSlotForm.name = row.name
    // 创建完整的日期时间对象
    const today = dayjs().format('YYYY-MM-DD')
    timeSlotForm.timeRange = [
        dayjs(`${today} ${row.startTime}`),
        dayjs(`${today} ${row.endTime}`)
    ]
    timeSlotForm.ID = row.ID
    dialogVisible.value = true
}

const handleDelete = (row) => {
    ElMessageBox.confirm('确认删除该时间段？', '提示', {
        type: 'warning'
    }).then(async () => {
        try {
            await timeSlotApi.delete(row.ID)
            ElMessage.success('删除成功')
            fetchTimeSlotList()
        } catch (error) {
            ElMessage.error('删除失败')
        }
    })
}

const handleSubmit = async () => {
    try {
        // 验证时间范围是否存在
        if (!timeSlotForm.timeRange || timeSlotForm.timeRange.length !== 2) {
            ElMessage.error('请选择完整的时间范围')
            return
        }

        const data = {
            name: timeSlotForm.name,
            // 使用 dayjs 格式化时间，确保只取时间部分
            startTime: timeSlotForm.timeRange[0] ? dayjs(timeSlotForm.timeRange[0]).format('HH:mm') : '',
            endTime: timeSlotForm.timeRange[1] ? dayjs(timeSlotForm.timeRange[1]).format('HH:mm') : ''
        }

        // 验证时间是否有效
        if (!data.startTime || !data.endTime) {
            ElMessage.error('时间格式无效')
            return
        }

        if (formType.value === 'edit') {
            data.ID = timeSlotForm.ID
            await timeSlotApi.update(data)
            ElMessage.success('编辑成功')
        } else {
            await timeSlotApi.add(data)
            ElMessage.success('添加成功')
        }

        dialogVisible.value = false
        fetchTimeSlotList()
    } catch (error) {
        console.error('操作失败:', error)
        ElMessage.error(formType.value === 'add' ? '添加失败' : '编辑失败')
    }
}

onMounted(() => {
    fetchTimeSlotList()
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

.header-operations {
    display: flex;
    gap: 12px;
}

.header-operations .el-button {
    display: flex;
    align-items: center;
}

.header-operations .el-icon {
    margin-right: 4px;
}
</style>