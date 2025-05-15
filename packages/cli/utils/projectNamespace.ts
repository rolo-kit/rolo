export const setupProjectNamespace = (command: string, projectName: string) => {
  return `${command}:${projectName}`;
};

export const createKey = (projectNamespace: string, key: string) => {
  return `${projectNamespace}:${key}`;
};

export const formatProjectName = (projectName: string) => {
  return projectName.replace(/[^a-zA-Z0-9]/g, '-');
};
