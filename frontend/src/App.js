import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Navbar from './components/layout/Navbar';
import Dashboard from './components/dashboard/Dashboard';
import Categories from './components/inventory/Categories';
import Products from './components/inventory/Products';
import NewSale from './components/sales/NewSale';

const theme = createTheme({
  palette: { primary: { main: '#667eea' }, secondary: { main: '#764ba2' } },
  typography: { fontFamily: '"Poppins", "Roboto", "Helvetica", "Arial", sans-serif', h4: { fontWeight: 600 }, h5: { fontWeight: 600 } },
  components: {
    MuiButton: { styleOverrides: { root: { borderRadius: 8, textTransform: 'none', fontWeight: 600 } } },
    MuiCard: { styleOverrides: { root: { borderRadius: 12 } } },
    MuiPaper: { styleOverrides: { root: { borderRadius: 12 } } },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <Navbar>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/categories" element={<Categories />} />
            <Route path="/products" element={<Products />} />
            <Route path="/sales/new" element={<NewSale />} />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </Navbar>
        <ToastContainer position="top-right" autoClose={3000} />
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;