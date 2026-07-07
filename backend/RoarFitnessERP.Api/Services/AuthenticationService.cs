using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using RoarFitnessERP.Api.Data;
using RoarFitnessERP.Api.DTOs;
using RoarFitnessERP.Api.Models;
using RoarFitnessERP.Api.Services.Interfaces;

namespace RoarFitnessERP.Api.Services;

/// <summary>Credential validation and JWT token generation for API authentication.</summary>
public class AuthenticationService(AppDbContext db, IConfiguration config) : IAuthenticationService
{
    /// <summary>Authenticates credentials and returns a JWT, or signals pending activation.</summary>
    public async Task<AuthLoginResult> LoginAsync(LoginRequest request)
    {
        var user = await db.Users
            .Include(u => u.UserRoles).ThenInclude(ur => ur.Role)
            .FirstOrDefaultAsync(u => u.Email == request.Email);

        if (user is null || !BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash))
            return new AuthLoginResult(null, false);

        if (!user.IsActive)
        {
            var member = await db.Members.AsNoTracking()
                .FirstOrDefaultAsync(m => m.UserId == user.UserId);
            if (member?.IsTerminated == true)
                return new AuthLoginResult(null, false, true);
            var instructor = await db.Instructors.AsNoTracking()
                .FirstOrDefaultAsync(i => i.UserId == user.UserId);
            if (instructor?.IsTerminated == true)
                return new AuthLoginResult(null, false, true);
            if (member is not null)
                return new AuthLoginResult(null, true);
            return new AuthLoginResult(null, false);
        }

        var roles = user.UserRoles.Select(ur => ur.Role.RoleName).ToList();
        var token = GenerateToken(user, roles);
        return new AuthLoginResult(
            new LoginResponse(token, user.Email, $"{user.FirstName} {user.LastName}", roles, user.UserId),
            false);
    }

    /// <summary>Loads a user with roles and linked member or instructor profile.</summary>
    public async Task<User?> GetUserWithRolesAsync(int userId) =>
        await db.Users
            .Include(u => u.UserRoles).ThenInclude(ur => ur.Role)
            .Include(u => u.Member)
            .Include(u => u.Instructor)
            .FirstOrDefaultAsync(u => u.UserId == userId);

    /// <summary>Builds a signed JWT containing user identity and role claims.</summary>
    public string GenerateToken(User user, IEnumerable<string> roles)
    {
        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(config["Jwt:Key"]!));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);
        var claims = new List<Claim>
        {
            new(ClaimTypes.NameIdentifier, user.UserId.ToString()),
            new(ClaimTypes.Email, user.Email),
            new(ClaimTypes.Name, $"{user.FirstName} {user.LastName}")
        };
        claims.AddRange(roles.Select(r => new Claim(ClaimTypes.Role, r)));

        var token = new JwtSecurityToken(
            issuer: config["Jwt:Issuer"],
            audience: config["Jwt:Audience"],
            claims: claims,
            expires: DateTime.UtcNow.AddHours(8),
            signingCredentials: creds);

        return new JwtSecurityTokenHandler().WriteToken(token);
    }

    /// <summary>Hashes a plaintext password using BCrypt for secure storage.</summary>
    public static string HashPassword(string password) => BCrypt.Net.BCrypt.HashPassword(password);
}
