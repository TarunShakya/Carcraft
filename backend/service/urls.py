from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ServiceAppointmentViewSet, TechnicianViewSet, ServiceRecordViewSet, NotificationViewSet

router = DefaultRouter()
router.register(r'service-appointments', ServiceAppointmentViewSet)
router.register(r'technicians', TechnicianViewSet)
router.register(r'service-records', ServiceRecordViewSet)
router.register(r'notifications', NotificationViewSet)
urlpatterns = [
    path('', include(router.urls)),
]