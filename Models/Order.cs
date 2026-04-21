using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace TechStoreApi.Models;

public partial class Order
{
    [Key]
    [Column("OrderID")]
    public int OrderId { get; set; }

    [Column("UserID")]
    public int? UserId { get; set; }

    [Column(TypeName = "datetime")]
    public DateTime? OrderDate { get; set; }

    [Column(TypeName = "decimal(18, 0)")]
    public decimal TotalAmount { get; set; }

    [StringLength(255)]
    public string? ShippingAddress { get; set; }

    [StringLength(50)]
    public string Status { get; set; } = "Mới"; // Trạng thái: Mới, Đang giao, Đã giao, Đã hủy

    [StringLength(50)]
    public string PaymentMethod { get; set; } = "COD"; // COD, MOMO, VNPAY, CARD

    [StringLength(50)]
    public string PaymentStatus { get; set; } = "Chưa thanh toán"; 

    [StringLength(255)]
    public string? TransactionId { get; set; } // Lưu mã giao dịch Momo/VNPay trả về

    [InverseProperty("Order")]
    public virtual ICollection<OrderDetail> OrderDetails { get; set; } = new List<OrderDetail>();

    [ForeignKey("UserId")]
    [InverseProperty("Orders")]
    public virtual User? User { get; set; }
}