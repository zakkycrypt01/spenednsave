"use client";
import { useEffect, useState, useRef } from "react";

interface Notification {
  id: string;
  title: string;
  body: string;
  timestamp: string;
  read?: boolean;
}

export function NotificationsDropdown() {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Fetch recent notifications from API
    async function fetchNotifications() {
      try {
        const res = await fetch("/api/notifications?limit=10");
        if (res.ok) {
          const data = await res.json();
          setNotifications(data.notifications || []);
        }
      } catch {
        // ignore
      }
    }
    if (open) fetchNotifications();
  }, [open]);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener("mousedown", handleClick);
      return () => document.removeEventListener("mousedown", handleClick);
    }
  }, [open]);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        className="relative p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 focus:outline-none"
        onClick={() => setOpen((v) => !v)}
        aria-label="Show notifications"
      >
        <span className="material-symbols-outlined text-2xl">notifications</span>
        {notifications.some(n => !n.read) && (
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
        )}
      </button>
      {open && (
        <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg z-50">
          <div className="p-4 border-b border-slate-100 dark:border-slate-800 font-bold text-slate-900 dark:text-white">Recent Notifications</div>
          <ul className="max-h-80 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
            {notifications.length === 0 && (
              <li className="p-4 text-slate-500 text-center">No notifications</li>
            )}
            {notifications.map((n) => (
              <li key={n.id} className="p-4 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer">
                <div className="font-medium text-slate-900 dark:text-white">{n.title}</div>
                <div className="text-sm text-slate-600 dark:text-slate-400">{n.body}</div>
                <div className="text-xs text-slate-400 mt-1">{new Date(n.timestamp).toLocaleString()}</div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
