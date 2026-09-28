CREATE DATABASE IF NOT EXISTS venue_booking_db;
USE venue_booking_db;

CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL,
    department VARCHAR(100),
    phone VARCHAR(20)
);

CREATE TABLE IF NOT EXISTS venues (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    building VARCHAR(255) NOT NULL,
    capacity VARCHAR(100),
    location VARCHAR(255),
    description TEXT,
    available BOOLEAN DEFAULT true
);

CREATE TABLE IF NOT EXISTS bookings (
    id VARCHAR(50) PRIMARY KEY,
    venue VARCHAR(255) NOT NULL,
    building VARCHAR(255) NOT NULL,
    date VARCHAR(50) NOT NULL,
    slot VARCHAR(100) NOT NULL,
    faculty VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    notes TEXT,
    status VARCHAR(50) DEFAULT 'pending'
);
