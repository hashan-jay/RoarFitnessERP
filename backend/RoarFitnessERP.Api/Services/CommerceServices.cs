using Microsoft.EntityFrameworkCore;
using RoarFitnessERP.Api.Data;
using RoarFitnessERP.Api.DTOs;
using RoarFitnessERP.Api.Models;
using RoarFitnessERP.Api.Services.Interfaces;

namespace RoarFitnessERP.Api.Services;

public class InventoryService(AppDbContext db) : IInventoryService
{
    public async Task<IReadOnlyList<ProductDto>> GetAllAsync()
    {
        var products = await db.Products
            .Include(p => p.Category)
            .Include(p => p.Inventory)
            .OrderBy(p => p.ProductName)
            .ToListAsync();

        return products.Select(p => new ProductDto(
            p.ProductId,
            p.SKU,
            p.ProductName,
            p.Description,
            p.UnitPriceLKR,
            p.Inventory?.QuantityOnHand ?? 0,
            p.Category?.CategoryName ?? "Uncategorized",
            p.CategoryId,
            p.Inventory?.ReorderLevel ?? 5,
            p.IsActive,
            p.ImageUrl)).ToList();
    }

    public async Task<IReadOnlyList<ProductCategoryDto>> GetCategoriesAsync() =>
        await db.ProductCategories
            .OrderBy(c => c.CategoryName)
            .Select(c => new ProductCategoryDto(c.CategoryId, c.CategoryName))
            .ToListAsync();

    public async Task<ProductDto?> CreateProductAsync(int userId, CreateProductRequest request)
    {
        var sku = request.SKU.Trim();
        if (string.IsNullOrWhiteSpace(sku) || string.IsNullOrWhiteSpace(request.ProductName))
            return null;

        if (await db.Products.AnyAsync(p => p.SKU == sku))
            return null;

        if (!await db.ProductCategories.AnyAsync(c => c.CategoryId == request.CategoryId))
            return null;

        var product = new Product
        {
            CategoryId = request.CategoryId,
            SKU = sku,
            ProductName = request.ProductName.Trim(),
            Description = string.IsNullOrWhiteSpace(request.Description) ? null : request.Description.Trim(),
            UnitPriceLKR = request.UnitPriceLKR,
            IsAvailableOnline = true,
            IsActive = true,
            ImageUrl = string.IsNullOrWhiteSpace(request.ImageUrl) ? null : request.ImageUrl.Trim()
        };

        db.Products.Add(product);
        await db.SaveChangesAsync();

        var inventory = new InventoryItem
        {
            ProductId = product.ProductId,
            QuantityOnHand = Math.Max(0, request.InitialQuantity),
            ReorderLevel = request.ReorderLevel,
            LastRestockedAt = request.InitialQuantity > 0 ? AppTime.Now() : null
        };

        db.InventoryItems.Add(inventory);
        await db.SaveChangesAsync();

        if (request.InitialQuantity > 0)
        {
            db.InventoryAdjustments.Add(new InventoryAdjustment
            {
                InventoryItemId = inventory.InventoryItemId,
                AdjustedByUserId = userId,
                QuantityChange = request.InitialQuantity,
                Reason = "Initial stock on product creation"
            });
            await db.SaveChangesAsync();
        }

        return (await GetAllAsync()).FirstOrDefault(p => p.ProductId == product.ProductId);
    }

    public async Task<ProductDto?> UpdateProductAsync(int productId, UpdateProductRequest request)
    {
        var product = await db.Products
            .Include(p => p.Category)
            .Include(p => p.Inventory)
            .FirstOrDefaultAsync(p => p.ProductId == productId);

        if (product is null)
            return null;

        if (await db.Products.AnyAsync(p => p.SKU == request.SKU && p.ProductId != productId))
            return null;

        if (!await db.ProductCategories.AnyAsync(c => c.CategoryId == request.CategoryId))
            return null;

        product.CategoryId = request.CategoryId;
        product.SKU = request.SKU.Trim();
        product.ProductName = request.ProductName.Trim();
        product.Description = request.Description;
        product.UnitPriceLKR = request.UnitPriceLKR;
        product.IsActive = request.IsActive;
        product.IsAvailableOnline = request.IsActive;
        product.ImageUrl = string.IsNullOrWhiteSpace(request.ImageUrl) ? null : request.ImageUrl.Trim();

        if (product.Inventory is not null)
            product.Inventory.ReorderLevel = request.ReorderLevel;
        else
        {
            product.Inventory = new InventoryItem
            {
                ProductId = productId,
                QuantityOnHand = 0,
                ReorderLevel = request.ReorderLevel
            };
        }

        await db.SaveChangesAsync();
        return (await GetAllAsync()).FirstOrDefault(p => p.ProductId == productId);
    }

