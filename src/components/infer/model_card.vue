<script>
import axios from "axios";
import {DownloadOutlined} from '@ant-design/icons-vue';
import {useTimer} from "vue-timer-hook";

export default {
  name: "model_card",

  props: ["name", "speakers", "model"],
  data() {
    return {
      time: new Date()
    }
  },
  mounted() {
    this.speaker_name = this.speakers[0]
  },
  components: {
    DownloadOutlined
  },

  methods: {
    async delete_model() {
      let url = `/models/delete`
      let params = {
        model_id: parseInt(this.model.id)
      }
      try {
        await axios.get(url, {params: params})
      } catch (error) {
        console.error("模型卸载失败", error)
      }
    },

    
    getName(text, name, speaker_name) {
      let name2 = name.replace(/^Data\\|^Data\//, '').replace(/models\\|models\//, '')
      return text.substring(0, 10) + "@" + name2 + "@" + speaker_name + ".wav"
    }
  }
}

</script>

<template>
  <a-card :title="model.visible?this.name + '@' + model.device: ''">
    <template #extra>
      <a-switch v-model:checked="model.selected"></a-switch>
    </template>
    <a-row :gutter="[8,12]">
      <a-col>
        <a-row justify="start" align="bottom" :gutter="[8,8]" :wrap="true" :style="{opacity:model.visible?1:0}">
          <h4>说话人</h4>
          <a-col style="margin-left: 1em" :span="6">
            <a-select
                show-search
                ref="select"
                v-model:value="model.speaker_name"
                style="width: 100%"
                @focus="focus"
            >
              <a-select-option v-for="speaker in speakers" :value="speaker"></a-select-option>
            </a-select>
          </a-col>
          <a-col :span="2"></a-col>
          <h4>语言</h4>
          <a-col style="margin-left: 1em" :span="4">
            <a-select
                ref="select"
                v-model:value="model.language"
                style="width: 100%"
                @focus="focus"
            >
              <a-select-option value="ZH"></a-select-option>
              <a-select-option value="JP"></a-select-option>
              <a-select-option value="EN"></a-select-option>
            </a-select>
          </a-col>
          <a-col :offset="3">
            <a-button @click="delete_model">卸载</a-button>
          </a-col>


          <a-col :span="24"></a-col>
          <h4 style="width:  4em">sdp_ratio</h4>
          <a-col :span="16">
            <a-slider v-model:value="model.sdp_ratio" :min="0" :max="1" :step="0.1" style="color: #a0c4ff"/>
          </a-col>
          <a-col :span="2">
            <a-input-number
                v-model:value="model.sdp_ratio"
                :min="0"
                :max="1"
                :step="0.1"
                style="margin-left: 16px"
            />
          </a-col>

          <a-col :span="24"></a-col>
          <h4 style="width: 4em">noise</h4>
          <a-col :span="16">
            <a-slider v-model:value="model.noise" :min="0.1" :max="2" :step="0.1"/>
          </a-col>
          <a-col :span="2">
            <a-input-number
                v-model:value="model.noise"
                :min="0.1"
                :max="2"
                :step="0.1"
                style="margin-left: 16px"
            />
          </a-col>

          <a-col :span="24"></a-col>
          <h4 style="width: 4em">noisew</h4>
          <a-col :span="16">
            <a-slider v-model:value="model.noisew" :min="0.1" :max="2" :step="0.1"/>
          </a-col>
          <a-col :span="2">
            <a-input-number
                v-model:value="model.noisew"
                :min="0.1"
                :max="2"
                :step="0.1"
                style="margin-left: 16px"
            />
          </a-col>

          <a-col :span="24"></a-col>
          <h4 style="width: 4em">length</h4>
          <a-col :span="16">
            <a-slider v-model:value="model.length" :min="0.1" :max="2" :step="0.1"/>
          </a-col>
          <a-col :span="2">
            <a-input-number
                v-model:value="model.length"
                :min="0.1"
                :max="2"
                :step="0.1"
                style="margin-left: 16px"
            />
          </a-col>

          <a-col :span="24"></a-col>
          <h4 style="width: 4em">emotion</h4>
          <a-col :span="16">
            <a-slider v-model:value="model.emotion" :min="0" :max="9" :step="1"/>
          </a-col>
          <a-col :span="2">
            <a-input-number
                v-model:value="model.emotion"
                :min="0"
                :max="9"
                :step="1"
                style="margin-left: 16px"
            />
          </a-col>

        </a-row>
      </a-col>
      <a-col>
        <!-- 音频相关 -->
        <a-row justify="start" align="bottom" :gutter="[8,8]" :wrap="true">
          <a-col :span="24">
            <a-spin :spinning=model.audio.loading>
              <a-space :style="{opacity: model.audio.valid? 1: 0}" size="large">
                <audio :src="model.audio.data.src" controls></audio>
                <a-button :href="model.audio.data.src"
                          :download="getName(model.audio.data.texts, model.name, model.speaker_name)">
                  <template #icon>
                    <DownloadOutlined/>
                  </template>

                </a-button>
                <a-button v-show=!model.visible
                          type="primary"
                          @click="model.visible = true"
                >
                  显示模型
                </a-button>
              </a-space>
            </a-spin>
          </a-col>
        </a-row>
      </a-col>
    </a-row>


  </a-card>
</template>

<style scoped>
</style>