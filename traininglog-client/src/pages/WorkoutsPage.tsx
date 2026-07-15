import { useEffect, useState } from "react";
import {
  Container,
  Typography,
  Button,
  Box,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Checkbox,
  Chip,
} from "@mui/material";
import { Edit, Delete, Add } from "@mui/icons-material";
import { workoutsApi, trainingPlansApi, shoesApi } from "../api";
import { WorkoutType } from "../types";
import type {
  WorkoutDto,
  CreateWorkoutDto,
  TrainingPlanDto,
  ShoeDto,
} from "../types";

const workoutTypeLabels: Record<number, string> = {
  [WorkoutType.Run]: "Run",
  [WorkoutType.CrossTrain]: "Cross Train",
  [WorkoutType.Rest]: "Rest",
};

const emptyForm: CreateWorkoutDto = {
  date: "",
  type: WorkoutType.Run,
  plannedDistanceMiles: null,
  actualDistanceMiles: null,
  plannedPace: null,
  actualPace: null,
  duration: null,
  notes: "",
  completed: false,
  trainingPlanId: 0,
  shoeId: null,
};

// Validates final format: mm:ss or h:mm:ss / hh:mm:ss
function isValidTimeFormat(value: string): boolean {
  if (!value) return true; // empty is allowed (nullable field)
  return /^\d{1,2}(:\d{2}){1,2}$/.test(value);
}

// Converts "mm:ss" or "h:mm:ss" into total seconds
function timeToSeconds(time: string | null): number | null {
  if (!time || !isValidTimeFormat(time)) return null;
  const parts = time.split(":").map(Number);
  if (parts.length === 2) {
    const [min, sec] = parts;
    return min * 60 + sec;
  }
  if (parts.length === 3) {
    const [hr, min, sec] = parts;
    return hr * 3600 + min * 60 + sec;
  }
  return null;
}

