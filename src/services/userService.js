import { getAllUsers, updateUserRole } from '../supabase/database';
import { getAllRoles } from '../supabase/database';

export const getUsers = async () => {
  return await getAllUsers();
};

export const changeUserRole = async (userId, roleName) => {
  try {
    // Get role ID from role name
    const roles = await getAllRoles();
    const role = roles.find(r => r.name === roleName);
    
    if (!role) {
      throw new Error(`Role ${roleName} not found`);
    }
    
    return await updateUserRole(userId, role.id);
  } catch (error) {
    throw error;
  }
};