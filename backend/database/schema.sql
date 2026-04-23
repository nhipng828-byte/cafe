-- Tạo cơ sở dữ liệu nếu chưa có
CREATE DATABASE IF NOT EXISTS cafe_management CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE cafe_management;

-- 1. Bảng Nhân viên
CREATE TABLE IF NOT EXISTS NhanVien (
    MaNV INT AUTO_INCREMENT PRIMARY KEY,
    TenNV VARCHAR(100) NOT NULL,
    SDT VARCHAR(20),
    ChucVu ENUM('Admin', 'NhanVien') DEFAULT 'NhanVien',
    Username VARCHAR(50) UNIQUE NOT NULL,
    Password VARCHAR(255) NOT NULL,
    TrangThai ENUM('Active', 'Inactive') DEFAULT 'Active'
);

-- Thêm tài khoản admin mặc định (password: admin123, mã hóa bởi ứng dụng sau, ở đây dùng tạm một hash hoặc khởi tạo qua API)
-- Lưu ý: Bạn cần dùng API để tạo mật khẩu hash chuẩn bcrypt. Tạm thời mình sẽ để trống mật khẩu thật.

-- 2. Bảng Bàn
CREATE TABLE IF NOT EXISTS Ban (
    MaBan INT AUTO_INCREMENT PRIMARY KEY,
    TenBan VARCHAR(50) NOT NULL,
    LaBanMangVe BOOLEAN DEFAULT FALSE,
    TrangThai ENUM('Trong', 'DangPhucVu', 'NgungSuDung') DEFAULT 'Trong'
);

-- Thêm bàn "Mang về" mặc định
INSERT INTO Ban (TenBan, LaBanMangVe, TrangThai) VALUES ('Mang về', TRUE, 'Trong') ON DUPLICATE KEY UPDATE TenBan=TenBan;

-- 3. Bảng Sản phẩm
CREATE TABLE IF NOT EXISTS SanPham (
    MaSP INT AUTO_INCREMENT PRIMARY KEY,
    TenSP VARCHAR(255) NOT NULL,
    DonGia DECIMAL(15, 2) NOT NULL,
    TrangThai ENUM('Active', 'Inactive') DEFAULT 'Active'
);

-- 4. Bảng Khuyến mại
CREATE TABLE IF NOT EXISTS KhuyenMai (
    MaKM INT AUTO_INCREMENT PRIMARY KEY,
    TenKM VARCHAR(255) NOT NULL,
    NgayBatDau DATETIME NOT NULL,
    NgayKetThuc DATETIME NOT NULL,
    ChietKhau DECIMAL(5, 2) NOT NULL COMMENT 'Phần trăm chiết khấu (0-100)',
    TrangThai ENUM('Active', 'Inactive') DEFAULT 'Active'
);

-- 5. Bảng Nhà cung cấp
CREATE TABLE IF NOT EXISTS NhaCungCap (
    MaNCC INT AUTO_INCREMENT PRIMARY KEY,
    TenNCC VARCHAR(255) NOT NULL,
    SDT VARCHAR(20),
    DiaChi TEXT,
    TrangThai ENUM('Active', 'Inactive') DEFAULT 'Active'
);

-- 6. Bảng Nguyên vật liệu
CREATE TABLE IF NOT EXISTS NguyenVatLieu (
    MaNVL INT AUTO_INCREMENT PRIMARY KEY,
    TenNVL VARCHAR(255) NOT NULL,
    DonViTinh VARCHAR(50) NOT NULL,
    DonGiaTrungBinh DECIMAL(15, 2) DEFAULT 0,
    SoLuongTon DECIMAL(15, 3) DEFAULT 0,
    TrangThai ENUM('Active', 'Inactive') DEFAULT 'Active'
);

