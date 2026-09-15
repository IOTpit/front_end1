// src/pages/Profile.jsx - Hồ sơ Quản trị viên chuẩn 100% bản thiết kế Figma image8.png
import React, { useState, useEffect } from 'react';
import Toast from '../components/Toast';
import { getProfile, updateProfile } from '../services/api';

export default function Profile() {
  const [formData, setFormData] = useState({
    full_name: 'Dương Minh Thái',
    class_name: 'D23CQCN01-B',
    student_id: 'B23DCCN742',
    email: 'b23dccn742@student.ptit.edu.vn',
    address: 'Hà Nội, Việt Nam',
    github_url: 'https://github.com/duongminhthai',
    figma_url: 'https://www.figma.com/design/YC0DgVvLdxhE0mdGityrqM/Untitled?node-id=9-2',
    postman_url: 'https://web.postman.co/workspace/My-Workspace',
    doc_pdf_url: 'https://drive.google.com/file/d/project-report.pdf',
  });

  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await getProfile();
        if (res.data) {
          setFormData({
            full_name: res.data.full_name || 'Dương Minh Thái',
            class_name: res.data.class_name || 'D23CQCN01-B',
            student_id: res.data.student_id || 'B23DCCN742',
            email: res.data.email || 'b23dccn742@student.ptit.edu.vn',
            address: res.data.address || 'Hà Nội, Việt Nam',
            github_url: res.data.github_url || 'https://github.com/duongminhthai',
            figma_url: res.data.figma_url || 'https://www.figma.com/design/YC0DgVvLdxhE0mdGityrqM/Untitled?node-id=9-2',
            postman_url: res.data.postman_url || 'https://web.postman.co/workspace/My-Workspace',
            doc_pdf_url: res.data.doc_pdf_url || 'https://drive.google.com/file/d/project-report.pdf',
          });
        }
      } catch (err) {
        console.error('Lỗi tải hồ sơ:', err);
      }
    };
    fetchUser();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.full_name.trim()) {
      setToast({ type: 'warning', message: 'Họ và tên không được để trống!' });
      return;
    }

    setSaving(true);
    try {
      await updateProfile(formData);
      setIsEditing(false);
      setToast({ type: 'success', message: 'Cập nhật hồ sơ thành công vào cơ sở dữ liệu!' });
    } catch (err) {
      setToast({ type: 'error', message: err.response?.data?.message || 'Có lỗi xảy ra khi lưu' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      {/* Title Header matching Figma image8.png */}
      <div>
        <h2 style={{ fontSize: '32px', fontWeight: 800, color: '#151c27', letterSpacing: '-0.5px' }}>
          Hồ sơ Quản trị viên
        </h2>
        <p style={{ fontSize: '14px', color: '#555f6f', marginTop: '4px' }}>
          Quản lý thông tin cá nhân và tài nguyên dự án.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '28px', alignItems: 'start' }}>
        {/* Left Column: Personal Profile Card matching Figma */}
        <div className="figma-card" style={{ padding: '32px', textAlign: 'center' }}>
          {/* Avatar square placeholder from Figma */}
          <div
            style={{
              width: '110px',
              height: '110px',
              borderRadius: '16px',
              backgroundColor: '#e7eefe',
              border: '2px dashed #bdc7d9',
              margin: '0 auto 20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#af101a',
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '56px', color: '#af101a' }}>
              account_circle
            </span>
          </div>

          <h3 style={{ fontSize: '20px', fontWeight: 800, color: '#151c27', marginBottom: '20px' }}>
            {formData.full_name || 'Dương Minh Thái'}
          </h3>

          {!isEditing ? (
            /* View Mode */
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', textAlign: 'left', fontSize: '13px', color: '#555f6f', marginBottom: '28px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span className="material-symbols-outlined" style={{ fontSize: '18px', color: '#8a94a6' }}>person</span>
                <span>Họ tên:</span>
                <b style={{ color: '#151c27', marginLeft: 'auto' }}>{formData.full_name}</b>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span className="material-symbols-outlined" style={{ fontSize: '18px', color: '#8a94a6' }}>school</span>
                <span>Lớp:</span>
                <b style={{ color: '#151c27', marginLeft: 'auto' }}>{formData.class_name}</b>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span className="material-symbols-outlined" style={{ fontSize: '18px', color: '#8a94a6' }}>badge</span>
                <span>Mã SV:</span>
                <b style={{ color: '#151c27', marginLeft: 'auto' }}>{formData.student_id}</b>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span className="material-symbols-outlined" style={{ fontSize: '18px', color: '#8a94a6' }}>mail</span>
                <span>Email:</span>
                <span style={{ color: '#151c27', marginLeft: 'auto', fontSize: '12px' }}>{formData.email}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span className="material-symbols-outlined" style={{ fontSize: '18px', color: '#8a94a6' }}>location_on</span>
                <span>Địa chỉ:</span>
                <b style={{ color: '#151c27', marginLeft: 'auto' }}>{formData.address}</b>
              </div>
            </div>
          ) : (
            /* Edit Mode Form */
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', textAlign: 'left', marginBottom: '20px' }}>
              <div>
                <label style={{ fontSize: '11px', fontWeight: 600, color: '#555f6f' }}>Họ và tên</label>
                <input type="text" name="full_name" className="figma-input" value={formData.full_name} onChange={handleChange} />
              </div>
              <div>
                <label style={{ fontSize: '11px', fontWeight: 600, color: '#555f6f' }}>Lớp</label>
                <input type="text" name="class_name" className="figma-input" value={formData.class_name} onChange={handleChange} />
              </div>
              <div>
                <label style={{ fontSize: '11px', fontWeight: 600, color: '#555f6f' }}>Mã SV</label>
                <input type="text" name="student_id" className="figma-input" value={formData.student_id} onChange={handleChange} />
              </div>
              <div>
                <label style={{ fontSize: '11px', fontWeight: 600, color: '#555f6f' }}>Email</label>
                <input type="email" name="email" className="figma-input" value={formData.email} onChange={handleChange} />
              </div>
              <div>
                <label style={{ fontSize: '11px', fontWeight: 600, color: '#555f6f' }}>Địa chỉ</label>
                <input type="text" name="address" className="figma-input" value={formData.address} onChange={handleChange} />
              </div>
            </div>
          )}

          {/* Edit / Save Button matching Figma */}
          {!isEditing ? (
            <button
              type="button"
              onClick={() => setIsEditing(true)}
              style={{
                width: '100%',
                padding: '10px',
                borderRadius: '8px',
                border: '1px solid #e5e7eb',
                backgroundColor: '#ffffff',
                color: '#151c27',
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
              onMouseEnter={(e) => {
                e.target.style.borderColor = '#d32f2f';
                e.target.style.color = '#d32f2f';
              }}
              onMouseLeave={(e) => {
                e.target.style.borderColor = '#e5e7eb';
                e.target.style.color = '#151c27';
              }}
            >
              Chỉnh sửa hồ sơ
            </button>
          ) : (
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                type="button"
                onClick={handleSave}
                disabled={saving}
                style={{
                  flex: 1,
                  padding: '10px',
                  borderRadius: '8px',
                  border: 'none',
                  backgroundColor: '#d32f2f',
                  color: '#ffffff',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                {saving ? 'Đang lưu...' : 'Lưu lại'}
              </button>
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                style={{
                  padding: '10px 16px',
                  borderRadius: '8px',
                  border: '1px solid #e5e7eb',
                  backgroundColor: '#ffffff',
                  color: '#555f6f',
                  fontSize: '13px',
                  cursor: 'pointer',
                }}
              >
                Hủy
              </button>
            </div>
          )}
        </div>

        {/* Right Column: Project Resources Card matching Figma */}
        <div className="figma-card" style={{ padding: '32px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
            <h3 style={{ fontSize: '20px', fontWeight: 800, color: '#151c27' }}>
              Tài nguyên Dự án
            </h3>
            <span className="material-symbols-outlined" style={{ fontSize: '20px', color: '#8a94a6' }}>
              link
            </span>
          </div>
          <p style={{ fontSize: '13px', color: '#555f6f', marginBottom: '24px' }}>
            Các liên kết quan trọng đến tài liệu và mã nguồn.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* 1. GitHub Repository */}
            <div style={{ border: '1px solid #e5e7eb', borderRadius: '10px', padding: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '10px' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '6px', backgroundColor: '#151c27', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
                  <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>code</span>
                </div>
                <div>
                  <h4 style={{ fontSize: '14px', fontWeight: 700, color: '#151c27' }}>GitHub Repository</h4>
                  <p style={{ fontSize: '11px', color: '#8a94a6' }}>Mã nguồn dự án IoT</p>
                </div>
              </div>
              <input
                type="text"
                name="github_url"
                className="figma-input"
                value={formData.github_url}
                onChange={handleChange}
                placeholder="https://github.com/..."
              />
            </div>

            {/* 2. Figma Design File */}
            <div style={{ border: '1px solid #e5e7eb', borderRadius: '10px', padding: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '10px' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '6px', backgroundColor: '#fff2f0', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#d32f2f' }}>
                  <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>design_services</span>
                </div>
                <div>
                  <h4 style={{ fontSize: '14px', fontWeight: 700, color: '#151c27' }}>Figma Design File</h4>
                  <p style={{ fontSize: '11px', color: '#8a94a6' }}>Bản thiết kế giao diện người dùng</p>
                </div>
              </div>
              <input
                type="text"
                name="figma_url"
                className="figma-input"
                value={formData.figma_url}
                onChange={handleChange}
                placeholder="https://www.figma.com/file/..."
              />
            </div>

            {/* 3. Postman Collection */}
            <div style={{ border: '1px solid #e5e7eb', borderRadius: '10px', padding: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '10px' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '6px', backgroundColor: '#f0f3ff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#4f46e5' }}>
                  <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>api</span>
                </div>
                <div>
                  <h4 style={{ fontSize: '14px', fontWeight: 700, color: '#151c27' }}>Tài liệu Postman</h4>
                  <p style={{ fontSize: '11px', color: '#8a94a6' }}>Tài liệu API và kiểm thử</p>
                </div>
              </div>
              <input
                type="text"
                name="postman_url"
                className="figma-input"
                value={formData.postman_url}
                onChange={handleChange}
                placeholder="https://www.postman.com/..."
              />
            </div>

            {/* 4. Project Report PDF */}
            <div style={{ border: '1px solid #e5e7eb', borderRadius: '10px', padding: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '10px' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '6px', backgroundColor: '#fff2f0', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#d32f2f' }}>
                  <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>description</span>
                </div>
                <div>
                  <h4 style={{ fontSize: '14px', fontWeight: 700, color: '#151c27' }}>Báo cáo dự án</h4>
                  <p style={{ fontSize: '11px', color: '#8a94a6' }}>Tài liệu tổng kết và báo cáo kỹ thuật</p>
                </div>
              </div>
              <input
                type="text"
                name="doc_pdf_url"
                className="figma-input"
                value={formData.doc_pdf_url}
                onChange={handleChange}
                placeholder="https://drive.google.com/..."
              />
            </div>
          </div>
        </div>
      </div>

      {toast && (
        <Toast
          type={toast.type}
          message={toast.message}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}
