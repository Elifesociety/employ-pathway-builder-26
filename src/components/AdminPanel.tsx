
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
import { Search, CheckCircle, XCircle, Users, Clock, Award, Filter, Download, FileText, MapPin } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

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
  const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set());

  const categories = [
    { value: "pennyekart-free", label: "Pennyekart Free Registration" },
    { value: "pennyekart-paid", label: "Pennyekart Paid Registration" },
    { value: "farmelife", label: "FarmeLife" },
    { value: "foodelife", label: "FoodeLife" },
    { value: "organelife", label: "OrganeLife" },
    { value: "entrelife", label: "EntreLife" },
    { value: "job-card", label: "Job Card (All Categories)" }
  ];

  // Load registrations from localStorage
  useEffect(() => {
    const data = JSON.parse(localStorage.getItem('sedp_registrations') || '[]');
    setRegistrations(data);
    setFilteredRegistrations(data);
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
    // Simple authentication - in a real app, this would be more secure
    if (credentials.username === "admin" && credentials.password === "admin123") {
      setIsLoggedIn(true);
      toast({
        title: "Login Successful",
        description: "Welcome to the admin panel",
      });
    } else {
      toast({
        title: "Login Failed",
        description: "Invalid credentials",
        variant: "destructive",
      });
    }
  };

  const generateUniqueId = (mobileNumber: string) => {
    const serialNumber = String(Date.now()).slice(-3).padStart(3, '0');
    return `EJC${mobileNumber}-${serialNumber}`;
  };

  const handleApproval = (registrationId: string, action: 'approve' | 'reject') => {
    const updatedRegistrations = registrations.map(reg => {
      if (reg.id === registrationId) {
        const updatedReg = {
          ...reg,
          status: action === 'approve' ? 'approved' as const : 'rejected' as const,
          approvedAt: new Date().toISOString(),
          uniqueId: action === 'approve' ? generateUniqueId(reg.mobileNumber) : undefined
        };

        if (action === 'approve') {
          // Simulate WhatsApp notification
          const categoryLabel = categories.find(cat => cat.value === reg.category)?.label || reg.category;
          console.log(`WhatsApp notification would be sent to ${reg.whatsappNumber}:`);
          console.log(`Hello ${reg.fullName}, your registration for ${categoryLabel} has been approved! Your unique ID is: ${updatedReg.uniqueId}`);
          
          toast({
            title: "Registration Approved",
            description: `${reg.fullName}'s registration has been approved. WhatsApp notification sent.`,
          });
        } else {
          toast({
            title: "Registration Rejected",
            description: `${reg.fullName}'s registration has been rejected.`,
          });
        }

        return updatedReg;
      }
      return reg;
    });

    setRegistrations(updatedRegistrations);
    localStorage.setItem('sedp_registrations', JSON.stringify(updatedRegistrations));
  };

  const exportToXML = (data: Registration[], filename: string) => {
    const xmlContent = `<?xml version="1.0" encoding="UTF-8"?>
<registrations>
${data.map(reg => `  <registration>
    <id>${reg.id}</id>
    <fullName>${reg.fullName}</fullName>
    <mobileNumber>${reg.mobileNumber}</mobileNumber>
    <whatsappNumber>${reg.whatsappNumber}</whatsappNumber>
    <address>${reg.address}</address>
    <panchayathDetails>${reg.panchayathDetails}</panchayathDetails>
    <category>${reg.category}</category>
    <status>${reg.status}</status>
    <submittedAt>${reg.submittedAt}</submittedAt>
    ${reg.approvedAt ? `<approvedAt>${reg.approvedAt}</approvedAt>` : ''}
    ${reg.uniqueId ? `<uniqueId>${reg.uniqueId}</uniqueId>` : ''}
  </registration>`).join('\n')}
</registrations>`;

    const blob = new Blob([xmlContent], { type: 'application/xml' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
    
    toast({
      title: "XML Export Complete",
      description: `Exported ${data.length} registrations`,
    });
  };

  const exportToPDF = (data: Registration[], filename: string) => {
    // Simple text-based PDF export (for a real PDF, you'd use a library like jsPDF)
    const content = `SEDP Registration Report
Generated: ${new Date().toLocaleString()}
Total Records: ${data.length}

${'='.repeat(80)}

${data.map((reg, index) => `
${index + 1}. ${reg.fullName}
   Mobile: ${reg.mobileNumber}
   WhatsApp: ${reg.whatsappNumber}
   Address: ${reg.address}
   Panchayath: ${reg.panchayathDetails}
   Category: ${categories.find(c => c.value === reg.category)?.label}
   Status: ${reg.status.toUpperCase()}
   Submitted: ${new Date(reg.submittedAt).toLocaleDateString()}
   ${reg.uniqueId ? `Unique ID: ${reg.uniqueId}` : ''}
   ${'-'.repeat(40)}
`).join('\n')}`;

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename.replace('.pdf', '.txt');
    link.click();
    URL.revokeObjectURL(url);
    
    toast({
      title: "Export Complete",
      description: `Exported ${data.length} registrations as text format`,
    });
  };

  const getCategoryRegistrations = (categoryValue: string) => {
    return registrations.filter(reg => reg.category === categoryValue);
  };

  const getPanchayathBreakdown = () => {
    const panchayathMap = new Map<string, Registration[]>();
    
    registrations.forEach(reg => {
      const panchayath = reg.panchayathDetails.trim();
      if (!panchayathMap.has(panchayath)) {
        panchayathMap.set(panchayath, []);
      }
      panchayathMap.get(panchayath)!.push(reg);
    });

    return Array.from(panchayathMap.entries())
      .map(([panchayath, regs]) => ({
        panchayath,
        totalRegistrations: regs.length,
        pendingCount: regs.filter(r => r.status === 'pending').length,
        approvedCount: regs.filter(r => r.status === 'approved').length,
        rejectedCount: regs.filter(r => r.status === 'rejected').length,
        registrations: regs
      }))
      .sort((a, b) => b.totalRegistrations - a.totalRegistrations);
  };

  const toggleCardExpansion = (cardId: string) => {
    const newExpanded = new Set(expandedCards);
    if (newExpanded.has(cardId)) {
      newExpanded.delete(cardId);
    } else {
      newExpanded.add(cardId);
    }
    setExpandedCards(newExpanded);
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
                  onChange={(e) => setCredentials({...credentials, username: e.target.value})}
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
                  onChange={(e) => setCredentials({...credentials, password: e.target.value})}
                  required
                />
              </div>
              <Button type="submit" className="w-full">Login</Button>
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
        <Button variant="outline" onClick={() => setIsLoggedIn(false)}>
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

          {/* Registrations List - Collapsible Cards */}
          <div className="space-y-4">
            {filteredRegistrations.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <p className="text-gray-500">No registrations found matching your criteria.</p>
                </CardContent>
              </Card>
            ) : (
              filteredRegistrations.map((registration) => (
                <Card key={registration.id}>
                  <Collapsible>
                    <CollapsibleTrigger asChild>
                      <CardContent className="p-4 cursor-pointer hover:bg-gray-50">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-4">
                            <div>
                              <h3 className="font-semibold">{registration.fullName}</h3>
                              <p className="text-sm text-gray-600">{registration.mobileNumber}</p>
                            </div>
                            <Badge variant={
                              registration.status === 'approved' ? 'default' :
                              registration.status === 'rejected' ? 'destructive' : 'secondary'
                            }>
                              {registration.status}
                            </Badge>
                            <Badge variant="outline">
                              {categories.find(c => c.value === registration.category)?.label}
                            </Badge>
                          </div>
                          <Button variant="ghost" size="sm">
                            View Details
                          </Button>
                        </div>
                      </CardContent>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <CardContent className="pt-0 pb-4 border-t">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                          <div className="space-y-2">
                            <p><strong>WhatsApp:</strong> {registration.whatsappNumber}</p>
                            <p><strong>Address:</strong> {registration.address}</p>
                            <p><strong>Panchayath:</strong> {registration.panchayathDetails}</p>
                          </div>
                          <div className="space-y-2">
                            <p><strong>Submitted:</strong> {new Date(registration.submittedAt).toLocaleDateString()}</p>
                            {registration.approvedAt && (
                              <p><strong>Processed:</strong> {new Date(registration.approvedAt).toLocaleDateString()}</p>
                            )}
                            {registration.uniqueId && (
                              <p><strong>Unique ID:</strong> <Badge variant="outline">{registration.uniqueId}</Badge></p>
                            )}
                          </div>
                        </div>
                        {registration.status === 'pending' && (
                          <div className="flex gap-2 mt-4">
                            <Button
                              size="sm"
                              onClick={() => handleApproval(registration.id, 'approve')}
                              className="bg-green-600 hover:bg-green-700"
                            >
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleApproval(registration.id, 'reject')}
                            >
                              <XCircle className="h-4 w-4 mr-1" />
                              Reject
                            </Button>
                          </div>
                        )}
                      </CardContent>
                    </CollapsibleContent>
                  </Collapsible>
                </Card>
              ))
            )}
          </div>
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
                        <Badge variant="secondary">{category.pending}</Badge>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Approved:</span>
                        <Badge variant="default">{category.approved}</Badge>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Rejected:</span>
                        <Badge variant="destructive">{category.rejected}</Badge>
                      </div>
                    </div>
                  </div>
                  <div className="mt-3">
                    <p className="text-sm text-gray-600">
                      {((category.count / stats.total) * 100 || 0).toFixed(1)}% of total registrations
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
                      exportToXML(categoryRegs, `${categoryLabel}_registrations.xml`);
                    }}
                  >
                    <Download className="h-4 w-4 mr-1" />
                    Export XML
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const categoryRegs = getCategoryRegistrations(selectedCategoryDetails!);
                      const categoryLabel = categories.find(c => c.value === selectedCategoryDetails)?.label;
                      exportToPDF(categoryRegs, `${categoryLabel}_registrations.pdf`);
                    }}
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
                            <Badge variant={
                              reg.status === 'approved' ? 'default' :
                              reg.status === 'rejected' ? 'destructive' : 'secondary'
                            }>
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
              <div className="mb-4 flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => exportToXML(registrations, 'all_panchayath_registrations.xml')}
                >
                  <Download className="h-4 w-4 mr-1" />
                  Export All XML
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => exportToPDF(registrations, 'all_panchayath_registrations.pdf')}
                >
                  <FileText className="h-4 w-4 mr-1" />
                  Export All PDF
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
                    <TableHead>% of Total</TableHead>
                    <TableHead>Export</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {panchayathBreakdown.map((item) => (
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
                        {((item.totalRegistrations / stats.total) * 100 || 0).toFixed(1)}%
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => exportToXML(item.registrations, `${item.panchayath}_registrations.xml`)}
                          >
                            XML
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
                  ))}
                </TableBody>
              </Table>
              
              {panchayathBreakdown.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  No registrations found to display panchayath breakdown.
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminPanel;
