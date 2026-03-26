namespace TechStoreApi.Models
{
   public class RegisterDto {
    public string Username { get; set; } = null!;
    public string Password { get; set; } = null!;
    public string? FullName { get; set; }
    public string? Email { get; set; }
}
}