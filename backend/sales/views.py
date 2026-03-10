from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.db import transaction
from decimal import Decimal
from .models import Sale, SaleItem
from inventory.models import Product
from .serializers import SaleSerializer, CreateSaleSerializer

@api_view(['POST'])
@transaction.atomic
def create_sale(request):
    serializer = CreateSaleSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    data = serializer.validated_data
    items_data = data['items']
    subtotal = Decimal('0')
    sale_items = []
    
    for item_data in items_data:
        product = Product.objects.select_for_update().get(id=item_data['product_id'])
        quantity = item_data['quantity']
        if quantity > product.stock:
            return Response({'error': f'Insufficient stock for {product.name}'},
                            status=status.HTTP_400_BAD_REQUEST)
        item_subtotal = product.price * quantity
        subtotal += item_subtotal
        sale_items.append({
            'product': product,
            'quantity': quantity,
            'price': product.price,
            'subtotal': item_subtotal
        })
    
    discount = Decimal(str(data.get('discount', 0)))
    tax = Decimal(str(data.get('tax', 0)))
    total = subtotal - discount + tax
    amount_paid = Decimal(str(data['amount_paid']))
    change = amount_paid - total
    
    sale = Sale.objects.create(
        cashier_name=data.get('cashier_name', 'Cashier'),
        payment_method=data['payment_method'],
        subtotal=subtotal,
        discount=discount,
        tax=tax,
        total=total,
        amount_paid=amount_paid,
        change=change
    )
    
    for item_data in sale_items:
        SaleItem.objects.create(
            sale=sale,
            product=item_data['product'],
            quantity=item_data['quantity'],
            price=item_data['price'],
            subtotal=item_data['subtotal']
        )
        product = item_data['product']
        product.stock -= item_data['quantity']
        product.save()
    
    response_serializer = SaleSerializer(sale)
    return Response(response_serializer.data, status=status.HTTP_201_CREATED)

@api_view(['GET'])
def sale_list(request):
    sales = Sale.objects.all()
    start_date = request.query_params.get('start_date')
    end_date = request.query_params.get('end_date')
    if start_date:
        sales = sales.filter(created_at__date__gte=start_date)
    if end_date:
        sales = sales.filter(created_at__date__lte=end_date)
    serializer = SaleSerializer(sales, many=True)
    return Response(serializer.data)

@api_view(['GET'])
def sale_detail(request, pk):
    try:
        sale = Sale.objects.get(pk=pk)
    except Sale.DoesNotExist:
        return Response({'error': 'Sale not found'}, status=status.HTTP_404_NOT_FOUND)
    serializer = SaleSerializer(sale)
    return Response(serializer.data)