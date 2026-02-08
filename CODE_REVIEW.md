# Viba Studio V2 - Code Review & Remediation Plan (Updated)

**Date**: 2026-02-08  
**Updated By**: Codex  
**Focus**:
1. 功能可用性优先（尤其是注册/登录与核心生成链路）
2. 本地改代码后通过 GitHub 自动部署到 EC2 Docker
3. 低性能实例（如 t3.small）下的稳定运行

---

## 0. 本次更新说明

本版本基于仓库代码静态审查 + 本地构建结果更新，不再沿用不够准确的结论。  
说明：
- 本地环境无法直接访问你的线上域名（DNS 解析受限），因此“线上运行态”结论来自代码证据 + 你提供的现象（注册不可用）。
- 前端、后端本地构建均通过。
- 本次更新新增：密钥泄露风险、历史保存混合格式上传缺陷、前端本地持久化容量风险、ObjectURL 释放问题。

---

## 1. 目标与验收标准

### 1.1 当前阶段目标
1. 保证核心功能可用（注册、登录、核心生成、历史可读）
2. `git push main` 后自动部署到 EC2 并可用
3. 性能要求“够用即可”，优先稳定

### 1.2 验收标准
1. 访问 `http://<EC2>:8081/` 可完成注册与登录
2. `/api/v1/auth/register` 返回 201（非 500）
3. 部署流水线在失败时明确失败，不出现“假成功”
4. 生成历史图片不会在短时间后失效

---

## 2. 关键发现（按严重级别）

## P0（立即修复）

### P0-0 生产密钥已被提交到仓库（最高优先级安全风险）
**证据**
- `backend/.env` 存在真实的 `DATABASE_URL`、`R2_*`、`JWT_SECRET` 等敏感信息。

**影响**
- 任何获得仓库访问权限的人都可直接访问数据库与对象存储；若仓库被公开或泄露，后果严重。

**结论**
- 必须立即移除该文件、清理 git 历史并轮换全部密钥。

### P0-1 注册失败的高概率根因：`JWT_SECRET` 在部署链路中未被可靠注入
**证据**
- `backend/src/controllers/authController.ts:28`、`backend/src/controllers/authController.ts:59`  
  `jwt.sign(..., process.env.JWT_SECRET as string, ...)` 直接使用环境变量。
- `.github/workflows/deploy.yml:63-101`  
  仅同步 `docker-compose.yml` 并重启容器，没有创建/更新 EC2 运行时 `.env`。
- `docker-compose.yml:32`  
  后端依赖 `JWT_SECRET=${JWT_SECRET}`。

**影响**
- `JWT_SECRET` 为空时注册/登录会在签发 token 阶段触发 500。

**结论**
- 与“线上注册不可用”高度一致，优先级 P0。

---

### P0-2 历史图片可用性缺陷：R2 记录了 URL 而非 Key，导致过期与清理失败
**证据**
- `backend/src/controllers/generationController.ts:24` 上传后写入 `getImageUrl(key)`（URL）
- `backend/src/services/r2Service.ts:149` 签名 URL 默认 1 小时过期
- `backend/src/controllers/generationController.ts:316` 仅当字段像 `users/...` key 才刷新 URL
- `backend/src/controllers/generationController.ts:366` 删除时也仅处理 key

**影响**
- 历史图一段时间后打不开；删除历史无法回收对象存储。

---

## P1（尽快修复）

### P1-1 Derivation 重复落库，且前端写入了不可持久的 blob URL
**证据**
- 后端接口已自动保存历史：`backend/src/controllers/generationController.ts:66`
- 前端又调用一次保存：`frontend/views/DerivationView.tsx:67`
- 前端保存输入图使用 `blob:` 预览地址：`frontend/views/DerivationView.tsx:69`
- 后端只识别 `data:` 进行 R2 上传：`backend/src/controllers/generationController.ts:259`

**影响**
- 历史重复、部分记录输入图不可回放。

---

### P1-2 自动部署缺少健康检查与失败判定
**证据**
- `.github/workflows/deploy.yml:95-101` 只有 `pull/up/prune`，没有健康检查和失败条件。

**影响**
- 服务未真正可用时，流水线可能仍显示成功。

---

## P2（中期修复）

