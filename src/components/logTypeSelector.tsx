import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';

type LogType = 'Meeting' | 'Task';

interface LogTypeSelectorProps {
  logType: LogType;
  setLogType: (type: LogType) => void;
}

export const LogTypeSelector = ({
  setLogType,
  logType,
}: LogTypeSelectorProps) => {
  return (
    <Select onValueChange={(value) => setLogType(value as LogType)}>
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
