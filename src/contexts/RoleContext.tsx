import React, { createContext, useContext, useState, useEffect } from 'react';

export type RoleType = 'user' | 'op1';

export interface RoleInfo {
  id: RoleType;
  name: string;
}

export const ROLES: Record<RoleType, RoleInfo> = {
  user: { id: 'user', name: '前线侦察机组-01' },
  op1: { id: 'op1', name: '西北区域人影指挥中心' }
};

interface RoleContextType {
  currentRole: RoleInfo;
  setCurrentRole: (role: RoleType) => void;
}

const RoleContext = createContext<RoleContextType | undefined>(undefined);

export function RoleProvider({ children }: { children: React.ReactNode }) {
  const [currentRole, setCurrentRoleState] = useState<RoleInfo>(ROLES.user);

  useEffect(() => {
    const savedRole = localStorage.getItem('currentRole') as RoleType;
    if (savedRole && ROLES[savedRole]) {
      setCurrentRoleState(ROLES[savedRole]);
    }
  }, []);

  const setCurrentRole = (role: RoleType) => {
    if (ROLES[role]) {
      setCurrentRoleState(ROLES[role]);
      localStorage.setItem('currentRole', role);
    }
  };

  return (
    <RoleContext.Provider value={{ currentRole, setCurrentRole }}>
      {children}
    </RoleContext.Provider>
  );
}

export function useRole() {
  const context = useContext(RoleContext);
  if (context === undefined) {
    throw new Error('useRole must be used within a RoleProvider');
  }
  return context;
}
