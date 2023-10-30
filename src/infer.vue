<script>
import select_model from "@/components/select_model.vue";
import status_card from "@/components/status_card.vue";
import model_card from "@/components/model_card.vue";
import colorTable from "@/color";
import {ref} from "vue";
import axios from "axios";
import {CheckOutlined, CloseOutlined} from "@ant-design/icons-vue";

const generate_audio_loading = ref(false)
const delete_model_loading = ref(false)
const registered_model = ref(new Set())
const models = ref({})
const global_sdp_ratio = ref(0.2)
const global_sdp_ratio_selected = ref(false)
const global_noise = ref(0.2)
const global_noise_selected = ref(false)
const global_noisew = ref(0.9)
const global_noisew_selected = ref(false)
const global_length = ref(1.0)
const global_length_selected = ref(false)
const global_speaker = ref("")
const global_speaker_selected = ref(false)
const global_language = ref("")
const global_language_selected = ref(false)
const select_all_choices = ref({
  status: false,
  type: "primary",
  text: "选项全选"
})
const select_all_models = ref({
  status: false,
  type: "primary",
  text: "模型全选"
})
const texts = ref("")
export default {
  name: "infer",
  components: {model_card, status_card, select_model, CheckOutlined, CloseOutlined},
  data() {
    return {
      generate_audio_loading: generate_audio_loading,
      delete_model_loading:delete_model_loading,
      colorTable: colorTable,
      models: models,
      texts: texts,
      global_sdp_ratio: global_sdp_ratio,
      global_sdp_ratio_selected: global_sdp_ratio_selected,
      global_noise: global_noise,
      global_noise_selected: global_noise_selected,
      global_noisew: global_noisew,
      global_noisew_selected: global_noisew_selected,
      global_length: global_length,
      global_length_selected: global_length_selected,
      global_speaker: global_speaker,
      global_speaker_selected: global_speaker_selected,
      global_language: global_language,
      global_language_selected: global_language_selected,
      select_all_models: select_all_models,
      select_all_choices: select_all_choices
    }
  },
  mounted() {
    this.get_models()
    this.timerId = setInterval(() => {
      this.get_models()
    }, 1000)
  },
  methods: {
    async get_models() {
      // 获取所有已加载模型
      let url = `/models/info`
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
                language: data[model_id]["language"],
                selected: false,
                audio: {
                  loading: false,
                  valid: false,
                  data: {
                    texts: "",
                    src: ""
                  }
                }
              }
              registered_model.value.add(model_id)
            }
          }
          for (let model_id of registered_model.value) {
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
      // 推理指定模型
      let url = `/voice`
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
        model.audio.loading = true
        let response = await axios.get(url, {
          params: params,
          responseType: "blob"
        })
        if (response.status === 200) {
          let data = response.data
          // console.log(data)
          model.audio.loading = false
          model.audio.data.src = URL.createObjectURL(data)
          model.audio.valid = true
          model.audio.data.texts = texts
        } else {
          model.audio.loading = false
        }
      } catch (error) {
        model.audio.loading = false
        console.error("推理失败", error)
      }
    },

    async infers() {
      // 推理所有选中模型
      console.info(texts.value)
      generate_audio_loading.value = true
      for (let id in models.value) {
        // 消除上次的音频
        models.value[id].audio.valid = false
        if (models.value[id].selected) {
          await this.infer_audio(texts.value, models.value[id])
        }
      }
      generate_audio_loading.value = false
    },

    async translate(to_language) {
      // 文本翻译
      let url = `/tools/translate`
      let params = {
        texts: texts.value,
        to_language: to_language
      }
      try {
        let response = await axios.get(url, {params: params})
        if (response.status === 200) {
          console.log(response.data.texts)
          texts.value = response.data.texts
        }
      } catch (error) {
        console.error("翻译失败", error)
      }
    },

    all_choices_button() {
      if (select_all_choices.value.status === false) {
        select_all_choices.value.status = true
        select_all_choices.value.type = "default"
        select_all_choices.value.text = "取消选项全选"
        global_sdp_ratio_selected.value = true
        global_noise_selected.value = true
        global_noisew_selected.value = true
        global_length_selected.value = true
        global_speaker_selected.value = true
        global_language_selected.value = true
      } else {
        select_all_choices.value.status = false
        select_all_choices.value.type = "primary"
        select_all_choices.value.text = "选项全选"
        global_sdp_ratio_selected.value = false
        global_noise_selected.value = false
        global_noisew_selected.value = false
        global_length_selected.value = false
        global_speaker_selected.value = false
        global_language_selected.value = false
      }
    },

    all_models_button() {
      if (select_all_models.value.status === false) {
        select_all_models.value.status = true
        select_all_models.value.type = "default"
        select_all_models.value.text = "取消模型全选"
        for (let model_id in models.value) {
          models.value[model_id].selected = true
        }
      } else {
        select_all_models.value.status = false
        select_all_models.value.type = "primary"
        select_all_models.value.text = "模型全选"
        for (let model_id in models.value) {
          models.value[model_id].selected = false
        }
      }
    },

    async delete_selected_models() {
      // 卸载所有选中模型
      let url = `/models/delete`
      delete_model_loading.value = true
      for (let model_id in models.value) {
        if (models.value[model_id].selected === true) {
          let params = {
            model_id: parseInt(models.value[model_id].id)
          }
          try {
            await axios.get(url, {params: params})
          } catch (error) {
            console.error(`模型${models.value[model_id].name}卸载失败`, error)
          }
        }
      }
      delete_model_loading.value = false
    },

    apply_global_setting() {
      for (let model_id in models.value) {
        if (models.value[model_id].selected === true) {
          if (global_sdp_ratio_selected.value === true) {
            models.value[model_id].sdp_ratio = global_sdp_ratio.value
          }
          if (global_noise_selected.value === true) {
            models.value[model_id].noise = global_noise.value
          }
          if (global_noisew_selected.value === true) {
            models.value[model_id].noisew = global_noisew.value
          }
          if (global_length_selected.value === true) {
            models.value[model_id].length = global_length.value
          }
          if (global_speaker_selected.value === true) {
            if (models.value[model_id].speakers.includes(global_speaker.value)) {
              models.value[model_id].speaker_name = global_speaker.value
            }
          }
          if (global_language_selected.value === true) {
            models.value[model_id].language = global_language.value
          }
        }
      }
    }
  },
  computed: {
    allSpeakers() {
      let Speakers = new Set()
      for (let index in models.value) {
        for (let spk of models.value[index].speakers) {
          if (!Speakers.has(spk)) {
            Speakers.add(spk)
          }
        }
      }
      return Speakers
    }
  }
}
</script>

