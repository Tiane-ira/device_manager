<template>
    <div class="device-management">
        <el-card>
            <template #header>
                <div class="card-header">
                    <span class="title">设备管理</span>
                    <div class="header-operations">
                        <el-button type="primary" @click="handleAdd">
                            <el-icon>
                                <Plus />
                            </el-icon>添加设备
                        </el-button>
                    </div>
                </div>
            </template>

            <!-- 添加搜索表单 -->
            <el-form :inline="true" :model="searchForm" class="search-form">
                <el-form-item label="设备名称">
                    <el-input v-model="searchForm.name" placeholder="请输入设备名称" clearable style="width: 220px;" />
                </el-form-item>
                <el-form-item label="状态">
                    <el-select v-model="searchForm.status" placeholder="请选择状态" clearable multiple style="width: 180px;">
                        <el-option label="可用" value="可用" />
                        <el-option label="维护中" value="维护中" />
                    </el-select>
                </el-form-item>
                <el-form-item>
                    <el-button type="primary" @click="handleSearch">查询</el-button>
                    <el-button @click="resetSearch">重置</el-button>
                </el-form-item>
            </el-form>

            <el-table :data="filteredDeviceList" border stripe>
                <el-table-column prop="name" label="设备名称" min-width="120" />
                <el-table-column prop="ip" label="IP地址" min-width="120" />
                <el-table-column prop="description" label="设备描述" min-width="200" show-overflow-tooltip />
                <el-table-column prop="status" label="状态" width="100" align="center">
                    <template #default="{ row }">
                        <el-tag :type="row.status === '可用' ? 'success' : 'danger'">
                            {{ row.status }}
                        </el-tag>
                    </template>
                </el-table-column>
                <el-table-column label="操作" width="180" align="center" fixed="right">
                    <template #default="{ row }">
                        <el-button type="primary" link @click="handleEdit(row)">
                            <el-icon>
                                <Edit />
                            </el-icon>编辑
                        </el-button>
                        <el-button type="danger" link @click="handleDelete(row)">
                            <el-icon>
                                <Delete />
                            </el-icon>删除
                        </el-button>
                    </template>
                </el-table-column>
            </el-table>
        </el-card>

        <el-dialog v-model="dialogVisible" :title="formType === 'add' ? '添加设备' : '编辑设备'" width="500px" destroy-on-close>
            <el-form ref="formRef" :model="deviceForm" :rules="rules" label-width="100px">
                <el-form-item label="设备名称" prop="name">
                    <el-input v-model="deviceForm.name" placeholder="请输入设备名称" />
                </el-form-item>
                <el-form-item label="IP地址" prop="ip">
                    <el-input v-model="deviceForm.ip" placeholder="请输入IP地址" />
                </el-form-item>
                <el-form-item label="设备描述" prop="description">
                    <el-input v-model="deviceForm.description" type="textarea" :rows="3" placeholder="请输入设备描述" />
                </el-form-item>
                <el-form-item label="状态" prop="status">
                    <el-select v-model="deviceForm.status" placeholder="请选择状态">
                        <el-option label="可用" value="可用" />
                        <el-option label="维护中" value="维护中" />
                    </el-select>
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
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Edit, Delete } from '@element-plus/icons-vue'
import { deviceApi } from '@/api'

const deviceList = ref([])
const dialogVisible = ref(false)
const formType = ref('add')
const formRef = ref(null)

const searchForm = reactive({
    name: '',
    status: [] // 默认选择所有状态
})

const deviceForm = reactive({
    name: '',
    ip: '',
    description: '',
    status: '可用'
})

const rules = {
    name: [{ required: true, message: '请输入设备名称', trigger: 'blur' }],
    ip: [
        { required: true, message: '请输入IP地址', trigger: 'blur' },
        {
            pattern: /^(\d{1,3}\.){3}\d{1,3}$/,
            message: '请输入正确的IP地址格式',
            trigger: 'blur'
        }
    ],
    status: [{ required: true, message: '请选择设备状态', trigger: 'change' }]
}

const handleAdd = () => {
    formType.value = 'add'
    deviceForm.name = ''
    deviceForm.ip = ''
    deviceForm.description = ''
    deviceForm.status = '可用'
    dialogVisible.value = true
}

const handleEdit = (row) => {
    formType.value = 'edit'
    deviceForm.name = row.name
    deviceForm.ip = row.ip
    deviceForm.description = row.description
    deviceForm.status = row.status
    deviceForm.ID = row.ID
    dialogVisible.value = true
}

const handleDelete = (row) => {
    ElMessageBox.confirm('确认删除该设备？', '提示', {
        type: 'warning'
    }).then(async () => {
        try {
            await deviceApi.delete(row.ID)
            ElMessage.success('删除成功')
            fetchDeviceList()
        } catch (error) {
            ElMessage.error('删除失败')
        }
    }).catch(() => {
        // 用户取消删除操作
    })
}

const handleSubmit = async () => {
    try {
        if (formType.value === 'add') {
            await deviceApi.add({
                name: deviceForm.name,
                ip: deviceForm.ip,
                description: deviceForm.description,
                status: deviceForm.status
            })
            ElMessage.success('添加成功')
        } else {
            await deviceApi.update({
                id: deviceForm.ID,
                name: deviceForm.name,
                ip: deviceForm.ip,
                description: deviceForm.description,
                status: deviceForm.status
            })
            ElMessage.success('编辑成功')
        }
        dialogVisible.value = false
        fetchDeviceList()
    } catch (error) {
        console.error('操作失败:', error)
        ElMessage.error(formType.value === 'add' ? '添加失败' : '编辑失败')
    }
}

const handleSearch = () => {
    fetchDeviceList()
}

const resetSearch = () => {
    searchForm.name = ''
    searchForm.status = [] // 重置为全选
    handleSearch()
}

const fetchDeviceList = async () => {
    try {
        const data = await deviceApi.getList()

        // 添加搜索过滤
        deviceList.value = data.filter(device => {
            const nameMatch = !searchForm.name || device.name.includes(searchForm.name)
            const statusMatch = searchForm.status.length === 0 || searchForm.status.includes(device.status)
            return nameMatch && statusMatch
        })
    } catch (error) {
        ElMessage.error('获取设备列表失败')
    }
}

const filteredDeviceList = computed(() => {
    return deviceList.value
})

onMounted(() => {
    fetchDeviceList()
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

.search-form {
    margin-bottom: 20px;
    padding: 18px;
    border-radius: 4px;
    border: 1px solid var(--el-border-color-light);
    background-color: var(--el-fill-color-blank);
}

:deep(.el-table) {
    margin-top: 8px;
}

:deep(.el-button--link) {
    padding: 0 4px;
}

:deep(.el-button--link .el-icon) {
    margin-right: 4px;
}

.search-form :deep(.el-form-item) {
    margin-bottom: 18px;
    margin-right: 18px;
}

.search-form :deep(.el-input),
.search-form :deep(.el-select) {
    width: auto;
}

.search-form :deep(.el-select .el-input) {
    width: 100%;
}
</style>