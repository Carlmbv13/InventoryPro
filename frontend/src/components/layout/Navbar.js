import React, { useState } from 'react';
import {
    AppBar, Box, Toolbar, Typography, IconButton, Drawer,
    List, ListItem, ListItemIcon, ListItemText, Divider, useMediaQuery, useTheme
} from '@mui/material';
import { Menu as MenuIcon, Dashboard, Inventory, ShoppingCart, Category, Store } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const drawerWidth = 240;

function Navbar({ children }) {
    const [mobileOpen, setMobileOpen] = useState(false);
    const navigate = useNavigate();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    const handleDrawerToggle = () => setMobileOpen(!mobileOpen);

    const menuItems = [
        { text: 'Dashboard', icon: <Dashboard />, path: '/' },
        { text: 'Categories', icon: <Category />, path: '/categories' },
        { text: 'Products', icon: <Inventory />, path: '/products' },
        { text: 'New Sale', icon: <ShoppingCart />, path: '/sales/new' },
    ];

    const drawer = (
        <div>
            <Toolbar sx={{ justifyContent: 'center' }}>
                <Store sx={{ mr: 1, color: 'primary.main' }} />
                <Typography variant="h6" noWrap sx={{ fontWeight: 600 }}>InventoryPro</Typography>
            </Toolbar>
            <Divider />
            <List>
                {menuItems.map((item) => (
                    <ListItem
                        button
                        key={item.text}
                        onClick={() => { navigate(item.path); if (isMobile) setMobileOpen(false); }}
                        sx={{ '&:hover': { backgroundColor: 'primary.light', '& .MuiListItemIcon-root': { color: 'white' }, '& .MuiListItemText-primary': { color: 'white' } } }}
                    >
                        <ListItemIcon>{item.icon}</ListItemIcon>
                        <ListItemText primary={item.text} />
                    </ListItem>
                ))}
            </List>
        </div>
    );

    return (
        <Box sx={{ display: 'flex' }}>
            <AppBar position="fixed" sx={{ width: { sm: `calc(100% - ${drawerWidth}px)` }, ml: { sm: `${drawerWidth}px` }, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
                <Toolbar>
                    <IconButton color="inherit" edge="start" onClick={handleDrawerToggle} sx={{ mr: 2, display: { sm: 'none' } }}>
                        <MenuIcon />
                    </IconButton>
                    <Typography variant="h6" noWrap sx={{ flexGrow: 1 }}>Inventory Management System</Typography>
                </Toolbar>
            </AppBar>
            <Box component="nav" sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}>
                <Drawer variant="temporary" open={mobileOpen} onClose={handleDrawerToggle} ModalProps={{ keepMounted: true }} sx={{ display: { xs: 'block', sm: 'none' }, '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth } }}>
                    {drawer}
                </Drawer>
                <Drawer variant="permanent" sx={{ display: { xs: 'none', sm: 'block' }, '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth } }} open>
                    {drawer}
                </Drawer>
            </Box>
            <Box component="main" sx={{ flexGrow: 1, p: 3, width: { sm: `calc(100% - ${drawerWidth}px)` }, minHeight: '100vh', bgcolor: '#f5f5f5' }}>
                <Toolbar />
                {children}
            </Box>
        </Box>
    );
}

export default Navbar;