import React, { useState } from 'react';
import {
  Users,
  Search,
  Filter,
  Download,
  Mail,
  MoreVertical,
  ArrowRight,
  UserCheck,
  AlertTriangle,
} from 'lucide-react';
import { Student, Course, NavigationTab } from '../types';
import { mockStudents, mockCourses } from '../data/mockData';
import { StatusBadge } from '../components/StatusBadge';
import { StudentDetailsModal } from './StudentDetailsModal';

interface StudentDirectoryViewProps {
  onNavigate: (tab: NavigationTab, param?: string) => void;
  onSendMessage: (studentName: string) => void;
}

export const StudentDirectoryView: React.FC<StudentDirectoryViewProps> = ({
  onNavigate,
  onSendMessage,
}) => {
  const [search, setSearch] = useState('');
  const [selectedCourseFilter, setSelectedCourseFilter] = useState<string>('All');
  const [statusFilter, setStatusFilter] = useState<string>('All');

  // Selected student for drawer
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const filteredStudents = mockStudents.filter((st) => {
    const matchesSearch =
      st.name.toLowerCase().includes(search.toLowerCase()) ||
      st.studentId.toLowerCase().includes(search.toLowerCase()) ||
      st.email.toLowerCase().includes(search.toLowerCase());

    const matchesCourse =
      selectedCourseFilter === 'All' || st.enrolledCourseIds.includes(selectedCourseFilter);

    const matchesStatus = statusFilter === 'All' || st.status === statusFilter;

    return matchesSearch && matchesCourse && matchesStatus;
  });

  const handleOpenStudent = (student: Student) => {
    setSelectedStudent(student);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
            Student Directory
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Monitor academic progress, submission consistency, and attendance across all your classes.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onNavigate('enrollments')}
            className="px-3.5 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg shadow-2xs transition-colors flex items-center gap-1.5"
          >
            <UserCheck className="w-3.5 h-3.5 text-slate-500" />
            <span>Manage Enrollments</span>
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by student name, ID number, or university email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs text-slate-900 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
          />
        </div>

        {/* Filter Dropdowns */}
        <div className="flex items-center flex-wrap gap-2">
          {/* Status Tabs */}
          <div className="flex items-center p-1 bg-slate-100 rounded-lg">
            {(['All', 'Excelling', 'Active', 'At Risk'] as const).map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                  statusFilter === st
                    ? 'bg-white text-slate-900 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {st}
              </button>
            ))}
          </div>

          {/* Course filter */}
          <select
            value={selectedCourseFilter}
            onChange={(e) => setSelectedCourseFilter(e.target.value)}
            className="px-2.5 py-1.5 text-xs text-slate-700 bg-white border border-slate-200 rounded-lg focus:outline-hidden"
          >
            <option value="All">All Courses</option>
            {mockCourses.map((c) => (
              <option key={c.id} value={c.id}>
                {c.code}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Students Data Grid */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase text-[10px] tracking-wider">
            <tr>
              <th className="px-5 py-3">Student</th>
              <th className="px-4 py-3">Student ID</th>
              <th className="px-4 py-3">Courses</th>
              <th className="px-4 py-3">Attendance</th>
              <th className="px-4 py-3">GPA</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-5 py-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredStudents.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-5 py-8 text-center text-slate-400 text-xs">
                  No students found matching your criteria.
                </td>
              </tr>
            ) : (
              filteredStudents.map((st) => (
                <tr
                  key={st.id}
                  onClick={() => handleOpenStudent(st)}
                  className="hover:bg-slate-50/70 cursor-pointer transition-colors"
                >
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-8 h-8 rounded-full text-white text-xs font-semibold flex items-center justify-center shrink-0 ${st.avatarBg}`}
                      >
                        {st.initials}
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-slate-900 truncate">{st.name}</p>
                        <p className="text-[11px] text-slate-400 truncate">{st.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3.5 font-mono text-slate-600">{st.studentId}</td>
                  <td className="px-4 py-3.5">
                    <div className="flex flex-wrap gap-1">
                      {st.enrolledCourseIds.map((cid) => {
                        const course = mockCourses.find((c) => c.id === cid);
                        return (
                          <span
                            key={cid}
                            className="px-1.5 py-0.5 rounded-md text-[10px] font-mono bg-slate-100 text-slate-700"
                          >
                            {course?.code || cid}
                          </span>
                        );
                      })}
                    </div>
                  </td>
                  <td className="px-4 py-3.5 font-mono tabular-nums text-slate-700">
                    <span
                      className={`font-semibold ${
                        st.attendanceRate < 80 ? 'text-rose-600' : 'text-slate-800'
                      }`}
                    >
                      {st.attendanceRate}%
                    </span>
                  </td>
                  <td className="px-4 py-3.5 font-mono tabular-nums font-bold text-slate-900">
                    {st.gpa.toFixed(2)}
                  </td>
                  <td className="px-4 py-3.5">
                    <StatusBadge status={st.status} />
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenStudent(st);
                      }}
                      className="px-2.5 py-1 text-xs font-medium text-indigo-600 hover:bg-indigo-50 border border-indigo-200 rounded-lg transition-colors"
                    >
                      View Profile
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Student Details Modal */}
      <StudentDetailsModal
        isOpen={isModalOpen}
        student={selectedStudent}
        onClose={() => setIsModalOpen(false)}
        onSendMessage={onSendMessage}
      />
    </div>
  );
};
