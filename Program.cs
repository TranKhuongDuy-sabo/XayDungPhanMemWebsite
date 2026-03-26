using Microsoft.EntityFrameworkCore;
using TechStoreApi.Data;
using TechStoreApi.Services;
using Microsoft.OpenApi.Models;
using Microsoft.AspNetCore.Authentication.JwtBearer; // Thêm cái này
using Microsoft.IdentityModel.Tokens; // Thêm cái này
using System.Text; // Thêm cái này

var builder = WebApplication.CreateBuilder(args);

// --- 1. ĐĂNG KÝ CÁC DỊCH VỤ (SERVICES) ---

// Kết nối SQL Server
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

// Đăng ký Cloudinary Service
builder.Services.AddScoped<IPhotoService, PhotoService>();

// Cấu hình JWT Authentication
var jwtKey = builder.Configuration["Jwt:Key"] ?? "DayLaChuoiBiMatSieuCapVipProNhatTheGioiCuaSaboTech2024_PhaiTren64KyTuDeChayDuocHmacSha512";
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey)),
            ValidateIssuer = false,
            ValidateAudience = false,
            ClockSkew = TimeSpan.Zero // Token hết hạn là khóa ngay, không đợi độ trễ
        };
    });

// Cấu hình CORS cho React
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowReact", policy =>
    {
        policy.AllowAnyOrigin().AllowAnyHeader().AllowAnyMethod();
    });
});

builder.Services.AddControllers().AddJsonOptions(options =>
{
    options.JsonSerializerOptions.ReferenceHandler = System.Text.Json.Serialization.ReferenceHandler.IgnoreCycles;
});

// Cấu hình Swagger để có thể nhập Token JWT khi Test
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo { Title = "TechStore API", Version = "v1" });

    // Thêm nút "Authorize" (ổ khóa) lên Swagger
    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Description = "Dán Token vào đây (Ví dụ: 'Bearer abcxyz...')",
        Name = "Authorization",
        In = ParameterLocation.Header,
        Type = SecuritySchemeType.ApiKey,
        Scheme = "Bearer"
    });

    c.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference { Type = ReferenceType.SecurityScheme, Id = "Bearer" }
            },
            new string[] {}
        }
    });
});
var app = builder.Build();
// --- 2. CẤU HÌNH PIPELINE (MIDDLEWARE) ---


    app.UseSwagger();
    app.UseSwaggerUI(c => 
    {
        c.SwaggerEndpoint("/swagger/v1/swagger.json", "API v1");
        c.RoutePrefix = string.Empty; 
    });

app.UseHttpsRedirection();
app.UseStaticFiles();
app.UseCors("AllowReact");
// QUAN TRỌNG: Thứ tự phải là Authentication TRƯỚC Authorization
app.UseAuthentication(); 
app.UseAuthorization();
app.MapControllers();

app.Run();