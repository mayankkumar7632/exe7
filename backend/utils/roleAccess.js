function canViewAdminDetails(user) {
  return !!user && user.role === 'employee' && user.approved === true;
}

function canViewEmployeeDetails(user) {
  return !!user && user.role === 'admin';
}

function getDashboardState(user) {
  return {
    isAdmin: !!user && user.role === 'admin',
    isEmployee: !!user && user.role === 'employee',
    canViewAdmins: canViewAdminDetails(user),
    canViewEmployees: canViewEmployeeDetails(user),
  };
}

module.exports = {
  canViewAdminDetails,
  canViewEmployeeDetails,
  getDashboardState,
};
