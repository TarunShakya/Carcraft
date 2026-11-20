from django.contrib import admin
from .models import Category, Part, CartItem, Order, OrderItem, Shipment, Review

@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ('id', 'name', 'description')
    search_fields = ('name',)

@admin.register(Part)
class PartAdmin(admin.ModelAdmin):
    list_display = ('id', 'part_name', 'category', 'price', 'stock_quantity', 'sku')
    list_filter = ('category',)
    search_fields = ('part_name', 'sku')

@admin.register(CartItem)
class CartItemAdmin(admin.ModelAdmin):
    list_display = ('id', 'customer', 'part', 'quantity')
    search_fields = ('customer__full_name', 'part__part_name')

@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = ('id', 'customer', 'total_amount', 'status', 'payment_method', 'order_date')
    list_filter = ('status', 'payment_method')

@admin.register(OrderItem)
class OrderItemAdmin(admin.ModelAdmin):
    list_display = ('id', 'order', 'part', 'quantity', 'unit_price')

@admin.register(Shipment)
class ShipmentAdmin(admin.ModelAdmin):
    list_display = ('id', 'order', 'courier_name', 'tracking_number', 'status', 'shipped_date')
    list_filter = ('status', 'courier_name')
    search_fields = ('tracking_number',)

@admin.register(Review)
class ReviewAdmin(admin.ModelAdmin):
    list_display = ('id', 'part', 'customer', 'rating', 'created_at')
    list_filter = ('rating',)
    search_fields = ('part__part_name', 'customer__full_name')