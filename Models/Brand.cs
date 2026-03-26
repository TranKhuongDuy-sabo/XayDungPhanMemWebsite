using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace TechStoreApi.Models;

public partial class Brand
{
    [Key]
    [Column("BrandID")]
    [DisplayName("ID")]
    public int BrandId { get; set; }

    [StringLength(100)]
    [Required(ErrorMessage = "Vui lòng nhập tên thương hiệu!")]
    [DisplayName("Tên thương hiệu")]
    public string BrandName { get; set; } = null!;

    [StringLength(100)]
    [Required(ErrorMessage = "Vui lòng nhập nguồn gốc!")]
    [DisplayName("Nguồn gốc")]
    public string? Origin { get; set; }

    [InverseProperty("Brand")]
    public virtual ICollection<Product> Products { get; set; } = new List<Product>();
}