<template>
  <a-row justify="start" :gutter="[16,16]">
    <a-col :span="12">
      <a-row justify="start" :gutter="[16,16]">
        <!-- 状态栏 -->
        <a-col :span="24">
          <status_card></status_card>
        </a-col>

        <!-- 文本栏 -->
        <a-col :span="24">
          <a-card title="输入文本内容">
            <a-row justify="start" :gutter="[16,16]">
              <a-textarea v-model:value="texts" placeholder="请输入文本" :rows="7"/>
              <a-space>
                <a-button @click="translate('jp')"> 翻译日语</a-button>
                <a-button @click="translate('en')"> 翻译英语</a-button>
                <a-button v-show="false"> 快速切分</a-button>
                <a-button type="primary" @click="infers" :loading="generate_audio_loading"> 生成音频</a-button>
                <a-button v-show="false" type="primary"> 切分生成音频</a-button>
              </a-space>
            </a-row>
          </a-card>

        </a-col>
      </a-row>
    </a-col>

    <!--
    <a-divider :style="{'background-color':colorTable[5], 'height':'2px'} "/>
    -->
    <a-col :span="12">
      <a-row justify="start" :gutter="[16,16]" align="bottom">
        <a-col :span="24">
          <select_model></select_model>
        </a-col>
        <a-col :span="24">
          <a-card title="全局设置">
            <a-row align="middle" justify="start" wrap="true">
              <!-- 参数相关 -->
              <a-col :span="3">
                <a-checkbox v-model:checked="global_sdp_ratio_selected">sdp_ratio</a-checkbox>
              </a-col>
              <a-col :span="16">
                <a-slider v-model:value="global_sdp_ratio" :min="0" :max="1" :step="0.1" style="color: #a0c4ff"/>
              </a-col>
              <a-col :span="5">
                <a-input-number
                    v-model:value="global_sdp_ratio"
                    :min="0"
                    :max="1"
                    :step="0.1"
                    style="margin-left: 16px"
                />
              </a-col>


              <a-col :span="3">
                <a-checkbox v-model:checked="global_noise_selected">noise</a-checkbox>
              </a-col>
              <a-col :span="16">
                <a-slider v-model:value="global_noise" :min="0.1" :max="2" :step="0.1"/>
              </a-col>
              <a-col :span="5">
                <a-input-number
                    v-model:value="global_noise"
                    :min="0.1"
                    :max="2"
                    :step="0.1"
                    style="margin-left: 16px"
                />
              </a-col>

              <a-col :span="3">
                <a-checkbox v-model:checked="global_noisew_selected">noisew</a-checkbox>
              </a-col>
              <a-col :span="16">
                <a-slider v-model:value="global_noisew" :min="0.1" :max="2" :step="0.1"/>
              </a-col>
              <a-col :span="5">
                <a-input-number
                    v-model:value="global_noisew"
                    :min="0.1"
                    :max="2"
                    :step="0.1"
                    style="margin-left: 16px"
                />
              </a-col>

              <a-col :span="3">
                <a-checkbox v-model:checked="global_length_selected">length</a-checkbox>
              </a-col>
              <a-col :span="16">
                <a-slider v-model:value="global_length" :min="0.1" :max="2" :step="0.1"/>
              </a-col>
              <a-col :span="5">
                <a-input-number
                    v-model:value="global_length"
                    :min="0.1"
                    :max="2"
                    :step="0.1"
                    style="margin-left: 16px"
                />
              </a-col>
              <a-divider></a-divider>

              <!-- 角色相关 -->
              <a-col :span="24">
                <a-space size="large" class="site-space-compact-wrapper">
                  <a-space size="small">
                    <a-checkbox v-model:checked="global_speaker_selected">说话人</a-checkbox>
                    <a-select
                        ref="select"
                        v-model:value="global_speaker"
                        style="width: 10em"
                        @focus="focus"
                    >
                      <a-select-option v-for="spk in allSpeakers" :value="spk"></a-select-option>
                    </a-select>
                  </a-space>
                  <a-space size="small">
                    <a-checkbox v-model:checked="global_language_selected">语言</a-checkbox>
                    <a-select
                        ref="select"
                        v-model:value="global_language"
                        style="width: 10em"
                        @focus="focus"
                    >
                      <a-select-option value="ZH"></a-select-option>
                      <a-select-option value="JP"></a-select-option>
                      <a-select-option value="EN"></a-select-option>
                    </a-select>
                  </a-space>
                </a-space>
              </a-col>
              <a-col :span="24"></a-col>
              <a-divider></a-divider>

              <a-col>
                <a-button @click="all_choices_button"
                          :type="select_all_choices.type">{{ select_all_choices.text }}
                </a-button>
              </a-col>
              <a-col :offset="1">
                <a-button @click="all_models_button"
                          :type="select_all_models.type">{{ select_all_models.text }}
                </a-button>
              </a-col>
              <a-col :offset="1">
                <a-button @click="delete_selected_models" :loading="delete_model_loading">卸载选中模型</a-button>
              </a-col>
              <a-col :offset="1">
                <a-button @click="apply_global_setting">应用全局设置</a-button>
              </a-col>

            </a-row>

          </a-card>
        </a-col>


      </a-row>
    </a-col>


    <a-col :span="8" v-for="(model, id) in models">
      <model_card :name="model.name" :speakers="model.speakers" :model="model"></model_card>
    </a-col>
  </a-row>


</template>

<style scoped>

</style>