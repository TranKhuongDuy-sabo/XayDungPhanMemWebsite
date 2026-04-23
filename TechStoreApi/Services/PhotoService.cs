using CloudinaryDotNet; // Thêm dòng này
using CloudinaryDotNet.Actions; // Thêm dòng này
using Microsoft.AspNetCore.Http; // Thêm dòng này
using Microsoft.Extensions.Configuration;
namespace TechStoreApi.Services // Thêm .Services vào sau tên project của bạn
{
public class PhotoService : IPhotoService
{
    private readonly Cloudinary _cloudinary;

    public PhotoService(IConfiguration config)
    {
        var acc = new Account(
            config["CloudinarySettings:CloudName"],
            config["CloudinarySettings:ApiKey"],
            config["CloudinarySettings:ApiSecret"]
        );
        _cloudinary = new Cloudinary(acc);
    }

    public async Task<ImageUploadResult> AddPhotoAsync(IFormFile file)
    {
        var uploadResult = new ImageUploadResult();
        if (file.Length > 0)
        {
            using var stream = file.OpenReadStream();
            var uploadParams = new ImageUploadParams
            {
                File = new FileDescription(file.FileName, stream),
                Transformation = new Transformation().Height(500).Width(500).Crop("fill") // Tự động crop ảnh vuông cho đẹp
            };
            uploadResult = await _cloudinary.UploadAsync(uploadParams);
        }
        return uploadResult;
    }
    public async Task<DeletionResult> DeletePhotoAsync(string publicId)
{
    var deleteParams = new DeletionParams(publicId);
    return await _cloudinary.DestroyAsync(deleteParams);
}
}
}