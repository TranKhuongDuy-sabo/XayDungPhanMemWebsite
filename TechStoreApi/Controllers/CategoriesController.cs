using Microsoft.AspNetCore.Authorization; // Cần thiết để phân quyền
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TechStoreApi.Data;
using TechStoreApi.Models;

namespace TechStoreApi.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class CategoriesController : ControllerBase
    {
        private readonly AppDbContext _context;

        public CategoriesController(AppDbContext context)
        {
            _context = context;
        }

        // 1. LẤY DANH SÁCH (Dùng cho Frontend hiện Dropdown hoặc Menu)
        [HttpGet]
        public async Task<IActionResult> GetCategories()
        {
            var categories = await _context.Categories
                // Cho phép admin xem hết, người dùng chỉ xem cái đang Active
                // Ở đây tôi mặc định lấy hết để Admin quản lý dễ hơn
                .Select(c => new {
                    id = c.CategoryId,
                    name = c.CategoryName,
                    isActive = c.IsActive
                })
                .ToListAsync();
            return Ok(categories);
        }

        // 2. LẤY CHI TIẾT 1 DANH MỤC
        [HttpGet("{id}")]
        public async Task<IActionResult> GetCategory(int id)
        {
            var category = await _context.Categories.FindAsync(id);
            if (category == null) return NotFound(new { message = "Không tìm thấy danh mục" });
            
            return Ok(new {
                id = category.CategoryId,
                name = category.CategoryName,
                isActive = category.IsActive
            });
        }

        // 3. THÊM DANH MỤC MỚI (Chỉ Admin & Staff)
        [HttpPost]
        [Authorize(Roles = "Admin,Staff")]
        public async Task<IActionResult> PostCategory(Category category)
        {
            // Mặc định khi tạo mới là Active
            category.IsActive = true;

            _context.Categories.Add(category);
            await _context.SaveChangesAsync();
            return CreatedAtAction(nameof(GetCategory), new { id = category.CategoryId }, category);
        }

        // 4. CẬP NHẬT DANH MỤC (Chỉ Admin & Staff)
        [HttpPut("{id}")]
        [Authorize(Roles = "Admin,Staff")]
        public async Task<IActionResult> PutCategory(int id, Category category)
        {
            if (id != category.CategoryId) return BadRequest("ID không khớp");

            var existCategory = await _context.Categories.FindAsync(id);
            if (existCategory == null) return NotFound();

            // Cập nhật các trường thông tin
            existCategory.CategoryName = category.CategoryName;
            existCategory.IsActive = category.IsActive;

            _context.Entry(existCategory).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!CategoryExists(id)) return NotFound();
                else throw;
            }

            return Ok(new { message = "Cập nhật danh mục thành công" });
        }

        // 5. XÓA DANH MỤC (Chỉ Admin)
        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> DeleteCategory(int id)
        {
            var category = await _context.Categories.FindAsync(id);
            if (category == null) return NotFound();

            // KIỂM TRA: Nếu có sản phẩm thuộc danh mục này thì KHÔNG cho xóa
            var hasProducts = await _context.Products.AnyAsync(p => p.CategoryId == id);
            if (hasProducts)
            {
                return BadRequest(new { 
                    message = "Không thể xóa! Danh mục này đang chứa sản phẩm. Hãy xóa hoặc đổi danh mục của sản phẩm trước." 
                });
            }

            _context.Categories.Remove(category);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Đã xóa danh mục vĩnh viễn" });
        }

        private bool CategoryExists(int id)
        {
            return _context.Categories.Any(e => e.CategoryId == id);
        }
    }
}