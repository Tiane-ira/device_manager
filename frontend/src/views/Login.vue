<template>
    <div class="login-container">
        <el-card class="login-card">
            <template #header>
                <div class="login-header">
                    <h2>设备预约系统</h2>
                </div>
            </template>

            <el-form ref="formRef" :model="loginForm" :rules="rules" label-width="0" class="login-form">
                <el-form-item prop="username">
                    <el-input v-model="loginForm.username" placeholder="用户名" prefix-icon="User" />
                </el-form-item>
                <el-form-item prop="password">
                    <el-input v-model="loginForm.password" type="password" placeholder="密码" prefix-icon="Lock"
                        show-password />
                </el-form-item>
                <el-form-item>
                    <el-button type="primary" :loading="loading" class="login-button" @click="handleLogin">
                        登录
                    </el-button>
                </el-form-item>
                <div class="register-link">
                    <el-link type="primary" @click="handleRegister">注册账号</el-link>
                </div>
            </el-form>
        </el-card>

        <!-- 注册对话框 -->
        <el-dialog v-model="registerDialogVisible" title="注册账号" width="400px">
            <el-form ref="registerFormRef" :model="registerForm" :rules="registerRules" label-width="80px">
                <el-form-item label="用户名" prop="username">
                    <el-input v-model="registerForm.username" />
                </el-form-item>
                <el-form-item label="密码" prop="password">
                    <el-input v-model="registerForm.password" type="password" show-password />
                </el-form-item>
                <el-form-item label="姓名" prop="name">
                    <el-input v-model="registerForm.name" />
                </el-form-item>
            </el-form>
            <template #footer>
                <el-button @click="registerDialogVisible = false">取消</el-button>
                <el-button type="primary" :loading="registering" @click="submitRegister">
                    注册
                </el-button>
            </template>
        </el-dialog>
    </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { User, Lock } from '@element-plus/icons-vue'
import { userApi } from '@/api'

const router = useRouter()
const route = useRoute()
const loading = ref(false)
const registering = ref(false)
const registerDialogVisible = ref(false)

const loginForm = reactive({
    username: '',
    password: ''
})

const registerForm = reactive({
    username: '',
    password: '',
    name: ''
})

const rules = {
    username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
    password: [{ required: true, message: '请输入密码', trigger: 'blur' }]
}

const registerRules = {
    username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
    password: [{ required: true, message: '请输入密码', trigger: 'blur' }],
    name: [{ required: true, message: '请输入姓名', trigger: 'blur' }]
}

const handleLogin = async () => {
    try {
        loading.value = true
        const data = await userApi.login(loginForm)
        if (data.ID) {
            localStorage.setItem('user', JSON.stringify(data))
            ElMessage.success('登录成功')
            const redirect = route.query.redirect || '/'
            router.push(redirect)
        } else {
            ElMessage.error('登录失败')
        }
    } catch (error) {
        ElMessage.error(error.message || '登录失败')
    } finally {
        loading.value = false
    }
}

const handleRegister = () => {
    registerDialogVisible.value = true
}

const submitRegister = async () => {
    try {
        registering.value = true
        await userApi.register(registerForm)
        ElMessage.success('注册成功')
        registerDialogVisible.value = false

        // 自动填充登录表单
        loginForm.username = registerForm.username
        loginForm.password = registerForm.password

        // 清空注册表单
        registerForm.username = ''
        registerForm.password = ''
        registerForm.name = ''

    } catch (error) {
        ElMessage.error(error.message || '注册失败')
    } finally {
        registering.value = false
    }
}
</script>

<style scoped>
.login-container {
    height: 100vh;
    display: flex;
    justify-content: center;
    align-items: center;
    background-color: #f5f7fa;
}

.login-card {
    width: 400px;
}

.login-header {
    text-align: center;
}

.login-header h2 {
    margin: 0;
    color: var(--el-text-color-primary);
}

.login-form {
    padding: 20px 0;
}

.login-button {
    width: 100%;
}

.register-link {
    text-align: center;
    margin-top: 16px;
}
</style>