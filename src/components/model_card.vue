<script>
import axios from "axios";

export default {
  name: "model_card",

  props: ["name", "speakers", "model"],
  mounted() {
    this.speaker_name = this.speakers[0]
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

    getName(text, name) {
      let name2 = name.replace(/^Data\\|^Data\//, '').replace(/models\\|models\//, '')
      let text2 = text.substring(0,10)
      return text2 + "@" + name2 + ".wav"
    }
  }
}

</script>

<template>
  <a-card :title="this.name + '@' + model.device">
    <template #extra>
      <a-switch v-model:checked="model.selected"></a-switch>
    </template>
    <a-row justify="start" align="bottom" :gutter="[8,8]" :wrap="true">
      <h4>说话人</h4>
      <a-col style="margin-left: 1em" :span="6">
        <a-select
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
      <a-col :offset="4">
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

      <!-- 音频相关 -->
      <a-col :span = "24" v-show="model.audio.loading">
        <a-spin />
      </a-col>

      <a-space v-show="model.audio.valid" size="large">
        <audio :src="model.audio.data.src" controls></audio>
        <a-button :href="model.audio.data.src"
                  :download="getName(model.audio.data.texts, model.name)">下载音频
        </a-button>
      </a-space>


    </a-row>


  </a-card>
</template>

<style scoped>
</style>