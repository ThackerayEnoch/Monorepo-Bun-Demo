import { createApp } from "./app";
import { createAuthRepo } from "./auth/repo";
import { createAuthService } from "./auth/service";
import { createMemorySessionRepo } from "./auth/session.memory";
import { createDatabase, migrate } from "./database/client";
import { env } from "./env";
//--------------------------------------------
// 引入不同文件夹的service
import { createTodoRepo } from "./home/repo";
//--------------------------------------------
await migrate();

const database = createDatabase();
const authRepo = createAuthRepo(database);
const sessionRepo = createMemorySessionRepo();
const authService = createAuthService(authRepo, sessionRepo);
const app = createApp(createTodoRepo(database), authService);

const server = { port: env.PORT, hostname: env.HOSTNAME, fetch: app.fetch };

export default server;
