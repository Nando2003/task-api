import Task from "#models/task";
import User from "#models/user";
import { test } from '@japa/runner'

test.group('Task Model Tests', (group) => {
  let user: User;
  let task: Task;

  group.setup(async () => {
    user = await User.create({
      email: `test-${Date.now()}@example.com`,
      password: 'password',
    });
  });

  test('should create a task', async ({ assert }) => {
    const statuses = ['pending', 'completed'] as const;
    const status: 'pending' | 'completed' = statuses[
      Math.floor(Math.random() * statuses.length)
    ];

    task = await Task.create({
      title: 'Test Task',
      description: 'This is a test task',
      status: status,
      userId: user.id,
    });

    assert.exists(task.id);
    assert.equal(task.title, 'Test Task');
    assert.equal(task.description, 'This is a test task');
    assert.equal(task.status, status);
    assert.equal(task.userId, user.id);
  });

  test('should find task by id', async ({ assert }) => {
    const foundTask = await Task.findBy('id', task.id);
    assert.exists(foundTask);
    assert.equal(foundTask?.title, task.title);
  });

  test('should update task', async ({ assert }) => {
    task.title = 'Updated Task Title';
    await task.save();

    const updatedTask = await Task.findBy('id', task.id);
    assert.exists(updatedTask);
    assert.equal(updatedTask?.title, 'Updated Task Title');
  });

  test('should delete task', async ({ assert }) => {
    await task.delete();
    const deletedTask = await Task.findBy('id', task.id);
    assert.isNull(deletedTask);
  });

})
