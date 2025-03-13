<script>
    import { onMounted, ref } from 'vue'
    import { useRoute } from 'vue-router'


    export default {
        setup() {
            const route = useRoute();
            const token = route.query.token;

            const confirm_messages = ref(" ");

            // 驗證Token
            const confirm_token = async () => {
                try {
                    const response = await fetch(`https://api.xiaozhi.moe/confirm?token=${token}`)
                    const data = await response.json()
                    confirm_messages.value = data.message || data.error;
                } catch (error) {
                    console.error('確認訂閱失敗:', error)
                    confirm_messages.value = '伺服器錯誤，無法確認訂閱';
                }
            }

            onMounted(() => {
                confirm_token()
            })

            return {
                confirm_messages
            }
        }
    }
</script>
<template>
    <n-card class="mb-4 lg:mb-8 rounded-lg">
        <h1>{{ confirm_messages }}</h1>
    </n-card>
</template>