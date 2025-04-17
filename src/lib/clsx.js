// A simplified version of clsx
export function clsx(...args) {
  return args
    .flat()
    .filter(Boolean)
    .join(' ');
}

// Export the type for TypeScript
export const ClassValue = String;
