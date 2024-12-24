<template>
    <div class="flex flex-col lg:flex-row min-h-screen">
        <!-- 左側資訊區域 - 手機上全寬，桌面上 30% -->
        <div class="lg:w-[30%] bg-gray-100 p-4 lg:p-8 overflow-y-auto order-2 lg:order-1">
            <div class="flex justify-between">
                <router-link to="/2048">
                    <n-image width="150" src="./logo.png" alt="競選Logo" preview-disabled />
                </router-link>
                <n-button color="#fd633c" style="background-color: #fd633c;" class="rounded-lg pr-1 pl-1" @click="handleShare">
                    <n-image width="27" src="./share.png" alt="分享" preview-disabled />
                </n-button>
            </div>
            <n-h1 style="margin:0">
                <n-text type="primary" strong>
                    台灣的選擇，劉訊志
                </n-text>
            </n-h1>
            <n-h2 class="text-lg lg:text-xl mb-4 lg:mb-8" style="margin-top:0">2048世代接棒 志在未來</n-h2>

            <div class="mb:mb-4 lg:mb-8 ">
                <n-avatar round :size="128" src="./avatar.png" alt="劉訊志候選人照片" />
            </div>

            <n-card class="mb-4 lg:mb-8 rounded-lg">
                <template #header>
                    <n-space vertical>
                        <n-text strong>訂閱最新消息</n-text>
                    </n-space>
                </template>
                <div>
                    <n-input v-model:value="email" type="email" placeholder="您的電子郵件" class="rounded-lg" required />
                    &nbsp;
                    <n-button class="rounded-lg" :loading="isSubscribing" type="primary" block @click="handleSubscribe">
                        {{ isSubscribing ? '訂閱中...' : '訂閱' }}
                    </n-button>
                </div>
                <n-text v-if="subscribeMessage" type="success" class="mt-2">
                    {{ subscribeMessage }}
                </n-text>
            </n-card>

            <n-card class="mb-4 lg:mb-8 rounded-lg">
                <template #header>
                    <n-space vertical>
                        <n-text strong>支持劉訊志</n-text>
                        <n-text class="text-center mt-2">
                            目前支持人數：<n-text strong>{{ supporterCount }}</n-text>
                        </n-text>
                    </n-space>
                </template>
                <n-button class="rounded-lg" type="primary" ghost :disabled="isSupported" block @click="handleSupport">
                    {{ isSupported ? '已支持' : '點擊支持' }}
                </n-button>
            </n-card>

            <div class="mb-4 lg:mb-8">
                <n-text type="primary">距離2048年5月20日上任還有</n-text>
                <n-h2 style="margin:0">{{ timeLeft }}</n-h2>
            </div>

            <!-- 社群媒體欄 -->
            <div class="mt-4 lg:mt-8">
                <n-card class="rounded-lg">
                    <div class="flex justify-around">
                        <a href="https://www.facebook.com/liuxunzhi233" target="_blank">
                            <img src="/facebook-icon.png" alt="Facebook" class="w-8 h-8" />
                        </a>
                        <a href="https://page.line.me/696bjtev" target="_blank">
                            <img src="/line-icon.png" alt="LINE" class="w-8 h-8" />
                        </a>
                        <a href="https://xiaozhi.moe" target="_blank">
                            <img src="/xiaozhi-icon.png" alt="Xiaozhi" class="w-8 h-8" />
                        </a>
                    </div>
                </n-card>
            </div>

            <div>
                <div class="flex justify-center pt-12">
                    <a href="https://xiaozhi.moe/privacy/" target="_blank" class="underline">
                        隱私政策
                    </a>
                    <p>&nbsp;｜&nbsp;</p>
                    <a href="https://xiaozhi.moe/terms/" target="_blank" class="underline">
                        使用条款
                    </a>
                </div>
                <div class="flex justify-center">
                    <p>Copyright © 2024 劉訊志.</p>
                </div>
            </div>
        </div>

        <!-- 右側大圖區域 - 手機上全寬，桌面上 70% -->
        <div class="lg:w-[70%] h-[50vh] md:lg:h-screen relative order-1 lg:order-2">
            <img src="/2048.png" alt="劉訊志競選大圖" class="w-full h-full" style="object-fit: contain;" />
        </div>
    </div>
</template>

