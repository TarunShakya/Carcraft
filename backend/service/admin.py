from django.contrib import admin
from .models import ServiceAppointment, Technician, ServiceRecord, Notification 

@admin.register(ServiceAppointment)
class ServiceAppointmentAdmin(admin.ModelAdmin):
    list_display = ('id', 'customer', 'vehicle', 'service_type', 'appointment_date', 'appointment_time', 'status')
    list_filter = ('service_type', 'status')
    search_fields = ('customer__full_name',)

@admin.register(Technician)
class TechnicianAdmin(admin.ModelAdmin):
    list_display = ('id', 'name', 'specialization', 'experience_years', 'is_available')
    list_filter = ('specialization', 'is_available')
    search_fields = ('name',)

@admin.register(ServiceRecord)
class ServiceRecordAdmin(admin.ModelAdmin):
    list_display = ('id', 'appointment', 'technician', 'cost', 'service_date')
    search_fields = ('appointment__customer__full_name',)

@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):
    list_display = ('id', 'customer', 'notification_type', 'is_sent', 'created_at')
    list_filter = ('notification_type', 'is_sent')
    search_fields = ('customer__full_name',)