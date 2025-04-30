import { useEffect, useState } from 'react';
import CreatableSelect from 'react-select/creatable';
import { OptionType } from '../types';
import { DurationSelector } from '../ui/durationSelector';

export const TaskForm = ({
  selectedProject,
  setSelectedProject,
  selectedDuration,
  setSelectedDuration,
}: {
  selectedProject: OptionType | null;
  setSelectedProject: (project: OptionType | null) => void;
  selectedDuration: { value: number; label: string } | null;
  setSelectedDuration: (value: { value: number; label: string } | null) => void;
}) => {
  const [projects, setProjects] = useState<OptionType[]>([]);

  useEffect(() => {
    chrome.storage.local.get(['projects'], (result) => {
      if (result.projects) {
        setProjects(result.projects);
      }
    });
  }, [setSelectedProject, selectedProject]);

  const handleCreateProject = (inputValue: string) => {
    const newProject = { label: inputValue, value: inputValue };
    setSelectedProject(newProject);
    chrome.storage.local.set({ projects: [...projects, newProject] });
  };

  return (
    <>
      <CreatableSelect
        placeholder='Select or type project name'
        value={selectedProject}
        onChange={(e) => setSelectedProject(e)}
        onCreateOption={handleCreateProject}
        options={projects}
        isClearable
        isSearchable
      />
      <DurationSelector
        selectedDuration={selectedDuration}
        setSelectedDuration={setSelectedDuration}
      />
    </>
  );
};
