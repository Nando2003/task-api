import Task from '#models/task';
import User from '#models/user'
import AuthService from '#services/auth_service';
import { test } from '@japa/runner'
import { v4 as uuidv4 } from 'uuid'

test.group('Tasks Controller Functional Tests', (group) => {
  let firstUser: User;
  let firstAccessToken: string;

  let secondUser: User;
  let secondAccessToken: string;

  let taskId: number;
  
  const firstUserObj: object = {
    email: `test-${uuidv4()}@example.com`,
    password: 'password123',
  };

  const secondUserObj: object = {
    email: `test-${uuidv4()}@example.com`,
    password: 'password123',
  };

  group.setup(async () => {
    firstUser = await User.create(firstUserObj);
    secondUser = await User.create(secondUserObj);
    ({ accessToken: firstAccessToken } = await AuthService.generateTokens(firstUser));
    ({ accessToken: secondAccessToken } = await AuthService.generateTokens(secondUser));
  })

  test('should create a new task', async ({ client, assert }) => {
    const title = 'New Task';
    const description = 'Task description';

    const response = await client.post('/tasks').json({
      title: title,
      description: description,
      status: 'pending',

    }).header('Authorization', `Bearer ${firstAccessToken}`)

    assert.equal(response.status(), 201)
    const responseBody = response.body();

    assert.exists(responseBody)
    assert.isObject(responseBody)
    assert.isNumber(responseBody.id)
    assert.equal(responseBody.title, 'New Task')
    assert.equal(responseBody.description, 'Task description')
    assert.equal(responseBody.status, 'pending')
    assert.equal(responseBody.userId, firstUser.id)

    taskId = responseBody.id;
  })

  test('should not create a task without authentication', async ({ client }) => {
    const response = await client.post('/tasks').json({
      title: 'Unauthorized Task',
      description: 'This task should not be created',
      status: 'pending',
    })

    response.assertStatus(401)
  })

  test('should not create a task with invalid status', async ({ client }) => {
    const response = await client.post('/tasks').json({
      title: 'Task with No Description',
      description: 'This task has no title',
      status: 'invalid_status',

    }).header('Authorization', `Bearer ${firstAccessToken}`)

    response.assertStatus(422)
  })

  test('should get all tasks for authenticated user', async ({ client, assert }) => {
    const response = await client.get('/tasks').header('Authorization', `Bearer ${firstAccessToken}`)

    response.assertStatus(200)
    const responseBody = response.body();

    assert.isArray(responseBody)
    assert.isTrue(responseBody.length > 0)
  })

  test('should not get tasks without authentication', async ({ client }) => {
    const response = await client.get('/tasks')

    response.assertStatus(401)
  })

  test('should get a task by ID', async ({ client, assert }) => {
    const response = await client.get(`/tasks/${taskId}`)
      .header('Authorization', `Bearer ${firstAccessToken}`)

    response.assertStatus(200)
    const responseBody = response.body();

    assert.exists(responseBody)
    assert.isObject(responseBody)
    assert.equal(responseBody.id, taskId)
    assert.isString(responseBody.title)
    assert.isString(responseBody.description)
    assert.isString(responseBody.status)
    assert.equal(responseBody.userId, firstUser.id)
  })

  test('should not get others user\'s task by ID', async ({ client }) => {
    const response = await client.get(`/tasks/${taskId}`)
      .header('Authorization', `Bearer ${secondAccessToken}`)

    response.assertStatus(404)
    response.assertBodyContains({message: 'Task not found'})
  })

  test('should not get a task without authentication', async ({ client }) => {
    const response = await client.get(`/tasks/${taskId}`)
    response.assertStatus(401)
  })

  test('should update a task', async ({ client, assert }) => {
    const updatedTitle = 'Updated Task Title';
    const updatedDescription = 'Updated task description';

    const response = await client.put(`/tasks/${taskId}`).json({
      title: updatedTitle,
      description: updatedDescription,
      status: 'completed',

    }).header('Authorization', `Bearer ${firstAccessToken}`)

    response.assertStatus(200)
    const responseBody = response.body();

    assert.exists(responseBody)
    assert.isObject(responseBody)
    assert.equal(responseBody.id, taskId)
    assert.equal(responseBody.title, updatedTitle)
    assert.equal(responseBody.description, updatedDescription)
    assert.equal(responseBody.status, 'completed')
  })

  test('should not update a task without authentication', async ({ client }) => {
    const response = await client.put(`/tasks/${taskId}`).json({
      title: 'Unauthorized Update',
      description: 'This task should not be updated',
      status: 'pending',
    })

    response.assertStatus(401)
  })

  test('should patch a task', async ({ client, assert }) => {
    const updatedTitle = 'Partially Updated Task Title';

    const response = await client.patch(`/tasks/${taskId}`).json({
      title: updatedTitle,
    }).header('Authorization', `Bearer ${firstAccessToken}`)

    response.assertStatus(200)
    const responseBody = response.body();

    assert.exists(responseBody)
    assert.isObject(responseBody)
    assert.equal(responseBody.id, taskId)
    assert.equal(responseBody.title, updatedTitle)
  })

  test('should not patch a task without authentication', async ({ client }) => {
    const response = await client.patch(`/tasks/${taskId}`).json({
      title: 'Unauthorized Patch',
    })

    response.assertStatus(401)
  })

  test('should delete a task', async ({ client, assert }) => {
    const response = await client.delete(`/tasks/${taskId}`)
      .header('Authorization', `Bearer ${firstAccessToken}`)

    response.assertStatus(204)

    const deletedTask = await Task.find(taskId);
    assert.isNull(deletedTask)
  })

})