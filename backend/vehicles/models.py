from django.db import models

class Brand(models.Model):
    name = models.CharField(max_length=100, unique=True)
    country = models.CharField(max_length=50)
    website = models.URLField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name

class Vehicle(models.Model):
    FUEL_CHOICES = [
        ('Petrol', 'Petrol'),
        ('Diesel', 'Diesel'),
        ('CNG', 'CNG'),
        ('Electric', 'Electric'),
        ('Hybrid', 'Hybrid'),
    ]

    TRANSMISSION_CHOICES = [
        ('Manual', 'Manual'),
        ('Automatic', 'Automatic'),
    ]

    STATUS_CHOICES = [
        ('Available', 'Available'),
        ('Sold', 'Sold'),
        ('Reserved', 'Reserved'),
        ('In-Service', 'In-Service'),
    ]

    brand = models.ForeignKey(Brand, on_delete=models.CASCADE, related_name='vehicles')
    model_name = models.CharField(max_length=80)
    variant = models.CharField(max_length=50, blank=True, null=True)
    year = models.IntegerField()
    fuel_type = models.CharField(max_length=20, choices=FUEL_CHOICES)
    transmission = models.CharField(max_length=20, choices=TRANSMISSION_CHOICES)
    color = models.CharField(max_length=30, blank=True, null=True)
    body_type = models.CharField(max_length=30)  # SUV, Hatchback, Sedan
    price = models.DecimalField(max_digits=12, decimal_places=2)
    stock_quantity = models.IntegerField(default=0)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='Available')
    vin_number = models.CharField(max_length=17, unique=True)
    mileage_kmpl = models.DecimalField(max_digits=5, decimal_places=2, blank=True, null=True)
    features = models.JSONField(blank=True, null=True) 
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.brand.name} {self.model_name} - {self.variant}"