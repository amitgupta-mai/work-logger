import {
  combineValidations,
  validateProject,
  validatePerson,
  validateDuration,
} from '../../../utils/validationUtils';
import { OptionType } from '../../../types';

export function validateLoggerForm({
  logType,
  selectedProject,
  selectedDuration,
  selectedPerson,
  durationMode,
  startHour,
  startMinute,
  startAmPm,
  endHour,
  endMinute,
  endAmPm,
  getManualDuration,
}: {
  logType: string;
  selectedProject: OptionType | null;
  selectedDuration: { value: number; label: string } | null;
  selectedPerson: OptionType | null;
  durationMode: 'dropdown' | 'manual';
  startHour: string;
  startMinute: string;
  startAmPm: string;
  endHour: string;
  endMinute: string;
  endAmPm: string;
  getManualDuration: () => number;
}) {
  const validations = [validateProject(selectedProject)];
  if (logType === 'Meeting') {
    validations.push(validatePerson(selectedPerson));
    if (durationMode === 'dropdown') {
      validations.push(validateDuration(selectedDuration?.value || null));
    } else {
      if (
        !startHour ||
        !startMinute ||
        !startAmPm ||
        !endHour ||
        !endMinute ||
        !endAmPm
      ) {
        validations.push({
          isValid: false,
          errors: ['All time fields are required'],
        });
      } else if (getManualDuration() <= 0) {
        validations.push({
          isValid: false,
          errors: ['End time must be after start time'],
        });
      }
    }
  } else if (logType === 'Task') {
    if (durationMode === 'dropdown') {
      validations.push(validateDuration(selectedDuration?.value || null));
    } else {
      if (
        !startHour ||
        !startMinute ||
        !startAmPm ||
        !endHour ||
        !endMinute ||
        !endAmPm
      ) {
        validations.push({
          isValid: false,
          errors: ['All time fields are required'],
        });
      } else if (getManualDuration() <= 0) {
        validations.push({
          isValid: false,
          errors: ['End time must be after start time'],
        });
      }
    }
  }
  return combineValidations(...validations);
}
