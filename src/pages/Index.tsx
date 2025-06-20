import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Users, TrendingUp, Award, Target, Phone, MapPin } from "lucide-react";
import RegistrationForm from "@/components/RegistrationForm";
import AdminPanel from "@/components/AdminPanel";

const Index = () => {
  const [activeTab, setActiveTab] = useState("home");

  const benefits = [
    {
      icon: <Users className="h-6 w-6" />,
      title: "Community Support",
      description: "Join a network of like-minded entrepreneurs and receive ongoing support"
    },
    {
      icon: <TrendingUp className="h-6 w-6" />,
      title: "Business Growth",
      description: "Access tools and resources to scale your business effectively"
    },
    {
      icon: <Award className="h-6 w-6" />,
      title: "Certification",
      description: "Receive official certification upon program completion"
    },
    {
      icon: <Target className="h-6 w-6" />,
      title: "Skill Development",
      description: "Learn essential entrepreneurial skills from industry experts"
    }
  ];

  const categories = [
    {
      name: "Pennyekart Free Registration",
      description: "Free e-commerce platform access for small-scale sellers",
      color: "bg-green-100 text-green-800"
    },
    {
      name: "Pennyekart Paid Registration",
      description: "Premium e-commerce features with advanced selling tools",
      color: "bg-blue-100 text-blue-800"
    },
    {
      name: "FarmeLife",
      description: "Agricultural and farming business development program",
      color: "bg-amber-100 text-amber-800"
    },
    {
      name: "FoodeLife",
      description: "Food processing and culinary business opportunities",
      color: "bg-orange-100 text-orange-800"
    },
    {
      name: "OrganeLife",
      description: "Organic farming and sustainable agriculture initiatives",
      color: "bg-emerald-100 text-emerald-800"
    },
    {
      name: "EntreLife",
      description: "General entrepreneurship and business development track",
      color: "bg-purple-100 text-purple-800"
    },
    {
      name: "Job Card (All Categories)",
      description: "Single registration for comprehensive access to all program categories and benefits",
      color: "bg-indigo-100 text-indigo-800"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-green-600 rounded-lg flex items-center justify-center">
                <Target className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">SEDP</h1>
                <p className="text-xs text-gray-600">Self Employment Development</p>
              </div>
            </div>
            <nav className="hidden md:flex space-x-8">
              <Button
                variant={activeTab === "home" ? "default" : "ghost"}
                onClick={() => setActiveTab("home")}
              >
                Home
              </Button>
              <Button
                variant={activeTab === "register" ? "default" : "ghost"}
                onClick={() => setActiveTab("register")}
              >
                Employment Registration
              </Button>
              <Button
                variant={activeTab === "admin" ? "default" : "ghost"}
                onClick={() => setActiveTab("admin")}
              >
                Admin Panel
              </Button>
            </nav>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 lg:w-[400px] mx-auto mb-8">
            <TabsTrigger value="home">Home</TabsTrigger>
            <TabsTrigger value="register">Register</TabsTrigger>
            <TabsTrigger value="admin">Admin</TabsTrigger>
          </TabsList>

          <TabsContent value="home" className="space-y-12">
            {/* Hero Section */}
            <section className="text-center py-12">
              <div className="max-w-4xl mx-auto">
                <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                  Empower Your 
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-green-600">
                    {" "}Entrepreneurial Journey
                  </span>
                </h2>
                <p className="text-xl text-gray-600 mb-8">
                  Join our Self Employment Development Program and transform your business ideas into reality. 
                  Choose from multiple specialized tracks designed to support your unique entrepreneurial goals.
                </p>
                <Button 
                  size="lg" 
                  className="bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700"
                  onClick={() => setActiveTab("register")}
                >
                  Start Your Registration
                </Button>
              </div>
            </section>

            {/* Benefits Section */}
            <section className="py-12">
              <h3 className="text-3xl font-bold text-center text-gray-900 mb-12">
                Why Join Our Program?
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {benefits.map((benefit, index) => (
                  <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="mx-auto w-12 h-12 bg-gradient-to-r from-blue-100 to-green-100 rounded-lg flex items-center justify-center text-blue-600 mb-4">
                        {benefit.icon}
                      </div>
                      <CardTitle className="text-lg">{benefit.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <CardDescription>{benefit.description}</CardDescription>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>

            {/* Categories Section */}
            <section className="py-12">
              <h3 className="text-3xl font-bold text-center text-gray-900 mb-12">
                Available Program Categories
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {categories.map((category, index) => (
                  <Card key={index} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">{category.name}</CardTitle>
                        <Badge className={category.color}>
                          {category.name === "Job Card (All Categories)" ? "Special" : `Track ${index + 1}`}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <CardDescription>{category.description}</CardDescription>
                      {category.name === "Job Card (All Categories)" && (
                        <div className="mt-3 p-2 bg-indigo-50 rounded-lg">
                          <p className="text-xs text-indigo-700 font-medium">
                            🌟 Recommended: Get access to all categories with a single registration!
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>

            {/* Contact Section */}
            <section className="py-12 bg-gradient-to-r from-blue-600 to-green-600 rounded-2xl text-white">
              <div className="text-center max-w-4xl mx-auto px-6">
                <h3 className="text-3xl font-bold mb-6">Ready to Get Started?</h3>
                <p className="text-xl mb-8 opacity-90">
                  Take the first step towards your entrepreneurial success. Register now and join thousands of successful entrepreneurs.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                  <div className="flex items-center gap-2">
                    <Phone className="h-5 w-5" />
                    <span>+91 9876543210</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-5 w-5" />
                    <span>Available Nationwide</span>
                  </div>
                </div>
                <Button 
                  size="lg" 
                  variant="secondary" 
                  className="mt-6"
                  onClick={() => setActiveTab("register")}
                >
                  Register Now
                </Button>
              </div>
            </section>
          </TabsContent>

          <TabsContent value="register">
            <RegistrationForm />
          </TabsContent>

          <TabsContent value="admin">
            <AdminPanel />
          </TabsContent>
        </Tabs>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p>&copy; 2024 Self Employment Development Program. All rights reserved.</p>
          <p className="text-gray-400 mt-2">Empowering entrepreneurs, building futures.</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
