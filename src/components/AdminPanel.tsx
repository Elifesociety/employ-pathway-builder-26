
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
import { Trash2, Download, FileText, MapPin } from "lucide-react";

import AdminLogin from "./admin/AdminLogin";
import AdminStats from "./admin/AdminStats";
import RegistrationsTable from "./admin/RegistrationsTable";
import RegistrationFilters from "./admin/RegistrationFilters";
import PanchayathSearchFilter from "./admin/PanchayathSearchFilter";
import PhotoGalleryManager from "./admin/PhotoGalleryManager";
import PanchayathManager from "./admin/PanchayathManager";
import { useAdminData } from "@/hooks/useAdminData";
import { Registration, categories } from "@/types/admin";
import { generateUniqueId, exportToCSV, exportToPDF } from "@/utils/adminUtils";

const AdminPanel = () => {
  const { toast } = useToast();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const { 
    registrations, 
    categoryFees, 
    panchayaths, 
    announcements, 
    photoGallery, 
    notifications,
    updateRegistrations, 
    updateCategoryFees,
    updatePanchayaths,
    updateAnnouncements,
    updatePhotoGallery,
    updateNotifications
  } = useAdminData();
  
  const [filteredRegistrations, setFilteredRegistrations] = useState<Registration[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [selectedCategoryDetails, setSelectedCategoryDetails] = useState<string | null>(null);
  const [panchayathFilterCategory, setPanchayathFilterCategory] = useState("all");
  const [panchayathFilterStatus, setPanchayathFilterStatus] = useState("all");
  const [editingRegistration, setEditingRegistration] = useState<Registration | null>(null);
  const [selectedRegistrations, setSelectedRegistrations] = useState<string[]>([]);
  const [changeCategoryDialog, setChangeCategoryDialog] = useState<{ open: boolean; registration: Registration | null }>({ open: false, registration: null });
  const [newCategory, setNewCategory] = useState("");
  const [selectedPanchayath, setSelectedPanchayath] = useState("all");

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

    if (selectedPanchayath !== "all") {
      filtered = filtered.filter(reg => reg.panchayathDetails === selectedPanchayath);
    }

    setFilteredRegistrations(filtered);
  }, [registrations, searchTerm, filterCategory, filterStatus, selectedPanchayath]);

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
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex-1 min-w-0">
          <h2 className="text-xl sm:text-2xl font-bold break-words">Admin Dashboard</h2>
          <p className="text-sm sm:text-base text-gray-600">Manage registrations, content, and system settings</p>
        </div>
        <Button 
          variant="outline" 
          onClick={() => setIsLoggedIn(false)} 
          className="bg-[#ff5353] text-zinc-50 font-bold flex-shrink-0"
        >
          Logout
        </Button>
      </div>

      {/* Stats Cards */}
      <AdminStats registrations={registrations} />

      <Tabs defaultValue="registrations" className="w-full">
        <div className="overflow-x-auto">
          <TabsList className="grid w-full grid-cols-4 lg:grid-cols-7 min-w-[800px]">
            <TabsTrigger value="registrations" className="text-xs sm:text-sm">Registrations</TabsTrigger>
            <TabsTrigger value="categories" className="text-xs sm:text-sm">Categories</TabsTrigger>
            <TabsTrigger value="panchayath" className="text-xs sm:text-sm">Panchayath</TabsTrigger>
            <TabsTrigger value="fees" className="text-xs sm:text-sm">Fees & Images</TabsTrigger>
            <TabsTrigger value="panchayath-mgmt" className="text-xs sm:text-sm">Panchayath Mgmt</TabsTrigger>
            <TabsTrigger value="content" className="text-xs sm:text-sm">Content</TabsTrigger>
            <TabsTrigger value="notifications" className="text-xs sm:text-sm">Notifications</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="registrations" className="space-y-4">
          {/* Filters */}
          <Card>
            <CardContent className="p-4">
              <div className="space-y-4">
                <RegistrationFilters
                  searchTerm={searchTerm}
                  filterCategory={filterCategory}
                  filterStatus={filterStatus}
                  onSearchChange={setSearchTerm}
                  onCategoryChange={setFilterCategory}
                  onStatusChange={setFilterStatus}
                />
                <PanchayathSearchFilter
                  panchayaths={panchayaths}
                  selectedPanchayath={selectedPanchayath}
                  onPanchayathChange={setSelectedPanchayath}
                  filterCategory={filterCategory}
                  filterStatus={filterStatus}
                  onCategoryChange={setFilterCategory}
                  onStatusChange={setFilterStatus}
                />
              </div>
            </CardContent>
          </Card>

          {/* Bulk Actions */}
          {selectedRegistrations.length > 0 && (
            <Card className="border-orange-200 bg-orange-50">
              <CardContent className="p-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                  <span className="text-sm font-medium">
                    {selectedRegistrations.length} registration(s) selected
                  </span>
                  <div className="flex gap-2">
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="destructive" size="sm">
                          <Trash2 className="h-4 w-4 mr-1" />
                          <span className="hidden sm:inline">Delete Selected</span>
                          <span className="sm:hidden">Delete</span>
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
                      <span className="hidden sm:inline">Clear Selection</span>
                      <span className="sm:hidden">Clear</span>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Registrations Table */}
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
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
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="categories" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {categoryStats.map((category) => (
              <Card key={category.value} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="text-base sm:text-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                    <span className={`break-words ${category.value === 'job-card' ? 'text-yellow-700' : ''}`}>
                      {category.label}
                      {category.value === 'job-card' && <span className="ml-2">⭐</span>}
                    </span>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => setSelectedCategoryDetails(category.value)}
                      className="flex-shrink-0"
                    >
                      <span className="hidden sm:inline">View Details</span>
                      <span className="sm:hidden">Details</span>
                    </Button>
                  </CardTitle>
                  <CardDescription className="text-sm">Registration statistics for this category</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center">
                      <div className="text-xl sm:text-2xl font-bold text-blue-600">{category.count}</div>
                      <p className="text-xs text-gray-600">Total</p>
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs sm:text-sm">
                        <span>Pending:</span>
                        <Badge variant="secondary" className="bg-[#ffe015] text-xs">{category.pending}</Badge>
                      </div>
                      <div className="flex justify-between text-xs sm:text-sm">
                        <span>Approved:</span>
                        <Badge variant="default" className="bg-[#07ad07] text-xs">{category.approved}</Badge>
                      </div>
                      <div className="flex justify-between text-xs sm:text-sm">
                        <span>Rejected:</span>
                        <Badge variant="destructive" className="text-xs">{category.rejected}</Badge>
                      </div>
                    </div>
                  </div>
                  <div className="mt-3">
                    <p className="text-xs sm:text-sm text-gray-600">
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
                <DialogTitle className="text-base sm:text-lg break-words">
                  {categories.find(c => c.value === selectedCategoryDetails)?.label} - Detailed View
                </DialogTitle>
                <DialogDescription className="text-sm">
                  All registrations for this category with export options
                </DialogDescription>
                <div className="flex flex-col sm:flex-row gap-2 mt-4">
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
                <div className="mt-4 overflow-x-auto">
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
                          <TableCell className="font-medium break-words">{reg.fullName}</TableCell>
                          <TableCell>{reg.mobileNumber}</TableCell>
                          <TableCell>{reg.whatsappNumber}</TableCell>
                          <TableCell className="break-words">{reg.panchayathDetails}</TableCell>
                          <TableCell>
                            <Badge 
                              variant={
                                reg.status === 'approved' ? 'default' : 
                                reg.status === 'rejected' ? 'destructive' : 'secondary'
                              }
                              className="text-xs"
                            >
                              {reg.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-xs">{new Date(reg.submittedAt).toLocaleDateString()}</TableCell>
                          <TableCell className="break-all text-xs">{reg.uniqueId || '-'}</TableCell>
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
              <CardTitle className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
                <MapPin className="h-5 w-5 flex-shrink-0" />
                <span className="break-words">Panchayath-wise Registration Breakdown</span>
              </CardTitle>
              <CardDescription className="text-sm">Registration statistics organized by Panchayath areas</CardDescription>
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

              <div className="mb-4 flex flex-col sm:flex-row gap-2">
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
                  <span className="hidden sm:inline">Export Filtered CSV</span>
                  <span className="sm:hidden">CSV</span>
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
                  <span className="hidden sm:inline">Export Filtered PDF</span>
                  <span className="sm:hidden">PDF</span>
                </Button>
              </div>
              
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Panchayath</TableHead>
                      <TableHead>Total</TableHead>
                      <TableHead>Pending</TableHead>
                      <TableHead>Approved</TableHead>
                      <TableHead>Rejected</TableHead>
                      <TableHead className="hidden sm:table-cell">% of Filtered</TableHead>
                      <TableHead>Export</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {panchayathBreakdown.map((item) => {
                      const totalFiltered = panchayathBreakdown.reduce((sum, p) => sum + p.totalRegistrations, 0);
                      return (
                        <TableRow key={item.panchayath}>
                          <TableCell className="font-medium break-words min-w-[120px]">{item.panchayath}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className="text-xs">{item.totalRegistrations}</Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant="secondary" className="text-xs">{item.pendingCount}</Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant="default" className="text-xs">{item.approvedCount}</Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant="destructive" className="text-xs">{item.rejectedCount}</Badge>
                          </TableCell>
                          <TableCell className="hidden sm:table-cell text-xs">
                            {(item.totalRegistrations / totalFiltered * 100 || 0).toFixed(1)}%
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-1">
                              <Button 
                                variant="outline" 
                                size="sm" 
                                onClick={() => exportToCSV(item.registrations, `${item.panchayath}_registrations.csv`)}
                                className="text-xs px-2"
                              >
                                CSV
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm" 
                                onClick={() => exportToPDF(item.registrations, `${item.panchayath}_registrations.pdf`)}
                                className="text-xs px-2"
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
              </div>
              
              {panchayathBreakdown.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  No registrations found matching the selected filters.
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="fees" className="space-y-4">
          <div className="text-center py-8 text-gray-500">
            Fee Management component will be implemented soon.
          </div>
        </TabsContent>

        <TabsContent value="panchayath-mgmt" className="space-y-4">
          <PanchayathManager
            panchayaths={panchayaths}
            onUpdate={updatePanchayaths}
          />
        </TabsContent>

        <TabsContent value="content" className="space-y-4">
          <div className="grid grid-cols-1 gap-6">
            <PhotoGalleryManager
              gallery={photoGallery}
              onUpdate={updatePhotoGallery}
            />
          </div>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-4">
          <div className="text-center py-8 text-gray-500">
            Notification Management component will be implemented soon.
          </div>
        </TabsContent>
      </Tabs>

      {/* Edit Registration Dialog */}
      <Dialog open={!!editingRegistration} onOpenChange={() => setEditingRegistration(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
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
              <div className="flex flex-col sm:flex-row justify-end gap-2">
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
            
            <div className="flex flex-col sm:flex-row justify-end gap-2">
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
