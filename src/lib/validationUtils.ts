export interface ColumnMapping {
  systemField: string;
  userColumn: string | null;
  required: boolean;
}

export interface ValidationError {
  rowIndex: number;
  field: string;
  value: any;
  message: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: string[];
}

const SYSTEM_FIELDS = [
  { key: 'Employee_ID', label: 'Employee ID', required: false },
  { key: 'Team', label: 'Team/Department', required: false },
  { key: 'Score', label: 'eNPS Score (0-10)', required: false },
  { key: 'Comments', label: 'Comments', required: false },
  { key: 'Date', label: 'Survey Date', required: false },
];

export function getSystemFields() {
  return SYSTEM_FIELDS;
}

export function detectColumnMapping(columns: string[]): Record<string, string | null> {
  const mapping: Record<string, string | null> = {};

  const columnPatterns: Record<string, string[]> = {
    Employee_ID: ['employee_id', 'employeeid', 'emp_id', 'empid', 'id', 'employee'],
    Team: ['team', 'department', 'dept', 'division', 'group'],
    Score: ['score', 'rating', 'nps', 'enps', 'value'],
    Comments: ['comments', 'comment', 'feedback', 'note', 'notes', 'remarks'],
    Date: ['date', 'survey_date', 'surveydate', 'timestamp', 'created'],
  };

  SYSTEM_FIELDS.forEach((field) => {
    const patterns = columnPatterns[field.key] || [];
    const matchedColumn = columns.find((col) =>
      patterns.some((pattern) => col.toLowerCase().includes(pattern))
    );
    mapping[field.key] = matchedColumn || null;
  });

  return mapping;
}

export function validateScore(value: any): ValidationError | null {
  const score = parseFloat(value);

  if (isNaN(score)) {
    return {
      rowIndex: -1,
      field: 'Score',
      value,
      message: 'Score must be a number',
    };
  }

  if (score < 0 || score > 10) {
    return {
      rowIndex: -1,
      field: 'Score',
      value,
      message: 'Score must be between 0 and 10',
    };
  }

  return null;
}

export function validateDate(value: any): ValidationError | null {
  if (!value || value.toString().trim() === '') {
    return {
      rowIndex: -1,
      field: 'Date',
      value,
      message: 'Date is required',
    };
  }

  const dateFormats = [
    /^\d{4}-\d{2}-\d{2}$/,
    /^\d{2}\/\d{2}\/\d{4}$/,
    /^\d{2}-\d{2}-\d{4}$/,
  ];

  const isValidFormat = dateFormats.some((format) => format.test(value.toString()));

  if (!isValidFormat) {
    const testDate = new Date(value);
    if (isNaN(testDate.getTime())) {
      return {
        rowIndex: -1,
        field: 'Date',
        value,
        message: 'Invalid date format',
      };
    }
  }

  return null;
}

export function validateRequiredField(
  value: any,
  fieldName: string
): ValidationError | null {
  if (!value || value.toString().trim() === '') {
    return {
      rowIndex: -1,
      field: fieldName,
      value,
      message: `${fieldName} is required`,
    };
  }
  return null;
}

export function validateMappedData(
  data: any[],
  mapping: Record<string, string | null>
): ValidationResult {
  const errors: ValidationError[] = [];
  const warnings: string[] = [];

  if (data.length === 0) {
    warnings.push('No data to validate');
    return {
      isValid: true,
      errors,
      warnings,
    };
  }

  const importantFields = ['Employee_ID', 'Team', 'Score', 'Date'];
  const missingMappings = importantFields.filter(
    (f) => !mapping[f] || mapping[f] === null
  );

  if (missingMappings.length > 0) {
    const fieldLabels = missingMappings.map(f => {
      const field = SYSTEM_FIELDS.find(sf => sf.key === f);
      return field ? field.label : f;
    });
    warnings.push(`Recommended mappings not set: ${fieldLabels.join(', ')}. Default values will be used.`);
  }

  data.forEach((row, index) => {
    if (mapping.Score) {
      const scoreValue = row[mapping.Score];
      if (scoreValue !== undefined && scoreValue !== null && scoreValue !== '') {
        const error = validateScore(scoreValue);
        if (error) {
          warnings.push(`Row ${index + 1}: ${error.message}`);
        }
      }
    }

    if (mapping.Date) {
      const dateValue = row[mapping.Date];
      if (dateValue !== undefined && dateValue !== null && dateValue !== '') {
        const error = validateDate(dateValue);
        if (error) {
          warnings.push(`Row ${index + 1}: ${error.message}`);
        }
      }
    }
  });

  if (!mapping.Comments) {
    warnings.push('Comments column not mapped - AI-generated insights may be limited');
  }

  return {
    isValid: true,
    errors,
    warnings,
  };
}

