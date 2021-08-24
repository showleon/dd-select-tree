<template>
  <a-modal
    :visible.sync="visible"
    title="人员选择"
    width="990px"
    :bodyStyle="{ 'height': '400px' }"
    ok-text="确定"
    cancel-text="取消"
    @ok="emitOk"
    @cancel="emitCancel">
        <div class="ddst-box">
            <div class="ddst-left ddst-mode">
                <div class="search-box">
                    <a-input @input="searchInput" placeholder="请搜索"></a-input>
                </div>
                <div class="ddst-select-main">
                    <div class="ddst-select-breabrumb">
                        <a-breadcrumb v-show="!isSearchMoment">
                            <a-breadcrumb-item>
                                <span @click="changeBreadcrumb({ label: '所有', nodeKey: undefined })" :class="[ breadcrumbActive === undefined ? 'disabled-color' : 'ddst-breadcrumb-item']">所有</span>
                            </a-breadcrumb-item>
                            <a-breadcrumb-item 
                                v-for="(item, index) in breadcrumbList" :key="index">
                                <span @click="changeBreadcrumb(item)" :class="[ breadcrumbActive === item.nodeKey ? 'disabled-color' : 'ddst-breadcrumb-item']">
                                    {{ item.label }}
                                </span>
                            </a-breadcrumb-item>
                        </a-breadcrumb>
                    </div>
                    <div class="ddst-select-tree">
                        <CheckTree 
                            :activeTree.sync="activeSelectTree"
                            :isSearchMoment="isSearchMoment"
                            :canCheckedDepartment="canCheckedDepartment"
                            :showCheckedStrategy="showCheckedStrategy"
                            @nextFloor="nextFloorChange"
                            @change="checkTreeChange"></CheckTree>
                    </div>
                </div>
            </div>
            <div class="ddst-right ddst-mode">
                <perfect-scrollbar>
                    <div>
                        <a-tag closable @close="delPreventDefault(item, $event)" v-for="(item, index) in selected" :key="index">
                            {{ item.label }}
                        </a-tag>
                    </div>
                </perfect-scrollbar>
            </div>
        </div>
      
  </a-modal>
</template>

