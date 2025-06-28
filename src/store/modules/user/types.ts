export type RoleType = '' | '*' | 'admin' | 'user'

export interface UserState {
    userId?: number
    tenantId?: number
    userName?: string
    nickName?: string
    hobby?: string
    realName?: string
    avatarUrl?: string
    mobileMasked?: string
    emailMasked?: string
    position?: string
    deptName?: string
    introduction?: string
    website?: string
    websiteType?: number,
    locationName?: string
    createTime?: string
    accountStatus?: number  // 根据后端字段重命名
    area?: string,
    isAdmin?: number
    role: RoleType

    // 新增字段
    roles?: Role[]
    deptList?: Dept[]
    permissions?: Permission[]
}

// 新增类型定义
export interface Role {
    roleId: number
    roleName: string
    roleCode: string
    permissions: string[]
    dataScope: number
    isSystem: boolean
    children: Role[]
    createTime: string
}

export interface Permission {
    permId: number
    permKey: string
    permName: string
    permType: number
    children: Permission[]
    isLeaf: boolean
    createTime: string
}

export interface Dept {
    deptId: number
    deptCode: string
    deptName: string
    leaderName: string
    phone: string
    status: string
    createTime: string
    children: Dept[]
}

export interface CaptchaType {
    key: string
    image: string
}

export interface RegisterData {
    username: string
    email: string
    password: string
    captcha: string
    captchaKey: string
}

// 后端MyBatisPlus的IPage返回对象
export interface IPage<T> {
    records: T[]
    total: number
    size: number
    current: number
    pages: number
}
