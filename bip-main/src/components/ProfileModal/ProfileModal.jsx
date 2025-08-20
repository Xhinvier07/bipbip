import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaUser, FaEnvelope, FaLock, FaEye, FaEyeSlash, FaTimes, FaSave, FaTrash } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';
import './ProfileModal.css';

const ProfileModal = ({ isOpen, onClose }) => {
  const { user, signOut } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Profile form state
  const [username, setUsername] = useState(user?.user_metadata?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  
  // Password change state
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  // Delete account state
  const [deleteConfirm, setDeleteConfirm] = useState('');
  const [showDeletePassword, setShowDeletePassword] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    
    try {
      // Update user metadata
      const { error } = await supabase.auth.updateUser({
        data: { name: username }
      });
      
      if (error) throw error;
      
      setSuccess('Profile updated successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    
    if (newPassword !== confirmPassword) {
      setError('New passwords do not match');
      setLoading(false);
      return;
    }
    
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });
      
      if (error) throw error;
      
      setSuccess('Password changed successfully!');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message || 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    if (deleteConfirm !== 'DELETE') {
      setError('Please type DELETE to confirm account deletion');
      setLoading(false);
      return;
    }
    
    try {
      // Delete user account
      const { error } = await supabase.auth.admin.deleteUser(user.id);
      
      if (error) throw error;
      
      await signOut();
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to delete account');
      setLoading(false);
    }
  };

  const togglePasswordVisibility = (type) => {
    switch (type) {
      case 'new':
        setShowNewPassword(!showNewPassword);
        break;
      case 'confirm':
        setShowConfirmPassword(!showConfirmPassword);
        break;
      case 'delete':
        setShowDeletePassword(!showDeletePassword);
        break;
      default:
        break;
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="profile-modal-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="profile-modal"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h2>Profile Settings</h2>
              <button className="close-btn" onClick={onClose}>
                <FaTimes />
              </button>
            </div>

            <div className="modal-tabs">
              <button
                className={`tab-btn ${activeTab === 'profile' ? 'active' : ''}`}
                onClick={() => setActiveTab('profile')}
              >
                <FaUser />
                Profile
              </button>
              <button
                className={`tab-btn ${activeTab === 'password' ? 'active' : ''}`}
                onClick={() => setActiveTab('password')}
              >
                <FaLock />
                Password
              </button>
              <button
                className={`tab-btn ${activeTab === 'delete' ? 'active' : ''}`}
                onClick={() => setActiveTab('delete')}
              >
                <FaTrash />
                Delete Account
              </button>
            </div>

            <div className="modal-content">
              {error && (
                <div className="error-message">
                  {error}
                </div>
              )}
              
              {success && (
                <div className="success-message">
                  {success}
                </div>
              )}

              {activeTab === 'profile' && (
                <form onSubmit={handleUpdateProfile}>
                  <div className="form-group">
                    <label>
                      <FaUser />
                      Username
                    </label>
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="Enter username"
                    />
                  </div>
                  
                  <div className="form-group">
                    <label>
                      <FaEnvelope />
                      Email
                    </label>
                    <input
                      type="email"
                      value={email}
                      disabled
                      placeholder="Email cannot be changed"
                    />
                  </div>
                  
                  <button type="submit" disabled={loading} className="save-btn">
                    <FaSave />
                    {loading ? 'Saving...' : 'Save Changes'}
                  </button>
                </form>
              )}

              {activeTab === 'password' && (
                <form onSubmit={handleChangePassword}>
                  <div className="form-group">
                    <label>
                      <FaLock />
                      New Password
                    </label>
                    <div className="password-input">
                      <input
                        type={showNewPassword ? 'text' : 'password'}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="Enter new password"
                      />
                      <button
                        type="button"
                        onClick={() => togglePasswordVisibility('new')}
                        className="password-toggle"
                      >
                        {showNewPassword ? <FaEyeSlash /> : <FaEye />}
                      </button>
                    </div>
                  </div>
                  
                  <div className="form-group">
                    <label>
                      <FaLock />
                      Confirm New Password
                    </label>
                    <div className="password-input">
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Confirm new password"
                      />
                      <button
                        type="button"
                        onClick={() => togglePasswordVisibility('confirm')}
                        className="password-toggle"
                      >
                        {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                      </button>
                    </div>
                  </div>
                  
                  <button type="submit" disabled={loading} className="save-btn">
                    <FaLock />
                    {loading ? 'Changing...' : 'Change Password'}
                  </button>
                </form>
              )}

              {activeTab === 'delete' && (
                <form onSubmit={handleDeleteAccount}>
                  <div className="delete-warning">
                    <h3>⚠️ Delete Account</h3>
                    <p>This action cannot be undone. All your data will be permanently deleted.</p>
                  </div>
                  
                  <div className="form-group">
                    <label>
                      Type DELETE to confirm
                    </label>
                    <input
                      type="text"
                      value={deleteConfirm}
                      onChange={(e) => setDeleteConfirm(e.target.value)}
                      placeholder="Type DELETE"
                    />
                  </div>
                  
                  <div className="form-group">
                    <label>
                      <FaLock />
                      Current Password
                    </label>
                    <div className="password-input">
                      <input
                        type={showDeletePassword ? 'text' : 'password'}
                        value={deletePassword}
                        onChange={(e) => setDeletePassword(e.target.value)}
                        placeholder="Enter current password"
                      />
                      <button
                        type="button"
                        onClick={() => togglePasswordVisibility('delete')}
                        className="password-toggle"
                      >
                        {showDeletePassword ? <FaEyeSlash /> : <FaEye />}
                      </button>
                    </div>
                  </div>
                  
                  <button type="submit" disabled={loading} className="delete-btn">
                    <FaTrash />
                    {loading ? 'Deleting...' : 'Delete Account'}
                  </button>
                </form>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ProfileModal;
