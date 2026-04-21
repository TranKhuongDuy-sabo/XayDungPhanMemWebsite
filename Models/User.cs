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
    [DisplayName("Mã người dùng")]
    public int UserId { get; set; }

    [StringLength(50)]
    [DisplayName("Tên đăng nhập")]
    public string Username { get; set; } = null!;

    [StringLength(255)]
    [DisplayName("Mật khẩu")]
    public string Password { get; set; } = null!;

    [StringLength(20)]
    [DisplayName("Vai trò")]
    public string? Role { get; set; }

    [StringLength(100)]
    [DisplayName("Họ và tên")]
    public string? FullName { get; set; }

    [StringLength(100)]
    [DisplayName("Địa chỉ Email")]
    public string? Email { get; set; }

    [StringLength(20)]
    [DisplayName("Số điện thoại")]
    public string? Phone { get; set; }

    [StringLength(255)]
    [DisplayName("Địa chỉ liên hệ")]
    public string? Address { get; set; }

    [DisplayName("Trạng thái hoạt động")]
    public bool IsActive { get; set; } = false;

    [DisplayName("Mã khôi phục mật khẩu")]
    public string? ResetCode { get; set; }

    [DisplayName("Thời gian hết hạn mã khôi phục")]
    public DateTime? ResetCodeExpiry { get; set; }

    [InverseProperty("User")]
    public virtual ICollection<Order> Orders { get; set; } = new List<Order>();

    public virtual ICollection<Review> Reviews { get; set; } = new List<Review>();
}