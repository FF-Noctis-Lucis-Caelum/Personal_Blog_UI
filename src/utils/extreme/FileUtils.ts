import * as XLSX from 'xlsx';
import { Message } from '@arco-design/web-vue';
import { UserAddDTO } from '@/api/managers/types'

// 文件类型枚举
export enum FileType {
    TXT = 'txt',
    EXCEL = 'excel',
    UNKNOWN = 'unknown'
}

// 解析结果接口
export interface ParseResult<T> {
    success: boolean;
    data?: T[];
    errors?: string[];
}

// 文件工具类
export class FileUtils {
    // 检测文件类型
    static detectFileType(fileName: string): FileType {
        if (fileName.endsWith('.txt')) return FileType.TXT;
        if (fileName.match(/\.xls(x?)$/)) return FileType.EXCEL;
        return FileType.UNKNOWN;
    }

    // 解析文件内容
    static parseFile(content: string | ArrayBuffer, fileType: FileType): ParseResult<UserAddDTO> {
        try {
            switch (fileType) {
                case FileType.TXT:
                    return this.parseTxt(content as string);
                case FileType.EXCEL:
                    return this.parseExcel(content as ArrayBuffer);
                default:
                    return { success: false, errors: ['不支持的文件类型'] };
            }
        } catch (error: any) {
            return { success: false, errors: [error.message || '文件解析失败'] };
        }
    }

    // 解析 TXT 文件（JSON 格式）
    private static parseTxt(content: string): ParseResult<UserAddDTO> {
        try {
            const dataList = JSON.parse(content) as UserAddDTO[];
            const { validData, errors } = this.validateUserData(dataList);

            return {
                success: errors.length === 0,
                data: validData,
                errors: errors.length > 0 ? errors : undefined
            };
        } catch (error) {
            return { success: false, errors: ['TXT 文件格式错误，请确保为 JSON 数组'] };
        }
    }

    // 解析 Excel 文件
    private static parseExcel(content: ArrayBuffer): ParseResult<UserAddDTO> {
        try {
            const workbook = XLSX.read(content, { type: 'array' });
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];
            const dataList = XLSX.utils.sheet_to_json(worksheet) as UserAddDTO[];

            // 转换数值类型
            dataList.forEach(item => {
                item.status = Number(item.status) as 0 | 1 | 2;
                item.websiteType = Number(item.websiteType);
                item.departmentId = Number(item.departmentId);
                item.gender = Number(item.gender);
            });

            const { validData, errors } = this.validateUserData(dataList);

            return {
                success: errors.length === 0,
                data: validData,
                errors: errors.length > 0 ? errors : undefined
            };
        } catch (error) {
            return { success: false, errors: ['Excel 文件解析失败，请检查格式'] };
        }
    }

    // 校验用户数据
    private static validateUserData(dataList: UserAddDTO[]) {
        const validData: UserAddDTO[] = [];
        const errors: string[] = [];

        dataList.forEach((item, index) => {
            const rowErrors: string[] = [];

            // 校验必填字段
            if (!item.userName) rowErrors.push(`用户名不能为空`);
            if (!item.password) rowErrors.push(`密码不能为空`);
            if (!item.mobile || !/^1[3-9]\d{9}$/.test(item.mobile))
                rowErrors.push(`手机号格式错误`);
            if (!item.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(item.email))
                rowErrors.push(`邮箱格式错误`);
            if (!item.avatarUrl || !/^https?:\/\//.test(item.avatarUrl))
                rowErrors.push(`头像 URL 格式错误`);
            if (item.departmentId === undefined || item.departmentId <= 0)
                rowErrors.push(`机构 ID 不能为空`);
            if (item.status === undefined || ![0, 1, 2].includes(item.status))
                rowErrors.push(`状态值必须为 0、1、2`);

            if (rowErrors.length > 0) {
                errors.push(`第 ${index + 1} 行：${rowErrors.join('，')}`);
            } else {
                validData.push(item);
            }
        });

        return { validData, errors };
    }

    // 异步读取文件内容
    static readFileAsync(file: File): Promise<string | ArrayBuffer> {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();

            reader.onload = (event) => {
                const content = event.target?.result;
                if (content) resolve(content);
                else reject(new Error('读取文件内容失败'));
            };

            reader.onerror = () => reject(new Error('读取文件失败'));

            // 根据文件类型选择读取方式
            const fileType = this.detectFileType(file.name);
            if (fileType === FileType.TXT) {
                reader.readAsText(file, 'UTF-8');
            } else {
                reader.readAsArrayBuffer(file);
            }
        });
    }

    // 显示错误信息
    static showErrors(errors: string[]) {
        if (errors.length <= 5) {
            Message.error(errors.join('\n'));
        } else {
            Message.error(`发现 ${errors.length} 个错误，显示前5个：\n${errors.slice(0, 5).join('\n')}`);
        }
    }
}
