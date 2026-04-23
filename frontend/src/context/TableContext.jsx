import React, { createContext, useContext, useState, useEffect } from 'react';

const TableContext = createContext();

export function TableProvider({ children }) {
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(true);

  // Khởi tạo bàn từ API và kết hợp với dữ liệu đã lưu trong localStorage
  useEffect(() => {
    const fetchTables = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/pos/tables');
        const dbTables = await response.json();
        
        if (!Array.isArray(dbTables)) {
          console.error('API did not return an array of tables');
          setLoading(false);
          return;
        }

        const saved = localStorage.getItem('cafe_tables_v2');
        const savedTables = saved ? JSON.parse(saved) : [];

        // Kết hợp dữ liệu: lấy TenBan, LaBanMangVe từ DB, nhưng giữ Cart, DaThanhToan từ LocalStorage
        let combinedTables = dbTables.map(dbT => {
          const savedT = Array.isArray(savedTables) ? savedTables.find(s => s.MaBan === dbT.MaBan) : null;
          return {
            ...dbT,
            Cart: savedT ? (savedT.Cart || []) : [],
            DaThanhToan: savedT ? !!savedT.DaThanhToan : false,
            HienThi: savedT ? (savedT.HienThi !== undefined ? savedT.HienThi : true) : true,
            TrangThai: (savedT && savedT.Cart && savedT.Cart.length > 0) ? 'DangPhucVu' : dbT.TrangThai
          };
        });

        // Đảm bảo luôn có 1 bàn "Mang về" ảo với MaBan = 0
        if (!combinedTables.find(t => t.LaBanMangVe || t.TenBan === 'Mang về')) {
          const savedMangVe = Array.isArray(savedTables) ? savedTables.find(s => s.MaBan === 0) : null;
          combinedTables.unshift({
            MaBan: 0,
            TenBan: 'Mang về',
            LaBanMangVe: true,
            HienThi: true,
            TrangThai: (savedMangVe && savedMangVe.Cart && savedMangVe.Cart.length > 0) ? 'DangPhucVu' : 'Trong',
            Cart: savedMangVe ? (savedMangVe.Cart || []) : [],
            DaThanhToan: savedMangVe ? !!savedMangVe.DaThanhToan : false
          });
        } else {
            // Nếu đã có từ DB, đảm bảo nó có MaBan = 0 để dễ xử lý logic null sau này
            combinedTables = combinedTables.map(t => (t.LaBanMangVe || t.TenBan === 'Mang về') ? { ...t, MaBan: 0, LaBanMangVe: true } : t);
        }

        setTables(combinedTables);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching tables:', error);
        setLoading(false);
      }
    };
    fetchTables();
  }, []);

  // Lưu lại vào localStorage mỗi khi tables thay đổi
  useEffect(() => {
    if (!loading && tables.length > 0) {
      localStorage.setItem('cafe_tables_v2', JSON.stringify(tables));
    }
  }, [tables, loading]);

  const updateTables = (newTables) => {
    setTables(newTables);
  };

  return (
    <TableContext.Provider value={{ tables, setTables: updateTables, loading }}>
      {children}
    </TableContext.Provider>
  );
}

export const useTables = () => useContext(TableContext);
