from rest_framework import viewsets
from .models import ServiceAppointment, Technician, ServiceRecord, Notification
from .serializers import ServiceAppointmentSerializer, TechnicianSerializer, ServiceRecordSerializer, NotificationSerializer

class ServiceAppointmentViewSet(viewsets.ModelViewSet):
    queryset = ServiceAppointment.objects.all()
    serializer_class = ServiceAppointmentSerializer

class TechnicianViewSet(viewsets.ModelViewSet):
    queryset = Technician.objects.all()
    serializer_class = TechnicianSerializer

class ServiceRecordViewSet(viewsets.ModelViewSet):
    queryset = ServiceRecord.objects.all()
    serializer_class = ServiceRecordSerializer

class NotificationViewSet(viewsets.ModelViewSet):
    queryset = Notification.objects.all()
    serializer_class = NotificationSerializer