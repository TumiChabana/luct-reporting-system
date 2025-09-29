import { supabase } from '../config/supabase';

export const exportToExcel = async (user) => {
  try {
    // Fetch reports based on user role
    let query = supabase
      .from('reports')
      .select(`
        *,
        lecturer:users!reports_lecturer_id_fkey(name, email),
        prl:users!reports_prl_id_fkey(name)
      `)
      .order('created_at', { ascending: false });

    if (user.role === 'lecturer') {
      query = query.eq('lecturer_id', user.id);
    }

    const { data: reports, error } = await query;

    if (error) throw error;

    // Convert to Excel format
    const excelData = reports.map(report => ({
      'Course Code': report.course_code,
      'Course Name': report.course_name,
      'Class Name': report.class_name,
      'Week': report.week_of_reporting,
      'Date': new Date(report.date_of_lecture).toLocaleDateString(),
      'Time': report.scheduled_time,
      'Venue': report.venue,
      'Students Present': report.actual_students_present,
      'Total Students': report.total_registered_students,
      'Attendance Rate': `${((report.actual_students_present / report.total_registered_students) * 100).toFixed(1)}%`,
      'Topic': report.topic_taught,
      'Learning Outcomes': report.learning_outcomes,
      'Recommendations': report.recommendations,
      'Status': report.status,
      'Lecturer': report.lecturer?.name,
      'PRL Feedback': report.prl_feedback || 'N/A',
      'PRL Reviewer': report.prl?.name || 'N/A'
    }));

    // Create CSV content (simple Excel-compatible format)
    const headers = Object.keys(excelData[0] || {});
    const csvContent = [
      headers.join(','),
      ...excelData.map(row => 
        headers.map(header => {
          const value = row[header] || '';
          // Escape commas and quotes in values
          return `"${String(value).replace(/"/g, '""')}"`;
        }).join(',')
      )
    ].join('\n');

    // Create and download file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `luct-reports-${user.role}-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    return true;
  } catch (error) {
    console.error('Export error:', error);
    throw new Error('Failed to export reports: ' + error.message);
  }
};