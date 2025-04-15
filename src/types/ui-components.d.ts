import { ReactNode } from 'react';

// Extend the existing UI component types to accept children
declare module '@/components/ui/label' {
  interface LabelProps {
    children?: ReactNode;
  }
}

declare module '@/components/ui/select' {
  interface SelectTriggerProps {
    children?: ReactNode;
  }
  
  interface SelectContentProps {
    children?: ReactNode;
  }
  
  interface SelectItemProps {
    children?: ReactNode;
  }
}

declare module '@/components/ui/scroll-area' {
  interface ScrollAreaProps {
    children?: ReactNode;
  }
}
