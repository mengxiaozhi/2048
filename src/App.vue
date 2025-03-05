<template>
  <n-config-provider :theme-overrides="themeOverrides">
    <div id="app">
      <n-dialog-provider>
        <n-message-provider>
          <div class="flex flex-col lg:flex-row min-h-screen">
            <!-- 左側資訊區域 - 手機上全寬，桌面上 30% -->
            <div class="lg:w-[30%] bg-gray-100 p-4 lg:p-8 overflow-y-auto order-2 lg:order-1">
              <Vue_header />
              <router-view></router-view>
              <Vue_footer />
            </div>
            <Pic />
          </div>
        </n-message-provider>
      </n-dialog-provider>
    </div>
  </n-config-provider>
</template>

<script>
  import { defineComponent } from 'vue';
  import { NConfigProvider, NMessageProvider, NDialogProvider } from 'naive-ui';
  import Vue_footer from './components/footer.vue';
  import Vue_header from './components/header.vue';
  import Pic from './components/pic.vue';

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