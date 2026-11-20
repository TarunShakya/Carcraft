from django.db import models

class Category(models.Model):
    name = models.CharField(max_length=80, unique=True)
    description = models.CharField(max_length=255, blank=True, null=True)

    def __str__(self):
        return self.name

class Part(models.Model):
    part_name = models.CharField(max_length=120)
    category = models.ForeignKey(Category, on_delete=models.CASCADE, related_name='parts')
    compatible_model = models.CharField(max_length=80, blank=True, null=True)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    stock_quantity = models.IntegerField(default=0)
    supplier = models.CharField(max_length=100, blank=True, null=True)
    sku = models.CharField(max_length=50, unique=True)
    image_url = models.URLField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.part_name} - {self.sku}"

class CartItem(models.Model):
    customer = models.ForeignKey('leads.Customer', on_delete=models.CASCADE, related_name='cart_items')
    part = models.ForeignKey(Part, on_delete=models.CASCADE, related_name='cart_items')
    quantity = models.IntegerField(default=1)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('customer', 'part')

    def __str__(self):
        return f"{self.customer.full_name} - {self.part.part_name} x {self.quantity}"

class Order(models.Model):
    STATUS_CHOICES = [
        ('Placed', 'Placed'),
        ('Shipped', 'Shipped'),
        ('Delivered', 'Delivered'),
        ('Cancelled', 'Cancelled'),
    ]
    PAYMENT_CHOICES = [
        ('UPI', 'UPI'),
        ('Card', 'Card'),
        ('COD', 'COD'),
        ('NetBanking', 'NetBanking'),
    ]

    customer = models.ForeignKey('leads.Customer', on_delete=models.CASCADE, related_name='orders')
    order_date = models.DateField(auto_now_add=True)
    total_amount = models.DecimalField(max_digits=12, decimal_places=2)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='Placed')
    payment_method = models.CharField(max_length=20, choices=PAYMENT_CHOICES)
    shipping_address = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Order {self.id} - {self.customer.full_name}"

class OrderItem(models.Model):
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='items')
    part = models.ForeignKey(Part, on_delete=models.CASCADE)
    quantity = models.IntegerField()
    unit_price = models.DecimalField(max_digits=10, decimal_places=2)

    def __str__(self):
        return f"Order {self.order.id} - {self.part.part_name}"

class Shipment(models.Model):
    STATUS_CHOICES = [
        ('Pending', 'Pending'),
        ('Packed', 'Packed'),
        ('Shipped', 'Shipped'),
        ('OutForDelivery', 'Out For Delivery'),
        ('Delivered', 'Delivered'),
    ]

    order = models.OneToOneField(Order, on_delete=models.CASCADE, related_name='shipment')
    courier_name = models.CharField(max_length=100)
    tracking_number = models.CharField(max_length=100, unique=True)
    shipped_date = models.DateField(blank=True, null=True)
    estimated_delivery = models.DateField(blank=True, null=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='Pending')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Shipment {self.tracking_number} - {self.order.id}"

class Review(models.Model):
    part = models.ForeignKey(Part, on_delete=models.CASCADE, related_name='reviews')
    customer = models.ForeignKey('leads.Customer', on_delete=models.CASCADE, related_name='reviews')
    rating = models.IntegerField(choices=[(i, i) for i in range(1, 6)])  # 1 se 5 star
    comment = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('part', 'customer')  # Ek customer ek part ko ek hi review dega

    def __str__(self):
        return f"{self.part.part_name} - {self.rating} stars by {self.customer.full_name}"