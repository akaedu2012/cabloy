# History

## 2022-02-12, Version 4.12.136

- **Enhance**
  - atom bean: create 方法 增加 options 选项

```diff
class Atom extends app.meta.AtomBase {
-  async create({ atomClass, item, user }) {
+  async create({ atomClass, item, options, user }) {
    // super
-    const key = await super.create({ atomClass, item, user });
+    const key = await super.create({ atomClass, item, options, user });
```

## 2022-01-21, Version 4.12.131

- **Enhance**
  - Login 页面：在 pc 布局中仍然采用 small 尺寸
  - 多实例：如果 subdomain 没有对应的实例就打印明确的配置提示
  - 如果是匿名用户访问受限资源，就自动弹出 Login 页面

## 2022-01-21, Version 4.12.128

- **Enhance**
  - ctx.bean.atom.read：options = options || {};

## 2022-01-16, Version 4.12.125

- **Feat**
  - cms：增加工具函数：util.login / util.logout

## 2022-01-13, Version 4.12.124

- **Fix**
  - 原子数据查询：自动转义字典字段时，对 code 的判断：!code 改为 code===undefined，从而支持 code=0 的情况

## 2022-01-12, Version 4.12.123

- **Feat**
  - 原子数据查询：如果 atomLanguage 字段不为空，那么就自动追加 atomLanguageLocale 值，从而方便前端显示

## 2022-01-11, Version 4.12.122

- **Feat**
  - 静态原子数据：如果 atomLanguage 字段不为空，那么自动转义以下字段的语言资源：atomName/description

## 2022-01-10, Version 4.12.121

- **Fix**
  - remove `colors` module

## 2022-01-04, Version 4.12.120

- **Fix**

  - 当重新初始化数据库后，root 用户的 locale 自动变为英语

- **Feat**

  - 在测试与开发环境，当重新初始化数据库时，自动清除目录: src/backend/app/public/{instanceId}

- **Enhance**
  - 通讯录同步（企业微信、钉钉）:
    - 支持部门排序值变更
    - 支持部门移动

## 2022-01-02, Version 4.12.119

- **Fix**

  - 企业微信、钉钉: 同步通讯录超时

## 2021-12-31, Version 4.12.117

- **Fix**

  - Markdown Editor: 从 MD 源文件解析 strikethrough 出错

## 2021-12-31, Version 4.12.116

- **Feat**

  - 动态组件: 当动态加载组件时，显示 preloading

