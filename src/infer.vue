<script>
import select_model from "@/components/select_model.vue";
import status_card from "@/components/status_card.vue";
import model_card from "@/components/model_card.vue";
import colorTable from "@/color";
import {ref} from "vue";
import axios from "axios";

let registered_model = ref(new Set())
let models = ref({})
const texts = ref("")
export default {
  name: "infer",
  components: {model_card, status_card, select_model},
  data() {
    return {
      colorTable: colorTable,
      models: models,
      texts: texts,
    }
  },
  mounted() {
    this.get_models()
    this.timerId = setInterval(() => {
      this.get_models()
    }, 5000)
  },
  methods: {
    async get_models() {
      let port = window.location.port
      let url = `http://127.0.0.1:${port}/models/info`
      try {
        let response = await axios.get(url)
        if (response.status === 200) {
          let data = response.data
          // console.log(data)
          let loaded_model = new Set()
          for (let key in data) {
            loaded_model.add(key)
          }
          for (let model_id in data) {
            // 注册新卡片
            if (!registered_model.value.has(model_id)) {
              let spk2id = data[model_id]["spk2id"]
              let speakers = []
              for (let spk in spk2id) {
                speakers.push(spk)
              }
              models.value[model_id] = {
                id: model_id,
                name: data[model_id]["model_path"],
                device: data[model_id]["device"],
                speakers: speakers,
                speaker_name: speakers[0],
                sdp_ratio: 0.2,
                noise: 0.2,
                noisew: 0.9,
                length: 1,
                language: "ZH",
                selected: false,
                audio: {
                  valid: false,
                  data: {
                    src: ""
                  }
                }
              }
              registered_model.value.add(model_id)
            }
          }

          for (let model_id in registered_model) {
            // 删除不存在的模型
            if (!loaded_model.has(model_id)) {
              registered_model.value.delete(model_id)
              delete models.value[model_id]
            }
          }
          //console.error(models.value)
        }
      } catch (exception) {
        console.log("获取已加载模型失败", exception)
      }
    },

    async infer_audio(texts, model) {
      let port = window.location.port
      let url = `http://127.0.0.1:${port}/voice`
      let params = {
        text: texts,
        model_id: parseInt(model.id),
        speaker_name: model.speaker_name,
        sdp_ratio: model.sdp_ratio,
        noise: model.noise,
        noisew: model.noisew,
        length: model.length,
        language: model.language
      }
      try {
        let response = await axios.get(url, {params: params,
        responseType:"blob"})
        if(response.status === 200){
          let data = response.data
          // console.log(data)
          model.audio.data.src = URL.createObjectURL(data)
          model.audio.valid = true
        }
      } catch (error) {
        console.error("推理失败", error)
      }
    },

    async infers(){
      console.info(texts.value)
      for(let id in models.value){
        // 消除上次的音频
        models.value[id].audio.valid = false
        if(models.value[id].selected){
          await this.infer_audio(texts.value, models.value[id])
        }
      }
    }
  }
}
</script>

<template>
  <a-row justify="start" :gutter="[16,16]">
    <a-col :span="12">
      <status_card></status_card>
    </a-col>
    <a-col :span="12">
      <select_model></select_model>
    </a-col>
    <!--
    <a-divider :style="{'background-color':colorTable[5], 'height':'2px'} "/>
    -->
    <a-col :span="24">
      <a-row justify="start" :gutter="[16,16]">
        <a-col :span="12">
          <a-card title="输入文本内容">
            <a-row justify="start" :gutter="[16,16]">
              <a-textarea v-model:value="texts" placeholder="请输入文本" :rows="6"/>
              <a-space>
                <a-button> 翻译日语</a-button>
                <a-button> 翻译英语</a-button>
                <a-button> 快速切分</a-button>
                <a-button type="primary" @click="infers"> 生成音频</a-button>
                <a-button type="primary"> 切分生成音频</a-button>
              </a-space>
            </a-row>
          </a-card>
        </a-col>
        <a-col :span="12">
          <a-card title="通用面板">

          </a-card>
        </a-col>
      </a-row>

    </a-col>


    <a-col :span="8" v-for="(model,id) in models">
      <model_card :name="model.name" :speakers="model.speakers" :model="model"></model_card>
    </a-col>
  </a-row>


</template>

<style scoped>

</style>