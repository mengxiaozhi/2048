// src/stores/auth.js
import { defineStore } from 'pinia'

export const useAuthStore = defineStore('auth', {
    state: () => ({
        user: null, // 初始用戶狀態為 null
        token: localStorage.getItem('token') || null // 儲存 token
    }),
    getters: {
        isAuthenticated: (state) => !!state.token, // 是否已登入
        getUser: (state) => state.user
    },
    actions: {
        login(userData, token) {
            this.user = userData
            this.token = token
            localStorage.setItem('token', token) // 儲存 token
        },
        logout() {
            this.user = null
            this.token = null
            localStorage.removeItem('token') // 清除 token
        },
        setUser(userData) {
            this.user = userData
        }
    }
})
