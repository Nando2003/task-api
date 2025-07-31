import vine from '@vinejs/vine'

export const taskValidator = vine.compile(
  vine.object({
    title: vine.string().maxLength(255),
    description: vine.string().maxLength(1000),
    status: vine.enum(['pending', 'completed'] as const),
  })
)

export const taskPatchValidator = vine.compile(
  vine.object({
    title: vine.string().maxLength(255).optional(),
    description: vine.string().maxLength(1000).optional(),
    status: vine.enum(['pending', 'completed'] as const).optional(),
  })
)