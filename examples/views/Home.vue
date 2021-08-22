<template>
  <div class="home">
    <img alt="Vue logo" src="../assets/logo.png">
    <ddSelectTree
      :visible.sync="visible"
      v-model="value"
      @change="onChange">
    </ddSelectTree>
  </div>
</template>

<script>
export default {
  name: 'Home',
  components: {
  },
  data() {
    return {
      visible: true,
      value: []
    }
  },
  methods: {
    onChange(arr) {
      console.log(arr, 'push')
    }
  }
}
</script>
