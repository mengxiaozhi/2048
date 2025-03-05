<script>
    import { ref } from 'vue';

    export default {
        setup() {
            const email = ref('');
            const isSubscribing = ref(false);
            const subscribeMessage = ref('');

            const handleSubscribe = async () => {
                if (!email.value) {
                    alert("請輸入您的電子郵件");
                    return;
                }

                isSubscribing.value = true; // 顯示加載狀態
                try {
                    const response = await fetch('https://api.xiaozhi.moe/unsubscribe', { // 後端的 API 地址
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({ email: email.value }), // 發送的資料
                    });

                    if (response.ok) {
                        const data = await response.json();
                        subscribeMessage.value = data.message; // 更新成功信息
                    } else {
                        const errorData = await response.json();
                        alert(errorData.message); // 顯示錯誤信息
                    }
                } catch (error) {
                    alert('發生錯誤，請稍後再試。');
                } finally {
                    isSubscribing.value = false; // 關閉加載狀態
                }
            };

            return {
                email,
                isSubscribing,
                subscribeMessage,
                handleSubscribe,
            };
        },
    };
</script>
<template>
    <n-card class="mb-4 lg:mb-8 rounded-lg">
        <template #header>
            <n-space vertical>
                <n-text strong>退訂最新消息</n-text>
            </n-space>
        </template>
        <div>
            <n-input v-model:value="email" type="email" placeholder="您的電子郵件" class="rounded-lg" required />
            &nbsp;
            <n-button class="py-5 rounded-lg" :loading="isSubscribing" type="primary" block @click="handleSubscribe">
                {{ isSubscribing ? '訂閱中...' : '確定退訂' }}
            </n-button>
        </div>
        <n-text v-if="subscribeMessage" type="success" class="mt-2">
            {{ subscribeMessage }}
        </n-text>
    </n-card>
</template>
<style scoped>
    .flex {
        display: flex;
    }

    .min-h-screen {
        min-height: 100vh;
    }

    .w-full {
        width: 100%;
    }

    .lg\:w-[30%] {
        width: 30%;
    }

    .lg\:w-[70%] {
        width: 70%;
    }

    .h-[50vh] {
        height: 50vh;
    }

    .lg\:h-screen {
        height: 100vh;
    }

    .overflow-y-auto {
        overflow-y: auto;
    }
</style>