from django.contrib import admin
from django.urls import path, include
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('vehicles.urls')),
    path('api/', include('leads.urls')),
    path('api/', include('quotations.urls')),
    path('api/', include('analytics.urls')),
    path('api/', include('shop.urls')),
    path('api/', include('service.urls')),
    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
]