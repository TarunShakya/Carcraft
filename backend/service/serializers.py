from rest_framework import serializers
from .models import ServiceAppointment, Technician, ServiceRecord, Notification

class ServiceAppointmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = ServiceAppointment
        fields = '__all__'

class TechnicianSerializer(serializers.ModelSerializer):
    class Meta:
        model = Technician
        fields = '__all__'

class ServiceRecordSerializer(serializers.ModelSerializer):
    class Meta:
        model = ServiceRecord
        fields = '__all__'

class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = '__all__'