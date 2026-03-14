import React, { useState, useEffect } from 'react';
import {
    Box, Typography, Paper, Grid, FormControl, InputLabel, Select, MenuItem,
    TextField, Button, IconButton, Table, TableBody, TableCell, TableContainer,
    TableHead, TableRow, Card, CardContent, Alert, Snackbar, CircularProgress, Divider
} from '@mui/material';
import { Add, Delete, ShoppingCart, Receipt } from '@mui/icons-material';
import apiService from '../../services/api.service';

function NewSale() {
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [cart, setCart] = useState([]);
    const [selectedProduct, setSelectedProduct] = useState('');
    const [quantity, setQuantity] = useState(1);
    const [cashierName, setCashierName] = useState('Cashier');
    const [paymentMethod, setPaymentMethod] = useState('cash');
    const [amountPaid, setAmountPaid] = useState('');
    const [loading, setLoading] = useState(false);
    const [processing, setProcessing] = useState(false);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
    const [filters, setFilters] = useState({ category: '', search: '' });

    useEffect(() => { fetchData(); }, []);
    useEffect(() => { fetchProducts(); }, [filters]);

    const fetchData = async () => {
        try {
            const [productsData, categoriesData] = await Promise.all([
                apiService.getProducts(),
                apiService.getCategories()
            ]);
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

    const showSnackbar = (message, severity) => {
        setSnackbar({ open: true, message, severity });
    };

    // Helper to safely convert to number
    const toNumber = (value, fallback = 0) => {
        const num = parseFloat(value);
        return isNaN(num) ? fallback : num;
    };

    const handleAddToCart = () => {
        if (!selectedProduct) {
            showSnackbar('Please select a product', 'warning');
            return;
        }

        const product = products.find(p => p.id === selectedProduct);
        const priceNum = toNumber(product.price); // always a number
        const qty = toNumber(quantity, 1);

        if (qty > product.stock) {
            showSnackbar(`Only ${product.stock} units available`, 'error');
            return;
        }

        const existingItem = cart.find(item => item.product.id === selectedProduct);
        if (existingItem) {
            if (existingItem.quantity + qty > product.stock) {
                showSnackbar(`Only ${product.stock - existingItem.quantity} more units available`, 'error');
                return;
            }
            setCart(cart.map(item =>
                item.product.id === selectedProduct
                    ? {
                        ...item,
                        quantity: item.quantity + qty,
                        subtotal: priceNum * (item.quantity + qty)  // number
                    }
                    : item
            ));
        } else {
            setCart([...cart, {
                product,
                quantity: qty,
                price: priceNum,
                subtotal: priceNum * qty
            }]);
        }

        setSelectedProduct('');
        setQuantity(1);
    };

    const handleRemoveFromCart = (productId) => {
        setCart(cart.filter(item => item.product.id !== productId));
    };

    const updateQuantity = (productId, newQuantity) => {
        const product = products.find(p => p.id === productId);
        const qty = toNumber(newQuantity, 1);
        if (qty > product.stock) {
            showSnackbar(`Only ${product.stock} units available`, 'error');
            return;
        }
        setCart(cart.map(item =>
            item.product.id === productId
                ? { ...item, quantity: qty, subtotal: item.price * qty }
                : item
        ));
    };

    const calculateSubtotal = () => {
        return cart.reduce((sum, item) => sum + toNumber(item.subtotal), 0);
    };

    const calculateTax = () => calculateSubtotal() * 0.12;
    const calculateTotal = () => calculateSubtotal() + calculateTax();
    const calculateChange = () => {
        const paid = toNumber(amountPaid);
        return paid - calculateTotal();
    };

    const handleCheckout = async () => {
        if (cart.length === 0) {
            showSnackbar('Cart is empty', 'warning');
            return;
        }

        const total = calculateTotal();
        const paid = toNumber(amountPaid);
        if (!paid || paid < total) {
            showSnackbar('Invalid payment amount', 'warning');
            return;
        }

        setProcessing(true);
        try {
            const saleData = {
                cashier_name: cashierName,
                items: cart.map(item => ({
                    product_id: item.product.id,
                    quantity: item.quantity
                })),
                payment_method: paymentMethod,
                amount_paid: paid,
                tax: calculateTax(),
                discount: 0
            };
            const response = await apiService.createSale(saleData);
            showSnackbar(`Sale completed! Invoice: ${response.invoice_number}`, 'success');
            setCart([]);
            setAmountPaid('');
            fetchProducts();
        } catch (error) {
            showSnackbar(error.response?.data?.error || 'Error processing sale', 'error');
        } finally {
            setProcessing(false);
        }
    };

    const subtotal = calculateSubtotal();
    const tax = calculateTax();
    const total = calculateTotal();
    const change = calculateChange();

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box>
            <Typography variant="h4" gutterBottom sx={{ mb: 4, fontWeight: 600 }}>
                New Sale
            </Typography>

            <Grid container spacing={3}>
                {/* Product Selection */}
                <Grid item xs={12} md={7}>
                    <Paper elevation={3} sx={{ p: 3, borderRadius: 2 }}>
                        <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                            Select Products
                        </Typography>

                        <Grid container spacing={2} sx={{ mb: 3 }}>
                            <Grid item xs={12} sm={5}>
                                <FormControl fullWidth size="small">
                                    <InputLabel>Category</InputLabel>
                                    <Select
                                        value={filters.category}
                                        label="Category"
                                        onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                                    >
                                        <MenuItem value="">All Categories</MenuItem>
                                        {categories.map((cat) => (
                                            <MenuItem key={cat.id} value={cat.id}>{cat.name}</MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Grid>
                            <Grid item xs={12} sm={7}>
                                <TextField
                                    fullWidth
                                    size="small"
                                    label="Search"
                                    placeholder="Search products..."
                                    value={filters.search}
                                    onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                                />
                            </Grid>
                        </Grid>

                        <FormControl fullWidth sx={{ mb: 2 }}>
                            <InputLabel>Product</InputLabel>
                            <Select
                                value={selectedProduct}
                                label="Product"
                                onChange={(e) => setSelectedProduct(e.target.value)}
                            >
                                {products
                                    .filter(p => p.stock > 0)
                                    .map((product) => (
                                        <MenuItem key={product.id} value={product.id}>
                                            {product.name} - ₱{toNumber(product.price).toFixed(2)} (Stock: {product.stock})
                                        </MenuItem>
                                    ))}
                            </Select>
                        </FormControl>

                        <Grid container spacing={2} alignItems="center">
                            <Grid item xs={8}>
                                <TextField
                                    fullWidth
                                    type="number"
                                    label="Quantity"
                                    value={quantity}
                                    onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                                    InputProps={{ inputProps: { min: 1 } }}
                                />
                            </Grid>
                            <Grid item xs={4}>
                                <Button
                                    fullWidth
                                    variant="contained"
                                    startIcon={<Add />}
                                    onClick={handleAddToCart}
                                    sx={{
                                        height: '56px',
                                        background: 'linear-gradient(45deg, #667eea 0%, #764ba2 100%)'
                                    }}
                                >
                                    Add
                                </Button>
                            </Grid>
                        </Grid>
                    </Paper>
                </Grid>

                {/* Cart Summary */}
                <Grid item xs={12} md={5}>
                    <Card elevation={3} sx={{ borderRadius: 2 }}>
                        <CardContent>
                            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                                Current Sale
                            </Typography>

                            {cart.length === 0 ? (
                                <Box sx={{ textAlign: 'center', py: 4 }}>
                                    <ShoppingCart sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
                                    <Typography color="text.secondary">Cart is empty</Typography>
                                </Box>
                            ) : (
                                <>
                                    <TableContainer sx={{ maxHeight: 300 }}>
                                        <Table size="small">
                                            <TableHead>
                                                <TableRow>
                                                    <TableCell>Item</TableCell>
                                                    <TableCell align="right">Qty</TableCell>
                                                    <TableCell align="right">Price</TableCell>
                                                    <TableCell align="right">Subtotal</TableCell>
                                                    <TableCell></TableCell>
                                                </TableRow>
                                            </TableHead>
                                            <TableBody>
                                                {cart.map((item) => (
                                                    <TableRow key={item.product.id}>
                                                        <TableCell>{item.product.name}</TableCell>
                                                        <TableCell align="right">
                                                            <TextField
                                                                type="number"
                                                                size="small"
                                                                value={item.quantity}
                                                                onChange={(e) => updateQuantity(
                                                                    item.product.id,
                                                                    parseInt(e.target.value) || 1
                                                                )}
                                                                InputProps={{
                                                                    inputProps: { min: 1, max: item.product.stock },
                                                                    sx: { width: 60 }
                                                                }}
                                                            />
                                                        </TableCell>
                                                        <TableCell align="right">
                                                            ₱{toNumber(item.price).toFixed(2)}
                                                        </TableCell>
                                                        <TableCell align="right">
                                                            ₱{toNumber(item.subtotal).toFixed(2)}
                                                        </TableCell>
                                                        <TableCell align="right">
                                                            <IconButton
                                                                size="small"
                                                                color="error"
                                                                onClick={() => handleRemoveFromCart(item.product.id)}
                                                            >
                                                                <Delete />
                                                            </IconButton>
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </TableContainer>

                                    <Divider sx={{ my: 2 }} />

                                    <Box sx={{ mb: 2 }}>
                                        <Grid container spacing={1}>
                                            <Grid item xs={6}>
                                                <Typography>Subtotal:</Typography>
                                            </Grid>
                                            <Grid item xs={6}>
                                                <Typography align="right">
                                                    ₱{subtotal.toFixed(2)}
                                                </Typography>
                                            </Grid>

                                            <Grid item xs={6}>
                                                <Typography>VAT (12%):</Typography>
                                            </Grid>
                                            <Grid item xs={6}>
                                                <Typography align="right">
                                                    ₱{tax.toFixed(2)}
                                                </Typography>
                                            </Grid>

                                            <Grid item xs={6}>
                                                <Typography variant="h6">Total:</Typography>
                                            </Grid>
                                            <Grid item xs={6}>
                                                <Typography variant="h6" align="right" color="primary">
                                                    ₱{total.toFixed(2)}
                                                </Typography>
                                            </Grid>
                                        </Grid>
                                    </Box>

                                    <TextField
                                        fullWidth
                                        label="Cashier Name"
                                        value={cashierName}
                                        onChange={(e) => setCashierName(e.target.value)}
                                        size="small"
                                        sx={{ mb: 2 }}
                                    />

                                    <FormControl fullWidth sx={{ mb: 2 }}>
                                        <InputLabel>Payment Method</InputLabel>
                                        <Select
                                            value={paymentMethod}
                                            label="Payment Method"
                                            onChange={(e) => setPaymentMethod(e.target.value)}
                                        >
                                            <MenuItem value="cash">Cash</MenuItem>
                                            <MenuItem value="card">Credit/Debit Card</MenuItem>
                                            <MenuItem value="gcash">GCash</MenuItem>
                                            <MenuItem value="maya">Maya</MenuItem>
                                        </Select>
                                    </FormControl>

                                    <TextField
                                        fullWidth
                                        type="number"
                                        label="Amount Paid"
                                        value={amountPaid}
                                        onChange={(e) => setAmountPaid(e.target.value)}
                                        sx={{ mb: 1 }}
                                        InputProps={{ inputProps: { min: 0, step: "0.01" } }}
                                    />

                                    {amountPaid && (
                                        <Alert
                                            severity={change >= 0 ? "success" : "error"}
                                            sx={{ mb: 2 }}
                                        >
                                            Change: ₱{Math.max(change, 0).toFixed(2)}
                                            {change < 0 && " (Insufficient payment)"}
                                        </Alert>
                                    )}

                                    <Button
                                        fullWidth
                                        variant="contained"
                                        size="large"
                                        startIcon={<Receipt />}
                                        onClick={handleCheckout}
                                        disabled={processing || cart.length === 0}
                                        sx={{
                                            py: 1.5,
                                            background: 'linear-gradient(45deg, #667eea 0%, #764ba2 100%)'
                                        }}
                                    >
                                        {processing ? <CircularProgress size={24} /> : 'Complete Sale'}
                                    </Button>
                                </>
                            )}
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            <Snackbar
                open={snackbar.open}
                autoHideDuration={4000}
                onClose={() => setSnackbar({ ...snackbar, open: false })}
                anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
            >
                <Alert severity={snackbar.severity}>
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Box>
    );
}

export default NewSale;