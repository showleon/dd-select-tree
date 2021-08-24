<template>
  <div class="home">
    <img alt="Vue logo" src="../assets/logo.png">
    <ddSelectTree
      :visible.sync="visible"
      v-model="value"
      :data="treeData"
      @change="onChange">
    </ddSelectTree>
  </div>
</template>

<script>
import { jsonData } from '../data.js'
export default {
  name: 'Home',
  components: {
  },
  data() {
    return {
      visible: true,
      value: [],
      treeData: []
    }
  },
  mounted() {
    setTimeout(()=>{
      this.treeData = jsonData
    }, 200)
  },
  methods: {
    onChange(arr) {
      console.log(arr, 'push')
    }
  }
}
</script>
