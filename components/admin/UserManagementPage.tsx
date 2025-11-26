
import React, { useState } from 'react';
import { User, View } from '../../types';
import Card from '../ui/Card';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Label from '../ui/Label';

interface UserManagementPageProps {
  users: User[];
  onUpdateUsers: (updatedUsers: User[]) => void;
}

// Define which views can be assigned as permissions
const PERMISSION_VIEWS: { key: View; label: string }[] = [
    { key: View.RUN_SETUP, label: 'Run Setup' },
    { key: View.QC_LIST, label: 'QC Data Entry' },
    { key: View.QUALITY_SUMMARY, label: 'Kwaliteit opsomming' },
    { key: View.PLAAS_SETUP, label: 'Plaas Setup' },
    { key: View.ONTVANGS_QC_LIST, label: 'Ontvangs QC' },
    { key: View.MRL, label: 'MRL\'e' },
    { key: View.ADMIN, label: 'Admin Panel (Full Access)' },
];

const UserManagementPage: React.FC<UserManagementPageProps> = ({ users, onUpdateUsers }) => {
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isAddingUser, setIsAddingUser] = useState(false);
  const [newUser, setNewUser] = useState({ username: '', password: '' });
  const [editedPermissions, setEditedPermissions] = useState<View[]>([]);

  const handleSelectUser = (user: User) => {
    setSelectedUser(user);
    setIsAddingUser(false);
    setEditedPermissions(user.permissions || []);
  };

  const handleTogglePermission = (permission: View) => {
    setEditedPermissions(prev =>
      prev.includes(permission)
        ? prev.filter(p => p !== permission)
        : [...prev, permission]
    );
  };

  const handleSavePermissions = () => {
    if (!selectedUser) return;
    const updatedUsers = users.map(u =>
      u.id === selectedUser.id ? { ...u, permissions: editedPermissions } : u
    );
    onUpdateUsers(updatedUsers);
    alert(`Permissions updated for ${selectedUser.username}`);
    setSelectedUser({ ...selectedUser, permissions: editedPermissions });
  };
  
  const handleAddNewUser = (e: React.FormEvent) => {
      e.preventDefault();
      if (!newUser.username.trim() || !newUser.password.trim()) {
          alert('Username and password cannot be empty.');
          return;
      }
      if (users.some(u => u.username.toLowerCase() === newUser.username.toLowerCase().trim())) {
          alert('A user with this username already exists.');
          return;
      }

      const userToAdd: User = {
          id: `user-${Date.now()}`,
          username: newUser.username.trim(),
          password: newUser.password.trim(),
          permissions: []
      };
      
      onUpdateUsers([...users, userToAdd]);
      setIsAddingUser(false);
      setNewUser({ username: '', password: '' });
      setSelectedUser(userToAdd);
      setEditedPermissions([]);
  }

  const handleDeleteUser = () => {
      if (!selectedUser || selectedUser.username === 'JD') {
          alert('The main admin user cannot be deleted.');
          return;
      }
      if (window.confirm(`Are you sure you want to delete the user "${selectedUser.username}"? This cannot be undone.`)) {
          const updatedUsers = users.filter(u => u.id !== selectedUser.id);
          onUpdateUsers(updatedUsers);
          setSelectedUser(null);
      }
  }


  return (
    <Card>
      <div className="border-b border-slate-700 pb-4 mb-6">
        <h2 className="text-3xl font-bold text-green-400">Manage Users</h2>
        <p className="text-slate-400 mt-1">Add new users and manage their access permissions.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-1 flex flex-col">
            <h3 className="text-xl font-semibold text-green-400 mb-4">Users</h3>
            <Button onClick={() => { setIsAddingUser(true); setSelectedUser(null); }} className="w-full mb-4">
                Add New User
            </Button>
            <div className="border border-slate-700 rounded-lg p-2 flex-grow min-h-[400px] bg-slate-900/50">
                <ul className="space-y-2 h-full overflow-y-auto">
                    {users.map(user => (
                    <li key={user.id}>
                        <button
                        onClick={() => handleSelectUser(user)}
                        className={`w-full text-left px-4 py-2 rounded-md transition-colors ${selectedUser?.id === user.id ? 'bg-orange-600 text-white font-semibold' : 'hover:bg-slate-700 text-slate-300'}`}
                        >
                        {user.username}
                        </button>
                    </li>
                    ))}
                </ul>
            </div>
        </div>

        <div className="md:col-span-2">
          {selectedUser && (
            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold text-slate-200">Permissions for <span className="text-orange-500">{selectedUser.username}</span></h3>
                <Button onClick={handleDeleteUser} className="bg-red-600 hover:bg-red-700 focus:ring-red-500 text-sm px-3 py-1">Delete User</Button>
              </div>
              
              <div className="space-y-3">
                  {PERMISSION_VIEWS.map(({ key, label }) => (
                      <label key={key} className="flex items-center p-3 bg-slate-700 rounded-lg cursor-pointer hover:bg-slate-600 border border-slate-600">
                          <input
                              type="checkbox"
                              checked={editedPermissions.includes(key)}
                              onChange={() => handleTogglePermission(key)}
                              className="h-5 w-5 rounded border-slate-500 bg-slate-800 text-orange-600 focus:ring-orange-500"
                          />
                          <span className="ml-3 text-sm font-medium text-slate-200">{label}</span>
                      </label>
                  ))}
              </div>
              <div className="mt-6 text-right">
                  <Button onClick={handleSavePermissions}>Save Permissions</Button>
              </div>
            </div>
          )}

          {isAddingUser && (
             <div>
                <h3 className="text-xl font-semibold text-green-400 mb-4">Add New User</h3>
                <form onSubmit={handleAddNewUser} className="space-y-4 p-4 bg-slate-700 rounded-lg border border-slate-600">
                    <div>
                        <Label htmlFor="new-username">Username</Label>
                        <Input id="new-username" value={newUser.username} onChange={e => setNewUser(p => ({...p, username: e.target.value}))} required />
                    </div>
                    <div>
                        <Label htmlFor="new-password">Password</Label>
                        <Input id="new-password" type="password" value={newUser.password} onChange={e => setNewUser(p => ({...p, password: e.target.value}))} required />
                    </div>
                    <div className="flex justify-end gap-2 pt-2">
                        <Button type="button" onClick={() => setIsAddingUser(false)} className="bg-slate-600 hover:bg-slate-500">Cancel</Button>
                        <Button type="submit">Create User</Button>
                    </div>
                </form>
             </div>
          )}

          {!selectedUser && !isAddingUser && (
             <div className="flex items-center justify-center h-full bg-slate-900/50 rounded-lg border-2 border-dashed border-slate-700">
              <p className="text-slate-500 text-lg text-center p-4">Select a user to edit permissions, or add a new user.</p>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};

export default UserManagementPage;