// Converts total seconds back into "h:mm:ss"
function secondsToDuration(totalSeconds: number): string {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = Math.round(totalSeconds % 60);
  return `${hours}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
}

// Computes duration = actual pace (per mile) × actual distance
function calculateDuration(
  actualPace: string | null,
  actualDistanceMiles: number | null,
): string | null {
  const paceSeconds = timeToSeconds(actualPace);
  if (
    paceSeconds === null ||
    actualDistanceMiles === null ||
    actualDistanceMiles <= 0
  ) {
    return null;
  }
  const totalSeconds = paceSeconds * actualDistanceMiles;
  return secondsToDuration(totalSeconds);
}

// Allows only digits and colons, and auto-inserts colons as the user types
function formatTimeInput(rawValue: string, previousValue: string): string {
  // Strip everything except digits
  const digitsOnly = rawValue.replace(/\D/g, "");

  // Detect if user is deleting (raw is shorter than previous) — don't fight backspace
  if (rawValue.length < previousValue.length) {
    return rawValue.replace(/[^\d:]/g, "");
  }

  // Reassemble with colons every 2 digits, max hh:mm:ss (6 digits)
  const limited = digitsOnly.slice(0, 6);
  const parts: string[] = [];
  for (let i = 0; i < limited.length; i += 2) {
    parts.push(limited.slice(i, i + 2));
  }
  return parts.join(":");
}

export default function WorkoutsPage() {
  const [plans, setPlans] = useState<TrainingPlanDto[]>([]);
  const [shoes, setShoes] = useState<ShoeDto[]>([]);
  const [selectedPlanId, setSelectedPlanId] = useState<number | "">("");
  const [workouts, setWorkouts] = useState<WorkoutDto[]>([]);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingWorkout, setEditingWorkout] = useState<WorkoutDto | null>(null);
  const [formData, setFormData] = useState<CreateWorkoutDto>(emptyForm);
  const [isSaving, setIsSaving] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState<WorkoutDto | null>(null);

  // Load plans and shoes once on mount
  useEffect(() => {
    Promise.all([trainingPlansApi.getAll(), shoesApi.getAll()])
      .then(([plansData, shoesData]) => {
        setPlans(plansData);
        setShoes(shoesData);
        if (plansData.length > 0) {
          setSelectedPlanId(plansData[0].id);
        } else {
          setIsLoading(false);
        }
      })
      .catch(() => {
        setError("Failed to load training plans.");
        setIsLoading(false);
      });
  }, []);

  useEffect(() => {
    if (selectedPlanId !== "") {
      loadWorkouts(selectedPlanId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedPlanId]);

  // Auto-calculate duration from actual pace × actual distance.
  // IMPORTANT: this hook must stay above any conditional `return` in this
  // component — moving it below one (even accidentally) causes React error
  // #300 ("Rendered fewer hooks than expected"), since hooks must run in the
  // same order on every render.
  useEffect(() => {
    const calculated = calculateDuration(
      formData.actualPace,
      formData.actualDistanceMiles,
    );
    setFormData((prev) => ({ ...prev, duration: calculated }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.actualPace, formData.actualDistanceMiles]);

  const loadWorkouts = (planId: number) => {
    setIsLoading(true);
    workoutsApi
      .getAll(planId)
      .then(setWorkouts)
      .catch(() => setError("Failed to load workouts."))
      .finally(() => setIsLoading(false));
  };

  const openCreateDialog = () => {
    if (selectedPlanId === "") return;
    setEditingWorkout(null);
    setFormData({ ...emptyForm, trainingPlanId: selectedPlanId });
    setDialogOpen(true);
  };

  const openEditDialog = (workout: WorkoutDto) => {
    setEditingWorkout(workout);
    setFormData({
      date: workout.date.split("T")[0],
      type: workout.type,
      plannedDistanceMiles: workout.plannedDistanceMiles,
      actualDistanceMiles: workout.actualDistanceMiles,
      plannedPace: workout.plannedPace,
      actualPace: workout.actualPace,
      duration: workout.duration,
      notes: workout.notes,
      completed: workout.completed,
      trainingPlanId: workout.trainingPlanId,
      shoeId: workout.shoeId,
    });
    setDialogOpen(true);
  };

  const closeDialog = () => setDialogOpen(false);

  const handleSave = async () => {
    const paceFields = [formData.plannedPace, formData.actualPace];
    if (paceFields.some((v) => !isValidTimeFormat(v ?? ""))) {
      setError("Please fix the pace fields before saving (mm:ss format).");
      return;
    }

    setIsSaving(true);
    try {
      if (editingWorkout) {
        await workoutsApi.update(editingWorkout.id, formData);
      } else {
        await workoutsApi.create(formData);
      }
      closeDialog();
      if (selectedPlanId !== "") loadWorkouts(selectedPlanId);
    } catch {
      setError("Failed to save workout.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await workoutsApi.delete(deleteTarget.id);
      setDeleteTarget(null);
      if (selectedPlanId !== "") loadWorkouts(selectedPlanId);
    } catch {
      setError("Failed to delete workout.");
    }
  };

  // Early return — safe here because it comes AFTER every hook above has
  // already been called, on every render, unconditionally.
  if (plans.length === 0 && !isLoading) {
    return (
      <Container sx={{ mt: 4 }}>
        <Alert severity="info">
          You need a training plan before you can log workouts. Create one on
          the Training Plans page first.
        </Alert>
      </Container>
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
          Workouts
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={openCreateDialog}
        >
          Log Workout
        </Button>
      </Box>

      <FormControl sx={{ minWidth: 250, mb: 3 }} size="small">
        <InputLabel>Training Plan</InputLabel>
        <Select
          value={selectedPlanId}
          label="Training Plan"
          onChange={(e) => setSelectedPlanId(e.target.value as number)}
        >
          {plans.map((plan) => (
            <MenuItem key={plan.id} value={plan.id}>
              {plan.name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {isLoading ? (
        <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
          <CircularProgress />
        </Box>
      ) : workouts.length === 0 ? (
        <Alert severity="info">No workouts logged for this plan yet.</Alert>
      ) : (
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Date</TableCell>
              <TableCell>Type</TableCell>
              <TableCell align="right">Planned</TableCell>
              <TableCell align="right">Actual</TableCell>
              <TableCell>Notes</TableCell>
              <TableCell align="center">Done</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {workouts.map((workout) => (
              <TableRow key={workout.id}>
                <TableCell>
                  {new Date(workout.date).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  <Chip label={workoutTypeLabels[workout.type]} size="small" />
                </TableCell>
                <TableCell align="right">
                  {workout.plannedDistanceMiles != null
                    ? `${workout.plannedDistanceMiles} mi`
                    : "—"}
                </TableCell>
                <TableCell align="right">
                  {workout.actualDistanceMiles != null
                    ? `${workout.actualDistanceMiles} mi`
                    : "—"}
                </TableCell>
                <TableCell sx={{ maxWidth: 200 }}>
                  {workout.notes || "—"}
                </TableCell>
                <TableCell align="center">
                  <Checkbox checked={workout.completed} disabled size="small" />
                </TableCell>
                <TableCell align="right">
                  <IconButton
                    size="small"
                    onClick={() => openEditDialog(workout)}
                  >
                    <Edit fontSize="small" />
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={() => setDeleteTarget(workout)}
                  >
                    <Delete fontSize="small" />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      {/* Create/Edit dialog */}
      <Dialog open={dialogOpen} onClose={closeDialog} fullWidth maxWidth="sm">
        <DialogTitle>
          {editingWorkout ? "Edit Workout" : "Log Workout"}
        </DialogTitle>
        <DialogContent>
          <TextField
            label="Date"
            type="date"
            fullWidth
            margin="normal"
            slotProps={{ inputLabel: { shrink: true } }}
            value={formData.date}
            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
          />

          <FormControl fullWidth margin="normal">
            <InputLabel>Type</InputLabel>
            <Select
              value={formData.type}
              label="Type"
              onChange={(e) =>
                setFormData({
                  ...formData,
                  type: e.target.value as WorkoutType,
                })
              }
            >
              <MenuItem value={WorkoutType.Run}>Run</MenuItem>
              <MenuItem value={WorkoutType.CrossTrain}>Cross Train</MenuItem>
              <MenuItem value={WorkoutType.Rest}>Rest</MenuItem>
            </Select>
          </FormControl>

          <Box sx={{ display: "flex", gap: 2 }}>
            <TextField
              label="Planned Distance (mi)"
              type="number"
              fullWidth
              margin="normal"
              value={formData.plannedDistanceMiles ?? ""}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  plannedDistanceMiles: e.target.value
                    ? parseFloat(e.target.value)
                    : null,
                })
              }
            />
            <TextField
              label="Actual Distance (mi)"
              type="number"
              fullWidth
              margin="normal"
              value={formData.actualDistanceMiles ?? ""}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  actualDistanceMiles: e.target.value
                    ? parseFloat(e.target.value)
                    : null,
                })
              }
            />
          </Box>

          <Box sx={{ display: "flex", gap: 2 }}>
            <TextField
              label="Planned Pace (mm:ss)"
              placeholder="9:30"
              fullWidth
              margin="normal"
              value={formData.plannedPace ?? ""}
              error={!isValidTimeFormat(formData.plannedPace ?? "")}
              helperText={
                !isValidTimeFormat(formData.plannedPace ?? "")
                  ? "Use mm:ss format, e.g. 9:30"
                  : " "
              }
              onChange={(e) =>
                setFormData({
                  ...formData,
                  plannedPace:
                    formatTimeInput(
                      e.target.value,
                      formData.plannedPace ?? "",
                    ) || null,
                })
              }
            />
            <TextField
              label="Actual Pace (mm:ss)"
              placeholder="9:15"
              fullWidth
              margin="normal"
              value={formData.actualPace ?? ""}
              error={!isValidTimeFormat(formData.actualPace ?? "")}
              helperText={
                !isValidTimeFormat(formData.actualPace ?? "")
                  ? "Use mm:ss format, e.g. 9:15"
                  : " "
              }
              onChange={(e) =>
                setFormData({
                  ...formData,
                  actualPace:
                    formatTimeInput(
                      e.target.value,
                      formData.actualPace ?? "",
                    ) || null,
                })
              }
            />
          </Box>

          <TextField
            label="Duration (calculated)"
            fullWidth
            margin="normal"
            value={formData.duration ?? ""}
            slotProps={{ input: { readOnly: true } }}
            helperText="Automatically calculated from actual pace × actual distance"
          />

          <FormControl fullWidth margin="normal">
            <InputLabel>Shoe (optional)</InputLabel>
            <Select
              value={formData.shoeId ?? ""}
              label="Shoe (optional)"
              onChange={(e) => {
                const value = e.target.value as string | number;
                setFormData({
                  ...formData,
                  shoeId: value === "" ? null : Number(value),
                });
              }}
            >
              <MenuItem value="">None</MenuItem>
              {shoes
                .filter((s) => !s.retired)
                .map((shoe) => (
                  <MenuItem key={shoe.id} value={shoe.id}>
                    {shoe.name}
                  </MenuItem>
                ))}
            </Select>
          </FormControl>

          <TextField
            label="Notes"
            fullWidth
            multiline
            rows={2}
            margin="normal"
            value={formData.notes ?? ""}
            onChange={(e) =>
              setFormData({ ...formData, notes: e.target.value || null })
            }
          />

          <Box sx={{ display: "flex", alignItems: "center", mt: 1 }}>
            <Checkbox
              checked={formData.completed}
              onChange={(e) =>
                setFormData({ ...formData, completed: e.target.checked })
              }
            />
            <Typography>Completed</Typography>
          </Box>
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
        <DialogTitle>Delete Workout?</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete this workout entry?
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
