from django.urls import path
from .views import DealerPerformanceView

urlpatterns = [
    path('dealer-performance/', DealerPerformanceView.as_view()),
]