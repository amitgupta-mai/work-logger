import { useEffect, useState } from 'react';
import CreatableSelect from 'react-select/creatable';
import { OptionType } from '../types';
import { DurationSelector } from './ui/durationSelector';
import {
  getChromeStorageData,
  setChromeStorageData,
} from '../utils/chromeStorageUtils';

interface Duration {
  value: number;
  label: string;
}

interface MeetingFormProps {
  selectedPerson: OptionType | null;
  setSelectedPerson: (person: OptionType | null) => void;
  selectedProject: OptionType | null;
  setSelectedProject: (project: OptionType | null) => void;
  selectedDuration: Duration | null;
  setSelectedDuration: (duration: Duration | null) => void;
}

export const MeetingForm = ({
  selectedPerson,
  setSelectedPerson,
  selectedProject,
  setSelectedProject,
  selectedDuration,
  setSelectedDuration,
}: MeetingFormProps) => {
  const [people, setPeople] = useState<OptionType[]>([]);
  const [projects, setProjects] = useState<OptionType[]>([]);

  useEffect(() => {
    getChromeStorageData(
      ['people', 'projects'],
      (result: Record<string, unknown>) => {
        if (result.people && Array.isArray(result.people)) {
          setPeople(result.people as OptionType[]);
        }
        if (result.projects && Array.isArray(result.projects)) {
          setProjects(result.projects as OptionType[]);
        }
      }
    );
  }, [setSelectedPerson, setSelectedProject, selectedPerson, selectedProject]);

  const handleCreatePerson = (inputValue: string) => {
    const newPerson = { label: inputValue, value: inputValue };
    setSelectedPerson(newPerson);
    setChromeStorageData({ people: [...people, newPerson] });
  };

  const handleCreateProject = (inputValue: string) => {
    const newProject = { label: inputValue, value: inputValue };
    setSelectedProject(newProject);
    setChromeStorageData({ projects: [...projects, newProject] });
  };

  return (
    <>
      <CreatableSelect
        placeholder={`Select or type person's name`}
        value={selectedPerson}
        onChange={(e) => setSelectedPerson(e)}
        onCreateOption={handleCreatePerson}
        options={people}
        isClearable
        isSearchable
      />
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
