import User from '#models/user'
import db from '@adonisjs/lucid/services/db'
import { test } from '@japa/runner'

test.group('User Model Tests', (group) => {
  group.each.setup(async () => {
    await db.beginGlobalTransaction()
    return () => db.rollbackGlobalTransaction()
  })

  let user: User;
  const email: string = `test-${Date.now()}@example.com`

  group.setup(async () => {
    user = await User.create({
      email: email,
      password: 'password',
    })
  })

  test('should create a user', async ({ assert }) => {
    assert.exists(user.id)
    assert.equal(user.email, email)
  })

  test('should raise error for duplicate email', async ({ assert }) => {
    try {
      await User.create({
        email: email,
        password: 'password',
      })
    } catch (error) {
      assert.equal(error.code, 'SQLITE_CONSTRAINT')
    }
  })

})
