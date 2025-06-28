import { useState, useCallback } from 'react';
import { OptionType } from '../../../types';
import {
  getChromeStorageData,
  setChromeStorageData,
} from '../../../utils/chromeStorageUtils';

export function useOptionsLoader() {
  const [people, setPeople] = useState<OptionType[]>([]);
  const [projects, setProjects] = useState<OptionType[]>([]);

  const loadOptions = useCallback(() => {
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
  }, []);

  const handleCreatePerson = useCallback(
    (inputValue: string, onSelect?: (value: OptionType) => void) => {
      const newPerson = { label: inputValue, value: inputValue };
      setPeople((prev) => [...prev, newPerson]);
      setChromeStorageData({ people: [...people, newPerson] });
      if (onSelect) onSelect(newPerson);
    },
    [people]
  );

  const handleCreateProject = useCallback(
    (inputValue: string, onSelect?: (value: OptionType) => void) => {
      const newProject = { label: inputValue, value: inputValue };
      setProjects((prev) => [...prev, newProject]);
      setChromeStorageData({ projects: [...projects, newProject] });
      if (onSelect) onSelect(newProject);
    },
    [projects]
  );

  return {
    people,
    setPeople,
    projects,
    setProjects,
    loadOptions,
    handleCreatePerson,
    handleCreateProject,
  };
}
