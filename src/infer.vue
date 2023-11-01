<script>
// 推理页面

import select_model from "@/components/infer/select_model.vue";
import status_card from "@/components/infer/status_card.vue";
import model_card from "@/components/infer/model_card.vue";
import colorTable from "@/color";
import axios from "axios";
import {CheckOutlined, CloseOutlined, DownloadOutlined} from "@ant-design/icons-vue";

export default {
  name: "infer",
  components: {DownloadOutlined, model_card, status_card, select_model, CheckOutlined, CloseOutlined},
  data() {
    return {
      generate_audio_loading: false,
      delete_model_loading: false,
      colorTable: colorTable,
      models: {},
      registered_model: new Set(),
      texts: "",
      global_sdp_ratio: 0.2,
      global_sdp_ratio_selected: false,
      global_noise: 0.2,
      global_noise_selected: false,
      global_noisew: 0.9,
      global_noisew_selected: false,
      global_length: 1.0,
      global_length_selected: false,
      global_speaker: "",
      global_speaker_selected: false,
      global_language: "",
      global_language_selected: false,
      select_all_models: {
        status: false,
        type: "primary",
        text: "模型全选"
      },
      select_all_choices: {
        status: false,
        type: "primary",
        text: "选项全选"
      },
      audio_dir: "Data",
      random_audio: {
        valid: false,
        data: {
          text: "",
          src: "",
          speaker: ""
        }
      },
      random_language: "ZH"
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
            if (!this.registered_model.has(model_id)) {
              let spk2id = data[model_id]["spk2id"]
              let speakers = []
              for (let spk in spk2id) {
                speakers.push(spk)
              }
              this.models[model_id] = {
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
              this.registered_model.add(model_id)
            }
          }
          for (let model_id of this.registered_model) {
            // 删除不存在的模型
            if (!loaded_model.has(model_id)) {
              this.registered_model.delete(model_id)
              delete this.models[model_id]
            }
          }
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
      console.info(this.texts)
      this.generate_audio_loading = true
      for (let id in this.models) {
        // 消除上次的音频
        this.models[id].audio.valid = false
        if (this.models[id].selected) {
          await this.infer_audio(this.texts, this.models[id])
        }
      }
      this.generate_audio_loading = false
    },

    async translate(to_language) {
      // 文本翻译
      let url = `/tools/translate`
      let params = {
        texts: this.texts,
        to_language: to_language
      }
      try {
        let response = await axios.get(url, {params: params})
        if (response.status === 200) {
          console.log(response.data.texts)
          this.texts = response.data.texts
        }
      } catch (error) {
        console.error("翻译失败", error)
      }
    },

    all_choices_button() {
      if (this.select_all_choices.status === false) {
        this.select_all_choices.status = true
        this.select_all_choices.type = "default"
        this.select_all_choices.text = "取消选项全选"
        this.global_sdp_ratio_selected = true
        this.global_noise_selected = true
        this.global_noisew_selected = true
        this.global_length_selected = true
        this.global_speaker_selected = true
        this.global_language_selected = true
      } else {
        this.select_all_choices.status = false
        this.select_all_choices.type = "primary"
        this.select_all_choices.text = "选项全选"
        this.global_sdp_ratio_selected = false
        this.global_noise_selected = false
        this.global_noisew_selected = false
        this.global_length_selected = false
        this.global_speaker_selected = false
        this.global_language_selected = false
      }
    },

    all_models_button() {
      if (this.select_all_models.status === false) {
        this.select_all_models.status = true
        this.select_all_models.type = "default"
        this.select_all_models.text = "取消模型全选"
        for (let model_id in this.models) {
          this.models[model_id].selected = true
        }
      } else {
        this.select_all_models.status = false
        this.select_all_models.type = "primary"
        this.select_all_models.text = "模型全选"
        for (let model_id in this.models) {
          this.models[model_id].selected = false
        }
      }
    },

    async delete_selected_models() {
      // 卸载所有选中模型
      let url = `/models/delete`
      this.delete_model_loading = true
      for (let model_id in this.models) {
        if (this.models[model_id].selected === true) {
          let params = {
            model_id: parseInt(this.models[model_id].id)
          }
          try {
            await axios.get(url, {params: params})
          } catch (error) {
            console.error(`模型${this.models[model_id].name}卸载失败`, error)
          }
        }
      }
      this.delete_model_loading = false
    },

    apply_global_setting() {
      for (let model_id in this.models) {
        if (this.models[model_id].selected === true) {
          if (this.global_sdp_ratio_selected === true) {
            this.models[model_id].sdp_ratio = this.global_sdp_ratio
          }
          if (this.global_noise_selected === true) {
            this.models[model_id].noise = this.global_noise
          }
          if (this.global_noisew_selected === true) {
            this.models[model_id].noisew = this.global_noisew
          }
          if (this.global_length_selected === true) {
            this.models[model_id].length = this.global_length
          }
          if (this.global_speaker_selected === true) {
            if (this.models[model_id].speakers.includes(this.global_speaker)) {
              this.models[model_id].speaker_name = this.global_speaker
            }
          }
          if (this.global_language_selected === true) {
            this.models[model_id].language = this.global_language
          }
        }
      }
    },


    async get_random_audio() {
      // 获取随机音频
      this.random_audio.valid = false
      let url = `/tools/random_example`
      let params = {
        "language": this.random_language,
        "root_dir": this.audio_dir
      }
      if (this.random_language === "随机"){
        params = {
          "root_dir": this.audio_dir
        }
      }
      try {
        let response = await axios.get(url, {params: params})
        if (response.status === 200) {
          let data = response.data
          console.log(data)
          if(data["status"] !== 0){
            this.texts = data["detail"]
            return
          }
          data = data["Data"]
          this.random_audio.data.speaker = data["speaker"]
          this.random_audio.data.text = data["text"]
          this.texts = data["text"]
          this.random_audio.valid = true
          this.random_audio.data.src = `tools/get_audio?path=${data["audio"]}`
        }
      } catch (error) {
        console.error(`音频获取失败`, error)
      }
    }
  },
  computed: {
    allSpeakers() {
      let Speakers = new Set()
      for (let index in this.models) {
        for (let spk of this.models[index].speakers) {
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
        <!-- 全局设置 -->
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
                        show-search
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

    <!--
    <a-divider :style="{'background-color':colorTable[5], 'height':'2px'} "/>
    -->
    <a-col :span="12">
      <a-row justify="start" :gutter="[16,16]" align="bottom">
        <a-col :span="24">
          <select_model></select_model>
        </a-col>
        <!-- 文本栏 -->
        <a-col :span="24">
          <a-card title="输入文本内容">
            <a-row justify="start" :gutter="[16,16]">
              <a-textarea v-model:value="texts" placeholder="请输入文本" :rows="8"/>
              <a-col :span="24">
                <a-space :size="24">
                  <a-button @click="translate('jp')"> 翻译日语</a-button>
                  <a-button @click="translate('en')"> 翻译英语</a-button>
                  <a-button type="primary" @click="infers" :loading="generate_audio_loading"> 生成音频</a-button>
                </a-space>
              </a-col>
              <a-col :span="24">
                <a-space :size="24">
                  <a-button @click="get_random_audio"> 随机音频示例</a-button>
                  <a-tooltip title="随机音频搜索目录">
                    <a-input v-model:value="audio_dir" placeholder="随机音频目录"/>
                  </a-tooltip>
                  <a-tooltip title="随机音频搜索语言">
                    <a-select
                        ref="select"
                        v-model:value="random_language"
                        style="width: 100%"
                        @focus="focus"
                    >
                      <a-select-option value="ZH"></a-select-option>
                      <a-select-option value="JP"></a-select-option>
                      <a-select-option value="EN"></a-select-option>
                      <a-select-option value="随机"></a-select-option>
                    </a-select>
                  </a-tooltip>
                </a-space>
              </a-col>
              <a-col :span="24">
                <a-space v-show="random_audio.valid" size="large">
                  <audio :src="random_audio.data.src" controls></audio>
                  <a-button :href="random_audio.data.src"
                            :download=" random_audio.data.speaker + ': ' + texts + '.wav'">
                    <template #icon>
                      <DownloadOutlined/>
                    </template>
                    下载音频
                  </a-button>
                </a-space>
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