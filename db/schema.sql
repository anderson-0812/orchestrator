CREATE DATABASE `orchestrator` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;

CREATE TABLE `customer` (
  `id` int NOT NULL AUTO_INCREMENT,
  `identityCard` varchar(25) DEFAULT NULL,
  `firstName` varchar(100) NOT NULL DEFAULT '',
  `lastName` varchar(100) NOT NULL DEFAULT '',
  `email` varchar(200) DEFAULT NULL,
  `phone` varchar(22) DEFAULT NULL,
  `address` varchar(150) DEFAULT NULL,
  `isActive` tinyint NOT NULL DEFAULT '1',
  PRIMARY KEY (`id`),
  UNIQUE KEY `IDX_dccf385a668111a4f08c88e03f` (`identityCard`),
  UNIQUE KEY `IDX_fdb2f3ad8115da4c7718109a6e` (`email`),
  UNIQUE KEY `IDX_03846b4bae9df80f19c76005a8` (`phone`)
) ENGINE=InnoDB AUTO_INCREMENT=18 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


CREATE TABLE `idempotency_keys` (
  `key` varchar(255) NOT NULL,
  `targetType` varchar(50) NOT NULL,
  `targetId` int DEFAULT NULL,
  `status` varchar(50) NOT NULL,
  `responseBody` text,
  `createdAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `expiresAt` timestamp NOT NULL,
  `isActive` int NOT NULL DEFAULT '1',
  PRIMARY KEY (`key`),
  KEY `IDX_fdb53d6e57613380f47ee8a669` (`isActive`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `product` (
  `id` int NOT NULL AUTO_INCREMENT,
  `description` varchar(200) NOT NULL DEFAULT '',
  `stock` int NOT NULL DEFAULT '0',
  `priceCents` int NOT NULL DEFAULT '0',
  `discountCents` int NOT NULL DEFAULT '0',
  `isActive` tinyint NOT NULL DEFAULT '1',
  `createdAt` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `sku` varchar(40) NOT NULL DEFAULT '',
  `name` varchar(100) NOT NULL DEFAULT '',
  PRIMARY KEY (`id`),
  UNIQUE KEY `IDX_34f6ca1cd897cc926bdcca1ca3` (`sku`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `order` (
  `id` int NOT NULL AUTO_INCREMENT,
  `status` int NOT NULL DEFAULT '100',
  `customerId` int NOT NULL,
  `totalCents` int NOT NULL DEFAULT '0',
  `createdAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `cantProducts` int NOT NULL DEFAULT '0',
  `nroOrder` varchar(20) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `IDX_7a9573d6a1fb982772a9123320` (`status`),
  KEY `IDX_124456e637cca7a415897dce65` (`customerId`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `order_items` (
  `id` int NOT NULL AUTO_INCREMENT,
  `orderId` int NOT NULL,
  `productId` int NOT NULL,
  `qty` int NOT NULL,
  `unitPriceCents` int NOT NULL,
  `subtotalCents` int NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `IDX_5dc4f4cfd0b2c11447acab8352` (`orderId`,`productId`),
  KEY `FK_cdb99c05982d5191ac8465ac010` (`productId`),
  CONSTRAINT `FK_cdb99c05982d5191ac8465ac010` FOREIGN KEY (`productId`) REFERENCES `product` (`id`),
  CONSTRAINT `FK_f1d359a55923bb45b057fbdab0d` FOREIGN KEY (`orderId`) REFERENCES `order` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `order_product` (
  `id` int NOT NULL AUTO_INCREMENT,
  `orderId` int NOT NULL,
  `productId` int NOT NULL,
  `quantity` int NOT NULL,
  `price` decimal(12,2) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `IDX_e5607973360ec57e94f2171bc3` (`orderId`,`productId`),
  KEY `FK_073c85ed133e05241040bd70f02` (`productId`),
  CONSTRAINT `FK_073c85ed133e05241040bd70f02` FOREIGN KEY (`productId`) REFERENCES `product` (`id`),
  CONSTRAINT `FK_3fb066240db56c9558a91139431` FOREIGN KEY (`orderId`) REFERENCES `order` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