<script>
import CheckTree from './CheckTree'
import { message } from 'ant-design-vue';
export default {
    name: 'ddSelectTree',
    props: {
        visible: {
            type: Boolean,
            default: false
        },
        value: {
            type: [Array],
            default: () => []
        },
        data: {
            type: [Array],
            default: () => []
        },
        disabledList: {
            type: [Array],
            default: () => []
        },
        limit: {
            type: [Number],
            default: 0
        },
        replaceFields: {
            type: Object,
            default: () => {
                return {
                    isStaff: "isStaff",
                    isOffice: "isOffice",
                    children: "children",
                    label: "name",
                    value: 'id',
                }
            }
        },
        checkStrictly: {
            type: Boolean,
            default: false
        },
        showCheckedStrategy: {
            type: String,
            default: 'SHOW_ALL'
        },
        canCheckedDepartment: {
            type: Boolean,
            default: true
        }
    },
    components: {
        CheckTree,
    },
    watch: {
        value: {
            handler(arr) {
                arr.map(item=>{
                    this.findPersonItem(item.value) && this.selected.push(this.findPersonItem(item.value))
                })
            },
            immediate: true,
        },
        data: {
            handler(arr) {
                this.init()
            },
            immediate: true,
        }
    },
    model: {
        prop: 'value', // 绑定的值，通过父组件传递
        event: 'update', // 自定义事件名
    },
    data() {
        return {
            allTree: [],
            flatState: [],
            activeSelectTree: [],
            selected: [],
            breadcrumbActive: undefined,
            breadcrumbList: [],
            isSearchMoment: false,
            maps: [{nodeKey: 1, label: '是', value: 1},{nodeKey: 2, label: '是', value: 2}]
        }
    },
    mounted() {
        
    },
    methods: {
        init() {
            this.allTree = this.data
            this.flatState = this.compileFlatState()
            this.rebuildTree()

            this.resetTree()
            this.setTreeChecked()
            this.setTreeDisabled()
            console.log( this.flatState, ' this.flatState')
        },
        resetTree() {
            let activeSelectTree = []
            if ( this.breadcrumbActive === undefined ) {
               activeSelectTree = this.flatState.filter(item=>!item.parent).map(item=>item)
            } else {
                activeSelectTree = this.findDepartmentChild(this.breadcrumbActive)
            }
            this.activeSelectTree = activeSelectTree
        },
        compileFlatState () { 
            let keyCounter = 0;
            let { children, isStaff, isOffice, label, value } = this.replaceFields;
            const flatTree = [];
            function flattenChildren(node, parent) {
                node.nodeKey = keyCounter++;
                flatTree[node.nodeKey] = { 
                    node: node,
                    nodeKey: node.nodeKey,
                    label: node[label],
                    value: node[value],
                    isOffice: node[isOffice],
                    isStaff: node[isStaff] };
                if (typeof parent != 'undefined') {
                    flatTree[node.nodeKey].parent = parent.nodeKey;
                    flatTree[parent.nodeKey][children].push(node.nodeKey);
                }

                if (node[children]) {
                    flatTree[node.nodeKey][children] = [];
                    node[children].forEach(child => flattenChildren(child, node));
                }
            }
            this.allTree.forEach(rootNode => {
                flattenChildren(rootNode);
            });
            return flatTree;
        },
        updateTreeUp(nodeKey){
            const parentKey = this.flatState[nodeKey].parent;
            if (typeof parentKey == 'undefined' || this.checkStrictly) return;

            const node = this.flatState[nodeKey];
            const parent = this.flatState[parentKey];
            const parentAllChild = this.flatState.filter(item=>item.parent === parent.nodeKey).map(item=>item)
            if (node.checked == parent.checked && node.indeterminate == parent.indeterminate) return;
            console.log(parentKey, this.flatState[nodeKey], this.flatState[parentKey], '进来了')
            if (node.checked == true) {
                this.$set(parent, 'checked', parentAllChild.every(node => node.checked || node.disabled !== undefined ));
                this.$set(parent, 'indeterminate', !parent.checked);
            } else {
                this.$set(parent, 'checked', false);
                this.$set(parent, 'indeterminate', parentAllChild.some(node => node.checked || node.indeterminate));
            }
            this.updateTreeUp(parentKey);
        },
        updateTreeDown(node, changes = {}) {
            const parentAllChild = this.flatState.filter(item=>item.parent === node.nodeKey).map(item=>item)
            if (this.checkStrictly) return;
            for (let key in changes) {
                if( key === 'checked' && node.disabled ){
                    this.$set(node, key, node.checked);
                }else{
                    this.$set(node, key, changes[key]);
                }
            }

            if (parentAllChild) {
                parentAllChild.forEach(child => {
                    this.updateTreeDown(child, changes);
                });
            }
        },
        rebuildTree () { 
            const checkedNodes = this.getCheckedNodes();
            checkedNodes.forEach(node => {
                this.updateTreeDown(node, {checked: true});
                const parentKey = this.flatState[node.nodeKey].parent;
                if (!parentKey && parentKey !== 0) return;
                const parent = this.flatState[parentKey];
                const childHasCheckSetter = typeof node.checked != 'undefined' && node.checked;
                if (childHasCheckSetter && parent.checked != node.checked) {
                    this.updateTreeUp(node.nodeKey);
                }
            });
        },
        getCheckedNodes () {
            return this.flatState.filter(obj => obj.checked).map(obj => obj);
        },
        searchInput: (function (e) {
            let timer
            return function (e) {
                let val = e.target.value
                let _THIS = this
                if ( timer ) {
                    clearTimeout(timer)
                }
                timer = setTimeout(()=>{
                    _THIS.changeBreadcrumb({ label: '所有', nodeKey: undefined })
                    if ( val.length > 0 ) {
                        _THIS.isSearchMoment = true
                        _THIS.activeSelectTree = _THIS.flatState.filter(obj=> obj.label.indexOf(val) !== -1 && (obj.isStaff || !obj.isOffice) ).map(item=>item)
                    } else {
                        _THIS.isSearchMoment = false
                        _THIS.activeSelectTree = _THIS.findDepartmentChild(_THIS.breadcrumbActive)
                    }
                    clearTimeout(timer)
                    timer = null
                }, 300)
            }
        })(),
        nextFloorChange({ label, nodeKey }) {
            this.changeBreadcrumb({ label, nodeKey })
        },
        changeBreadcrumb({ label, nodeKey }) {
            console.log(label, nodeKey, 222)

            if ( nodeKey === undefined ) {
                this.breadcrumbList = []
                this.breadcrumbActive = nodeKey;
                this.activeSelectTree = this.findDepartmentChild(nodeKey)
                return 
            }
            if (
                !this.breadcrumbList.length ||
                !this.breadcrumbList.find(item=> item.nodeKey === nodeKey) ) {
                    this.breadcrumbList.push({ label, nodeKey })
            } else {
                this.breadcrumbList = this.breadcrumbList.slice(0, this.breadcrumbList.findIndex(item => item.nodeKey === nodeKey)+1)
            }

            this.breadcrumbActive = nodeKey;
            this.activeSelectTree = this.findDepartmentChild(nodeKey)
            // console.log(JSON.stringify(this.findDepartmentChild(nodeKey)))
            
            this.setTreeChecked()
        },
        findDepartmentChild(nodeKey) {
            const flatState = this.flatState
            return flatState
                .filter(item=> item.parent === nodeKey)
                .map(item=> item)
        },
        findPersonItem(id) {
            const flatState = this.flatState
            return flatState.find(item=> item.value === id)
        },
        setTreeChecked() {
            console.log(this.selected, 'setTreeChecked')
            
            this.selected.map(selected=>{
                this.$set(this.flatState[selected.nodeKey], 'checked', true)
            })
            this.activeSelectTree = this.findDepartmentChild(this.breadcrumbActive)
            // const departLength = this.flatState.filter(item=>item.isOffice || !item.isStaff)
            // const staffLength = this.flatState.filter(item=>!item.isOffice || item.isStaff)
            // const allLength = this.flatState.length
            // const maps = {
            //     'SHOW_PARTMENT': departLength,
            //     'SHOW_STAFF': staffLength,
            //     'SHOW_ALL': allLength,
            // }
            // const couldSelectedLength = maps[this.showCheckedStrategy]
            // this.indeterminate = !!this.selected.length && this.selected.length < couldSelectedLength;
        },
        setTreeDisabled() {
            console.log(this.selected, 'setTreeDisabled')
            this.disabledList.map(disabled=>{
                this.$set(this.flatState[disabled.nodeKey], 'disabled', true)
            })
            this.activeSelectTree = this.findDepartmentChild(this.breadcrumbActive)
        },
        checkTreeChange(checkList, isCheckAll) {
            console.log(checkList, 'checkList')
            checkList.map(checkItem=>{
                let nodeKey = checkItem.nodeKey
                let checked = checkItem.checked
                const node = this.flatState[nodeKey];
                this.$set(node, 'checked', checked);
                this.$set(node, 'indeterminate', false);
                // this.updateTreeUp(nodeKey); // propagate up
                // this.updateTreeDown(node, {checked, indeterminate: false});
            })
            this.activeSelectTree = this.findDepartmentChild(this.breadcrumbActive)
            this.selected = this.getCheckedNodes()
        },
        delPreventDefault(item, e) {
            e.preventDefault();
            const idx = this.selected.findIndex(selected=>selected.nodeKey === item.nodeKey)
            this.selected.splice(idx, 1)
            this.$set(this.flatState[item.nodeKey], 'checked',false)
            this.setTreeChecked()
            console.log('Clicked! But prevent default.');
        },
        emitOk() {
            const selected = []
            this.selected.map(item=>{
                const selectItem = this.flatState[item.nodeKey]
                selected.push({ label: selectItem.label, value: selectItem.value })
            })
            if ( this.limit && this.selected.length >= this.limit ) {
                message.error(`已选数量超过上限，最多可选择${this.limit}个`)
                return
            }
            this.$emit('change', selected)
            this.$emit('update:value', selected)
            this.$emit('update:visible', false)
        },
        emitCancel() {
            console.log('取消了')
            this.$emit('update:visible', false)
        }
    }
}
</script>

<style lang="scss">
    .ddst-mode {
        border: 1px solid #999;
        border-radius: 4px;
        width: 50%;
        height: 100%;
        display: flex;
        flex-direction: column;

    }
    .ddst-box {
        display: flex;
        align-items: center;
        height: 100%;
    }
    .ddst-select-main {
        flex: 1;
        padding: 20px;
        box-sizing: border-box;
    }
    .ddst-select-breabrumb {
        margin-bottom: 10px;
    }
    .ddst-left {
        border-right-width: 0;
        border-radius: 4px 0px 0px 4px;
    }
    .ddst-right {
        padding: 20px;
        height: 100%;
        overflow-x: hidden;
        overflow-y: auto;
        border-radius: 0px 4px 4px 0;
        .ant-tag {
            border: 0px;
            margin-bottom: 10px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            font-size: 14px;
            padding: 7px;
            .anticon-close {
                font-size: 13px;
            }
        }
    }
    .ant-modal-footer {
        text-align: center;
    }
    .ddst-breadcrumb-item {
        cursor: pointer;
        &:hover {
            color: #1890ff;
        }
    }
    .disabled-color {
        color: #666;
        cursor: default
    }
</style>