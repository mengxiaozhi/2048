<template>
  <n-config-provider :theme-overrides="themeOverrides">
    <div id="app">
          <n-message-provider>
            <router-view></router-view>
          </n-message-provider>
    </div>
  </n-config-provider>
</template>

<script>
  import { defineComponent } from 'vue';
  import { NConfigProvider, NMessageProvider } from 'naive-ui'

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
      NConfigProvider
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

<style>
</style>