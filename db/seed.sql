INSERT INTO customer
(id, identityCard, firstName, lastName, email, phone, address, isActive)
VALUES
(1, '1102456789', 'Anderson', 'Jimenez', 'anderson.e@gmail.com', '0988888888', 'Casa', 0),
(9, '1104689234', 'Anderson', 'Jimenez', 'anderson.jimenez@gmail.com', '0998765432', 'Av. Universitaria y Bolívar', 1),
(10, '0102345678', 'María', 'Loja', NULL, NULL, NULL, 1),
(14, '0923456789', NULL, NULL, 'cliente.simple@gmail.com', '0971234567', NULL, 1),
(15, '1712345678', 'Pedro', 'Castillo', 'pedro.castillo@gmail.com', '0965554433', NULL, 0),
(16, '1109998887', 'Luisa', 'Mendoza', 'luisa.mendoza@gmail.com', '0954443322', 'Centro histórico', 1),
(17, '1109978887', 'Luis', 'Mendoza', 'luisa.mendoza@gmail.com', '0954446322', 'Centro histórico', 1);

INSERT INTO product
(id, description, stock, priceCents, discountCents, isActive, createdAt, sku, name)
VALUES
(1, 'Laptop i5 16GB RAM 512GB SSD', 28, 135000, 5000, 0, '2026-02-07 18:31:11.873148', 'SKU-LAPTOP-001', 'Laptop Lenovo (Actualizada)'),
(2, 'Mouse inalámbrico', 100, 1599, 0, 1, '2026-02-07 18:31:30.061215', 'SKU-MOUSE-001', 'Mouse inalámbrico');

INSERT INTO `order`
(id, customerId, totalCents, createdAt, cantProducts, nroOrder)
VALUES
(1, 1, 270000, '2026-02-08 20:57:41.578484', 2, 'ORD-0602261574');

INSERT INTO order_items
(id, orderId, productId, qty, unitPriceCents, subtotalCents)
VALUES
(1, 1, 1, 2, 135000, 270000);


INSERT INTO order_product
(orderId, productId)
VALUES
(1, 1);
