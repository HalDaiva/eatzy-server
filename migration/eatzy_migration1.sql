
CREATE TABLE menu_categories
(
    menu_category_id   int primary key AUTO_INCREMENT,
    canteen_id         int,
    menu_category_name varchar(100)
);

CREATE TABLE addon_categories
(
    addon_category_id   int primary key AUTO_INCREMENT,
    canteen_id          int,
    addon_category_name varchar(100),
    is_multiple_choice  boolean
);

CREATE TABLE menu_addon_categories
(
    menu_id           int,
    addon_category_id int
);


# DROP FOREIGN KEY & TABLE

ALTER TABLE menus
    DROP FOREIGN KEY fk_menu_category,
    DROP COLUMN category_id;

DROP TABLE categories;

DROP TABLE payments;

ALTER TABLE addons
    DROP FOREIGN KEY fk_addon_menu,
    DROP COLUMN menu_id;

# ADD NEW COLUMN

ALTER TABLE addons
    ADD addon_is_available boolean,
    ADD addon_category_id int;

ALTER TABLE menus
    CHANGE `menu_status` `menu_is_available` TINYINT(1) NOT NULL;

ALTER TABLE menus
    ADD menu_category_id int;

ALTER TABLE canteens
    ADD COLUMN canteen_is_open boolean;

# MODIFY COLUMN

ALTER TABLE orders
    MODIFY COLUMN order_status ENUM('in_cart','waiting','processing','finished','canceled') NOT NULL;

# ADD FOREIGN KEY

ALTER TABLE menu_categories
    ADD FOREIGN KEY (canteen_id) REFERENCES canteens (canteen_id);

ALTER TABLE menu_addon_categories
    ADD FOREIGN KEY (menu_id) REFERENCES menus (menu_id),
    ADD FOREIGN KEY (addon_category_id) REFERENCES addon_categories (addon_category_id);

ALTER TABLE addon_categories
    ADD FOREIGN KEY (canteen_id) REFERENCES canteens (canteen_id);

ALTER TABLE addons
    ADD FOREIGN KEY (addon_category_id) REFERENCES addon_categories (addon_category_id);

ALTER TABLE menus
    ADD FOREIGN KEY (menu_category_id) REFERENCES menu_categories (menu_category_id);
