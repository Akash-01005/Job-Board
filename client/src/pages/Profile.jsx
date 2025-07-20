import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext.jsx';
import axiosInstance from '../libs/axiosInstance.js';

const Profile = () => {
  const { user, login } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    company: user?.company || '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        name: user.name || '',
        email: user.email || '',
        company: user.company || ''
      }));
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError('');
    setSuccess('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.newPassword && formData.newPassword !== formData.confirmPassword) {
      setError('New passwords do not match');
      return;
    }

    if (formData.newPassword && formData.newPassword.length < 6) {
      setError('New password must be at least 6 characters long');
      return;
    }

    try {
      setLoading(true);
      setError('');
      setSuccess('');

      const updateData = {
        name: formData.name,
        email: formData.email
      };

      if (user?.role === 'employer') {
        updateData.company = formData.company;
      }

      if (formData.newPassword) {
        updateData.currentPassword = formData.currentPassword;
        updateData.newPassword = formData.newPassword;
      }

      const response = await axiosInstance.put('/auth/profile', updateData);
      
      // Update the user context with new data
      login(response.data.user, response.data.accessToken);
      
      setSuccess('Profile updated successfully!');
      setIsEditing(false);
      
      // Clear password fields
      setFormData(prev => ({
        ...prev,
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      }));
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to update profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setFormData(prev => ({
      ...prev,
      name: user?.name || '',
      email: user?.email || '',
      company: user?.company || '',
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    }));
    setError('');
    setSuccess('');
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Please log in</h2>
          <p className="text-gray-600">You need to be logged in to view your profile.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-3xl font-bold text-gray-900">Profile Settings</h1>
          <p className="text-lg text-gray-600 mt-2">
            Manage your account information and preferences
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-sm p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
                {error}
              </div>
            )}

            {success && (
              <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md">
                {success}
              </div>
            )}

            {/* Profile Picture */}
            <div className="flex items-center space-x-6">
              <div className="h-20 w-20 bg-indigo-100 rounded-full flex items-center justify-center">
                <span className="text-2xl font-bold text-indigo-600">
                  {user.name?.charAt(0).toUpperCase()}
                </span>
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-900">{user.name}</h3>
                <p className="text-sm text-gray-500 capitalize">{user.role}</p>
                {user.company && (
                  <p className="text-sm text-gray-500">{user.company}</p>
                )}
              </div>
            </div>

            <hr className="border-gray-200" />

            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  disabled={!isEditing}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  disabled={!isEditing}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500"
                />
              </div>

              {user.role === 'employer' && (
                <div className="md:col-span-2">
                  <label htmlFor="company" className="block text-sm font-medium text-gray-700 mb-2">
                    Company Name
                  </label>
                  <input
                    type="text"
                    id="company"
                    name="company"
                    value={formData.company}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500"
                  />
                </div>
              )}
            </div>

            {/* Password Change Section */}
            {isEditing && (
              <>
                <hr className="border-gray-200" />
                
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Change Password</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 mb-2">
                        Current Password
                      </label>
                      <input
                        type="password"
                        id="currentPassword"
                        name="currentPassword"
                        value={formData.currentPassword}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        placeholder="Enter current password"
                      />
                    </div>

                    <div>
                      <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-2">
                        New Password
                      </label>
                      <input
                        type="password"
                        id="newPassword"
                        name="newPassword"
                        value={formData.newPassword}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        placeholder="Enter new password"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                        Confirm New Password
                      </label>
                      <input
                        type="password"
                        id="confirmPassword"
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        placeholder="Confirm new password"
                      />
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* Account Information */}
            <hr className="border-gray-200" />
            
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Account Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Account Type
                  </label>
                  <div className="px-4 py-2 bg-gray-50 border border-gray-300 rounded-md">
                    <span className="text-gray-900 capitalize">{user.role}</span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Member Since
                  </label>
                  <div className="px-4 py-2 bg-gray-50 border border-gray-300 rounded-md">
                    <span className="text-gray-900">
                      {new Date(user.createdAt || Date.now()).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
              {!isEditing ? (
                <button
                  type="button"
                  onClick={() => setIsEditing(true)}
                  className="px-6 py-2 bg-indigo-600 text-white rounded-md font-medium hover:bg-indigo-700 transition-colors"
                >
                  Edit Profile
                </button>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md font-medium hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-6 py-2 bg-indigo-600 text-white rounded-md font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50"
                  >
                    {loading ? 'Saving...' : 'Save Changes'}
                  </button>
                </>
              )}
            </div>
          </form>
        </div>

        {/* Additional Settings */}
        <div className="mt-8 bg-white rounded-lg shadow-sm p-8">
          <h3 className="text-lg font-medium text-gray-900 mb-6">Additional Settings</h3>
          
          <div className="space-y-6">
            {/* Email Notifications */}
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-medium text-gray-900">Email Notifications</h4>
                <p className="text-sm text-gray-500">Receive updates about job applications and new opportunities</p>
              </div>
              <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-indigo-600">
                <span className="inline-block h-4 w-4 transform rounded-full bg-white transition translate-x-6"></span>
              </button>
            </div>

            {/* Job Alerts */}
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-medium text-gray-900">Job Alerts</h4>
                <p className="text-sm text-gray-500">Get notified about new jobs matching your criteria</p>
              </div>
              <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-gray-200">
                <span className="inline-block h-4 w-4 transform rounded-full bg-white transition translate-x-1"></span>
              </button>
            </div>

            {/* Privacy Settings */}
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-medium text-gray-900">Profile Visibility</h4>
                <p className="text-sm text-gray-500">Control who can see your profile information</p>
              </div>
              <select className="px-3 py-1 border border-gray-300 rounded-md text-sm">
                <option>Public</option>
                <option>Employers Only</option>
                <option>Private</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile; 