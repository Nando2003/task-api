import { compare } from 'bcryptjs'
import User from '#models/user';
import AuthService from '#services/auth_service';
import { loginValidator } from '#validators/login';
import { registerValidator } from '#validators/register'
import type { HttpContext } from '@adonisjs/core/http'
import { refreshTokenValidator } from '#validators/refresh';

export default class AuthController {
  public async register({ request, response }: HttpContext) {
    const data = await request.all();
    const payload = await registerValidator.validate(data);
    const user = await User.create(payload);
    const tokens = await AuthService.generateTokens(user);
    return response.created({ user: { id: user.id, email: user.email }, ...tokens });
  }

  public async login({ request, response }: HttpContext) {
    const data = await request.all();
    const { email, password } = await loginValidator.validate(data);
    const user = await User.query().where('email', email).firstOrFail();

    if (!(await compare(password, user.password))) {
      return response.unauthorized({ message: 'Invalid credentials' })
    }

    const tokens = await AuthService.generateTokens(user)
    return response.ok(tokens);
  }

  public async refresh({ request, response }: HttpContext) {
    const data = await request.all();
    const { refreshToken } = await refreshTokenValidator.validate(data);
    try {
      const tokens = await AuthService.refresh(refreshToken)
      return response.ok(tokens)
    } catch (error) {
      return response.unauthorized({ message: 'Invalid refresh token' })
    }
  }

  public async logout({ request, response }: HttpContext) {
    const header = request.header('Authorization')!
    const token  = header.replace('Bearer ', '')
    await AuthService.revokeAll(token)
    return response.noContent()
  }

  public async me({ request, response }: HttpContext) {
    const user = (request as any).user as User;
    return response.ok({ id: user.id, email: user.email });
  }
}