    public async Task<bool> DeleteProductAsync(int productId)
    {
        var product = await db.Products.FirstOrDefaultAsync(p => p.ProductId == productId);
        if (product is null) return false;

        product.IsActive = false;
        await db.SaveChangesAsync();
        return true;
    }

    public async Task<bool> ClearStockAsync(int userId, int productId, ClearStockRequest request)
    {
        var item = await db.InventoryItems.FirstOrDefaultAsync(i => i.ProductId == productId);
        if (item is null || item.QuantityOnHand == 0) return item is not null;

        var change = -item.QuantityOnHand;
        item.QuantityOnHand = 0;
        item.UpdatedAt = AppTime.Now();

        db.InventoryAdjustments.Add(new InventoryAdjustment
        {
            InventoryItemId = item.InventoryItemId,
            AdjustedByUserId = userId,
            QuantityChange = change,
            Reason = request.Reason
        });

        await db.SaveChangesAsync();
        return true;
    }

    public async Task<bool> AdjustAsync(int userId, InventoryAdjustRequest request)
    {
        var item = await db.InventoryItems.FirstOrDefaultAsync(i => i.ProductId == request.ProductId);
        if (item is null) return false;

        item.QuantityOnHand += request.QuantityChange;
        item.UpdatedAt = AppTime.Now();

        db.InventoryAdjustments.Add(new InventoryAdjustment
        {
            InventoryItemId = item.InventoryItemId,
            AdjustedByUserId = userId,
            QuantityChange = request.QuantityChange,
            Reason = request.Reason
        });

        await db.SaveChangesAsync();
        return true;
    }
}

public class PosService(AppDbContext db) : IPosService
{
    public async Task<PosSaleResponse?> CreateInGymSaleAsync(PosSaleRequest request, int processedByUserId)
    {
        var status = await db.OrderStatuses.FirstAsync(s => s.StatusName == "Paid");
        var methodName = request.PaymentMethod switch
        {
            "Cash" => "Cash",
            "Card" => "Card",
            _ => "Cash"
        };
        var method = await db.PaymentMethods.FirstAsync(m => m.MethodName == methodName);
        var completed = await db.PaymentStatuses.FirstAsync(s => s.StatusName == "Completed");

        var items = new List<OrderItem>();
        decimal subtotal = 0;

        foreach (var line in request.Items)
        {
            var product = await db.Products.Include(p => p.Inventory).FirstOrDefaultAsync(p => p.ProductId == line.ProductId);
            if (product?.Inventory is null || product.Inventory.QuantityOnHand < line.Quantity)
                return null;

            subtotal += product.UnitPriceLKR * line.Quantity;
            items.Add(new OrderItem
            {
                ProductId = product.ProductId,
                Quantity = line.Quantity,
                UnitPriceLKR = product.UnitPriceLKR
            });
        }

        var billReference = $"BILL-{Guid.NewGuid():N}"[..24].ToUpperInvariant();
        var paymentReference = $"PAY-{Guid.NewGuid():N}"[..20].ToUpperInvariant();
        var orderReference = $"ORD-{Guid.NewGuid():N}"[..20].ToUpperInvariant();

        var payment = new Payment
        {
            PaymentReference = paymentReference,
            MemberId = request.MemberId,
            PaymentMethodId = method.PaymentMethodId,
            PaymentStatusId = completed.PaymentStatusId,
            AmountLKR = subtotal,
            PaymentPurpose = "POS",
            PaidAt = AppTime.Now()
        };

        var order = new Order
        {
            OrderReference = orderReference,
            BillReference = billReference,
            MemberId = request.MemberId,
            OrderStatusId = status.OrderStatusId,
            OrderChannel = "InGymPOS",
            SubtotalLKR = subtotal,
            TotalLKR = subtotal,
            ProcessedByUserId = processedByUserId,
            Payment = payment,
            Notes = "In-gym POS sale",
            Items = items
        };

        db.Orders.Add(order);

        foreach (var line in request.Items)
        {
            var inv = await db.InventoryItems.FirstAsync(i => i.ProductId == line.ProductId);
            inv.QuantityOnHand -= line.Quantity;
            inv.UpdatedAt = AppTime.Now();
        }

        await db.SaveChangesAsync();

        var saved = await db.Orders
            .Include(o => o.OrderStatus)
            .Include(o => o.Items).ThenInclude(i => i.Product)
            .Include(o => o.Payment!).ThenInclude(p => p.PaymentMethod)
            .FirstAsync(o => o.OrderId == order.OrderId);

        var orderDto = new OrderDto(
            saved.OrderId,
            saved.OrderReference,
            saved.OrderStatus.StatusName,
            saved.TotalLKR,
            saved.OrderChannel,
            saved.CreatedAt,
            saved.Items.Select(i => new OrderItemDto(
                i.Product.ProductName,
                i.Quantity,
                i.UnitPriceLKR,
                i.Quantity * i.UnitPriceLKR)).ToList(),
            saved.BillReference);

        var bill = new PosBillDto(
            saved.BillReference ?? billReference,
            saved.OrderReference,
            saved.Payment!.PaymentReference,
            saved.Payment.PaymentMethod.MethodName,
            saved.SubtotalLKR,
            saved.TotalLKR,
            saved.CreatedAt,
            saved.Items.Select(i => new PosBillLineDto(
                i.Product.ProductName,
                i.Product.SKU,
                i.Quantity,
                i.UnitPriceLKR,
                i.Quantity * i.UnitPriceLKR)).ToList());

        return new PosSaleResponse(orderDto, bill);
    }
}

