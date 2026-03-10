from django.contrib import admin
from .models import Category, Product

@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ('name', 'products_count', 'created_at')
    search_fields = ('name',)
    list_filter = ('created_at',)
    
    def products_count(self, obj):
        return obj.products.count()
    products_count.short_description = 'Products'

@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ('name', 'sku', 'category', 'price', 'stock', 'is_low_stock')
    list_filter = ('category', 'created_at')
    search_fields = ('name', 'sku', 'description')
    readonly_fields = ('created_at', 'updated_at')
    
    def is_low_stock(self, obj):
        return obj.stock <= obj.low_stock_threshold
    is_low_stock.boolean = True
    is_low_stock.short_description = 'Low Stock'