namespace TechStoreApi.Models;

public class CreateOrderDto
{
    // Đổi UserId thành Username để React dễ truyền lên
    public string Username { get; set; } = string.Empty; 
    public string ShippingAddress { get; set; } = string.Empty; 
    
    // Thêm các trường phục vụ thanh toán
    public decimal TotalAmount { get; set; }
    public string PaymentMethod { get; set; } = string.Empty;
    public string PaymentStatus { get; set; } = string.Empty;
    public string? TransactionId { get; set; }

    public List<OrderItemDto> Items { get; set; } = new();
}

public class OrderItemDto
{
    public int ProductId { get; set; }
    public int Quantity { get; set; }
    public decimal UnitPrice { get; set; } // Thêm giá lúc mua để mốt giá sản phẩm thay đổi thì bill cũ ko bị đổi
}