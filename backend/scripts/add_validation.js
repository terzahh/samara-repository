const fs = require('fs');

// Read the file
let content = fs.readFileSync('src/components/admin/UserManagement/UserManagement.js', 'utf8');

// 1. Update handleEditUser to set selectedDepartment
const oldEditUser = `  const handleEditUser = (user) => {
    setSelectedUser(user);
    setNewRole(user.roles.name);
    setShowEditModal(true);
    setError('');
    setSuccess('');
  };`;

const newEditUser = `  const handleEditUser = (user) => {
    setSelectedUser(user);
    setNewRole(user.roles.name);
    setSelectedDepartment(user.departments?.id || '');
    setShowEditModal(true);
    setError('');
    setSuccess('');
  };`;

content = content.replace(oldEditUser, newEditUser);

// 2. Update handleSaveChanges with validation
const oldSaveChanges = `  const handleSaveChanges = async () => {
    if (!selectedUser || !newRole) return;
    
    try {
      await changeUserRole(selectedUser.id, newRole);
      
      // Refresh users list
      const usersList = await getUsers();
      setUsers(usersList);
      
      setSuccess(\`User role updated successfully to \${getRoleLabel(newRole)}\`);
      setShowEditModal(false);
      setSelectedUser(null);
      setNewRole('');
    } catch (error) {
      console.error('Error updating user role:', error);
      setError('Failed to update user role. Please try again.');
    }
  };`;

const newSaveChanges = `  const handleSaveChanges = async () => {
    if (!selectedUser || !newRole) return;

    // Validate department selection for department_head role
    if (newRole === 'department_head' && !selectedDepartment) {
      setError('Please select a department for Department Head role');
      return;
    }

    // Check if department already has a head (only if assigning department_head role)
    if (newRole === 'department_head' && selectedDepartment) {
      const existingHead = users.find(
        u => u.roles.name === 'department_head' && 
        u.departments?.id === selectedDepartment && 
        u.id !== selectedUser.id
      );
      
      if (existingHead) {
        const deptName = departments.find(d => d.id === selectedDepartment)?.name || 'this department';
        setError(\`\${deptName} already has a department head: \${existingHead.display_name}. Please remove them first or choose a different department.\`);
        return;
      }
    }

    try {
      await changeUserRole(selectedUser.id, newRole);

      // Update department if role is department_head
      if (newRole === 'department_head' && selectedDepartment) {
        const { updateUserProfile } = await import('../../../supabase/customAuth');
        await updateUserProfile(selectedUser.id, { department_id: selectedDepartment });
      }

      // Refresh users list
      const usersList = await getUsers();
      setUsers(usersList);

      setSuccess(\`User role updated successfully to \${getRoleLabel(newRole)}\`);
      setShowEditModal(false);
      setSelectedUser(null);
      setNewRole('');
      setSelectedDepartment('');
    } catch (error) {
      console.error('Error updating user role:', error);
      setError('Failed to update user role. Please try again.');
    }
  };`;

content = content.replace(oldSaveChanges, newSaveChanges);

// Write the modified content
fs.writeFileSync('src/components/admin/UserManagement/UserManagement.js', content, 'utf8');

console.log('Department head validation added successfully!');
