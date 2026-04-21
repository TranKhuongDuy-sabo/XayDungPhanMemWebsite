using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TechStoreApi.Data;
using TechStoreApi.Models;
using System.Security.Claims;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using System.IdentityModel.Tokens.Jwt;
// 🔥 Bổ sung 2 thư viện này để gửi Mail
using MailKit.Net.Smtp;
using MimeKit;

namespace TechStoreApi.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AccountsController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly IConfiguration _config;

        public AccountsController(AppDbContext context, IConfiguration config)
        {
            _context = context;
            _config = config;
        }

        // 1. ĐĂNG KÝ (Register)
        [HttpPost("register")]
        public async Task<IActionResult> Register(RegisterDto dto)
        {
            if (await _context.Users.AnyAsync(u => u.Username == dto.Username))
                return BadRequest("Tên đăng nhập đã tồn tại!");

            var user = new User
            {
                Username = dto.Username,
                Password = BCrypt.Net.BCrypt.HashPassword(dto.Password),
                FullName = dto.FullName,
                Email = dto.Email,
                Role = "User",
                IsActive = true
            };

            _context.Users.Add(user);
            await _context.SaveChangesAsync();
            return Ok(new { message = "Đăng ký thành công!" });
        }

        // 2. ĐĂNG NHẬP (Login)
        [HttpPost("login")]
        public async Task<IActionResult> Login(LoginDto dto)
        {
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Username == dto.Username);

            if (user == null || user.Username != dto.Username || !BCrypt.Net.BCrypt.Verify(dto.Password, user.Password))
                return Unauthorized("Sai tài khoản hoặc mật khẩu!");

            var token = CreateToken(user);

            return Ok(new
            {
                token = token,
                username = user.Username,
                role = user.Role
            });
        }

        // Hàm phụ để tạo Token
        private string CreateToken(User user)
        {
            var claims = new List<Claim> {
                new Claim(ClaimTypes.Name, user.Username),
                new Claim(ClaimTypes.Role, user.Role ?? "User")
            };

            var keyFromConfig = _config["Jwt:Key"]
                ?? throw new InvalidOperationException("Chưa cấu hình 'Jwt:Key' trong file appsettings.json!");

            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(keyFromConfig));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha512Signature);

            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(claims),
                Expires = DateTime.Now.AddDays(7),
                SigningCredentials = creds
            };

            var tokenHandler = new JwtSecurityTokenHandler();
            var token = tokenHandler.CreateToken(tokenDescriptor);
            return tokenHandler.WriteToken(token);
        }

        // ==================== KHU VỰC QUÊN MẬT KHẨU ====================

        // 1. Yêu cầu gửi mã (Forgot Password)
        [HttpPost("forgot-password")]
        public async Task<IActionResult> ForgotPassword([FromBody] ForgotPasswordDto dto)
        {
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == dto.Email);
            if (user == null) return BadRequest("Email không tồn tại trong hệ thống!");

            string code = new Random().Next(100000, 999999).ToString();
            user.ResetCode = code;
            user.ResetCodeExpiry = DateTime.Now.AddMinutes(10);
            await _context.SaveChangesAsync();

            await SendEmailAsync(user.Email, "Mã xác nhận đổi mật khẩu SaboTech", $"<h2 style='color:#2563eb;'>Mã xác nhận của bạn là: {code}</h2><p>Mã này có hiệu lực trong 10 phút. Vui lòng không chia sẻ cho người khác.</p>");

            return Ok(new { message = "Mã xác nhận đã được gửi vào Email!" });
        }

        // 2. Xác nhận mã (Verify Code)
        [HttpPost("verify-code")]
        public async Task<IActionResult> VerifyCode([FromBody] VerifyCodeDto dto)
        {
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == dto.Email && u.ResetCode == dto.Code);

            if (user == null || user.ResetCodeExpiry < DateTime.Now)
                return BadRequest("Mã xác nhận không đúng hoặc đã hết hạn!");

            return Ok(new { message = "Mã xác nhận hợp lệ!" });
        }

        // 3. Đổi mật khẩu mới (Reset Password)
        [HttpPost("reset-password")]
        public async Task<IActionResult> ResetPassword([FromBody] ResetPasswordDto dto)
        {
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == dto.Email);
            if (user == null) return BadRequest("Đã có lỗi xảy ra!");

            user.Password = BCrypt.Net.BCrypt.HashPassword(dto.NewPassword);
            user.ResetCode = null;
            user.ResetCodeExpiry = null;

            await _context.SaveChangesAsync();
            return Ok(new { message = "Đổi mật khẩu thành công!" });
        }

        // 🔥 HÀM PHỤ: XỬ LÝ GỬI EMAIL BẰNG MAILKIT
        private async Task SendEmailAsync(string toEmail, string subject, string htmlBody)
        {
            var email = new MimeMessage();
            // Tên hiển thị người gửi
            email.From.Add(new MailboxAddress("SaboTech Security", "duyt2296@gmail.com"));
            email.To.Add(MailboxAddress.Parse(toEmail));
            email.Subject = subject;

            email.Body = new TextPart(MimeKit.Text.TextFormat.Html) { Text = htmlBody };

            using var smtp = new SmtpClient();
            await smtp.ConnectAsync("smtp.gmail.com", 587, MailKit.Security.SecureSocketOptions.StartTls);

            // 🔥 NHỚ THAY BẰNG EMAIL VÀ MẬT KHẨU ỨNG DỤNG CỦA DUY
            await smtp.AuthenticateAsync("duyt2296@gmail.com", "pklcnxiclurjjmuo");

            await smtp.SendAsync(email);
            await smtp.DisconnectAsync(true);
        }

        // ==================== QUẢN LÝ USER (DÀNH CHO ADMIN) ====================

        // 1. Lấy danh sách toàn bộ User
        [HttpGet("users")]
        public async Task<IActionResult> GetAllUsers()
        {
            var users = await _context.Users
                .Select(u => new
                {
                    u.UserId,
                    u.Username,
                    u.FullName,
                    u.Email,
                    u.Role,
                    u.IsActive
                })
                .OrderByDescending(u => u.UserId)
                .ToListAsync();
            return Ok(users);
        }

        // 2. Thay đổi quyền (Cấp/Hủy Admin)
        [HttpPut("toggle-role/{id}")]
        public async Task<IActionResult> ToggleRole(int id)
        {
            var user = await _context.Users.FindAsync(id);
            if (user == null) return NotFound("Không tìm thấy tài khoản!");

            // 🔥 Bảo vệ tài khoản admin gốc
            if (user.Username.ToLower() == "admin")
                return BadRequest("Tuyệt đối không thể thay đổi quyền của Admin hệ thống!");

            // Đảo ngược quyền: Nếu đang là Admin thì xuống User, ngược lại
            user.Role = (user.Role == "Admin") ? "User" : "Admin";
            await _context.SaveChangesAsync();

            return Ok(new { message = $"Đã đổi quyền thành {user.Role}!", role = user.Role });
        }

        // 3. Xóa User
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteUser(int id)
        {
            var user = await _context.Users.FindAsync(id);
            if (user == null) return NotFound("Không tìm thấy tài khoản!");

            // 🔥 Bảo vệ tài khoản admin gốc
            if (user.Username.ToLower() == "admin")
                return BadRequest("Tuyệt đối không thể xóa Admin hệ thống!");

            _context.Users.Remove(user);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Đã xóa tài khoản vĩnh viễn!" });
        }
    }

    // ==================== CÁC CLASS DTO ====================
    // Chứa dữ liệu từ React gửi lên

    public class ForgotPasswordDto
    {
        public string Email { get; set; } = string.Empty;
    }

    public class VerifyCodeDto
    {
        public string Email { get; set; } = string.Empty;
        public string Code { get; set; } = string.Empty;
    }

    public class ResetPasswordDto
    {
        public string Email { get; set; } = string.Empty;
        public string NewPassword { get; set; } = string.Empty;
    }
}