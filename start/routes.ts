import router from '@adonisjs/core/services/router'
import { middleware } from '#start/kernel';
import swagger from "#config/swagger";
import AutoSwagger from "adonis-autoswagger";

router.get("/swagger", async () => {
  return AutoSwagger.default.docs(router.toJSON(), swagger);
});

router.get("/docs", async () => {
  return AutoSwagger.default.ui("/swagger", swagger);
});

const AuthController = () => import('#controllers/auth_controller')
const TasksController = () => import('#controllers/tasks_controller')

router.post('/auth/register', [AuthController, 'register'])
router.post('/auth/login', [AuthController, 'login'])
router.post('/auth/refresh', [AuthController, 'refresh'])

router.group(
() => {
  router.post('/auth/logout', [AuthController, 'logout'])
  router.get('/auth/me', [AuthController, 'me'])

  router.post('/tasks', [TasksController, 'create'])
  router.get('/tasks', [TasksController, 'index'])
  router.get('/tasks/:id', [TasksController, 'show'])
  router.delete('/tasks/:id', [TasksController, 'destroy'])
  router.put('/tasks/:id', [TasksController, 'update'])
  router.patch('/tasks/:id', [TasksController, 'patch'])
  
}
).use(middleware.jwtAuth())
