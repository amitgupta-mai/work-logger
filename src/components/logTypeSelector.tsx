export const LogTypeSelector = ({
  logType,
  setLogType,
}: {
  logType: "meeting" | "task";
  setLogType: (type: "meeting" | "task") => void;
}) => {
  return (
    <select
      value={logType}
      onChange={(e) => setLogType(e.target.value as "meeting" | "task")}
      className="select-type  w-full border rounded px-4 py-2 text-gray-700 bg-white focus:outline-none"
    >
      <option value="meeting">Meeting</option>
      <option value="task">Task</option>
    </select>
  );
};
