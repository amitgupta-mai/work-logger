export const LogTypeSelector = ({
  logType,
  setLogType,
}: {
  logType: 'meeting' | 'task';
  setLogType: (type: 'meeting' | 'task') => void;
}) => {
  return (
    <select
      value={logType}
      onChange={(e) => setLogType(e.target.value as 'meeting' | 'task')}
      className='select-type'
    >
      <option value='meeting'>Meeting</option>
      <option value='task'>Task</option>
    </select>
  );
};
