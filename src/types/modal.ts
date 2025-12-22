// Modal types for the application

export type AccountOption = 'own-accounts' | 'furriyadh-managed' | 'new-account';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export interface AccountSelectionModalProps extends ModalProps {
  onSelect: (option: AccountOption) => void;
}

