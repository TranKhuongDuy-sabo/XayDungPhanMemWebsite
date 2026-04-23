using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TechStoreApi.Data;
using TechStoreApi.Models;

namespace TechStoreApi.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ReviewsController : ControllerBase
    {
        private readonly AppDbContext _context;
        public ReviewsController(AppDbContext context) { _context = context; }

        // 1. Lấy đánh giá của 1 sản phẩm
        [HttpGet("product/{productId}")]
        public async Task<IActionResult> GetProductReviews(int productId)
        {
            var reviews = await _context.Reviews
                .Include(r => r.User)
                .Where(r => r.ProductID == productId)
                .OrderByDescending(r => r.CreatedAt)
                .Select(r => new {
                    id = r.ReviewID,
                    productId = r.ProductID,
                    username = r.User.Username,
                    fullName = r.User.FullName,
                    rating = r.Rating,
                    comment = r.Comment,
                    createdAt = r.CreatedAt,
                    isPinned = r.IsPinned
                }).ToListAsync();
            return Ok(reviews);
        }

        // 2. Thêm đánh giá mới
        [HttpPost]
        public async Task<IActionResult> AddReview([FromBody] ReviewCreateDto dto)
        {
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Username == dto.Username);
            if (user == null) return BadRequest("Lỗi xác thực người dùng.");

            var review = new Review {
                ProductID = dto.ProductID,
                UserID = user.UserId,
                Rating = dto.Rating,
                Comment = dto.Comment
            };
            _context.Reviews.Add(review);
            await _context.SaveChangesAsync();
            return Ok(new { message = "Đã gửi đánh giá!" });
        }

        // 3. Xóa đánh giá (Chỉ người đăng hoặc Admin mới được xóa)
        [HttpDelete("{id}/{username}")]
        public async Task<IActionResult> DeleteReview(int id, string username)
        {
            var review = await _context.Reviews.Include(r => r.User).FirstOrDefaultAsync(r => r.ReviewID == id);
            if (review == null) return NotFound();

            var userReq = await _context.Users.FirstOrDefaultAsync(u => u.Username == username);
            if (userReq == null) return BadRequest();

            // Kiểm tra nếu không phải Admin và cũng không phải chủ nhân bài review
            if (userReq.Role != "Admin" && review.User.Username != username) {
                return Forbid("Bạn không có quyền xóa đánh giá này.");
            }

            _context.Reviews.Remove(review);
            await _context.SaveChangesAsync();
            return Ok(new { message = "Đã xóa đánh giá" });
        }

        // 4. API Dành cho Admin: Lấy tất cả đánh giá
        [HttpGet("admin/all")]
        public async Task<IActionResult> GetAllReviewsAdmin()
        {
            var reviews = await _context.Reviews
                .Include(r => r.User)
                .Include(r => r.Product)
                .OrderByDescending(r => r.CreatedAt)
                .Select(r => new {
                    id = r.ReviewID,
                    productName = r.Product.ProductName,
                    username = r.User.Username,
                    rating = r.Rating,
                    comment = r.Comment,
                    createdAt = r.CreatedAt,
                    isPinned = r.IsPinned
                }).ToListAsync();
            return Ok(reviews);
        }

        // 5. API Dành cho Admin: Ghim / Bỏ ghim
        [HttpPut("admin/toggle-pin/{id}")]
        public async Task<IActionResult> TogglePin(int id)
        {
            var review = await _context.Reviews.FindAsync(id);
            if (review == null) return NotFound();
            review.IsPinned = !review.IsPinned;
            await _context.SaveChangesAsync();
            return Ok(new { isPinned = review.IsPinned, message = review.IsPinned ? "Đã ghim!" : "Đã bỏ ghim!" });
        }

        // 6. API Trang Chủ: Lấy các đánh giá nổi bật (đã ghim)
        [HttpGet("pinned")]
        public async Task<IActionResult> GetPinnedReviews()
        {
            var reviews = await _context.Reviews
                .Include(r => r.User).Include(r => r.Product)
                .Where(r => r.IsPinned)
                .OrderByDescending(r => r.CreatedAt)
                .Select(r => new {
                    productName = r.Product.ProductName,
                    productId = r.ProductID,
                    username = r.User.Username,
                    fullName = r.User.FullName,
                    rating = r.Rating,
                    comment = r.Comment
                }).ToListAsync();
            return Ok(reviews);
        }
    }
}