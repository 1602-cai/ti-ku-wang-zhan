# 部署指南

## 方式一：GitHub Pages（推荐）

### 1. 创建 GitHub 仓库

1. 登录 GitHub 账号
2. 点击右上角 `+` → `New repository`
3. 仓库名称填 `ti-ku-wang-zhan`（或你喜欢的名字）
4. 选择 `Public`（公开）
5. 点击 `Create repository`

### 2. 推送代码到 GitHub

在项目文件夹中打开终端，执行：

```bash
# 初始化 Git 仓库（如果没有）
git init

# 添加所有文件
git add .

# 提交
git commit -m "初始提交"

# 关联远程仓库（替换为你的仓库地址）
git remote add origin https://github.com/你的用户名/ti-ku-wang-zhan.git

# 推送到 main 分支
git branch -M main
git push -u origin main
```

### 3. 配置 GitHub Pages

1. 打开你的 GitHub 仓库页面
2. 点击 `Settings`（设置）
3. 左侧菜单点击 `Pages`
4. Source 部分选择 `GitHub Actions`
5. 等待 GitHub Actions 自动部署

### 4. 访问网站

部署完成后，在 GitHub Pages 设置页面可以看到网站地址，例如：
`https://你的用户名.github.io/ti-ku-wang-zhan/`

---

## 方式二：Vercel（备选）

如果你更喜欢使用 Vercel：

1. 访问 [vercel.com](https://vercel.com)
2. 使用 GitHub 账号登录
3. 点击 `New Project`
4. 导入你的 GitHub 仓库
5. 点击 `Deploy`

---

## 更新网站

当你修改了代码后，只需要：

```bash
git add .
git commit -m "描述你的修改"
git push origin main
```

GitHub Actions 会自动重新部署网站。

---

## 常见问题

**Q: 网站打开是空白的？**

A: 检查仓库名称和 vite.config.js 中的 base 配置是否一致。

**Q: 数据加载不出来？**

A: 确保 public/data 文件夹已上传到 GitHub，并且在部署时正确复制到了 dist 目录。

**Q: 如何更换域名？**

A: 在 GitHub Pages 设置中可以添加自定义域名。
