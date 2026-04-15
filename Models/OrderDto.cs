namespace TechStoreApi.Models;

public class CreateOrderDto
{
    public int UserId { get; set; }
   // Sửa dòng này: Thêm = string.Empty;
    public string ShippingAddress { get; set; } = string.Empty; 
    
    // Sửa dòng này: Thêm = new(); hoặc = new List<OrderItemDto>();
    public List<OrderItemDto> Items { get; set; } = new();
}

public class OrderItemDto
{
    public int ProductId { get; set; }
    public int Quantity { get; set; }
}