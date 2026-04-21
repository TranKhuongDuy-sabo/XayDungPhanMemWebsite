
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TechStoreApi.Data;
using TechStoreApi.Models;
using TechStoreApi.Services;

namespace TechStoreApi.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ProductsController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly IPhotoService _photoService;

        public ProductsController(AppDbContext context, IPhotoService photoService)
        {
            _context = context;
            _photoService = photoService;
        }

        // 1. LẤY DANH SÁCH (Mọi người đều xem được)
        [HttpGet]
        public async Task<IActionResult> GetProducts()
        {
            var products = await _context.Products
                .Select(p => new
                {
                    id = p.ProductId,
                    name = p.ProductName,
                    price = p.Price,
                    stock = p.Stock,
                    image = p.Image,
                    categoryId = p.CategoryId,
                    categoryName = p.Category != null ? p.Category.CategoryName : null,
                    categoryIsActive = p.Category != null ? p.Category.IsActive : true,
                    brandName = p.Brand != null ? p.Brand.BrandName : null,
                    isActive = p.IsActive,
                    isFeatured = p.IsFeatured
                })
                .ToListAsync();
            return Ok(products);
        }

        // 2. LẤY CHI TIẾT
        [HttpGet("{id}")]
        public async Task<IActionResult> GetProduct(int id)
        {
            var p = await _context.Products
                .Include(p => p.Category)
                .Include(p => p.Brand)
                .FirstOrDefaultAsync(p => p.ProductId == id);

            if (p == null) return NotFound(new { message = "Không tìm thấy sản phẩm" });

            return Ok(new
            {
                id = p.ProductId,
                name = p.ProductName,
                price = p.Price,
                stock = p.Stock,
                image = p.Image,
                description = p.Description,
                categoryId = p.CategoryId,
                brandId = p.BrandId,
                isActive = p.IsActive,
                isFeatured = p.IsFeatured
            });
        }

        // 3. THÊM MỚI (Admin & Staff)
        [HttpPost]
        [Authorize(Roles = "Admin,Staff")]
        public async Task<IActionResult> PostProduct([FromForm] ProductCreateDto dto)
        {
            var product = new Product
            {
                ProductName = dto.ProductName,
                CategoryId = dto.CategoryId,
                BrandId = dto.BrandId,
                Price = dto.Price,
                Stock = dto.Stock,
                Description = dto.Description,
                IsActive = dto.IsActive,
                IsFeatured = dto.IsFeatured
            };

            if (dto.ImageFile != null)
            {
                var result = await _photoService.AddPhotoAsync(dto.ImageFile);
                if (result.Error != null) return BadRequest(result.Error.Message);
                product.Image = result.SecureUrl.AbsoluteUri;
            }

            _context.Products.Add(product);
            await _context.SaveChangesAsync();
            return Ok(new { message = "Thêm thành công!", data = product });
        }

        // 4. CẬP NHẬT (Admin & Staff)
        [HttpPut("{id}")]
        [Authorize(Roles = "Admin,Staff")]
        public async Task<IActionResult> PutProduct(int id, [FromForm] ProductUpdateDto dto)
        {
            if (id != dto.ProductId) return BadRequest("ID không khớp");

            var product = await _context.Products.FindAsync(id);
            if (product == null) return NotFound();

            // Cập nhật thông tin cơ bản
            product.ProductName = dto.ProductName;
            product.Price = dto.Price;
            product.Stock = dto.Stock;
            product.Description = dto.Description;
            product.CategoryId = dto.CategoryId;
            product.BrandId = dto.BrandId;
            product.IsActive = dto.IsActive;
            product.IsFeatured = dto.IsFeatured;

            // Xử lý ảnh nếu có upload ảnh mới
            if (dto.ImageFile != null)
            {
                var result = await _photoService.AddPhotoAsync(dto.ImageFile);
                product.Image = result.SecureUrl.AbsoluteUri;
            }

            _context.Entry(product).State = EntityState.Modified;
            await _context.SaveChangesAsync();

            return Ok(new { message = "Cập nhật thành công!", imageUrl = product.Image });
        }

        // 5. XÓA (Chỉ Admin)
        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> DeleteProduct(int id)
        {
            var product = await _context.Products.FindAsync(id);
            if (product == null) return NotFound();

            // Kiểm tra xem có trong đơn hàng không
            var hasOrder = await _context.OrderDetails.AnyAsync(od => od.ProductId == id);
            if (hasOrder) return BadRequest(new { message = "Sản phẩm đã có đơn hàng, không thể xóa!" });

            _context.Products.Remove(product);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Đã xóa sản phẩm khỏi hệ thống" });
        }
    }
}