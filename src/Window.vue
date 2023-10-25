<template>
  <a-config-provider
      :theme="{
      token: {
        colorPrimary: '#a0c4ff',
      },
      components:{
          Slider:{
            colorPrimaryBorder: '#ffc6ff',
          }
        },
    }"
  >
  </a-config-provider>
  <a-layout style="min-height: 100vh">
    <a-layout-sider theme="light">
      <div class="logo"/>
      <a-menu v-model:selectedKeys="selectedKeys" mode="inline" >
        <a-menu-item key="1">
          <span>推理</span>
        </a-menu-item>
        <a-menu-item key="2">
          <span>画</span>
        </a-menu-item>
        <a-menu-item key="3">
          <span>个</span>
        </a-menu-item>
        <a-menu-item key="4">
          <span>饼</span>
        </a-menu-item>
      </a-menu>
    </a-layout-sider>
    <a-layout>
      <a-layout-content style="margin: 0 16px" v-show="selectedKeys[0] === '1'">
        <infer></infer>
      </a-layout-content>
      <a-layout-footer style="text-align: center">
        Ant Design ©2018 我去初音未来
      </a-layout-footer>
    </a-layout>
  </a-layout>
</template>
<script>
import {ref} from 'vue';
import {defineComponent} from "vue";
import infer from "@/infer.vue";

const selectedKeys = ref(['1']);
export default defineComponent({
  data() {
    return {
      selectedKeys: selectedKeys
    }
  },
  components: {infer}
})
</script>
<style scoped>
</style>