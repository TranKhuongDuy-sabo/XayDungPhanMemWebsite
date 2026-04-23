using System;
using System.Collections.Generic;
using Microsoft.EntityFrameworkCore;
using TechStoreApi.Models; // Trỏ về đúng thư mục Models của project hiện tại

namespace TechStoreApi.Data; // Đổi namespace cho khớp project

// Đổi tên class thành AppDbContext để không làm lỗi file Program.cs
public partial class AppDbContext : DbContext 
{
    public AppDbContext()
    {
    }

    public AppDbContext(DbContextOptions<AppDbContext> options)
        : base(options)
    {
    }

    public virtual DbSet<Brand> Brands { get; set; }

    public virtual DbSet<Category> Categories { get; set; }

    public virtual DbSet<Order> Orders { get; set; }

    public virtual DbSet<OrderDetail> OrderDetails { get; set; }

    public virtual DbSet<Product> Products { get; set; }

    public virtual DbSet<User> Users { get; set; }

    public DbSet<Contact> Contacts { get; set; }
    public DbSet<Review> Reviews { get; set; }

    // ĐÃ XÓA hàm OnConfiguring() ở đây để dùng chuỗi kết nối từ appsettings.json và Program.cs

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Brand>(entity =>
        {
            entity.HasKey(e => e.BrandId).HasName("PK__Brands__DAD4F3BECFA0AF1A");
        });

        modelBuilder.Entity<Category>(entity =>
        {
            entity.HasKey(e => e.CategoryId).HasName("PK__Categori__19093A2B63804C8E");
        });

        modelBuilder.Entity<Order>(entity =>
        {
            entity.HasKey(e => e.OrderId).HasName("PK__Orders__C3905BAF326678A5");

            entity.Property(e => e.OrderDate).HasDefaultValueSql("(getdate())");

            entity.HasOne(d => d.User).WithMany(p => p.Orders)
                .OnDelete(DeleteBehavior.Cascade)
                .HasConstraintName("FK__Orders__UserID__45F365D3");
        });

        modelBuilder.Entity<OrderDetail>(entity =>
        {
            entity.HasKey(e => e.DetailId).HasName("PK__OrderDet__135C314DCAEACA44");

            entity.HasOne(d => d.Order).WithMany(p => p.OrderDetails).HasConstraintName("FK__OrderDeta__Order__48CFD27E");

            entity.HasOne(d => d.Product).WithMany(p => p.OrderDetails).HasConstraintName("FK__OrderDeta__Produ__49C3F6B7");
        });

        modelBuilder.Entity<Product>(entity =>
        {
            entity.HasKey(e => e.ProductId).HasName("PK__Products__B40CC6ED45495B99");

            entity.Property(e => e.IsActive).HasDefaultValue(true);
            entity.Property(e => e.Stock).HasDefaultValue(0);

            entity.HasOne(d => d.Brand).WithMany(p => p.Products)
                .OnDelete(DeleteBehavior.SetNull) // Nếu xóa Brand, các SP thuộc Brand đó sẽ về Null
                .HasConstraintName("FK__Products__BrandI__4222D4EF");

            entity.HasOne(d => d.Category).WithMany(p => p.Products)
                .OnDelete(DeleteBehavior.SetNull) // Nếu xóa Category, các SP thuộc Category đó sẽ về Null
                .HasConstraintName("FK__Products__Catego__412EB0B6");
        });

        modelBuilder.Entity<User>(entity =>
        {
            entity.HasKey(e => e.UserId).HasName("PK__Users__1788CCAC71B627E1");

            entity.Property(e => e.Role).HasDefaultValue("CUSTOMER");
        });

        OnModelCreatingPartial(modelBuilder);
    }

    partial void OnModelCreatingPartial(ModelBuilder modelBuilder);
}