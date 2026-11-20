from django.db import models
from vehicles.models import Vehicle
from django.contrib.auth.models import User

class Customer(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, null=True, blank=True, related_name='customer_profile')
    full_name = models.CharField(max_length=100)
    email = models.EmailField(unique=True)
    phone = models.CharField(max_length=15)
    city = models.CharField(max_length=80)
    state = models.CharField(max_length=80)
    address = models.TextField(blank=True, null=True)
    driving_license_no = models.CharField(max_length=20, unique=True, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.full_name

class Lead(models.Model):
    SOURCE_CHOICES = [
        ('Walk-in', 'Walk-in'),
        ('Website', 'Website'),
        ('Referral', 'Referral'),
        ('Phone', 'Phone'),
        ('【entity-Instagram¦canonical_name=Instagram】', '【entity-Instagram¦canonical_name=Instagram】'),
    ]

    STATUS_CHOICES = [
        ('New', 'New'),
        ('Contacted', 'Contacted'),
        ('Qualified', 'Qualified'),
        ('Lost', 'Lost'),
        ('Converted', 'Converted'),
    ]

    customer = models.ForeignKey(Customer, on_delete=models.CASCADE, related_name='leads')
    interested_vehicle = models.ForeignKey(Vehicle, on_delete=models.SET_NULL, null=True, blank=True, related_name='leads')
    source = models.CharField(max_length=50, choices=SOURCE_CHOICES, default='Walk-in')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='New')
    follow_up_date = models.DateField(blank=True, null=True)
    notes = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.customer.full_name} - {self.interested_vehicle} ({self.status})"