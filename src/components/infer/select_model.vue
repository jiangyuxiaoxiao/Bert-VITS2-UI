<script>
import axios from "axios";
import {TreeSelect} from 'ant-design-vue';

const SHOW_PARENT = TreeSelect.SHOW_PARENT;


export default {
  data() {
    return {
      model_loading: false,
      treeData: [],
      selected_models: [],
      language: "ZH",
      device: "",
      devices: [],
      rootDir: "Data"
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
      let params = {"root_dir": this.rootDir}
      try {
        const response = await axios.get(url, {
          timeout: 3000,
          params: params
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
                value: `${this.rootDir}/${dataset_name}/${data[dataset_name][i]}`
              })
            }
            result.push(dataset_node)
            dataset_count++
          }
          this.treeData = result
          console.log(result)

        } else {
          this.treeData = []
        }

      } catch (error) {
        console.error("get_local_models error", error)
        this.treeData = []
      }
    },

    async get_devices() {
      let url = `/status`
      try {
        const response = await axios.get(url)
        if (response.status === 200) {
          let data = response.data
          this.devices = data.devices
          // 设置默认设备，当有cuda时默认为cuda:0，否则为cpu
          if (this.devices.length >= 2) {
            this.device = this.devices[1]
          } else {
            this.device = this.devices[0]
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
      this.model_loading = true
      let models = this.selected_models
      // this.selected_models = []
      // 加载所有选中的模型
      for (let index in models) {
        await this.load_model(models[index], this.device, this.language)
      }
      this.model_loading = false
    }
  }
}
</script>

<template>
  <a-card title="模型加载" :bordered="false">
    <a-row :gutter="[10,10]">
      <a-col :span="24">
        <a-space-compact block>
          <a-radio-button :style="{ width: '35%' }" disabled>搜索根目录</a-radio-button>
          <a-input v-model:value="rootDir" placeholder="不建议自设根目录，最好使用默认配置"/>
        </a-space-compact>

      </a-col>
      <a-col :span="14">
        <a-tree-select
            v-model:value="selected_models"
            style="width: 100%"
            :virtual="false"
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
      <a-col :span="4">
        <a-select
            ref="select"
            v-model:value="device"
            style="width: 100%"
            @focus="focus"
        >
          <a-select-option v-for="dev in devices" :value="dev"></a-select-option>
        </a-select>
      </a-col>
      <a-col :span="3">
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
      <a-col :span="3">
        <a-button type="primary" @click="load_all_models" :loading="model_loading">加载模型</a-button>
      </a-col>
    </a-row>
  </a-card>

</template>

<style scoped>
</style>