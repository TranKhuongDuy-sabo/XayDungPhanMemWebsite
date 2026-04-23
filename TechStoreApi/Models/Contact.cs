using System;
using System.ComponentModel.DataAnnotations;

namespace TechStoreApi.Models
{
    public class Contact
    {
        [Key]
        public int ContactID { get; set; }

        [Required]
        [MaxLength(100)]
        public string FullName { get; set; } = string.Empty;

        [Required]
        [EmailAddress]
        [MaxLength(100)]
        public string Email { get; set; } = string.Empty;

        [MaxLength(200)]
        public string Subject { get; set; } = string.Empty; // Tiêu đề liên hệ

        [Required]
        public string Message { get; set; } = string.Empty; // Nội dung

        public DateTime CreatedAt { get; set; } = DateTime.Now;

        // Trạng thái để Admin biết đã xử lý/phản hồi hay chưa (VD: false = chưa, true = rồi)
        public bool IsResolved { get; set; } = false; 
    }
}