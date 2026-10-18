import { useContext } from 'react';
import { RoleContext } from '@services/roleContext';

export function useRoles() {
  const context = useContext(RoleContext);
  if (!context) {
    throw new Error('useRoles debe usarse dentro de un RoleProvider');
  }
  return context;
}
