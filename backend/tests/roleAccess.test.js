const test = require('node:test');
const assert = require('node:assert/strict');

const {
  canViewAdminDetails,
  canViewEmployeeDetails,
  getDashboardState,
} = require('../utils/roleAccess');

test('admin can view employee details', () => {
  assert.equal(canViewEmployeeDetails({ role: 'admin' }), true);
  assert.equal(getDashboardState({ role: 'admin' }).canViewEmployees, true);
});

test('approved employee can view admin details', () => {
  assert.equal(canViewAdminDetails({ role: 'employee', approved: true }), true);
  assert.equal(getDashboardState({ role: 'employee', approved: true }).canViewAdmins, true);
});

test('unapproved employee cannot view admin details', () => {
  assert.equal(canViewAdminDetails({ role: 'employee', approved: false }), false);
  assert.equal(getDashboardState({ role: 'employee', approved: false }).canViewAdmins, false);
});
