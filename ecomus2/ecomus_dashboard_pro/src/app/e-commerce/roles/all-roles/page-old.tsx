"use client";

import { useState } from "react";
import { DashboardLayout } from "@/components/layouts/dashboard-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
  Plus,
  Search,
  Edit,
  Trash2,
  Eye,
} from "lucide-react";

// real data for roles
const real = [
  {
    id: 1,
    name: "Guy Hawkins",
    createdAt: "May 31, 2023",
    permissions: ["read", "write", "delete"],
  },
  {
    id: 2,
    name: "Bessie Cooper",
    createdAt: "December 2, 2023",
    permissions: ["read", "write"],
  },
  {
    id: 3,
    name: "Admin",
    createdAt: "January 15, 2023",
    permissions: ["read", "write", "delete", "manage_users", "manage_roles"],
  },
  {
    id: 4,
    name: "Editor",
    createdAt: "March 10, 2023",
    permissions: ["read", "write"],
  },
  {
    id: 5,
    name: "Viewer",
    createdAt: "April 5, 2023",
    permissions: ["read"],
  },
];

const availablePermissions = [
  { id: "read", label: "Read" },
  { id: "write", label: "Write" },
  { id: "delete", label: "Delete" },
  { id: "manage_users", label: "Manage Users" },
  { id: "manage_roles", label: "Manage Roles" },
  { id: "manage_products", label: "Manage Products" },
  { id: "manage_orders", label: "Manage Orders" },
  { id: "view_analytics", label: "View Analytics" },
];

export default function AllRolesPage() {
  const [roles, setRoles] = useState(real);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newRoleName, setNewRoleName] = useState("");
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);

  // Filter roles based on search term
  const filteredRoles = roles.filter((role) =>
    role.name.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  // Pagination
  const totalPages = Math.ceil(filteredRoles.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentRoles = filteredRoles.slice(startIndex, endIndex);

  const handleAddRole = (e?: React.FormEvent) => {
    if (e) {
      e.preventDefault();
    }

    if (newRoleName.trim() && selectedPermissions.length > 0) {
      const newRole = {
        id: roles.length + 1,
        name: newRoleName,
        createdAt: new Date().toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        }),
        permissions: selectedPermissions,
      };
      setRoles([...roles, newRole]);
      setNewRoleName("");
      setSelectedPermissions([]);
      setIsAddModalOpen(false);
    }
  };
  const handlePermissionChange = (permissionId: string, checked: boolean) => {
    if (checked) {
      setSelectedPermissions([...selectedPermissions, permissionId]);
    } else {
      setSelectedPermissions(
        selectedPermissions.filter((id) => id !== permissionId),
      );
    }
  };

  const handleDeleteRole = (roleId: number) => {
    setRoles(roles.filter((role) => role.id !== roleId));
  };

  return (
    <DashboardLayout>
      <div className="container mx-auto p-6">
        {/* Header */}
        <div className="mb-6">
          <h1
            className="text-3xl font-bold text-gray-900 mb-2"

          >
            All Roles
          </h1>
          <p className="text-gray-600">
            Manage user roles and permissions for your application
          </p>
        </div>

        {/* Search and Add Role */}
        <div
          className="flex flex-col sm:flex-row gap-4 mb-6"

        >
          <div className="relative flex-1">
            <Search
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4"

            />

            <Input
              placeholder="Search here..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"

            />
          </div>
          <Dialog
            open={isAddModalOpen}
            onOpenChange={setIsAddModalOpen}

          >
            <DialogTrigger asChild>
              <Button
                className="bg-primary hover:bg-primary/90"

              >
                <Plus className="h-4 w-4 mr-2" />
                Add Role
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Add New Role</DialogTitle>
                <DialogDescription>
                  Create a new role and assign permissions to it.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleAddRole}>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <label htmlFor="role-name" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                      Role Name
                    </label>
                    <Input
                      id="role-name"
                      placeholder="Enter role name"
                      value={newRoleName}
                      onChange={(e) => setNewRoleName(e.target.value)}

                    />
                  </div>
                  <div className="grid gap-2">
                    <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Permissions</label>
                    <div
                      className="grid grid-cols-2 gap-3 max-h-48 overflow-y-auto"

                    >
                      {availablePermissions.map((permission) => (
                        <div
                          key={permission.id}
                          className="flex items-center space-x-2"

                        >
                          <Checkbox
                            id={permission.id}
                            checked={selectedPermissions.includes(permission.id)}
                            onChange={(e) =>
                              handlePermissionChange(
                                permission.id,
                                e.target.checked
                              )
                            }

                          />

                          <label
                            htmlFor={permission.id}
                            className="text-sm font-normal"

                          >
                            {permission.label}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsAddModalOpen(false)}

                  >
                    Cancel
                  </Button>
                  <Button type="submit">
                    Create Role
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Roles Table */}
        <div
          className="bg-white rounded-lg shadow-sm border"

        >
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-16">
                  No
                </TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Created At</TableHead>
                <TableHead>Permissions</TableHead>
                <TableHead className="w-24">
                  Action
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {currentRoles.map((role, index) => (
                <TableRow key={role.id}>
                  <TableCell className="font-medium">
                    {String(startIndex + index + 1).padStart(2, "0")}
                  </TableCell>
                  <TableCell className="font-medium">
                    {role.name}
                  </TableCell>
                  <TableCell className="text-gray-600">
                    {role.createdAt}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {role.permissions.slice(0, 3).map((permission) => (
                        <span
                          key={permission}
                          className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"

                        >
                          {permission}
                        </span>
                      ))}
                      {role.permissions.length > 3 && (
                        <span
                          className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800"

                        >
                          +{role.permissions.length - 3} more
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          className="h-8 w-8 p-0"

                        >
                          <MoreHorizontal
                            className="h-4 w-4"

                          />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <Eye className="mr-2 h-4 w-4" />
                          View
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-red-600"
                          onClick={() => handleDeleteRole(role.id)}

                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        <div
          className="flex items-center justify-between mt-6"

        >
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">
              Show
            </span>
            <Select
              value={itemsPerPage.toString()}
              onValueChange={(value) => {
                setItemsPerPage(Number(value));
                setCurrentPage(1);
              }}

            >
              <SelectTrigger className="w-20">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="5">
                  5
                </SelectItem>
                <SelectItem value="10">
                  10
                </SelectItem>
                <SelectItem value="20">
                  20
                </SelectItem>
                <SelectItem value="50">
                  50
                </SelectItem>
              </SelectContent>
            </Select>
            <span className="text-sm text-gray-600">
              entries
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}

            >
              <ChevronLeft className="h-4 w-4" />
            </Button>

            <div className="flex items-center gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                (page) => (
                  <Button
                    key={page}
                    variant={currentPage === page ? "default" : "outline"}
                    size="sm"
                    onClick={() => setCurrentPage(page)}
                    className="w-8 h-8"

                  >
                    {page}
                  </Button>
                ),
              )}
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                setCurrentPage(Math.min(totalPages, currentPage + 1))
              }
              disabled={currentPage === totalPages}

            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          <div className="text-sm text-gray-600">
            Showing {startIndex + 1} to{" "}
            {Math.min(endIndex, filteredRoles.length)} of {filteredRoles.length}{" "}
            entries
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

