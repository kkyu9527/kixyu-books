# Kixyu Books

一个为 Halo 设计的极简书籍化主题，预览：https://kixyu9527.com/

`Kixyu Books` 的重点不是信息流展示，而是连续阅读。首页像扉页，目录像全书目录，文章页强调正文、目录与前后章节之间的关系，让整个站点更像一本持续更新的数字书。

## 特点

- 极简、安静、克制的阅读型视觉风格
- 首页扉页、目录页、文章页、单页组成完整的阅读骨架
- 分类、标签以书末索引式方式呈现
- 文章页支持目录导航、图片全屏查看、前后章节跳转
- 支持亮色、暗色、跟随系统三种模式
- 目录页支持搜索入口与页码跳转
- 已接入主题设置，可在 Halo 后台配置配色、页脚、备案与 Docsme 模板来源

## 页面说明

- `/`：首页扉页
- `/preface`：序页
- `/archives`：目录页
- `/categories`：分类索引
- `/tags`：标签索引
- `/links`：友情链接页
- `/photos`：图库页
- `/moments`：瞬间页
- `/docs`：文档页
- `/about`：关于页
- `/message`：留言页

说明：
上述插件页面需要对应 Halo 插件已经安装并提供数据。

## 已支持的插件能力

- 搜索组件：`PluginSearchWidget`
- 友情链接页：`/links`
- 图库页：`/photos`
- 瞬间页：`/moments`
- Docsme 文档页：`docs`、`doc`、`doc-catalog`

其中 Docsme 支持两种模式：

- 使用当前主题风格模板
- 使用插件默认模板

## 主题设置

主题已启用 `settings.yaml`，当前支持以下配置：

- 默认配色
- 是否允许访客切换配色
- 是否显示页脚
- 页脚标题
- 页脚说明
- ICP 备案信息
- 公安备案信息
- Docsme 模板来源

## 使用要求

- Halo `> 2.23.0`

## 安装方式

1. 将主题目录放入 Halo 工作目录的 `themes` 目录，或使用 Release 中的 zip 包上传安装。
2. 在 Halo Console 中安装并启用主题。
3. 进入主题设置，按需调整配色、页脚、备案与 Docsme 配置。
4. 如果需要使用 `/links`、`/photos`、`/moments`、`/docs` 等页面，请先安装对应插件。

## 目录结构

```text
.
├── LICENSE
├── README.md
├── settings.yaml
├── theme.yaml
└── templates/
    ├── archives.html
    ├── categories.html
    ├── category.html
    ├── doc-catalog.html
    ├── doc.html
    ├── docs.html
    ├── index.html
    ├── links.html
    ├── moments.html
    ├── page.html
    ├── photos.html
    ├── post.html
    ├── tag.html
    ├── tags.html
    ├── assets/
    │   ├── css/
    │   └── js/
    └── fragments/
        ├── assets.html
        └── footer.html
```


## 许可

本项目使用 [MIT License](https://github.com/kkyu9527/kixyu-books/blob/main/LICENSE)。