public class ReportService(AppDbContext db) : IReportService
{
    public async Task<ReportSummaryDto> GetSummaryAsync()
    {
        var completed = await db.PaymentStatuses.FirstAsync(s => s.StatusName == "Completed");
        var payments = await db.Payments
            .Include(p => p.PaymentMethod)
            .Where(p => p.PaymentStatusId == completed.PaymentStatusId)
            .ToListAsync();

        var breakdown = CalculateRevenueBreakdown(payments);
        var now = AppTime.Now();
        var monthStart = new DateTime(now.Year, now.Month, 1, 0, 0, 0, DateTimeKind.Utc);
        var monthEnd = monthStart.AddMonths(1);
        var thisMonthPayments = payments
            .Where(p => InRange(p, monthStart, monthEnd))
            .ToList();
        var thisMonth = CalculateRevenueBreakdown(thisMonthPayments).Total;

        var totalMembers = await db.Members.CountAsync();
        var today = ProfileHelper.GetAppToday();
        var activeMembers = await db.Memberships
            .CountAsync(m => m.IsActive && m.EndDate >= today);

        var lowStock = await db.InventoryItems.CountAsync(i => i.QuantityOnHand <= i.ReorderLevel);

        var daily = BuildDailyRevenueForMonth(payments, today.Year, today.Month);

        var recentTransactions = await BuildRecentTransactionsAsync(200);

        return new ReportSummaryDto(
            breakdown.MembershipInGymCash,
            breakdown.MembershipInGymCard,
            breakdown.MembershipGateway,
            breakdown.PosCash,
            breakdown.PosCard,
            breakdown.SessionGateway,
            breakdown.Total,
            thisMonth,
            totalMembers,
            activeMembers,
            lowStock,
            daily,
            recentTransactions);
    }

