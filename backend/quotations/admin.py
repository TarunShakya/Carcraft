from django.contrib import admin
from .models import Quotation, Sale

@admin.register(Quotation)
class QuotationAdmin(admin.ModelAdmin):
    list_display = ('id', 'customer', 'vehicle', 'quoted_price', 'discount', 'status', 'valid_until')
    list_filter = ('status',)
    search_fields = ('customer__full_name',)

@admin.register(Sale)
class SaleAdmin(admin.ModelAdmin):
    list_display = ('id', 'vehicle', 'customer', 'sale_price', 'payment_method', 'status', 'sale_date')
    list_filter = ('payment_method', 'status')
    search_fields = ('customer__full_name', 'salesperson_name')