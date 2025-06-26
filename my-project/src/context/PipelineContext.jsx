import { createContext, useState } from 'react';

export const PipelineContext = createContext();

export const PipelineProvider = ({ children }) => {
  const [pipelineData, setPipelineData] = useState({});

  return (
    <PipelineContext.Provider value={{ pipelineData, setPipelineData }}>
      {children}
    </PipelineContext.Provider>
  );
};
