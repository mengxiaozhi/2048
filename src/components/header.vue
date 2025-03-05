<template>
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
</template>

<script>
    export default {
        setup() {
            const handleShare = async () => {
                const shareData = {
                    title: '2048世代接棒 志在未來｜劉訊志競選網站',
                    text: '眾「志」成城，「訊」勢待發',
                    url: window.location.href,
                };

                if (navigator.share) {
                    try {
                        await navigator.share(shareData);
                    } catch (err) {
                        alert('分享失敗:', err);
                    }
                } else {
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

            return {
                handleShare
            }
        }
    }
</script>