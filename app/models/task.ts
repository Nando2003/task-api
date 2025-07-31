import { DateTime } from 'luxon'
import type { BelongsTo } from "@adonisjs/lucid/types/relations";
import { BaseModel, belongsTo, column } from '@adonisjs/lucid/orm'
import User from './user.js'

export default class Task extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare title: string

  @column()
  declare description: string

  @column()
  declare status: 'pending' | 'completed'

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @column({columnName: 'user_id'})
  declare userId: number

  @belongsTo(() => User)
  declare user: BelongsTo<typeof User>
}