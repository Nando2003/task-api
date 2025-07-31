import RefreshToken from '#models/refresh_token'
import User from '#models/user'
import AuthService from '#services/auth_service'
import { test } from '@japa/runner'
import { randomInt } from 'node:crypto'
import { v4 as uuidv4 } from 'uuid'


test.group('Auth Controller Functional Tests', () => {

  test('should register a new user', async ({ client, assert }) => {
    const email = `register${(uuidv4())}@example.com`
    const password = 'password123'

    const response = await client.post('/auth/register').json({
      email: email,
      password: password,
    })

    response.assertStatus(201)
    const responseBody = response.body()

    assert.exists(responseBody.user)
    assert.isObject(responseBody.user)
    assert.isNumber(responseBody.user.id)
    assert.equal(responseBody.user.email, email)
    assert.isString(responseBody.accessToken)
    assert.isString(responseBody.refreshToken)

    const user = await User.findBy('email', email)
    assert.isNotNull(user)
    assert.exists(user!.id)
  });

  test('should not register a user with duplicate email', async ({ client }) => {
    const email = `duplicate${uuidv4()}@example.com`
    const password = 'password123'

    await client.post('/auth/register').json({ email, password })
    const response = await client.post('/auth/register').json({ email, password })

    response.assertStatus(422)
    response.assertBodyContains({
      errors: [
        {
          message: 'The email has already been taken',
          rule: 'database.unique',
          field: 'email',
        },
      ],
    })
  })

  test('should log in a user with valid credentials', async ({ client, assert }) => {
    const email = `login${uuidv4()}@example.com`
    const password = 'password123'

    await User.create({ email, password })

    const response = await client.post('/auth/login').json({
      email: email,
      password: password,
    })

    response.assertStatus(200)
    const responseBody = response.body()

    assert.isString(responseBody.accessToken)
    assert.isString(responseBody.refreshToken)
  })

  test('should not log in a user with invalid credentials', async ({ client }) => {
    const email = `invalidlogin${uuidv4()}@example.com`
    const password = 'password123'

    await User.create({ email, password })

    const response = await client.post('/auth/login').json({
      email: email,
      password: 'wrongpassword',
    })

    response.assertStatus(401)
    response.assertBodyContains({
      message: 'Invalid credentials',
    })
  })

  test('should refresh access token with a valid refresh token', async ({ client, assert }) => {
      const user = await User.create({ email: `refresh${uuidv4()}@example.com`, password: 'password123' })
      const { refreshToken: oldRefreshToken } = await AuthService.generateTokens(user)
  
      const response = await client.post('/auth/refresh').json({
        refreshToken: oldRefreshToken,
      })
  
      response.assertStatus(200)
      const responseBody = response.body()
      assert.isString(responseBody.accessToken)
      assert.isString(responseBody.refreshToken)
  
      const oldTokenExists = await RefreshToken.query().where('token', oldRefreshToken).first()
      assert.isNull(oldTokenExists)
  
      const newRefreshToken = response.body().refreshToken
      const newTokenExists = await RefreshToken.query().where('token', newRefreshToken).first()
      assert.isNotNull(newTokenExists)
    })
  
    test('should not refresh access token with an invalid refresh token', async ({ client }) => {
      const response = await client.post('/auth/refresh').json({
        refreshToken: 'invalid_token_string',
      })
  
      response.assertStatus(401)
      response.assertBodyContains({
        message: 'Invalid refresh token',
      })
    })
  
    test('should logout a user and revoke their token', async ({ client, assert }) => {
      const user = await User.create({ email: `logout${randomInt(100)}@example.com`, password: 'password123' })
      const { accessToken, refreshToken } = await AuthService.generateTokens(user)
  
      const response = await client.post('/auth/logout')
        .header('Authorization', `Bearer ${accessToken}`)
        .send()
  
      response.assertStatus(204)
      const tokenExists = await RefreshToken.query().where('token', refreshToken).first()
      assert.isNull(tokenExists)
    })
  
    test('should get authenticated user details', async ({ client }) => {
      const user = await User.create({ email: `me${uuidv4()}@example.com`, password: 'password123' })
      const { accessToken } = await AuthService.generateTokens(user)
  
      const response = await client.get('/auth/me')
        .header('Authorization', `Bearer ${accessToken}`)
  
      response.assertStatus(200)
      response.assertBodyContains({
        id: user.id,
        email: user.email,
      })
    })
  
    test('should not get user details without authentication', async ({ client }) => {
      const response = await client.get('/auth/me')
  
      response.assertStatus(401)
      response.assertBodyContains({
        message: 'Invalid or missing token',
      })
    })
  
    test('should not get user details with invalid token', async ({ client }) => {
      const response = await client.get('/auth/me')
        .header('Authorization', 'Bearer invalid_jwt_token')
  
      response.assertStatus(401)
      response.assertBodyContains({
        message: 'Invalid or expired token',
      })
    })

})