import React, { useState, useEffect } from 'react';
import {
    Box, Typography, Button, Dialog, DialogTitle, DialogContent, DialogActions,
    TextField, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
    IconButton, Alert, Snackbar, CircularProgress
} from '@mui/material';
import { Add, Edit, Delete, Category as CategoryIcon } from '@mui/icons-material';
import apiService from '../../services/api.service';

function Categories() {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [openDialog, setOpenDialog] = useState(false);
    const [editingCategory, setEditingCategory] = useState(null);
    const [formData, setFormData] = useState({ name: '', description: '' });
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

    useEffect(() => { fetchCategories(); }, []);

    const fetchCategories = async () => {
        try {
            const data = await apiService.getCategories();
            setCategories(data);
        } catch (error) {
            showSnackbar('Error loading categories', 'error');
        } finally {
            setLoading(false);
        }
    };

    const showSnackbar = (message, severity) => setSnackbar({ open: true, message, severity });

    const handleOpenDialog = (category = null) => {
        if (category) {
            setEditingCategory(category);
            setFormData({ name: category.name, description: category.description || '' });
        } else {
            setEditingCategory(null);
            setFormData({ name: '', description: '' });
        }
        setOpenDialog(true);
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
        setEditingCategory(null);
        setFormData({ name: '', description: '' });
    };

    const handleSubmit = async () => {
        if (!formData.name.trim()) {
            showSnackbar('Category name is required', 'warning');
            return;
        }
        try {
            if (editingCategory) {
                await apiService.updateCategory(editingCategory.id, formData);
                showSnackbar('Category updated successfully', 'success');
            } else {
                await apiService.createCategory(formData);
                showSnackbar('Category created successfully', 'success');
            }
            fetchCategories();
            handleCloseDialog();
        } catch (error) {
            showSnackbar(error.response?.data?.name?.[0] || 'Error saving category', 'error');
        }
    };

    const handleDelete = async (id, name) => {
        if (window.confirm(`Are you sure you want to delete "${name}"?`)) {
            try {
                await apiService.deleteCategory(id);
                fetchCategories();
                showSnackbar('Category deleted successfully', 'success');
            } catch (error) {
                showSnackbar(error.response?.data?.error || 'Error deleting category', 'error');
            }
        }
    };

    if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}><CircularProgress /></Box>;

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h4" sx={{ fontWeight: 600 }}>Categories</Typography>
                <Button variant="contained" startIcon={<Add />} onClick={() => handleOpenDialog()} sx={{ background: 'linear-gradient(45deg, #667eea 0%, #764ba2 100%)' }}>Add Category</Button>
            </Box>

            {categories.length === 0 ? (
                <Paper sx={{ p: 4, textAlign: 'center', borderRadius: 2 }}>
                    <CategoryIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
                    <Typography variant="h6" color="text.secondary" gutterBottom>No Categories Yet</Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>Create your first category to organize products</Typography>
                    <Button variant="contained" startIcon={<Add />} onClick={() => handleOpenDialog()}>Add Category</Button>
                </Paper>
            ) : (
                <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>ID</TableCell><TableCell>Name</TableCell><TableCell>Description</TableCell><TableCell>Products</TableCell><TableCell align="right">Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {categories.map((cat) => (
                                <TableRow key={cat.id}>
                                    <TableCell>{cat.id}</TableCell>
                                    <TableCell><Typography fontWeight={500}>{cat.name}</Typography></TableCell>
                                    <TableCell>{cat.description || '-'}</TableCell>
                                    <TableCell>{cat.products_count || 0}</TableCell>
                                    <TableCell align="right">
                                        <IconButton color="primary" onClick={() => handleOpenDialog(cat)} size="small"><Edit /></IconButton>
                                        <IconButton color="error" onClick={() => handleDelete(cat.id, cat.name)} size="small"><Delete /></IconButton>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            )}

            <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
                <DialogTitle sx={{ fontWeight: 600 }}>{editingCategory ? 'Edit Category' : 'Add New Category'}</DialogTitle>
                <DialogContent>
                    <TextField autoFocus margin="dense" label="Category Name" fullWidth required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} sx={{ mb: 2, mt: 1 }} />
                    <TextField margin="dense" label="Description" fullWidth multiline rows={3} value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDialog}>Cancel</Button>
                    <Button onClick={handleSubmit} variant="contained" sx={{ background: 'linear-gradient(45deg, #667eea 0%, #764ba2 100%)' }}>{editingCategory ? 'Update' : 'Create'}</Button>
                </DialogActions>
            </Dialog>

            <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={() => setSnackbar({ ...snackbar, open: false })} anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
                <Alert severity={snackbar.severity}>{snackbar.message}</Alert>
            </Snackbar>
        </Box>
    );
}

export default Categories;