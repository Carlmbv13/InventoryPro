from django.contrib import admin
from .models import Sale, SaleItem

class SaleItemInline(admin.TabularInline):
    model = SaleItem
    extra = 0
    readonly_fields = ('product', 'quantity', 'price', 'subtotal')

@admin.register(Sale)
class SaleAdmin(admin.ModelAdmin):
    list_display = ('invoice_number', 'cashier_name', 'total', 'item_count', 'created_at')
    list_filter = ('payment_method', 'created_at')
    search_fields = ('invoice_number', 'cashier_name')
    readonly_fields = ('invoice_number', 'subtotal', 'total', 'change', 'created_at')
    inlines = [SaleItemInline]
    
    def item_count(self, obj):
        return obj.items.count()
    item_count.short_description = 'Items'

@admin.register(SaleItem)
class SaleItemAdmin(admin.ModelAdmin):
    list_display = ('sale', 'product', 'quantity', 'price', 'subtotal')
    list_filter = ('sale__created_at',)
    search_fields = ('product__name', 'sale__invoice_number')