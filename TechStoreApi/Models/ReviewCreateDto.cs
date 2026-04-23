// 🔥 Sửa lại DTO để nhận Username từ React thay vì UserID
    public class ReviewCreateDto
    {
        public int ProductID { get; set; }
        public string Username { get; set; } = string.Empty; 
        public int Rating { get; set; }
        public string Comment { get; set; } = string.Empty;
    }