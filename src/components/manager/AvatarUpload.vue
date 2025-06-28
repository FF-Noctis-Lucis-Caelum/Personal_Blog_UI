<script lang="ts" setup>
import { ref } from 'vue'
import { Message, UploadRequest } from "@arco-design/web-vue";
import { FileItem } from "@arco-design/web-vue/es/upload/interfaces";
import { uploadFile, UploadStrategy } from "@/api/oss";
import { RequestOption   } from '@arco-design/web-vue/es/upload/interfaces';
interface Props {
    modelValue?: string // v-model 绑定值
    strategy?: UploadStrategy // 上传策略
    tip?: string // 提示文字
    sizeLimit?: number // 文件大小限制(MB)
    allowedTypes?: string[] // 允许的文件类型
}

const props = withDefaults(defineProps<Props>(), {
    tip: '点击上传头像',
    sizeLimit: 2,
    allowedTypes: () => ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/bmp'],
})

const emit = defineEmits(['update:modelValue', 'success', 'error'])

const fileList = ref<any[]>([])
const imageUrl = ref(props.modelValue || '')
const uploading = ref(false)
const percent = ref(0)

// 上传前校验
const beforeUpload = (file: File) => {
    const isValidType = props.allowedTypes.includes(file.type)
    const isValidSize = file.size / 1024 / 1024 < props.sizeLimit

    if (!isValidType) {
        Message.error(`仅支持 ${props.allowedTypes.join(', ')} 格式`)
        return false
    }

    if (!isValidSize) {
        Message.error(`文件大小不能超过 ${props.sizeLimit}MB`)
        return false
    }

    uploading.value = true
    return true
}

// 修改后的上传处理函数
const handleUpload = (options: RequestOption) => {
    const controller = new AbortController();
    const file = options.fileItem.file as File;

    // 立即返回符合要求的 UploadRequest 对象
    const requestObj: UploadRequest = {
        abort: () => {
            controller.abort();
            options.onError(new Error('用户取消上传'));
        }
    };

    // 异步操作放在外部执行
    uploadFile(file, props.strategy)
        .then(response => {
            const successResponse = {
                uid: options.fileItem.uid,
                name: file.name,
                url: response.data,
                status: 'done',
                response: response.data
            };
            options.onSuccess(successResponse);
        })
        .catch(error => {
            options.onError(error);
        });

    return requestObj;
};

// 上传成功处理
const handleSuccess = (fileItem: FileItem) => {
    uploading.value = false
    const url = fileItem.response?.url || fileItem.response
    imageUrl.value = url
    emit('update:modelValue', url)
    emit('success', url)
}


// 处理函数参数使用扩展类型
const handleError = (fileItem: FileItem) => {
    uploading.value = false
    const error = fileItem.response?.error || new Error('上传失败')
    const errorMsg = fileItem.response?.message || error.message || '上传失败'
    Message.error(errorMsg)
    emit('error', error)
}

// 暴露清除方法
const clear = () => {
    imageUrl.value = ''
    fileList.value = []
}

defineExpose({ clear })
</script>
<template>
    <a-upload
        :before-upload="beforeUpload"
        :custom-request="handleUpload"
        :file-list="fileList"
        :image-preview="true"
        :show-file-list="false"
        list-type="picture-card"
        @error="handleError"
        @success="handleSuccess"
    >
        <template #upload-button>
            <div class="avatar-uploader">
                <div v-if="imageUrl" class="avatar-preview">
                    <img :src="imageUrl" alt="avatar" />
                    <div class="mask">
                        <icon-edit />
                    </div>
                    <a-progress v-if="uploading" :percent="percent" class="progress" size="mini" />
                </div>
                <div v-else class="upload-trigger">
                    <icon-plus />
                    <div class="tip-text">{{ tip }}</div>
                </div>
            </div>
        </template>
    </a-upload>
</template>

<style lang="scss" scoped>
.avatar-uploader {
    width: 100px;
    height: 100px;
    cursor: pointer;

    .avatar-preview {
        position: relative;
        width: 100%;
        height: 100%;
        overflow: hidden;
        border: 1px dashed var(--color-border-2);

        img {
            width: 100%;
            height: 100%;
            object-fit: cover;
        }

        .mask {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.5);
            opacity: 0;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            transition: opacity 0.3s;
        }

        &:hover .mask {
            opacity: 1;
        }
    }

    .upload-trigger {
        width: 100%;
        height: 100%;
        border: 1px dashed var(--color-border-2);
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        color: var(--color-text-3);
        transition: border-color 0.3s;

        &:hover {
            border-color: rgb(var(--primary-6));
        }

        .tip-text {
            font-size: 12px;
            margin-top: 8px;
        }
    }

    .progress {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        z-index: 2;
    }
}
</style>
