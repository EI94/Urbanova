// Dichiarazioni di tipo per Urbanova - React 19 Compatible

// Dichiarazioni per Next.js
declare module 'next/link' {
  import { ReactNode } from 'react';
  interface LinkProps {
    href: string;
    children: ReactNode;
    className?: string;
    [key: string]: any;
  }
  export default function Link(props: LinkProps): JSX.Element;
}

declare module 'next/navigation' {
  export function useRouter(): {
    push: (url: string) => void;
    replace: (url: string) => void;
    back: () => void;
    forward: () => void;
    refresh: () => void;
    prefetch: (url: string) => void;
  };
  export function usePathname(): string;
  export function useSearchParams(): URLSearchParams;
}

// Dichiarazioni per componenti UI
declare module '@/components/ui/Button' {
  import { ReactNode } from 'react';
  interface ButtonProps {
    variant?: 'primary' | 'secondary' | 'accent' | 'outline' | 'ghost';
    size?: 'sm' | 'md' | 'lg';
    isLoading?: boolean;
    fullWidth?: boolean;
    leftIcon?: ReactNode;
    rightIcon?: ReactNode;
    children?: ReactNode;
    className?: string;
    onClick?: () => void;
    disabled?: boolean;
    type?: 'button' | 'submit' | 'reset';
  }
  export default function Button(props: ButtonProps): JSX.Element;
}

declare module '@/components/ui/FormInput' {
  import { ReactNode } from 'react';
  interface FormInputProps {
    label: string;
    name: string;
    type?: string;
    placeholder?: string;
    value?: string;
    onChange?: (e: any) => void;
    error?: string;
    icon?: ReactNode;
    required?: boolean;
    disabled?: boolean;
  }
  export default function FormInput(props: FormInputProps): JSX.Element;
}

declare module '@/components/ui/Alert' {
  import { ReactNode } from 'react';
  interface AlertProps {
    type: 'success' | 'error' | 'warning' | 'info';
    title?: string;
    children: ReactNode;
    onClose?: () => void;
  }
  export default function Alert(props: AlertProps): JSX.Element;
}

declare module '@/components/ui/Toaster' {
  export default function Toaster(): JSX.Element;
}

// Dichiarazioni per layout components
declare module '@/components/layout/DashboardLayout' {
  import { ReactNode } from 'react';
  interface DashboardLayoutProps {
    children: ReactNode;
  }
  export default function DashboardLayout(props: DashboardLayoutProps): JSX.Element;
}

declare module '@/components/layout/AuthLayout' {
  import { ReactNode } from 'react';
  interface AuthLayoutProps {
    children: ReactNode;
  }
  export default function AuthLayout(props: AuthLayoutProps): JSX.Element;
}

// Dichiarazioni per icone
declare module '@/components/icons' {
  interface IconProps {
    className?: string;
  }
  
