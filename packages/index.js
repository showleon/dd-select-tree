import ddSelectTree from './src/index.vue'
ddSelectTree.install = function(Vue) {
    Vue.component(ddSelectTree.name, ddSelectTree);
};
export default ddSelectTree;