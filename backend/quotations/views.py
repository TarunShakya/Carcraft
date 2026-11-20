from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from .models import Quotation, Sale
from .serializers import QuotationSerializer, SaleSerializer

class QuotationViewSet(viewsets.ModelViewSet):
    queryset = Quotation.objects.all()
    serializer_class = QuotationSerializer
    permission_classes = [IsAuthenticated]

class SaleViewSet(viewsets.ModelViewSet):
    queryset = Sale.objects.all()
    serializer_class = SaleSerializer
    def get_permissions(self):
        if self.action == 'destroy':  # Delete karne pe
            return [IsAdminUser()]  # Sirf Admin
        return [IsAuthenticated()]