export function applyColumnMapping(
  data: any[],
  mapping: Record<string, string | null>
): any[] {
  return data.map((row, index) => {
    const mappedRow: any = {};

    Object.entries(mapping).forEach(([systemField, userColumn]) => {
      if (userColumn && row[userColumn] !== undefined) {
        mappedRow[systemField] = row[userColumn];
      } else {
        if (systemField === 'Employee_ID') {
          mappedRow[systemField] = `EMP${String(index + 1).padStart(4, '0')}`;
        } else if (systemField === 'Team') {
          mappedRow[systemField] = 'Unknown Team';
        } else if (systemField === 'Score') {
          mappedRow[systemField] = 5;
        } else if (systemField === 'Comments') {
          mappedRow[systemField] = '';
        } else if (systemField === 'Date') {
          mappedRow[systemField] = new Date().toISOString().split('T')[0];
        }
      }
    });

    return mappedRow;
  });
}

export function getPreviewValues(
  data: any[],
  columnName: string | null,
  count: number = 3
): string[] {
  if (!columnName || data.length === 0) {
    return [];
  }

  return data
    .slice(0, count)
    .map((row) => {
      const value = row[columnName];
      return value !== undefined && value !== null ? value.toString() : '-';
    });
}

export function groupErrorsByField(errors: ValidationError[]): Record<string, number> {
  const grouped: Record<string, number> = {};

  errors.forEach((error) => {
    if (!grouped[error.field]) {
      grouped[error.field] = 0;
    }
    grouped[error.field]++;
  });

  return grouped;
}

export interface DataStatistics {
  totalResponses: number;
  enpsScore: number;
  promoters: number;
  passives: number;
  detractors: number;
  promotersPercent: number;
  passivesPercent: number;
  detractorsPercent: number;
  teamStats: Array<{ team: string; count: number; avgScore: number }>;
  dateRange: { earliest: string | null; latest: string | null };
  completeness: number;
}

export interface DataQuality {
  score: number;
  rating: 'Excellent' | 'Good' | 'Fair' | 'Poor';
  completeness: number;
  validScores: number;
  dateConsistency: number;
  tips: string[];
}

export function calculateStatistics(
  data: any[],
  mapping: Record<string, string | null>
): DataStatistics {
  const totalResponses = data.length;

  if (totalResponses === 0) {
    return {
      totalResponses: 0,
      enpsScore: 0,
      promoters: 0,
      passives: 0,
      detractors: 0,
      promotersPercent: 0,
      passivesPercent: 0,
      detractorsPercent: 0,
      teamStats: [],
      dateRange: { earliest: null, latest: null },
      completeness: 0,
    };
  }

  const scores = mapping.Score
    ? data
        .map((row) => parseFloat(row[mapping.Score!]))
        .filter((score) => !isNaN(score) && score >= 0 && score <= 10)
    : data.map(() => 5);

  const promoters = scores.filter((score) => score >= 9).length;
  const passives = scores.filter((score) => score >= 7 && score < 9).length;
  const detractors = scores.filter((score) => score <= 6).length;

  const promotersPercent = (promoters / totalResponses) * 100;
  const passivesPercent = (passives / totalResponses) * 100;
  const detractorsPercent = (detractors / totalResponses) * 100;

  const enpsScore = Math.round(promotersPercent - detractorsPercent);

  const teamStats = calculateTeamStats(data, mapping);
  const dateRange = calculateDateRange(data, mapping);

  const validFieldsCount = [
    mapping.Employee_ID,
    mapping.Team,
    mapping.Score,
    mapping.Date,
  ].filter(Boolean).length;
  const completeness = (validFieldsCount / 4) * 100;

  return {
    totalResponses,
    enpsScore,
    promoters,
    passives,
    detractors,
    promotersPercent: Math.round(promotersPercent * 10) / 10,
    passivesPercent: Math.round(passivesPercent * 10) / 10,
    detractorsPercent: Math.round(detractorsPercent * 10) / 10,
    teamStats,
    dateRange,
    completeness,
  };
}

