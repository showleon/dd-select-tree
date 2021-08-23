# dd-select-tree

**安装**

```
npm install 'dd-select-tree'
```

**使用**

```
import treeSelect from 'fxft-tree-select';
Vue.use(treeSelect);
```

<h1>API<h1>

| Property             | Description                               | Type    | Default Value                                                |
| -------------------- | ----------------------------------------- | ------- | ------------------------------------------------------------ |
| visible              | 是否显示弹窗                              | Boolean | false                                                        |
| value（v-model）     | 绑定值[{ label: String,  value: Number }] | Array   | []                                                           |
| disabledList         | 禁选项[{ label: String,  value: Number }] | Array   | []                                                           |
| limit                | 限制选择个数（0代表不限制）               | Number  | 0                                                            |
| replaceFields        | 字段映射                                  | Object  | {isStaff: "isStaff",  isOffice: "isOffice",children: "children",                    label: "name",value: 'id'} |
| canCheckedDepartment | 是否可选部门                              | Boolean | true                                                         |

