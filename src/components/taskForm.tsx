import CreatableSelect from 'react-select/creatable';
import { OptionType } from '../types';

export const TaskForm = ({
  tasks,
  selectedTask,
  setSelectedTask,
}: {
  tasks: OptionType[];
  selectedTask: OptionType | null;
  setSelectedTask: (task: OptionType | null) => void;
}) => {
  return (
    <CreatableSelect
      placeholder='Select or type task name'
      value={selectedTask}
      onChange={(e) => setSelectedTask(e)}
      onCreateOption={(inputValue) =>
        setSelectedTask({ label: inputValue, value: inputValue })
      }
      options={tasks}
      isClearable
      isSearchable
    />
  );
};
