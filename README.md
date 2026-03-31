# Kixyu Books

一个为 Halo 设计的极简书籍化主题。

Kixyu Books 的重点不是信息流展示，而是连续阅读。首页像扉页，目录像章节索引，文章页强调正文、目录与前后章节之间的关系，让整个站点更像一本持续更新的数字书。

## 特点

- 极简、安静、克制的阅读型视觉风格
- 首页封面、目录页、文章页、单页的基础阅读骨架
- 分类、标签以书末索引式方式呈现
- 文章页支持目录、图片全屏查看、前后章节跳转
- 支持亮色、暗色、跟随系统三种模式
- 目录页支持搜索入口与页码跳转

## 页面说明

- `/`：首页扉页
- `/preface`：序页
- `/archives`：目录页
- `/about`：关于页
- `/message`：留言页

## 使用要求

- Halo `> 2.23.0`

将主题放入 Halo 工作目录的 `themes` 目录后，在 Halo Console 中安装并启用即可。

## 目录结构

```text
.
├── LICENSE
├── README.md
├── theme.yaml
└── templates/
    ├── archives.html
    ├── categories.html
    ├── category.html
    ├── index.html
    ├── page.html
    ├── post.html
    ├── tag.html
    ├── tags.html
    └── assets/
        ├── css/
        └── js/
```

## 许可

本项目使用 [MIT License](https://github.com/kkyu9527/kixyu-books/blob/main/LICENSE)。
