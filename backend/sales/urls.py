from django.urls import path
from . import views

urlpatterns = [
    path('sales/', views.sale_list, name='sale-list'),
    path('sales/create/', views.create_sale, name='create-sale'),
    path('sales/<int:pk>/', views.sale_detail, name='sale-detail'),
    path('dashboard/', views.dashboard_stats, name='dashboard'),
]