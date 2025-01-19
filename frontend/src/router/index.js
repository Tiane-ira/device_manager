import { createRouter, createWebHistory } from 'vue-router'
import Layout from '../layout/Layout.vue'

const routes = [
    {
        path: '/login',
        name: 'Login',
        component: () => import('../views/Login.vue'),
        meta: {
            title: '登录',
            noAuth: true  // 标记不需要认证的路由
        }
    },
    {
        path: '/',
        component: Layout,
        redirect: '/reservation',
        children: [
            {
                path: '/reservation',
                name: 'Reservation',
                component: () => import('../views/Reservation.vue'),
                meta: {
                    title: '设备预约'
                }
            },
            {
                path: 'device',
                name: 'DeviceManagement',
                component: () => import('../views/DeviceManagement.vue'),
                meta: { title: '设备管理' }
            },
            {
                path: '/timeSlot',
                name: 'TimeSlotManagement',
                component: () => import('../views/TimeSlotManagement.vue'),
                meta: {
                    title: '时间段管理'
                }
            },
            {
                path: '/record',
                name: 'ReservationRecord',
                component: () => import('../views/ReservationRecord.vue'),
                meta: {
                    title: '预约记录'
                }
            }
        ]
    }
]

const router = createRouter({
    history: createWebHistory(),
    routes
})

// 路由守卫
router.beforeEach((to, from, next) => {
    const user = localStorage.getItem('user')

    // 设置页面标题
    document.title = to.meta.title || '设备预约系统'

    // 如果是不需要认证的页面，直接放行
    if (to.meta.noAuth) {
        // 如果已登录且要访问登录页，重定向到首页
        if (user && to.path === '/login') {
            next('/')
        } else {
            next()
        }
        return
    }

    // 需要认证的页面，检查是否已登录
    if (!user) {
        // 保存原本要访问的页面路径
        next({
            path: '/login',
            query: { redirect: to.fullPath }
        })
    } else {
        next()
    }
})

export default router 