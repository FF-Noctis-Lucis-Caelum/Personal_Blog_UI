
export class PermissionError extends Error {
    constructor(message = '无操作权限') {
        super(message)
        this.name = 'PermissionError'
    }
}
