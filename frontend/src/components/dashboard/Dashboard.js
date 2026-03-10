import React, { useState, useEffect } from 'react';
import {
    Grid, Paper, Typography, Card, CardContent, Box, CircularProgress, Alert
} from '@mui/material';
import { TrendingUp, ShoppingCart, Inventory, Warning } from '@mui/icons-material';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import apiService from '../../services/api.service';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

function Dashboard() {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchDashboardStats();
    }, []);

    const fetchDashboardStats = async () => {
        try {
            const data = await apiService.getDashboardStats();
            setStats(data);
        } catch (err) {
            setError('Failed to load dashboard data');
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}><CircularProgress /></Box>;
    if (error) return <Alert severity="error">{error}</Alert>;

    const StatCard = ({ title, value, icon, color, subtitle }) => (
        <Card elevation={3} sx={{ borderRadius: 2 }}>
            <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box>
                        <Typography color="text.secondary" gutterBottom variant="body2">{title}</Typography>
                        <Typography variant="h4" component="div" sx={{ fontWeight: 600 }}>{value}</Typography>
                        {subtitle && <Typography variant="body2" color="text.secondary">{subtitle}</Typography>}
                    </Box>
                    <Box sx={{ backgroundColor: color, borderRadius: '50%', width: 56, height: 56, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {icon}
                    </Box>
                </Box>
            </CardContent>
        </Card>
    );

    return (
        <Box>
            <Typography variant="h4" gutterBottom sx={{ mb: 4, fontWeight: 600 }}>Dashboard</Typography>
            <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid item xs={12} sm={6} md={3}>
                    <StatCard title="Today's Sales" value={`₱${stats?.sales?.today?.total?.toFixed(2) || '0.00'}`} subtitle={`${stats?.sales?.today?.count || 0} transactions`} icon={<ShoppingCart sx={{ color: 'white' }} />} color="#4CAF50" />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <StatCard title="This Week" value={`₱${stats?.sales?.this_week?.total?.toFixed(2) || '0.00'}`} subtitle={`${stats?.sales?.this_week?.count || 0} transactions`} icon={<TrendingUp sx={{ color: 'white' }} />} color="#2196F3" />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <StatCard title="Total Products" value={stats?.products?.total || 0} subtitle={`${stats?.products?.low_stock || 0} low stock`} icon={<Inventory sx={{ color: 'white' }} />} color="#FF9800" />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <StatCard title="Out of Stock" value={stats?.products?.out_of_stock || 0} subtitle={`${stats?.products?.low_stock || 0} items low`} icon={<Warning sx={{ color: 'white' }} />} color="#f44336" />
                </Grid>
            </Grid>

            <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                    <Paper elevation={3} sx={{ p: 3, borderRadius: 2 }}>
                        <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>Products by Category</Typography>
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie data={stats?.categories || []} cx="50%" cy="50%" labelLine={false} label={(entry) => entry.name} outerRadius={80} fill="#8884d8" dataKey="product_count">
                                    {stats?.categories?.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                    </Paper>
                </Grid>
                <Grid item xs={12} md={6}>
                    <Paper elevation={3} sx={{ p: 3, borderRadius: 2 }}>
                        <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>Top Selling Products</Typography>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={stats?.top_products || []}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Bar dataKey="sold" fill="#8884d8" name="Quantity Sold" />
                                <Bar dataKey="revenue" fill="#82ca9d" name="Revenue" />
                            </BarChart>
                        </ResponsiveContainer>
                    </Paper>
                </Grid>
                <Grid item xs={12}>
                    <Paper elevation={3} sx={{ p: 3, borderRadius: 2 }}>
                        <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>Recent Transactions</Typography>
                        <Box sx={{ overflowX: 'auto' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                <thead><tr style={{ backgroundColor: '#f5f5f5' }}><th style={{ padding: '12px', textAlign: 'left' }}>Invoice</th><th style={{ padding: '12px', textAlign: 'left' }}>Time</th><th style={{ padding: '12px', textAlign: 'left' }}>Cashier</th><th style={{ padding: '12px', textAlign: 'left' }}>Items</th><th style={{ padding: '12px', textAlign: 'right' }}>Total</th></tr></thead>
                                <tbody>
                                    {stats?.recent_sales?.map((sale, index) => (
                                        <tr key={index} style={{ borderBottom: '1px solid #e0e0e0' }}>
                                            <td style={{ padding: '12px' }}>{sale.invoice}</td>
                                            <td style={{ padding: '12px' }}>{sale.time}</td>
                                            <td style={{ padding: '12px' }}>{sale.cashier}</td>
                                            <td style={{ padding: '12px' }}>{sale.items}</td>
                                            <td style={{ padding: '12px', textAlign: 'right' }}>₱{sale.total.toFixed(2)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </Box>
                    </Paper>
                </Grid>
            </Grid>
        </Box>
    );
}

export default Dashboard;