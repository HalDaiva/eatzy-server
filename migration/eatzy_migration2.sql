ALTER TABLE menus
    CHANGE `preparation_time` `preparation_time` INT NOT NULL;

ALTER TABLE orders
    CHANGE `estimation_time` `estimation_time` INT NOT NULL;