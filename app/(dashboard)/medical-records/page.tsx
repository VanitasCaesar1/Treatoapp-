'use client';

import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  FileText, Calendar, Stethoscope, DollarSign,
  Activity, Loader2, Search, RefreshCw,
  CheckCircle2, Clock, XCircle, ArrowUpRight, AlertTriangle, Download, Filter,
  ChevronRight, Pill, FlaskConical
} from 'lucide-react';
import { format, parseISO, isFuture, isToday, isYesterday } from 'date-fns';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { usePullToRefresh } from '@/lib/hooks/use-pull-to-refresh';

// Timeline Node Component
const TimelineNode = ({ status, isLast }: { status: string, isLast: boolean }) => {
  const colorMap: Record<string, string> = {
    completed: 'bg-green-500 ring-green-100',
    pending: 'bg-blue-500 ring-blue-100',
    cancelled: 'bg-red-500 ring-red-100',
  };

  return (
    <div className="flex flex-col items-center mr-4">
      <div className={cn(
        "w-3 h-3 rounded-full ring-4 z-10",
        colorMap[status] || 'bg-gray-400 ring-gray-100'
      )} />
      {!isLast && <div className="w-0.5 h-full bg-gray-100 my-1" />}
    </div>
  );
};

// Timeline Card Component
const TimelineCard = ({ record, isLast }: any) => {
  const statusConfig: Record<string, any> = {
    completed: { icon: <CheckCircle2 className="h-3 w-3" />, color: 'text-green-600 bg-green-50', label: 'Completed' },
    pending: { icon: <Clock className="h-3 w-3" />, color: 'text-blue-600 bg-blue-50', label: 'Upcoming' },
    cancelled: { icon: <XCircle className="h-3 w-3" />, color: 'text-red-600 bg-red-50', label: 'Cancelled' },
  };

  const status = statusConfig[record.status] || statusConfig.pending;

  // Determine icon based on category/type (mock logic for visual variety)
  const getRecordIcon = () => {
    if (record.category.includes('Lab')) return <FlaskConical className="h-4 w-4" />;
    if (record.category.includes('Prescription')) return <Pill className="h-4 w-4" />;
    return <Stethoscope className="h-4 w-4" />;
  };

  return (
    <div className="flex mb-6 relative">
      <TimelineNode status={record.status} isLast={isLast} />

      <Link href={`/dashboard/history`} className="flex-1 block">
        <motion.div
          whileTap={{ scale: 0.98 }}
          className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm active:border-blue-200 transition-colors"
        >
          <div className="flex justify-between items-start mb-2">
            <div className="flex items-center gap-2">
              <div className={cn("p-1.5 rounded-lg", status.color)}>
                {getRecordIcon()}
              </div>
              <div>
                <h3 className="font-bold text-gray-900 text-sm leading-tight">{record.category}</h3>
                <p className="text-xs text-gray-500 font-medium">{record.doctor}</p>
              </div>
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 bg-gray-50 px-2 py-1 rounded-full">
              {format(parseISO(record.rawDate), 'MMM d')}
            </span>
          </div>

          <p className="text-sm text-gray-600 mb-3 line-clamp-2 leading-relaxed">
            {record.description}
          </p>

          <div className="flex items-center justify-between pt-3 border-t border-gray-50">
            <div className={cn("flex items-center gap-1.5 text-xs font-semibold", status.color.split(' ')[0])}>
              {status.icon}
              <span>{status.label}</span>
            </div>
            {record.amount && (
              <div className="text-xs font-bold text-gray-900">
                {record.amount}
              </div>
            )}
          </div>
        </motion.div>
      </Link>
    </div>
  );
};

