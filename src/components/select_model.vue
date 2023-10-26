<script>
import axios from "axios";
import {ref, watch} from 'vue';
import {TreeSelect} from 'ant-design-vue';

const SHOW_PARENT = TreeSelect.SHOW_PARENT;
let treeData = ref([])
let selected_models = ref([])
let language = ref("ZH")
let devices = ref([])
let device = ref("")
watch(selected_models, () => {
  console.log(selected_models.value);
});


export default {
  data() {
    return {
      treeData: treeData,
      selected_models: selected_models,
      language: language,
      device: device,
      devices: devices
    }
  },
  name: "Select_Model",
  mounted() {
    // 获取所有设备
    this.get_devices()
  },
  methods: {
    async get_local_models() {
      let url = `/models/get_local`
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
              value: dataset_name,
              children: []
            }
            // 模型
            for (let i = 0; i < data[dataset_name].length; i++) {
              dataset_node.children.push({
                label: `${dataset_name}/${data[dataset_name][i]}`,
                value: `Data/${dataset_name}/${data[dataset_name][i]}`
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
    },

    async get_devices() {
      let url = `/status`
      try {
        const response = await axios.get(url)
        if (response.status === 200) {
          let data = response.data
          devices.value = data.devices
          // 设置默认设备，当有cuda时默认为cuda:0，否则为cpu
          if (devices.value.length >= 2) {
            device.value = devices.value[1]
          } else {
            device.value = devices.value[0]
          }
        }
      } catch (error) {
        console.error(error)
      }
    },

    async load_model(model_path, device, language) {
      // 加载指定模型
      let url = `/models/add`
      let params = {
        model_path: model_path,
        device: device,
        language: language
      }
      try {
        await axios.get(url, {params: params})
      } catch (error) {
        console.error("加载模型出错", error)
      }
    },

    async load_all_models() {
      // 加载所有选中的模型
      for (let index in selected_models.value) {
        await this.load_model(selected_models.value[index], device.value, language.value)
      }
    }
  }
}
</script>

<template>
  <a-card title="模型加载" :bordered="false">
    <a-row :gutter="10">
      <a-col :span="18">
        <a-tree-select
            v-model:value="selected_models"
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
        <a-select
            ref="select"
            v-model:value="device"
            style="width: 100%"
            @focus="focus"
        >
          <a-select-option v-for="dev in devices" :value="dev"></a-select-option>
        </a-select>
      </a-col>
      <a-col :span="2">
        <a-select
            ref="select"
            v-model:value="language"
            style="width: 100%"
            @focus="focus"
        >
          <a-select-option value="ZH"></a-select-option>
          <a-select-option value="JP"></a-select-option>
          <a-select-option value="EN"></a-select-option>
        </a-select>
      </a-col>
      <a-col :span="2">
        <a-button type="primary" @click="load_all_models">加载模型</a-button>
      </a-col>
    </a-row>
  </a-card>

</template>

<style scoped>
</style>