from django.contrib import admin
from .models import Brand, Vehicle

@admin.register(Brand)
class BrandAdmin(admin.ModelAdmin):
    list_display = ('id', 'name', 'country', 'website')
    search_fields = ('name',)

@admin.register(Vehicle)
class VehicleAdmin(admin.ModelAdmin):
    list_display = ('id', 'brand', 'model_name', 'variant', 'price', 'stock_quantity', 'status')
    list_filter = ('brand', 'fuel_type', 'status')
    search_fields = ('model_name', 'vin_number')