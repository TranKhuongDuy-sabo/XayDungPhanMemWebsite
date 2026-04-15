using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TechStoreApi.Data;
using TechStoreApi.Models;

namespace TechStoreApi.Controllers;

[Route("api/[controller]")]
[ApiController]
public class OrdersController : ControllerBase
{
    private readonly AppDbContext _context;

    public OrdersController(AppDbContext context)
    {
        _context = context;
    }

    // API: Lấy tất cả đơn hàng (Admin)
    [HttpGet]
    public async Task<ActionResult<IEnumerable<Order>>> GetOrders()
    {
        return await _context.Orders
            .Include(o => o.User)
            .Include(o => o.OrderDetails)
            .ThenInclude(d => d.Product)
            .OrderByDescending(o => o.OrderDate)
            .ToListAsync();
    }

    // API: Đặt hàng (Checkout)
    [HttpPost]
    public async Task<IActionResult> CreateOrder(CreateOrderDto orderDto)
    {
        // 1. Kiểm tra giỏ hàng rỗng
        if (orderDto.Items == null || !orderDto.Items.Any())
            return BadRequest("Giỏ hàng không có sản phẩm.");

        // 2. Dùng Transaction để bảo vệ dữ liệu (sai một bước là hủy toàn bộ)
        using var transaction = await _context.Database.BeginTransactionAsync();

        try
        {
            decimal totalAmount = 0;

            // 3. Tạo đơn hàng chính (Order)
            var order = new Order
            {
                UserId = orderDto.UserId,
                OrderDate = DateTime.Now,
                ShippingAddress = orderDto.ShippingAddress,
                TotalAmount = 0 // Tạm thời bằng 0, tính sau
            };

            _context.Orders.Add(order);
            await _context.SaveChangesAsync();

            // 4. Tạo chi tiết đơn hàng (OrderDetail) và tính tổng tiền
            foreach (var item in orderDto.Items)
            {
                var product = await _context.Products.FindAsync(item.ProductId);
                if (product == null) return NotFound($"Sản phẩm #{item.ProductId} không tồn tại.");

                // Kiểm tra tồn kho
                if (product.Stock < item.Quantity)
                    return BadRequest($"Sản phẩm '{product.ProductName}' không đủ tồn kho (Chỉ còn {product.Stock}).");

                var detail = new OrderDetail
                {
                    OrderId = order.OrderId,
                    ProductId = item.ProductId,
                    Quantity = item.Quantity,
                    UnitPrice = product.Price
                };

                totalAmount += (product.Price * item.Quantity);

                // Trừ tồn kho thực tế
                product.Stock -= item.Quantity;

                _context.OrderDetails.Add(detail);
            }

            // 5. Cập nhật tổng tiền cuối cùng và lưu
            order.TotalAmount = totalAmount;
            await _context.SaveChangesAsync();

            await transaction.CommitAsync();

            return Ok(new { 
                success = true, 
                message = "Đặt hàng thành công!", 
                orderId = order.OrderId,
                total = totalAmount 
            });
        }
        catch (Exception ex)
        {
            await transaction.RollbackAsync();
            return StatusCode(500, $"Lỗi hệ thống: {ex.Message}");
        }
    }
}