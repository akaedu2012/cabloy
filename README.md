简体中文 | [English](./README.en-US.md)

# CabloyJS

CabloyJS 是一款自带`工作流引擎`的 Node.js 全栈框架，一款`面向开发者`的低代码开发平台，更是一款兼具低代码的`开箱即用`和专业代码的`灵活定制`的 PAAS 平台

CabloyJS 内置的每一项特性都做到精心调校，均体现了从`开箱即用`到`灵活定制`的无缝衔接，包括：角色系统、用户认证、菜单权限、数据权限、表单渲染、表单验证、工作流引擎、字典、仪表板、在线推送、页面主题、多语言国际化、CMS 渲染引擎、微信接口、企业微信接口、钉钉接口，等等

[![NPM version][npm-image]][npm-url]
[![Unit Test][test-image]][test-url]
[![Test coverage][codecov-image]][codecov-url]
[![Chat on Telegram](https://img.shields.io/badge/Chat%20on-Telegram-brightgreen.svg)](https://t.me/cabloyjs)

[npm-image]: https://img.shields.io/npm/v/cabloy.svg?style=flat-square
[npm-url]: https://npmjs.org/package/cabloy
[test-image]: https://github.com/zhennann/cabloy/workflows/actions-unittest/badge.svg
[test-url]: https://github.com/zhennann/cabloy/actions
[codecov-image]: https://img.shields.io/codecov/c/github/zhennann/cabloy.svg?style=flat-square
[codecov-url]: https://codecov.io/gh/zhennann/cabloy

## 技术栈

| 场景                     | 技术栈                   |
| ------------------------ | ------------------------ |
| 前端                     | vue2 + framework7        |
| 后端                     | koa2 + egg2              |
| 数据库                   | mysql                    |
| 分布式（缓存/队列/消息） | redis、bullmq、websocket |
| Markdown 富文本编辑      | Prosemirror              |

## 文档

- [官网 && 文档](https://cabloy.com)
- [在线教程](https://cabloy.com/zh-cn/articles/tutorial-introduce.html)

## 在线演示

请使用 PC 和 Mobile 分别访问演示站点，体验与众不同的`pc=mobile+pad`自适应风格，真正的跨多端架构，一套代码同时适配 PC 端和 Mobile 端

| 场景      | 链接/二维码                                                        |
| --------- | ------------------------------------------------------------------ |
| PC 端     | [https://test.cabloy.com/](https://test.cabloy.com/)               |
| Mobile 端 | ![cabloy-demo-qrcode](./docs/assets/images/cabloy-demo-qrcode.png) |

| 账号类型 | 名称  | 密码   |
| -------- | ----- | ------ |
| 管理员   | admin | 123456 |
| 普通用户 | tom   | 123456 |
| 普通用户 | jane  | 123456 |

## 引言

> 凡是可以用 JavaScript 来写的应用，最终都会用 JavaScript 来写 | Atwood 定律

目前市面上出现的大多数与 NodeJS 相关的框架，基本都将 NodeJS 定位在`工具层`、`聚合层`、`中间层`、`代理层`，很少在业务层面进行深耕，认为这是 JAVA 的领域，NodeJS 不适合。这种思潮明显是与`Atwood 定律`相悖的

如果您想感受不同的 NodeJS 全栈开发体验，一定要试试自带工作流引擎的 CabloyJS 全栈开源框架。为了提升业务层面的开发效率和开发体验，CabloyJS 在前端和后端均提供了大量实用的工具和组件

## CabloyJS 解决了哪些现实痛点问题？

在 NodeJS 开发领域，目前(截止 2022 年 1 月)存在以下几个痛点问题：

### 1. 中后台管理系统如何更优雅的支持移动端？

随着移动终端的普及和升级换代，大量业务场景都需要移动端的支持，比如管理层需要通过手机查看统计数据、审核业务单据；运维人员通过手机远程查看服务器状态，并进行调整优化

我们知道，市面上大多数中后台管理系统，都是优先适配 PC 端，然而移动端体验却不佳，处于`勉强可用，但不好用`的阶段

此外，大多数`XXX Admin框架`和`中后台管理框架`其本质是`代码模版`。在具体开发项目时，直接在`代码模版`中编写代码。这样，虽然修改起来很直接，但是不利于模版的持续升级和优化；也不利于业务代码的持续沉淀和迁移（至其他项目）。因此，当把`代码模版`从源码仓库下载下来之后，`修改三分之一`，`增加三分之一`，`删减三分之一`，从此就与`代码模版`的后续升级版本绝缘了

### 2. NodeJS 领域没有好用的工作流引擎！

如果单说 CRUD，大多数编程语言的开发框架都可以轻松实现，这不应该成为 NodeJS 开发业务系统的核心优势。若要让 NodeJS 深入业务领域的开发，`工作流引擎`是一个绕不过去的核心组件

### 3. 拖拽式低代码平台已经成为鸡肋方案！

大多数业务表单不仅仅是一些字段的简单组合和增删改查，不同的业务都有自己独特的业务诉求，往往需要前端界面的定制和后端逻辑的定制。拖拽式低代码平台，对于业务人员而言没有足够的工具进行深入定制，对于研发人员而言也没有足够的机制深入开发

许多拖拽式低代码平台认识到了这一点，所以针对不同的业务场景提供官方预配置的套装解决方案，这同样也把业务人员和研发人员置于`不上不下`的尴尬境地，成为`食之无味 弃之可惜`的鸡肋平台

## CabloyJS 亮点介绍

基于上述分析的问题，CabloyJS 实现了如下`功能三大亮点`和`架构三大亮点`

### 1. 功能三大亮点

1. **自适应布局：pc = mobile + pad**

CabloyJS 首创`pc = mobile + pad`的自适应布局机制：只需要一套代码，`mobile端`达到原生效果，同时将`mobile端`的操控体验和开发模式无缝带入`pc端`

请大家分别在 PC 端和手机端打开`演示链接`: [https://test.cabloy.com/](https://test.cabloy.com/) ，来体会与众不同的自适应机制

2. **基于 JSON Schema 的表单自动渲染与数据验证引擎**

通过在一处定义`JSON Schema`，就可以同时支持前端的`表单自动渲染`和后端的`数据验证`，既能开箱即用又可灵活定制

3. **内置 NodeJS 工作流引擎**

CabloyJS 充分利用 JS 语言的灵活性和 JSON 格式的便捷性，提供的 `NodeJS工作流引擎`远比 JAVA 领域的`Activiti` 简洁易用

比如，我们一般只知道如何使用`Activiti`中提供的`活动节点`和`边界事件`，却很少有途径来了解如何开发`自定义的活动节点`和`自定义的边界事件`。由于`Activiti`的架构繁杂，大多数人甚至不愿意尝试去阅读源码。但是 CabloyJS 提供的`工作流引擎`却可以轻松的定制所有的工作流元素，而且源码层次清晰，易于学习

### 2. 架构三大亮点

作为一款面向开发者的低代码开发平台，为了将低代码的`开箱即用`和专业代码的`灵活定制`有机融合，CabloyJS 在架构层面主要做了以下几点：

1. **模块化开发体系与模块隔离**

为了满足大型业务系统开发的诉求，CabloyJS 采用`模块思维`规划系统架构，以业务功能为单位（比如出差申请），将与业务功能相关的前端组件与后端逻辑组织为一个`业务模块`，从而有利于业务功能的内聚与重用，也有利于以业务为单位进行团队分工

此外，业务模块内部的页面、数据、逻辑、路由、配置等元素均进行了命名空间隔离处理，从而避免模块之间的变量污染与冲突。换句话说，当我们在自己的业务模块中为某个资源命名时，不用担心其他业务模块是否存在相同名称的资源，从而减少心智负担

2. **原生分布式架构**

EggJS 的定位是框架的框架，CabloyJS 后端在 EggJS 的基础上采用`自定义Loader`机制扩展出来了一套适配业务场景的新特性

比如，EggJS 原有的`Worker + Agent`进程模型，对于单机而言非常便利。但是面对多机集群，特别是基于`docker`的集群部署而言，`Agent进程`就失去了用武之地。更重要的是，如果一开始基于`Agent进程`进行开发，后续很难平滑的过渡到分布式场景。因此，CabloyJS 后端采用`Redis`，从框架底层就开始原生分布式的架构设计，并衍生出了`Broadcast、Queue、Schedule、Startup`等一系列分布式的开发组件，方便我们从一开始就进行分布式的开发。因此当系统起量后，可以轻松做集群扩展，参见：[Broadcast](https://cabloy.com/zh-cn/articles/broadcast.html), [Queue](https://cabloy.com/zh-cn/articles/queue.html), [Schedule](https://cabloy.com/zh-cn/articles/schedule.html), [Startup](https://cabloy.com/zh-cn/articles/startup.html)

3. **前后端分离，全场景开发**

通过前后端分离的架构设计，可以支持全场景业务的快速开发

| 场景                   | 前端                         | 后端          |
| ---------------------- | ---------------------------- | ------------- |
| PC：Web                | CabloyJS 前端                | CabloyJS 后端 |
| PC：Exe                | CabloyJS 前端 + Electron     | CabloyJS 后端 |
| Mobile：IOS            | CabloyJS 前端 + Cordova      | CabloyJS 后端 |
| Mobile：Android        | CabloyJS 前端 + Cordova      | CabloyJS 后端 |
| 微信公众号             | CabloyJS 前端 + 微信 API     | CabloyJS 后端 |
| 企业微信               | CabloyJS 前端 + 企业微信 API | CabloyJS 后端 |
| 钉钉                   | CabloyJS 前端 + 钉钉 API     | CabloyJS 后端 |
| Slack                  | CabloyJS 前端 + Slack API    | CabloyJS 后端 |
| 小程序：微信、支付宝等 | Uni-app + CabloyJS 前端 SDK  | CabloyJS 后端 |

- `后端`：由于完整的前后端分离设计，只需开发一套 CabloyJS 后端代码即可
- `前端`：所有可基于 H5 的场景，只需开发一套 CabloyJS 前端代码即可
- `小程序`：提供 CabloyJS 前端 SDK 让 Uni-app 可以轻松对接 CabloyJS 后端代码

## CabloyJS 可以开发什么系统

1. 可以开发`多租户SAAS业务系统`
2. 可以开发前后端分离的`中后台业务管理系统`，如 OA、CRM、ERP、电商，等等
3. 可以开发`JAMStack`架构的`CMS内容管理系统`，支持 SEO 优化，如博客、技术文档、社区、知识店铺，等等
4. 既可以先开发`后台业务管理系统`，再延伸开发`CMS内容管理系统`；也可以反过来，先开发`CMS内容管理系统`，再延伸开发`后台业务管理系统`
5. 可以通过`Cordova`开发各类 App 应用，支持 IOS、Android
6. 可以通过`Electron`开发桌面应用
7. 可以开发微信公众号、企业微信、钉钉，等第三方平台的应用，解决`信息孤岛`的问题
8. 可以为`Uniapp小程序`开发后端 API 接口

## CabloyJS 开发的正式系统

| 网站类型                    | 网站链接                                                                                       |
| --------------------------- | ---------------------------------------------------------------------------------------------- |
| 后台管理系统（PC 布局）     | [https://admin.cabloy.com](https://admin.cabloy.com)                                           |
| 后台管理系统（Mobile 布局） | ![cabloy-admin-qrcode](./docs/assets/images/cabloy-admin-qrcode.png)                           |
|                             |                                                                                                |
| 博客                        | [https://zhennann.com](https://zhennann.com)                                                   |
| 技术文档（英文）            | [https://cabloy.com/index.html](https://cabloy.com/index.html)                                 |
| 技术文档（中文）            | [https://cabloy.com/zh-cn/index.html](https://cabloy.com/zh-cn/index.html)                     |
| 社区（英文）                | [https://community.cabloy.com/index.html](https://community.cabloy.com/index.html)             |
| 社区（中文）                | [https://community.cabloy.com/zh-cn/index.html](https://community.cabloy.com/zh-cn/index.html) |
| 课程（英文）                | [https://course.cabloy.com/index.html](https://course.cabloy.com/index.html)                   |
| 课程（中文）                | [https://course.cabloy.com/zh-cn/index.html](https://course.cabloy.com/zh-cn/index.html)       |
| Cabloy 商店（英文）         | [https://store.cabloy.com/index.html](https://store.cabloy.com/index.html)                     |
| Cabloy 商店（中文）         | [https://store.cabloy.com/zh-cn/index.html](https://store.cabloy.com/zh-cn/index.html)         |

## CabloyJS 的研发历程

CabloyJS 从 2016 年启动开发，主要历经两个研发阶段：

### 1. 第一阶段：EggBornJS

EggBornJS 关注的核心就是`模块化体系`与`模块隔离`，并以此实现一套完整的全栈开发框架

比如模块`egg-born-front`是框架前端的核心模块，模块`egg-born-backend`是框架后端的核心模块，模块`egg-born`是框架的命令行工具，用于创建项目骨架

> 这也是为什么所有业务模块都是以`egg-born-module-`为命名前缀的原因

### 2. 第二阶段：CabloyJS

EggBornJS 只是一个基础的全栈开发框架，如果要支持业务的快速开发，还需要考虑许多与业务相关的支撑特性，如：`工作流引擎`、`用户管理`、`角色管理`、`权限管理`、`菜单管理`、`参数设置管理`、`表单验证`、`登录机制`，等等。特别是在前后端分离的场景下，对`权限管理`的要求就提升到一个更高的水平

CabloyJS 在 EggBornJS 的基础上，提供了一套核心业务模块，从而实现了一系列业务支撑特性，并将这些特性进行有机的组合，形成完整而灵活的上层生态架构，从而支持具体的业务开发进程

> 有了 EggBornJS，从此可复用的不仅仅是组件，还有业务模块

> 有了 CabloyJS，您就可以快速开发各类业务应用

## 信念

> 凡是可以用 JavaScript 来写的应用，最终都会用 JavaScript 来写 | Atwood 定律

相信，Javascript 的深度探索者都会被这句名言激发，共同努力，为 Javascript 生态添砖加瓦，构建更繁荣的应用生态

CabloyJS 正是对这一名言的探索之作。欢迎您也加入 CabloyJS 的社区生态，一起促进 Javascript 的繁荣与应用

## 名称的由来

### 1. EggBorn

这个名称的由来比较简单，因为有了 Egg(后端框架)，所以就有了 EggBorn。有一部动画片叫《天书奇谭》，里面的萌主就叫“蛋生”，我很喜欢看（不小心暴露了年龄 😅）

### 2. Cabloy

Cabloy 来自蓝精灵的魔法咒语，拼对了 Cabloy 这个单词就会有神奇的效果。同样，CabloyJS 是有关化学的魔法，基于模块的组合与生化反应，您将实现您想要的任何东西

## 部分特性摘要

### >>>>> 第一部分: 基础功能

- [Bean & AOP](https://cabloy.com/zh-cn/articles/bean.html)
  1. 几乎所有事物都是 Bean
  2. Bean 支持 AOP
  3. AOP 也是一种 Bean
- 基于`Redis`的分布式集群框架

  CabloyJS 通过`Redis`从框架底层就开始原生支持分布式，因此当系统起量后，可以轻松做集群扩展

  - [Broadcast](https://cabloy.com/zh-cn/articles/broadcast.html)
  - [Queue](https://cabloy.com/zh-cn/articles/queue.html)
  - [Schedule](https://cabloy.com/zh-cn/articles/schedule.html)
  - [Startup](https://cabloy.com/zh-cn/articles/startup.html)

- [前后端分离](https://cabloy.com/zh-cn/articles/f66dc04c64ca43fa9e8ea30312ca714f.html)
- I18N
  - [后端](https://cabloy.com/zh-cn/articles/f6d5a48f10dc40d3b8aed7862c23570b.html)
  - [前端](https://cabloy.com/zh-cn/articles/1c7c9cf3861744c2a63ae134076c652f.html)
- [主题](https://cabloy.com/zh-cn/articles/theme.html)
- [多租户/多域名/多实例](https://cabloy.com/zh-cn/articles/44e45b3928ca4c6cb63809558145e000.html)
- [测试驱动开发](https://cabloy.com/zh-cn/articles/990962d4e3604fc099c27806de6d6be8.html)

### >>>>> 第二部分: 业务功能

- [NodeJS 工作流引擎](https://cabloy.com/zh-cn/articles/flow-introduce.html)

  众所周知，NodeJS 作为后端开发语言和运行环境，样样都好，就差一个`NodeJS工作流引擎`。CabloyJS 4.0 重点开发了`NodeJS工作流引擎`，并作为内置的基础核心模块，近一步拓展了 NodeJS 在后端的应用场景，为深入研发各类商业业务逻辑，提供了基础支撑

- [自适应布局: pc = mobile + pad](https://cabloy.com/zh-cn/articles/adaptive-layout.html)

  CabloyJS 首创`pc = mobile + pad`的自适应布局机制：只需要一套代码，`mobile端`达到原生效果，同时将`mobile端`的操控体验和开发模式无缝带入`pc端`

- 拖拽
  - [移动](https://cabloy.com/zh-cn/articles/dragdrop-move.html)
  - [调整尺寸](https://cabloy.com/zh-cn/articles/dragdrop-resize.html)
- [仪表板](https://cabloy.com/zh-cn/articles/5c90f4fd15174772adb34dfbf6d1adfb.html)
- [PC 布局](https://cabloy.com/zh-cn/articles/28f14f839af5457b9243c9e9210d5324.html)
- [统一数据管理](https://cabloy.com/zh-cn/articles/atom-basic.html)
- [统一用户角色权限管理](https://cabloy.com/zh-cn/articles/535f42e8fb8c487fb33b88c9a9e56a7e.html)
- [明细数据管理](https://cabloy.com/zh-cn/articles/detail-basic.html)
- Socket IO
  - 统计值自动更新、自动推送机制
  - [进度条](https://cabloy.com/zh-cn/articles/10327f8fdae44d87b7604ba3fa9c1a89.html)
- [内置大量核心模块](https://cabloy.com/zh-cn/articles/e678d328cb5b4efdaf5d60c8df1ca691.html)

### >>>>> 第三部分: 解决方案

出于`开箱即用`的诉求，CabloyJS 提供了以下业务场景的解决方案，并将持续增加：

| 名称                                                                           | 说明                                                                                                                                                           |
| ------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [Cabloy-CMS](https://cabloy.com/zh-cn/articles/cms-introduce.html)             | `动静结合(即JAMStack模式)`的 CMS，可以快速构建`企业网站`、`博客`、`技术文档`、`社区`、`商城`等 Web 应用                                                        |
| [Cabloy-Community](https://cabloy.com/zh-cn/articles/community-introduce.html) | 基于 Cabloy-CMS 开发的社区（论坛）Web 应用                                                                                                                     |
| [Cabloy-微信](https://cabloy.com/zh-cn/articles/wechat-introduce.html)         | `微信接口模块`，当前整合了`微信公众号`、`微信Web登录`和`微信小程序`的接口，达到`开箱即用`的使用效果。在`Cabloy-微信`的基础上，可以很方便的开发各类微信业务系统 |
| [Cabloy-企业微信](https://cabloy.com/zh-cn/articles/wxwork-introduce.html)     | `企业微信接口模块`，当前整合了`自建应用`和`企业微信小程序`的接口，达到`开箱即用`的使用效果。在`Cabloy-企业微信`的基础上，可以很方便的开发各类企业微信业务系统  |
| [Cabloy-钉钉](https://cabloy.com/zh-cn/articles/dingtalk-introduce.html)       | `钉钉接口模块`，当前整合了`H5微应用`和`钉钉小程序`的接口，达到`开箱即用`的使用效果。在`Cabloy-钉钉`的基础上，可以很方便的开发各类钉钉业务系统                  |
| [Cabloy-Uniapp](https://cabloy.com/zh-cn/articles/uniapp-introduce.html)       | `Cabloy-Uniapp`专门为`Uniapp`应用提供了一套量身定制的`前端SDK`，用于便捷的访问 CabloyJS 提供的所有 API 接口，让`Uniapp`前端开发再无`后顾之忧`                  |

## 资源

### - 英文版

- [CabloyJS Store](https://store.cabloy.com/index.html)
- [CabloyJS Courses](https://course.cabloy.com/index.html)
- [CabloyJS Community](https://community.cabloy.com/index.html)
- [CabloyJS Awesome](./docs/awesome.md)

### - 中文版

- [CabloyJS 商店](https://store.cabloy.com/zh-cn/index.html)
- [CabloyJS 课程](https://course.cabloy.com/zh-cn/index.html)
- [CabloyJS 社区](https://community.cabloy.com/zh-cn/index.html)
- [CabloyJS Awesome](./docs/awesome.zh-CN.md)

### - CabloyJS 官方交流群

请添加个人微信，联系加群，备注：`加群`

![wx-zhennann](./docs/assets/images/wx-zhennann.jpg)

### - 图片

一图胜千言: [如何学习使用 CabloyJS](https://cabloy.com/zh-cn/articles/how-to-read.html)

![how-to-read](./docs/assets/images/zh-cn/how-to-read.png)

## 预览

- 白色主题

![白色主题](./docs/assets/images/zh-cn/theme/theme-light.png)

- 暗色主题

![暗色主题](./docs/assets/images/zh-cn/theme/theme-dark.png)

- 风信子主题

![风信子主题](./docs/assets/images/zh-cn/theme/theme-hyacinth.png)

- 灿烂主题

![灿烂主题](./docs/assets/images/zh-cn/theme/theme-brilliant.png)

- 显示侧边栏

![显示侧边栏](./docs/assets/images/zh-cn/theme/theme-light-panel.png)

- 移动端风格

![移动端风格](./docs/assets/images/zh-cn/theme/theme-light-mobile-bg.png)

## License

[MIT](./LICENSE)
