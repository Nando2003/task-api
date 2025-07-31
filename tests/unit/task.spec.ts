import Task from '#models/task'
import User from '#models/user'
import db from '@adonisjs/lucid/services/db'
import { test } from '@japa/runner'


test.group('Task Model Tests', (group) => {
  group.each.setup(async () => {
    await db.beginGlobalTransaction()
    return () => db.rollbackGlobalTransaction()
  })

  let user: User;
  const email: string = `test-${Date.now()}@example.com`

  let task: Task;

  group.setup(async () => {
    user = await User.create({
      email: email,
      password: 'password',
    })
  })

  group.setup(async () => {
    task = await Task.create({
      title: 'Test Task',
      description: 'This is a test task',
      status: 'pending',
      userId: user.id,
    })
  })

  test('should create a task', async ({ assert }) => {
    assert.exists(task.id)
    assert.equal(task.title, 'Test Task')
    assert.equal(task.description, 'This is a test task')
    assert.equal(task.userId, user.id)
  })

})
