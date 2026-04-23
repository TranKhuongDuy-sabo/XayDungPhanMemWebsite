
using CloudinaryDotNet.Actions; // Thêm dòng này
using Microsoft.AspNetCore.Http;
namespace TechStoreApi.Services
{
public interface IPhotoService
{
    Task<ImageUploadResult> AddPhotoAsync(IFormFile file);
    Task<DeletionResult> DeletePhotoAsync(string publicId);
}
}