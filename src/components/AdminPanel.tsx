
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Trash2, Download, FileText, MapPin, Award } from "lucide-react";

import AdminLogin from "./admin/AdminLogin";
import AdminStats from "./admin/AdminStats";
import RegistrationsTable from "./admin/RegistrationsTable";
import RegistrationFilters from "./admin/RegistrationFilters";
import FeeManagement from "./admin/FeeManagement";
import { useAdminData } from "@/hooks/useAdminData";
import { Registration, categories } from "@/types/admin";
import { generateUniqueId, exportToCSV, exportToPDF } from "@/utils/adminUtils";

const AdminPanel = () => {
  const { toast } = useToast();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const { registrations, categoryFees, updateRegistrations, updateCategoryFees } = useAdminData();
  const [filteredRegistrations, setFilteredRegistrations] = useState<Registration[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [selectedCategoryDetails, setSelectedCategoryDetails] = useState<string | null>(null);
  const [panchayathFilterCategory, setPanchayathFilterCategory] = useState("all");
  const [panchayathFilterStatus, setPanchayathFilterStatus] = useState("all");
  const [editingRegistration, setEditingRegistration] = useState<Registration | null>(null);
  const [editingFees, setEditingFees] = useState(false);
  const [selectedRegistrations, setSelectedRegistrations] = useState<string[]>([]);
  const [changeCategoryDialog, setChangeCategoryDialog] = useState<{ open: boolean; registration: Registration | null }>({ open: false, registration: null });
  const [newCategory, setNewCategory] = useState("");

  // Filter registrations based on search and filters
  useEffect(() => {
    let filtered = registrations;

    if (searchTerm) {
      filtered = filtered.filter(reg => 
        reg.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        reg.mobileNumber.includes(searchTerm) ||
        reg.whatsappNumber.includes(searchTerm) ||
        reg.panchayathDetails.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filterCategory !== "all") {
      filtered = filtered.filter(reg => reg.category === filterCategory);
    }

    if (filterStatus !== "all") {
      filtered = filtered.filter(reg => reg.status === filterStatus);
    }

    setFilteredRegistrations(filtered);
  }, [registrations, searchTerm, filterCategory, filterStatus]);

  const handleApproval = (registrationId: string, action: 'approve' | 'reject') => {
    const updatedRegistrations = registrations.map(reg => {
      if (reg.id === registrationId) {
        const updatedReg = {
          ...reg,
          status: action === 'approve' ? 'approved' as const : 'rejected' as const,
          approvedAt: new Date().toISOString(),
          uniqueId: action === 'approve' ? generateUniqueId(reg.mobileNumber, reg.fullName) : undefined
        };

        if (action === 'approve') {
          toast({
            title: "Registration Approved",
            description: `${reg.fullName}'s registration has been approved. WhatsApp notification sent.`
          });
        } else {
          toast({
            title: "Registration Rejected",
            description: `${reg.fullName}'s registration has been rejected.`
          });
        }
        return updatedReg;
      }
      return reg;
    });

    updateRegistrations(updatedRegistrations);
  };

  const handleCategoryChange = (registrationId: string, newCategoryValue: string) => {
    const updatedRegistrations = registrations.map(reg => {
      if (reg.id === registrationId) {
        return { ...reg, category: newCategoryValue };
      }
      return reg;
    });

    updateRegistrations(updatedRegistrations);
    
    const categoryLabel = categories.find(cat => cat.value === newCategoryValue)?.label;
    toast({
      title: "Category Updated",
      description: `Registration category changed to ${categoryLabel}`
    });
  };

  const handleDeleteRegistration = (registrationId: string) => {
    const updatedRegistrations = registrations.filter(reg => reg.id !== registrationId);
    updateRegistrations(updatedRegistrations);
    
    toast({
      title: "Registration Deleted",
      description: "Registration has been permanently deleted"
    });
  };

  const handleBulkDelete = () => {
    if (selectedRegistrations.length === 0) return;

    const updatedRegistrations = registrations.filter(reg => !selectedRegistrations.includes(reg.id));
    updateRegistrations(updatedRegistrations);
    setSelectedRegistrations([]);
    
    toast({
      title: "Bulk Delete Complete",
      description: `${selectedRegistrations.length} registrations have been deleted`
    });
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedRegistrations(filteredRegistrations.map(reg => reg.id));
    } else {
      setSelectedRegistrations([]);
    }
  };

  const handleSelectRegistration = (registrationId: string, checked: boolean) => {
    if (checked) {
      setSelectedRegistrations([...selectedRegistrations, registrationId]);
    } else {
      setSelectedRegistrations(selectedRegistrations.filter(id => id !== registrationId));
    }
  };

  const handleEditRegistration = (registration: Registration) => {
    setEditingRegistration({ ...registration });
  };

  const handleSaveEdit = () => {
    if (!editingRegistration) return;

    const updatedRegistrations = registrations.map(reg => 
      reg.id === editingRegistration.id ? editingRegistration : reg
    );

    updateRegistrations(updatedRegistrations);
    setEditingRegistration(null);
    
    toast({
      title: "Registration Updated",
      description: "Registration details have been successfully updated."
    });
  };

  const handleFeeUpdate = (category: string, field: 'actualFee' | 'offerFee' | 'hasOffer', value: number | boolean) => {
    const updatedFees = categoryFees.map(fee => 
      fee.category === category ? { ...fee, [field]: value } : fee
    );
    updateCategoryFees(updatedFees);
  };

  const saveFees = () => {
    setEditingFees(false);
    toast({
      title: "Fees Updated",
      description: "Category fees have been successfully updated."
    });
  };

  const getCategoryRegistrations = (categoryValue: string) => {
    return registrations.filter(reg => reg.category === categoryValue);
  };

  const getPanchayathBreakdown = () => {
    let filteredData = registrations;

    if (panchayathFilterCategory !== "all") {
      filteredData = filteredData.filter(reg => reg.category === panchayathFilterCategory);
    }

    if (panchayathFilterStatus !== "all") {
      filteredData = filteredData.filter(reg => reg.status === panchayathFilterStatus);
    }

    const panchayathMap = new Map<string, Registration[]>();
    filteredData.forEach(reg => {
      const panchayath = reg.panchayathDetails.trim();
      if (!panchayathMap.has(panchayath)) {
        panchayathMap.set(panchayath, []);
      }
      panchayathMap.get(panchayath)!.push(reg);
    });

    return Array.from(panchayathMap.entries()).map(([panchayath, regs]) => ({
      panchayath,
      totalRegistrations: regs.length,
      pendingCount: regs.filter(r => r.status === 'pending').length,
      approvedCount: regs.filter(r => r.status === 'approved').length,
      rejectedCount: regs.filter(r => r.status === 'rejected').length,
      registrations: regs
    })).sort((a, b) => b.totalRegistrations - a.totalRegistrations);
  };

  const getCategoryStats = () => {
    return categories.map(category => {
      const categoryRegs = registrations.filter(r => r.category === category.value);
      const count = categoryRegs.length;
      const pending = categoryRegs.filter(r => r.status === 'pending').length;
      const approved = categoryRegs.filter(r => r.status === 'approved').length;
      const rejected = categoryRegs.filter(r => r.status === 'rejected').length;
      return { ...category, count, pending, approved, rejected };
    });
  };

  if (!isLoggedIn) {
    return <AdminLogin onLogin={() => setIsLoggedIn(true)} />;
  }

  const categoryStats = getCategoryStats();
  const panchayathBreakdown = getPanchayathBreakdown();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Admin Dashboard</h2>
          <p className="text-gray-600">Manage registrations and approvals</p>
        </div>
        <Button 
          variant="outline" 
          onClick={() => setIsLoggedIn(false)} 
          className="bg-[#ff5353] text-zinc-50 font-bold"
        >
          Logout
        </Button>
      </div>

      {/* Stats Cards */}
      <AdminStats registrations={registrations} />

      <Tabs defaultValue="registrations" className="w-full">
        <TabsList>
          <TabsTrigger value="registrations">All Registrations</TabsTrigger>
          <TabsTrigger value="categories">Category Breakdown</TabsTrigger>
          <TabsTrigger value="panchayath">Panchayath Breakdown</TabsTrigger>
          <TabsTrigger value="fees">Fee Management</TabsTrigger>
        </TabsList>

        <TabsContent value="registrations" className="space-y-4">
          {/* Filters */}
          <Card>
            <CardContent className="p-4">
              <RegistrationFilters
                searchTerm={searchTerm}
                filterCategory={filterCategory}
                filterStatus={filterStatus}
                onSearchChange={setSearchTerm}
                onCategoryChange={setFilterCategory}
                onStatusChange={setFilterStatus}
              />
            </CardContent>
          </Card>

          {/* Bulk Actions */}
          {selectedRegistrations.length > 0 && (
            <Card className="border-orange-200 bg-orange-50">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">
                    {selectedRegistrations.length} registration(s) selected
                  </span>
                  <div className="flex gap-2">
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="destructive" size="sm">
                          <Trash2 className="h-4 w-4 mr-1" />
                          Delete Selected
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Confirm Bulk Delete</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete {selectedRegistrations.length} selected registration(s)? 
                            This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={handleBulkDelete} className="bg-red-600 hover:bg-red-700">
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => setSelectedRegistrations([])}
                    >
                      Clear Selection
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Registrations Table */}
          <Card>
            <CardContent className="p-0">
              <RegistrationsTable
                registrations={filteredRegistrations}
                selectedRegistrations={selectedRegistrations}
                onSelectAll={handleSelectAll}
                onSelectRegistration={handleSelectRegistration}
                onApproval={handleApproval}
                onEdit={handleEditRegistration}
                onDelete={handleDeleteRegistration}
                onChangeCategory={(registration) => setChangeCategoryDialog({ open: true, registration })}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="categories" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {categoryStats.map((category) => (
              <Card key={category.value} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center justify-between">
                    <span className={category.value === 'job-card' ? 'text-yellow-700' : ''}>
                      {category.label}
                      {category.value === 'job-card' && <span className="ml-2">⭐</span>}
                    </span>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => setSelectedCategoryDetails(category.value)}
                    >
                      View Details
                    </Button>
                  </CardTitle>
                  <CardDescription>Registration statistics for this category</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">{category.count}</div>
                      <p className="text-xs text-gray-600">Total</p>
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span>Pending:</span>
                        <Badge variant="secondary" className="bg-[#ffe015]">{category.pending}</Badge>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Approved:</span>
                        <Badge variant="default" className="bg-[#07ad07]">{category.approved}</Badge>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Rejected:</span>
                        <Badge variant="destructive">{category.rejected}</Badge>
                      </div>
                    </div>
                  </div>
                  <div className="mt-3">
                    <p className="text-sm text-gray-600">
                      {(category.count / registrations.length * 100 || 0).toFixed(1)}% of total registrations
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Category Details Dialog */}
          <Dialog open={!!selectedCategoryDetails} onOpenChange={() => setSelectedCategoryDetails(null)}>
            <DialogContent className="max-w-6xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {categories.find(c => c.value === selectedCategoryDetails)?.label} - Detailed View
                </DialogTitle>
                <DialogDescription>
                  All registrations for this category with export options
                </DialogDescription>
                <div className="flex gap-2 mt-4">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => {
                      const categoryRegs = getCategoryRegistrations(selectedCategoryDetails!);
                      const categoryLabel = categories.find(c => c.value === selectedCategoryDetails)?.label;
                      exportToCSV(categoryRegs, `${categoryLabel}_registrations.csv`);
                    }}
                    className="bg-[#018301] text-slate-50"
                  >
                    <Download className="h-4 w-4 mr-1" />
                    Export CSV
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => {
                      const categoryRegs = getCategoryRegistrations(selectedCategoryDetails!);
                      const categoryLabel = categories.find(c => c.value === selectedCategoryDetails)?.label;
                      exportToPDF(categoryRegs, `${categoryLabel}_registrations.pdf`);
                    }}
                    className="bg-[#ed0505] text-gray-50"
                  >
                    <FileText className="h-4 w-4 mr-1" />
                    Export PDF
                  </Button>
                </div>
              </DialogHeader>
              
              {selectedCategoryDetails && (
                <div className="mt-4">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>S.No</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Mobile</TableHead>
                        <TableHead>WhatsApp</TableHead>
                        <TableHead>Panchayath</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Submitted</TableHead>
                        <TableHead>Unique ID</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {getCategoryRegistrations(selectedCategoryDetails).map((reg, index) => (
                        <TableRow key={reg.id}>
                          <TableCell className="font-medium">{index + 1}</TableCell>
                          <TableCell className="font-medium">{reg.fullName}</TableCell>
                          <TableCell>{reg.mobileNumber}</TableCell>
                          <TableCell>{reg.whatsappNumber}</TableCell>
                          <TableCell>{reg.panchayathDetails}</TableCell>
                          <TableCell>
                            <Badge 
                              variant={
                                reg.status === 'approved' ? 'default' : 
                                reg.status === 'rejected' ? 'destructive' : 'secondary'
                              }
                            >
                              {reg.status}
                            </Badge>
                          </TableCell>
                          <TableCell>{new Date(reg.submittedAt).toLocaleDateString()}</TableCell>
                          <TableCell>{reg.uniqueId || '-'}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </DialogContent>
          </Dialog>
        </TabsContent>

        <TabsContent value="panchayath" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Panchayath-wise Registration Breakdown
              </CardTitle>
              <CardDescription>Registration statistics organized by Panchayath areas</CardDescription>
            </CardHeader>
            <CardContent>
              {/* Panchayath Filters */}
              <div className="flex flex-col md:flex-row gap-4 mb-6">
                <Select value={panchayathFilterCategory} onValueChange={setPanchayathFilterCategory}>
                  <SelectTrigger className="w-full md:w-[200px]">
                    <SelectValue placeholder="Filter by category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {categories.map(category => (
                      <SelectItem key={category.value} value={category.value}>
                        {category.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={panchayathFilterStatus} onValueChange={setPanchayathFilterStatus}>
                  <SelectTrigger className="w-full md:w-[150px]">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="mb-4 flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => {
                    const filteredRegs = registrations.filter(reg => {
                      if (panchayathFilterCategory !== "all" && reg.category !== panchayathFilterCategory) return false;
                      if (panchayathFilterStatus !== "all" && reg.status !== panchayathFilterStatus) return false;
                      return true;
                    });
                    exportToCSV(filteredRegs, 'panchayath_breakdown_registrations.csv');
                  }}
                >
                  <Download className="h-4 w-4 mr-1" />
                  Export Filtered CSV
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => {
                    const filteredRegs = registrations.filter(reg => {
                      if (panchayathFilterCategory !== "all" && reg.category !== panchayathFilterCategory) return false;
                      if (panchayathFilterStatus !== "all" && reg.status !== panchayathFilterStatus) return false;
                      return true;
                    });
                    exportToPDF(filteredRegs, 'panchayath_breakdown_registrations.pdf');
                  }}
                >
                  <FileText className="h-4 w-4 mr-1" />
                  Export Filtered PDF
                </Button>
              </div>
              
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Panchayath</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Pending</TableHead>
                    <TableHead>Approved</TableHead>
                    <TableHead>Rejected</TableHead>
                    <TableHead>% of Filtered</TableHead>
                    <TableHead>Export</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {panchayathBreakdown.map((item) => {
                    const totalFiltered = panchayathBreakdown.reduce((sum, p) => sum + p.totalRegistrations, 0);
                    return (
                      <TableRow key={item.panchayath}>
                        <TableCell className="font-medium">{item.panchayath}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{item.totalRegistrations}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">{item.pendingCount}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="default">{item.approvedCount}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="destructive">{item.rejectedCount}</Badge>
                        </TableCell>
                        <TableCell>
                          {(item.totalRegistrations / totalFiltered * 100 || 0).toFixed(1)}%
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={() => exportToCSV(item.registrations, `${item.panchayath}_registrations.csv`)}
                            >
                              CSV
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={() => exportToPDF(item.registrations, `${item.panchayath}_registrations.pdf`)}
                            >
                              PDF
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
              
              {panchayathBreakdown.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  No registrations found matching the selected filters.
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="fees" className="space-y-4">
          <FeeManagement
            categoryFees={categoryFees}
            editingFees={editingFees}
            onEditStart={() => setEditingFees(true)}
            onEditCancel={() => setEditingFees(false)}
            onSave={saveFees}
            onFeeUpdate={handleFeeUpdate}
          />
        </TabsContent>
      </Tabs>

      {/* Edit Registration Dialog */}
      <Dialog open={!!editingRegistration} onOpenChange={() => setEditingRegistration(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Registration Details</DialogTitle>
            <DialogDescription>
              Update the registration information below
            </DialogDescription>
          </DialogHeader>
          
          {editingRegistration && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Full Name</Label>
                  <Input
                    value={editingRegistration.fullName}
                    onChange={(e) => setEditingRegistration({
                      ...editingRegistration,
                      fullName: e.target.value
                    })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Mobile Number</Label>
                  <Input
                    value={editingRegistration.mobileNumber}
                    onChange={(e) => setEditingRegistration({
                      ...editingRegistration,
                      mobileNumber: e.target.value
                    })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>WhatsApp Number</Label>
                  <Input
                    value={editingRegistration.whatsappNumber}
                    onChange={(e) => setEditingRegistration({
                      ...editingRegistration,
                      whatsappNumber: e.target.value
                    })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Panchayath</Label>
                  <Input
                    value={editingRegistration.panchayathDetails}
                    onChange={(e) => setEditingRegistration({
                      ...editingRegistration,
                      panchayathDetails: e.target.value
                    })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Address</Label>
                <Textarea
                  value={editingRegistration.address}
                  onChange={(e) => setEditingRegistration({
                    ...editingRegistration,
                    address: e.target.value
                  })}
                  rows={3}
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setEditingRegistration(null)}>
                  Cancel
                </Button>
                <Button onClick={handleSaveEdit} className="bg-green-600 hover:bg-green-700">
                  Save Changes
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Change Category Dialog */}
      <Dialog 
        open={changeCategoryDialog.open} 
        onOpenChange={(open) => setChangeCategoryDialog({ open, registration: null })}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change Category</DialogTitle>
            <DialogDescription>
              Select a new category for {changeCategoryDialog.registration?.fullName}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <Select value={newCategory} onValueChange={setNewCategory}>
              <SelectTrigger>
                <SelectValue placeholder="Select new category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map(category => (
                  <SelectItem key={category.value} value={category.value}>
                    {category.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <div className="flex justify-end gap-2">
              <Button 
                variant="outline" 
                onClick={() => setChangeCategoryDialog({ open: false, registration: null })}
              >
                Cancel
              </Button>
              <Button 
                onClick={() => {
                  if (changeCategoryDialog.registration && newCategory) {
                    handleCategoryChange(changeCategoryDialog.registration.id, newCategory);
                    setChangeCategoryDialog({ open: false, registration: null });
                    setNewCategory("");
                  }
                }}
                disabled={!newCategory}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Update Category
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminPanel;