<script>
    import { ref, onMounted, onUnmounted } from 'vue'


    export default {
        setup() {
            const email = ref('')
            const subscribeMessage = ref('')
            const isSubscribing = ref(false)
            const supporterCount = ref(0)
            const isSupported = ref(false)
            const timeLeft = ref('')

            // 計算倒數時間
            const updateTimeLeft = () => {
                const inauguration = new Date('2048-05-20T00:00:00').getTime()
                const now = new Date().getTime()
                const difference = inauguration - now

                const days = Math.floor(difference / (1000 * 60 * 60 * 24))
                const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
                const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60))
                const seconds = Math.floor((difference % (1000 * 60)) / 1000)

                timeLeft.value = `${days}天 ${hours}小時 ${minutes}分鐘 ${seconds}秒`
            }

            // 獲取初始支持人數
            const fetchSupporterCount = async () => {
                try {
                    const response = await fetch('https://api.xiaozhi.moe/support/count')
                    const data = await response.json()
                    supporterCount.value = data.count
                } catch (error) {
                    console.error('获取支持人数失败:', error)
                }
            }
            // 初始化時立即執行一次
            fetchSupporterCount();
            // 每1分鐘重複執行一次
            setInterval(fetchSupporterCount, 60000);


            // 訂閱處理
            const handleSubscribe = async () => {
                if (!email.value || email.value.trim() === '') {
                    console.error('電子郵件為空，請填寫電子郵件');
                    subscribeMessage.value = '請輸入有效的電子郵件';
                    return;
                }

                isSubscribing.value = true;
                try {
                    console.log('訂閱請求準備發送，email:', email.value);
                    const response = await fetch('https://api.xiaozhi.moe/subscribe', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ email: email.value.trim() }),
                    });

                    console.log('訂閱請求已發送，等待回應...');
                    const result = await response.json();
                    console.log('訂閱回應結果:', result);
                    //message.error('訂閱回應結果:', result)

                    if (response.ok) {
                        //message.success('感謝您的訂閱！')
                        subscribeMessage.value = result.message || '感謝您的訂閱！';
                    } else {
                        //message.error('訂閱回應錯誤:', result.error)
                        console.error('訂閱回應錯誤:', result.error);
                        throw new Error(result.error || '提交失敗，請稍後再試');
                    }
                } catch (error) {
                    console.error('訂閱過程中出現錯誤:', error);
                    subscribeMessage.value = '提交失敗，請稍後再試';
                } finally {
                    isSubscribing.value = false;
                    email.value = '';
                }
            };

            // 支持處理
            const handleSupport = async () => {
                if (!isSupported.value) {
                    try {
                        const response = await fetch('https://api.xiaozhi.moe/support', { method: 'POST' })
                        const result = await response.json()
                        if (response.ok) {
                            supporterCount.value = result.count
                            isSupported.value = true
                            // 保存支持狀態到 localStorage
                            localStorage.setItem('isSupported', 'true');
                        } else {
                            console.error('支持失敗:', result.error)
                        }
                    } catch (error) {
                        console.error('支持失敗:', error.message)
                    }
                }
            }

            const handleShare = async () => {
                const shareData = {
                    title: '2048世代接棒 志在未來｜劉訊志競選網站',
                    text: '眾「志」成城，「訊」勢待發',
                    url: window.location.href, // 当前页面链接
                };

                // 判断是否支持 Web Share API
                if (navigator.share) {
                    try {
                        await navigator.share(shareData);
                        //console.log('內容已分享');
                    } catch (err) {
                        alert('分享失敗:', err);
                        //console.error('分享失敗:', err);
                    }
                } else {
                    // 桌面设备复制链接
                    copyToClipboard(shareData.url);
                    alert('連結已複製');
                }
            };

            const copyToClipboard = (text) => {
                const textarea = document.createElement('textarea');
                textarea.value = text;
                document.body.appendChild(textarea);
                textarea.select();
                document.execCommand('copy');
                document.body.removeChild(textarea);
            };

            onMounted(() => {
                updateTimeLeft()
                fetchSupporterCount()
                const timer = setInterval(updateTimeLeft, 1000)
                onUnmounted(() => clearInterval(timer))

                // 檢查 localStorage 中是否有保存過支持狀態
                const storedSupportStatus = localStorage.getItem('isSupported');
                if (storedSupportStatus === 'true') {
                    isSupported.value = true;  // 已經支持過，更新按鈕狀態
                }
            })

            return {
                email,
                subscribeMessage,
                isSubscribing,
                supporterCount,
                isSupported,
                timeLeft,
                handleSubscribe,
                handleSupport,
                handleShare
            }
        },
    }
</script>

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
