import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import 'ant-design-vue/dist/antd.css';
import { Checkbox, Input, Modal, Tag, Breadcrumb, Button, Icon } from 'ant-design-vue';
import PerfectScrollbar from 'vue2-perfect-scrollbar'
import 'vue2-perfect-scrollbar/dist/vue2-perfect-scrollbar.css'

import ddSelectTree from '@/index';

Vue.use(PerfectScrollbar)
Vue.use(Checkbox);
Vue.use(Icon);
Vue.use(Input);
Vue.use(Button);
Vue.use(Modal);
Vue.use(Tag);
Vue.use(Breadcrumb);
Vue.use(ddSelectTree);


Vue.config.productionTip = false

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
