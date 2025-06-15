
import React from 'react';
import { UserSession } from '@/types';
import NilaiTabs from './nilai/NilaiTabs';

interface NilaiPageProps {
  userSession: UserSession;
}

const NilaiPage: React.FC<NilaiPageProps> = ({ userSession }) => {
  return (
    <NilaiTabs userSession={userSession} />
  );
};

export default NilaiPage;
