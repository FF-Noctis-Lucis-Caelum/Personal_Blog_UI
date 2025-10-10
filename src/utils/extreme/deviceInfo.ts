/**
 * 获取浏览器名称和版本信息
 * @returns 浏览器信息字符串（如 "Chrome 112.0.5615"）
 */
export function getBrowserInfo(): string {
    const userAgent = navigator.userAgent;
    const appVersion = navigator.appVersion;

    // 检测Chrome
    if (userAgent.includes('Chrome') && !userAgent.includes('Edge')) {
        const versionMatch = userAgent.match(/Chrome\/(\d+\.\d+)/);
        return versionMatch ? `Chrome ${versionMatch[1]}` : 'Chrome';
    }

    // 检测Edge
    if (userAgent.includes('Edge') || userAgent.includes('Edg')) {
        const versionMatch = userAgent.match(/Edg\/(\d+\.\d+)/);
        return versionMatch ? `Edge ${versionMatch[1]}` : 'Edge';
    }

    // 检测Firefox
    if (userAgent.includes('Firefox')) {
        const versionMatch = userAgent.match(/Firefox\/(\d+\.\d+)/);
        return versionMatch ? `Firefox ${versionMatch[1]}` : 'Firefox';
    }

    // 检测Safari (排除Chrome和Edge，因为它们的UA也包含Safari)
    if (userAgent.includes('Safari') && !userAgent.includes('Chrome') && !userAgent.includes('Edge')) {
        const versionMatch = userAgent.match(/Version\/(\d+\.\d+)/);
        return versionMatch ? `Safari ${versionMatch[1]}` : 'Safari';
    }

    // 检测IE
    if (userAgent.includes('MSIE') || userAgent.includes('Trident/')) {
        if (userAgent.includes('MSIE')) {
            const versionMatch = userAgent.match(/MSIE (\d+\.\d+)/);
            return versionMatch ? `IE ${versionMatch[1]}` : 'IE';
        } else {
            return 'IE 11'; // IE11不包含MSIE标识
        }
    }

    // 无法识别的浏览器
    return `Unknown (${appVersion.substring(0, 30)}...)`;
}

/**
 * 获取操作系统信息
 * @returns 操作系统信息字符串（如 "Windows 10"、"macOS 12"）
 */
export function getOSInfo(): string {
    const userAgent = navigator.userAgent;
    const platform = navigator.platform;

    // 检测Windows
    if (platform.includes('Win')) {
        if (userAgent.includes('Windows NT 10.0')) return 'Windows 10';
        if (userAgent.includes('Windows NT 6.3')) return 'Windows 8.1';
        if (userAgent.includes('Windows NT 6.2')) return 'Windows 8';
        if (userAgent.includes('Windows NT 6.1')) return 'Windows 7';
        if (userAgent.includes('Windows NT 6.0')) return 'Windows Vista';
        if (userAgent.includes('Windows NT 5.1')) return 'Windows XP';
        return 'Windows';
    }

    // 检测macOS
    if (platform.includes('Mac')) {
        // 尝试提取macOS版本
        const versionMatch = userAgent.match(/Mac OS X (\d+_\d+)/);
        if (versionMatch) {
            const version = versionMatch[1].replace('_', '.');
            // 简单的版本映射（实际可能更复杂）
            const versionMap: Record<string, string> = {
                '10.15': 'Catalina',
                '11': 'Big Sur',
                '12': 'Monterey',
                '13': 'Ventura',
                '14': 'Sonoma',
                '15': 'Sequoia'
            };
            const versionName = versionMap[version] || '';
            return versionName ? `macOS ${version} (${versionName})` : `macOS ${version}`;
        }
        return 'macOS';
    }

    // 检测Linux
    if (platform.includes('Linux')) {
        if (userAgent.includes('Android')) {
            // 安卓设备
            const versionMatch = userAgent.match(/Android (\d+\.\d+)/);
            return versionMatch ? `Android ${versionMatch[1]}` : 'Android';
        }
        return 'Linux';
    }

    // 检测iOS
    if (platform.includes('iPhone') || platform.includes('iPad') || platform.includes('iPod')) {
        const versionMatch = userAgent.match(/iPhone OS (\d+_\d+)/) ||
            userAgent.match(/iPad; CPU OS (\d+_\d+)/);
        if (versionMatch) {
            const version = versionMatch[1].replace('_', '.');
            return `${platform} iOS ${version}`;
        }
        return platform;
    }

    // 无法识别的操作系统
    return `Unknown (${platform})`;
}

/**
 * 获取设备类型（移动设备/桌面设备）
 * @returns 设备类型字符串
 */
export function getDeviceType(): 'mobile' | 'desktop' | 'tablet' | 'unknown' {
    const userAgent = navigator.userAgent;

    // 检测移动设备
    if (/iPhone|iPod|Android|webOS|BlackBerry|IEMobile|Opera Mini/i.test(userAgent)) {
        // 检测平板设备
        if (/iPad|Tablet|Android(?!.*Mobile)/i.test(userAgent)) {
            return 'tablet';
        }
        return 'mobile';
    }

    // 桌面设备
    if (/Windows|Macintosh|Linux/i.test(navigator.platform)) {
        return 'desktop';
    }

    return 'unknown';
}

/**
 * 获取屏幕分辨率信息
 * @returns 分辨率字符串（如 "1920x1080"）
 */
export function getScreenResolution(): string {
    return `${window.screen.width}x${window.screen.height}`;
}

/**
 * 获取完整的设备信息摘要
 * @returns 包含各类设备信息的对象
 */
export function getDeviceSummary() {
    return {
        browser: getBrowserInfo(),
        os: getOSInfo(),
        deviceType: getDeviceType(),
        resolution: getScreenResolution(),
        language: navigator.language,
        userAgent: navigator.userAgent.substring(0, 200), // 限制长度
        platform: navigator.platform
    };
}
