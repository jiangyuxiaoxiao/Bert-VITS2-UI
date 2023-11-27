<script>
import {QuestionCircleOutlined, CloseCircleOutlined, CheckCircleOutlined} from "@ant-design/icons-vue";

export default {
  name: "dataset",
  components: {QuestionCircleOutlined, CheckCircleOutlined, CloseCircleOutlined},
  data() {
    return {
      fileList: [],
      files: {
        __请添加文件__: {
          type: 0,
          selected_mode: "unprocessed",
          accepted: {
            data: [], // 所有数据
            page_index: 1,
            page_size: 5,
            current_data: [] // 当前分页数据
          },
          rejected: {
            data: [],
            page_index: 1,
            page_size: 5,
            current_data: []
          },
          pending: {
            data: [],
            page_index: 1,
            page_size: 5,
            current_data: []
          },
          unprocessed: {
            data: [],
            page_index: 1,
            page_size: 5,
            current_data: []
          },
          fileSaveOpen: false
        }
      },
      selected_file: "__请添加文件__",
      selected_mode: "unprocessed",
    }
  },
  methods: {
    getFile(file) {
      const reader = new FileReader()
      const fileName = file.name
      reader.onload = (e) => {
        let texts = e.target.result.toString()
        this.files[fileName] = {}
        let lines = texts.split(/\r?\n/)
        if (lines.length === 0) {
          return
        }
        let line0 = lines[0]
        let size = line0.split("|").length
        // 支持格式 4 5 7 8
        // 4 预处理前
        // 5 预处理前 中间结果文件
        // 7 预处理后
        // 8 预处理后 中间结果文件

        let accepted = [] // 接受
        let rejected = [] // 拒绝
        let pending = [] // 待定
        let unprocessed = [] // 未处理
        switch (size) {
          case 4:
            lines.map(line => {
              let data = line.split("|")
              if (data.length !== 4) {
                return ""
              }
              unprocessed.push({
                file: data[0],
                speaker: data[1],
                language: data[2],
                text: data[3]
              })
            })
            break
          case 5:
            lines.map(line => {
              let data = line.split("|")
              if (data.length !== 5) {
                return ""
              }
              let content = {
                file: data[0],
                speaker: data[1],
                language: data[2],
                text: data[3]
              }
              switch (data[4]) {
                case "accepted":
                  accepted.push(content)
                  break
                case "rejected":
                  rejected.push(content)
                  break
                case "pending":
                  pending.push(content)
                  break
                case "unprocessed":
                  unprocessed.push(content)
                  break
                default:
                  return ""
              }
            })
            break
          case 7:
            lines.map(line => {
              let data = line.split("|")
              if (data.length !== 7) {
                return ""
              }
              unprocessed.push({
                file: data[0],
                speaker: data[1],
                language: data[2],
                text: data[3],
                phones: data[4],
                tones: data[5],
                word2ph: data[6]
              })
            })
            break
          case 8:
            lines.map(line => {
              let data = line.split("|")
              if (data.length !== 8) {
                return ""
              }
              let content = {
                file: data[0],
                speaker: data[1],
                language: data[2],
                text: data[3],
                phones: data[4],
                tones: data[5],
                word2ph: data[6]
              }
              switch (data[7]) {
                case "accepted":
                  accepted.push(content)
                  break
                case "rejected":
                  rejected.push(content)
                  break
                case "pending":
                  pending.push(content)
                  break
                case "unprocessed":
                  unprocessed.push(content)
                  break
                default:
                  return ""
              }
            })
            break
          default:
            return
        }
        if (this.selected_file === "__请添加文件__") {
          this.files = {}
          this.selected_file = fileName
        }
        this.files[fileName] = {
          type: size,
          selected_mode: "unprocessed",
          accepted: {
            data: accepted, // 所有数据
            page_index: 1,
            page_size: 5,
            current_data: accepted.slice(0, 5) // 当前分页数据
          },
          rejected: {
            data: rejected,
            page_index: 1,
            page_size: 5,
            current_data: rejected.slice(0, 5)
          },
          pending: {
            data: pending,
            page_index: 1,
            page_size: 5,
            current_data: pending.slice(0, 5)
          },
          unprocessed: {
            data: unprocessed,
            page_index: 1,
            page_size: 5,
            current_data: unprocessed.slice(0, 5)
          },
          fileSaveOpen: false

        }
      };
      reader.readAsText(file)
      return false
    },

    moveData(from, to, index) {
      // 将from的第index个元素塞到to的开头
      let trueIndex = index + from.page_size * (from.page_index - 1) // 在整体中的index
      to.data.unshift(from.data.splice(trueIndex, 1)[0])
      this.pageChange(to)
      this.pageChange(from)
    },


    pageChange(datas) {
      // 分页改变时重新渲染数据
      let start = datas.page_size * (datas.page_index - 1)
      let end = start + datas.page_size
      datas.current_data = datas.data.slice(start, end)
    },

    saveFile(file, name, type) {
      try {
        let accepted, rejected, pending, unprocessed = []
        let result = []
        let result_txt = ""
        if (type === 'mid') {

          if (!name.endsWith(".mid")) {
            name += ".mid"
          }
          // mid 保存中间结果文件 记录标签结果与原处理一致
          if (file.type === 4 || file.type === 5) {
            accepted = file.accepted.data.map(data => `${data.file}|${data.speaker}|${data.language}|${data.text}|accepted`)
            rejected = file.rejected.data.map(data => `${data.file}|${data.speaker}|${data.language}|${data.text}|rejected`)
            pending = file.pending.data.map(data => `${data.file}|${data.speaker}|${data.language}|${data.text}|pending`)
            unprocessed = file.unprocessed.data.map(data => `${data.file}|${data.speaker}|${data.language}|${data.text}|unprocessed`)
          } else if (file.type === 7 || file.type === 8) {
            accepted = file.accepted.data.map(data => `${data.file}|${data.speaker}|${data.language}|${data.text}|${data.phones}|${data.tones}|${data.word2ph}|accepted`)
            rejected = file.rejected.data.map(data => `${data.file}|${data.speaker}|${data.language}|${data.text}|${data.phones}|${data.tones}|${data.word2ph}|rejected`)
            pending = file.pending.data.map(data => `${data.file}|${data.speaker}|${data.language}|${data.text}|${data.phones}|${data.tones}|${data.word2ph}|pending`)
            unprocessed = file.unprocessed.data.map(data => `${data.file}|${data.speaker}|${data.language}|${data.text}|${data.phones}|${data.tones}|${data.word2ph}|unprocessed`)
          } else {
            file.fileSaveOpen = false
            console.log("文件格式错误")
            return
          }
          result = accepted.concat(rejected, pending, unprocessed)
        } else if (type === "final") {
          // 删除mid
          if (name.endsWith(".mid")) {
            name = name.slice(0, -4)
          }
          // 保存最终文件
          if (file.type === 4 || file.type === 5) {
            accepted = file.accepted.data.map(data => `${data.file}|${data.speaker}|${data.language}|${data.text}`)
            pending = file.pending.data.map(data => `${data.file}|${data.speaker}|${data.language}|${data.text}`)
            unprocessed = file.unprocessed.data.map(data => `${data.file}|${data.speaker}|${data.language}|${data.text}`)
          } else if (file.type === 7 || file.type === 8) {
            accepted = file.accepted.data.map(data => `${data.file}|${data.speaker}|${data.language}|${data.text}|${data.phones}|${data.tones}|${data.word2ph}`)
            pending = file.pending.data.map(data => `${data.file}|${data.speaker}|${data.language}|${data.text}|${data.phones}|${data.tones}|${data.word2ph}`)
            unprocessed = file.unprocessed.data.map(data => `${data.file}|${data.speaker}|${data.language}|${data.text}|${data.phones}|${data.tones}|${data.word2ph}`)
          } else {
            file.fileSaveOpen = false
            console.log("文件格式错误")
            return
          }
          result = accepted.concat(pending, unprocessed)
        }

        result_txt = result.join("\n")
        const txtFile = new Blob([result_txt], {type: 'text/plain'})
        const fileUrl = URL.createObjectURL(txtFile);

        // 创建下载链接
        const downloadLink = document.createElement('a');
        downloadLink.href = fileUrl;
        downloadLink.download = name;

        downloadLink.click()
      } catch (e) {
        console.log(e)
      }
      file.fileSaveOpen = false
    },

    closeFile() {
      console.log(this.files.length)
      if (Object.keys(this.files).length === 0) {
        return
      }
      if (Object.keys(this.files).length === 1) {
        this.files = {
          __请添加文件__: {
            type: 0,
            selected_mode: "unprocessed",
            accepted: {
              data: [], // 所有数据
              page_index: 1,
              page_size: 5,
              current_data: [] // 当前分页数据
            },
            rejected: {
              data: [],
              page_index: 1,
              page_size: 5,
              current_data: []
            },
            pending: {
              data: [],
              page_index: 1,
              page_size: 5,
              current_data: []
            },
            unprocessed: {
              data: [],
              page_index: 1,
              page_size: 5,
              current_data: []
            },
            fileSaveOpen: false
          }
        }

        this.selected_file = "__请添加文件__"
        this.selected_mode = "unprocessed"
      } else {
        delete this.files[this.selected_file]
        this.selected_file = Object.keys(this.files)[0]
      }
    }

  }
}
</script>

