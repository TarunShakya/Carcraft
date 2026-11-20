from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import CategoryViewSet, PartViewSet, CartItemViewSet, OrderViewSet, OrderItemViewSet, ShipmentViewSet, ReviewViewSet

router = DefaultRouter()
router.register(r'categories', CategoryViewSet)
router.register(r'parts', PartViewSet)
router.register(r'cart', CartItemViewSet, basename='cart')
router.register(r'orders', OrderViewSet,basename='orders')
router.register(r'order-items', OrderItemViewSet)
router.register(r'shipments', ShipmentViewSet)
router.register(r'reviews', ReviewViewSet)
urlpatterns = [
    path('', include(router.urls)),
]