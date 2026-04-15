using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TechStoreApi.Data;
using TechStoreApi.Models;

namespace TechStoreApi.Controllers;

[Route("api/[controller]")]
[ApiController]
public class ReviewsController : ControllerBase
{
    private readonly AppDbContext _context;

    public ReviewsController(AppDbContext context)
    {
        _context = context;
    }

    // 1. LẤY TẤT CẢ ĐÁNH GIÁ CỦA MỘT SẢN PHẨM CỤ THỂ
    // GET: /api/Reviews/product/{productId}
    [HttpGet("product/{productId}")]
    public async Task<ActionResult<object>> GetProductReviews(int productId)
    {
        // Kiểm tra sản phẩm có tồn tại không
        var productExists = await _context.Products.AnyAsync(p => p.ProductId == productId);
        if (!productExists) return NotFound(new { message = "Sản phẩm không tồn tại." });

        var reviews = await _context.Reviews
            .Where(r => r.ProductID == productId)
            .Include(r => r.User) // Kết nối bảng User
            .OrderByDescending(r => r.CreatedAt)
            .Select(r => new {
                r.ReviewID,
                r.Rating,
                r.Comment,
                r.CreatedAt,
                // Ưu tiên hiện FullName, nếu không có thì hiện Username cho chuyên nghiệp
                UserName = r.User != null 
                    ? (!string.IsNullOrEmpty(r.User.FullName) ? r.User.FullName : r.User.Username) 
                    : "Khách hàng SaboTech"
            })
            .ToListAsync();

        // Tính điểm trung bình cộng (Star Rating)
        var averageRating = reviews.Any() ? reviews.Average(r => r.Rating) : 0;

        return Ok(new {
            total = reviews.Count,
            average = Math.Round(averageRating, 1),
            data = reviews
        });
    }

    // 2. GỬI ĐÁNH GIÁ MỚI
    // POST: /api/Reviews
    [HttpPost]
    public async Task<IActionResult> PostReview(ReviewCreateDto reviewDto)
    {
        // Kiểm tra số sao hợp lệ
        if (reviewDto.Rating < 1 || reviewDto.Rating > 5)
            return BadRequest(new { message = "Số sao đánh giá phải từ 1 đến 5." });

        // Kiểm tra User tồn tại (Dùng UserId theo Model của bạn)
        var userExists = await _context.Users.AnyAsync(u => u.UserId == reviewDto.UserID);
        if (!userExists) return BadRequest(new { message = "Người dùng không tồn tại." });

        // Kiểm tra Sản phẩm tồn tại
        var productExists = await _context.Products.AnyAsync(p => p.ProductId == reviewDto.ProductID);
        if (!productExists) return BadRequest(new { message = "Sản phẩm không tồn tại." });

        var review = new Review
        {
            ProductID = reviewDto.ProductID,
            UserID = reviewDto.UserID,
            Rating = reviewDto.Rating,
            Comment = reviewDto.Comment ?? string.Empty,
            CreatedAt = DateTime.Now
        };

        _context.Reviews.Add(review);
        await _context.SaveChangesAsync();

        return Ok(new { success = true, message = "Cảm ơn bạn đã đánh giá sản phẩm tại SaboTech!" });
    }

    // 3. XÓA ĐÁNH GIÁ
    // DELETE: /api/Reviews/{id}
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteReview(int id)
    {
        var review = await _context.Reviews.FindAsync(id);
        if (review == null) return NotFound(new { message = "Không tìm thấy đánh giá." });

        _context.Reviews.Remove(review);
        await _context.SaveChangesAsync();

        return Ok(new { message = "Đã xóa đánh giá thành công." });
    }
}