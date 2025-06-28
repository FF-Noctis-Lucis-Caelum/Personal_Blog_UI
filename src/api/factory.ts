/* 工厂类赋值 */

import {
    departmentForm,
    departmentFormModel,
    permissionForm,
    permissionFormModel,
    roleForm,
    roleFormModel,
    userForm,
    userFormModel,
} from '@/api/managers/types'
import useUserStore from '../store/modules/user'
import {
    AInstanceParam,
    ApprovalApproverType,
    ApprovalCategoryQueryResponse, ApprovalInstanceQueryResponse,
    ApprovalNodeType, ApprovalRecordQueryResponse,
    ApprovalTemplateQueryResponse, ARecordParam,
    NodeQueryResponse,
} from '@/api/workflow/types'
import { UserRecord } from '@/api/managers/record'

const useState = useUserStore()
// 用户管理查询体初始化（已修正）
export function initUserModel(): userFormModel {
    return {
        userId: undefined,          // 修正类型为number
        userName: '',
        email: '',
        createTime: [],  // 修正属性名拼写
        status: undefined
    }
}

// 用户表单初始化
export function initUserForm(): userForm {
    return {
        userName: '',
        password: '',
        nickName: '',
        realName: '',
        avatarUrl: '',
        departmentId: 2,
        mobile: '',
        email: '',
        gender: 0,
        position: '全栈',
        status: 1,
        website: '',
        websiteType: 0,
        introduction: '',
    }
}

// 角色管理查询体初始化
export function initRoleModel(): roleFormModel {
    return {
        roleId: undefined,
        roleName: '',
        createTime: [],
        permissions: [],
        isSystem: undefined,
        status: undefined
    }
}

// 角色表单初始化
export function initRoleForm(): roleForm {
    return {
        tenantId: useState.tenantId,
        roleName: '',
        roleCode: '',
        parentId: undefined,
        customDeptIds: [],
        permissions: [],
        isSystem: 0,
        status: 1,
        dataScope: 4
    }
}

// 权限管理查询体初始化
export function initPermissionModel(): permissionFormModel {
    return {
        permId: undefined,
        permKey: '',
        permName: '',
        permType: undefined,
        createTime: [],
        ancestors: ''
    }
}

// 权限表单初始化
export function initPermissionForm(): permissionForm {
    return {
        tenantId: 0,
        permKey: '',
        permName: '',
        permType: 1,
        parentId: undefined
    }
    
}

// 部门管理查询体初始化
export function initDepartmentModel(): departmentFormModel {
    return {
        deptId: undefined,
        deptName: '',
        deptCode: '',
        leaderName: '',
        phone: '',
        email: '',
        status: undefined,
        createTime: []
    }
}

// 部门表单初始化
export function initDepartmentForm(): departmentForm {
    return {
        tenantId: 0,
        parentId: undefined,
        deptName: '',
        deptCode: '',
        leaderUserId: undefined,
        orderNum: undefined,
        phone: '',
        email: '',
        status: 1
    }
}

/* 审批分类初始化 */
export function initACategoryModel(): ApprovalCategoryQueryResponse {
    return {
        id: undefined,
        name: '',
        requiredFields: undefined,
        avatar: '',
        isActive: 1,
        description: undefined,
        createdAt: undefined,
        updatedAt: undefined,
        fields: undefined
    }
}

/* 审批模板初始化 */
export function initWTemplateModel(): ApprovalTemplateQueryResponse {
    return {
        id: undefined,
        categoryId: undefined,
        name: undefined,
        description: undefined,
        version: undefined,
        isActive: 1,
        user: undefined,
        approvalCategory: undefined,
    }
}

/*审批节点初始化*/
export function initWNodeModel(): NodeQueryResponse {
    return {
        id: undefined,
        templateId: undefined,
        nodeName: undefined,
        nodeType: undefined,
        conditionExpression: undefined,
        approverType: undefined,
        approverValue: undefined,
        stepOrder: undefined,
        isFinalStep: 0
    }
}

/*审批实例初始化*/
export function initAInstanceModel(): ApprovalInstanceQueryResponse {
    return {
        id: undefined,
        templateId: undefined,
        categoryId: undefined,
        applicantId: undefined,
        title: undefined,
        startDate: undefined,
        endDate: undefined,
        days: undefined,
        amount: undefined,
        reason: undefined,
        extendData: undefined,
        attachments: undefined,
        currentStep: undefined,
        status: undefined,
        createdAt: undefined,
        updatedAt: undefined,
        approvalCategory: undefined,
        workflowTemplate: undefined,
        userInfo: undefined
    }
}

/*审批实例参数体*/
export function initAInstanceParam(): AInstanceParam {
    return {
        pageNum: 1,
        pageSize: 4,
        title: undefined,
        reason: undefined,
        currentStep: undefined,
        status: undefined,
        createTime: undefined
    }
}

/*审批记录实例化*/
export function initARecordModel(): ApprovalRecordQueryResponse {
    return {
        id: undefined,
        instanceId: undefined,
        nodeId: undefined,
        approverId: undefined,
        result: undefined,
        comment: undefined,
        createdAt: undefined,
        approvalInstance: undefined,
        workflowNode: undefined,
        applyUser: undefined,
        approverUser: undefined,
        department: undefined
    }
}

/*审批记录实例参数体*/
export function initARecordParam(): ARecordParam {
    return {
        pageNum: 1,
        pageSize: 4,
        comment: undefined,
        result: undefined,
        createTime: undefined
    }
}