    public async Task<MonthlyReportDto> GetMonthlyReportAsync(int year, int month)
    {
        var start = new DateTime(year, month, 1, 0, 0, 0, DateTimeKind.Utc);
        var end = start.AddMonths(1);

        var completed = await db.PaymentStatuses.FirstAsync(s => s.StatusName == "Completed");
        var payments = await db.Payments
            .Include(p => p.PaymentMethod)
            .Where(p => p.PaymentStatusId == completed.PaymentStatusId)
            .ToListAsync();

        var monthPayments = payments.Where(p => InRange(p, start, end)).ToList();
        var breakdown = CalculateRevenueBreakdown(monthPayments);

        var soldItemRows = await (
            from item in db.OrderItems
            join order in db.Orders on item.OrderId equals order.OrderId
            join product in db.Products on item.ProductId equals product.ProductId
            where order.OrderChannel == "InGymPOS"
                && order.CreatedAt >= start
                && order.CreatedAt < end
            select new
            {
                product.ProductName,
                product.SKU,
                order.OrderChannel,
                item.Quantity,
                item.UnitPriceLKR
            }).ToListAsync();

        var soldItems = soldItemRows
            .GroupBy(x => new { x.ProductName, x.SKU, x.OrderChannel })
            .Select(g => new SoldItemReportDto(
                g.Key.ProductName,
                g.Key.SKU,
                g.Sum(x => x.Quantity),
                g.Sum(x => x.Quantity * x.UnitPriceLKR),
                g.Key.OrderChannel))
            .OrderByDescending(s => s.RevenueLKR)
            .ToList();

        var recentTransactions = await BuildRecentTransactionsAsync(100, monthStart: start, monthEnd: end);
        var dailyRevenue = BuildDailyRevenueForMonth(payments, year, month);

        return new MonthlyReportDto(
            year,
            month,
            start.ToString("MMMM yyyy"),
            breakdown.MembershipInGymCash,
            breakdown.MembershipInGymCard,
            breakdown.MembershipGateway,
            breakdown.PosCash,
            breakdown.PosCard,
            breakdown.SessionGateway,
            breakdown.Total,
            dailyRevenue,
            soldItems,
            recentTransactions);
    }

    private static bool InRange(Payment payment, DateTime start, DateTime end)
    {
        var when = payment.PaidAt ?? payment.CreatedAt;
        return when >= start && when < end;
    }

    private static bool IsMembershipInGym(Payment payment)
    {
        var method = payment.PaymentMethod?.MethodName;
        return payment.PaymentPurpose == "MembershipInGym" ||
               (payment.PaymentPurpose == "Membership" && method is "Cash" or "Card");
    }

    private static bool IsMembershipGateway(Payment payment) =>
        payment.PaymentPurpose == "Membership" &&
        payment.PaymentMethod?.MethodName == "PayHere";

    private static RevenueBreakdown CalculateRevenueBreakdown(IEnumerable<Payment> payments)
    {
        var list = payments.ToList();
        var membershipInGymCash = list
            .Where(p => IsMembershipInGym(p) && p.PaymentMethod?.MethodName == "Cash")
            .Sum(p => p.AmountLKR);
        var membershipInGymCard = list
            .Where(p => IsMembershipInGym(p) && p.PaymentMethod?.MethodName == "Card")
            .Sum(p => p.AmountLKR);
        var membershipGateway = list.Where(IsMembershipGateway).Sum(p => p.AmountLKR);
        var posCash = list
            .Where(p => p.PaymentPurpose == "POS" && p.PaymentMethod?.MethodName == "Cash")
            .Sum(p => p.AmountLKR);
        var posCard = list
            .Where(p => p.PaymentPurpose == "POS" && p.PaymentMethod?.MethodName == "Card")
            .Sum(p => p.AmountLKR);
        var sessionGateway = list.Where(p => p.PaymentPurpose == "SpecialSession").Sum(p => p.AmountLKR);
        var total = membershipInGymCash + membershipInGymCard + membershipGateway + posCash + posCard + sessionGateway;

        return new RevenueBreakdown(
            membershipInGymCash,
            membershipInGymCard,
            membershipGateway,
            posCash,
            posCard,
            sessionGateway,
            total);
    }

    private static IReadOnlyList<DailyRevenueDto> BuildDailyRevenueForMonth(
        IEnumerable<Payment> payments,
        int year,
        int month)
    {
        var daysInMonth = DateTime.DaysInMonth(year, month);
        var paymentList = payments.ToList();
        var rows = new List<DailyRevenueDto>();

        for (var day = 1; day <= daysInMonth; day++)
        {
            var colomboDate = new DateTime(year, month, day);
            var (startUtc, endUtc) = ProfileHelper.GetAppDayUtcRange(colomboDate);
            var dayPayments = paymentList.Where(p =>
            {
                var when = p.PaidAt ?? p.CreatedAt;
                return when >= startUtc && when < endUtc;
            });
            var breakdown = CalculateRevenueBreakdown(dayPayments);
            rows.Add(new DailyRevenueDto(
                colomboDate,
                breakdown.Total,
                breakdown.MembershipInGymCash,
                breakdown.MembershipInGymCard,
                breakdown.MembershipGateway,
                breakdown.PosCash,
                breakdown.PosCard,
                breakdown.SessionGateway));
        }

        return rows;
    }

