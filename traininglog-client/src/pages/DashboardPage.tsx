import { useEffect, useState } from "react";
import {
  Container,
  Grid,
  Paper,
  Typography,
  Box,
  CircularProgress,
  Alert,
  Chip,
  Divider,
} from "@mui/material";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { dashboardApi } from "../api";
import type { DashboardDto } from "../types";

export default function DashboardPage() {
  const [dashboard, setDashboard] = useState<DashboardDto | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    dashboardApi
      .get()
      .then(setDashboard)
      .catch(() => setError("Failed to load dashboard data."))
      .finally(() => setIsLoading(false));
  }, []);

  if (isLoading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Container sx={{ mt: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  if (!dashboard) return null;

  const chartData = dashboard.weeklyMileage.map((w) => ({
    week: new Date(w.weekStartDate).toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
    }),
    Planned: w.plannedMiles,
    Actual: w.actualMiles,
  }));

  return (
    <Container sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 600 }}>
        Dashboard
      </Typography>

      <Grid container spacing={3} sx={{ mt: 1 }}>
        {/* Active training plan */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Paper elevation={2} sx={{ p: 3, height: "100%" }}>
            <Typography variant="h6" gutterBottom>
              Active Training Plan
            </Typography>
            {dashboard.activeTrainingPlan ? (
              <>
                <Typography variant="h5" sx={{ fontWeight: 600 }}>
                  {dashboard.activeTrainingPlan.name}
                </Typography>
                <Chip
                  label={`Week ${dashboard.activeTrainingPlan.currentWeek} of ${dashboard.activeTrainingPlan.durationWeeks}`}
                  color="primary"
                  size="small"
                  sx={{ mt: 1 }}
                />
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mt: 1 }}
                >
                  Started{" "}
                  {new Date(
                    dashboard.activeTrainingPlan.startDate,
                  ).toLocaleDateString()}
                </Typography>
              </>
            ) : (
              <Typography color="text.secondary">
                No active training plan yet.
              </Typography>
            )}
          </Paper>
        </Grid>

        {/* Upcoming race */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Paper elevation={2} sx={{ p: 3, height: "100%" }}>
            <Typography variant="h6" gutterBottom>
              Upcoming Race
            </Typography>
            {dashboard.upcomingRace ? (
              <>
                <Typography variant="h5" sx={{ fontWeight: 600 }}>
                  {dashboard.upcomingRace.name}
                </Typography>
                <Chip
                  label={`${dashboard.upcomingRace.daysUntilRace} days to go`}
                  color="secondary"
                  size="small"
                  sx={{ mt: 1 }}
                />
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mt: 1 }}
                >
                  {dashboard.upcomingRace.distanceMiles} miles ·{" "}
                  {new Date(
                    dashboard.upcomingRace.raceDate,
                  ).toLocaleDateString()}
                </Typography>
              </>
            ) : (
              <Typography color="text.secondary">
                No upcoming race scheduled.
              </Typography>
            )}
          </Paper>
        </Grid>

        {/* Weekly mileage chart */}
        <Grid size={12}>
          <Divider sx={{ my: 2 }} />
          <Paper elevation={2} sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Weekly Mileage (Last 8 Weeks)
            </Typography>
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="week" />
                  <YAxis
                    label={{
                      value: "Miles",
                      angle: -90,
                      position: "insideLeft",
                    }}
                  />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="Planned" fill="#90caf9" />
                  <Bar dataKey="Actual" fill="#1976d2" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <Typography color="text.secondary">
                No workouts logged in the last 8 weeks.
              </Typography>
            )}
          </Paper>
        </Grid>

        {/* Totals */}
        <Grid size={{ xs: 12, sm: 6 }}>
          <Paper elevation={2} sx={{ p: 3, textAlign: "center" }}>
            <Typography variant="overline" color="text.secondary">
              Total Workouts Completed
            </Typography>
            <Typography variant="h3" sx={{ fontWeight: 700 }}>
              {dashboard.totalWorkoutsCompleted}
            </Typography>
          </Paper>
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <Paper elevation={2} sx={{ p: 3, textAlign: "center" }}>
            <Typography variant="overline" color="text.secondary">
              Total Miles Run
            </Typography>
            <Typography variant="h3" sx={{ fontWeight: 700 }}>
              {dashboard.totalMilesRun.toFixed(1)}
            </Typography>
          </Paper>
        </Grid>
      </Grid>

      <Divider sx={{ my: 3 }} />
      <Typography variant="caption" color="text.secondary">
        Data pulled live from your API — training plans, workouts, and races
        feed directly into this view.
      </Typography>
    </Container>
  );
}
