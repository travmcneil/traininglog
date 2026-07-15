import { useEffect, useState } from "react";
import {
  Container,
  Typography,
  Box,
  CircularProgress,
  Alert,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  FormControlLabel,
  Switch,
  Checkbox,
  FormGroup,
} from "@mui/material";
import { Edit, Delete } from "@mui/icons-material";
import { adminApi } from "../api";
import { useAuth } from "../auth/AuthContext";
import type { AdminUserDto, UpdateUserDto } from "../types";

const ALL_ROLES = ["User", "Admin"];

export default function AdminPage() {
  const { email: currentUserEmail } = useAuth();

  const [users, setUsers] = useState<AdminUserDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [editingUser, setEditingUser] = useState<AdminUserDto | null>(null);
  const [editForm, setEditForm] = useState<UpdateUserDto>({
    firstName: "",
    lastName: "",
    isActive: true,
  });
  const [editRoles, setEditRoles] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState<AdminUserDto | null>(null);

  const loadUsers = () => {
    setIsLoading(true);
    adminApi
      .getAllUsers()
      .then(setUsers)
      .catch(() => setError("Failed to load users."))
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const openEditDialog = (user: AdminUserDto) => {
    setEditingUser(user);
    setEditForm({
      firstName: user.firstName,
      lastName: user.lastName,
      isActive: user.isActive,
    });
    setEditRoles(user.roles);
  };

  const closeEditDialog = () => setEditingUser(null);

  const toggleRole = (role: string) => {
    setEditRoles((prev) =>
      prev.includes(role) ? prev.filter((r) => r !== role) : [...prev, role],
    );
  };

  const handleSave = async () => {
    if (!editingUser) return;
    setIsSaving(true);
    try {
      await adminApi.updateUser(editingUser.id, editForm);
      await adminApi.updateUserRoles(editingUser.id, { roles: editRoles });
      closeEditDialog();
      loadUsers();
    } catch (err) {
      const message =
        err && typeof err === "object" && "response" in err
          ? // @ts-expect-error - narrowing axios error shape loosely here
            (err.response?.data ?? "Failed to update user.")
          : "Failed to update user.";
      setError(
        typeof message === "string" ? message : "Failed to update user.",
      );
      closeEditDialog();
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await adminApi.deleteUser(deleteTarget.id);
      setDeleteTarget(null);
      loadUsers();
    } catch (err) {
      const message =
        err && typeof err === "object" && "response" in err
          ? // @ts-expect-error - narrowing axios error shape loosely here
            (err.response?.data ?? "Failed to delete user.")
          : "Failed to delete user.";
      setError(
        typeof message === "string" ? message : "Failed to delete user.",
      );
      setDeleteTarget(null);
    }
  };

  if (isLoading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" sx={{ fontWeight: 600, mb: 3 }}>
        User Management
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Name</TableCell>
            <TableCell>Email</TableCell>
            <TableCell>Roles</TableCell>
            <TableCell align="center">Status</TableCell>
            <TableCell>Joined</TableCell>
            <TableCell align="right">Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {users.map((user) => {
            const isSelf = user.email === currentUserEmail;
            return (
              <TableRow key={user.id}>
                <TableCell>
                  {user.firstName} {user.lastName}
                  {isSelf && (
                    <Chip
                      label="You"
                      size="small"
                      sx={{ ml: 1 }}
                      variant="outlined"
                    />
                  )}
                </TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>
                  {user.roles.map((role) => (
                    <Chip
                      key={role}
                      label={role}
                      size="small"
                      color={role === "Admin" ? "primary" : "default"}
                      sx={{ mr: 0.5 }}
                    />
                  ))}
                </TableCell>
                <TableCell align="center">
                  <Chip
                    label={user.isActive ? "Active" : "Disabled"}
                    color={user.isActive ? "success" : "default"}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  {new Date(user.createdAt).toLocaleDateString()}
                </TableCell>
                <TableCell align="right">
                  <IconButton size="small" onClick={() => openEditDialog(user)}>
                    <Edit fontSize="small" />
                  </IconButton>
                  <IconButton
                    size="small"
                    disabled={isSelf}
                    onClick={() => setDeleteTarget(user)}
                  >
                    <Delete fontSize="small" />
                  </IconButton>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>

      {/* Edit dialog */}
      <Dialog
        open={!!editingUser}
        onClose={closeEditDialog}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Edit User</DialogTitle>
        <DialogContent>
          <TextField
            label="First Name"
            fullWidth
            margin="normal"
            value={editForm.firstName}
            onChange={(e) =>
              setEditForm({ ...editForm, firstName: e.target.value })
            }
          />
          <TextField
            label="Last Name"
            fullWidth
            margin="normal"
            value={editForm.lastName}
            onChange={(e) =>
              setEditForm({ ...editForm, lastName: e.target.value })
            }
          />

          <FormControlLabel
            control={
              <Switch
                checked={editForm.isActive}
                disabled={editingUser?.email === currentUserEmail}
                onChange={(e) =>
                  setEditForm({ ...editForm, isActive: e.target.checked })
                }
              />
            }
            label="Active"
            sx={{ mt: 1, display: "block" }}
          />
          {editingUser?.email === currentUserEmail && (
            <Typography variant="caption" color="text.secondary">
              You cannot deactivate your own account.
            </Typography>
          )}

          <Typography variant="subtitle2" sx={{ mt: 2, mb: 1 }}>
            Roles
          </Typography>
          <FormGroup>
            {ALL_ROLES.map((role) => (
              <FormControlLabel
                key={role}
                control={
                  <Checkbox
                    checked={editRoles.includes(role)}
                    disabled={
                      role === "Admin" &&
                      editingUser?.email === currentUserEmail &&
                      editRoles.includes("Admin")
                    }
                    onChange={() => toggleRole(role)}
                  />
                }
                label={role}
              />
            ))}
          </FormGroup>
          {editingUser?.email === currentUserEmail &&
            editRoles.includes("Admin") && (
              <Typography variant="caption" color="text.secondary">
                You cannot remove your own Admin role.
              </Typography>
            )}
        </DialogContent>
        <DialogActions>
          <Button onClick={closeEditDialog}>Cancel</Button>
          <Button onClick={handleSave} variant="contained" disabled={isSaving}>
            {isSaving ? <CircularProgress size={20} /> : "Save"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete confirmation dialog */}
      <Dialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)}>
        <DialogTitle>Delete User?</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to permanently delete{" "}
            {deleteTarget?.firstName} {deleteTarget?.lastName}? This cannot be
            undone, and will fail if they still have shoes on file.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteTarget(null)}>Cancel</Button>
          <Button onClick={handleDelete} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
