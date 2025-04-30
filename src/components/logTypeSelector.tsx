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
    <select
      value={logType}
      onChange={(e) => setLogType(e.target.value as 'meeting' | 'task')}
      className='select-type'
    >
      <option value='task'>Task</option>
      <option value='meeting'>Meeting</option>
    </select>
  );
};
