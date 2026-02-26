import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function Table({
  headers,
  children,
  className,
}: {
  headers: string[];
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("w-full overflow-x-auto", className)}>
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-gray-100">
            {headers.map((header) => (
              <th
                key={header}
                className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">{children}</tbody>
      </table>
    </div>
  );
}

export const TableRow = ({
  children,
  className,
  ...props
}: {
  children: ReactNode;
  className?: string;
  [key: string]: unknown;
}) => (
  <tr className={cn("hover:bg-gray-50/50 transition-colors", className)} {...props}>
    {children}
  </tr>
);

export const TableCell = ({ children, className }: { children: ReactNode; className?: string }) => (
  <td className={cn("px-6 py-4 text-sm text-gray-700 whitespace-nowrap", className)}>{children}</td>
);

