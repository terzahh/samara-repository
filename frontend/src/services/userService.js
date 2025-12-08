import { getAllUsers, updateUserRole, deleteUser as dbDeleteUser, getAllRoles } from '../supabase/database';

export const getUsers = async () => {
  return await getAllUsers();
};

export const changeUserRole = async (userId, roleName, departmentId = null) => {
  try {
    // Get role ID from role name
    const roles = await getAllRoles();
    const role = roles.find(r => r.name === roleName);

    if (!role) {
      throw new Error(`Role ${roleName} not found`);
    }

    return await updateUserRole(userId, role.id, departmentId);
  } catch (error) {
    throw error;
  }
};

export const deleteUser = async (userId) => {
  return await dbDeleteUser(userId);
};