import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { Input } from "./ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { FileText, Edit, Trash, CheckCircle, XCircle, Eye, Search } from "lucide-react";
import { mockAPI } from "../mockData";
import { AuditLog } from "../types";

export function AuditTrail() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [filteredLogs, setFilteredLogs] = useState<AuditLog[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [actionFilter, setActionFilter] = useState<string>("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLogs();
  }, []);

  useEffect(() => {
    filterLogs();
  }, [logs, searchTerm, actionFilter]);

  const loadLogs = async () => {
    setLoading(true);
    const data = await mockAPI.getAuditLogs(100);
    setLogs(data);
    setLoading(false);
  };

  const filterLogs = () => {
    let filtered = [...logs];

    if (searchTerm) {
      filtered = filtered.filter(
        log =>
          log.resource_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
          log.resource_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
          log.action.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (actionFilter !== "all") {
      filtered = filtered.filter(log => log.action === actionFilter);
    }

    setFilteredLogs(filtered);
  };

  const getActionIcon = (action: string) => {
    switch (action) {
      case "create":
        return <FileText className="h-4 w-4 text-green-500" />;
      case "update":
        return <Edit className="h-4 w-4 text-blue-500" />;
      case "delete":
        return <Trash className="h-4 w-4 text-red-500" />;
      case "approve":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "reject":
        return <XCircle className="h-4 w-4 text-red-500" />;
      case "read":
        return <Eye className="h-4 w-4 text-gray-500" />;
      default:
        return <FileText className="h-4 w-4 text-gray-500" />;
    }
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case "create":
        return "bg-green-100 text-green-800";
      case "update":
        return "bg-blue-100 text-blue-800";
      case "delete":
        return "bg-red-100 text-red-800";
      case "approve":
        return "bg-green-100 text-green-800";
      case "reject":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const uniqueActions = Array.from(new Set(logs.map(log => log.action)));

  return (
    <div className="p-8 space-y-6">
      <div>
        <h2>Audit Trail</h2>
        <p className="text-gray-600">Complete system activity log for compliance and monitoring</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Total Events</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl">{logs.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Today</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl">
              {logs.filter(log => {
                const logDate = new Date(log.timestamp).toDateString();
                const today = new Date().toDateString();
                return logDate === today;
              }).length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Approvals</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl text-green-600">
              {logs.filter(log => log.action === "approve").length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Rejections</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl text-red-600">
              {logs.filter(log => log.action === "reject").length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filter Logs</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex space-x-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search by resource ID, type, or action..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={actionFilter} onValueChange={setActionFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by action" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Actions</SelectItem>
                {uniqueActions.map(action => (
                  <SelectItem key={action} value={action}>
                    {action.charAt(0).toUpperCase() + action.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Audit Log Table */}
      <Card>
        <CardHeader>
          <CardTitle>Audit Logs</CardTitle>
          <CardDescription>
            Showing {filteredLogs.length} of {logs.length} events
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Loading...</div>
          ) : filteredLogs.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No audit logs found
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Timestamp</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>Resource</TableHead>
                  <TableHead>User ID</TableHead>
                  <TableHead>Reason</TableHead>
                  <TableHead>Details</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLogs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell>
                      <div>
                        <p>{new Date(log.timestamp).toLocaleDateString()}</p>
                        <p className="text-sm text-gray-500">
                          {new Date(log.timestamp).toLocaleTimeString()}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        {getActionIcon(log.action)}
                        <Badge className={getActionColor(log.action)}>
                          {log.action}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p>{log.resource_type}</p>
                        <p className="text-sm text-gray-500">ID: {log.resource_id}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">User {log.user_id}</Badge>
                    </TableCell>
                    <TableCell>
                      <p className="text-sm max-w-xs truncate">
                        {log.reason || "-"}
                      </p>
                    </TableCell>
                    <TableCell>
                      {(log.old_value || log.new_value) && (
                        <Badge variant="outline">
                          {log.old_value && log.new_value ? "Modified" : log.new_value ? "Created" : "Deleted"}
                        </Badge>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Compliance Notice */}
      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="pt-6">
          <div className="flex items-start space-x-3">
            <CheckCircle className="h-5 w-5 text-blue-600 mt-0.5" />
            <div>
              <p className="text-blue-900">21 CFR Part 11 Compliant</p>
              <p className="text-sm text-blue-700 mt-1">
                All audit logs are immutable, tamper-proof, and retained for 7+ years. Each log entry includes:
                user identification, timestamp, action details, reason for change, and before/after values.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
