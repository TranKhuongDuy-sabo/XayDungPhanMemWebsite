using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace TechStoreApi.Models;

public partial class Category
{
    [Key]
    [Column("CategoryID")]
    [DisplayName("ID")]
    public int CategoryId { get; set; }

    [StringLength(100)]
    [Required(ErrorMessage = "Vui lòng nhập tên danh mục!")]
    [DisplayName("Tên danh mục")]
    public string CategoryName { get; set; } = null!;

    [DisplayName("Trạng thái")]
    public bool IsActive { get; set; } = true;

    [InverseProperty("Category")]
    public virtual ICollection<Product> Products { get; set; } = new List<Product>();
}