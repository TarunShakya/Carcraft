from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import QuotationViewSet, SaleViewSet

router = DefaultRouter()
router.register(r'quotations', QuotationViewSet)
router.register(r'sales', SaleViewSet)

urlpatterns = [
    path('', include(router.urls)),
]