import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../ui/select';

export const LogTypeSelector = ({
  setLogType,
  logType,
  disabled = false,
}: {
  logType: 'Meeting' | 'Task';
  setLogType: (type: 'Meeting' | 'Task') => void;
  disabled?: boolean;
}) => {
  return (
    <Select
      onValueChange={(value) => setLogType(value as 'Meeting' | 'Task')}
      disabled={disabled}
    >
      <SelectTrigger>
        <SelectValue placeholder={logType} />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value='Task'>Task</SelectItem>
        <SelectItem value='Meeting'>Meeting</SelectItem>
      </SelectContent>
    </Select>
  );
};
