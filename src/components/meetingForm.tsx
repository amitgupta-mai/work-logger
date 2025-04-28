import CreatableSelect from 'react-select/creatable';
import { OptionType } from '../types';

export const MeetingForm = ({
  meetings,
  selectedMeeting,
  setSelectedMeeting,
  projects,
  selectedProject,
  setSelectedProject,
}: {
  meetings: OptionType[];
  selectedMeeting: OptionType | null;
  setSelectedMeeting: (meeting: OptionType | null) => void;
  projects: OptionType[];
  selectedProject: OptionType | null;
  setSelectedProject: (project: OptionType | null) => void;
}) => {
  return (
    <>
      <CreatableSelect
        placeholder='Select or type meeting name'
        value={selectedMeeting}
        onChange={(e) => setSelectedMeeting(e)}
        onCreateOption={(inputValue) =>
          setSelectedMeeting({ label: inputValue, value: inputValue })
        }
        options={meetings}
        isClearable
        isSearchable
      />
      <CreatableSelect
        placeholder='Select or type project name'
        value={selectedProject}
        onChange={(e) => setSelectedProject(e)}
        onCreateOption={(inputValue) =>
          setSelectedProject({ label: inputValue, value: inputValue })
        }
        options={projects}
        isClearable
        isSearchable
      />
    </>
  );
};
