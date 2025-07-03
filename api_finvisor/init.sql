CREATE DATABASE IF NOT EXISTS finvisor_test;
CREATE USER IF NOT EXISTS 'finvisor'@'%' IDENTIFIED BY '@finvisor@santralsoftware@';
GRANT ALL PRIVILEGES ON finvisor_test.* TO 'finvisor'@'%';
FLUSH PRIVILEGES;
