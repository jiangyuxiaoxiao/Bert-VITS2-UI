<script>
// 帮助页面
import load_models from "@/components/helps/load_models.vue";
import safety from "@/components/helps/safety.vue";
import infer from "@/components/helps/infer.vue";

export default {
  name: "help",
  data() {
    return {
      activeKey: "1"
    }
  },
  components: {load_models, safety, infer}
}
</script>

<template>
  <a-page-header
      title="帮助"
      style="border: 1px solid rgb(235, 237, 240)"
  />
  <a-tabs v-model:activeKey="activeKey" type="card" size="large">
    <a-tab-pane key="1" tab="模型加载">
      <load_models/>
    </a-tab-pane>
    <a-tab-pane key="2" tab="推理">
      <infer/>
    </a-tab-pane>
    <a-tab-pane key="3" tab="安全性说明">
      <safety/>
    </a-tab-pane>
  </a-tabs>
</template>

<style scoped>

</style>