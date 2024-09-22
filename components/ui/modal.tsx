import React from 'react';
import Modal from 'react-modal';
import { Button } from '@/components/ui/button';

interface ConfirmDeleteModalProps {
  isOpen: boolean;
  onRequestClose: () => void;
  onConfirm: () => void;
}

const ConfirmDeleteModal: React.FC<ConfirmDeleteModalProps> = ({ isOpen, onRequestClose, onConfirm }) => {
  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onRequestClose}
      style={{
        content: {
          top: '50%',
          left: '50%',
          right: 'auto',
          bottom: 'auto',
          transform: 'translate(-50%, -50%)',
          width: '300px', // Đặt kích thước modal
          padding: '20px',
          borderRadius: '8px',
          boxShadow: '0 4px 16px rgba(0, 0, 0, 0.2)',
        },
        overlay: {
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
        },
      }}
    >
      <h2 className='text-lg font-semibold'>Confirm Deletion</h2>
      <p>Are you sure you want to delete this Etag Type?</p>
      <div className='flex justify-end mt-4'>
        <Button onClick={onRequestClose} className='mr-2'>Cancel</Button>
        <Button onClick={onConfirm} variant="destructive">Delete</Button>
      </div>
    </Modal>
  );
};

export default ConfirmDeleteModal;
