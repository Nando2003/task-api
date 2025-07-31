import User from "#models/user";
import { test } from '@japa/runner'


test.group('User Model Tests', () => {
  let user: User;
  const email: string = `test-${Date.now()}@example.com`;
  const rawPassword: string = 'password';

  test('should create a user', async ({ assert }) => {
    user = await User.create({
      email: email,
      password: rawPassword,
    });

    assert.exists(user.id);
    assert.equal(user.email, email);
  });

  test('rawPassword should be hashed', async ({ assert }) => {
    assert.notEqual(user.password, rawPassword);
  });

  test('should find user by email', async ({ assert }) => {
    const foundUser = await User.findBy('email', email);
    assert.equal(foundUser?.id, user.id);
  });

  test('should find user by id', async ({ assert }) => {
    const foundUser = await User.findBy('id', user.id);
    assert.equal(foundUser?.email, email);
  });

  test('should raise error for duplicate email', async ({ assert }) => {
    try {
      await User.create({
        email: email,
        password: rawPassword,
      });
    } catch (error) {
      assert.equal(error.code, 'SQLITE_CONSTRAINT');
    }
  });

  test('should update user email', async ({ assert }) => {
    const newEmail = `updated-${Date.now()}@example.com`;
    user.email = newEmail;
    await user.save();

    const updatedUser = await User.findBy('id', user.id);
    assert.equal(updatedUser?.email, newEmail);
  });

  test('should delete user', async ({ assert }) => {
    await user.delete();
    const deletedUser = await User.findBy('id', user.id);
    assert.isNull(deletedUser);
  });

})