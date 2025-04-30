import { useEffect, useState } from 'react';
import CreatableSelect from 'react-select/creatable';
import { OptionType } from '../types';

export const MeetingForm = ({
  selectedPerson,
  setSelectedPerson,
  selectedProject,
  setSelectedProject,
}: {
  selectedPerson: OptionType | null;
  setSelectedPerson: (person: OptionType | null) => void;
  selectedProject: OptionType | null;
  setSelectedProject: (project: OptionType | null) => void;
}) => {
  const [people, setPeople] = useState<OptionType[]>([]);
  const [projects, setProjects] = useState<OptionType[]>([]);

  useEffect(() => {
    // Load stored people and projects from storage
    chrome.storage.local.get(['people', 'projects'], (result) => {
      if (result.people) {
        setPeople(result.people);
      }
      if (result.projects) {
        setProjects(result.projects);
      }
    });
  }, [setSelectedPerson, setSelectedProject, selectedPerson, selectedProject]);

  const handleCreatePerson = (inputValue: string) => {
    const newPerson = { label: inputValue, value: inputValue };
    setSelectedPerson(newPerson);
    // Save to storage
    chrome.storage.local.set({ people: [...people, newPerson] });
  };

  const handleCreateProject = (inputValue: string) => {
    const newProject = { label: inputValue, value: inputValue };
    setSelectedProject(newProject);
    // Save to storage
    chrome.storage.local.set({ projects: [...projects, newProject] });
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
    </>
  );
};
