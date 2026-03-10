from rest_framework import serializers
from .models import Sale, SaleItem
from inventory.models import Product

class SaleItemSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source='product.name', read_only=True)
    product_sku = serializers.CharField(source='product.sku', read_only=True)
    
    class Meta:
        model = SaleItem
        fields = ['id', 'product', 'product_name', 'product_sku', 'quantity', 'price', 'subtotal']

class SaleSerializer(serializers.ModelSerializer):
    items = SaleItemSerializer(many=True, read_only=True)
    
    class Meta:
        model = Sale
        fields = [
            'id', 'invoice_number', 'cashier_name', 'payment_method',
            'subtotal', 'tax', 'discount', 'total', 'amount_paid', 'change',
            'items', 'created_at'
        ]
        read_only_fields = ['invoice_number', 'subtotal', 'total', 'change']

class CreateSaleSerializer(serializers.Serializer):
    cashier_name = serializers.CharField(max_length=100, default="Cashier")
    items = serializers.ListField(child=serializers.DictField())
    payment_method = serializers.ChoiceField(choices=Sale.PAYMENT_METHODS)
    amount_paid = serializers.DecimalField(max_digits=12, decimal_places=2)
    discount = serializers.DecimalField(max_digits=12, decimal_places=2, required=False, default=0)
    tax = serializers.DecimalField(max_digits=12, decimal_places=2, required=False, default=0)
    
    def validate_items(self, value):
        if not value:
            raise serializers.ValidationError("At least one item is required")
        for item in value:
            if 'product_id' not in item:
                raise serializers.ValidationError("Each item must have a product_id")
            if 'quantity' not in item:
                raise serializers.ValidationError("Each item must have a quantity")
            try:
                product = Product.objects.get(id=item['product_id'])
                if item['quantity'] > product.stock:
                    raise serializers.ValidationError(
                        f"Insufficient stock for {product.name}. Available: {product.stock}"
                    )
            except Product.DoesNotExist:
                raise serializers.ValidationError(f"Product with id {item['product_id']} does not exist")
        return value