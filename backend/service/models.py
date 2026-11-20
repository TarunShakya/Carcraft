from django.db import models
from leads.models import Customer
from vehicles.models import Vehicle

class ServiceAppointment(models.Model):
    SERVICE_CHOICES = [
        ('General Service', 'General Service'),
        ('Oil Change', 'Oil Change'),
        ('Brake Service', 'Brake Service'),
        ('AC Service', 'AC Service'),
        ('Denting Painting', 'Denting Painting'),
        ('Other', 'Other'),
    ]

    STATUS_CHOICES = [
        ('Booked', 'Booked'),
        ('Confirmed', 'Confirmed'),
        ('In Progress', 'In Progress'),
        ('Completed', 'Completed'),
        ('Cancelled', 'Cancelled'),
    ]

    customer = models.ForeignKey(Customer, on_delete=models.CASCADE, related_name='appointments')
    vehicle = models.ForeignKey(Vehicle, on_delete=models.CASCADE, related_name='appointments')
    service_type = models.CharField(max_length=30, choices=SERVICE_CHOICES)
    appointment_date = models.DateField()
    appointment_time = models.TimeField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='Booked')
    notes = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.customer.full_name} - {self.service_type} on {self.appointment_date}"


class Technician(models.Model):
    name = models.CharField(max_length=100)
    phone = models.CharField(max_length=15)
    specialization = models.CharField(max_length=100)  # Engine, Brake, AC, Electrical
    experience_years = models.IntegerField(default=0)
    is_available = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.name} - {self.specialization}"

class ServiceRecord(models.Model):
    appointment = models.OneToOneField(ServiceAppointment, on_delete=models.CASCADE, related_name='record')
    technician = models.ForeignKey(Technician, on_delete=models.SET_NULL, null=True, blank=True, related_name='service_records')
    work_done = models.TextField()
    cost = models.DecimalField(max_digits=10, decimal_places=2)
    recommendation = models.TextField(blank=True, null=True)
    service_date = models.DateField(auto_now_add=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Record for {self.appointment.customer.full_name} - {self.appointment.vehicle.model_name}"

class Notification(models.Model):
    TYPE_CHOICES = [
        ('Service Reminder', 'Service Reminder'),
        ('Appointment Confirmation', 'Appointment Confirmation'),
        ('Offer', 'Offer'),
        ('General', 'General'),
    ]

    customer = models.ForeignKey('leads.Customer', on_delete=models.CASCADE, related_name='notifications')
    message = models.TextField()
    notification_type = models.CharField(max_length=30, choices=TYPE_CHOICES, default='General')
    is_sent = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.notification_type} to {self.customer.full_name}"