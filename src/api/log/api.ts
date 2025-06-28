// OpenLog 接口
import request, {ResponseData} from "@/api/request";
import {PageResponse} from "@/api/managers/record";

export interface OpenLog {
    logId: string;
    traceId: string;
    businessType: string;
    operationType: string;
    openDesc: string;
    status: string;
    requestParams: ParamDetail[];
    responseResult: ResponseDetail;
    rawParams: string;
    rawResult: string;
    errorCode: string;
    errorMsg: string;
    methodSignature: string;
    requestUri: string;
    clientIp: string;
    userAgent: string;
    openTime: string; // 格式: "yyyy-MM-dd HH:mm:ss"
    costTime: number;
    operatorId: number;
    operatorName: string;
    operatorDept: string;
    extraInfo: string;
}

export interface operationObj {
    name: string
    code: number
}

// ParamDetail 接口
export interface ParamDetail {
    paramName: string;
    paramType: string;
    paramValue: any;
}

// ResponseDetail 接口
export interface ResponseDetail {
    code: number;
    message: string;
    data: any;
    timestamp: string; // 格式: "yyyy-MM-dd HH:mm:ss"
}

export interface LogParam {
    current: number
    pageSize: number
    businessType?: string
    operationType?: string
    openStatus?: string
    openDesc?: string
    operatorName?: string
    operatorDept?: string
}

export function initLogParam(): LogParam {
    return {
        current: 1,
        pageSize: 10,
        businessType: undefined,
        operationType: undefined,
        openDesc: undefined,
        operatorName: undefined,
        operatorDept: undefined,
    }
}

/*接口函数*/
export function getLogPage(param: LogParam) {
    return request.get<PageResponse<OpenLog>>('/api/auth/log/page', {
        ...param
    })
}

/*业务*/
export function getBusinessType() {
    return request.get<ResponseData<operationObj[]>>('/api/auth/options/business')
}
/*操作*/
export function getOperationType() {
    return request.get<ResponseData<operationObj[]>>('/api/auth/options/operation')
}
/*接口状态*/
export function getOpenStatus() {
    return request.get<ResponseData<operationObj[]>>('/api/auth/options/openStatus')
}
