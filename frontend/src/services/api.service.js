import axios from 'axios';

const API_URL = 'http://127.0.0.1:8000/api/';

class ApiService {
    // Categories
    async getCategories() {
        const response = await axios.get(API_URL + 'categories/');
        return response.data;
    }
    async createCategory(data) {
        const response = await axios.post(API_URL + 'categories/', data);
        return response.data;
    }
    async updateCategory(id, data) {
        const response = await axios.put(API_URL + `categories/${id}/`, data);
        return response.data;
    }
    async deleteCategory(id) {
        const response = await axios.delete(API_URL + `categories/${id}/`);
        return response.data;
    }

    // Products
    async getProducts(params = {}) {
        const response = await axios.get(API_URL + 'products/', { params });
        return response.data;
    }
    async createProduct(data) {
        const response = await axios.post(API_URL + 'products/', data);
        return response.data;
    }
    async updateProduct(id, data) {
        const response = await axios.put(API_URL + `products/${id}/`, data);
        return response.data;
    }
    async deleteProduct(id) {
        const response = await axios.delete(API_URL + `products/${id}/`);
        return response.data;
    }

    // Sales
    async createSale(data) {
        const response = await axios.post(API_URL + 'sales/create/', data);
        return response.data;
    }
    async getSales(params = {}) {
        const response = await axios.get(API_URL + 'sales/', { params });
        return response.data;
    }
    async getSale(id) {
        const response = await axios.get(API_URL + `sales/${id}/`);
        return response.data;
    }

    // Dashboard
    async getDashboardStats() {
        const response = await axios.get(API_URL + 'dashboard/');
        return response.data;
    }
}

export default new ApiService();