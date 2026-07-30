import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Alert,
  CircularProgress,
  Box,
} from '@mui/material';
import axios from 'axios';
import { authApi } from '../api';
import { useAuth } from '../auth/AuthContext';

function extractErrorMessage(err: unknown, fallback: string): string {
  if (axios.isAxiosError(err) && err.response) {
    const data = err.response.data;
    return Array.isArray(data) ? data.join(' ') : data ?? fallback;
  }
  return fallback;
}

export default function ProfilePage() {
  const { updateEmailAndToken } = useAuth();

  // Account details section (name + email combined)
  const [originalEmail, setOriginalEmail] = useState('');
  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [currentPasswordForEmail, setCurrentPasswordForEmail] = useState('');
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [profileSuccess, setProfileSuccess] = useState(false);
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  // Change password section
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [isSavingPassword, setIsSavingPassword] = useState(false);

  useEffect(() => {
    authApi
      .getProfile()
      .then((profile) => {
        setOriginalEmail(profile.email);
        setEmail(profile.email);
        setFirstName(profile.firstName);
        setLastName(profile.lastName);
      })
      .catch(() => setProfileError('Failed to load profile.'))
      .finally(() => setIsLoadingProfile(false));
  }, []);

  const emailChanged = email.trim() !== originalEmail;

  const handleProfileSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setProfileError(null);
    setProfileSuccess(false);

    if (emailChanged && !currentPasswordForEmail) {
      setProfileError('Please enter your current password to change your email.');
      return;
    }

    setIsSavingProfile(true);
    try {
      // Name is always safe to update directly
      await authApi.updateProfile({ firstName, lastName });

      // Email requires password confirmation and reissues a token
      if (emailChanged) {
        const response = await authApi.changeEmail({
          newEmail: email,
          currentPassword: currentPasswordForEmail,
        });
        updateEmailAndToken(response);
        setOriginalEmail(response.email);
        setCurrentPasswordForEmail('');
      }

      setProfileSuccess(true);
    } catch (err) {
      setProfileError(extractErrorMessage(err, 'Failed to update profile.'));
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handlePasswordSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setPasswordError(null);
    setPasswordSuccess(false);

    if (newPassword !== confirmPassword) {
      setPasswordError('New password and confirmation do not match.');
      return;
    }

    setIsSavingPassword(true);
    try {
      await authApi.changePassword({ currentPassword, newPassword });
      setPasswordSuccess(true);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setPasswordError(extractErrorMessage(err, 'Failed to change password.'));
    } finally {
      setIsSavingPassword(false);
    }
  };

  if (isLoadingProfile) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="sm" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" sx={{ fontWeight: 600, mb: 3 }}>
        Profile
      </Typography>

      {/* Combined account details section — name + email */}
      <Paper elevation={2} sx={{ p: 4, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Account Details
        </Typography>

        {profileSuccess && (
          <Alert severity="success" sx={{ mb: 2 }} onClose={() => setProfileSuccess(false)}>
            Profile updated successfully.
          </Alert>
        )}
        {profileError && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setProfileError(null)}>
            {profileError}
          </Alert>
        )}

        <Box component="form" onSubmit={handleProfileSubmit} noValidate>
          <TextField
            label="Email"
            type="email"
            fullWidth
            required
            margin="normal"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <TextField
            label="First Name"
            fullWidth
            required
            margin="normal"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
          />
          <TextField
            label="Last Name"
            fullWidth
            required
            margin="normal"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
          />

          {emailChanged && (
            <TextField
              label="Current Password"
              type="password"
              fullWidth
              required
              margin="normal"
              helperText="Required to confirm your new email address"
              value={currentPasswordForEmail}
              onChange={(e) => setCurrentPasswordForEmail(e.target.value)}
            />
          )}

          <Button type="submit" variant="contained" disabled={isSavingProfile} sx={{ mt: 2 }}>
            {isSavingProfile ? <CircularProgress size={24} /> : 'Save Changes'}
          </Button>
        </Box>
      </Paper>

      {/* Change password section */}
      <Paper elevation={2} sx={{ p: 4 }}>
        <Typography variant="h6" gutterBottom>
          Change Password
        </Typography>

        {passwordSuccess && (
          <Alert severity="success" sx={{ mb: 2 }} onClose={() => setPasswordSuccess(false)}>
            Password updated successfully.
          </Alert>
        )}
        {passwordError && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setPasswordError(null)}>
            {passwordError}
          </Alert>
        )}

        <Box component="form" onSubmit={handlePasswordSubmit} noValidate>
          <TextField
            label="Current Password"
            type="password"
            fullWidth
            required
            margin="normal"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
          />
          <TextField
            label="New Password"
            type="password"
            fullWidth
            required
            margin="normal"
            helperText="At least 8 characters"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />
          <TextField
            label="Confirm New Password"
            type="password"
            fullWidth
            required
            margin="normal"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
          <Button type="submit" variant="contained" disabled={isSavingPassword} sx={{ mt: 2 }}>
            {isSavingPassword ? <CircularProgress size={24} /> : 'Update Password'}
          </Button>
        </Box>
      </Paper>
    </Container>
  );
}