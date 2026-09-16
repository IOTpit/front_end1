// src/pages/DataSensor.jsx - Dữ liệu cảm biến chuẩn 100% bản thiết kế Figma
import React, { useState, useEffect } from 'react';
import { getSensorData } from '../services/api';
import { getSocket } from '../services/socket';

export default function DataSensor() {
  const [data, setData] = useState([]);
  const [meta, setMeta] = useState({ current_page: 1, total_pages: 1, total_records: 0 });
  const [loading, setLoading] = useState(false);

  // Filters & Pagination
  const [page, setPage] = useState(1);
  const [sensorTypeFilter, setSensorTypeFilter] = useState('all');
  const [timeSearch, setTimeSearch] = useState('');
  const [sortBy, setSortBy] = useState('time');
  const [order, setOrder] = useState('desc');

  const fetchData = async (isSilent = false) => {
    if (!isSilent) setLoading(true);
    try {
      const res = await getSensorData({
        page,
        limit: 50,
        sensorType: sensorTypeFilter,
        timeSearch,
        sortBy,
        order,
      });
      if (res.data) {
        setData(res.data);
      }
      if (res.meta) {
        setMeta(res.meta);
      }
    } catch (err) {
      console.error('Lỗi nạp dữ liệu cảm biến:', err);
    } finally {
      if (!isSilent) setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(false);
  }, [page, sortBy, order, timeSearch, sensorTypeFilter]);

  // Realtime Socket.IO listener (Cập nhật ngầm mượt mà không nhấp nháy trang)
  useEffect(() => {
    const socket = getSocket();
    const handleRealtime = () => {
      if (page === 1 && !timeSearch) {
        fetchData(true);
      }
    };

    socket.on('sensor_data', handleRealtime);
    socket.on('SENSOR_UPDATE', handleRealtime);

    return () => {
      socket.off('sensor_data', handleRealtime);
      socket.off('SENSOR_UPDATE', handleRealtime);
    };
  }, [page, timeSearch, sensorTypeFilter, sortBy, order]);

  const handleSortToggle = (col) => {
    if (sortBy === col) {
      setOrder(order === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(col);
      setOrder('desc');
    }
    setPage(1);
  };

  const formatDateTime = (iso) => {
    if (!iso) return '2023/10/27 14:32:05';
    const d = new Date(iso);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    const hh = String(d.getHours()).padStart(2, '0');
    const min = String(d.getMinutes()).padStart(2, '0');
    const ss = String(d.getSeconds()).padStart(2, '0');
    return `${yyyy}/${mm}/${dd} ${hh}:${min}:${ss}`;
  };

  // Lọc tức thì trên dữ liệu hiện có
  const filteredData = data.filter((row) => {
    // 1. Lọc theo loại cảm biến
    if (sensorTypeFilter !== 'all') {
      const rowType = (row.type || '').toLowerCase();
      const devName = (row.device || `Cảm biến ${row.sensor_name}` || '').toLowerCase();
      if (rowType !== sensorTypeFilter && !devName.includes(sensorTypeFilter)) {
        return false;
      }
    }
    // 2. Lọc theo thời gian (timeSearch)
    if (timeSearch && timeSearch.trim()) {
      const q = timeSearch.trim().toLowerCase();
      const formattedTime = formatDateTime(row.time).toLowerCase();
      const rawIso = row.time ? String(row.time).toLowerCase() : '';
      const slashTime = formattedTime.replace(/\//g, '-');
      if (!formattedTime.includes(q) && !rawIso.includes(q) && !slashTime.includes(q)) {
        return false;
      }
    }
    return true;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Page Header matching Figma */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h2 style={{ fontSize: '32px', fontWeight: 800, color: '#151c27', letterSpacing: '-0.5px' }}>
            Dữ liệu cảm biến
          </h2>
          <p style={{ fontSize: '14px', color: '#555f6f', marginTop: '4px' }}>
            Theo dõi và quản lý dữ liệu chi tiết từ hệ thống cảm biến môi trường.
          </p>
        </div>

        {/* Dropdown bộ lọc & Ô tìm kiếm thời gian */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          {/* Dropdown lọc loại cảm biến */}
          <select
            className="figma-select"
            value={sensorTypeFilter}
            onChange={(e) => {
              setSensorTypeFilter(e.target.value);
              setPage(1);
            }}
          >
            <option value="all">Tất cả cảm biến</option>
            <option value="temperature">Cảm biến Nhiệt độ</option>
            <option value="humidity">Cảm biến Độ ẩm</option>
            <option value="light">Cảm biến Ánh sáng</option>
          </select>

          {/* Ô TÌM KIẾM THEO THỜI GIAN */}
          <div style={{ position: 'relative', width: '230px' }}>
            <span
              className="material-symbols-outlined"
              style={{
                position: 'absolute',
                left: '10px',
                top: '50%',
                transform: 'translateY(-50%)',
                fontSize: '18px',
                color: timeSearch ? '#d32f2f' : '#8a94a6',
              }}
            >
              schedule
            </span>
            <input
              type="text"
              className="figma-input"
              placeholder="Tìm theo thời gian..."
              value={timeSearch}
              onChange={(e) => {
                setTimeSearch(e.target.value);
                setPage(1);
              }}
              style={{
                paddingLeft: '34px',
                paddingRight: timeSearch ? '28px' : '12px',
                borderColor: timeSearch ? '#d32f2f' : '#e5e7eb',
                backgroundColor: timeSearch ? '#fff8f8' : '#ffffff',
              }}
            />
            {timeSearch && (
              <button
                type="button"
                onClick={() => {
                  setTimeSearch('');
                  setPage(1);
                }}
                style={{
                  position: 'absolute',
                  right: '8px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: '#8a94a6',
                  display: 'flex',
                  alignItems: 'center',
                  padding: 0,
                }}
                title="Xóa tìm kiếm thời gian"
              >
                <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>
                  cancel
                </span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Data Table Card matching Figma image6.png */}
      <div className="figma-card" style={{ overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table className="figma-table">
            <thead>
              <tr>
                <th style={{ width: '100px', cursor: 'pointer' }} onClick={() => handleSortToggle('id')}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <span>ID</span>
                    <span className="material-symbols-outlined" style={{ fontSize: '16px', color: '#8a94a6' }}>
                      swap_vert
                    </span>
                  </div>
                </th>
                <th style={{ cursor: 'pointer' }} onClick={() => handleSortToggle('device')}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <span>Thiết bị</span>
                    <span className="material-symbols-outlined" style={{ fontSize: '16px', color: '#8a94a6' }}>
                      swap_vert
                    </span>
                  </div>
                </th>
                <th style={{ cursor: 'pointer' }} onClick={() => handleSortToggle('value')}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <span>Giá trị</span>
                    <span className="material-symbols-outlined" style={{ fontSize: '16px', color: '#8a94a6' }}>
                      swap_vert
                    </span>
                  </div>
                </th>
                <th style={{ cursor: 'pointer' }} onClick={() => handleSortToggle('time')}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <span>Thời gian</span>
                    <span className="material-symbols-outlined" style={{ fontSize: '16px', color: '#8a94a6' }}>
                      arrow_downward
                    </span>
                  </div>
                </th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="4" style={{ textAlign: 'center', padding: '40px', color: '#555f6f' }}>
                    Đang tải dữ liệu...
                  </td>
                </tr>
              ) : filteredData.length === 0 ? (
                <tr>
                  <td colSpan="4" style={{ textAlign: 'center', padding: '40px', color: '#8a94a6' }}>
                    Không tìm thấy bản ghi nào khớp với điều kiện lọc.
                  </td>
                </tr>
              ) : (
                filteredData.map((row) => (
                  <tr key={row.id}>
                    <td style={{ fontWeight: 600, color: '#d32f2f' }}>
                      #{row.id}
                    </td>
                    <td>{row.device || `Cảm biến ${row.sensor_name}`}</td>
                    <td style={{ fontWeight: 600 }}>
                      {row.value} {row.unit}
                    </td>
                    <td style={{ color: '#555f6f', fontFamily: 'monospace' }}>
                      {formatDateTime(row.time)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer matching Figma */}
        {(() => {
          const limit = 50;
          const isFiltering = Boolean((timeSearch && timeSearch.trim()) || sensorTypeFilter !== 'all');
          const totalRecords = isFiltering ? filteredData.length : (meta.total_records || data.length);
          const totalPages = Math.max(1, Math.ceil(totalRecords / limit) || 1);
          const startRecord = totalRecords === 0 ? 0 : (page - 1) * limit + 1;
          const endRecord = Math.min(page * limit, totalRecords);

          const getPageNumbers = () => {
            if (totalPages <= 5) {
              return Array.from({ length: totalPages }, (_, i) => i + 1);
            }
            const pages = [];
            pages.push(1);

            if (page > 3) {
              pages.push('...');
            }

            const start = Math.max(2, page - 1);
            const end = Math.min(totalPages - 1, page + 1);

            for (let i = start; i <= end; i++) {
              pages.push(i);
            }

            if (page < totalPages - 2) {
              pages.push('...');
            }

            if (totalPages > 1) {
              pages.push(totalPages);
            }

            return pages;
          };

          return (
            <div
              style={{
                padding: '14px 20px',
                borderTop: '1px solid #e5e7eb',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '12px',
              }}
            >
              <span style={{ fontSize: '13px', color: '#555f6f' }}>
                Showing <b>{startRecord}-{endRecord}</b> of <b>{totalRecords}</b> records
              </span>

              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <button
                  className="page-btn"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  title="Trang trước"
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>
                    chevron_left
                  </span>
                </button>

                {getPageNumbers().map((item, idx) => {
                  if (item === '...') {
                    return (
                      <span key={`dots-${idx}`} style={{ color: '#8a94a6', margin: '0 4px', userSelect: 'none' }}>
                        ...
                      </span>
                    );
                  }
                  const isCurrent = item === page;
                  return (
                    <button
                      key={item}
                      className={`page-btn ${isCurrent ? 'page-btn-active' : ''}`}
                      onClick={() => setPage(item)}
                    >
                      {item}
                    </button>
                  );
                })}

                <button
                  className="page-btn"
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  title="Trang sau"
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>
                    chevron_right
                  </span>
                </button>
              </div>
            </div>
          );
        })()}
      </div>
    </div>
  );
}
