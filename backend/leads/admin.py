from django.contrib import admin
from .models import Customer, Lead

@admin.register(Customer)
class CustomerAdmin(admin.ModelAdmin):
    list_display = ('id', 'full_name', 'email', 'phone', 'city')
    search_fields = ('full_name', 'email', 'phone')

@admin.register(Lead)
class LeadAdmin(admin.ModelAdmin):
    list_display = ('id', 'customer', 'interested_vehicle', 'source', 'status', 'follow_up_date')
    list_filter = ('source', 'status')
    search_fields = ('customer__full_name',)