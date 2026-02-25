# Viba Studio V2

Viba Studio V2 是一个 AI 图像工作台，支持图像衍生生成（Derivation）、Avatar 生成、虚拟试衣（Try-On）和场景换人（Swap），并内置账号系统与历史记录。

## 功能概览

- Derivation：基于上传图片进行描述与多张变体生成
- Avatar：基于多张参考图生成人物形象图
- Try-On：将服装图合成到人物图上
- Swap：将人物替换到目标场景中
- Auth：邮箱/密码登录注册，JWT 鉴权
- History：生成历史持久化（PostgreSQL），可选接入 Cloudflare R2 存储图片
- Model Config：按功能维度切换 Gemini 模型

## 技术栈

- Frontend：React 19 + TypeScript + Vite + React Router
- Backend：Node.js + Express + TypeScript + Sequelize
- AI：Google Gemini（`@google/genai`）
- Database：PostgreSQL（推荐 Supabase）
- Object Storage（可选）：Cloudflare R2
- Deploy：Vercel（前端）+ Render（后端）

## 项目结构

```text
viba_studio_v2/
├── frontend/              # React 前端
├── backend/               # Express API
├── docker-compose.yml     # 容器编排（镜像模式）
├── render.yaml            # Render Blueprint
└── DEPLOYMENT.md          # 云部署说明
```

## 本地开发

### 1) 环境要求

- Node.js 22+（与 Dockerfile 对齐）
- npm 10+
- PostgreSQL（本地或 Supabase）

### 2) 安装依赖

```bash
cd backend && npm install
cd ../frontend && npm install
```

### 3) 配置环境变量

后端新建 `backend/.env`：

```env
PORT=3001
DATABASE_URL=postgresql://postgres:password@localhost:5432/viba_db
DB_SSL=false
JWT_SECRET=replace_with_a_long_random_secret
GEMINI_API_KEY=your_gemini_api_key

# 可选：Cloudflare R2
R2_ACCOUNT_ID=
R2_ACCESS_KEY_ID=
R2_SECRET_ACCESS_KEY=
R2_BUCKET_NAME=
R2_PUBLIC_URL=
```

前端新建 `frontend/.env.local`：

```env
VITE_API_URL=http://localhost:3001/api/v1
```

### 4) 启动服务

分别开两个终端：

```bash
# Terminal 1
cd backend
npm run dev

# Terminal 2
cd frontend
npm run dev
```

默认访问：

- Frontend: `http://localhost:3000`
- Backend Health: `http://localhost:3001/health`

## API 概览

Base URL：`/api/v1`

- Auth
- `POST /auth/register`
- `POST /auth/login`
- `GET /auth/me`（需 Bearer Token）
- Generations（需 Bearer Token）
- `POST /generations/derivations`
- `POST /generations/avatar`
- `POST /generations/try-on`
- `POST /generations/swap`
- `POST /generations`（保存记录）
- `GET /generations`（拉取历史）
- `DELETE /generations/:id`

## Docker 运行（可选）

当前 `docker-compose.yml` 采用镜像模式（`image:`），建议先本地构建镜像：

```bash
docker build -t viba-studio-backend:latest ./backend
docker build -t viba-studio-frontend:latest ./frontend
docker compose up -d
```

启动后：

- Frontend: `http://localhost:8081`
- Backend: `http://localhost:3001`

## 部署

详细步骤见 [DEPLOYMENT.md](./DEPLOYMENT.md)：

- 前端：Vercel（Root Directory: `frontend`）
- 后端：Render（Root Directory: `backend`，可用 `render.yaml`）
- 数据库：Supabase PostgreSQL

## 常见问题

- `Missing required environment variables: JWT_SECRET`：检查 `backend/.env`
- `DATABASE_URL is missing`：补齐数据库连接串
- Gemini 调用失败：检查 `GEMINI_API_KEY` 是否有效
- 前端请求后端失败：检查 `VITE_API_URL` 和 CORS