    private async Task<IReadOnlyList<RecentTransactionDto>> BuildRecentTransactionsAsync(
        int take = 25,
        DateTime? monthStart = null,
        DateTime? monthEnd = null)
    {
        var completed = await db.PaymentStatuses.FirstAsync(s => s.StatusName == "Completed");
        var query = db.Payments
            .Include(p => p.PaymentMethod)
            .Include(p => p.Member).ThenInclude(m => m!.User)
            .Where(p => p.PaymentStatusId == completed.PaymentStatusId);

        if (monthStart.HasValue && monthEnd.HasValue)
        {
            query = query.Where(p =>
                (p.PaidAt ?? p.CreatedAt) >= monthStart.Value &&
                (p.PaidAt ?? p.CreatedAt) < monthEnd.Value);
        }

        var payments = await query
            .OrderByDescending(p => p.PaidAt ?? p.CreatedAt)
            .Take(take)
            .ToListAsync();

        var paymentIds = payments.Select(p => p.PaymentId).ToList();
        var orders = await db.Orders
            .Where(o => o.PaymentId != null && paymentIds.Contains(o.PaymentId.Value))
            .ToDictionaryAsync(o => o.PaymentId!.Value);

        return payments
            .Select(p => MapTransaction(p, orders.GetValueOrDefault(p.PaymentId)))
            .ToList();
    }

    private static RecentTransactionDto MapTransaction(Payment payment, Order? order)
    {
        var method = payment.PaymentMethod.MethodName;
        var memberName = payment.Member?.User is { } user
            ? $"{user.FirstName} {user.LastName}".Trim()
            : "Guest";

        string category;
        string description;

        if (IsMembershipInGym(payment))
        {
            category = method == "Card"
                ? "Membership Fees at Gym (Card)"
                : "Membership Fees at Gym (Cash)";
            description = $"In-gym membership renewal — {memberName}";
        }
        else if (IsMembershipGateway(payment))
        {
            category = "Membership (Payment Gateway)";
            description = $"Online membership — {memberName}";
        }
        else if (payment.PaymentPurpose == "POS")
        {
            category = method == "Card" ? "In-Gym POS (Card)" : "In-Gym POS (Cash)";
            description = order is not null
                ? $"POS sale {order.OrderReference}"
                : "In-gym merchandise sale";
        }
        else if (payment.PaymentPurpose == "SpecialSession")
        {
            category = "Session Fees (Payment Gateway)";
            description = $"Special session enrollment — {memberName}";
        }
        else
        {
            category = payment.PaymentPurpose;
            description = payment.PaymentReference;
        }

        return new RecentTransactionDto(
            payment.PaymentId,
            payment.PaymentReference,
            category,
            description,
            payment.AmountLKR,
            payment.PaidAt ?? payment.CreatedAt,
            "Completed");
    }

    private sealed record RevenueBreakdown(
        decimal MembershipInGymCash,
        decimal MembershipInGymCard,
        decimal MembershipGateway,
        decimal PosCash,
        decimal PosCard,
        decimal SessionGateway,
        decimal Total);
}

public class PublicContentService(AppDbContext db) : IPublicContentService
{
    public async Task<IReadOnlyList<TrainerDto>> GetTrainersAsync() =>
        await db.Trainers.Where(t => t.IsActive)
            .OrderBy(t => t.DisplayOrder)
            .Select(t => new TrainerDto(t.TrainerId, t.FullName, t.Title, t.Bio, t.Specializations))
            .ToListAsync();

    public async Task SubmitContactAsync(ContactRequest request)
    {
        db.ContactMessages.Add(new ContactMessage
        {
            FullName = request.FullName.Trim(),
            Email = request.Email.Trim(),
            Phone = request.Phone?.Trim(),
            Subject = string.IsNullOrWhiteSpace(request.Subject) ? "Website inquiry" : request.Subject.Trim(),
            Message = request.Message.Trim(),
            SubmittedAt = AppTime.Now()
        });
        await db.SaveChangesAsync();
    }

    public async Task<IReadOnlyList<VisitorInquiryDto>> GetVisitorInquiriesAsync() =>
        await db.ContactMessages
            .AsNoTracking()
            .OrderByDescending(m => m.SubmittedAt)
            .Select(m => new VisitorInquiryDto(
                m.ContactMessageId,
                m.FullName,
                m.Email,
                m.Phone,
                m.Message,
                m.SubmittedAt))
            .ToListAsync();
}
