<template>
    <div class="mb:mb-4 lg:mb-8 ">
        <n-avatar round :size="128" src="./avatar.png" alt="劉訊志候選人照片" />
    </div>
    <br>
    <n-card class="mb-4 lg:mb-8 rounded-lg">
        <template #header>
            <n-space vertical>
                <n-text strong>訂閱最新消息</n-text>
            </n-space>
        </template>
        <div>
            <n-input v-model:value="email" type="email" placeholder="您的電子郵件" class="rounded-lg" required />
            &nbsp;
            <n-button class="rounded-lg py-5" :loading="isSubscribing" type="primary" block @click="handleSubscribe">
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
        <n-button class="rounded-lg py-5" type="primary" ghost :disabled="isSupported" block @click="handleSupport">
            {{ isSupported ? '已支持' : '點擊支持' }}
        </n-button>
    </n-card>

    <n-card class="mb-4 lg:mb-8 rounded-lg">
        <template #header>
            <n-space vertical>
                <n-text strong>小額捐款</n-text>
                <n-text strong>注意：這不是政治獻金</n-text>
            </n-space>
        </template>
        <!-- 捐款按鈕（請確認產品ID與結帳連結正確） -->
        <n-button @click="openCheckout" color="#fd633c" style="background-color: #fd633c;" class="rounded-lg py-5"
            block>
            捐款支持
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
</template>

<script>
    import { ref, onMounted, onUnmounted } from 'vue'
    import { useDialog, useMessage } from 'naive-ui'

    export default {
        setup() {
            const message = useMessage();
            const dialog = useDialog();
            const email = ref('')
            const subscribeMessage = ref('')
            const isSubscribing = ref(false)
            const supporterCount = ref(0)
            const isSupported = ref(false)
            const timeLeft = ref('')
            const checkoutUrl = 'https://mengxiaozhi.lemonsqueezy.com/buy/cbe01b6e-4783-497e-8c1e-27f04986fa2b' // 請替換為實際結帳 URL

            // 支付成功處理
            const handleSuccess = () => {
                dialog.success({
                    title: "感謝你的捐款",
                    content: "每一分捐款都是台灣前進的一步",
                    positiveText: "確認"
                });
            }

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

                    if (response.ok) {
                        subscribeMessage.value = result.message || '感謝您的訂閱！';
                    } else {
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
                            localStorage.setItem('isSupported', 'true');
                        } else {
                            console.error('支持失敗:', result.error)
                        }
                    } catch (error) {
                        console.error('支持失敗:', error.message)
                    }
                }
            }

            // Lemon Squeezy 捐款處理
            const openCheckout = () => {
                LemonSqueezy.Url.Open(checkoutUrl)
            }

            onMounted(() => {
                updateTimeLeft()
                fetchSupporterCount()
                const timer = setInterval(updateTimeLeft, 1000)
                setInterval(fetchSupporterCount, 60000);

                const storedSupportStatus = localStorage.getItem('isSupported');
                if (storedSupportStatus === 'true') {
                    isSupported.value = true;
                }

                // 加載 Lemon Squeezy 腳本
                const script = document.createElement('script')
                script.src = 'https://app.lemonsqueezy.com/js/lemon.js'
                script.onload = () => {
                    window.createLemonSqueezy()
                    LemonSqueezy.Setup({
                        eventHandler: (event) => {
                            if (event.event === 'Checkout.Success') {
                                console.log('支付成功')
                                handleSuccess()
                            }
                        }
                    })
                }
                document.body.appendChild(script)

                onUnmounted(() => clearInterval(timer))
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
                openCheckout
            }
        },
    }
</script>