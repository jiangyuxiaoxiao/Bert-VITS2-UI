import Antd from 'ant-design-vue';
import 'ant-design-vue/dist/reset.css';
import { createApp } from 'vue'
import Window from './Window.vue'



const app = createApp(Window)

app.use(Antd).mount('#app')

