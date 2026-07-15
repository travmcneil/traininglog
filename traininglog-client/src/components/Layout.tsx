import { useState } from "react";
import type { ReactNode, MouseEvent } from "react";
import { useNavigate, Link as RouterLink } from "react-router-dom";
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  Menu,
  MenuItem,
  IconButton,
  Avatar,
} from "@mui/material";
import { useAuth } from "../auth/AuthContext";
import { Brightness4, Brightness7 } from "@mui/icons-material";
import { useColorMode } from "../theme/ThemeContext";

export default function Layout({ children }: { children: ReactNode }) {
  const { email, role, logout } = useAuth();
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);

  const handleMenuOpen = (e: MouseEvent<HTMLElement>) =>
    setAnchorEl(e.currentTarget);
  const handleMenuClose = () => setAnchorEl(null);

  const handleLogout = () => {
    handleMenuClose();
    logout();
    navigate("/login");
  };

  const { mode, toggleColorMode } = useColorMode();

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "background.default" }}>
      <AppBar position="static" elevation={1}>
        <Toolbar>
          <Typography
            variant="h6"
            component={RouterLink}
            to="/dashboard"
            sx={{
              flexGrow: 1,
              textDecoration: "none",
              color: "inherit",
              fontWeight: 600,
            }}
          >
            Training Log
          </Typography>

          <Button color="inherit" component={RouterLink} to="/dashboard">
            Dashboard
          </Button>
          <Button color="inherit" component={RouterLink} to="/plans">
            Training Plans
          </Button>
          <Button color="inherit" component={RouterLink} to="/shoes">
            Shoes
          </Button>
          <Button color="inherit" component={RouterLink} to="/workouts">
            Workouts
          </Button>
          <Button color="inherit" component={RouterLink} to="/races">
            Races
          </Button>
          {role === "Admin" && (
            <Button color="inherit" component={RouterLink} to="/admin">
              Admin
            </Button>
          )}
          <IconButton color="inherit" onClick={toggleColorMode} sx={{ ml: 1 }}>
            {mode === "dark" ? <Brightness7 /> : <Brightness4 />}
          </IconButton>
          <IconButton onClick={handleMenuOpen} sx={{ ml: 2 }}>
            <Avatar
              sx={{
                width: 32,
                height: 32,
                bgcolor: "secondary.main",
                fontSize: 14,
              }}
            >
              {email?.charAt(0).toUpperCase()}
            </Avatar>
          </IconButton>
          <Menu anchorEl={anchorEl} open={!!anchorEl} onClose={handleMenuClose}>
            <MenuItem disabled sx={{ opacity: "1 !important" }}>
              {email}
            </MenuItem>
            <MenuItem onClick={handleLogout}>Log Out</MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>

      <Box component="main">{children}</Box>
    </Box>
  );
}
