export interface IButton {
  children: React.ReactNode;
  className?: string;
  action?: () => void;
}
export interface IReusableInputProps {
  label: string;
  type?: string;
  placeholder?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  className?: string;
  name?: string;
  required?: boolean;
}
export interface ISidebarButtonProps {
  href: string;
  icon: React.ReactNode;
  label: string;
  isActive: boolean;
  className?: string;
}
export interface IRequestCardProps {
  title: string;
  description: string;
  buttonText: string;
  icon?: React.ReactNode;
  primaryColor?: string;

  onRequestLoan?: () => void;
}