function calculateTeamStats(
  data: any[],
  mapping: Record<string, string | null>
): Array<{ team: string; count: number; avgScore: number }> {
  if (!mapping.Team || !mapping.Score) return [];

  const teamGroups: Record<
    string,
    { count: number; totalScore: number; scores: number[] }
  > = {};

  data.forEach((row) => {
    const team = row[mapping.Team!];
    const score = parseFloat(row[mapping.Score!]);

    if (team && !isNaN(score)) {
      if (!teamGroups[team]) {
        teamGroups[team] = { count: 0, totalScore: 0, scores: [] };
      }
      teamGroups[team].count++;
      teamGroups[team].totalScore += score;
      teamGroups[team].scores.push(score);
    }
  });

  return Object.entries(teamGroups)
    .map(([team, stats]) => ({
      team,
      count: stats.count,
      avgScore: Math.round((stats.totalScore / stats.count) * 10) / 10,
    }))
    .sort((a, b) => b.count - a.count);
}

function calculateDateRange(
  data: any[],
  mapping: Record<string, string | null>
): { earliest: string | null; latest: string | null } {
  if (!mapping.Date) return { earliest: null, latest: null };

  const dates = data
    .map((row) => {
      const dateValue = row[mapping.Date!];
      if (!dateValue) return null;
      const date = new Date(dateValue);
      return isNaN(date.getTime()) ? null : date;
    })
    .filter((date): date is Date => date !== null);

  if (dates.length === 0) {
    return { earliest: null, latest: null };
  }

  const sortedDates = dates.sort((a, b) => a.getTime() - b.getTime());
  return {
    earliest: sortedDates[0].toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }),
    latest: sortedDates[sortedDates.length - 1].toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }),
  };
}

export function calculateDataQuality(
  data: any[],
  mapping: Record<string, string | null>,
  errors: ValidationError[]
): DataQuality {
  if (data.length === 0) {
    return {
      score: 0,
      rating: 'Poor',
      completeness: 0,
      validScores: 0,
      dateConsistency: 0,
      tips: ['No data available'],
    };
  }

  const requiredFields = ['Employee_ID', 'Team', 'Score', 'Date'];
  const mappedRequired = requiredFields.filter((f) => mapping[f]).length;
  const completeness = (mappedRequired / requiredFields.length) * 100;

  const scoreErrors = errors.filter((e) => e.field === 'Score').length;
  const validScores = ((data.length - scoreErrors) / data.length) * 100;

  const dateErrors = errors.filter((e) => e.field === 'Date').length;
  const dateConsistency = ((data.length - dateErrors) / data.length) * 100;

  const overallScore = (completeness + validScores + dateConsistency) / 3;

  let rating: 'Excellent' | 'Good' | 'Fair' | 'Poor';
  if (overallScore >= 95) rating = 'Excellent';
  else if (overallScore >= 80) rating = 'Good';
  else if (overallScore >= 60) rating = 'Fair';
  else rating = 'Poor';

  const tips: string[] = [];
  if (completeness < 100) {
    tips.push('Tip: Map all recommended fields for more complete analysis');
  }
  if (validScores < 95) {
    tips.push('Tip: Some score values are outside 0-10 range - they will be filtered out');
  }
  if (dateConsistency < 95) {
    tips.push('Tip: Some dates are in inconsistent formats - consider standardizing');
  }
  if (!mapping.Comments) {
    tips.push('Tip: Include comments field for richer AI-generated insights');
  }
  if (tips.length === 0) {
    tips.push('Data quality is excellent! All fields mapped correctly.');
  }

  return {
    score: Math.round(overallScore),
    rating,
    completeness: Math.round(completeness),
    validScores: Math.round(validScores),
    dateConsistency: Math.round(dateConsistency),
    tips,
  };
}
