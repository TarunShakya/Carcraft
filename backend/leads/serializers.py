from rest_framework import serializers
from .models import Customer, Lead

class CustomerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Customer
        fields = '__all__'

class LeadSerializer(serializers.ModelSerializer):
    customer_name = serializers.ReadOnlyField(source='customer.full_name')
    vehicle_name = serializers.ReadOnlyField(source='interested_vehicle.model_name')

    class Meta:
        model = Lead
        fields = '__all__'