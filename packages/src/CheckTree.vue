<template>
  <div class="ddst-check-tree">
    <div v-if="!isSearchMoment">
        <a-checkbox class="checkbox-item" :indeterminate="indeterminate" :checked="checkAll" @change="onCheckAllChange">
            全选
        </a-checkbox>
        <perfect-scrollbar>
            <div class="check-tree-main">
                <a-checkbox-groups @change="onChange" v-model="checkedIds" v-if="activeTree.length">
                    <div v-for="(item, index) in activeTree" :key="index">
                        <a-checkbox 
                            class="checkbox-item"
                            @click="clickCheckItem(item, $event)"
                            :indeterminate="item.indeterminate"
                            v-show="(item.isOffice || !item.isStaff) && canCheckedDepartment"
                            :value="item.nodeKey"
                            :disabled="item.disabled"
                            >
                            <span class="ddst-checkbox-item ddst-depart" >
                                <span>{{ item.label }}</span>
                                <a-button icon="cluster" class="next-btn" @click.stop="nextFloor(item)" :disabled="item.checked">下级</a-button>
                            </span>
                        </a-checkbox>
                        <span class="ddst-checkbox-item ddst-depart" v-show="(item.isOffice || !item.isStaff) && !canCheckedDepartment">
                            <span>{{ item.label }}</span>
                            <a-button icon="cluster" class="next-btn" @click.stop="nextFloor(item)" :disabled="item.checked">下级</a-button>
                        </span>
                        <a-checkbox 
                            class="checkbox-item"
                            @click="clickCheckItem(item, $event)"
                            :value="item.nodeKey"
                            v-show="(!item.isOffice || item.isStaff)"
                            :disabled="item.disabled"
                            >
                            <span class="ddst-checkbox-item">
                                <span>{{ item.label }}</span>
                            </span>
                        </a-checkbox>
                    </div>
                </a-checkbox-groups>
                <div class="ddst-no-data" v-else><a-icon type="file-search" />暂无数据</div>
            </div>
        </perfect-scrollbar>
    </div>
    <div v-else>
        <perfect-scrollbar>
            <div class="check-tree-main">
                <div v-for="(item, index) in activeTree" :key="index">
                    <a-checkbox 
                        class="checkbox-item"
                        @click="clickCheckItem(item, $event)"
                        :value="item.nodeKey"
                        v-model="item.checked"
                        :disabled="item.disabled"
                        @change="searchOnChange"
                        >
                        <span class="ddst-checkbox-item">
                            <span>{{ item.label }}</span>
                        </span>
                    </a-checkbox>
                </div>
            </div>
        </perfect-scrollbar>
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
        canCheckedDepartment: {
            type: Boolean,
            default: true
        }
    },
    watch: {
        activeTree: {
            handler(val, old) {
                this.checkAll = this.checkedIds.length === val.length;
                this.checkedIds = val.filter(item=>item.checked).map(item=>item.nodeKey)
                this.indeterminate = !!this.checkedIds.length && this.checkedIds.length < val.length;
            }
        }
    },
    data() {
        return {
            indeterminate: false,
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
            console.log(this.activeTree, 'check 2')
            this.indeterminate = !!checkedList.length && checkedList.length < this.activeTree.length;
            this.checkAll = checkedList.length === this.activeTree.length;
            this.checkedIds = this.activeTree.filter(item=>item.checked).map(item=>item.nodeKey)

            this.emitChange()
        },
        searchOnChange(checkedList) {
            console.log(checkedList, 'checkedList')
            this.checkedIds = this.activeTree.filter(item=>item.checked).map(item=>item.nodeKey)
            this.emitChange()
        },
        clickCheckItem(item, e) {
            if (e.target.disabled) return;
            const isChecked = e.target.checked
            console.log(e.target.checked, e.target.indeterminate)
            // const isChecked = !e.target.checked && !e.target.indeterminate
            this.$set(item, 'checked', isChecked)
        },
        onCheckAllChange(e) {
            console.log('check all')
            const checkedTree = this.activeTree
            checkedTree.map(item=>{
                this.$set(item, 'checked', e.target.checked)
            })
            Object.assign(this, {
                checkedIds: e.target.checked ? checkedTree.filter(item=>!item.disabled).map(item=>item.nodeKey) : [],
                indeterminate: false,
                checkAll: e.target.checked,
            });
            this.emitChange()
        },
        nextFloor(item) {
            this.$emit('nextFloor', { label: item.label, nodeKey: item.nodeKey })
        },
        emitChange() {
            const checkedArr = this.activeTree
                .filter(item=>this.checkedIds.find(checked=>checked === item.nodeKey) !== undefined)
                .map(item=>item)
            this.$emit('change', checkedArr, this.checkAll)
            
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
        // overflow-x: hidden;
        // overflow-y: auto;
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