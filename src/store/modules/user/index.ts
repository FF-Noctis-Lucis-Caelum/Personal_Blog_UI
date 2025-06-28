import {
    getUserInfo,
    login as userLogin,
    LoginData,
    logout as userLogout,
    userCaptcha,
    userRegister,
} from '@/api/user'
import { clearID, clearToken, getID, setToken } from "@/utils/auth";
import { removeRouteListener } from '@/utils/route-listener'
import { defineStore } from 'pinia'
import useAppStore from '../app'
import { RegisterData, UserState } from './types'
import { useStorage } from '@vueuse/core'
import { decrypt } from '@/utils/crypto'
import { formatTimestamps } from '@/utils/cutil'

const useUserStore = defineStore('user', {
    state: (): UserState => ({
        userId: undefined,
        tenantId: undefined,
        userName: undefined,
        nickName: undefined,
        realName: undefined,
        hobby: undefined,
        avatarUrl: undefined,
        mobileMasked: undefined,
        emailMasked: undefined,
        position: undefined,
        deptName: undefined,
        introduction: undefined,
        website: undefined,
        websiteType: undefined,
        locationName: undefined,
        createTime: undefined,
        accountStatus: undefined,  // 替换原来的status
        area: undefined,
        isAdmin: undefined,
        role: '',

        // 新增状态
        roles: undefined,
        deptList: undefined,
        permissions: undefined
    }),


    getters: {
        userInfo(state: UserState): UserState {
            return { ...state }
        },

        checkInfo(): boolean {
            return !!this.userName
        }
    },

    actions: {
        // 获取验证码
        async getCaptcha() {
            try {
                const result = await userCaptcha()
                return {
                    key: result.data.key,
                    image: result.data.image
                }
            } catch (error) {
                throw new Error('Failed to fetch captcha')
            }
        },
        switchRoles() {
            return new Promise((resolve) => {
                this.role = this.role === 'user' ? 'admin' : 'user'
                resolve(this.role)
            })
        },
        // Set user's information
        setInfo(partial: Partial<UserState>) {
            this.$patch(partial)
        },

        setUserId(id: number) {
            this.userId = id
        },

        // Reset user's information
        resetInfo() {
            this.$reset()
        },

        // Get user's information
        async info() {
            const res = await getUserInfo(Number.parseInt(<string>getID()))
            const result = await decrypt(res.data)
            const resultData = formatTimestamps(result.data)
            console.log(resultData)
            this.setInfo({
                ...resultData,
                role: resultData.isAdmin === 1 ? 'admin' : 'user'
            })
        },

        // Login
        async login(loginForm: LoginData) {
            try {
                const res = await userLogin(loginForm)
                setToken(res.data.token)
                return res
            } catch (err) {
                clearToken()
                throw err
            }
        },
        // 注册方法增强
        async register(payload: RegisterData) {
            const { data } = await userRegister(payload)

            // 清理验证码缓存
            useStorage(`captcha-${payload.captchaKey}`, null)

            return data

        },
        logoutCallBack() {
            const appStore = useAppStore()
            this.resetInfo()
            clearToken()
            clearID()
            removeRouteListener()
            appStore.clearServerMenu()
        },
        // Logout
        async logout() {
            try {
                await userLogout(Number.parseInt(<string>getID()))
            } finally {
                this.logoutCallBack()
            }
        },
    },
})

export default useUserStore
