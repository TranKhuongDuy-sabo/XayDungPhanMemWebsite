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

    // API: Đặt hàng (Checkout)
    [HttpPost("create")]
    public async Task<IActionResult> CreateOrder([FromBody] CreateOrderDto dto)
    {
        // 1. Tìm User từ Username
        var user = await _context.Users.FirstOrDefaultAsync(u => u.Username == dto.Username);
        if (user == null) return BadRequest("Lỗi xác thực người dùng!");

        using var transaction = await _context.Database.BeginTransactionAsync();
        try
        {
            // 2. Tạo Đơn hàng (Bảng Order)
            var newOrder = new Order
            {
                UserId = user.UserId,
                OrderDate = DateTime.Now,
                TotalAmount = dto.TotalAmount,
                ShippingAddress = dto.ShippingAddress,
                Status = "Mới",
                PaymentMethod = dto.PaymentMethod,
                PaymentStatus = dto.PaymentStatus,
                TransactionId = dto.TransactionId
            };

            _context.Orders.Add(newOrder);
            await _context.SaveChangesAsync(); // Phải lưu trước để C# tự sinh ra OrderId

            // 3. Tạo Chi tiết đơn hàng (Bảng OrderDetail)
            foreach (var item in dto.Items)
            {
                var detail = new OrderDetail
                {
                    OrderId = newOrder.OrderId, // Lấy ID vừa sinh ra ở trên
                    ProductId = item.ProductId,
                    Quantity = item.Quantity,
                    UnitPrice = item.UnitPrice
                };
                _context.OrderDetails.Add(detail);
            }

            await _context.SaveChangesAsync();
            await transaction.CommitAsync(); // Xác nhận lưu thành công cả 2 bảng

            return Ok(new { message = "Đặt hàng thành công!", orderId = newOrder.OrderId });
        }
        catch (Exception ex)
        {
            await transaction.RollbackAsync(); // Nếu lỗi thì hủy toàn bộ, không lưu rác
            return StatusCode(500, "Lỗi khi lưu đơn hàng: " + ex.Message);
        }
    }

    [HttpGet]
    public async Task<IActionResult> GetAllOrders()
    {
        // Dùng Include để móc nối dữ liệu từ các bảng liên quan
        var orders = await _context.Orders
            .Include(o => o.User)
            .Include(o => o.OrderDetails)
                .ThenInclude(od => od.Product)
            .OrderByDescending(o => o.OrderDate) // Đơn mới nhất lên đầu
            .Select(o => new
            {
                orderId = o.OrderId,
                orderDate = o.OrderDate,
                totalAmount = o.TotalAmount,
                shippingAddress = o.ShippingAddress,
                status = o.Status,
                paymentMethod = o.PaymentMethod,
                paymentStatus = o.PaymentStatus,
                transactionId = o.TransactionId,

                // Lấy thông tin User (Nếu Null thì để Khách vãng lai)
                customerName = o.User != null ? o.User.FullName : "Khách vãng lai",
                phone = o.User != null ? o.User.Phone : "Chưa cập nhật",

                // Lấy danh sách sản phẩm trong đơn hàng
                items = o.OrderDetails.Select(od => new
                {
                    productId = od.ProductId,
                    productName = od.Product.ProductName,
                    quantity = od.Quantity,
                    unitPrice = od.UnitPrice
                }).ToList()
            })
            .ToListAsync();

        return Ok(orders);
    }

    // ========================================================
    // 1. API SỬA LỖI MẤT ẢNH: Lấy lịch sử đơn hàng của User
    // ========================================================
    [HttpGet("user/{username}")]
    public async Task<IActionResult> GetUserOrders(string username)
    {
        var user = await _context.Users.FirstOrDefaultAsync(u => u.Username == username);
        if (user == null) return NotFound("Không tìm thấy người dùng!");

        var orders = await _context.Orders
            .Include(o => o.OrderDetails)
                .ThenInclude(od => od.Product)
            .Where(o => o.UserId == user.UserId)
            .OrderByDescending(o => o.OrderDate)
            .Select(o => new
            {
                orderId = o.OrderId,
                orderDate = o.OrderDate,
                totalAmount = o.TotalAmount,
                shippingAddress = o.ShippingAddress,
                status = o.Status,
                paymentMethod = o.PaymentMethod,
                paymentStatus = o.PaymentStatus,
                transactionId = o.TransactionId,
                items = o.OrderDetails.Select(od => new
                {
                    productId = od.ProductId,
                    productName = od.Product.ProductName,
                    productImage = od.Product.Image,
                    quantity = od.Quantity,
                    unitPrice = od.UnitPrice
                }).ToList()
            })
            .ToListAsync();

        return Ok(orders);
    }

    // ========================================================
    // 2. API MỚI: Khách hàng yêu cầu hủy đơn hàng (An toàn)
    // ========================================================
    [HttpPut("cancel-order/{orderId}")]
    public async Task<IActionResult> CustomerCancelOrder(int orderId, [FromBody] CancelOrderDto dto)
    {
        // 1. Xác minh user gửi yêu cầu
        var user = await _context.Users.FirstOrDefaultAsync(u => u.Username == dto.Username);
        if (user == null) return BadRequest("Xác thực người dùng thất bại!");

        // 2. Tìm đơn hàng và kiểm tra quyền sở hữu
        var order = await _context.Orders.FirstOrDefaultAsync(o => o.OrderId == orderId && o.UserId == user.UserId);
        if (order == null) return NotFound("Không tìm thấy đơn hàng của bạn!");

        // 3. ĐIỀU KIỆN QUAN TRỌNG: Chỉ được hủy khi trạng thái là 'Mới'
        if (order.Status != "Mới")
        {
            return BadRequest("Không thể hủy đơn hàng này! Đơn hàng đã được xác nhận hoặc đang được giao.");
        }

        // 4. Cập nhật trạng thái thành 'Đã hủy'
        order.Status = "Đã hủy";
        await _context.SaveChangesAsync();

        return Ok(new { message = "Đã hủy đơn hàng thành công!" });
    }

    // ========================================================
    // API DÀNH CHO ADMIN: Cập nhật trạng thái đơn hàng
    // ========================================================
    [HttpPut("{id}/status")]
    public async Task<IActionResult> UpdateOrderStatus(int id, [FromBody] UpdateStatusDto dto)
    {
        var order = await _context.Orders.FirstOrDefaultAsync(o => o.OrderId == id);
        if (order == null) return NotFound("Không tìm thấy đơn hàng!");

        order.Status = dto.Status;

        // Logic thông minh: Nếu Admin bấm "Đã giao" và khách thanh toán COD -> Đổi luôn thành Đã thanh toán
        if (dto.Status == "Đã giao" && order.PaymentMethod == "COD")
        {
            order.PaymentStatus = "Đã thanh toán";
        }

        await _context.SaveChangesAsync();
        return Ok(new { message = "Cập nhật trạng thái thành công!" });
    }

    // ========================================================
    // API DÀNH CHO ADMIN: Xóa đơn hàng vĩnh viễn
    // ========================================================
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteOrder(int id)
    {
        // Tìm đơn hàng kèm theo các chi tiết sản phẩm bên trong nó
        var order = await _context.Orders
            .Include(o => o.OrderDetails)
            .FirstOrDefaultAsync(o => o.OrderId == id);

        if (order == null)
            return NotFound("Không tìm thấy đơn hàng này!");

        // 1. Xóa các chi tiết đơn hàng trước (để tránh lỗi Khóa ngoại - Foreign Key)
        if (order.OrderDetails != null && order.OrderDetails.Any())
        {
            _context.OrderDetails.RemoveRange(order.OrderDetails);
        }

        // 2. Xóa đơn hàng chính
        _context.Orders.Remove(order);
        await _context.SaveChangesAsync();

        return Ok(new { message = "Đã xóa đơn hàng thành công!" });
    }

    // Class DTO đi kèm (Dán ở cuối file OrdersController.cs)
    public class UpdateStatusDto
    {
        public string Status { get; set; } = string.Empty;
    }

    public class CancelOrderDto
    {
        public string Username { get; set; } = string.Empty;
    }
}