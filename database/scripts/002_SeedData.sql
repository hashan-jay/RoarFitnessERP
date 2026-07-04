USE RoarFitnessERPDB;
GO

-- Roles
INSERT INTO Roles (RoleName, Description) VALUES
(N'Admin', N'System administrator'),
(N'Member', N'Gym member'),
(N'Instructor', N'Gym instructor');

-- Lookup data
INSERT INTO MembershipPackageTypes (TypeName, Description) VALUES
(N'Monthly', N'1 month membership'),
(N'Quarterly', N'3 month membership'),
(N'Annual', N'12 month membership');

INSERT INTO PaymentMethods (MethodName) VALUES
(N'PayHere'), (N'Cash'), (N'Card');

INSERT INTO PaymentStatuses (StatusName) VALUES
(N'Pending'), (N'Completed'), (N'Failed'), (N'Refunded');

INSERT INTO OrderStatuses (StatusName) VALUES
(N'PendingPayment'), (N'Paid'), (N'ReadyForCollection'), (N'Collected'), (N'Cancelled');

INSERT INTO ProductCategories (CategoryName, Description) VALUES
(N'Supplements', N'Protein, pre-workout, vitamins'),
(N'Merchandise', N'Gym apparel and accessories');

-- Packages (Roar Fitness Colombo)
INSERT INTO MembershipPackages (PackageTypeId, PackageName, Description, DurationDays, PriceLKR) VALUES
(1, N'Starter Monthly', N'Full gym access, locker, basic orientation', 30, 8500.00),
(2, N'Power Quarterly', N'Full access + 2 PT sessions/month', 90, 22000.00),
(3, N'Roar Annual Elite', N'Unlimited access + nutrition consult + merch discount', 365, 75000.00);

-- Default admin (password: Admin@123 - change in production)
INSERT INTO Users (Email, PasswordHash, FirstName, LastName, Phone, IsActive)
VALUES (N'admin@roarfitness.lk', N'$2a$11$PLACEHOLDER_HASH', N'System', N'Administrator', N'+94771234567', 1);

INSERT INTO UserRoles (UserId, RoleId) VALUES (1, 1);

-- Public trainers
INSERT INTO Trainers (FullName, Title, Bio, Specializations, DisplayOrder) VALUES
(N'Dilshan Perera', N'Head Coach', N'15 years strength & conditioning experience.', N'Strength, HIIT', 1),
(N'Amaya Fernando', N'Yoga & Mobility', N'Certified yoga instructor focused on recovery.', N'Yoga, Mobility', 2),
(N'Ravindu Silva', N'Boxing Coach', N'Former national amateur boxer.', N'Boxing, Cardio', 3);

-- Sample products
INSERT INTO Products (CategoryId, SKU, ProductName, Description, UnitPriceLKR, IsAvailableOnline) VALUES
(1, N'SUP-WHEY-1KG', N'Roar Whey Protein 1kg', N'Premium whey isolate', 12500.00, 1),
(1, N'SUP-PRE-300G', N'Roar Pre-Workout 300g', N'Energy and focus blend', 6500.00, 1),
(2, N'MER-TSHIRT-M', N'Roar Fitness T-Shirt (M)', N'Black cotton tee with logo', 3500.00, 1),
(2, N'MER-HOODIE-L', N'Roar Hoodie (L)', N'Premium black hoodie', 7500.00, 1);

INSERT INTO InventoryItems (ProductId, QuantityOnHand, ReorderLevel) VALUES
(1, 50, 10), (2, 30, 8), (3, 40, 10), (4, 25, 5);
GO
