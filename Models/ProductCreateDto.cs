
using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Http;

namespace TechStoreApi.Models;

public class ProductCreateDto
{
    [Required(ErrorMessage = "Tên sản phẩm không được bỏ trống")]
    [StringLength(255, MinimumLength = 2, ErrorMessage = "Tên sản phẩm phải từ 2 đến 255 ký tự")]
    public string ProductName { get; set; } = null!;

    [Required(ErrorMessage = "Giá sản phẩm không được bỏ trống")]
    [Range(0.01, double.MaxValue, ErrorMessage = "Giá phải lớn hơn 0")]
    public decimal Price { get; set; }

    [Range(0, int.MaxValue, ErrorMessage = "Tồn kho phải lớn hơn hoặc bằng 0")]
    public int? Stock { get; set; }

    [StringLength(1000, ErrorMessage = "Mô tả không quá 1000 ký tự")]
    public string? Description { get; set; }

    [Required(ErrorMessage = "Danh mục không được bỏ trống")]
    public int CategoryId { get; set; }

    [Required(ErrorMessage = "Thương hiệu không được bỏ trống")]
    public int BrandId { get; set; }

    public IFormFile? ImageFile { get; set; } // Đây là nơi nhận file ảnh thực tế

    public bool IsActive { get; set; }
    public bool IsFeatured { get; set; }
}