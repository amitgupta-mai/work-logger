import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../ui/select';

type LogType = 'Meeting' | 'Task';

interface LogTypeSelectorProps {
  logType: LogType;
  setLogType: (type: LogType) => void;
  disabled?: boolean;
}

export const LogTypeSelector = ({
  setLogType,
  logType,
  disabled = false,
}: LogTypeSelectorProps) => {
  return (
    <Select
      onValueChange={(value) => setLogType(value as LogType)}
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
