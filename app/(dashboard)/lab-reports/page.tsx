'use client';

import { useState, useEffect } from 'react';
import { FileText, Plus, Camera, Upload, Loader2, Calendar, Building2, Download, Trash2, Eye, Stethoscope, ChevronDown, ChevronUp, Paperclip } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { LabReportUploader } from '@/components/lab-reports/lab-report-uploader';
import { format, parseISO } from 'date-fns';
import toast from 'react-hot-toast';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

interface LabReport {
  report_id: string;
  report_name: string;
  report_type: string;
  file_url: string;
  file_name: string;
  file_type: string;
  test_name?: string;
  test_date?: string;
  lab_name?: string;
  notes?: string;
  created_at: string;
  appointment_id?: string;
  diagnosis_id?: string;
}

interface Appointment {
  appointment_id: string;
  doctor_name: string;
  appointment_date: string;
  appointment_type: string;
  status: string;
  reason?: string;
}

export default function LabReportsPage() {
  const [reports, setReports] = useState<LabReport[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploaderOpen, setUploaderOpen] = useState(false);
  const [patientId, setPatientId] = useState<string | null>(null);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [expandedAppointments, setExpandedAppointments] = useState<Set<string>>(new Set());
  const [viewMode, setViewMode] = useState<'all' | 'by-appointment'>('by-appointment');

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await fetch('/api/user/profile', { credentials: 'include' });
      if (response.ok) {
        const data = await response.json();
        const pid = data.user?.patient_id;
        if (pid) {
          setPatientId(pid);
          await Promise.all([fetchReports(pid), fetchAppointments()]);
        } else {
          setLoading(false);
        }
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      setLoading(false);
    }
  };

  const fetchReports = async (pid: string) => {
    try {
      const response = await fetch(`/api/lab-reports?patient_id=${pid}`, {
        credentials: 'include',
      });
      if (response.ok) {
        const data = await response.json();
        setReports(data.reports || []);
      }
    } catch (error) {
      console.error('Error fetching reports:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAppointments = async () => {
    try {
      const response = await fetch('/api/appointments?limit=50', {
        credentials: 'include',
      });
      if (response.ok) {
        const data = await response.json();
        // Filter to completed appointments
        const completed = (data.appointments || []).filter(
          (a: Appointment) => a.status === 'completed'
        );
        setAppointments(completed);
      }
    } catch (error) {
      console.error('Error fetching appointments:', error);
    }
  };

  const toggleAppointmentExpand = (appointmentId: string) => {
    setExpandedAppointments(prev => {
      const next = new Set(prev);
      if (next.has(appointmentId)) {
        next.delete(appointmentId);
      } else {
        next.add(appointmentId);
      }
      return next;
    });
  };

  const getReportsForAppointment = (appointmentId: string) => {
    return reports.filter(r => r.appointment_id === appointmentId);
  };

  const getUnattachedReports = () => {
    return reports.filter(r => !r.appointment_id);
  };

  const handleDelete = async (reportId: string) => {
    if (!confirm('Are you sure you want to delete this report?')) return;

    try {
      const response = await fetch(`/api/lab-reports/${reportId}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (response.ok) {
        setReports(reports.filter(r => r.report_id !== reportId));
        toast.success('Report deleted');
      } else {
        throw new Error('Failed to delete');
      }
    } catch (error) {
      toast.error('Failed to delete report');
    }
  };

  const handleUploadSuccess = (newReport: any) => {
    if (patientId) {
      fetchReports(patientId);
    }
    setSelectedAppointment(null);
  };

  const getFileIcon = (fileType: string) => {
    if (fileType?.includes('pdf')) {
      return <FileText className="h-6 w-6 text-red-500" />;
    }
    return <FileText className="h-6 w-6 text-blue-500" />;
  };

  const ReportCard = ({ report }: { report: LabReport }) => (
    <div className="bg-gray-50 p-3 rounded-xl">
      <div className="flex gap-3">
        <div className="flex-shrink-0 p-2 bg-white rounded-lg">
          {getFileIcon(report.file_type)}
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-gray-900 text-sm truncate">
            {report.report_name}
          </h4>
          {report.test_name && (
            <p className="text-xs text-gray-500">{report.test_name}</p>
          )}
          <div className="flex items-center gap-2 mt-1">
            {report.test_date && (
              <span className="text-xs text-gray-400">
                {format(parseISO(report.test_date), 'MMM d')}
              </span>
            )}
            {report.lab_name && (
              <span className="text-xs text-gray-400">• {report.lab_name}</span>
            )}
          </div>
        </div>
      </div>
      <div className="flex items-center gap-2 mt-2">
        <a
          href={report.file_url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 flex items-center justify-center gap-1 py-1.5 text-xs font-medium text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
        >
          <Eye className="h-3 w-3" />
          View
        </a>
        <a
          href={report.file_url}
          download={report.file_name}
          className="flex-1 flex items-center justify-center gap-1 py-1.5 text-xs font-medium text-gray-600 hover:bg-white rounded-lg transition-colors"
        >
          <Download className="h-3 w-3" />
          Download
        </a>
        <button
          onClick={() => handleDelete(report.report_id)}
          className="py-1.5 px-2 text-xs font-medium text-red-500 hover:bg-red-50 rounded-lg transition-colors"
        >
          <Trash2 className="h-3 w-3" />
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen pb-24">
      <div className="p-4 space-y-4">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-xl">
              <FileText className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h1 className="font-bold text-gray-900 text-lg">My Lab Reports</h1>
              <p className="text-xs text-gray-500">{reports.length} reports</p>
            </div>
          </div>
          <Button
            onClick={() => setUploaderOpen(true)}
            disabled={!patientId}
            className="bg-blue-600 hover:bg-blue-700 rounded-full h-10 px-4"
          >
            <Plus className="h-4 w-4 mr-1" />
            Add
          </Button>
        </div>
        {/* View Toggle */}
        <div className="flex gap-2 p-1 bg-gray-100 rounded-xl">
          <button
            onClick={() => setViewMode('by-appointment')}
            className={cn(
              "flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors",
              viewMode === 'by-appointment'
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            )}
          >
            By Visit
          </button>
          <button
            onClick={() => setViewMode('all')}
            className={cn(
              "flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors",
              viewMode === 'all'
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            )}
          >
            All Reports
          </button>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => setUploaderOpen(true)}
            disabled={!patientId}
            className="flex items-center gap-3 p-4 bg-white rounded-2xl border border-gray-100 hover:border-blue-200 hover:bg-blue-50 transition-colors disabled:opacity-50"
          >
            <div className="p-2 bg-blue-100 rounded-xl">
              <Camera className="h-5 w-5 text-blue-600" />
            </div>
            <div className="text-left">
              <p className="font-semibold text-gray-900 text-sm">Take Photo</p>
              <p className="text-xs text-gray-500">Capture report</p>
            </div>
          </button>
          <button
            onClick={() => setUploaderOpen(true)}
            disabled={!patientId}
            className="flex items-center gap-3 p-4 bg-white rounded-2xl border border-gray-100 hover:border-purple-200 hover:bg-purple-50 transition-colors disabled:opacity-50"
          >
            <div className="p-2 bg-purple-100 rounded-xl">
              <Upload className="h-5 w-5 text-purple-600" />
            </div>
            <div className="text-left">
              <p className="font-semibold text-gray-900 text-sm">Upload File</p>
              <p className="text-xs text-gray-500">PDF or image</p>
            </div>
          </button>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="h-8 w-8 text-blue-600 animate-spin mb-3" />
            <p className="text-sm text-gray-500">Loading reports...</p>
          </div>
        ) : reports.length === 0 && appointments.length === 0 ? (
          <div className="text-center py-12">
            <div className="h-16 w-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FileText className="h-8 w-8 text-gray-300" />
            </div>
            <h3 className="font-bold text-gray-900 mb-1">No reports yet</h3>
            <p className="text-sm text-gray-500 mb-4">Upload your lab reports to keep them organized</p>
            <Button
              onClick={() => setUploaderOpen(true)}
              disabled={!patientId}
              className="bg-blue-600 hover:bg-blue-700 rounded-full"
            >
              <Plus className="h-4 w-4 mr-2" />
              Upload First Report
            </Button>
          </div>
        ) : viewMode === 'by-appointment' ? (
          <div className="space-y-4">
            {/* Appointments with reports */}
            {appointments.map((appointment) => {
              const appointmentReports = getReportsForAppointment(appointment.appointment_id);
              const isExpanded = expandedAppointments.has(appointment.appointment_id);
              
              return (
                <div
                  key={appointment.appointment_id}
                  className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden"
                >
                  <button
                    onClick={() => toggleAppointmentExpand(appointment.appointment_id)}
                    className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-green-50 rounded-xl">
                        <Stethoscope className="h-5 w-5 text-green-600" />
                      </div>
                      <div className="text-left">
                        <h3 className="font-semibold text-gray-900 text-sm">
                          {appointment.doctor_name}
                        </h3>
                        <p className="text-xs text-gray-500">
                          {format(parseISO(appointment.appointment_date), 'MMM d, yyyy')}
                          {appointment.reason && ` • ${appointment.reason}`}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {appointmentReports.length > 0 && (
                        <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded-full">
                          {appointmentReports.length} reports
                        </span>
                      )}
                      {isExpanded ? (
                        <ChevronUp className="h-5 w-5 text-gray-400" />
                      ) : (
                        <ChevronDown className="h-5 w-5 text-gray-400" />
                      )}
                    </div>
                  </button>

                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="border-t border-gray-100"
                      >
                        <div className="p-4 space-y-3">
                          {appointmentReports.length > 0 ? (
                            appointmentReports.map((report) => (
                              <ReportCard key={report.report_id} report={report} />
                            ))
                          ) : (
                            <p className="text-sm text-gray-500 text-center py-4">
                              No reports attached to this visit
                            </p>
                          )}
                          <Button
                            onClick={() => {
                              setSelectedAppointment(appointment);
                              setUploaderOpen(true);
                            }}
                            variant="outline"
                            className="w-full rounded-xl border-dashed"
                          >
                            <Paperclip className="h-4 w-4 mr-2" />
                            Attach Report to This Visit
                          </Button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}

            {/* Unattached Reports */}
            {getUnattachedReports().length > 0 && (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
                <h3 className="font-semibold text-gray-900 text-sm mb-3 flex items-center gap-2">
                  <FileText className="h-4 w-4 text-gray-400" />
                  Unattached Reports ({getUnattachedReports().length})
                </h3>
                <div className="space-y-3">
                  {getUnattachedReports().map((report) => (
                    <ReportCard key={report.report_id} report={report} />
                  ))}
                </div>
              </div>
            )}

            {appointments.length === 0 && reports.length > 0 && (
              <p className="text-sm text-gray-500 text-center py-4">
                No completed appointments yet. Reports will be grouped by visit once you have appointments.
              </p>
            )}
          </div>
        ) : (
          /* All Reports View */
          <div className="space-y-3">
            {reports.map((report) => (
              <div
                key={report.report_id}
                className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm"
              >
                <div className="flex gap-3">
                  <div className="flex-shrink-0 p-3 bg-gray-50 rounded-xl">
                    {getFileIcon(report.file_type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-gray-900 text-sm truncate">
                      {report.report_name}
                    </h3>
                    {report.test_name && (
                      <p className="text-xs text-gray-600 mt-0.5">{report.test_name}</p>
                    )}
                    <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                      {report.test_date && (
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {format(parseISO(report.test_date), 'MMM d, yyyy')}
                        </span>
                      )}
                      {report.lab_name && (
                        <span className="flex items-center gap-1">
                          <Building2 className="h-3 w-3" />
                          {report.lab_name}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-50">
                  <a
                    href={report.file_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 flex items-center justify-center gap-2 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-xl transition-colors"
                  >
                    <Eye className="h-4 w-4" />
                    View
                  </a>
                  <a
                    href={report.file_url}
                    download={report.file_name}
                    className="flex-1 flex items-center justify-center gap-2 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 rounded-xl transition-colors"
                  >
                    <Download className="h-4 w-4" />
                    Download
                  </a>
                  <button
                    onClick={() => handleDelete(report.report_id)}
                    className="flex items-center justify-center gap-2 py-2 px-3 text-sm font-medium text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Uploader Modal */}
      {patientId && (
        <LabReportUploader
          open={uploaderOpen}
          onClose={() => {
            setUploaderOpen(false);
            setSelectedAppointment(null);
          }}
          patientId={patientId}
          appointmentId={selectedAppointment?.appointment_id}
          onSuccess={handleUploadSuccess}
        />
      )}
    </div>
  );
}
