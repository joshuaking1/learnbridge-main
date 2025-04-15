// This file extends the Tailwind CSS types to include our custom brand colors
import 'tailwindcss/tailwind.css';

declare module 'tailwindcss/tailwind.css' {
  export interface TailwindColors {
    brand: {
      darkblue: string;
      midblue: string;
      orange: string;
    };
  }
}
