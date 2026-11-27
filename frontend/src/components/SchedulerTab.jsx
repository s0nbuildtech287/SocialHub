import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { CalendarClock, Clock, CheckCircle2, XCircle, RefreshCw } from 'lucide-react';

export default function SchedulerTab() {
  const [scheduled, setScheduled] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchScheduled = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/api/posts/scheduled');
      setScheduled(res.data.scheduled || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchScheduled();
  }, []);

  return (
    <div className="space-y-6 sm:space-y-8 animate-fadeIn">
      
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <CalendarClock className="w-6 h-6 text-amber-500" />
            Lịch đăng bài tự động
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Hệ thống cronjob chạy ngầm mỗi phút để tự động đăng các bài đã lên lịch.
          </p>
        </div>
        <button
          onClick={fetchScheduled}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 transition"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          Làm mới
        </button>
      </div>

      <div className="app-card overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-500 dark:text-slate-400 text-sm">
            Đang tải danh sách bài hẹn giờ...
          </div>
        ) : scheduled.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <Clock className="w-8 h-8 text-slate-400 dark:text-slate-600 mx-auto" />
            <p className="text-slate-600 dark:text-slate-400 text-sm font-medium">Chưa có bài viết nào được lên lịch.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-200 dark:divide-slate-800">
            {scheduled.map((item) => (
              <div key={item.id} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition">
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-amber-700 dark:text-amber-400 border border-slate-200 dark:border-slate-700">
                      ⏰ {new Date(item.scheduledTime).toLocaleString('vi-VN')}
                    </span>
                    {item.status === 'pending' && (
                      <span className="text-[11px] px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-800 dark:text-amber-400 border border-amber-500/30 font-semibold">
                        Đang chờ đăng
                      </span>
                    )}
                    {item.status === 'published' && (
                      <span className="text-[11px] px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-800 dark:text-emerald-400 border border-emerald-500/30 font-semibold flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> Đã đăng thành công
                      </span>
                    )}
                    {item.status === 'failed' && (
                      <span className="text-[11px] px-2 py-0.5 rounded-full bg-rose-500/15 text-rose-800 dark:text-rose-400 border border-rose-500/30 font-semibold flex items-center gap-1">
                        <XCircle className="w-3 h-3" /> Thất bại
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-slate-800 dark:text-slate-200 font-medium line-clamp-2">
                    {item.message || '(Không có text)'}
                  </p>
                  {item.shopeeLink && (
                    <span className="text-xs text-orange-600 dark:text-orange-400 font-semibold block truncate">
                      🛒 Gắn Shopee: {item.shopeeLink}
                    </span>
                  )}
                </div>

                {item.photoUrl && (
                  <img
                    src={item.photoUrl}
                    alt="Preview"
                    className="w-16 h-16 rounded-xl object-cover border border-slate-200 dark:border-slate-700 shrink-0"
                  />
                )}
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