// Upcoming Appointment Card (Hero)
const UpcomingCard = ({ record }: any) => {
  if (!record) return null;

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-3 px-1">
        <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider">Next Appointment</h2>
        <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
          {format(parseISO(record.rawDate), 'EEEE, MMM d')}
        </span>
      </div>

      <Link href={`/dashboard/history`}>
        <motion.div
          whileTap={{ scale: 0.98 }}
          className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-3xl p-5 text-white shadow-xl shadow-gray-200 relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-10 -mt-10 blur-2xl" />

          <div className="relative z-10">
            <div className="flex justify-between items-start mb-6">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-white/10 flex items-center justify-center backdrop-blur-sm">
                  <Calendar className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-white/60 text-xs font-medium uppercase tracking-wide">Time</p>
                  <p className="text-lg font-bold">
                    {format(parseISO(record.rawDate), 'h:mm a')}
                  </p>
                </div>
              </div>
              <div className="bg-white/10 backdrop-blur-md px-3 py-1 rounded-full border border-white/10">
                <span className="text-xs font-bold text-white">Confirmed</span>
              </div>
            </div>

            <div className="space-y-1 mb-4">
              <h3 className="text-xl font-bold">{record.doctor}</h3>
              <p className="text-white/70 text-sm">{record.category} • {record.description}</p>
            </div>

            <Button className="w-full bg-white text-gray-900 hover:bg-gray-100 border-none font-bold rounded-xl h-10 text-sm">
              View Details
            </Button>
          </div>
        </motion.div>
      </Link>
    </div>
  );
};

export default function MedicalRecordsPage() {
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/appointments?limit=100');
      if (!response.ok) throw new Error('Failed');
      const data = await response.json();
      setAppointments(data.appointments || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  const { containerRef, isRefreshing } = usePullToRefresh({
    onRefresh: fetchAppointments,
  });

  const transformToRecords = () => {
    return appointments.map((appt) => ({
      id: appt.appointment_id,
      rawDate: appt.appointment_date || new Date().toISOString(),
      patientName: appt.patient_name || 'You',
      category: appt.appointment_type === 'online' ? 'Video Consult' : 'In-Person',
      doctor: appt.doctor_name || 'Unknown Doctor',
      status: appt.status === 'completed' ? 'completed' : appt.status === 'cancelled' ? 'cancelled' : 'pending',
      description: appt.reason || appt.chief_complaint || 'General Checkup',
      amount: appt.amount ? `₹${appt.amount}` : null,
    })).sort((a, b) => new Date(b.rawDate).getTime() - new Date(a.rawDate).getTime());
  };

  const allRecords = transformToRecords();

  // Separate upcoming and past
  const upcoming = allRecords.filter(r => r.status === 'pending' && isFuture(parseISO(r.rawDate))).reverse()[0]; // Get nearest upcoming
  const history = allRecords.filter(r => r.id !== upcoming?.id);

  // Group history by month
  const groupedHistory = history.reduce((groups: any, record) => {
    const date = parseISO(record.rawDate);
    const key = format(date, 'MMMM yyyy');
    if (!groups[key]) groups[key] = [];
    groups[key].push(record);
    return groups;
  }, {});

  return (
    <div ref={containerRef} className="min-h-screen bg-gray-50/50 pb-24">
      {/* Pull Refresh Spinner */}
      <div className={cn(
        "flex justify-center items-center h-12 overflow-hidden transition-all duration-300",
        isRefreshing ? "opacity-100" : "opacity-0 h-0"
      )}>
        <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
      </div>

      <div className="max-w-md mx-auto px-5 py-6">
        {/* Upcoming Appointment Hero */}
        {upcoming && <UpcomingCard record={upcoming} />}

        {/* Search */}
        <div className="relative mb-8">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search timeline..."
            className="pl-11 h-12 rounded-2xl border-none bg-white shadow-sm focus:ring-2 focus:ring-blue-500/20 text-base"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* Timeline */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="h-8 w-8 text-blue-600 animate-spin mb-3" />
            <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">Loading Timeline...</p>
          </div>
        ) : Object.keys(groupedHistory).length === 0 && !upcoming ? (
          <div className="text-center py-12">
            <div className="h-16 w-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FileText className="h-8 w-8 text-gray-300" />
            </div>
            <h3 className="text-gray-900 font-bold">No records yet</h3>
            <p className="text-gray-500 text-sm mt-1">Your health journey starts here.</p>
          </div>
        ) : (
          <div className="space-y-8">
            {Object.entries(groupedHistory).map(([month, records]: [string, any]) => (
              <div key={month}>
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4 pl-1">{month}</h3>
                <div>
                  {records.map((record: any, index: number) => (
                    <TimelineCard
                      key={record.id}
                      record={record}
                      isLast={index === records.length - 1}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
