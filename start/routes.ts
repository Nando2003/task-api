import router from '@adonisjs/core/services/router'
import AuthController from '#controllers/auth_controller'
import { middleware } from '#start/kernel';

const authController = new AuthController()

router.post('/auth/register', authController.register)
router.post('/auth/login', authController.login)
router.post('/auth/refresh', authController.refresh)

router.group(
  () => {
    router.post('/auth/logout', authController.logout)
    router.get('/me', authController.me)
  }
).use(middleware.jwtAuth())
