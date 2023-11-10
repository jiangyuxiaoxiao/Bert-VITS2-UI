import Antd from 'ant-design-vue';
import 'ant-design-vue/dist/reset.css';
import 'highlight.js/styles/stackoverflow-light.css'
import hljs from 'highlight.js/lib/core';
import javascript from 'highlight.js/lib/languages/javascript';
import hljsVuePlugin from "@highlightjs/vue-plugin";

import {createApp} from 'vue'
import Window from './Window.vue'


hljs.registerLanguage('javascript', javascript);


const viewportWidth = window.innerWidth;
console.log(window.innerWidth)
if (viewportWidth < 2560) {
    document.body.style.zoom = "75%";
} else if (viewportWidth < 1920) {
    document.body.style.zoom = "65%";
}


const app = createApp(Window)

app.use(Antd).use(hljsVuePlugin).mount('#app')

