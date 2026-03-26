using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace TechStoreApi.Models;

[Index("Username", Name = "UQ__Users__536C85E44F8C6D5A", IsUnique = true)]
[Index("Email", Name = "UQ__Users__A9D1053471426B91", IsUnique = true)]
public partial class User
{
    [Key]
    [Column("UserID")]
    [DisplayName("ID")]
    public int UserId { get; set; }

    [StringLength(50)]
    public string Username { get; set; } = null!;

    [StringLength(255)]
    public string Password { get; set; } = null!;

    [StringLength(20)]
    public string? Role { get; set; }

    [StringLength(100)]
    public string? FullName { get; set; }

    [StringLength(100)]
    public string? Email { get; set; }

    [StringLength(20)]
    public string? Phone { get; set; }

    [StringLength(255)]
    public string? Address { get; set; }

    [DisplayName("Duyệt")]
    public bool IsActive { get; set; } = false;

    [InverseProperty("User")]
    public virtual ICollection<Order> Orders { get; set; } = new List<Order>();
}