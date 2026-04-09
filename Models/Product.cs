using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace TechStoreApi.Models;

public partial class Product
{
    [Key]
    [Column("ProductID")]
    [DisplayName("ID")]
    public int ProductId { get; set; }

    [StringLength(255)]
    [Required(ErrorMessage = "Tên sản phẩm không được bỏ trống!")]
    [DisplayName("Tên sản phẩm")]
    public string ProductName { get; set; } = null!;

    [Column("CategoryID")]
    // ĐÃ XÓA [Required] Ở ĐÂY ĐỂ TRÁNH XUNG ĐỘT DATABASE
    [DisplayName("Danh mục")]
    public int? CategoryId { get; set; }

    [Column("BrandID")]
    // ĐÃ XÓA [Required] Ở ĐÂY ĐỂ TRÁNH XUNG ĐỘT DATABASE
    [DisplayName("Thương hiệu")]
    public int? BrandId { get; set; }

    [Column(TypeName = "decimal(18, 0)")]
    [Required(ErrorMessage = "Vui lòng nhập giá sản phẩm!")]
    [DisplayName("Giá")]
    public decimal Price { get; set; }

    [Required(ErrorMessage = "Vui lòng nhập số tồn!")]
    [DisplayName("Tồn kho")]
    public int? Stock { get; set; }

    [DisplayName("Hình ảnh")]
    public string? Image { get; set; }

    [DisplayName("Mô tả")]
    public string? Description { get; set; }

    [ForeignKey("BrandId")]
    [InverseProperty("Products")]
    public virtual Brand? Brand { get; set; }

    [ForeignKey("CategoryId")]
    [InverseProperty("Products")]
    public virtual Category? Category { get; set; }

    [DisplayName("Hiển thị")]
    public bool IsActive { get; set; } = true; // Mặc định là bật

    [InverseProperty("Product")]
    public virtual ICollection<OrderDetail> OrderDetails { get; set; } = new List<OrderDetail>();

    public virtual ICollection<Review> Reviews { get; set; } = new List<Review>();
}