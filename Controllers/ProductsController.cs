using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TechStoreApi.Data;
using TechStoreApi.Models;

namespace TechStoreApi.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ProductsController : ControllerBase
    {
        private readonly AppDbContext _context;

        public ProductsController(AppDbContext context)
        {
            _context = context;
        }

        // Lấy danh sách (Đã dùng Select để cắt đứt vòng lặp vô tận)
        [HttpGet]
        public async Task<IActionResult> GetProducts()
        {
            var products = await _context.Products
                .Select(p => new 
                {
                    // Chỉ lấy những cột cần thiết cho Frontend
                    id = p.ProductId, // Đổi tên thành id cho khớp với Frontend React của bạn
                    name = p.ProductName, // Đổi tên thành name 
                    price = p.Price,
                    stock = p.Stock,
                    image = p.Image,
                    description = p.Description,
                    categoryName = p.Category != null ? p.Category.CategoryName : null,
                    brandName = p.Brand != null ? p.Brand.BrandName : null
                })
                .ToListAsync();

            return Ok(products);
        }

        // Lấy 1 sản phẩm
        [HttpGet("{id}")]
        public async Task<IActionResult> GetProduct(int id)
        {
            var product = await _context.Products
                .Where(p => p.ProductId == id)
                .Select(p => new 
                {
                    id = p.ProductId,
                    name = p.ProductName,
                    price = p.Price,
                    stock = p.Stock,
                    image = p.Image,
                    description = p.Description,
                    categoryName = p.Category != null ? p.Category.CategoryName : null,
                    brandName = p.Brand != null ? p.Brand.BrandName : null
                })
                .FirstOrDefaultAsync();

            if (product == null) return NotFound(new { message = "Không tìm thấy sản phẩm" });
            return Ok(product);
        }
    }
}