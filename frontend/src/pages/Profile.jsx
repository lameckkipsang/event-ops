import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Mail, Phone, Building, ShieldCheck, LogOut, Edit2, Save, X, Camera } from 'lucide-react';
import api from '../services/api';

export default function Profile() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Edit mode state
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    phone_number: '',
    company_name: '',
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const response = await api.get('accounts/profile/');
        setUser(response.data);
        setFormData({
          phone_number: response.data.phone_number || '',
          company_name: response.data.company_name || '',
        });
      } catch (err) {
        console.error('Failed to fetch profile:', err);
        setError('Failed to load profile details. Please log in again.');
        if (err.response?.status === 401) {
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          navigate('/login');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setPreviewImage(URL.createObjectURL(file));
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const data = new FormData();
      data.append('phone_number', formData.phone_number);
      data.append('company_name', formData.company_name);
      if (selectedFile) {
        data.append('profile_picture', selectedFile);
      }

      const response = await api.patch('accounts/profile/', data, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setUser(response.data);
      setIsEditing(false);
      setSelectedFile(null);
      setSuccess('Profile updated successfully!');
    } catch (err) {
      console.error('Failed to update profile:', err);
      setError('Failed to update profile. Please check your inputs.');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    navigate('/login');
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh] text-emerald-300">
        <p>Loading profile...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto my-12 p-8 bg-emerald-900/60 border border-emerald-800/80 rounded-3xl shadow-2xl text-white">
      {error && (
        <div className="mb-6 p-3 bg-red-950/60 border border-red-800/80 rounded-xl text-red-300 text-xs text-center">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-6 p-3 bg-emerald-950/60 border border-emerald-700/80 rounded-xl text-emerald-300 text-xs text-center">
          {success}
        </div>
      )}

      {/* Header section */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-6 pb-8 border-b border-emerald-800/80">
        <div className="flex items-center gap-6 text-center sm:text-left">
          <div className="relative group">
            {previewImage || user?.profile_picture ? (
              <img
                src={previewImage || user.profile_picture}
                alt="Profile Preview"
                className="w-20 h-20 rounded-2xl object-cover border border-orange-500/30 shadow-lg"
              />
            ) : (
              <div className="w-20 h-20 bg-orange-500/20 text-orange-400 border border-orange-500/30 rounded-2xl flex items-center justify-center text-3xl font-bold shadow-lg">
                {user?.username ? user.username[0].toUpperCase() : <User className="w-10 h-10" />}
              </div>
            )}
          </div>
          <div>
            <h1 className="text-2xl font-bold">{user?.username || 'EventOps User'}</h1>
            <p className="text-emerald-300/70 text-sm">{user?.email}</p>
            <span className="inline-block mt-2 px-3 py-1 bg-orange-500/20 text-orange-400 border border-orange-500/30 text-xs font-semibold rounded-full capitalize">
              Role: {user?.role || 'Attendee'}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {!isEditing ? (
            <button
              onClick={() => setIsEditing(true)}
              className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-lg shadow-orange-500/20"
            >
              <Edit2 className="w-4 h-4" />
              Edit Profile
            </button>
          ) : (
            <button
              onClick={() => {
                setIsEditing(false);
                setSelectedFile(null);
                setPreviewImage(null);
              }}
              className="flex items-center gap-2 bg-emerald-800 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition-all"
            >
              <X className="w-4 h-4" />
              Cancel
            </button>
          )}

          <button
            onClick={handleLogout}
            className="flex items-center gap-2 bg-red-950/40 hover:bg-red-900/60 border border-red-800/60 text-red-300 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </div>

      {/* Details Form */}
      {!isEditing ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-8">
          <div className="p-5 bg-emerald-950/60 border border-emerald-800/60 rounded-2xl flex items-center gap-4">
            <div className="w-10 h-10 bg-emerald-900/80 rounded-xl flex items-center justify-center text-emerald-400">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-emerald-400 font-medium">Email Address</p>
              <p className="text-sm font-semibold text-white mt-0.5">{user?.email || 'Not provided'}</p>
            </div>
          </div>

          <div className="p-5 bg-emerald-950/60 border border-emerald-800/60 rounded-2xl flex items-center gap-4">
            <div className="w-10 h-10 bg-emerald-900/80 rounded-xl flex items-center justify-center text-emerald-400">
              <Phone className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-emerald-400 font-medium">Phone Number</p>
              <p className="text-sm font-semibold text-white mt-0.5">{user?.phone_number || 'Not provided'}</p>
            </div>
          </div>

          <div className="p-5 bg-emerald-950/60 border border-emerald-800/60 rounded-2xl flex items-center gap-4">
            <div className="w-10 h-10 bg-emerald-900/80 rounded-xl flex items-center justify-center text-emerald-400">
              <Building className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-emerald-400 font-medium">Company Name</p>
              <p className="text-sm font-semibold text-white mt-0.5">{user?.company_name || 'Independent / None'}</p>
            </div>
          </div>

          <div className="p-5 bg-emerald-950/60 border border-emerald-800/60 rounded-2xl flex items-center gap-4">
            <div className="w-10 h-10 bg-emerald-900/80 rounded-xl flex items-center justify-center text-emerald-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-emerald-400 font-medium">Account Status</p>
              <p className="text-sm font-semibold text-white mt-0.5">
                {user?.is_verified ? 'Verified Account' : 'Standard Account'}
              </p>
            </div>
          </div>
        </div>
      ) : (
        <form onSubmit={handleUpdate} className="space-y-6 mt-8">
          {/* Profile Picture Upload Input */}
          <div className="p-6 bg-emerald-950/60 border border-emerald-800/60 rounded-2xl flex flex-col sm:flex-row items-center gap-6">
            <div className="relative">
              <div className="w-20 h-20 rounded-2xl overflow-hidden border border-orange-500/30 bg-emerald-900 flex items-center justify-center">
                {previewImage || user?.profile_picture ? (
                  <img src={previewImage || user.profile_picture} alt="Upload Preview" className="w-full h-full object-cover" />
                ) : (
                  <Camera className="w-8 h-8 text-emerald-400" />
                )}
              </div>
            </div>
            <div className="flex-1 w-full text-center sm:text-left">
              <label className="block text-xs font-semibold text-emerald-300 mb-2">Change Profile Picture</label>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="w-full text-xs text-emerald-300 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-orange-500 file:text-white hover:file:bg-orange-600 cursor-pointer"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-semibold text-emerald-300 mb-2">Phone Number</label>
              <div className="relative">
                <Phone className="w-4 h-4 text-emerald-400 absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  name="phone_number"
                  value={formData.phone_number}
                  onChange={handleChange}
                  placeholder="+254712345678"
                  className="w-full bg-emerald-950 border border-emerald-700/80 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-emerald-600 focus:outline-none focus:border-orange-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-emerald-300 mb-2">Company Name</label>
              <div className="relative">
                <Building className="w-4 h-4 text-emerald-400 absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  name="company_name"
                  value={formData.company_name}
                  onChange={handleChange}
                  placeholder="EventOps Corp"
                  className="w-full bg-emerald-950 border border-emerald-700/80 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-emerald-600 focus:outline-none focus:border-orange-500"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="submit"
              className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-xl text-sm font-bold transition-all shadow-lg shadow-orange-500/20"
            >
              <Save className="w-4 h-4" />
              Save Changes
            </button>
          </div>
        </form>
      )}
    </div>
  );
}