  export function DashboardIcon(props?: IconProps): JSX.Element;
  export function ProjectsIcon(props?: IconProps): JSX.Element;
  export function SettingsIcon(props?: IconProps): JSX.Element;
  export function LogoutIcon(props?: IconProps): JSX.Element;
  export function PlusIcon(props?: IconProps): JSX.Element;
  export function EditIcon(props?: IconProps): JSX.Element;
  export function DeleteIcon(props?: IconProps): JSX.Element;
  export function EyeIcon(props?: IconProps): JSX.Element;
  export function MapIcon(props?: IconProps): JSX.Element;
  export function SearchIcon(props?: IconProps): JSX.Element;
  export function FilterIcon(props?: IconProps): JSX.Element;
  export function TrendingUpIcon(props?: IconProps): JSX.Element;
  export function EuroIcon(props?: IconProps): JSX.Element;
  export function CalendarIcon(props?: IconProps): JSX.Element;
  export function AlertTriangleIcon(props?: IconProps): JSX.Element;
  export function CalculatorIcon(props?: IconProps): JSX.Element;
  export function PaletteIcon(props?: IconProps): JSX.Element;
  export function CheckCircleIcon(props?: IconProps): JSX.Element;
  export function ClockIcon(props?: IconProps): JSX.Element;
  export function UsersIcon(props?: IconProps): JSX.Element;
  export function MailIcon(props?: IconProps): JSX.Element;
  export function BusinessPlanIcon(props?: IconProps): JSX.Element;
  export function PermitIcon(props?: IconProps): JSX.Element;
  export function BuildingIcon(props?: IconProps): JSX.Element;
  export function DocumentIcon(props?: IconProps): JSX.Element;
  export function ClientIcon(props?: IconProps): JSX.Element;
  export function ConstructionIcon(props?: IconProps): JSX.Element;
  export function MeetingIcon(props?: IconProps): JSX.Element;
  export function CampaignIcon(props?: IconProps): JSX.Element;
  export function NewProjectIcon(props?: IconProps): JSX.Element;
  export function LocationIcon(props?: IconProps): JSX.Element;
  export function MarketingIcon(props?: IconProps): JSX.Element;
  export function ChartBarIcon(props?: IconProps): JSX.Element;
  export function CompareIcon(props?: IconProps): JSX.Element;
  export function TrophyIcon(props?: IconProps): JSX.Element;
  export function SaveIcon(props?: IconProps): JSX.Element;
  export function ArrowLeftIcon(props?: IconProps): JSX.Element;
  export function TrashIcon(props?: IconProps): JSX.Element;
  export function GlobeIcon(props?: IconProps): JSX.Element;
  export function ChevronDownIcon(props?: IconProps): JSX.Element;
  export function TargetIcon(props?: IconProps): JSX.Element;
}

// Dichiarazioni per servizi
declare module '@/lib/firestoreService' {
  export function getProjects(): Promise<any[]>;
  export function addProject(project: any): Promise<void>;
  export function updateProject(id: string, project: any): Promise<void>;
  export function deleteProject(id: string): Promise<void>;
  export function getProjectStats(): Promise<any>;
}

declare module '@/lib/firebase' {
  export const auth: any;
  export const db: any;
  export const storage: any;
}

declare module '@/contexts/AuthContext' {
  export function useAuth(): {
    user: any;
    login: (email: string, password: string) => Promise<void>;
    signup: (email: string, password: string, userData: any) => Promise<void>;
    logout: () => Promise<void>;
    resetPassword: (email: string) => Promise<void>;
    loading: boolean;
  };
  export function AuthProvider(props: { children: React.ReactNode }): JSX.Element;
}

// Dichiarazioni per react-hot-toast
declare module 'react-hot-toast' {
  export function toast(message: string, options?: any): void;
  export function Toaster(props?: any): JSX.Element;
}

// Dichiarazioni per chart.js
declare module 'chart.js' {
  export const Chart: any;
  export const registerables: any[];
}

declare module 'react-chartjs-2' {
  import { ReactNode } from 'react';
  interface ChartProps {
    data: any;
    options?: any;
    children?: ReactNode;
  }
  export function Line(props: ChartProps): JSX.Element;
  export function Bar(props: ChartProps): JSX.Element;
  export function Doughnut(props: ChartProps): JSX.Element;
}

// Dichiarazioni per react-hook-form
declare module 'react-hook-form' {
  export function useForm<T = any>(): {
    register: (name: string) => any;
    handleSubmit: (onSubmit: (data: T) => void) => (e: any) => void;
    formState: { errors: any; isSubmitting: boolean };
    reset: (data?: T) => void;
    setValue: (name: string, value: any) => void;
    watch: (name?: string) => any;
  };
}

// Dichiarazioni per clsx e tailwind-merge
declare module 'clsx' {
  export default function clsx(...inputs: any[]): string;
}

declare module 'tailwind-merge' {
  export function twMerge(...inputs: any[]): string;
} 