import router from '@adonisjs/core/services/router'
import AuthController from '#controllers/auth_controller'
import { middleware } from '#start/kernel';
import TasksController from '#controllers/tasks_controller';

const authController = new AuthController()
const taskController = new TasksController()

router.post('/auth/register', authController.register)
router.post('/auth/login', authController.login)
router.post('/auth/refresh', authController.refresh)

router.group(
  () => {
    router.post('/auth/logout', authController.logout)
    router.get('/me', authController.me)
    router.post('/tasks', taskController.create)
    router.get('/tasks', taskController.index)
    router.get('/tasks/:id', taskController.show)
    router.delete('/tasks/:id', taskController.destroy)
    router.put('/tasks/:id', taskController.update)
    router.patch('/tasks/:id', taskController.patch)
  }
).use(middleware.jwtAuth())
