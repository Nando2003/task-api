import RefreshToken from "#models/refresh_token";
import User from "#models/user";
import AuthService from "#services/auth_service";
import { HttpContext } from "@adonisjs/core/http";

export default class JwtAuthMiddleware {
  public async handle(ctx: HttpContext, next: () => Promise<void>) {
    const { request, response } = ctx
    const header = request.header('Authorization')

    if (!header?.startsWith('Bearer ')) {
      return response.unauthorized({ message: 'Invalid or missing token' })
    }

    const token = header.substring(7);

    try {
      const { sub, jti } = await AuthService.verifyToken(token)

      await RefreshToken.query()
          .where('user_id', sub)
          .andWhere('jti', jti)
          .firstOrFail()

      const user = await User.findOrFail(sub)
      ;(request as any).user = user
      await next()
        
    } catch (error) {
      return response.unauthorized({ message: 'Invalid or expired token' });
      
    }
  }
}