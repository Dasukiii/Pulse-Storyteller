import Papa from 'papaparse';

export interface SurveyRow {
  Employee_ID: string;
  Team: string;
  Score: number;
  Comments?: string;
  Date: string;
}

export interface ParsedSurveyData {
  rows: SurveyRow[];
  totalResponses: number;
  avgScore: number;
  teamsDetected: string[];
}

export interface ValidationError {
  field: string;
  message: string;
}

const MAX_FILE_SIZE = 5 * 1024 * 1024;

export function validateFileSize(file: File): boolean {
  return file.size <= MAX_FILE_SIZE;
}

export function validateFileType(file: File): boolean {
  const validTypes = [
    'text/csv',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  ];
  const validExtensions = ['.csv', '.xlsx', '.xls'];

  return (
    validTypes.includes(file.type) ||
    validExtensions.some((ext) => file.name.toLowerCase().endsWith(ext))
  );
}

export function validateColumns(headers: string[]): ValidationError[] {
  return [];
}

export function validateRow(row: any, rowIndex: number): ValidationError[] {
  return [];
}

export function parseCSVFile(file: File): Promise<ParsedSurveyData> {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        try {
          if (results.errors.length > 0) {
            reject(new Error(`CSV parsing error: ${results.errors[0].message}`));
            return;
          }

          if (!results.data || results.data.length === 0) {
            reject(new Error('No data found in file'));
            return;
          }

          const rows: SurveyRow[] = [];

          results.data.forEach((row: any, index: number) => {
            const employeeId = row.Employee_ID || row.employee_id || row.EmployeeID || row.ID || row.id || `EMP${String(index + 1).padStart(4, '0')}`;
            const team = row.Team || row.team || row.Department || row.department || 'Unknown Team';
            const scoreValue = row.Score || row.score || row.Rating || row.rating || row.NPS || row.nps;
            const score = !isNaN(parseFloat(scoreValue)) ? parseFloat(scoreValue) : 5;
            const comments = row.Comments || row.comments || row.Feedback || row.feedback || row.Notes || row.notes || '';
            const date = row.Date || row.date || row.SurveyDate || row.survey_date || new Date().toISOString().split('T')[0];

            rows.push({
              Employee_ID: String(employeeId).trim(),
              Team: String(team).trim(),
              Score: score,
              Comments: String(comments).trim(),
              Date: String(date).trim(),
            });
          });

          if (rows.length === 0) {
            reject(new Error('No valid rows found in file'));
            return;
          }

          const totalResponses = rows.length;
          const scores = rows.map(row => row.Score).filter(s => !isNaN(s) && s >= 0 && s <= 10);
          const avgScore = scores.length > 0
            ? scores.reduce((sum, score) => sum + score, 0) / scores.length
            : 5;
          const teamsDetected = Array.from(new Set(rows.map((row) => row.Team)));

          resolve({
            rows,
            totalResponses,
            avgScore: Math.round(avgScore * 100) / 100,
            teamsDetected,
          });
        } catch (error) {
          reject(error);
        }
      },
      error: (error) => {
        reject(new Error(`Failed to parse CSV: ${error.message}`));
      },
    });
  });
}

export function calculateEnpsScore(rows: SurveyRow[]): number {
  if (rows.length === 0) return 0;

  const promoters = rows.filter((row) => row.Score >= 9).length;
  const detractors = rows.filter((row) => row.Score <= 6).length;

  const promoterPercent = (promoters / rows.length) * 100;
  const detractorPercent = (detractors / rows.length) * 100;

  return Math.round(promoterPercent - detractorPercent);
}

export function generateSampleCSV(): string {
  const sampleData = [
    {
      Employee_ID: 'EMP001',
      Team: 'Engineering',
      Score: '9',
      Comments: 'Great work environment and team collaboration',
      Date: '2024-11-01',
    },
    {
      Employee_ID: 'EMP002',
      Team: 'Engineering',
      Score: '8',
      Comments: 'Good benefits and growth opportunities',
      Date: '2024-11-01',
    },
    {
      Employee_ID: 'EMP003',
      Team: 'Sales',
      Score: '7',
      Comments: 'Decent workplace, some improvements needed',
      Date: '2024-11-01',
    },
    {
      Employee_ID: 'EMP004',
      Team: 'Sales',
      Score: '10',
      Comments: 'Excellent leadership and company culture',
      Date: '2024-11-01',
    },
    {
      Employee_ID: 'EMP005',
      Team: 'Marketing',
      Score: '6',
      Comments: 'Need better work-life balance',
      Date: '2024-11-01',
    },
  ];

  return Papa.unparse(sampleData);
}

export function downloadSampleTemplate(): void {
  const csv = generateSampleCSV();
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);

  link.setAttribute('href', url);
  link.setAttribute('download', 'enps_survey_template.csv');
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}
