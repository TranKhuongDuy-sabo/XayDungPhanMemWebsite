namespace TechStoreApi.Models;

public class ReviewCreateDto
{
    public int ProductID { get; set; }
    public int UserID { get; set; }
    public int Rating { get; set; }
    public string Comment { get; set; } = string.Empty;
}