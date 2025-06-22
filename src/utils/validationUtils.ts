import { FormValidation, EntryType, OptionType } from '../types';

export const validateEntry = (entry: Partial<EntryType>): FormValidation => {
  const errors: string[] = [];

  if (!entry.entry || entry.entry.trim().length === 0) {
    errors.push('Entry description is required');
  }

  if (!entry.date) {
    errors.push('Date is required');
  }

  if (entry.type === 'Meeting' && !entry.person) {
    errors.push('Person is required for meetings');
  }

  if (!entry.project) {
    errors.push('Project is required');
  }

  if (!entry.duration || entry.duration <= 0) {
    errors.push('Duration must be greater than 0');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

export const validateProject = (project: OptionType | null): FormValidation => {
  const errors: string[] = [];

  if (!project) {
    errors.push('Project is required');
  } else if (!project.label || project.label.trim().length === 0) {
    errors.push('Project name cannot be empty');
  } else if (project.label.length > 100) {
    errors.push('Project name is too long (max 100 characters)');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

export const validatePerson = (person: OptionType | null): FormValidation => {
  const errors: string[] = [];

  if (!person) {
    errors.push('Person is required');
  } else if (!person.label || person.label.trim().length === 0) {
    errors.push('Person name cannot be empty');
  } else if (person.label.length > 50) {
    errors.push('Person name is too long (max 50 characters)');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

export const validateDuration = (duration: number | null): FormValidation => {
  const errors: string[] = [];

  if (!duration) {
    errors.push('Duration is required');
  } else if (duration <= 0) {
    errors.push('Duration must be greater than 0');
  } else if (duration > 1440) {
    // 24 hours in minutes
    errors.push('Duration cannot exceed 24 hours');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

export const validateDate = (date: Date | null): FormValidation => {
  const errors: string[] = [];

  if (!date) {
    errors.push('Date is required');
  } else if (isNaN(date.getTime())) {
    errors.push('Invalid date');
  } else if (date > new Date()) {
    errors.push('Date cannot be in the future');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

export const sanitizeInput = (input: string): string => {
  return input.trim().replace(/[<>]/g, ''); // Basic XSS prevention
};

export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validateTimeFormat = (time: string): boolean => {
  const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
  return timeRegex.test(time);
};

export const validateCSVData = (csvData: string): FormValidation => {
  const errors: string[] = [];

  if (!csvData || csvData.trim().length === 0) {
    errors.push('CSV data is required');
    return { isValid: false, errors };
  }

  const lines = csvData.split('\n').filter((line) => line.trim());

  if (lines.length < 2) {
    errors.push('CSV must have at least a header row and one data row');
    return { isValid: false, errors };
  }

  const headers = lines[0].split(',');
  const requiredHeaders = [
    'Date',
    'Type',
    'Project',
    'Person',
    'Duration (min)',
    'Description',
  ];

  for (const requiredHeader of requiredHeaders) {
    if (!headers.includes(requiredHeader)) {
      errors.push(`Missing required header: ${requiredHeader}`);
    }
  }

  // Validate data rows
  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',');
    if (values.length < 6) {
      errors.push(`Row ${i + 1} has insufficient data`);
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

export const combineValidations = (
  ...validations: FormValidation[]
): FormValidation => {
  const allErrors = validations.flatMap((v) => v.errors);
  return {
    isValid: allErrors.length === 0,
    errors: allErrors,
  };
};
