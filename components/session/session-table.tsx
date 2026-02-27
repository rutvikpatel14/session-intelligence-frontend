import { Smartphone, Monitor, Globe } from "lucide-react";
import { Table, TableRow, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDateTimeDDMMYYYY } from "@/lib/utils";

export interface SessionRow {
  id: string;
  deviceName: string;
  ipAddress: string;
  country: string;
  userAgent: string;
  isSuspicious: boolean;
  createdAt: string;
  lastUsedAt: string;
  userRole?: "admin" | "user";
}

interface Props {
  sessions: SessionRow[];
  onLogoutOne?: (id: string) => void;
  showVerify?: boolean;
  onVerify?: (id: string) => void;
  canLogout?: boolean;
  showRole?: boolean;
}

export function SessionTable({ sessions, onLogoutOne, showVerify, onVerify, canLogout, showRole }: Props) {
  const getDeviceType = (s: SessionRow) => {
    const needle = `${s.deviceName} ${s.userAgent}`.toLowerCase();
    if (needle.includes("iphone") || needle.includes("android") || needle.includes("ios")) return "mobile";
    if (needle.includes("ipad")) return "mobile";
    if (needle.includes("postman") || needle.includes("curl") || needle.includes("api")) return "other";
    return "desktop";
  };

  const hasVerifyAction = Boolean(showVerify && onVerify && sessions.some((s) => s.isSuspicious));
  const hasLogoutAction = Boolean(canLogout && onLogoutOne);
  const showActions = hasVerifyAction || hasLogoutAction;

  return (
    <Table
      headers={[
        "Device",
        "IP Address",
        "Country",
        "Created At",
        "Last Used",
        "Status",
        ...(showRole ? ["Role"] : []),
        ...(showActions ? ["Action"] : []),
      ]}
      className="w-full"
    >
      {sessions.map((s) => {
        const type = getDeviceType(s);
        const Icon = type === "desktop" ? Monitor : type === "mobile" ? Smartphone : Globe;

        return (
          <TableRow key={s.id}>
            <TableCell>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center text-gray-500">
                  <Icon size={16} />
                </div>
                <span className="font-medium text-gray-900">{s.deviceName}</span>
              </div>
            </TableCell>
            <TableCell className="font-mono text-xs">{s.ipAddress}</TableCell>
            <TableCell>{s.country}</TableCell>
            <TableCell className="text-gray-500">
              {formatDateTimeDDMMYYYY(s.createdAt)}
            </TableCell>
            <TableCell>
              {s.lastUsedAt ? (
                <span className="text-gray-700">{formatDateTimeDDMMYYYY(s.lastUsedAt)}</span>
              ) : (
                <span className="text-gray-500">—</span>
              )}
            </TableCell>
            <TableCell>
              <Badge variant={s.isSuspicious ? "warning" : "success"}>
                {s.isSuspicious ? "Suspicious" : "Active"}
              </Badge>
            </TableCell>
            {showRole && (
              <TableCell>
                <Badge variant={s.userRole === "admin" ? "admin" : "user"}>
                  {s.userRole === "admin" ? "Admin" : "User"}
                </Badge>
              </TableCell>
            )}
            {showActions && (
              <TableCell>
                <div className="flex items-center justify-end gap-2">
                  {showVerify && s.isSuspicious && onVerify && (
                    <Button variant="outline" size="sm" onClick={() => onVerify(s.id)}>
                      Verify
                    </Button>
                  )}
                  {onLogoutOne && canLogout && (
                    <Button variant="danger" size="sm" onClick={() => onLogoutOne(s.id)}>
                      Logout
                    </Button>
                  )}
                </div>
              </TableCell>
            )}
          </TableRow>
        );
      })}
    </Table>
  );
}

