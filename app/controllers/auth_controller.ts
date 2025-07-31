import { compare } from 'bcryptjs'
import User from '#models/user';
import AuthService from '#services/auth_service';
import { loginValidator } from '#validators/login';
import { registerValidator } from '#validators/register'
import type { HttpContext } from '@adonisjs/core/http'
import { refreshTokenValidator } from '#validators/refresh';

export default class AuthController {
  /**
   * @register
   * @requestBody { "email": "string", "password": "string" }
   * @responseBody 201 - { "user": { "id": "number", "email": "string" }, "accessToken": "string", "refreshToken": "string" }
   */
  public async register({ request, response }: HttpContext) {
    const data = await request.all();
    const payload = await registerValidator.validate(data);

    if (await User.query().where('email', payload.email).first()) {
      return response.unprocessableEntity({
        errors: [
          {
            message: 'The email has already been taken',
            rule: 'database.unique',
            field: 'email',
          },
        ],
      });
    }

    const user = await User.create(payload);
    const tokens = await AuthService.generateTokens(user);
    return response.created({ user: { id: user.id, email: user.email }, ...tokens });
  }

  /**
   * @login
   * @requestBody { "email": "string", "password": "string" }
   * @responseBody 200 - { "accessToken": "string", "refreshToken": "string" }
   */
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

  /**
   * @refresh
   * @requestBody { "refreshToken": "string" }
   * @responseBody 200 - { "accessToken": "string", "refreshToken": "string" }
   */
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

  /**
   * @logout
   * @responseBody 204 - No Content
   */
  public async logout({ request, response }: HttpContext) {
    const header = request.header('Authorization')!
    const token  = header.replace('Bearer ', '')
    await AuthService.revokeAll(token)
    return response.noContent()
  }

  /**
   * @me
   * @responseBody 200 - { "id": "number", "email": "string" }
   */
  public async me({ request, response }: HttpContext) {
    const user = (request as any).user as User;
    return response.ok({ id: user.id, email: user.email });
  }
}