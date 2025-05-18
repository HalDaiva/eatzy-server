
# --------- MIGRATION 3 ---------

START TRANSACTION;

# ADD ALTER TABLE USER

ALTER TABLE users
    ADD COLUMN is_verified BOOLEAN DEFAULT FALSE,
    ADD COLUMN otp_code VARCHAR(10) NULL,
    ADD COLUMN otp_expired_at DATETIME NULL;

# CHANGE DATA TYPE

ALTER TABLE menus
    CHANGE `menu_image` `menu_image` TEXT NULL;

# MAKE NULLABLE

ALTER TABLE order_items
    CHANGE `item_details` `item_details` TEXT NULL;


ALTER TABLE orders
    CHANGE `order_time` `order_time` TIMESTAMP NULL;

ALTER TABLE orders
    CHANGE `estimation_time` `estimation_time` INT NULL;

# ADD DEFAULT VALUE

ALTER TABLE orders
    CHANGE `order_status` `order_status` ENUM('in_cart','waiting','processing','finished','canceled') NOT NULL DEFAULT 'in_cart';

ALTER TABLE orders
    CHANGE `total_price` `total_price` DECIMAL(10, 2) NOT NULL DEFAULT 0.00;

ALTER TABLE addons
    CHANGE `addon_price` `addon_price` DECIMAL(10, 2) NOT NULL DEFAULT 0.00;

ALTER TABLE menus
    CHANGE `menu_price` `menu_price` DECIMAL(10, 2) NOT NULL DEFAULT 0.00;

ALTER TABLE addon_categories
    CHANGE `is_multiple_choice` `is_multiple_choice` TINYINT(1) NOT NULL DEFAULT 1;

ALTER TABLE menus
    CHANGE `menu_is_available` `menu_is_available` TINYINT(1) NOT NULL DEFAULT 1;

ALTER TABLE canteens
    CHANGE `canteen_is_open` `canteen_is_open` TINYINT(1) NOT NULL DEFAULT 1;

ALTER TABLE addons
    CHANGE `addon_is_available` `addon_is_available` TINYINT(1) NOT NULL DEFAULT 1;

COMMIT;