-- 7. Bảng Công thức
CREATE TABLE IF NOT EXISTS CongThuc (
    MaSP INT,
    MaNVL INT,
    DinhLuong DECIMAL(15, 3) NOT NULL,
    PRIMARY KEY (MaSP, MaNVL),
    FOREIGN KEY (MaSP) REFERENCES SanPham(MaSP),
    FOREIGN KEY (MaNVL) REFERENCES NguyenVatLieu(MaNVL)
);

-- 8. Bảng Hóa đơn
CREATE TABLE IF NOT EXISTS HoaDon (
    MaHD INT AUTO_INCREMENT PRIMARY KEY,
    ThoiGian DATETIME DEFAULT CURRENT_TIMESTAMP,
    MaNV INT,
    MaBan INT,
    MaKM INT NULL,
    TongTien DECIMAL(15, 2) NOT NULL DEFAULT 0,
    TienGiam DECIMAL(15, 2) NOT NULL DEFAULT 0,
    TienKhachTra DECIMAL(15, 2) NOT NULL DEFAULT 0,
    TrangThai ENUM('DaThanhToan', 'DaHuy') DEFAULT 'DaThanhToan',
    FOREIGN KEY (MaNV) REFERENCES NhanVien(MaNV),
    FOREIGN KEY (MaBan) REFERENCES Ban(MaBan),
    FOREIGN KEY (MaKM) REFERENCES KhuyenMai(MaKM)
);

-- 9. Bảng Chi tiết hóa đơn
CREATE TABLE IF NOT EXISTS ChiTietHoaDon (
    MaHD INT,
    MaSP INT,
    SoLuong INT NOT NULL,
    DonGia DECIMAL(15, 2) NOT NULL,
    PRIMARY KEY (MaHD, MaSP),
    FOREIGN KEY (MaHD) REFERENCES HoaDon(MaHD),
    FOREIGN KEY (MaSP) REFERENCES SanPham(MaSP)
);

-- 10. Bảng Phiếu nhập kho
CREATE TABLE IF NOT EXISTS PhieuNhapKho (
    MaPN INT AUTO_INCREMENT PRIMARY KEY,
    NgayNhap DATETIME DEFAULT CURRENT_TIMESTAMP,
    MaNV INT,
    MaNCC INT,
    TongTien DECIMAL(15, 2) DEFAULT 0,
    FOREIGN KEY (MaNV) REFERENCES NhanVien(MaNV),
    FOREIGN KEY (MaNCC) REFERENCES NhaCungCap(MaNCC)
);

-- 11. Bảng Chi tiết phiếu nhập
CREATE TABLE IF NOT EXISTS ChiTietPhieuNhap (
    MaPN INT,
    MaNVL INT,
    SoLuong DECIMAL(15, 3) NOT NULL,
    DonGia DECIMAL(15, 2) NOT NULL,
    PRIMARY KEY (MaPN, MaNVL),
    FOREIGN KEY (MaPN) REFERENCES PhieuNhapKho(MaPN),
    FOREIGN KEY (MaNVL) REFERENCES NguyenVatLieu(MaNVL)
);

-- 12. Bảng Phiếu xuất kho
CREATE TABLE IF NOT EXISTS PhieuXuatKho (
    MaPX INT AUTO_INCREMENT PRIMARY KEY,
    NgayXuat DATETIME DEFAULT CURRENT_TIMESTAMP,
    LyDo ENUM('HaoHut', 'Khac') DEFAULT 'HaoHut',
    MaNV INT,
    FOREIGN KEY (MaNV) REFERENCES NhanVien(MaNV)
);

-- 13. Bảng Chi tiết phiếu xuất
CREATE TABLE IF NOT EXISTS ChiTietPhieuXuat (
    MaPX INT,
    MaNVL INT,
    SoLuong DECIMAL(15, 3) NOT NULL,
    PRIMARY KEY (MaPX, MaNVL),
    FOREIGN KEY (MaPX) REFERENCES PhieuXuatKho(MaPX),
    FOREIGN KEY (MaNVL) REFERENCES NguyenVatLieu(MaNVL)
);
