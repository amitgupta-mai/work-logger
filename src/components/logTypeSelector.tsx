import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';

type LogType = 'meeting' | 'task';

interface LogTypeSelectorProps {
  logType: LogType;
  setLogType: (type: LogType) => void;
}

export const LogTypeSelector = ({
  logType,
  setLogType,
}: LogTypeSelectorProps) => {
  return (
    <Select
      key={logType || 'log-type'}
      value={logType}
      onValueChange={(value) => setLogType(value as LogType)}
    >
      <SelectTrigger>
        <SelectValue placeholder='Select log type' />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value='task'>Task</SelectItem>
        <SelectItem value='meeting'>Meeting</SelectItem>
      </SelectContent>
    </Select>
  );
};
