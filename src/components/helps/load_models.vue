<script>
// 帮助/模型加载
import 'highlight.js/lib/common';
import hljsVuePlugin from "@highlightjs/vue-plugin";

export default {
  name: "load_models",
  components: {
    highlightjs: hljsVuePlugin.component,
  },
  data() {
    return {
      yml: `
      # config.yml文件

      # server api配置
      # 注意， “:” 后需要加空格
      # 注意，本配置下的所有配置均为相对于根目录的路径
      server:
        # 端口号
        port: 10086
        # 模型默认使用设备
        device: "cuda"
        # 需要加载的所有模型的配置
        models:
          - # 模型的路径
            model: "Data/9nine/models/G_390000.pth"
            # 模型config.json的路径
            config: "Data/9nine/config.json"
            # 模型使用设备，若填写则会覆盖默认配置
            device: "cuda"
            # 模型默认使用的语言
            language: "JP"
            # 模型人物默认参数
            # 不必填写所有人物，不填的使用默认值
            # speakers配置暂时不生效
            speakers: [ ]
          - # 模型的路径
            # hamidashi原
            model: "Data/hamidashi/models/G_1070000.pth"
            # 模型config.json的路径
            config: "Data/hamidashi/config.json"
            # 模型使用设备，若填写则会覆盖默认配置
            device: "cuda"
            # 模型默认使用的语言
            language: "JP"
            # 模型人物默认参数
            # 不必填写所有人物，不填的使用默认值
            speakers: [ ] # 也可以不填
      `,
      yml2: `
      server:
          # 端口号
          port: 10086
          # 模型默认使用设备
          device: "cuda"
          # 需要加载的所有模型的配置
          models: [ ]
      `
    }
  }
}
</script>

<template>
  <a-card>
    <a-typography>
      <a-typography-title :level="3">1. 初始化模型加载</a-typography-title>
      <a-typography-paragraph>
        通过配置<a-typography-text code>config.yml</a-typography-text>中的
        <a-typography-text code>server.models</a-typography-text>属性，可以设定初始化时加载的模型，以及模型推理使用设备、模型默认使用语言。<br>
        <highlightjs language="yaml" :code="yml"/>
      </a-typography-paragraph>


      <a-typography-paragraph>
        若无需加载模型，只需将
        <a-typography-text code>server.models</a-typography-text>的值改为<a-typography-text code>[ ]</a-typography-text>即可。
        <highlightjs language="yaml" :code="yml2"/>
      </a-typography-paragraph>
      <br>

      <a-typography-title :level="3">2. 模型动态加载</a-typography-title>
      <a-typography-paragraph>
        1. 网页允许动态加载任意模型。模型默认从<a-typography-text code>/Data</a-typography-text>目录下搜索加载。搜索目录可以自行指定，既允许使用相对于项目根路径的相对路径，也允许使用绝对路径。示例如下所示：<br>
        使用相对路径：
        <img src="/img/helps1.png" alt="" style="height: 10em">
        <br>
        <br>
        使用绝对路径：
        <img src="/img/helps2.png" alt="" style="height: 10em">
        <br>
        2. 每次加载均会查询相应搜索目录、搜索目录的子目录以及子目录的models文件夹中的所有<a-typography-text code>G_xxx.pth</a-typography-text>模型文件。出于搜索时间的考虑，不递归遍历整个目录。<br><br>
        3. 在加载模型时会使用模型文件所在目录/模型文件所在上级目录的<a-typography-text code>config.json</a-typography-text>文件作为配置文件，优先使用所在目录的<a-typography-text code>config.json</a-typography-text>文件。<br><br>
        4. 在加载模型前，可以设置模型加载设备，若希望使用cpu推理，则请将设备选项设为cpu，否则设为cuda。同时也可以指定模型的默认语言，如上图所示。<br><br>
        5. 重复加载相同路径的模型不会消耗额外的内存
      </a-typography-paragraph>
    </a-typography>

  </a-card>
</template>

<style scoped>

</style>