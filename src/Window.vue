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
    <a-layout-sider theme="light" width="20%" v-model:collapsed="collapsed" collapsible>
      <div class="logo"/>
      <a-menu v-model:selectedKeys="selectedKeys" mode="inline">
        <a-menu-item key="1">
          <span>{{ collapsed ? "推理" : "音频推理" }}</span>
        </a-menu-item>
        <a-menu-item key="2">
          <span>{{ collapsed ? "数据" : "数据集处理" }}</span>
        </a-menu-item>
        <a-menu-item key="3">
          <span>{{ collapsed ? "API" : "API文档" }}</span>
        </a-menu-item>
        <a-menu-item key="4">
          <span>{{ collapsed ? "帮助" : "帮助页面" }}</span>
        </a-menu-item>

      </a-menu>
    </a-layout-sider>
    <a-layout>
      <a-layout-content style="margin: 0 16px" v-show="selectedKeys[0] === '1'">
        <infer></infer>
      </a-layout-content>
      <a-layout-content style="margin: 0 16px" v-show="selectedKeys[0] === '2'">
        <dataset></dataset>
      </a-layout-content>
      <a-layout-content style="margin: 0 16px" v-show="selectedKeys[0] === '3'">
        <iframe src="/docs"></iframe>
      </a-layout-content>
      <a-layout-content style="margin: 0 16px" v-show="selectedKeys[0] === '4'">
        <help></help>
      </a-layout-content>
      <a-layout-footer style="text-align: center">
        Designed By Sora
      </a-layout-footer>
    </a-layout>
  </a-layout>
</template>
<script>
import {defineComponent} from "vue";
import infer from "@/infer.vue";
import help from "@/help.vue";
import dataset from "@/dataset.vue";

export default defineComponent({
  data() {
    return {
      selectedKeys: ['1'],
      collapsed: true
    }
  },
  components: {dataset, infer, help}
})
</script>
<style scoped>
iframe {
  width: 100%;
  height: 100%;
  border: none; /* 移除边框 */
  overflow: hidden;
}
</style>