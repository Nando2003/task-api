import { hash } from 'bcryptjs'
import { DateTime } from 'luxon'
import type { HasMany } from "@adonisjs/lucid/types/relations";
import { BaseModel, beforeSave, column, hasMany } from '@adonisjs/lucid/orm'
import RefreshToken from './refresh_token.js';

export default class User extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare email: string;

  @column({ serializeAs: null })
  declare password: string;

  @hasMany(() => RefreshToken)
  declare refreshTokens: HasMany<typeof RefreshToken>

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime
  
  @beforeSave()
  public static async hashPassword(user: User) {
    if (user.$dirty.password) {
      user.password = await hash(user.password, 10)
    }
  }
}