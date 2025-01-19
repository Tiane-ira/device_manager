import { dbOperation } from '../db'

export const userService = {
    async login(username, password) {
        const users = await dbOperation('users', 'readonly', (store) => {
            const index = store.index('username')
            return index.getAll(username)
        })

        const user = users[0]
        if (!user || user.password !== password) {
            throw new Error('用户名或密码错误')
        }

        // 返回用户信息（不包含密码）
        const { password: _, ...userInfo } = user
        return userInfo
    },

    async register(userData) {
        // 检查用户名是否已存在
        const existingUsers = await dbOperation('users', 'readonly', (store) => {
            const index = store.index('username')
            return index.getAll(userData.username)
        })

        if (existingUsers.length > 0) {
            throw new Error('用户名已存在')
        }

        return dbOperation('users', 'readwrite', (store) =>
            store.add({
                ...userData,
                role: 'user'  // 默认角色为普通用户
            })
        )
    }
} 