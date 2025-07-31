import { BaseModel, column, belongsTo } from "@adonisjs/lucid/orm";
import type { BelongsTo } from "@adonisjs/lucid/types/relations";
import { DateTime } from "luxon";
import User from "./user.js";


export default class RefreshToken extends BaseModel {
    @column({ isPrimary: true })
    declare id: number

    @column({ columnName: 'user_id' })
    declare userId: number

    @column()
    declare token: string

    @column()
    declare jti: string

    @column.dateTime({ columnName: 'expires_at' })
    declare expiresAt: DateTime

    @belongsTo(() => User)
    declare user: BelongsTo<typeof User>
}