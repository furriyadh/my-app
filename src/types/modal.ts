export type AccountOption = 'furriyadh-managed' | 'own-accounts' | 'new-account';

export interface AccountCard {
  id: AccountOption;
  title: string;
  description: string;
  commission: string;
  buttonText: string;
}

export interface AccountSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (option: AccountOption) => void;
}

export interface ModalBackdropProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

