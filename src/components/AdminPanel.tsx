
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, CheckCircle, XCircle, Users, Clock, Award, Filter } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

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

  const categories = [
    { value: "pennyekart-free", label: "Pennyekart Free Registration" },
    { value: "pennyekart-paid", label: "Pennyekart Paid Registration" },
    { value: "farmelife", label: "FarmeLife" },
    { value: "foodelife", label: "FoodeLife" },
    { value: "organelife", label: "OrganeLife" },
    { value: "entrelife", label: "EntreLife" }
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
        reg.whatsappNumber.includes(searchTerm)
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

  const generateUniqueId = () => {
    return 'SEDP' + Date.now().toString().slice(-6) + Math.random().toString(36).substr(2, 3).toUpperCase();
  };

  const handleApproval = (registrationId: string, action: 'approve' | 'reject') => {
    const updatedRegistrations = registrations.map(reg => {
      if (reg.id === registrationId) {
        const updatedReg = {
          ...reg,
          status: action === 'approve' ? 'approved' as const : 'rejected' as const,
          approvedAt: new Date().toISOString(),
          uniqueId: action === 'approve' ? generateUniqueId() : undefined
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

  const getStats = () => {
    const total = registrations.length;
    const pending = registrations.filter(r => r.status === 'pending').length;
    const approved = registrations.filter(r => r.status === 'approved').length;
    const rejected = registrations.filter(r => r.status === 'rejected').length;

    return { total, pending, approved, rejected };
  };

  const getCategoryStats = () => {
    return categories.map(category => {
      const count = registrations.filter(r => r.category === category.value).length;
      return { ...category, count };
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
                      placeholder="Search by name or mobile number..."
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

          {/* Registrations List */}
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
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold">{registration.fullName}</h3>
                          <Badge variant={
                            registration.status === 'approved' ? 'default' :
                            registration.status === 'rejected' ? 'destructive' : 'secondary'
                          }>
                            {registration.status}
                          </Badge>
                          {registration.uniqueId && (
                            <Badge variant="outline">ID: {registration.uniqueId}</Badge>
                          )}
                        </div>
                        <div className="text-sm text-gray-600 space-y-1">
                          <p><strong>Mobile:</strong> {registration.mobileNumber}</p>
                          <p><strong>WhatsApp:</strong> {registration.whatsappNumber}</p>
                          <p><strong>Category:</strong> {categories.find(c => c.value === registration.category)?.label}</p>
                          <p><strong>Panchayath:</strong> {registration.panchayathDetails}</p>
                          <p><strong>Submitted:</strong> {new Date(registration.submittedAt).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <div className="flex flex-col gap-2">
                        {registration.status === 'pending' && (
                          <>
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
                          </>
                        )}
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="outline" size="sm">View Details</Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Registration Details</DialogTitle>
                              <DialogDescription>Complete information for {registration.fullName}</DialogDescription>
                            </DialogHeader>
                            <div className="space-y-3">
                              <div><strong>Full Name:</strong> {registration.fullName}</div>
                              <div><strong>Mobile Number:</strong> {registration.mobileNumber}</div>
                              <div><strong>WhatsApp Number:</strong> {registration.whatsappNumber}</div>
                              <div><strong>Address:</strong> {registration.address}</div>
                              <div><strong>Panchayath Details:</strong> {registration.panchayathDetails}</div>
                              <div><strong>Category:</strong> {categories.find(c => c.value === registration.category)?.label}</div>
                              <div><strong>Status:</strong> <Badge>{registration.status}</Badge></div>
                              <div><strong>Submitted At:</strong> {new Date(registration.submittedAt).toLocaleString()}</div>
                              {registration.approvedAt && (
                                <div><strong>Processed At:</strong> {new Date(registration.approvedAt).toLocaleString()}</div>
                              )}
                              {registration.uniqueId && (
                                <div><strong>Unique ID:</strong> {registration.uniqueId}</div>
                              )}
                            </div>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="categories" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {categoryStats.map((category) => (
              <Card key={category.value}>
                <CardHeader>
                  <CardTitle className="text-lg">{category.label}</CardTitle>
                  <CardDescription>Total registrations in this category</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-blue-600">{category.count}</div>
                  <p className="text-sm text-gray-600 mt-2">
                    {((category.count / stats.total) * 100 || 0).toFixed(1)}% of total registrations
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminPanel;
