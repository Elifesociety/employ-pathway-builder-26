
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Award, Star, Users, TrendingUp, Leaf, Coffee, ShoppingCart } from "lucide-react";

const RegistrationForm = () => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    fullName: "",
    mobileNumber: "",
    whatsappNumber: "",
    address: "",
    panchayathDetails: "",
    category: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Malappuram Panchayaths
  const panchayaths = [
    "Abdu Rahman Nagar", "Alamcode", "Anakkayam", "Areecode", "Cheekkode", "Chelakkara",
    "Chemmad", "Cherpulassery", "Chokkad", "Edakkara", "Edappal", "Edavanna", "Elamkulam",
    "Irumbuzhi", "Kadampuzha", "Kalikavu", "Kannamangalam", "Karuvarakundu", "Keezhattur",
    "Kizhuparamba", "Kodur", "Kondotty", "Koottilangadi", "Kuruva", "Kuttippuram",
    "Makkaraparamba", "Malappuram", "Manjeri", "Marakkara", "Melattur", "Morayur",
    "Mudur", "Munduparamba", "Nanmukku", "Nilambur", "Othukungal", "Pandikkad",
    "Perinthalmanna", "Perumpadappu", "Ponmundam", "Pulikkal", "Purathur", "Tanalur",
    "Tanur", "Thiruvali", "Tirurangadi", "Triprangode", "Vazhakkad", "Vazhayur",
    "Vengara", "Wandoor"
  ];

  const categories = [
    {
      value: "pennyekart-free",
      label: "Pennyekart Free Registration",
      description: "Free e-commerce platform access for small-scale sellers. Perfect for beginners wanting to start their online selling journey without any initial investment.",
      icon: <ShoppingCart className="h-6 w-6" />,
      color: "bg-green-100 text-green-800 border-green-200"
    },
    {
      value: "pennyekart-paid",
      label: "Pennyekart Paid Registration",
      description: "Premium e-commerce features with advanced selling tools, analytics, marketing support, and priority customer service for serious sellers.",
      icon: <TrendingUp className="h-6 w-6" />,
      color: "bg-blue-100 text-blue-800 border-blue-200"
    },
    {
      value: "farmelife",
      label: "FarmeLife",
      description: "Agricultural and farming business development program focusing on modern farming techniques, crop management, and agricultural entrepreneurship.",
      icon: <Leaf className="h-6 w-6" />,
      color: "bg-amber-100 text-amber-800 border-amber-200"
    },
    {
      value: "foodelife",
      label: "FoodeLife",
      description: "Food processing and culinary business opportunities including food safety, packaging, distribution, and restaurant management skills.",
      icon: <Coffee className="h-6 w-6" />,
      color: "bg-orange-100 text-orange-800 border-orange-200"
    },
    {
      value: "organelife",
      label: "OrganeLife",
      description: "Organic farming and sustainable agriculture initiatives promoting eco-friendly practices, organic certification, and premium market access.",
      icon: <Leaf className="h-6 w-6" />,
      color: "bg-emerald-100 text-emerald-800 border-emerald-200"
    },
    {
      value: "entrelife",
      label: "EntreLife",
      description: "General entrepreneurship and business development track covering business planning, financial management, marketing, and leadership skills.",
      icon: <Users className="h-6 w-6" />,
      color: "bg-purple-100 text-purple-800 border-purple-200"
    }
  ];

  const jobCardCategory = {
    value: "job-card",
    label: "Job Card (All Categories)",
    description: "Single registration providing comprehensive access to opportunities across all categories. This universal option allows you to explore multiple business tracks and receive benefits from the entire SEDP ecosystem with priority consideration.",
    icon: <Award className="h-6 w-6" />,
    color: "bg-gradient-to-r from-yellow-100 to-amber-100 text-yellow-800 border-yellow-300"
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Validate required fields
    if (!formData.fullName || !formData.mobileNumber || !formData.whatsappNumber || !formData.address || !formData.panchayathDetails || !formData.category) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      setIsSubmitting(false);
      return;
    }

    // Validate mobile number format
    const mobileRegex = /^[6-9]\d{9}$/;
    if (!mobileRegex.test(formData.mobileNumber)) {
      toast({
        title: "Error",
        description: "Please enter a valid 10-digit mobile number",
        variant: "destructive",
      });
      setIsSubmitting(false);
      return;
    }

    try {
      // Check for duplicate mobile number
      const existingData = JSON.parse(localStorage.getItem('sedp_registrations') || '[]');
      const isDuplicate = existingData.some((registration: any) => 
        registration.mobileNumber === formData.mobileNumber
      );

      if (isDuplicate) {
        toast({
          title: "Registration Already Exists",
          description: "This mobile number is already registered. Each mobile number can only be used once.",
          variant: "destructive",
        });
        setIsSubmitting(false);
        return;
      }

      // Create registration record
      const registration = {
        id: Date.now().toString(),
        ...formData,
        status: 'pending',
        submittedAt: new Date().toISOString(),
        approvedAt: null,
        uniqueId: null
      };

      // Save to localStorage (in a real app, this would be sent to a backend)
      const updatedRegistrations = [...existingData, registration];
      localStorage.setItem('sedp_registrations', JSON.stringify(updatedRegistrations));

      toast({
        title: "Registration Submitted Successfully!",
        description: "Your application has been submitted for review. You will be notified once it's approved.",
      });

      // Reset form
      setFormData({
        fullName: "",
        mobileNumber: "",
        whatsappNumber: "",
        address: "",
        panchayathDetails: "",
        category: ""
      });

    } catch (error) {
      console.error('Registration error:', error);
      toast({
        title: "Error",
        description: "Failed to submit registration. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedCategory = [...categories, jobCardCategory].find(cat => cat.value === formData.category);

  return (
    <div className="max-w-4xl mx-auto">
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Employment Registration</CardTitle>
          <CardDescription>
            Join our Self Employment Development Program by selecting your preferred category
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name *</Label>
                <Input
                  id="fullName"
                  type="text"
                  placeholder="Enter your full name"
                  value={formData.fullName}
                  onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="mobileNumber">Mobile Number *</Label>
                <Input
                  id="mobileNumber"
                  type="tel"
                  placeholder="Enter 10-digit mobile number"
                  value={formData.mobileNumber}
                  onChange={(e) => setFormData({...formData, mobileNumber: e.target.value})}
                  maxLength={10}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="whatsappNumber">WhatsApp Number *</Label>
                <Input
                  id="whatsappNumber"
                  type="tel"
                  placeholder="Enter WhatsApp number"
                  value={formData.whatsappNumber}
                  onChange={(e) => setFormData({...formData, whatsappNumber: e.target.value})}
                  maxLength={10}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="panchayathDetails">Panchayath *</Label>
                <Select value={formData.panchayathDetails} onValueChange={(value) => setFormData({...formData, panchayathDetails: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select your Panchayath" />
                  </SelectTrigger>
                  <SelectContent>
                    {panchayaths.map((panchayath) => (
                      <SelectItem key={panchayath} value={panchayath}>
                        {panchayath}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Complete Address *</Label>
              <Textarea
                id="address"
                placeholder="Enter your complete address with house name, street, pin code etc."
                value={formData.address}
                onChange={(e) => setFormData({...formData, address: e.target.value})}
                required
                rows={3}
              />
            </div>

            {/* Job Card - Special Category */}
            <div className="space-y-4">
              <Label>Select Category *</Label>
              
              {/* Job Card - Special Option */}
              <Card 
                className={`cursor-pointer transition-all duration-200 border-2 ${
                  formData.category === jobCardCategory.value 
                    ? 'border-yellow-400 shadow-lg scale-[1.02]' 
                    : 'border-gray-200 hover:border-yellow-300 hover:shadow-md'
                } ${jobCardCategory.color}`}
                onClick={() => setFormData({...formData, category: jobCardCategory.value})}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 p-2 rounded-lg bg-yellow-200">
                      {jobCardCategory.icon}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold text-lg">{jobCardCategory.label}</h3>
                        <Star className="h-5 w-5 text-yellow-600 fill-current" />
                        <Badge className="bg-yellow-200 text-yellow-800">Recommended</Badge>
                      </div>
                      <p className="text-sm mb-3">{jobCardCategory.description}</p>
                      <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-200">
                        <p className="text-xs font-medium text-yellow-700">
                          🎯 Special Benefits: Universal access to all program categories, comprehensive training across multiple domains, priority consideration for opportunities, and enhanced support throughout your entrepreneurial journey!
                        </p>
                      </div>
                    </div>
                    <div className="flex-shrink-0">
                      {formData.category === jobCardCategory.value && (
                        <div className="w-6 h-6 bg-yellow-600 rounded-full flex items-center justify-center">
                          <div className="w-3 h-3 bg-white rounded-full"></div>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Regular Categories */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {categories.map((category) => (
                  <Card 
                    key={category.value}
                    className={`cursor-pointer transition-all duration-200 border-2 ${
                      formData.category === category.value 
                        ? 'border-blue-400 shadow-lg scale-[1.02]' 
                        : 'border-gray-200 hover:border-blue-300 hover:shadow-md'
                    } ${category.color}`}
                    onClick={() => setFormData({...formData, category: category.value})}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 p-2 rounded-lg bg-white bg-opacity-50">
                          {category.icon}
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold mb-2">{category.label}</h3>
                          <p className="text-sm">{category.description}</p>
                        </div>
                        <div className="flex-shrink-0">
                          {formData.category === category.value && (
                            <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                              <div className="w-3 h-3 bg-white rounded-full"></div>
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {selectedCategory && (
              <Card className="border-l-4 border-l-blue-500 bg-blue-50">
                <CardContent className="pt-4">
                  <div className="flex items-start gap-3">
                    <Badge className={selectedCategory.value === 'job-card' ? 'bg-yellow-200 text-yellow-800' : 'bg-blue-200 text-blue-800'}>
                      {selectedCategory.value === 'job-card' ? 'Universal Access' : 'Selected'}
                    </Badge>
                    <div>
                      <h4 className="font-semibold text-sm">{selectedCategory.label}</h4>
                      <p className="text-sm text-gray-600 mt-1">{selectedCategory.description}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            <Button 
              type="submit" 
              className="w-full bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 text-lg py-6"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Submitting Registration..." : "Submit Registration"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default RegistrationForm;
