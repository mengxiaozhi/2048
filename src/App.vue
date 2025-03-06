<template>
  <n-config-provider :theme-overrides="themeOverrides">
    <div id="app">
      <n-dialog-provider>
        <n-message-provider>
          <div class="flex flex-col lg:flex-row min-h-screen">
            <!-- 左側資訊區域 - 手機上全寬，桌面上 30% -->
            <div class="view lg:w-[30%] bg-gray-100 p-4 lg:p-8 overflow-y-auto order-2 lg:order-1">
                <Vue_header />
                <router-view></router-view>
                <Vue_footer />
            </div>
            <Pic class="pic" />
          </div>
        </n-message-provider>
      </n-dialog-provider>
    </div>
  </n-config-provider>
</template>

<script>
  import { defineComponent, onMounted, watch } from 'vue';
  import { useRoute } from 'vue-router';
  import { NConfigProvider, NMessageProvider, NDialogProvider } from 'naive-ui';
  import Vue_footer from './components/footer.vue';
  import Vue_header from './components/header.vue';
  import Pic from './components/pic.vue';
  import { gsap } from 'gsap';

  const themeOverrides = {
    common: {
      primaryColor: '#35C7C7',
      primaryColorHover: "#2db3b3",
      primaryColorPressed: "#35C7C7",
      primaryColorSuppl: "#35C7C7"
    }
  }

  export default defineComponent({
    components: {
      NConfigProvider,
      NMessageProvider,
      NDialogProvider,
      Vue_footer,
      Vue_header,
      Pic
    },
    setup() {
      const route = useRoute();

      watch(() => route.name, (newName) => {
        document.title = `2048世代接棒 志在未來｜劉訊志競選網站 - ${newName}`;
      }, { immediate: true });

      onMounted(() => {
        const updateTitle = () => {
          document.title = `2048世代接棒 志在未來｜劉訊志競選網站 - ${route.name}`;
        };

        updateTitle();

        // gsap 時間線，控制動畫順序
        const tl = gsap.timeline();

        if (window.innerWidth < 1024) {
          // 手機：y 軸運動
          tl.from('.view', {
            duration: 2,
            opacity: 0,
            y: -50,
            ease: 'power3.out'
          });
        } else {
          // 桌面：x 軸運動
          tl.from('.view', {
            duration: 2,
            opacity: 0,
            x: -50,
            ease: 'power3.out'
          });
        }

        // view 動畫完成後，pic 再開始動畫
        tl.from('.pic', {
          duration: 1.5,
          opacity: 0,
          y: -50,
          ease: 'power3.out'
        },1); // 延遲 0.2 秒開始 pic 動畫
      });
    },
    data() {
      return {
        themeOverrides,
        NMessageProvider
      };
    },
    name: 'App'
  });
</script>

<style></style>
