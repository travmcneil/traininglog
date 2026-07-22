import { useState } from 'react';
import type { ReactNode, MouseEvent } from 'react';
import { useNavigate, useLocation, Link as RouterLink } from 'react-router-dom';
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
  Drawer,
  List,
  ListItemButton,
  ListItemText,
  Divider,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { Menu as MenuIcon, Brightness4, Brightness7 } from '@mui/icons-material';
import { useAuth } from '../auth/AuthContext';
import { useColorMode } from '../theme/ThemeContext';

const navLinks = [
  { label: 'Dashboard', to: '/dashboard' },
  { label: 'Training Plans', to: '/plans' },
  { label: 'Workouts', to: '/workouts' },
  { label: 'Races', to: '/races' },
  { label: 'Shoes', to: '/shoes' },
];

export default function Layout({ children }: { children: ReactNode }) {
  const { email, role, logout } = useAuth();
  const { mode, toggleColorMode } = useColorMode();
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const handleMenuOpen = (e: MouseEvent<HTMLElement>) => setAnchorEl(e.currentTarget);
  const handleMenuClose = () => setAnchorEl(null);

  const handleLogout = () => {
    handleMenuClose();
    setDrawerOpen(false);
    logout();
    navigate('/login');
  };

  const links = role === 'Admin' ? [...navLinks, { label: 'Admin', to: '/admin' }] : navLinks;

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <AppBar position="static" elevation={1}>
        <Toolbar>
          {isMobile && (
            <IconButton
              color="inherit"
              edge="start"
              onClick={() => setDrawerOpen(true)}
              sx={{ mr: 1 }}
            >
              <MenuIcon />
            </IconButton>
          )}

          <Typography
            variant="h6"
            component={RouterLink}
            to="/dashboard"
            sx={{ flexGrow: 1, textDecoration: 'none', color: 'inherit', fontWeight: 600 }}
          >
            TrainingLog
          </Typography>

          {!isMobile &&
            links.map((link) => (
              <Button key={link.to} color="inherit" component={RouterLink} to={link.to}>
                {link.label}
              </Button>
            ))}

          <IconButton color="inherit" onClick={toggleColorMode} sx={{ ml: 1 }}>
            {mode === 'dark' ? <Brightness7 /> : <Brightness4 />}
          </IconButton>

          <IconButton onClick={handleMenuOpen} sx={{ ml: 1 }}>
            <Avatar sx={{ width: 32, height: 32, bgcolor: 'secondary.main', fontSize: 14 }}>
              {email?.charAt(0).toUpperCase()}
            </Avatar>
          </IconButton>
          <Menu anchorEl={anchorEl} open={!!anchorEl} onClose={handleMenuClose}>
            <MenuItem disabled sx={{ opacity: '1 !important' }}>
              {email}
            </MenuItem>
            <MenuItem onClick={handleLogout}>Log Out</MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>

      {/* Mobile navigation drawer */}
      <Drawer anchor="left" open={drawerOpen} onClose={() => setDrawerOpen(false)}>
        <Box sx={{ width: 240 }} role="presentation">
          <Typography variant="h6" sx={{ p: 2, fontWeight: 600 }}>
            TrainingLog
          </Typography>
          <Divider />
          <List>
            {links.map((link) => (
              <ListItemButton
                key={link.to}
                component={RouterLink}
                to={link.to}
                selected={location.pathname === link.to}
                onClick={() => setDrawerOpen(false)}
              >
                <ListItemText primary={link.label} />
              </ListItemButton>
            ))}
          </List>
          <Divider />
          <List>
            <ListItemButton onClick={handleLogout}>
              <ListItemText primary="Log Out" />
            </ListItemButton>
          </List>
        </Box>
      </Drawer>

      <Box component="main">{children}</Box>
    </Box>
  );
}