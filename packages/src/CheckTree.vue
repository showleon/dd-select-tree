<template>
  <div class="ddst-check-tree">
    <a-checkbox class="checkbox-item" :indeterminate="indeterminate" :checked="checkAll" @change="onCheckAllChange">
        全选
    </a-checkbox>
    <div class="check-tree-main">
        <a-checkbox-groups @change="onChange" v-model="checkedIds" v-if="activeTree.length">
            <div v-for="(item, index) in activeTree" :key="index">
                <a-checkbox 
                    class="checkbox-item"
                    @click="clickCheckItem(item, $event)"
                    :value="item.nodeKey"
                    v-model="item.checked"
                    :disabled="item.disabled"
                    v-if="isShowSearchResult(item.isStaff, item.isOffice)"
                    >
                    <span class="ddst-checkbox-item ddst-depart" v-if="(item.isOffice || !item.isStaff)">
                        <span>{{ item.label }}</span>
                        <a-button icon="cluster" class="next-btn" @click.stop="nextFloor(item)" :disabled="item.checked">下级</a-button>
                    </span>
                    <span class="ddst-checkbox-item" v-else>
                        <span>{{ item.label }}</span>
                    </span>
                </a-checkbox>
            </div>
        </a-checkbox-groups>
        <div class="ddst-no-data" v-else><a-icon type="file-search" />暂无数据</div>
    </div>
  </div>
</template>

<script>
import { Checkbox } from 'ant-design-vue';
export default {
    components: {
        ACheckboxGroups: Checkbox.Group
    },
    props: {
        activeTree: {
            type: [Array],
            default: () => []
        },
        isSearchMoment: {
            type: [Boolean],
            default: false
        },
    },
    watch: {
        activeTree: {
            handler(val) {
                console.log(val.filter(item=>item.checked), 'val.filter(item=>item.checked)')
                this.checkedIds = val.filter(item=>item.checked).map(item=>item.nodeKey)
                // this.onChange(this.checkedIds)
                // this.$emit('update:activeTree', val)
                console.log(this.checkedIds, 'checkedIds')
            },
            immediate: true
        }
    },
    data() {
        return {
            indeterminate: true,
            checkAll: false,
            checkedIds: [],
        }
    },
    methods: {
        isShowSearchResult(isStaff, isOffice) {
            if ( this.isSearchMoment ) {
                return isStaff || !isOffice
            } else {
                return true
            }
        },
        onChange(checkedList) {
            console.log(checkedList, 'check')
            this.indeterminate = !!checkedList.length && checkedList.length < this.activeTree.length;
            this.checkAll = checkedList.length === this.activeTree.length;

            const checkedArr = this.activeTree
                .filter(item=>this.checkedIds.find(checked=>checked === item.nodeKey) !== undefined)
                .map(item=>item)
            console.log(checkedArr, 'checkedArr')
            this.$emit('change', checkedArr)
        },
        clickCheckItem(item, e) {
            const isChecked = e.target.checked
            this.activeTree.map(source=>{
                if ( source.nodeKey === item.nodeKey ) {
                    this.$set(item, 'checked', isChecked)
                }
            })
        },
        onCheckAllChange(e) {
            console.log('check all')
            const checkedTree = this.activeTree
            checkedTree.map(item=>{
                this.$set(item, 'checked', e.target.checked)
            })
            Object.assign(this, {
                checkedIds: e.target.checked ? checkedTree.map(item=>item.nodeKey) : [],
                indeterminate: false,
                checkAll: e.target.checked,
            });
            const checkedArr = this.activeTree
                .filter(item=>this.checkedIds.find(checked=>checked === item.nodeKey))
                .map(item=>item)
            this.$emit('change', checkedArr)
        },
        nextFloor(item) {
            this.$emit('nextFloor', { label: item.label, nodeKey: item.nodeKey })
        }
    }
}
</script>

<style lang="scss">
    .next-btn {
        border: none;
        height: auto;
        // background: #1890ff;
        // color: #fff;
    }
    .ant-checkbox-wrapper {
        display: block;
        margin-left: 0 !important;
    }
    .check-tree-main {
        height: 220px;
        overflow-x: hidden;
        overflow-y: auto;
    }
    .ant-checkbox-group {
        width: 100%;
    }
    .checkbox-item {
        margin-bottom: 10px;
        display: flex;
        align-items: center;
        box-sizing: border-box;
        span:nth-child(2) {
            flex: 1;
        }
        .ddst-checkbox-item {
            display: flex;
            justify-content: space-between;
            box-sizing: border-box;
            span {
                flex: 1;
                white-space: nowrap;
                text-overflow: ellipsis;
                cursor: pointer;
            }
        }
    }
    .ddst-no-data {
        width: 100%;
        height: 100%;
        display: flex;
        justify-content: center;
        align-items: center;
        color: #999;
        i {
            margin-right: 10px;
        }
    }
</style>