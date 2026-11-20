from rest_framework.views import APIView
from rest_framework.response import Response
from django.db.models import Count, Sum
from quotations.models import Sale

class DealerPerformanceView(APIView):
    def get(self, request):
        # 1. Total Sales + Total Revenue
        total_sales = Sale.objects.filter(status='Completed').count()
        total_revenue = Sale.objects.filter(status='Completed').aggregate(
            total=Sum('sale_price')
        )['total'] or 0

        # 2. Har Salesperson ka performance
        by_salesperson = list(
            Sale.objects.filter(status='Completed')
            .values('salesperson_name')
            .annotate(
                total_sales=Count('id'),
                total_revenue=Sum('sale_price')
            )
            .order_by('-total_revenue')
        )

        # 3. Payment Method ke hisaab se
        by_payment = list(
            Sale.objects.filter(status='Completed')
            .values('payment_method')
            .annotate(total_sales=Count('id'))
        )

        return Response({
            'total_sales': total_sales,
            'total_revenue': float(total_revenue),
            'by_salesperson': by_salesperson,
            'by_payment_method': by_payment,
        })