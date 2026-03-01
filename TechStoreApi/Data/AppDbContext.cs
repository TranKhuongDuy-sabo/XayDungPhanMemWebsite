using Microsoft.EntityFrameworkCore;
using TechStoreApi.Models;

namespace TechStoreApi.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

        public DbSet<Product> Products { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            // Tạo sẵn dữ liệu mẫu khi khởi tạo Database
            modelBuilder.Entity<Product>().HasData(
                new Product { Id = 1, Name = "Laptop Gaming Acer Nitro", Price = 1500 },
                new Product { Id = 2, Name = "Bàn phím cơ Logitech", Price = 120 },
                new Product { Id = 3, Name = "Chuột không dây Razer", Price = 80 }
            );
        }
    }
}