- **Refactor**

  - sandbox: 将基于 webworker 实现的 sandbox 提炼为一个独立的 npm 包
    - sandbox-webworker: [https://github.com/zhennann/sandbox-webworker](https://github.com/zhennann/sandbox-webworker)

- **Enhance**

  - module: 增加国际化提示

## 2021-12-25, Version 4.12.113

- **Refactor**

  - 原子 meta 属性:
    - 通过`const meta = this._ensureItemMeta(item)`设置并获取 meta 属性值

- **Fix**
  - 修复原子历史列表不显示`Rev`标签的问题
  - 修复延迟函数实例化的问题

## 2021-12-22, Version 4.12.112

- **Feat**

  - PC 布局:
    - 当需要时将 medium 尺寸的页面显示为 large 尺寸
  - Atom 列表:
    - 当关闭草稿时，更新 formal 数据

- **Enhance**

  - Atom 权限:
    - 当草稿处于 opened 时，formal 数据仍然可以显示`再次编辑`按钮

## 2021-12-21, Version 4.12.111

- **Feat**

  - Demo:
    - 在演示场景下，根据用户浏览器环境动态使用所需的语言

## 2021-12-20, Version 4.12.110

- **Fix**

  - Theme:
    - 当使用 filled 风格的 navbar 时，large navbar 显示一片空白

## 2021-12-12, Version 4.12.108

- **Features**

  - Markdown 富文本编辑器:
    - 支持拷贝图片和拖拽图片
    - 图片自动上传
    - 当图片未上传完毕时，不允许保存和提交

- **Enhance**
  - 登录页面:
    - 当验证码不匹配时，自动清除验证码
    - 当密码不匹配时，自动清除密码和验证码，并刷新验证码

## 2021-12-08, Version 4.12.107

- **Features**
  - screenfull: this.$meta.util.screenfull
    - used in: dashboard, header button for layout pc

## 2021-12-07, Version 4.12.106

- **Features**

  - menu page: show `dashboard` button on menu page
  - atom list: open user labels by `target: _self` in panel
  - flow task: auto open `assignees confirmation` if needed
  - flow task: update atom draft status when flow task changed

- **Refactor**
  - atom draft: show `submit` button directly after `save` button

## 2021-12-06, Version 4.12.105

- **Refactor**
  - schema for dashboard widget:
    - Deprecate: ebBindOnly\ebBindArray
    - use: ebWidget.bindOnly\bindArray

## 2021-12-06, Version 4.12.104

- **Refactor**
  - schema ebType=text
    - Deprecate: ebCurrency\ebLocale\ebDateFormat\ebTextarea\ebSecure\ebInputType
    - use: ebParams.currency\locale\dateFormat\textarea\secure\inputType
  - schema for dashboard widget:
    - Deprecate: ebClue\ebCategory
    - use: ebWidget.clue\category

## 2021-11-01, Version 4.12.22

- 增加 npm 指令，可以一个命令重建数据库

```bash
$ npm run db:reset
```

如果是旧项目，只需在项目的 package.json 中增加如下指令即可：

```javascript
{
  "scripts": {
    "db:reset": "egg-born-bin backend-db-reset",
    ...
  },
}
```

## 2021-07-01 ~ 2021-10-31, Version 4.12.0

- **特性**
  - atom：增加 `simple` 模式
    - 不需要`草稿`
    - 不需要`审批工作流`特性
  - atom：允许禁止`history`，从而不保留历史记录
  - atom：更好用户体验的`数据筛选`，更丰富更灵活的`筛选字段配置`
  - 脏标记机制
  - 测试：增加 `test-note` 模块
    - 多条目布局切换：列表/卡片/表格
    - 单条目布局切换：信息/正文(Markdown)
    - 增加`便签`部件
  - 测试：`test-party` 模块
    - 增加`简单聊天`部件
  - 工作流引擎：
    - 增加`转办`
    - 增加`代办`
  - 工作流引擎：
    - 增加`行为`机制：从而实现与 activiti 中`边界事件`所对应的应用场景
      - 一个`节点`可以附加多个`行为`
      - `行为`可以指定专属的`边`，从而进行`节点`的迁移
    - 增加`行为`: `超时处理`
  - 工作流引擎：
    - 增加`网关节点`
      -- `排他网关`
      -- `并行网关`
      -- `包含网关`
  - 数据字典：
    - 支持版本控制
    - 支持对字典单独授权
    - 支持多级树形字典
    - 内置：美国城市区划、中国城市区划
    - 通用的后端逻辑处理
    - 通用的前端渲染组件
  - 同时支持 Chart.js 和 Echarts
    - 水果销量（折线图）：采用 Chart.js
    - 水果销量（饼图）：采用 Echarts
- **增强**
  - atom：布局管理器重构
    - 重构列表布局
    - 重构条目布局
    - 重构筛选布局
  - dashboard：重构仪表板
  - markdown：重构 markdown 编辑器以及渲染器
  - json：重构 json 编辑器
  - stats：同时支持 dependencies 和 dependents

## 2021-07-07, Version 4.11.16

- **特性**
  - egg-born-front: 前端增加 uuid 工具`this.$meta.util.uuid`
  - dashboard: 当开锁时，提示`您应该重新加锁，以便保存被修改的配置`

## 2021-07-06, Version 4.11.11

- **杂项**
  - 优化 eslint 和 prettier 配置
  - 优化 npm 脚本：npm run lint / npm run format
  - fix 所有代码的格式，与格式化工具配置对齐
  - 提炼 VSCode 插件最简配置，参见：[VS Code 官方插件集与工具](https://cabloy.com/zh-cn/articles/vscode-settings.html)

## 2021-07-04, Version 4.11.7

- **杂项**
  - 调整 eslint 格式化配置，增加 prettier 格式化配置

## 2021-06-25, Version 4.11.2

- **重构**
  - 增加 bean.file，以便集中管理 file 的功能
  - 优化文章附件的列表显示

## 2021-06-24, Version 4.11.0

- **重构**
  - 模块 npm 指令机制调整，并修复 windows 下执行时的报错问题
  - 模块增加 build/config 文件，方便修改模块的编译打包参数

## 2021-06-18, Version 4.10.28

- **杂项**
  - uuid 升级至 8.3.2

## 2021-06-17, Version 4.10.26

- **修复**
  - 用户标签的统计值与实际不一致

### Commits

- [[`aa926a879`](http://github.com/zhennann/cabloy/commit/aa926a879325d1e31e1c2f10ffd52aa078dbbead)] - fix: stats error of userLabels (zhennann <<zhen.nann@icloud.com>>)

## 2021-06-16, Version 4.10.22

- **重构**
  - CMS 文章列表：优化图文混排样式

### Commits

- [[`d16bbe66f`](http://github.com/zhennann/cabloy/commit/d16bbe66f06784a4def19025adf7a70703c8e8a3)] - fix: CMS 主题中图片位置优化 #16 https://github.com/zhennann/cabloy/issues/16 (ehitco <<2649426350@qq.com>>)

## 2021-06-10, Version 4.10.18

- **重构**
  - CMS Block：采用 Bean 组件重构渲染逻辑，并且支持内容的异步渲染

## 2021-06-09, Version 4.10.15

- **增强**
  - right 中间件：原子权限的 action 允许设置为字符型 name

## 2021-06-08, Version 4.10.14

- **特性**
  - pc/mobile 布局切换：当页面尺寸变化时，如果达到 pc/mobile 切换的阈值，就会弹出通知，提示是否需要切换布局

## 2021-05-26, Version 4.10.0

- **特性**
  - 支持自定义 favicon.ico
  - 优化资源管理：更完善的本地化方案
  - 仪表板：匿名用户与认证用户分开配置
  - PC 布局：匿名用户与认证用户分开配置
  - Mobile 布局：匿名用户与认证用户分开
  - 普通草稿、流转中草稿：分开统计并分开显示
  - 当模块加载时间过长时显示进度条

## 2021-05-09, Version 4.9.16

- **特性**
  - ebDisplay: 表单字段支持动态`显示/隐藏`

## 2021-05-04, Version 4.9.14

- **特性**
  - bean.local: 更便利的获取`local场景`的`本地Bean实例`
    - 参见：[Bean.local](https://cabloy.com/zh-cn/articles/bean-local.html)

## 2021-05-03, Version 4.9.13

- **特性**
  - 点击导航栏左侧的 Logo 自动打开`菜单面板`
  - `菜单面板`支持两种布局风格：`折叠布局`、`树形布局`

## 2021-04-29, Version 4.9.2

- **重构**
  - test-party 和 test-flow 重构，支持在 prod 环境中运行

## 2021-04-28, Version 4.9.0

- **特性**
  - 原子分享与点击跟踪的通用机制

## 2021-04-24, Version 4.8.2

- **修复**
  - 工作流可视化编辑器: 在 PC 场景下有时无法打开右侧属性面板

## 2021-04-24, Version 4.8.1

- **重构**

  - 工作流可视化编辑器: 对流程节点渲染风格进行优化
    - 参见：[演示：CMS 审批工作流(可视化编辑)](https://cabloy.com/zh-cn/articles/flowchart-demo.html)
  - 工作流：增加`原子提交结束事件`

- **重要提示**
  - 旧方案: 当流程顺利完成时，`空结束事件`会自动将原子从`草稿`转为`正式`副本
  - 新方案：为了保持概念的一致性，新增`原子提交结束事件`，将`原子提交逻辑`从`空结束事件`中移出
  - 请核对流程定义做出相应的变更，如果直接修改流程定义的 json 内容，应该是：`endEventNone` -> `endEventAtom`

## 2021-04-22, Version 4.8.0

- **特性**
  - 工作流可视化编辑器
    - 参见：[演示：CMS 审批工作流(可视化编辑)](https://cabloy.com/zh-cn/articles/flowchart-demo.html)

## 2021-03-30, Version 4.7.0

- **特性**

  - CMS 通用渲染机制: 对 CMS 渲染机制进行了进一步提炼，形成通用的渲染机制。也就是说，任何原子类型均可以根据业务的实际需求，便捷的配置`静态渲染机制`，比如`商品`、`订单`，等等
    - 参见：[通用渲染机制](https://cabloy.com/zh-cn/articles/cms-advanced-general.html)

- **优化**
  - docker-compose: 对配置文件进行了调整

## 2021-03-23, Version 4.6.0

- **特性**
  - 明细表: Atom 原子可以添加明细表
  - 动态表达式：schema 表单属性支持动态表达式
  - 初始模版：增加模版用于快速生成明细表的文件骨架
  - 我的页面：同时显示星标和标签，已经对应的统计值标示

## 2021-03-10, Version 4.5.4

- **杂项**
  - 修复 markdown-it-katex 安全预警

## 2021-03-10, Version 4.5.3

- **杂项**
  - babel-eslint 升级为@babel/eslint-parser
  - 删除子仓库的 package-lock.json

## 2021-03-09, Version 4.5.2

- **增强**
  - cms：文档主题：一级目录支持直接包含技术文章
  - cms：当以 iframe 方式显示时，html 增加样式 in-iframe
  - 评论：在评论列表页面显示文章的查看链接

## 2021-03-08, Version 4.5.1

- **特性**

  - cms: 文章查看：直接使用 iframe 嵌入静态页面
  - webpack：暴露 splitChunks 参数，支持分包配置

- **增强**

  - cms：从静态页面跳转后台，在更合理的页面打开“个人信息”链接

- **修复**
  - 评论：多层嵌套评论的样式优化

## 2021-03-05, Version 4.5.0

- **特性**
  - message: 统一消息中心
  - 工作流消息: 当有新任务或者流程结束时，给相关人员发送消息
  - 评论消息：当有新评论时，给文章的相关人员发送消息

## 2021-02-23, Version 4.4.13

- **杂项**
  - vscode: 调整 launch.json 配置
  - cli: 提示升级测试模块

## 2021-02-22, Version 4.4.12

- **特性**

  - 工作流: 增加`撤回`功能

- **重构**
  - 工作流: 重写流程时间线页面，更清晰、更分明
  - socketio: 将`工作流消息`从模块`a-flowtask`移至`a-flow`
  - 验证器: 验证失败的错误提示不再打印到控制台
  - 星标原子: 统计值颜色由`orange`改为`gray`

## 2021-02-09, Version 4.4.11

- **重构**
  - socketio: 将 uniform 初始化移入 buttonMine

## 2021-02-08, Version 4.4.10

- **特性**
  - socketio: add field uniform for messageClass

## 2021-02-08, Version 4.4.9

- **增强**
  - egg-born-backend: redlock.lockTTL=8\*1000 for local

## 2021-02-07, Version 4.4.8

- **修复**
  - socketIO: message.onProcess 变更
  - socketIO: 增加 x-clientid 支持

## 2021-02-07, Version 4.4.7

- **重构**
  - 主题 themebrilliant：调整颜色

## 2021-02-06, Version 4.4.6

- **特性**
  - socketIO：支持 visibilitychange 事件，从而节约资源占用：当页面隐藏时断开 socket，当页面显示时自动恢复 socket

## 2021-02-03, Version 4.4.5

- **特性**
  - clientId：每个页面分配唯一 clientId
  - socketIO：clientId 机制，支持多个页面同时接收 socket 消息

## 2021-02-01, Version 4.4.4

- **优化**
  - 构建系统：进一步增强`模块后端编译`的丑化参数

## 2021-01-31, Version 4.4.3

- **特性**
  - 文件上传：支持固定上传尺寸
  - 文件上传：schema ebType=file，支持固定上传尺寸
  - 文件上传：支持拖拽上传
  - 文件上传：默认不显示上传文件名
  - cms：语言与目录不能为空

## 2021-01-30, Version 4.4.1

- **特性**
  - 主题：新增主题`brilliant灿烂`

## 2021-01-29, Version 4.4.0

- **重构**

  - 术语变更：为了避免与`Tag标签`混淆，将`Label`改为`User Label`，即`标签`->`用户标签`

- **特性**

  - 验证码：可以在开发环境指定`禁止验证码`
  - 验证码：当验证失败时，控制台不再打印相关信息
  - 原子批量指令：支持 stage 属性
  - 前端 scene：在 http headers 中增加 x-scene 自定义头部
  - 后端 configFront：后端 config 可以设置 configFront，configFront 将被返回前端，覆盖前端 config
  - 页面布局：增加布局原子类型，通过原子来管理布局，从而进一步增强布局的可配置性和灵活性
  - 页面布局：用户可以`重置`，恢复布局的初始配置
  - mobile 布局：Tabbar 按钮也支持动态配置：增、减、拖拽
  - mobile 布局：修改`微信/企业微信/钉钉`用于演示的 mobile 布局

- **修复**
  - 工作流：当完成`确认参与人`时，更新任务统计值

## 2021-01-25, Version 4.3.1

- **特性**
  - CMS：支持设置`备案号`
  - 仪表板：仪表板中的链接，默认在新 Tab 中打开

## 2021-01-25, Version 4.3.0

- **重构**
  - 术语变更：将`归档`改为`正式`，即`Archive`->`Formal`

## 2021-01-19, Version 4.2.0

- **重构**

  - 我的页面：将`任务`和`流程`按钮进行合并显示，使布局更紧凑
  - 我的页面：将`外观`按钮移入二级页面
  - 项目的`name`和`title`直接在根目录的`package.json`中设置

- **特性**

  - 统计值：支持在`eb-link`中使用
  - 字段索引：补全新数据表的字段索引
  - 历史 Atom：显示`修订`badget
  - 测试与开发环境，database 默认设置为`mysql`，从而兼容`mysql`和`mariadb`
  - 静态原子：当`atomRevision`设置为`-1`时，自动删除数据库中的数据

- **修复**
  - 当服务中断重启时，前端 socketio 可以自动重连

## 2021-01-09, Version 4.1.0

- Some fixes and enhances

## 2020-12-19, Version 4.0.0-alpha.0

- **features**
  - Bean & AOP
    1. Almost everything is Bean
    2. Bean supports AOP
    3. AOP is also Bean
  - [NodeJS Workflow Engine](https://cabloy.com/articles/flow-introduce.html)
  - [Atom Stages: Draft, Archive, History](https://cabloy.com/articles/atom-stage.html)
  - Stats Value Update and Push Automatically

## 2020-08-08

- **feature**
  - lerna: managing multiple packages with lerna

## 2020-06-21, Version 3.3.0-beta.0

- feature: support wechat work

## 2020-06-05, Version 3.2.0-beta.4

- chore: change to MIT License

## 2020-06-04, Version 3.2.0-beta.2

- **features**
  - [Socket IO](https://community.cabloy.com/articles/91a8d0a883d248c29538cac9f7e7bb0e.html)

## 2020-04-15, Version 3.0.1-beta.1

- **features - backend core **

  - [Cluster](https://cabloy.com/articles/guide-quick-start.html#Configure_Redis_24): Cluster now becomes the first class citizen of CabloyJS
    - Redis: Cluster is based on Redis
    - [Queue](https://cabloy.com/articles/queue.html): Reconstructed based on [bottleneck](https://github.com/SGrondin/bottleneck/) & [bullmq](https://github.com/taskforcesh/bullmq)
    - [Schedule](https://cabloy.com/articles/schedule.html): Reconstructed based on Queue
    - [Broadcast](https://cabloy.com/articles/broadcast.html): Reconstructed based on Redis
    - [Cache](https://cabloy.com/articles/cache.html): Reconstructed based on Redis
    - [Startup](https://cabloy.com/articles/startup.html): Reconstructed
    - [Docker Compose](https://cabloy.com/articles/guide-quick-start.html#Docker_Compose_189): There is a `docker-compose.yml` configuration file in the root directory of the project. If you have installed the docker compose environment, you can start all services of CabloyJS with only one command, including Redis, MySQL, Nginx and CabloyJS backend service
  - [Module Monkey](https://cabloy.com/articles/module-monkey.html): Easy to replace some functionalities of modules just like a monkey🐒

- **features - frontend core **

  - [Theme](https://cabloy.com/articles/theme.html)
  - [Adaptive Layout](https://cabloy.com/articles/013d5e01ae5a40ae90a536d2cafd50cd.html)
  - [Scene Config & Scene Build](https://cabloy.com/articles/config-front.html)
  - [Dragdrop: Move](https://cabloy.com/articles/dragdrop-move.html)
  - [Dragdrop: Resize](https://cabloy.com/articles/dragdrop-resize.html)

- **features - modules **
  - [CMS Block](https://cabloy.com/articles/a676865a6f9b4658a3f7f2319b4193dd.html)
  - [Dashboard](https://cabloy.com/articles/e6848b3c477b4807b78986e1e0342717.html)
  - [Layout PC](https://cabloy.com/articles/8635ddb9fba041778ef3621f257e1da4.html)

## 2020-02-14, Version 3.0.0-beta.4

> [Migration to CabloyJS v3 🎉](https://community.cabloy.com/articles/v2-to-v3.html)

- **features**
  - updated to Framework7 V5 🎉

## 2019-05-29, Version 2.1.0

- **features**
  - support module prebuild, so as to reduce project build time 🎉

## 2019-05-16, Version 2.0.0

- **features**
  - updated to Framework7 V4 🎉

## 2018-09-11, Version 1.2.5

- **features**
  - support f7 color-theme

## 2018-09-07, Version 1.2.4

- **features**
  - a-components: eb-box

## 2018-09-06, Version 1.2.3

- **features**
  - enhance schema&validate

## 2018-09-05, Version 1.2.2

- **features**
  - enhance schema&validate

## 2018-09-03, Version 1.2.0

- **refactor**
  - a-base: changed to sync module

## 2018-08-16, Version 1.1.5

- **fix**
  - a-components: eb-context-menu

## 2018-08-16, Version 1.1.4

- **fix**
  - a-components: eb-toggle

## 2018-08-16, Version 1.1.3

- **features**
  - a-baseadmin support locale

## 2018-08-15, Version 1.1.2

- **features**
  - Moudle's css can be overwrited

## 2018-08-09, Version 1.1.1

- **features**
  - Updated to Framework7 3.0
  - Mobile first, and adapted to PC layout

## 2018-06-24, Version 1.0.7

- **features**
  - First Publish
