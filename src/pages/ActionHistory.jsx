// src/pages/ActionHistory.jsx - Lịch sử hoạt động chuẩn 100% Figma image7.png
import React, { useState, useEffect } from 'react';
import { getActionHistory } from '../services/api';
import { getSocket } from '../services/socket';

export default function ActionHistory() {
  const [history, setHistory] = useState([]);
  const [meta, setMeta] = useState({ current_page: 1, total_pages: 1, total_records: 0 });
  const [loading, setLoading] = useState(false);

  // Filters & Pagination
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [timeSearch, setTimeSearch] = useState('');
  const [deviceFilter, setDeviceFilter] = useState('all');
  const [actionFilter, setActionFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('time');
  const [order, setOrder] = useState('desc');

  const fetchHistory = async (isSilent = false) => {
    if (!isSilent) setLoading(true);
    try {
      const res = await getActionHistory({
        page,
        limit: 20,
        search,
        timeSearch,
        device: deviceFilter,
        action: actionFilter,
        sortBy,
        order,
      });
      if (res.data) {
        setHistory(res.data);
      }
      if (res.meta) {
        setMeta(res.meta);
      }
    } catch (err) {
      console.error('Lỗi nạp lịch sử:', err);
    } finally {
      if (!isSilent) setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory(false);
  }, [page, deviceFilter, actionFilter, statusFilter, sortBy, order, timeSearch]);

  // Realtime Socket.IO listener (Cập nhật ngầm mượt mà không nhấp nháy trang)
  useEffect(() => {
    const socket = getSocket();
    const handleRealtime = () => {
      if (page === 1 && !timeSearch) {
        fetchHistory(true);
      }
    };

    socket.on('device_status', handleRealtime);
    socket.on('DEVICE_UPDATE', handleRealtime);

    return () => {
      socket.off('device_status', handleRealtime);
      socket.off('DEVICE_UPDATE', handleRealtime);
    };
  }, [page, timeSearch, deviceFilter, actionFilter, statusFilter, sortBy, order]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchHistory();
  };

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

  // Mock template rows if empty matching Figma screenshot
  const mockFigmaRows = [
    { id: 1042, device: 'Quạt trần', action: 'Bật', status: 'SUCCESS', time: '2023/10/27 14:32:05' },
    { id: 1041, device: 'Đèn phòng khách', action: 'Tắt', status: 'FAILED', time: '2023/10/27 14:31:05' },
    { id: 1040, device: 'Điều hòa', action: 'Bật', status: 'SUCCESS', time: '2023/10/27 14:30:05' },
    { id: 1039, device: 'Đèn ban công', action: 'Tắt', status: 'SUCCESS', time: '2023/10/27 14:29:05' },
    { id: 1038, device: 'Quạt thông gió', action: 'Bật', status: 'SUCCESS', time: '2023/10/27 14:28:05' },
  ];

  // Lọc tức thì trên dữ liệu hiện có để đảm bảo 0ms phản hồi
  const filteredHistory = history.filter((row) => {
    // 1. Lọc theo thiết bị
    if (deviceFilter !== 'all') {
      const devName = row.device_name || row.device || '';
      if (devName !== deviceFilter && !devName.includes(deviceFilter)) return false;
    }
    // 2. Lọc theo hành động
    if (actionFilter !== 'all') {
      if (row.action !== actionFilter) return false;
    }
    // 3. Lọc theo trạng thái
    if (statusFilter !== 'all') {
      if ((row.status || '').toLowerCase() !== statusFilter.toLowerCase()) return false;
    }
    // 4. Lọc theo thời gian (timeSearch)
    if (timeSearch && timeSearch.trim()) {
      const q = timeSearch.trim().toLowerCase();
      const formattedTime = formatDateTime(row.time).toLowerCase();
      const rawIso = row.time ? String(row.time).toLowerCase() : '';
      const slashTime = formattedTime.replace(/\//g, '-');
      if (!formattedTime.includes(q) && !rawIso.includes(q) && !slashTime.includes(q)) {
        return false;
      }
    }
    // 5. Lọc theo từ khóa chung
    if (search && search.trim()) {
      const q = search.trim().toLowerCase();
      const devName = (row.device_name || row.device || '').toLowerCase();
      const idStr = String(row.id);
      const actStr = (row.action === 'ON' ? 'bật' : 'tắt').toLowerCase();
      if (!devName.includes(q) && !idStr.includes(q) && !actStr.includes(q)) {
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
            Lịch sử hoạt động
          </h2>
          <p style={{ fontSize: '14px', color: '#555f6f', marginTop: '4px' }}>
            Theo dõi và quản lý lịch sử bật tắt của các thiết bị trong hệ thống.
          </p>
        </div>

        {/* Filter Dropdowns & Search Input on Top Right matching Figma image7.png */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          {/* Device select */}
          <select
            className="figma-select"
            value={deviceFilter}
            onChange={(e) => {
              setDeviceFilter(e.target.value);
              setPage(1);
            }}
          >
            <option value="all">Tất cả thiết bị</option>
            <option value="Quạt">Quạt trần</option>
            <option value="Điều hòa">Điều hòa</option>
            <option value="Đèn">Đèn phòng khách</option>
          </select>

          {/* Action select */}
          <select
            className="figma-select"
            value={actionFilter}
            onChange={(e) => {
              setActionFilter(e.target.value);
              setPage(1);
            }}
          >
            <option value="all">Tất cả hành động</option>
            <option value="ON">Bật</option>
            <option value="OFF">Tắt</option>
          </select>

          {/* Status select */}
          <select
            className="figma-select"
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="success">Thành công</option>
            <option value="failed">Thất bại</option>
          </select>

          {/* Ô TÌM KIẾM THEO THỜI GIAN CHUYÊN DỤNG */}
          <div style={{ position: 'relative', width: '210px' }}>
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

      {/* Table Card */}
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
                <th style={{ cursor: 'pointer' }} onClick={() => handleSortToggle('device_name')}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <span>Thiết bị</span>
                    <span className="material-symbols-outlined" style={{ fontSize: '16px', color: '#8a94a6' }}>
                      swap_vert
                    </span>
                  </div>
                </th>
                <th style={{ cursor: 'pointer' }} onClick={() => handleSortToggle('action')}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <span>Hành động</span>
                    <span className="material-symbols-outlined" style={{ fontSize: '16px', color: '#8a94a6' }}>
                      swap_vert
                    </span>
                  </div>
                </th>
                <th style={{ cursor: 'pointer' }} onClick={() => handleSortToggle('status')}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <span>Trạng thái</span>
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
                  <td colSpan="5" style={{ textAlign: 'center', padding: '40px', color: '#555f6f' }}>
                    Đang tải lịch sử...
                  </td>
                </tr>
              ) : filteredHistory.length === 0 ? (
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center', padding: '40px', color: '#8a94a6' }}>
                    Không tìm thấy bản ghi nào khớp với điều kiện lọc.
                  </td>
                </tr>
              ) : (
                filteredHistory.map((row) => {
                  const isSuccess = (row.status || 'SUCCESS').toUpperCase() === 'SUCCESS';
                  const isPending = (row.status || '').toUpperCase() === 'PENDING';
                  const actionText = row.action === 'ON' ? 'Bật' : 'Tắt';
                  return (
                    <tr key={row.id}>
                      <td style={{ fontWeight: 600, color: '#d32f2f' }}>
                        #{row.id}
                      </td>
                      <td>{row.device_name || row.device}</td>
                      <td>
                        <span style={{ fontWeight: 600, color: actionText === 'Bật' ? '#d32f2f' : '#555f6f' }}>
                          {actionText}
                        </span>
                      </td>
                      <td>
                        {isSuccess ? (
                          <span style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            padding: '3px 10px',
                            borderRadius: '9999px',
                            fontSize: '12px',
                            fontWeight: 600,
                            backgroundColor: '#ecfdf5',
                            color: '#059669',
                          }}>
                            <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#10b981' }} />
                            Thành công
                          </span>
                        ) : isPending ? (
                          <span style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            padding: '3px 10px',
                            borderRadius: '9999px',
                            fontSize: '12px',
                            fontWeight: 600,
                            backgroundColor: '#fffbeb',
                            color: '#d97706',
                          }}>
                            <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#f59e0b' }} />
                            Đang chờ
                          </span>
                        ) : (
                          <span style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            padding: '3px 10px',
                            borderRadius: '9999px',
                            fontSize: '12px',
                            fontWeight: 600,
                            backgroundColor: '#fff1f2',
                            color: '#e11d48',
                          }}>
                            <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#f43f5e' }} />
                            Thất bại
                          </span>
                        )}
                      </td>
                      <td style={{ color: '#555f6f', fontFamily: 'monospace' }}>
                        {formatDateTime(row.time)}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination matching Figma */}
        {(() => {
          const limit = 20;
          const isFiltering = Boolean(
            (timeSearch && timeSearch.trim()) ||
            (search && search.trim()) ||
            deviceFilter !== 'all' ||
            actionFilter !== 'all' ||
            statusFilter !== 'all'
          );
          const totalRecords = isFiltering ? filteredHistory.length : (meta.total_records || history.length);
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
