import { useEffect, useState } from "react";
import {
  Container,
  Typography,
  Button,
  Box,
  Card,
  CardContent,
  CardActions,
  Grid,
  CircularProgress,
  Alert,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
  FormControlLabel,
  Switch,
  LinearProgress,
} from "@mui/material";
import { Edit, Delete, Add } from "@mui/icons-material";
import { shoesApi } from "../api";
import type { ShoeDto, CreateShoeDto } from "../types";

// Common wisdom: running shoes are typically retired around 300-500 miles
const RECOMMENDED_MAX_MILEAGE = 400;

export default function ShoesPage() {
  const [shoes, setShoes] = useState<ShoeDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingShoe, setEditingShoe] = useState<ShoeDto | null>(null);
  const [formData, setFormData] = useState<CreateShoeDto>({
    name: "",
    dateAcquired: "",
    retired: false,
  });
  const [isSaving, setIsSaving] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState<ShoeDto | null>(null);

  const loadShoes = () => {
    setIsLoading(true);
    shoesApi
      .getAll()
      .then(setShoes)
      .catch(() => setError("Failed to load shoes."))
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    loadShoes();
  }, []);

  const openCreateDialog = () => {
    setEditingShoe(null);
    setFormData({ name: "", dateAcquired: "", retired: false });
    setDialogOpen(true);
  };

  const openEditDialog = (shoe: ShoeDto) => {
    setEditingShoe(shoe);
    setFormData({
      name: shoe.name,
      dateAcquired: shoe.dateAcquired.split("T")[0],
      retired: shoe.retired,
    });
    setDialogOpen(true);
  };

  const closeDialog = () => setDialogOpen(false);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      if (editingShoe) {
        await shoesApi.update(editingShoe.id, formData);
      } else {
        await shoesApi.create(formData);
      }
      closeDialog();
      loadShoes();
    } catch {
      setError("Failed to save shoe.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await shoesApi.delete(deleteTarget.id);
      setDeleteTarget(null);
      loadShoes();
    } catch {
      setError("Failed to delete shoe.");
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
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
        }}
      >
        <Typography variant="h4" sx={{ fontWeight: 600 }}>
          Shoes
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={openCreateDialog}
        >
          Add Shoe
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {shoes.length === 0 ? (
        <Alert severity="info">
          No shoes on file yet. Add one to start tracking mileage.
        </Alert>
      ) : (
        <Grid container spacing={3}>
          {shoes.map((shoe) => {
            const mileagePercent = Math.min(
              100,
              (shoe.totalMileage / RECOMMENDED_MAX_MILEAGE) * 100,
            );
            const isHighMileage = shoe.totalMileage >= RECOMMENDED_MAX_MILEAGE;

            return (
              <Grid size={{ xs: 12, sm: 6, md: 4 }} key={shoe.id}>
                <Card elevation={2}>
                  <CardContent>
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                      }}
                    >
                      <Typography variant="h6">{shoe.name}</Typography>
                      {shoe.retired && <Chip label="Retired" size="small" />}
                    </Box>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ mt: 1 }}
                    >
                      Acquired{" "}
                      {new Date(shoe.dateAcquired).toLocaleDateString()}
                    </Typography>

                    <Box sx={{ mt: 2 }}>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {shoe.totalMileage.toFixed(1)} miles
                      </Typography>
                      <LinearProgress
                        variant="determinate"
                        value={mileagePercent}
                        color={isHighMileage ? "warning" : "primary"}
                        sx={{ mt: 0.5, height: 6, borderRadius: 3 }}
                      />
                      {isHighMileage && !shoe.retired && (
                        <Typography variant="caption" color="warning.main">
                          Consider retiring soon
                        </Typography>
                      )}
                    </Box>
                  </CardContent>
                  <CardActions>
                    <IconButton
                      size="small"
                      onClick={() => openEditDialog(shoe)}
                    >
                      <Edit fontSize="small" />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => setDeleteTarget(shoe)}
                    >
                      <Delete fontSize="small" />
                    </IconButton>
                  </CardActions>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      )}

      {/* Create/Edit dialog */}
      <Dialog open={dialogOpen} onClose={closeDialog} fullWidth maxWidth="sm">
        <DialogTitle>{editingShoe ? "Edit Shoe" : "Add Shoe"}</DialogTitle>
        <DialogContent>
          <TextField
            label="Shoe Name"
            fullWidth
            margin="normal"
            placeholder="e.g. Brooks Ghost 16"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
          <TextField
            label="Date Acquired"
            type="date"
            fullWidth
            margin="normal"
            slotProps={{ inputLabel: { shrink: true } }}
            value={formData.dateAcquired}
            onChange={(e) =>
              setFormData({ ...formData, dateAcquired: e.target.value })
            }
          />
          <FormControlLabel
            control={
              <Switch
                checked={formData.retired}
                onChange={(e) =>
                  setFormData({ ...formData, retired: e.target.checked })
                }
              />
            }
            label="Retired"
            sx={{ mt: 1 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDialog}>Cancel</Button>
          <Button onClick={handleSave} variant="contained" disabled={isSaving}>
            {isSaving ? <CircularProgress size={20} /> : "Save"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete confirmation dialog */}
      <Dialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)}>
        <DialogTitle>Delete Shoe?</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete "{deleteTarget?.name}"? Workouts
            linked to this shoe will keep their history but no longer reference
            a shoe.
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
