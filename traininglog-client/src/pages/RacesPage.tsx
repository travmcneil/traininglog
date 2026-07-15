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
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from "@mui/material";
import { Edit, Delete, Add, EmojiEvents } from "@mui/icons-material";
import { racesApi, trainingPlansApi } from "../api";
import type { RaceDto, CreateRaceDto, TrainingPlanDto } from "../types";

const emptyForm: CreateRaceDto = {
  name: "",
  raceDate: "",
  distanceMiles: 13.1,
  targetTime: null,
  trainingPlanId: 0,
};

// Same time helpers used on the Workouts page
function isValidTimeFormat(value: string): boolean {
  if (!value) return true;
  return /^\d{1,2}(:\d{2}){1,2}$/.test(value);
}

function formatTimeInput(rawValue: string, previousValue: string): string {
  const digitsOnly = rawValue.replace(/\D/g, "");
  if (rawValue.length < previousValue.length) {
    return rawValue.replace(/[^\d:]/g, "");
  }
  const limited = digitsOnly.slice(0, 6);
  const parts: string[] = [];
  for (let i = 0; i < limited.length; i += 2) {
    parts.push(limited.slice(i, i + 2));
  }
  return parts.join(":");
}

export default function RacesPage() {
  const [plans, setPlans] = useState<TrainingPlanDto[]>([]);
  const [selectedPlanId, setSelectedPlanId] = useState<number | "">("");
  const [races, setRaces] = useState<RaceDto[]>([]);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingRace, setEditingRace] = useState<RaceDto | null>(null);
  const [formData, setFormData] = useState<CreateRaceDto>(emptyForm);
  const [isSaving, setIsSaving] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState<RaceDto | null>(null);

  useEffect(() => {
    trainingPlansApi
      .getAll()
      .then((plansData) => {
        setPlans(plansData);
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

  const loadRaces = (planId: number) => {
    setIsLoading(true);
    racesApi
      .getAll(planId)
      .then(setRaces)
      .catch(() => setError("Failed to load races."))
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    if (selectedPlanId !== "") {
      loadRaces(selectedPlanId);
    }
  }, [selectedPlanId]);

  const openCreateDialog = () => {
    if (selectedPlanId === "") return;
    setEditingRace(null);
    setFormData({ ...emptyForm, trainingPlanId: selectedPlanId });
    setDialogOpen(true);
  };

  const openEditDialog = (race: RaceDto) => {
    setEditingRace(race);
    setFormData({
      name: race.name,
      raceDate: race.raceDate.split("T")[0],
      distanceMiles: race.distanceMiles,
      targetTime: race.targetTime,
      trainingPlanId: race.trainingPlanId,
    });
    setDialogOpen(true);
  };

  const closeDialog = () => setDialogOpen(false);

  const handleSave = async () => {
    if (!isValidTimeFormat(formData.targetTime ?? "")) {
      setError("Please fix the target time before saving (h:mm:ss format).");
      return;
    }

    setIsSaving(true);
    try {
      if (editingRace) {
        await racesApi.update(editingRace.id, formData);
      } else {
        await racesApi.create(formData);
      }
      closeDialog();
      if (selectedPlanId !== "") loadRaces(selectedPlanId);
    } catch {
      setError("Failed to save race.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await racesApi.delete(deleteTarget.id);
      setDeleteTarget(null);
      if (selectedPlanId !== "") loadRaces(selectedPlanId);
    } catch {
      setError("Failed to delete race.");
    }
  };

  if (plans.length === 0 && !isLoading) {
    return (
      <Container sx={{ mt: 4 }}>
        <Alert severity="info">
          You need a training plan before you can add races. Create one on the
          Training Plans page first.
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
          Races
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={openCreateDialog}
        >
          Add Race
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
      ) : races.length === 0 ? (
        <Alert severity="info">No races added for this plan yet.</Alert>
      ) : (
        <Grid container spacing={3}>
          {races.map((race) => {
            const daysUntil = Math.ceil(
              (new Date(race.raceDate).getTime() - Date.now()) /
                (1000 * 60 * 60 * 24),
            );
            const isPast = daysUntil < 0;

            return (
              <Grid size={{ xs: 12, sm: 6, md: 4 }} key={race.id}>
                <Card elevation={2}>
                  <CardContent>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <EmojiEvents
                        color={isPast ? "disabled" : "primary"}
                        fontSize="small"
                      />
                      <Typography variant="h6">{race.name}</Typography>
                    </Box>
                    <Chip
                      label={isPast ? "Completed" : `${daysUntil} days to go`}
                      color={isPast ? "default" : "secondary"}
                      size="small"
                      sx={{ mt: 1 }}
                    />
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ mt: 1 }}
                    >
                      {race.distanceMiles} miles ·{" "}
                      {new Date(race.raceDate).toLocaleDateString()}
                    </Typography>
                    {race.targetTime && (
                      <Typography variant="body2" color="text.secondary">
                        Target: {race.targetTime}
                      </Typography>
                    )}
                  </CardContent>
                  <CardActions>
                    <IconButton
                      size="small"
                      onClick={() => openEditDialog(race)}
                    >
                      <Edit fontSize="small" />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => setDeleteTarget(race)}
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
        <DialogTitle>{editingRace ? "Edit Race" : "Add Race"}</DialogTitle>
        <DialogContent>
          <TextField
            label="Race Name"
            fullWidth
            margin="normal"
            placeholder="e.g. Aiken Half Marathon"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
          <TextField
            label="Race Date"
            type="date"
            fullWidth
            margin="normal"
            slotProps={{ inputLabel: { shrink: true } }}
            value={formData.raceDate}
            onChange={(e) =>
              setFormData({ ...formData, raceDate: e.target.value })
            }
          />
          <TextField
            label="Distance (miles)"
            type="number"
            fullWidth
            margin="normal"
            value={formData.distanceMiles}
            onChange={(e) =>
              setFormData({
                ...formData,
                distanceMiles: parseFloat(e.target.value) || 0,
              })
            }
          />
          <TextField
            label="Target Time (h:mm:ss)"
            placeholder="1:55:00"
            fullWidth
            margin="normal"
            value={formData.targetTime ?? ""}
            error={!isValidTimeFormat(formData.targetTime ?? "")}
            helperText={
              !isValidTimeFormat(formData.targetTime ?? "")
                ? "Use h:mm:ss format, e.g. 1:55:00"
                : " "
            }
            onChange={(e) =>
              setFormData({
                ...formData,
                targetTime:
                  formatTimeInput(e.target.value, formData.targetTime ?? "") ||
                  null,
              })
            }
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
        <DialogTitle>Delete Race?</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete "{deleteTarget?.name}"?
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
