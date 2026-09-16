// src/pages/Dashboard.jsx - Bảng điều khiển chuẩn 100% bản thiết kế Figma
import React, { useState, useEffect } from 'react';
import RealtimeChart from '../components/RealtimeChart';
import Toast from '../components/Toast';
import {
  getLatestSensors,
  getChartData,
  getDeviceStatuses,
  controlDevice,
} from '../services/api';
import { getSocket } from '../services/socket';

export default function Dashboard() {
  const [sensors, setSensors] = useState({
    temperature: { value: 24, time: null },
    humidity: { value: 65, time: null },
    light: { value: 450, time: null },
  });

  const [chartPoints, setChartPoints] = useState([]);
  const [devices, setDevices] = useState([
    { name: 'Quạt', display: 'Quạt thông minh', icon: 'mode_fan', current_state: 'OFF' },
    { name: 'Đèn', display: 'Đèn phòng khách', icon: 'light', current_state: 'OFF' },
    { name: 'Điều hòa', display: 'Điều hòa', icon: 'ac_unit', current_state: 'OFF' },
  ]);
  const [toast, setToast] = useState(null);
  const [clock, setClock] = useState('');
  const [togglingDevices, setTogglingDevices] = useState({});

  // 1. Đồng hồ thời gian thực
  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      const timeStr = now.toLocaleTimeString('vi-VN');
      const dateStr = now.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
      setClock(`${timeStr} - ${dateStr}`);
    };
    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, []);

  // 2. Nạp dữ liệu ban đầu
  const loadData = async () => {
    try {
      const [sensorRes, chartRes, deviceRes] = await Promise.all([
        getLatestSensors().catch(() => ({ data: {} })),
        getChartData(20).catch(() => ({ data: [] })),
        getDeviceStatuses().catch(() => ({ data: [] })),
      ]);

      if (sensorRes.data) {
        setSensors((prev) => ({
          temperature: { value: sensorRes.data.temperature?.value ?? prev.temperature.value },
          humidity: { value: sensorRes.data.humidity?.value ?? prev.humidity.value },
          light: { value: sensorRes.data.light?.value ?? prev.light.value },
        }));
      }

      if (chartRes.data && chartRes.data.length > 0) {
        setChartPoints(chartRes.data);
      }

      if (deviceRes.data && deviceRes.data.length > 0) {
        setDevices((prev) =>
          prev.map((dev) => {
            const match = deviceRes.data.find((d) => d.name === dev.name || d.id === dev.id);
            return match ? { ...dev, current_state: match.current_state } : dev;
          })
        );
      }
    } catch (err) {
      console.error('Lỗi nạp dữ liệu Dashboard:', err);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // 3. Realtime Socket.IO listener
  useEffect(() => {
    const socket = getSocket();

    const handleSensorUpdate = (payload) => {
      const data = payload.data || payload;
      const { temperature, humidity, light, time, timestamp } = data;
      const pointTime = time || timestamp || new Date().toISOString();

      setSensors((prev) => ({
        temperature: {
          value: temperature !== undefined && temperature !== null ? parseFloat(temperature) : prev.temperature.value,
        },
        humidity: {
          value: humidity !== undefined && humidity !== null ? parseFloat(humidity) : prev.humidity.value,
        },
        light: {
          value: light !== undefined && light !== null ? parseFloat(light) : prev.light.value,
        },
      }));

      setChartPoints((prev) => {
        const lastPoint = prev.length > 0 ? prev[prev.length - 1] : {};
        const newPoint = {
          time: pointTime,
          temperature: temperature !== undefined && temperature !== null ? parseFloat(temperature) : (lastPoint.temperature || 0),
          humidity: humidity !== undefined && humidity !== null ? parseFloat(humidity) : (lastPoint.humidity || 0),
          light: light !== undefined && light !== null ? parseFloat(light) : (lastPoint.light || 0),
        };
        const updated = [...prev, newPoint];
        if (updated.length > 25) updated.shift();
        return updated;
      });
    };

    const handleDeviceUpdate = (payload) => {
      if (payload.device) {
        setDevices((prev) =>
          prev.map((dev) =>
            dev.name === payload.device ? { ...dev, current_state: payload.action } : dev
          )
        );
      }
    };

    socket.on('sensor_data', handleSensorUpdate);
    socket.on('SENSOR_UPDATE', handleSensorUpdate);
    socket.on('device_status', handleDeviceUpdate);

    return () => {
      socket.off('sensor_data', handleSensorUpdate);
      socket.off('SENSOR_UPDATE', handleSensorUpdate);
      socket.off('device_status', handleDeviceUpdate);
    };
  }, []);

  // 4. Bật tắt thiết bị có chống double click
  const handleToggle = async (device) => {
    if (togglingDevices[device.name]) return;

    const nextState = device.current_state === 'ON' ? 'OFF' : 'ON';
    setTogglingDevices((prev) => ({ ...prev, [device.name]: true }));

    // Cập nhật lạc quan
    setDevices((prev) =>
      prev.map((d) => (d.name === device.name ? { ...d, current_state: nextState } : d))
    );

    try {
      await controlDevice(device.name, nextState);
      setToast({
        type: 'success',
        message: `Đã chuyển trạng thái ${device.display} sang ${nextState === 'ON' ? 'Bật' : 'Tắt'}`,
      });
    } catch (err) {
      // Revert nếu lỗi
      setDevices((prev) =>
        prev.map((d) =>
          d.name === device.name ? { ...d, current_state: device.current_state } : d
        )
      );
      setToast({
        type: 'error',
        message: `Lỗi điều khiển thiết bị: ${err.message}`,
      });
    } finally {
      setTogglingDevices((prev) => ({ ...prev, [device.name]: false }));
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      {/* Page Title & Clock Header */}
      <div>
        <h2 style={{ fontSize: '32px', fontWeight: 800, color: '#151c27', letterSpacing: '-0.5px' }}>
          Bảng điều khiển
        </h2>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#555f6f', fontSize: '12px', marginTop: '6px' }}>
          <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>
            schedule
          </span>
          <span>Cập nhật: {clock || '14:30:05 - 24/05/2024'}</span>
        </div>
      </div>

      {/* Row 1: 3 Bento Sensor Cards */}
      <div className="bento-grid">
        {/* Card 1: Nhiệt độ */}
        <div className="figma-card" style={{ gridColumn: 'span 4', padding: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '50%',
              backgroundColor: 'rgba(211, 47, 47, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <span className="material-symbols-outlined" style={{ fontSize: '26px', color: '#d32f2f' }}>
                thermostat
              </span>
            </div>
            <span style={{ fontSize: '11px', fontWeight: 600, color: '#555f6f', backgroundColor: '#f0f3ff', padding: '4px 8px', borderRadius: '4px' }}>
              Phòng khách
            </span>
          </div>
          <div style={{ marginTop: '28px' }}>
            <p style={{ fontSize: '11px', fontWeight: 600, color: '#555f6f', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
              NHIỆT ĐỘ
            </p>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px', marginTop: '6px' }}>
              <span style={{ fontSize: '42px', fontWeight: 800, color: '#151c27', lineHeight: 1 }}>
                {Math.round(sensors.temperature?.value ?? 24)}
              </span>
              <span style={{ fontSize: '20px', fontWeight: 600, color: '#555f6f' }}>
                °C
              </span>
            </div>
          </div>
        </div>

        {/* Card 2: Độ ẩm */}
        <div className="figma-card" style={{ gridColumn: 'span 4', padding: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '50%',
              backgroundColor: 'rgba(214, 224, 243, 0.4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <span className="material-symbols-outlined" style={{ fontSize: '26px', color: '#555f6f' }}>
                water_drop
              </span>
            </div>
            <span style={{ fontSize: '11px', fontWeight: 600, color: '#555f6f', backgroundColor: '#f0f3ff', padding: '4px 8px', borderRadius: '4px' }}>
              Phòng khách
            </span>
          </div>
          <div style={{ marginTop: '28px' }}>
            <p style={{ fontSize: '11px', fontWeight: 600, color: '#555f6f', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
              ĐỘ ẨM
            </p>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px', marginTop: '6px' }}>
              <span style={{ fontSize: '42px', fontWeight: 800, color: '#151c27', lineHeight: 1 }}>
                {Math.round(sensors.humidity?.value ?? 65)}
              </span>
              <span style={{ fontSize: '20px', fontWeight: 600, color: '#555f6f' }}>
                %
              </span>
            </div>
          </div>
        </div>

        {/* Card 3: Ánh sáng */}
        <div className="figma-card" style={{ gridColumn: 'span 4', padding: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '50%',
              backgroundColor: 'rgba(255, 249, 196, 0.6)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <span className="material-symbols-outlined" style={{ fontSize: '26px', color: '#fbc02d' }}>
                light_mode
              </span>
            </div>
            <span style={{ fontSize: '11px', fontWeight: 600, color: '#555f6f', backgroundColor: '#f0f3ff', padding: '4px 8px', borderRadius: '4px' }}>
              Ban công
            </span>
          </div>
          <div style={{ marginTop: '28px' }}>
            <p style={{ fontSize: '11px', fontWeight: 600, color: '#555f6f', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
              ÁNH SÁNG
            </p>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px', marginTop: '6px' }}>
              <span style={{ fontSize: '42px', fontWeight: 800, color: '#151c27', lineHeight: 1 }}>
                {Math.round(sensors.light?.value ?? 450)}
              </span>
              <span style={{ fontSize: '20px', fontWeight: 600, color: '#555f6f' }}>
                lux
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Row 2: Quick Controls (Left) & Trend Chart (Right) */}
      <div className="bento-grid">
        {/* Left Column: Quick Controls */}
        <div style={{ gridColumn: 'span 4', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <h3 style={{ fontSize: '20px', fontWeight: 800, color: '#151c27' }}>
            Điều khiển nhanh
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {devices.map((dev) => {
              const isOn = dev.current_state === 'ON';
              return (
                <div
                  key={dev.name}
                  className="figma-card"
                  style={{
                    padding: '16px 20px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                    <div
                      style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '50%',
                        backgroundColor: dev.name === 'Đèn' ? 'rgba(211, 47, 47, 0.1)' : '#dce2f3',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: dev.name === 'Đèn' ? '#d32f2f' : '#555f6f',
                      }}
                    >
                      <span className="material-symbols-outlined" style={{ fontSize: '22px' }}>
                        {dev.icon}
                      </span>
                    </div>

                    <div>
                      <p style={{ fontSize: '15px', fontWeight: 600, color: '#151c27' }}>
                        {dev.display}
                      </p>
                      <p style={{ fontSize: '12px', color: '#555f6f' }}>
                        {isOn ? (dev.name === 'Quạt' ? 'đang bật' : 'Đang bật') : (dev.name === 'Điều hòa' ? 'Tắt' : 'đang tắt')}
                      </p>
                    </div>
                  </div>

                  {/* Red Toggle Switch matching Figma */}
                  <label className="toggle-switch-figma" style={{ opacity: togglingDevices[dev.name] ? 0.6 : 1, cursor: togglingDevices[dev.name] ? 'not-allowed' : 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={isOn}
                      disabled={!!togglingDevices[dev.name]}
                      onChange={() => handleToggle(dev)}
                    />
                    <span className="toggle-slider-figma" />
                  </label>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Trends Chart */}
        <div
          className="figma-card"
          style={{ gridColumn: 'span 8', padding: '24px', display: 'flex', flexDirection: 'column' }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '20px', fontWeight: 800, color: '#151c27' }}>
              Xu hướng môi trường
            </h3>

            <div style={{ display: 'flex', gap: '8px' }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '4px 10px',
                  backgroundColor: 'rgba(211, 47, 47, 0.1)',
                  borderRadius: '6px',
                  border: '1px solid rgba(211, 47, 47, 0.2)',
                }}
              >
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#d32f2f' }} />
                <span style={{ fontSize: '11px', fontWeight: 700, color: '#d32f2f', letterSpacing: '0.05em' }}>
                  TRỰC TIẾP
                </span>
              </div>

              <div
                style={{
                  padding: '4px 10px',
                  backgroundColor: '#f0f3ff',
                  borderRadius: '6px',
                  border: '1px solid #e5e7eb',
                  fontSize: '11px',
                  fontWeight: 600,
                  color: '#555f6f',
                }}
              >
                Hôm nay
              </div>
            </div>
          </div>

          <RealtimeChart dataPoints={chartPoints} />
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
