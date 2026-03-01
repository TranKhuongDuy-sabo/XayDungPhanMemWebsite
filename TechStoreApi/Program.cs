using Microsoft.EntityFrameworkCore;
using TechStoreApi.Data;

var builder = WebApplication.CreateBuilder(args);

// 1. Đăng ký DbContext với SQL Server
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

// 2. Cấu hình CORS cho React
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowReact", policy =>
    {
        policy.AllowAnyOrigin() // Cho phép mọi địa chỉ web gọi API
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

builder.Services.AddControllers();

var app = builder.Build();

app.UseCors("AllowReact");
app.MapControllers();
app.Run();