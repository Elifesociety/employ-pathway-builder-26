
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { Info } from "lucide-react";

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

  const categories = [
    {
      value: "pennyekart-free",
      label: "Pennyekart Free Registration",
      description: "Free e-commerce platform access for small-scale sellers. Perfect for beginners wanting to start their online selling journey without any initial investment.",
      color: "bg-green-100 text-green-800"
    },
    {
      value: "pennyekart-paid",
      label: "Pennyekart Paid Registration",
      description: "Premium e-commerce features with advanced selling tools, analytics, marketing support, and priority customer service for serious sellers.",
      color: "bg-blue-100 text-blue-800"
    },
    {
      value: "farmelife",
      label: "FarmeLife",
      description: "Agricultural and farming business development program focusing on modern farming techniques, crop management, and agricultural entrepreneurship.",
      color: "bg-amber-100 text-amber-800"
    },
    {
      value: "foodelife",
      label: "FoodeLife",
      description: "Food processing and culinary business opportunities including food safety, packaging, distribution, and restaurant management skills.",
      color: "bg-orange-100 text-orange-800"
    },
    {
      value: "organelife",
      label: "OrganeLife",
      description: "Organic farming and sustainable agriculture initiatives promoting eco-friendly practices, organic certification, and premium market access.",
      color: "bg-emerald-100 text-emerald-800"
    },
    {
      value: "entrelife",
      label: "EntreLife",
      description: "General entrepreneurship and business development track covering business planning, financial management, marketing, and leadership skills.",
      color: "bg-purple-100 text-purple-800"
    },
    {
      value: "job-card",
      label: "Job Card (All Categories)",
      description: "Single registration providing access to opportunities across all categories. This comprehensive option allows you to explore multiple business tracks and receive benefits from the entire SEDP ecosystem.",
      color: "bg-indigo-100 text-indigo-800"
    }
  ];

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

  const selectedCategory = categories.find(cat => cat.value === formData.category);

  return (
    <div className="max-w-2xl mx-auto">
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Employment Registration</CardTitle>
          <CardDescription>
            Join our Self Employment Development Program by registering in your preferred category
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
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
              <Label htmlFor="address">Address *</Label>
              <Textarea
                id="address"
                placeholder="Enter your complete address"
                value={formData.address}
                onChange={(e) => setFormData({...formData, address: e.target.value})}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="panchayathDetails">Panchayath Details *</Label>
              <Input
                id="panchayathDetails"
                type="text"
                placeholder="Enter your Panchayath details"
                value={formData.panchayathDetails}
                onChange={(e) => setFormData({...formData, panchayathDetails: e.target.value})}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Select Category *</Label>
              <Select value={formData.category} onValueChange={(value) => setFormData({...formData, category: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose your preferred category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.value} value={category.value}>
                      <div className="flex items-center gap-2">
                        <span>{category.label}</span>
                        <HoverCard>
                          <HoverCardTrigger asChild>
                            <Info className="h-4 w-4 text-gray-400 cursor-help" />
                          </HoverCardTrigger>
                          <HoverCardContent className="w-80">
                            <div className="space-y-2">
                              <h4 className="font-semibold">{category.label}</h4>
                              <p className="text-sm text-gray-600">{category.description}</p>
                            </div>
                          </HoverCardContent>
                        </HoverCard>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedCategory && (
              <Card className="border-l-4 border-l-blue-500 bg-blue-50">
                <CardContent className="pt-4">
                  <div className="flex items-start gap-3">
                    <Badge className={selectedCategory.color}>Selected</Badge>
                    <div>
                      <h4 className="font-semibold text-sm">{selectedCategory.label}</h4>
                      <p className="text-sm text-gray-600 mt-1">{selectedCategory.description}</p>
                      {selectedCategory.value === 'job-card' && (
                        <div className="mt-2 p-2 bg-indigo-50 rounded-lg">
                          <p className="text-xs text-indigo-700 font-medium">
                            🎯 Special Benefits: Access to all categories, comprehensive training, and priority consideration for multiple opportunities!
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            <Button 
              type="submit" 
              className="w-full bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Submitting..." : "Submit Registration"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default RegistrationForm;
