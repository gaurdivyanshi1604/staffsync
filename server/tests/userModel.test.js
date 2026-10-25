process.env.NODE_ENV = 'test';

const { test, describe } = require('node:test');
const assert = require('node:assert');
const User = require('../models/User');

describe('User Model Password Hashing Middleware', () => {
  test('User schema pre-save hook hashes password and does not throw TypeError (next is not a function)', async () => {
    const user = new User({
      employeeId: 'TEST-001',
      fullName: 'Test User',
      email: 'test@staffsync.com',
      password: 'PlainPassword123!',
      role: 'employee',
      department: 'Engineering',
      designation: 'Engineer',
    });

    assert.strictEqual(user.password, 'PlainPassword123!');
    assert.strictEqual(user.isModified('password'), true);

    // Execute the pre-save middleware hooks defined on the schema
    const saveHooks = User.schema.s.hooks._pres.get('save') || [];
    for (const hook of saveHooks) {
      await hook.fn.call(user);
    }

    // Verify password is now hashed with bcrypt (starts with $2a$ or $2b$)
    assert.ok(user.password.startsWith('$2'), 'Password should be hashed with bcrypt');
    assert.notStrictEqual(user.password, 'PlainPassword123!');

    // Verify comparePassword method
    const isMatch = await user.comparePassword('PlainPassword123!');
    assert.strictEqual(isMatch, true, 'comparePassword should return true for correct password');

    const isWrongMatch = await user.comparePassword('WrongPassword123!');
    assert.strictEqual(isWrongMatch, false, 'comparePassword should return false for incorrect password');
  });

  test('User schema pre-save hook skips hashing when password is not modified', async () => {
    const existingHash = '$2b$12$e/sampleExistingHashedPasswordStringForTesting';
    const user = new User();
    // Simulate loading existing doc from DB via init()
    user.init({
      _id: '507f191e810c19729de860ea',
      employeeId: 'TEST-002',
      fullName: 'Test User 2',
      email: 'test2@staffsync.com',
      password: existingHash,
    });

    assert.strictEqual(user.isModified('password'), false);

    const saveHooks = User.schema.s.hooks._pres.get('save') || [];
    for (const hook of saveHooks) {
      await hook.fn.call(user);
    }

    assert.strictEqual(user.password, existingHash, 'Password should remain unchanged when not modified');
  });
});
