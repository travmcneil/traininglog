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

} from "@mui/material";
import { Edit, Delete, Add } from "@mui/icons-material";
import { trainingPlansApi } from "../api";
import type { TrainingPlanDto, CreateTrainingPlanDto } from "../types";

function calculateWeeks(startDate: string, endDate: string): number {
  if (!startDate || !endDate) return 0;
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffMs = end.getTime() - start.getTime();
  const diffDays = diffMs / (1000 * 60 * 60 * 24);
  return Math.max(1, Math.round(diffDays / 7));
}

function calculateEndDate(startDate: string, durationWeeks: number): string {
  if (!startDate) return "";
  const start = new Date(startDate);
  start.setDate(start.getDate() + durationWeeks * 7);
  return start.toISOString().split("T")[0];
}

export default function TrainingPlansPage() {
  const [plans, setPlans] = useState<TrainingPlanDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<TrainingPlanDto | null>(null);
  const [formData, setFormData] = useState<{
    name: string;
    startDate: string;
    endDate: string;
  }>({
    name: "",
    startDate: "",
    endDate: "",
  });
  const [isSaving, setIsSaving] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState<TrainingPlanDto | null>(
    null,
  );

  const loadPlans = () => {
    setIsLoading(true);
    trainingPlansApi
      .getAll()
      .then(setPlans)
      .catch(() => setError("Failed to load training plans."))
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    loadPlans();
  }, []);

  const openCreateDialog = () => {
    setEditingPlan(null);
    setFormData({ name: "", startDate: "", endDate: "" });
    setDialogOpen(true);
  };

  const openEditDialog = (plan: TrainingPlanDto) => {
    setEditingPlan(plan);
    const startDate = plan.startDate.split("T")[0];
    setFormData({
      name: plan.name,
      startDate,
      endDate: calculateEndDate(startDate, plan.durationWeeks),
    });
    setDialogOpen(true);
  };

  const closeDialog = () => setDialogOpen(false);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const dto: CreateTrainingPlanDto = {
        name: formData.name,
        startDate: formData.startDate,
        durationWeeks: calculateWeeks(formData.startDate, formData.endDate),
      };

      if (editingPlan) {
        await trainingPlansApi.update(editingPlan.id, dto);
      } else {
        await trainingPlansApi.create(dto);
      }
      closeDialog();
      loadPlans();
    } catch {
      setError("Failed to save training plan.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await trainingPlansApi.delete(deleteTarget.id);
      setDeleteTarget(null);
      loadPlans();
    } catch {
      setError("Failed to delete training plan.");
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
          Training Plans
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={openCreateDialog}
        >
          New Plan
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {plans.length === 0 ? (
        <Alert severity="info">
          You don't have any training plans yet. Create one to get started.
        </Alert>
      ) : (
        <Grid container spacing={3}>
          {plans.map((plan) => (
            <Grid size={{ xs: 12, sm: 6, md: 4 }} key={plan.id}>
              <Card elevation={2}>
                <CardContent>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                    }}
                  >
                    <Typography variant="h6">{plan.name}</Typography>
                    {plan.isActive && (
                      <Chip label="Active" color="primary" size="small" />
                    )}
                  </Box>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mt: 1 }}
                  >
                    Starts {new Date(plan.startDate).toLocaleDateString()}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {plan.durationWeeks} weeks
                  </Typography>
                </CardContent>
                <CardActions>
                  <IconButton size="small" onClick={() => openEditDialog(plan)}>
                    <Edit fontSize="small" />
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={() => setDeleteTarget(plan)}
                  >
                    <Delete fontSize="small" />
                  </IconButton>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Create/Edit dialog */}
      <Dialog open={dialogOpen} onClose={closeDialog} fullWidth maxWidth="sm">
        <DialogTitle>
          {editingPlan ? "Edit Training Plan" : "New Training Plan"}
        </DialogTitle>
        <DialogContent>
          <TextField
            label="Plan Name"
            fullWidth
            margin="normal"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
          <TextField
            label="Start Date"
            type="date"
            fullWidth
            margin="normal"
            slotProps={{ inputLabel: { shrink: true } }}
            value={formData.startDate}
            onChange={(e) =>
              setFormData({ ...formData, startDate: e.target.value })
            }
          />
          <TextField
            label="End Date"
            type="date"
            fullWidth
            margin="normal"
            slotProps={{ inputLabel: { shrink: true } }}
            value={formData.endDate}
            onChange={(e) =>
              setFormData({ ...formData, endDate: e.target.value })
            }
          />
          {formData.startDate && formData.endDate && (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              {calculateWeeks(formData.startDate, formData.endDate)} week
              {calculateWeeks(formData.startDate, formData.endDate) !== 1
                ? "s"
                : ""}
            </Typography>
          )}
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
        <DialogTitle>Delete Training Plan?</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete "{deleteTarget?.name}"? This will
            also delete all associated workouts and races.
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
