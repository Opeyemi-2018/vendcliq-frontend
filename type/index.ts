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
}
