import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, CheckCircle, XCircle, Users, Clock, Award, Filter, Download, FileText, MapPin, Edit, Save, X, Trash2, Upload } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

interface Registration {
  id: string;
  fullName: string;
  mobileNumber: string;
  whatsappNumber: string;
  address: string;
  panchayathDetails: string;
  category: string;
  status: 'pending' | 'approved' | 'rejected';
  submittedAt: string;
  approvedAt?: string;
  uniqueId?: string;
}

interface CategoryFee {
  category: string;
  actualFee: number;
  offerFee: number;
  hasOffer: boolean;
  image?: string;
}

const AdminPanel = () => {
  const { toast } = useToast();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [credentials, setCredentials] = useState({ username: "", password: "" });
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [filteredRegistrations, setFilteredRegistrations] = useState<Registration[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [selectedCategoryDetails, setSelectedCategoryDetails] = useState<string | null>(null);
  const [panchayathFilterCategory, setPanchayathFilterCategory] = useState("all");
  const [panchayathFilterStatus, setPanchayathFilterStatus] = useState("all");
  const [editingRegistration, setEditingRegistration] = useState<Registration | null>(null);
  const [categoryFees, setCategoryFees] = useState<CategoryFee[]>([]);
  const [editingFees, setEditingFees] = useState(false);
  const [selectedRegistrations, setSelectedRegistrations] = useState<string[]>([]);
  const [changeCategoryDialog, setChangeCategoryDialog] = useState<{ open: boolean; registration: Registration | null }>({ open: false, registration: null });
  const [newCategory, setNewCategory] = useState("");

  const categories = [
    { value: "pennyekart-free", label: "Pennyekart Free Registration" },
    { value: "pennyekart-paid", label: "Pennyekart Paid Registration" },
    { value: "farmelife", label: "FarmeLife" },
    { value: "foodelife", label: "FoodeLife" },
    { value: "organelife", label: "OrganeLife" },
    { value: "entrelife", label: "EntreLife" },
    { value: "job-card", label: "Job Card (All Categories)" }
  ];

  // Load data from localStorage
  useEffect(() => {
    const data = JSON.parse(localStorage.getItem('sedp_registrations') || '[]');
    setRegistrations(data);
    setFilteredRegistrations(data);

    const fees = JSON.parse(localStorage.getItem('sedp_category_fees') || '[]');
    if (fees.length === 0) {
      // Initialize default fees with dual structure
      const defaultFees = categories.map(cat => ({
        category: cat.value,
        actualFee: cat.value === 'pennyekart-free' ? 0 : cat.value === 'job-card' ? 2000 : 1000,
        offerFee: cat.value === 'pennyekart-free' ? 0 : cat.value === 'job-card' ? 800 : 400,
        hasOffer: cat.value !== 'pennyekart-free',
        image: ''
      }));
      setCategoryFees(defaultFees);
      localStorage.setItem('sedp_category_fees', JSON.stringify(defaultFees));
    } else {
      setCategoryFees(fees);
    }
  }, []);

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

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (credentials.username === "admin" && credentials.password === "admin123") {
      setIsLoggedIn(true);
      toast({
        title: "Login Successful",
        description: "Welcome to the admin panel"
      });
    } else {
      toast({
        title: "Login Failed",
        description: "Invalid credentials",
        variant: "destructive"
      });
    }
  };

  const generateUniqueId = (mobileNumber: string, fullName: string) => {
    const firstLetter = fullName.charAt(0).toUpperCase();
    return `ESP${mobileNumber}${firstLetter}`;
  };

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
          const categoryLabel = categories.find(cat => cat.value === reg.category)?.label || reg.category;
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

    setRegistrations(updatedRegistrations);
    localStorage.setItem('sedp_registrations', JSON.stringify(updatedRegistrations));
  };

  const handleCategoryChange = (registrationId: string, newCategoryValue: string) => {
    const updatedRegistrations = registrations.map(reg => {
      if (reg.id === registrationId) {
        return { ...reg, category: newCategoryValue };
      }
      return reg;
    });

    setRegistrations(updatedRegistrations);
    localStorage.setItem('sedp_registrations', JSON.stringify(updatedRegistrations));
    
    const categoryLabel = categories.find(cat => cat.value === newCategoryValue)?.label;
    toast({
      title: "Category Updated",
      description: `Registration category changed to ${categoryLabel}`
    });
  };

  const handleDeleteRegistration = (registrationId: string) => {
    const updatedRegistrations = registrations.filter(reg => reg.id !== registrationId);
    setRegistrations(updatedRegistrations);
    localStorage.setItem('sedp_registrations', JSON.stringify(updatedRegistrations));
    
    toast({
      title: "Registration Deleted",
      description: "Registration has been permanently deleted"
    });
  };

  const handleBulkDelete = () => {
    if (selectedRegistrations.length === 0) return;

    const updatedRegistrations = registrations.filter(reg => !selectedRegistrations.includes(reg.id));
    setRegistrations(updatedRegistrations);
    localStorage.setItem('sedp_registrations', JSON.stringify(updatedRegistrations));
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

    setRegistrations(updatedRegistrations);
    localStorage.setItem('sedp_registrations', JSON.stringify(updatedRegistrations));
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
    setCategoryFees(updatedFees);
  };

  const handleImageUpload = (category: string, imageUrl: string) => {
    const updatedFees = categoryFees.map(fee => 
      fee.category === category ? { ...fee, image: imageUrl } : fee
    );
    setCategoryFees(updatedFees);
  };

  const saveFees = () => {
    localStorage.setItem('sedp_category_fees', JSON.stringify(categoryFees));
    setEditingFees(false);
    toast({
      title: "Fees Updated",
      description: "Category fees have been successfully updated."
    });
  };

  const getCategoryFee = (category: string) => {
    return categoryFees.find(fee => fee.category === category) || { actualFee: 0, offerFee: 0, hasOffer: false, image: '' };
  };

  const exportToCSV = (data: Registration[], filename: string) => {
    const headers = ['S.No', 'Full Name', 'Mobile Number', 'WhatsApp Number', 'Address', 'Panchayath', 'Category', 'Status', 'Submitted Date', 'Approved Date', 'Unique ID'];
    const csvContent = [
      headers.join(','),
      ...data.map((reg, index) => [
        index + 1,
        `"${reg.fullName}"`,
        reg.mobileNumber,
        reg.whatsappNumber,
        `"${reg.address.replace(/"/g, '""')}"`,
        `"${reg.panchayathDetails}"`,
        `"${categories.find(c => c.value === reg.category)?.label || reg.category}"`,
        reg.status.toUpperCase(),
        new Date(reg.submittedAt).toLocaleDateString(),
        reg.approvedAt ? new Date(reg.approvedAt).toLocaleDateString() : '',
        reg.uniqueId || ''
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
    
    toast({
      title: "CSV Export Complete",
      description: `Exported ${data.length} registrations`
    });
  };

  const exportToPDF = (data: Registration[], filename: string) => {
    const content = `SELF EMPLOYMENT DEVELOPMENT PROGRAM (SEDP)
REGISTRATION REPORT
${'='.repeat(80)}

Generated: ${new Date().toLocaleString()}
Total Records: ${data.length}
Report Type: ${filename.replace('.txt', '').replace(/_/g, ' ').toUpperCase()}

${'='.repeat(80)}

${data.map((reg, index) => `
${(index + 1).toString().padStart(3, '0')}. ${reg.fullName.toUpperCase()}
     Mobile: ${reg.mobileNumber} | WhatsApp: ${reg.whatsappNumber}
     Address: ${reg.address}
     Panchayath: ${reg.panchayathDetails}
     Category: ${categories.find(c => c.value === reg.category)?.label}
     Status: ${reg.status.toUpperCase()}
     Submitted: ${new Date(reg.submittedAt).toLocaleDateString()}${reg.approvedAt ? `
     Processed: ${new Date(reg.approvedAt).toLocaleDateString()}` : ''}${reg.uniqueId ? `
     Unique ID: ${reg.uniqueId}` : ''}
     ${'-'.repeat(70)}
`).join('')}

${'='.repeat(80)}
End of Report
Generated by SEDP Admin Panel
Contact: +91 9876543210 | Email: admin@sedp.com
${'='.repeat(80)}`;

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename.replace('.pdf', '.txt');
    link.click();
    URL.revokeObjectURL(url);
    
    toast({
      title: "PDF Export Complete",
      description: `Exported ${data.length} registrations as formatted text`
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

  const getStats = () => {
    const total = registrations.length;
    const pending = registrations.filter(r => r.status === 'pending').length;
    const approved = registrations.filter(r => r.status === 'approved').length;
    const rejected = registrations.filter(r => r.status === 'rejected').length;
    return { total, pending, approved, rejected };
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
    return (
      <div className="max-w-md mx-auto">
        <Card>
          <CardHeader className="text-center">
            <CardTitle>Admin Login</CardTitle>
            <CardDescription>Please enter your credentials to access the admin panel</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  type="text"
                  placeholder="Enter username"
                  value={credentials.username}
                  onChange={(e) => setCredentials({ ...credentials, username: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter password"
                  value={credentials.password}
                  onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
                  required
                />
              </div>
              <Button type="submit" className="w-full bg-[#00af9b] font-bold">
                Login
              </Button>
              <p className="text-sm text-gray-500 text-center">
                Demo credentials: admin / admin123
              </p>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  const stats = getStats();
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
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Registrations</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <Users className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-orange-600">{stats.pending}</p>
              </div>
              <Clock className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Approved</p>
                <p className="text-2xl font-bold text-green-600">{stats.approved}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Rejected</p>
                <p className="text-2xl font-bold text-red-600">{stats.rejected}</p>
              </div>
              <XCircle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>

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
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search by name, mobile, or panchayath..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <Select value={filterCategory} onValueChange={setFilterCategory}>
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
                <Select value={filterStatus} onValueChange={setFilterStatus}>
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
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">
                      <Checkbox
                        checked={selectedRegistrations.length === filteredRegistrations.length && filteredRegistrations.length > 0}
                        onCheckedChange={handleSelectAll}
                      />
                    </TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Mobile</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Submitted</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRegistrations.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                        No registrations found matching your criteria.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredRegistrations.map((registration) => (
                      <TableRow key={registration.id}>
                        <TableCell>
                          <Checkbox
                            checked={selectedRegistrations.includes(registration.id)}
                            onCheckedChange={(checked) => handleSelectRegistration(registration.id, !!checked)}
                          />
                        </TableCell>
                        <TableCell className="font-medium">{registration.fullName}</TableCell>
                        <TableCell>{registration.mobileNumber}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="bg-[#ffc508]">
                            {categories.find(c => c.value === registration.category)?.label}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge 
                            variant={
                              registration.status === 'approved' ? 'default' : 
                              registration.status === 'rejected' ? 'destructive' : 'secondary'
                            } 
                            className="bg-[#08b708]"
                          >
                            {registration.status}
                          </Badge>
                        </TableCell>
                        <TableCell>{new Date(registration.submittedAt).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={() => handleEditRegistration(registration)}
                            >
                              <Edit className="h-3 w-3" />
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={() => setChangeCategoryDialog({ open: true, registration })}
                            >
                              Change
                            </Button>
                            {registration.status === 'pending' && (
                              <>
                                <Button 
                                  size="sm" 
                                  onClick={() => handleApproval(registration.id, 'approve')}
                                  className="bg-green-600 hover:bg-green-700"
                                >
                                  <CheckCircle className="h-3 w-3" />
                                </Button>
                                <Button 
                                  size="sm" 
                                  variant="destructive" 
                                  onClick={() => handleApproval(registration.id, 'reject')}
                                >
                                  <XCircle className="h-3 w-3" />
                                </Button>
                              </>
                            )}
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="destructive" size="sm">
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Confirm Delete</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure you want to delete {registration.fullName}'s registration? 
                                    This action cannot be undone.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction 
                                    onClick={() => handleDeleteRegistration(registration.id)}
                                    className="bg-red-600 hover:bg-red-700"
                                  >
                                    Delete
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
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
                      {(category.count / stats.total * 100 || 0).toFixed(1)}% of total registrations
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
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Category Fee Management</CardTitle>
                  <CardDescription>Set registration fees and upload images for each category</CardDescription>
                </div>
                <div className="flex gap-2">
                  {editingFees ? (
                    <>
                      <Button onClick={saveFees} className="bg-green-600 hover:bg-green-700">
                        <Save className="h-4 w-4 mr-1" />
                        Save Changes
                      </Button>
                      <Button variant="outline" onClick={() => setEditingFees(false)}>
                        <X className="h-4 w-4 mr-1" />
                        Cancel
                      </Button>
                    </>
                  ) : (
                    <Button onClick={() => setEditingFees(true)}>
                      <Edit className="h-4 w-4 mr-1" />
                      Edit Fees
                    </Button>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {categories.map((category) => {
                  const currentFee = getCategoryFee(category.value);
                  return (
                    <Card key={category.value} className="p-4">
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="font-semibold text-lg">{category.label}</h3>
                            <p className="text-sm text-gray-600">{category.value}</p>
                          </div>
                          {currentFee.image && (
                            <img 
                              src={currentFee.image} 
                              alt={category.label}
                              className="w-16 h-16 object-cover rounded-lg"
                            />
                          )}
                        </div>
                        
                        {editingFees && (
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                              <Label>Actual Fee (₹)</Label>
                              <Input
                                type="number"
                                value={currentFee.actualFee}
                                onChange={(e) => handleFeeUpdate(category.value, 'actualFee', parseInt(e.target.value) || 0)}
                                min="0"
                              />
                            </div>
                            <div>
                              <Label>Offer Fee (₹)</Label>
                              <Input
                                type="number"
                                value={currentFee.offerFee}
                                onChange={(e) => handleFeeUpdate(category.value, 'offerFee', parseInt(e.target.value) || 0)}
                                min="0"
                              />
                            </div>
                            <div className="flex items-center space-x-2 pt-6">
                              <Checkbox
                                id={`offer-${category.value}`}
                                checked={currentFee.hasOffer}
                                onCheckedChange={(checked) => handleFeeUpdate(category.value, 'hasOffer', !!checked)}
                              />
                              <Label htmlFor={`offer-${category.value}`}>Enable Offer</Label>
                            </div>
                          </div>
                        )}
                        
                        {!editingFees && (
                          <div className="flex items-center gap-4">
                            <div className="text-sm">
                              <span className="font-medium">Fee: </span>
                              {currentFee.hasOffer && currentFee.offerFee < currentFee.actualFee ? (
                                <span>
                                  <del className="text-red-600">₹{currentFee.actualFee}</del>{' '}
                                  <span className="text-green-600 font-bold">₹{currentFee.offerFee}</span>
                                </span>
                              ) : currentFee.actualFee === 0 ? (
                                <span className="text-green-600 font-bold">FREE</span>
                              ) : (
                                <span className="font-bold">₹{currentFee.actualFee}</span>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </Card>
                  );
                })}
              </div>
            </CardContent>
          </Card>
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
