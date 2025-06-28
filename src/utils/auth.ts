const TOKEN_KEY = 'token'
const USER_ID_KEY = 'userId'
const isLogin = () => {
    return !!localStorage.getItem(TOKEN_KEY)
}

const getToken = () => {
    return localStorage.getItem(TOKEN_KEY)
}

const getID = (): string | null => {
    return localStorage.getItem(USER_ID_KEY)
}

const setID = (id: number) => {
    localStorage.setItem(USER_ID_KEY, String(id))
}

const setToken = (token: string) => {
    localStorage.setItem(TOKEN_KEY, token)
}

const setUserInfo = (userInfo: Object) => {
    localStorage.setItem('userInfo', JSON.stringify(userInfo))
}

const clearToken = () => {
    localStorage.removeItem(TOKEN_KEY)
}

const clearID = () => {
    localStorage.removeItem(USER_ID_KEY)
}

export { clearToken, getToken, isLogin, setToken, setUserInfo, getID, setID, clearID }
