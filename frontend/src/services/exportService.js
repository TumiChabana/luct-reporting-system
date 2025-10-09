import { supabase } from '../config/supabase';
import * as XLSX from 'xlsx';

// Bulk export function (keep this for bulk downloads)
export const exportToExcel = async (user) => {
  try {
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
      'Academic Year': report.academic_year,
      'Semester': report.semester,
      'Stream': report.stream,
      'Program Type': report.program_type,
      'Week': report.week_of_reporting,
      'Date': new Date(report.date_of_lecture).toLocaleDateString(),
      'Time': report.scheduled_time,
      'Venue': report.venue,
      'Students Present': report.actual_students_present,
      'Total Students': report.total_registered_students,
      'Attendance Rate': `${((report.actual_students_present / report.total_registered_students) * 100).toFixed(1)}%`,
      'Lecturer Rating': report.lecturer_rating ? '*'.repeat(report.lecturer_rating) : 'Not rated',
      'PRL Rating': report.prl_rating ? '*'.repeat(report.prl_rating) : 'Not rated',
      'Topic': report.topic_taught,
      'Learning Outcomes': report.learning_outcomes,
      'Recommendations': report.recommendations,
      'Status': report.status,
      'Lecturer': report.lecturer?.name,
      'PRL Feedback': report.prl_feedback || 'N/A',
      'PRL Reviewer': report.prl?.name || 'N/A'
    }));

    // Create workbook and worksheet
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(excelData);
    
    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(wb, ws, 'Reports');
    
    // Generate Excel file and download
    const fileName = `luct-reports-${user.role}-${new Date().toISOString().split('T')[0]}.xlsx`;
    XLSX.writeFile(wb, fileName);

    return true;
  } catch (error) {
    console.error('Export error:', error);
    throw new Error('Failed to export reports: ' + error.message);
  }
};

// New function for individual report download
export const exportSingleReportToExcel = async (report) => {
  try {
    // Format the report data for Excel
    const reportData = [
      { Field: 'Course Code', Value: report.course_code },
      { Field: 'Course Name', Value: report.course_name },
      { Field: 'Class Name', Value: report.class_name },
      { Field: 'Academic Year', Value: report.academic_year },
      { Field: 'Semester', Value: `Semester ${report.semester}` },
      { Field: 'Stream', Value: report.stream },
      { Field: 'Program Type', Value: report.program_type },
      { Field: 'Week of Reporting', Value: report.week_of_reporting },
      { Field: 'Date of Lecture', Value: new Date(report.date_of_lecture).toLocaleDateString() },
      { Field: 'Scheduled Time', Value: report.scheduled_time },
      { Field: 'Venue', Value: report.venue },
      { Field: 'Students Present', Value: report.actual_students_present },
      { Field: 'Total Registered Students', Value: report.total_registered_students },
      { Field: 'Attendance Rate', Value: `${((report.actual_students_present / report.total_registered_students) * 100).toFixed(1)}%` },
      { Field: 'Lecturer Rating', Value: report.lecturer_rating ? '*'.repeat(report.lecturer_rating) : 'Not rated' },
      { Field: 'PRL Rating', Value: report.prl_rating ? '*'.repeat(report.prl_rating) : 'Not rated' },
      { Field: 'Status', Value: report.status },
      { Field: 'Lecturer', Value: report.lecturer?.name || 'N/A' },
      { Field: 'PRL Reviewer', Value: report.prl?.name || 'N/A' },
      { Field: '', Value: '' }, // Empty row for separation
      { Field: 'Topic Taught', Value: '' },
      { Field: '', Value: report.topic_taught },
      { Field: '', Value: '' },
      { Field: 'Learning Outcomes', Value: '' },
      { Field: '', Value: report.learning_outcomes },
      { Field: '', Value: '' },
      { Field: 'Recommendations', Value: '' },
      { Field: '', Value: report.recommendations },
      { Field: '', Value: '' },
      { Field: 'PRL Feedback', Value: '' },
      { Field: '', Value: report.prl_feedback || 'No feedback provided' }
    ];

    // Create workbook
    const wb = XLSX.utils.book_new();
    
    // Create main report sheet
    const ws = XLSX.utils.json_to_sheet(reportData, { skipHeader: true });
    
    // Set column widths for better formatting
    const colWidths = [
      { wch: 25 }, // Field column
      { wch: 50 }  // Value column
    ];
    ws['!cols'] = colWidths;

    // Add some styling by modifying cells
    if (!ws['!merges']) ws['!merges'] = [];
    
    // Add title row
    XLSX.utils.sheet_add_aoa(ws, [[`Class Report - ${report.course_code}`]], { origin: 'A1' });
    ws['!merges'].push({ s: { r: 0, c: 0 }, e: { r: 0, c: 1 } });
    
    // Add header styling
    const titleCell = ws['A1'];
    if (titleCell) {
      titleCell.s = {
        font: { bold: true, sz: 16 },
        alignment: { horizontal: 'center' }
      };
    }

    // Add the worksheet to the workbook
    XLSX.utils.book_append_sheet(wb, ws, 'Class Report');

    // Generate filename
    const fileName = `report-${report.course_code}-${report.class_name}-${new Date(report.date_of_lecture).toISOString().split('T')[0]}.xlsx`;
    
    // Download the file
    XLSX.writeFile(wb, fileName);

    return true;
  } catch (error) {
    console.error('Single report export error:', error);
    throw new Error('Failed to export report: ' + error.message);
  }
};