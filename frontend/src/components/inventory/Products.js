import React, { useState, useEffect } from 'react';
import {
    Box, Typography, Button, Dialog, DialogTitle, DialogContent, DialogActions,
    TextField, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
    IconButton, Chip, Alert, Snackbar, CircularProgress, FormControl, InputLabel,
    Select, MenuItem, Grid
} from '@mui/material';
import { Add, Edit, Delete, Inventory as InventoryIcon, Warning } from '@mui/icons-material';
import apiService from '../../services/api.service';

function Products() {
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [openDialog, setOpenDialog] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    const [filters, setFilters] = useState({ category: '', search: '', lowStock: false });
    const [formData, setFormData] = useState({ category: '', name: '', description: '', price: '', stock: '', sku: '', low_stock_threshold: '5' });
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

    useEffect(() => { fetchData(); }, []);
    useEffect(() => { fetchProducts(); }, [filters]);

    const fetchData = async () => {
        try {
            const [productsData, categoriesData] = await Promise.all([apiService.getProducts(), apiService.getCategories()]);
            setProducts(productsData);
            setCategories(categoriesData);
        } catch (error) {
            showSnackbar('Error loading data', 'error');
        } finally {
            setLoading(false);
        }
    };

    const fetchProducts = async () => {
        try {
            const data = await apiService.getProducts(filters);
            setProducts(data);
        } catch (error) {
            showSnackbar('Error loading products', 'error');
        }
    };

    const showSnackbar = (message, severity) => setSnackbar({ open: true, message, severity });

    const generateSKU = () => 'PRD-' + Math.random().toString(36).substring(2, 8).toUpperCase();

    const handleOpenDialog = (product = null) => {
        if (product) {
            setEditingProduct(product);
            setFormData({
                category: product.category, name: product.name, description: product.description || '',
                price: product.price, stock: product.stock, sku: product.sku, low_stock_threshold: product.low_stock_threshold
            });
        } else {
            setEditingProduct(null);
            setFormData({ category: '', name: '', description: '', price: '', stock: '', sku: generateSKU(), low_stock_threshold: '5' });
        }
        setOpenDialog(true);
    };

    const handleCloseDialog = () => { setOpenDialog(false); setEditingProduct(null); };

    const handleSubmit = async () => {
        if (!formData.name.trim()) { showSnackbar('Product name is required', 'warning'); return; }
        if (!formData.category) { showSnackbar('Please select a category', 'warning'); return; }
        if (!formData.price || formData.price <= 0) { showSnackbar('Please enter a valid price', 'warning'); return; }
        if (!formData.stock || formData.stock < 0) { showSnackbar('Please enter valid stock', 'warning'); return; }
        try {
            if (editingProduct) {
                await apiService.updateProduct(editingProduct.id, formData);
                showSnackbar('Product updated successfully', 'success');
            } else {
                await apiService.createProduct(formData);
                showSnackbar('Product created successfully', 'success');
            }
            fetchProducts();
            handleCloseDialog();
        } catch (error) {
            showSnackbar(error.response?.data?.sku?.[0] || 'Error saving product', 'error');
        }
    };

    const handleDelete = async (id, name) => {
        if (window.confirm(`Are you sure you want to delete "${name}"?`)) {
            try {
                await apiService.deleteProduct(id);
                fetchProducts();
                showSnackbar('Product deleted successfully', 'success');
            } catch (error) {
                showSnackbar(error.response?.data?.error || 'Error deleting product', 'error');
            }
        }
    };

    const getStockColor = (stock, threshold) => {
        if (stock === 0) return 'error';
        if (stock <= threshold) return 'warning';
        return 'success';
    };

    if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}><CircularProgress /></Box>;

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h4" sx={{ fontWeight: 600 }}>Products</Typography>
                <Button variant="contained" startIcon={<Add />} onClick={() => handleOpenDialog()} sx={{ background: 'linear-gradient(45deg, #667eea 0%, #764ba2 100%)' }}>Add Product</Button>
            </Box>

            <Paper sx={{ p: 2, mb: 3, borderRadius: 2 }}>
                <Grid container spacing={2} alignItems="center">
                    <Grid item xs={12} sm={4}><TextField fullWidth size="small" label="Search" placeholder="Search by name or SKU" value={filters.search} onChange={(e) => setFilters({ ...filters, search: e.target.value })} /></Grid>
                    <Grid item xs={12} sm={3}>
                        <FormControl fullWidth size="small">
                            <InputLabel>Category</InputLabel>
                            <Select value={filters.category} label="Category" onChange={(e) => setFilters({ ...filters, category: e.target.value })}>
                                <MenuItem value="">All Categories</MenuItem>
                                {categories.map((cat) => <MenuItem key={cat.id} value={cat.id}>{cat.name}</MenuItem>)}
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid item xs={12} sm={3}>
                        <FormControl fullWidth size="small">
                            <InputLabel>Stock Status</InputLabel>
                            <Select value={filters.lowStock} label="Stock Status" onChange={(e) => setFilters({ ...filters, lowStock: e.target.value })}>
                                <MenuItem value={false}>All</MenuItem>
                                <MenuItem value={true}>Low Stock Only</MenuItem>
                            </Select>
                        </FormControl>
                    </Grid>
                </Grid>
            </Paper>

            {products.length === 0 ? (
                <Paper sx={{ p: 4, textAlign: 'center', borderRadius: 2 }}>
                    <InventoryIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
                    <Typography variant="h6" color="text.secondary" gutterBottom>No Products Yet</Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>Add your first product to start selling</Typography>
                    <Button variant="contained" startIcon={<Add />} onClick={() => handleOpenDialog()}>Add Product</Button>
                </Paper>
            ) : (
                <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>SKU</TableCell><TableCell>Name</TableCell><TableCell>Category</TableCell><TableCell align="right">Price</TableCell><TableCell align="right">Stock</TableCell><TableCell>Status</TableCell><TableCell align="right">Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {products.map((p) => (
                                <TableRow key={p.id}>
                                    <TableCell><Typography variant="body2" fontFamily="monospace">{p.sku}</Typography></TableCell>
                                    <TableCell><Typography fontWeight={500}>{p.name}</Typography></TableCell>
                                    <TableCell>{p.category_name}</TableCell>
                                    <TableCell align="right">₱{parseFloat(p.price).toFixed(2)}</TableCell>
                                    <TableCell align="right"><Chip label={p.stock} color={getStockColor(p.stock, p.low_stock_threshold)} size="small" /></TableCell>
                                    <TableCell>{p.is_low_stock && <Chip icon={<Warning />} label="Low Stock" color="warning" size="small" />}</TableCell>
                                    <TableCell align="right">
                                        <IconButton color="primary" onClick={() => handleOpenDialog(p)} size="small"><Edit /></IconButton>
                                        <IconButton color="error" onClick={() => handleDelete(p.id, p.name)} size="small"><Delete /></IconButton>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            )}

            <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
                <DialogTitle sx={{ fontWeight: 600 }}>{editingProduct ? 'Edit Product' : 'Add New Product'}</DialogTitle>
                <DialogContent>
                    <Grid container spacing={2} sx={{ mt: 1 }}>
                        <Grid item xs={12} sm={6}>
                            <FormControl fullWidth required>
                                <InputLabel>Category</InputLabel>
                                <Select value={formData.category} label="Category" onChange={(e) => setFormData({ ...formData, category: e.target.value })}>
                                    {categories.map((cat) => <MenuItem key={cat.id} value={cat.id}>{cat.name}</MenuItem>)}
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} sm={6}><TextField fullWidth label="Product Name" required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} /></Grid>
                        <Grid item xs={12}><TextField fullWidth label="Description" multiline rows={3} value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} /></Grid>
                        <Grid item xs={12} sm={4}><TextField fullWidth label="SKU" required value={formData.sku} onChange={(e) => setFormData({ ...formData, sku: e.target.value })} /></Grid>
                        <Grid item xs={12} sm={4}><TextField fullWidth label="Price" type="number" required value={formData.price} onChange={(e) => setFormData({ ...formData, price: e.target.value })} InputProps={{ inputProps: { min: 0, step: "0.01" } }} /></Grid>
                        <Grid item xs={12} sm={4}><TextField fullWidth label="Stock" type="number" required value={formData.stock} onChange={(e) => setFormData({ ...formData, stock: e.target.value })} InputProps={{ inputProps: { min: 0 } }} /></Grid>
                        <Grid item xs={12} sm={4}><TextField fullWidth label="Low Stock Threshold" type="number" value={formData.low_stock_threshold} onChange={(e) => setFormData({ ...formData, low_stock_threshold: e.target.value })} InputProps={{ inputProps: { min: 1 } }} helperText="Alert when stock reaches this level" /></Grid>
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDialog}>Cancel</Button>
                    <Button onClick={handleSubmit} variant="contained" sx={{ background: 'linear-gradient(45deg, #667eea 0%, #764ba2 100%)' }}>{editingProduct ? 'Update' : 'Create'}</Button>
                </DialogActions>
            </Dialog>

            <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={() => setSnackbar({ ...snackbar, open: false })} anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
                <Alert severity={snackbar.severity}>{snackbar.message}</Alert>
            </Snackbar>
        </Box>
    );
}

export default Products;