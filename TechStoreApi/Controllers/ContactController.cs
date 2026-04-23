using Microsoft.AspNetCore.Mvc;
using MailKit.Net.Smtp;
using MimeKit;
using TechStoreApi.Data;
using TechStoreApi.Models;

namespace TechStoreApi.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ContactController : ControllerBase
    {
        private readonly AppDbContext _context;

        // Tiêm AppDbContext vào để lưu Database
        public ContactController(AppDbContext context)
        {
            _context = context;
        }

        [HttpPost]
        public async Task<IActionResult> SendContactEmail([FromBody] ContactRequest request)
        {
            if (string.IsNullOrEmpty(request.Email) || string.IsNullOrEmpty(request.Message))
                return BadRequest("Vui lòng điền đủ thông tin!");

            try
            {
                // 1. LƯU VÀO DATABASE (Dùng model Contact của Duy)
                var newContact = new Contact
                {
                    FullName = request.Name,
                    Email = request.Email,
                    Subject = "Liên hệ mới từ Website", // Đặt tiêu đề mặc định
                    // Vì DB của Duy không có cột Phone, mình sẽ ghép SĐT vào phần Message luôn
                    Message = $"[SĐT: {request.Phone}] - {request.Message}", 
                    CreatedAt = DateTime.Now,
                    IsResolved = false
                };
                
                _context.Contacts.Add(newContact);
                await _context.SaveChangesAsync(); // Lưu xong!

                // 2. GỬI EMAIL THÔNG BÁO BẰNG MAILKIT
                var email = new MimeMessage();
                email.From.Add(new MailboxAddress("SaboTech Website", "duyt2296@gmail.com")); 
                email.To.Add(new MailboxAddress("Admin SaboTech", "duyt2296@gmail.com")); 
                email.Subject = $"[Khách Hàng Liên Hệ] - {request.Name}";

                email.Body = new TextPart(MimeKit.Text.TextFormat.Html)
                {
                    Text = $@"
                        <h3>Có khách hàng vừa liên hệ từ Website SaboTech:</h3>
                        <ul>
                            <li><b>Họ tên:</b> {request.Name}</li>
                            <li><b>Số điện thoại:</b> {request.Phone}</li>
                            <li><b>Email:</b> {request.Email}</li>
                        </ul>
                        <p><b>Nội dung tin nhắn:</b></p>
                        <p style='padding: 10px; background: #f8fafc; border-left: 4px solid #2563eb;'>{request.Message}</p>
                    "
                };

                using var smtp = new SmtpClient();
                await smtp.ConnectAsync("smtp.gmail.com", 587, MailKit.Security.SecureSocketOptions.StartTls);
                
                // 🔥 ĐIỀN EMAIL VÀ MẬT KHẨU ỨNG DỤNG VÀO ĐÂY
                await smtp.AuthenticateAsync("duyt2296@gmail.com", "pklcnxiclurjjmuo");
                
                await smtp.SendAsync(email);
                await smtp.DisconnectAsync(true);

                return Ok(new { message = "Lưu và Gửi mail thành công!" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Lỗi server: {ex.Message}");
            }
        }
    }

    // DTO để nhận dữ liệu từ React (Để ở cuối file này hoặc tạo file mới đều được)
    public class ContactRequest
    {
        public string Name { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Phone { get; set; } = string.Empty;
        public string Message { get; set; } = string.Empty;
    }
}