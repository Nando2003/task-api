import User from "#models/user";
import AuthService from "#services/auth_service";
import { HttpContext } from "@adonisjs/core/http";

export default class JwtAuthMiddleware {
    public async handle({ request, response }: HttpContext, next: () => Promise<void>) {
        const header = request.header('Authorization');

        if (!header?.startsWith('Bearer ')) {
            return response.unauthorized({ message: 'Invalid token' });
        }

        const token = header.split(' ')[1];
        try {
            const { sub } = await AuthService.verifyToken(token);
            const user = await User.findOrFail(sub);

            (request as any).user = user;
            await next();
            
        } catch (error) {
            return response.unauthorized({ message: 'Invalid or expired token' });
        }
    }
}