<template>
    <div class="flex flex-col lg:flex-row min-h-screen">
        <!-- 左側資訊區域 - 手機上全寬，桌面上 30% -->
        <div class="lg:w-[30%] bg-gray-100 p-4 lg:p-8 overflow-y-auto order-2 lg:order-1">
            <router-link to="/2048">
                <n-image width="150" src="./logo.png" alt="競選Logo" preview-disabled />
            </router-link>
            <n-h1 style="margin:0">
                <n-text type="primary" strong>
                    台灣的選擇，劉訊志
                </n-text>
            </n-h1>
            <n-h2 class="text-lg lg:text-xl mb-4 lg:mb-8" style="margin-top:0">2048世代接棒 志在未來</n-h2>
            <br>
            <n-card class="mb-4 lg:mb-8 rounded-lg">
                <h1>404 沒有找到對應的頁面</h1>
            </n-card>

            <div class="flex justify-center pt-12">
                <a href="https://xiaozhi.moe/privacy/" target="_blank" class="underline">
                    隱私政策
                </a>
                <p>&nbsp;｜&nbsp;</p>
                <a href="https://xiaozhi.moe/terms/" target="_blank" class="underline">
                    使用条款
                </a>
            </div>
        </div>

        <!-- 右側大圖區域 - 手機上全寬，桌面上 70% -->
        <div class="lg:w-[70%] h-[50vh] md:lg:h-screen relative order-1 lg:order-2">
            <img src="/2048.png" alt="劉訊志競選大圖" class="w-full h-full" style="object-fit: contain;" />
        </div>
    </div>
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