### P2-1 `docker-compose` 命令兼容性风险
**证据**
- 使用 `docker-compose`：`.github/workflows/deploy.yml:95`
- 新环境常见 `docker compose` 插件形态。

### P2-2 `deploy.resources` 在非 Swarm 模式通常不生效
**证据**
- `docker-compose.yml:17-20` 使用 `deploy.resources.limits`。

### P2-3 生产环境使用 `sequelize.sync({ alter: true })`
**证据**
- `backend/src/config/database.ts:36`

**影响**
- 启动时隐式改表，增加线上不确定性。

### P2-4 `createGeneration` 混合格式上传导致非 base64 被当作 base64 上传
**证据**
- `backend/src/controllers/generationController.ts:256-278`  
  只要检测到任意 `data:`，就把整个数组交给 `uploadImagesToR2`。

**影响**
- 传入已是 URL 的项会被当作 base64 处理，覆盖/损坏历史记录。

### P2-5 前端本地持久化可能因 base64 体积过大失败
**证据**
- `frontend/contexts/JobsContext.tsx:47-65`  
  `localStorage.setItem` 未做 try/catch，且可能写入大体积 base64。

**影响**
- 超过浏览器配额会持续抛错并导致历史持久化失败。

---

## P3（可优化）

### P3-1 历史管理架构不一致
**证据**
- TryOn 使用局部 state：`frontend/views/TryOnView.tsx:30`
- Derivation 引入未用方法：`frontend/views/DerivationView.tsx:8`

### P3-2 ObjectURL 未释放，可能导致内存泄漏
**证据**
- `frontend/components/ImageUpload.tsx:28-35`  
  `URL.createObjectURL` 未在清理或卸载时 `revoke`。

**影响**
- 频繁上传或切换图片会累积内存占用。

---

## 3. 修复计划（更新后）

## 阶段 A（今天完成，先恢复注册可用）

1. 后端启动前校验关键环境变量（至少 `DATABASE_URL`、`JWT_SECRET`）
2. 部署工作流增加 EC2 `.env` 注入/更新（来自 GitHub Secrets）
3. 部署后执行健康检查，失败则让 workflow 直接失败
4. 在 EC2 验证注册接口可用

**验收**
- `POST /api/v1/auth/register` 返回 201
- 前端注册页可成功跳转登录态

---

## 阶段 B（本周内，修数据正确性）

1. R2 入库改为存 `key`，读取时动态换 URL
2. 删除历史时基于 key 清理 R2 对象
3. 去掉 Derivation 前端二次 `saveGeneration`（以后端自动保存为准）

**验收**
- 历史图片 24 小时后仍可访问
- 删除历史后 R2 对象同步清理
- 不再出现重复历史记录

---

## 阶段 C（稳定性与运维）

1. workflow 命令兼容 `docker compose`
2. 明确资源限制策略（非 Swarm 不依赖 `deploy.resources`）
3. 从 `sync({ alter: true })` 迁移到 migration
4. 清理仓库中的敏感文件并轮换密钥

---

## 4. 针对“注册不可用”的最小排查清单（EC2）

```bash
# 1) 查看关键环境变量是否存在
docker exec viba_backend sh -lc 'echo "JWT_SECRET=${JWT_SECRET:-<empty>}"; echo "DATABASE_URL=${DATABASE_URL:+set}"'

# 2) 查看后端错误日志
docker logs viba_backend --tail 200

# 3) 从机器本地直测注册接口
curl -i -X POST http://localhost:8081/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"check@example.com","password":"test123456","full_name":"Check"}'
```

如果第 1 步显示 `JWT_SECRET=<empty>`，即可直接判定当前注册失败主因。

---

## 5. 建议落地顺序（按收益/风险）

1. 先修部署环境变量注入 + 启动校验（立即恢复注册）
2. 再修 R2 key/url 与重复历史（避免后续数据债）
3. 最后做迁移与部署健壮性优化（compose/migration/资源限制）

---

## 6. 当前结论

现阶段最关键的不是继续加功能，而是先把“部署后必可注册”这条链路固定下来。  
在你当前代码下，**`JWT_SECRET` 注入缺失**是导致“线上注册不可用”的最高概率问题；同时，R2 历史存储逻辑存在确定性可用性缺陷，建议在注册恢复后立即处理。
