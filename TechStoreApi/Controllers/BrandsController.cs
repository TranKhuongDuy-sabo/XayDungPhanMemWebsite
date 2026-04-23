using Microsoft.AspNetCore.Authorization; // QUAN TRỌNG
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TechStoreApi.Data;
using TechStoreApi.Models;

namespace TechStoreApi.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class BrandsController : ControllerBase
    {
        private readonly AppDbContext _context;

        public BrandsController(AppDbContext context)
        {
            _context = context;
        }

        // 1. LẤY DANH SÁCH (Mọi người đều xem được)
        [HttpGet]
        public async Task<IActionResult> GetBrands()
        {
            var brands = await _context.Brands
                .Select(b => new {
                    id = b.BrandId,
                    name = b.BrandName,
                    origin = b.Origin
                })
                .ToListAsync();
            return Ok(brands);
        }

        // 2. LẤY CHI TIẾT
        [HttpGet("{id}")]
        public async Task<IActionResult> GetBrand(int id)
        {
            var brand = await _context.Brands.FindAsync(id);
            if (brand == null) return NotFound(new { message = "Không tìm thấy thương hiệu" });

            return Ok(new {
                id = brand.BrandId,
                name = brand.BrandName,
                origin = brand.Origin
            });
        }

        // 3. THÊM THƯƠNG HIỆU (Admin & Staff)
        [HttpPost]
        [Authorize(Roles = "Admin,Staff")]
        public async Task<IActionResult> PostBrand(Brand brand)
        {
            _context.Brands.Add(brand);
            await _context.SaveChangesAsync();
            return CreatedAtAction(nameof(GetBrand), new { id = brand.BrandId }, brand);
        }

        // 4. CẬP NHẬT THƯƠNG HIỆU (Admin & Staff)
        [HttpPut("{id}")]
        [Authorize(Roles = "Admin,Staff")]
        public async Task<IActionResult> PutBrand(int id, Brand brand)
        {
            if (id != brand.BrandId) return BadRequest("ID không khớp");

            var existBrand = await _context.Brands.FindAsync(id);
            if (existBrand == null) return NotFound();

            // Cập nhật thông tin
            existBrand.BrandName = brand.BrandName;
            existBrand.Origin = brand.Origin;

            _context.Entry(existBrand).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!BrandExists(id)) return NotFound();
                else throw;
            }

            return Ok(new { message = "Cập nhật thương hiệu thành công" });
        }

        // 5. XÓA THƯƠNG HIỆU (Chỉ Admin mới có quyền xóa)
        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> DeleteBrand(int id)
        {
            var brand = await _context.Brands.FindAsync(id);
            if (brand == null) return NotFound();

            // KIỂM TRA: Nếu thương hiệu này đang có sản phẩm thì KHÔNG cho xóa
            var hasProducts = await _context.Products.AnyAsync(p => p.BrandId == id);
            if (hasProducts) 
            {
                return BadRequest(new { message = "Không thể xóa thương hiệu này vì đang có sản phẩm liên kết!" });
            }

            _context.Brands.Remove(brand);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Đã xóa thương hiệu" });
        }

        private bool BrandExists(int id)
        {
            return _context.Brands.Any(e => e.BrandId == id);
        }
    }
}