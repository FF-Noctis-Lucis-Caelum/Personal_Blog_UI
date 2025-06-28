import { RegisterData } from '@/store/modules/user/types'
import type { RouteRecordNormalized } from 'vue-router'
import axios from 'axios'
import request, { ResponseData } from "@/api/request";
export interface LoginData {
    username: string
    password: string
}

export function userCaptcha() {
    return request.get<ResponseData>('/api/auth/verify/captcha')
}

export function login(data: LoginData) {
    return request.post<ResponseData>('/api/auth/user/login', data)
}

export function userRegister(data: RegisterData) {
    const parms = {
        ...data,
    }
    return request.post<ResponseData>('/api/auth/user/register', parms)
}

export function logout(id: number) {
    const params = {
        userId: id,
    }
    return request.post<ResponseData>('/api/auth/user/logout', params)
}

/* 加密用户信息获取 */
export function getUserInfo(userId: number) {
    return request.get<ResponseData>(`/api/auth/user/info?userId=${userId}`)
}

/* 非加密用户信息获取 */
export function getUserInfoAll(userId: number) {
    return request.get<ResponseData>(`/api/auth/user/info/all?userId=${userId}`)
}

export function getMenuList() {
    return axios.post<RouteRecordNormalized[]>('/api/user/menu')
}
