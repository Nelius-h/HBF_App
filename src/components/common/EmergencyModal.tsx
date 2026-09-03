import React from 'react';
import { EmergencyActionModal } from '../client/EmergencyActionModal';

interface EmergencyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const EmergencyModal: React.FC<EmergencyModalProps> = ({ isOpen, onClose }) => {
  return <EmergencyActionModal isOpen={isOpen} onClose={onClose} />;
};