<template>
  <a-card title="数据集精筛">
    <a-upload-dragger
        v-model:fileList="fileList"
        name="file"
        :show-upload-list="false"
        :multiple="true"
        :before-upload="getFile"
    >
      <p class="ant-upload-text">点击或拖拽上传数据集文件</p>
      <p class="ant-upload-hint">
        支持上传预处理前、预处理后数据集文件以及对应的中间保存文件。上传同名文件时会重新加载。<br/>预处理前数据集文件允许修改文本，预处理后的文件不允许。
      </p>
    </a-upload-dragger>
  </a-card>

  <a-card
      style="width: 100%"
      :tab-list="Object.keys(files).map(key =>{
        return {
          key : key,
          tab: key==='__请添加文件__'? '请添加文件':key,
        }
      })"
      :active-tab-key="selected_file"
      @tab-change="key => {
        selected_file = key
        selected_mode = files[key].selected_mode
      }"
  >
    <!-- 文件处理相关按钮 -->
    <a-space align="start" size="large" :style="{'margin-bottom':'20px'}">
      <a-button type="primary"
                @click="files[selected_file].fileSaveOpen=true"
      >保存文件
      </a-button>
      <a-modal v-model:open="files[selected_file].fileSaveOpen"

      >
        <template #footer>
          <template
              v-if="files[selected_file].type === 4 || files[selected_file].type === 5 ||
              files[selected_file].type === 7 || files[selected_file].type === 8">
            <a-button key="saveMid" type="primary" @click="saveFile(files[selected_file], selected_file, 'mid')">
              保存中间文件
            </a-button>
            <a-button key="saveFinal" type="primary" @click="saveFile(files[selected_file], selected_file, 'final')">
              保存最终文件
            </a-button>
            <a-button key="return" type="primary" @click="files[selected_file].fileSaveOpen=false">返回</a-button>
          </template>
          <template v-else>
            <a-button key="back" @click="files[selected_file].fileSaveOpen=false">我好笨。</a-button>
            <a-button key="submit" type="primary" @click="files[selected_file].fileSaveOpen=false">是这样！</a-button>
          </template>
        </template>


        <template v-if="files[selected_file].type === 4 || files[selected_file].type === 5">
          当保存为中间文件时，会原样保存当前的操作状态供下次继续进行数据筛选操作。当保存为最终文件时，会删除被拒绝筛掉的数据然后保存为原格式。
        </template>
        <template v-else-if="files[selected_file].type === 7 || files[selected_file].type === 8">
          当保存为中间文件时，会原样保存当前的操作状态供下次继续进行数据筛选操作。当保存为最终文件时，会删除被拒绝筛掉的数据然后保存为原格式。
        </template>
        <template v-else>
          要保存的文件的格式不正确哦。
        </template>
      </a-modal>
      <a-button type="primary"
                @click="closeFile"
      >关闭文件
      </a-button>
    </a-space>


    <a-tabs v-model:activeKey="selected_mode" type="card"
            @change="activeKey => {files[selected_file].selected_mode = activeKey}">
      <a-tab-pane key="unprocessed" tab="未处理">
        <a-row justify="start" :gutter="[16,16]">
          <a-col :span="24">
            <a-pagination
                v-model:current="files[selected_file].unprocessed.page_index"
                v-model:pageSize="files[selected_file].unprocessed.page_size"
                show-size-changer
                show-quick-jumper
                :show-total="total => `共计${total}条`"
                :total="files[selected_file].unprocessed.data.length"
                @change="pageChange(files[selected_file].unprocessed)"
            />
          </a-col>
          <a-col :span="24">
            <TransitionGroup name="data-card" tag="div">
              <a-col :span="24" v-for="(data, index) in files[selected_file].unprocessed.current_data"
                     :key="data.file">
                <a-card hoverable :style="{'margin-bottom':'20px'}">
                  <a-row justify="start" :gutter="[16,16]">
                    <!-- 标签 -->
                    <a-tag color="#ffc6ff">{{ data.speaker }}</a-tag>
                    <a-tag color="#bdb2ff">{{ data.language }}</a-tag>
                    <!-- 文本 -->
                    <a-col :span="24">
                      <a-textarea
                          v-model:value="data.text"
                          auto-size=""
                          :disabled="files[selected_file].type === 7 || files[selected_file].type === 8"
                      ></a-textarea>
                    </a-col>
                    <!-- 音频及处理按钮 -->
                    <a-col :span="24">
                      <a-space :size="24">
                        <audio :src="'/tools/get_audio?path=' + data.file" controls></audio>

                        <a-button
                            @click="moveData(files[selected_file].unprocessed, files[selected_file].accepted, index)">
                          <template #icon>
                            <CheckCircleOutlined/>
                          </template>
                          接受
                        </a-button>

                        <a-button
                            @click="moveData(files[selected_file].unprocessed, files[selected_file].rejected, index)">
                          <template #icon>
                            <CloseCircleOutlined/>
                          </template>
                          拒绝
                        </a-button>

                        <a-button
                            @click="moveData(files[selected_file].unprocessed, files[selected_file].pending, index)">
                          <template #icon>
                            <QuestionCircleOutlined/>
                          </template>
                          待定
                        </a-button>
                      </a-space>
                    </a-col>
                  </a-row>
                </a-card>
              </a-col>
            </TransitionGroup>
          </a-col>


        </a-row>
      </a-tab-pane>

      <a-tab-pane key="accepted" tab="已接受">
        <a-row justify="start" :gutter="[16,16]">
          <a-col :span="24">
            <a-pagination
                v-model:current="files[selected_file].accepted.page_index"
                v-model:pageSize="files[selected_file].accepted.page_size"
                show-size-changer
                show-quick-jumper
                :show-total="total => `共计${total}条`"
                :total="files[selected_file].accepted.data.length"
                @change="pageChange(files[selected_file].accepted)"
            />
          </a-col>
          <TransitionGroup name="data-card" tag="div">
            <a-col :span="24" v-for="(data, index) in files[selected_file].accepted.current_data" :key="data.file">
              <a-card>
                <a-row justify="start" :gutter="[16,16]">
                  <!-- 标签 -->
                  <a-tag color="#ffc6ff">{{ data.speaker }}</a-tag>
                  <a-tag color="#bdb2ff">{{ data.language }}</a-tag>
                  <!-- 文本 -->
                  <a-col :span="24">
                    <a-textarea
                        v-model:value="data.text"
                        auto-size=""
                        :disabled="files[selected_file].type === 7 || files[selected_file].type === 8"
                    ></a-textarea>
                  </a-col>
                  <!-- 音频及处理按钮 -->
                  <a-col :span="24">
                    <a-space :size="24">
                      <audio :src="'/tools/get_audio?path=' + data.file" controls></audio>

                      <a-button>
                        <template #icon>
                          <CheckCircleOutlined/>
                        </template>
                        接受
                      </a-button>

                      <a-button
                          @click="moveData(files[selected_file].accepted, files[selected_file].rejected, index)">
                        <template #icon>
                          <CloseCircleOutlined/>
                        </template>
                        拒绝
                      </a-button>

                      <a-button
                          @click="moveData(files[selected_file].accepted, files[selected_file].pending, index)">
                        <template #icon>
                          <QuestionCircleOutlined/>
                        </template>
                        待定
                      </a-button>

                    </a-space>
                  </a-col>
                </a-row>
              </a-card>
            </a-col>
          </TransitionGroup>
        </a-row>
      </a-tab-pane>

      <a-tab-pane key="rejected" tab="已拒绝">
        <a-row justify="start" :gutter="[16,16]">
          <a-col :span="24">
            <a-pagination
                v-model:current="files[selected_file].rejected.page_index"
                v-model:pageSize="files[selected_file].rejected.page_size"
                show-size-changer
                show-quick-jumper
                :show-total="total => `共计${total}条`"
                :total="files[selected_file].rejected.data.length"
                @change="pageChange(files[selected_file].rejected)"
            />
          </a-col>
          <TransitionGroup name="data-card" tag="div">
            <a-col :span="24" v-for="(data, index) in files[selected_file].rejected.current_data" :key="data.file">
              <a-card>
                <a-row justify="start" :gutter="[16,16]">
                  <!-- 标签 -->
                  <a-tag color="#ffc6ff">{{ data.speaker }}</a-tag>
                  <a-tag color="#bdb2ff">{{ data.language }}</a-tag>
                  <!-- 文本 -->
                  <a-col :span="24">
                    <a-textarea
                        v-model:value="data.text"
                        auto-size=""
                        :disabled="files[selected_file].type === 7 || files[selected_file].type === 8"
                    ></a-textarea>
                  </a-col>
                  <!-- 音频及处理按钮 -->
                  <a-col :span="24">
                    <a-space :size="24">
                      <audio :src="'/tools/get_audio?path=' + data.file" controls></audio>

                      <a-button
                          @click="moveData(files[selected_file].rejected, files[selected_file].accepted, index)">
                        <template #icon>
                          <CheckCircleOutlined/>
                        </template>
                        接受
                      </a-button>

                      <a-button>
                        <template #icon>
                          <CloseCircleOutlined/>
                        </template>
                        拒绝
                      </a-button>

                      <a-button
                          @click="moveData(files[selected_file].rejected, files[selected_file].pending, index)">
                        <template #icon>
                          <QuestionCircleOutlined/>
                        </template>
                        待定
                      </a-button>

                    </a-space>
                  </a-col>
                </a-row>
              </a-card>
            </a-col>
          </TransitionGroup>
        </a-row>
      </a-tab-pane>

      <a-tab-pane key="pending" tab="待定">
        <a-row justify="start" :gutter="[16,16]">
          <a-col :span="24">
            <a-pagination
                v-model:current="files[selected_file].pending.page_index"
                v-model:pageSize="files[selected_file].pending.page_size"
                show-size-changer
                show-quick-jumper
                :show-total="total => `共计${total}条`"
                :total="files[selected_file].pending.data.length"
                @change="pageChange(files[selected_file].pending)"
            />
          </a-col>
          <TransitionGroup name="data-card" tag="div">
            <a-col :span="24" v-for="(data, index) in files[selected_file].pending.current_data" :key="data.file">
              <a-card>
                <a-row justify="start" :gutter="[16,16]">
                  <!-- 标签 -->
                  <a-tag color="#ffc6ff">{{ data.speaker }}</a-tag>
                  <a-tag color="#bdb2ff">{{ data.language }}</a-tag>
                  <!-- 文本 -->
                  <a-col :span="24">
                    <a-textarea
                        v-model:value="data.text"
                        auto-size=""
                        :disabled="files[selected_file].type === 7 || files[selected_file].type === 8"
                    ></a-textarea>
                  </a-col>
                  <!-- 音频及处理按钮 -->
                  <a-col :span="24">
                    <a-space :size="24">
                      <audio :src="'/tools/get_audio?path=' + data.file" controls></audio>

                      <a-button
                          @click="moveData(files[selected_file].pending, files[selected_file].accepted, index)">
                        <template #icon>
                          <CheckCircleOutlined/>
                        </template>
                        接受
                      </a-button>

                      <a-button
                          @click="moveData(files[selected_file].pending, files[selected_file].rejected, index)">
                        <template #icon>
                          <CloseCircleOutlined/>
                        </template>
                        拒绝
                      </a-button>

                      <a-button
                          @click="moveData(files[selected_file].pending, files[selected_file].pending, index)">
                        <template #icon>
                          <QuestionCircleOutlined/>
                        </template>
                        待定
                      </a-button>

                    </a-space>
                  </a-col>
                </a-row>
              </a-card>
            </a-col>
          </TransitionGroup>
        </a-row>
      </a-tab-pane>

    </a-tabs>
  </a-card>
</template>

<style scoped>
.data-card-enter-active {
  transition: all 0.3s ease-out;
}

.data-card-leave-active {
  transition: all 0.3s cubic-bezier(1, 0.5, 0.8, 1);
}

.data-card-enter-from,
.data-card-leave-to {
  transform: translateX(20px);
  opacity: 0;
}
</style>