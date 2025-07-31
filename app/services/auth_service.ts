import RefreshToken from '#models/refresh_token'
import User from '#models/user'
import jwt, { Secret, SignOptions } from 'jsonwebtoken'
import { DateTime } from 'luxon'
import { v4 as uuidv4 } from 'uuid'


interface TokenPayload {
  sub: number
  email: string
  iat: number
  exp: number
  jti: string
}

export default class AuthService {
    private static jwtSecret: Secret = process.env.JWT_SECRET as Secret
    private static accessTokenExpiresIn: SignOptions['expiresIn'] = process.env.ACCESS_TOKEN_EXPIRES_IN as SignOptions['expiresIn']
    private static refreshTokenExpiresIn: SignOptions['expiresIn'] = process.env.REFRESH_TOKEN_EXPIRES_IN as SignOptions['expiresIn']

    public static async generateTokens(user: User): Promise<{ accessToken: string; refreshToken: string }> {
        const sessionId = uuidv4()
        const payload = { sub: user.id, email: user.email }
        const accessOptions: SignOptions = {expiresIn: this.accessTokenExpiresIn, jwtid: sessionId}
        const refreshOptions: SignOptions = {expiresIn: this.refreshTokenExpiresIn, jwtid: sessionId}

        console.log(`expiresIn: ${this.refreshTokenExpiresIn}`)
        console.log(`expiresIn: ${this.accessTokenExpiresIn}`)

        const accessToken = jwt.sign(payload, this.jwtSecret, accessOptions)
        const refreshToken = jwt.sign(payload, this.jwtSecret, refreshOptions)

        const { exp } = jwt.decode(refreshToken) as { exp: number }
        const expiresAt = DateTime.fromSeconds(exp)

        await RefreshToken.create({
            userId: user.id,
            token: refreshToken,
            jti: sessionId,
            expiresAt: expiresAt,
        })

        return { accessToken, refreshToken }
    }

    public static async verifyToken(token: string): Promise<TokenPayload> {
        const decoded = jwt.verify(token, this.jwtSecret)

        if (typeof decoded === 'string') {
            throw new Error('Invalid token')
        }

        const hasSub = typeof decoded.sub === 'number'
        const hasEmail = typeof decoded.email === 'string'
        const hasIat = typeof decoded.iat === 'number'
        const hasExp = typeof decoded.exp === 'number'
        const hasJti = typeof decoded.jti === 'string'

        if (!hasSub || !hasEmail || !hasIat || !hasExp || !hasJti) {
            throw new Error('Payload is missing required fields')
        }

        return decoded as unknown as TokenPayload
    }

    public static async refresh(oldToken: string): Promise<{ accessToken: string; refreshToken: string }> {
        const { sub } = await this.verifyToken(oldToken);

        const stored = await RefreshToken.query()
            .where('token', oldToken)
            .andWhere('user_id', sub)
            .firstOrFail();

        await stored.delete()

        const user = await User.findOrFail(sub)
        return this.generateTokens(user)
    }

    public static async revokeAll(token: string) {
        const { jti, sub } = jwt.decode(token) as any

        await RefreshToken.query()
            .where('user_id', sub)
            .andWhere('jti', jti)
            .delete()
    }
}   

