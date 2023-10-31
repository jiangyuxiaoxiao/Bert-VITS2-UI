import Antd from 'ant-design-vue';
import 'ant-design-vue/dist/reset.css';
import {createApp} from 'vue'
import Window from './Window.vue'


const viewportWidth = window.innerWidth;
if (2560 < viewportWidth && viewportWidth < 3840) {
    document.body.style.zoom = "85%";
}
else if(viewportWidth<2560){
    document.body.style.zoom = "75%";
}


const app = createApp(Window)

app.use(Antd).mount('#app')

