<template>
    <el-container class="layout-container">
        <el-header>
            <div class="header-content">
                <h2 class="system-title">设备预约系统</h2>
                <div class="user-info">
                    <el-dropdown @command="handleCommand" trigger="click">
                        <div class="user-dropdown">
                            <el-avatar :size="32" class="user-avatar">
                                {{ userInfo.name?.[0]?.toUpperCase() }}
                            </el-avatar>
                            <span class="user-name">{{ userInfo.name }}</span>
                            <el-icon class="dropdown-icon">
                                <CaretBottom />
                            </el-icon>
                        </div>
                        <template #dropdown>
                            <el-dropdown-menu>
                                <el-dropdown-item>
                                    <el-icon>
                                        <User />
                                    </el-icon>
                                    <span>{{ userInfo.username }}</span>
                                </el-dropdown-item>
                                <el-dropdown-item divided command="logout">
                                    <el-icon>
                                        <SwitchButton />
                                    </el-icon>
                                    <span>退出登录</span>
                                </el-dropdown-item>
                            </el-dropdown-menu>
                        </template>
                    </el-dropdown>
                </div>
            </div>
        </el-header>
        <el-container>
            <el-aside width="200px">
                <el-menu :router="true" :default-active="currentPath" class="menu">
                    <el-menu-item index="/reservation">
                        <el-icon>
                            <Calendar />
                        </el-icon>
                        <span>设备预约</span>
                    </el-menu-item>
                    <el-menu-item index="/device">
                        <el-icon>
                            <Monitor />
                        </el-icon>
                        <span>设备管理</span>
                    </el-menu-item>
                    <el-menu-item index="/timeSlot">
                        <el-icon>
                            <Timer />
                        </el-icon>
                        <span>时间段管理</span>
                    </el-menu-item>
                    <el-menu-item index="/record">
                        <el-icon>
                            <Document />
                        </el-icon>
                        <span>预约记录</span>
                    </el-menu-item>
                </el-menu>
            </el-aside>
            <el-main>
                <router-view />
            </el-main>
        </el-container>
    </el-container>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessageBox } from 'element-plus'
import { Monitor, Timer, Calendar, Document, CaretBottom, User, SwitchButton } from '@element-plus/icons-vue'

const router = useRouter()
const route = useRoute()
const userInfo = ref({})

const currentPath = computed(() => route.path)

onMounted(() => {
    const userStr = localStorage.getItem('user')
    if (userStr) {
        userInfo.value = JSON.parse(userStr)
    }
})

const handleCommand = (command) => {
    if (command === 'logout') {
        ElMessageBox.confirm('确认退出登录？', '提示', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
        }).then(() => {
            localStorage.removeItem('user')
            router.push('/login')
            ElMessage.success('已退出登录')
        })
    }
}
</script>

<style scoped>
.layout-container {
    height: 100vh;
}

.el-header {
    background-color: white;
    border-bottom: 1px solid var(--el-border-color-light);
    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.05);
    padding: 0 16px;
}

.header-content {
    height: 60px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0 16px;
}

.system-title {
    margin: 0;
    font-size: 18px;
    color: var(--el-text-color-primary);
}

.user-info {
    display: flex;
    align-items: center;
}

.user-dropdown {
    display: flex;
    align-items: center;
    gap: 8px;
    cursor: pointer;
    padding: 2px 8px;
    border-radius: 4px;
    transition: background-color 0.3s;
}

.user-dropdown:hover {
    background-color: var(--el-fill-color-light);
}

.user-avatar {
    background-color: var(--el-color-primary);
    color: white;
    font-weight: bold;
}

.user-name {
    font-size: 14px;
    color: var(--el-text-color-primary);
}

.dropdown-icon {
    color: var(--el-text-color-secondary);
    font-size: 12px;
}

:deep(.el-dropdown-menu__item) {
    display: flex;
    align-items: center;
    gap: 8px;
}

:deep(.el-dropdown-menu__item .el-icon) {
    margin-right: 4px;
}

.menu {
    height: 100%;
    border-right: none;
}

.el-aside {
    background-color: #304156;
    border-right: solid 1px var(--el-border-color);
}

.el-menu {
    border-right: none;
}
</style>