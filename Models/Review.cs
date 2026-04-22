// File: Review.cs
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace TechStoreApi.Models
{
    public class Review
    {
        [Key]
        public int ReviewID { get; set; }

        [Required]
        public int ProductID { get; set; }
        [ForeignKey("ProductID")]
        public virtual Product? Product { get; set; }

        [Required]
        public int UserID { get; set; }
        [ForeignKey("UserID")]
        public virtual User? User { get; set; }

        [Required]
        [Range(1, 5)]
        public int Rating { get; set; } 

        public string Comment { get; set; } = string.Empty;

        public DateTime CreatedAt { get; set; } = DateTime.Now;

        // 🔥 THÊM CỘT NÀY ĐỂ ADMIN GHIM ĐÁNH GIÁ NỔI BẬT
        public bool IsPinned { get; set; } = false; 
    }

    
}