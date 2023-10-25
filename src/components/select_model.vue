<script>
import axios from "axios";
import {ref, watch} from 'vue';
import {TreeSelect} from 'ant-design-vue';

const SHOW_PARENT = TreeSelect.SHOW_PARENT;
let treeData = ref([])
let value = ref([])
watch(value, () => {
  console.log(value.value);
});


export default {
  data() {
    return {
      treeData: treeData,
      value: value
    }
  },
  name: "Select_Model",
  methods: {
    async get_local_models() {
      let port = window.location.port
      let url = `http://127.0.0.1:${port}/models/get_local`
      try {
        const response = await axios.get(url, {
          timeout: 3000
        })
        console.log(response)
        if (response.status === 200) {
          let dataset_count = 0
          let result = []
          // 数据集
          let data = response.data
          for (let dataset_name in data) {
            let dataset_node = {
              label: dataset_name,
              value: `0-${dataset_count}`,
              children: []
            }
            // 模型
            for (let i = 0; i < data[dataset_name].length; i++) {
              dataset_node.children.push({
                label: `${dataset_name}/${data[dataset_name][i]}`,
                value: `0-${dataset_count}-${i}`
              })
            }
            result.push(dataset_node)
            dataset_count++
          }
          treeData.value = result
          console.log(result)

        } else {
          treeData.value = []
        }

      } catch (error) {
        console.error("get_local_models error", error)
        treeData.value = []
      }
    }
  }
}
</script>

<template>
  <a-card title="模型加载" :bordered="false">
    <a-row :gutter="10">
      <a-col :span="20">
        <a-tree-select
            v-model:value="value"
            style="width: 100%"
            :on-click="get_local_models"
            :tree-data="treeData"
            tree-checkable
            allow-clear
            :show-checked-strategy="SHOW_PARENT"
            placeholder="Please select"
            tree-node-filter-prop="label"
            list-height="512"
        />
      </a-col>
      <a-col :span="2">
        <a-button type="primary">加载模型</a-button>
      </a-col>
      <a-col :span="2">
        <a-button type="primary">加载模型</a-button>
      </a-col>
    </a-row>
  </a-card>

</template>

<style scoped>
</style>