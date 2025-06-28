import request from "@/api/request";
import {PageResponse} from "@/api/managers/record";

export interface FileData {
    id: number;
    fileName: string;
    fileSize: number;
    fileType: string;
    storagePath: string;
    fileUrl: string;
    previewUrl: string;
    userId: number;
    uploadTime: string;
    status: string;
    tags?: string;
}

export interface FileParam {
    current: number
    pageSize: number
    fileName?: string
    fileType?: string
    status?: string
}

export function initFileParam(): FileParam {
    return {
        current: 1,
        pageSize: 10,
        fileName: undefined,
        fileType: undefined,
        status: undefined,
        userId: undefined,
    }
}

export function getFileData(params: FileParam) {
    return request.get<PageResponse<FileData>>('/api/auth/file/page',{
        ...params
    })
}
