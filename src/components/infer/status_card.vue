<script>
import axios from "axios";
import colorTable from "@/color";


export default {
  name: "status_card",
  data() {
    return {
      status: {
        cpu: {
          percent: 10.66,
          color: colorTable[3],
          memory: {
            total: 1.0,
            used: 0.1,
            color: colorTable[3],
          }
        },
        gpus: [
          {
            id: 0,
            percent: 0,
            color: colorTable[3],
            memory: {
              total: 1,
              used: 0.1,
              color: colorTable[3],
            }
          },
          {
            id: 1,
            percent: 0,
            color: colorTable[3],
            memory: {
              total: 1,
              used: 0.1,
              color: colorTable[3],
            }
          }
        ]
      }
    }
  },
  mounted() {
    this.getStatus()
    this.timerId = setInterval(() => {
      this.getStatus()
    }, 5000)
  },
  methods: {
    async getStatus() {
      try {
        let url = `/status`
        const response = await axios.get(url)
        if (response.status === 200) {
          let data = response.data
          this.status.cpu.percent = data["cpu_percent"]
          // 设置颜色
          if (this.status.cpu.percent > 75) {
            this.status.cpu.color = colorTable[7]
          } else if (this.status.cpu.percent > 50) {
            this.status.cpu.color = colorTable[5]
          } else {
            this.status.cpu.color = colorTable[3]
          }
          this.status.cpu.memory.total = (data["memory_total"] / (1024 * 1024 * 1024)).toFixed(2)
          this.status.cpu.memory.used = (data["memory_used"] / (1024 * 1024 * 1024)).toFixed(2)
          // 设置颜色
          let memory_percent = 100 * this.status.cpu.memory.used / this.status.cpu.memory.total
          if (memory_percent > 75) {
            this.status.cpu.memory.color = colorTable[7]
          } else if (memory_percent > 50) {
            this.status.cpu.memory.color = colorTable[5]
          } else {
            this.status.cpu.memory.color = colorTable[3]
          }
          let new_gpu_status = []
          for (let i = 0; i < data["gpu"].length; i++) {
            // 设置颜色
            let gpu_color = ""
            let gpu_load = data["gpu"][i]["gpu_load"] * 100
            if (gpu_load > 75) {
              gpu_color = colorTable[7]
            } else if (gpu_load > 50) {
              gpu_color = colorTable[5]
            } else {
              gpu_color = colorTable[3]
            }
            // 设置颜色
            let memory_color = ""
            let memory_load = 100 * data["gpu"][i]["gpu_memory"]["used"] / data["gpu"][i]["gpu_memory"]["total"]
            if (memory_load > 75) {
              memory_color = colorTable[7]
            } else if (memory_load > 50) {
              memory_color = colorTable[5]
            } else {
              memory_color = colorTable[3]
            }
            new_gpu_status.push(
                {
                  id: data["gpu"][i]["gpu_id"],
                  percent: data["gpu"][i]["gpu_load"] * 100,
                  color: gpu_color,
                  memory: {
                    total: (data["gpu"][i]["gpu_memory"]["total"] / 1024).toFixed(2),
                    used: (data["gpu"][i]["gpu_memory"]["used"] / 1024).toFixed(2),
                    color: memory_color
                  }
                }
            )
          }
          this.status.gpus = new_gpu_status
        }

      } catch (error) {
        console.error("状态api 请求失败", error)
      }
    }
  }
}
</script>

<template>
  <a-card title="系统状态">
    <a-row justify="space-around" :gutter="2">
      <a-col :span="4">
        CPU 使用率
      </a-col>
      <a-col :span="20">
        <a-progress
            status="normal"
            :stroke-color="status.cpu.color"
            :percent="status.cpu.percent.toFixed(2)"/>
      </a-col>
    </a-row>
    <a-row justify="space-around" :gutter="2">
      <a-col :span="4">
        内存 {{ status.cpu.memory.used }}GB/{{ status.cpu.memory.total }}GB
      </a-col>
      <a-col :span="20">
        <a-progress
            status="normal"
            :stroke-color="status.cpu.memory.color"
            :percent="(status.cpu.memory.used * 100 / status.cpu.memory.total).toFixed(2)"/>
      </a-col>
    </a-row>
    <a-row v-for="gpu in status.gpus" justify="space-around" :gutter="2">
      <a-col :span="4">
        GPU:{{ gpu.id }} 使用率
      </a-col>
      <a-col :span="20">
        <a-progress
            status="normal"
            :stroke-color="gpu.color"
            :percent="gpu.percent.toFixed(2)"/>
      </a-col>
      <a-col :span="4">
        GPU:{{ gpu.id }} 显存 {{ gpu.memory.used }}GB / {{ gpu.memory.total }}GB
      </a-col>
      <a-col :span="20">
        <a-progress
            status="normal"
            :stroke-color="gpu.memory.color"
            :percent="(gpu.memory.used * 100 / gpu.memory.total).toFixed(2)"/>
      </a-col>
    </a-row>


  </a-card>
</template>

<style scoped>

</style>