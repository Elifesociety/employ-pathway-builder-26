
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Target, Users, Award, TrendingUp, Heart, Eye, Bell, Calendar, Camera, CheckCircle } from "lucide-react";

const AboutProgram = () => {
  const visionMission = [
    {
      title: "Our Vision",
      icon: <Eye className="h-8 w-8 text-blue-600" />,
      content: "To create a thriving ecosystem of successful entrepreneurs who contribute to economic growth and social development through innovative self-employment opportunities.",
      color: "bg-blue-50 border-blue-200"
    },
    {
      title: "Our Mission",
      icon: <Target className="h-8 w-8 text-green-600" />,
      content: "Empowering individuals with comprehensive training, mentorship, and resources to establish and scale sustainable businesses across diverse sectors including agriculture, food processing, e-commerce, and general entrepreneurship.",
      color: "bg-green-50 border-green-200"
    }
  ];

  const whyChooseUs = [
    {
      icon: <Users className="h-6 w-6" />,
      title: "Expert Mentorship",
      description: "Learn from industry experts and successful entrepreneurs"
    },
    {
      icon: <Award className="h-6 w-6" />,
      title: "Comprehensive Training",
      description: "Complete skill development programs tailored to your chosen field"
    },
    {
      icon: <TrendingUp className="h-6 w-6" />,
      title: "Market Linkages",
      description: "Direct connections to markets and business opportunities"
    },
    {
      icon: <Heart className="h-6 w-6" />,
      title: "Ongoing Support",
      description: "Continuous guidance throughout your entrepreneurial journey"
    },
    {
      icon: <CheckCircle className="h-6 w-6" />,
      title: "Proven Track Record",
      description: "Thousands of successful entrepreneurs across multiple sectors"
    },
    {
      icon: <Target className="h-6 w-6" />,
      title: "Goal-Oriented Approach",
      description: "Structured programs designed for measurable business outcomes"
    }
  ];

  const notifications = [
    {
      date: "2024-01-15",
      title: "New Batch Registration Open",
      content: "Registration for Q1 2024 batch is now open across all categories. Limited seats available.",
      type: "registration",
      badge: "New"
    },
    {
      date: "2024-01-10",
      title: "Success Story Spotlight",
      content: "Meet Sarah from FoodeLife program who built a successful catering business with 50+ employees.",
      type: "success",
      badge: "Featured"
    },
    {
      date: "2024-01-05",
      title: "Upcoming Workshop Series",
      content: "Digital Marketing for Small Businesses - Free workshop series starting February 2024.",
      type: "workshop",
      badge: "Free"
    },
    {
      date: "2023-12-20",
      title: "Year-End Program Review",
      content: "2023 achievements: 2,500+ registrations, 85% completion rate, 750+ successful business launches.",
      type: "achievement",
      badge: "Update"
    }
  ];

  const announcements = [
    {
      title: "Partnership with Leading Banks",
      content: "We've partnered with major banks to provide easy loan facilities for program graduates.",
      icon: <Award className="h-5 w-5 text-blue-600" />
    },
    {
      title: "Government Recognition",
      content: "SEDP has been officially recognized by the Ministry of Skill Development and Entrepreneurship.",
      icon: <Badge className="h-5 w-5 text-green-600" />
    },
    {
      title: "International Expansion",
      content: "Program modules now include export training for international market access.",
      icon: <TrendingUp className="h-5 w-5 text-purple-600" />
    }
  ];

  return (
    <div className="space-y-12">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">About Our Program</h2>
        <p className="text-lg text-gray-600 max-w-3xl mx-auto">
          Discover our comprehensive self-employment development program designed to transform 
          entrepreneurial dreams into successful business realities.
        </p>
      </div>

      {/* Vision & Mission */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {visionMission.map((item, index) => (
          <Card key={index} className={`${item.color} border-2`}>
            <CardHeader>
              <div className="flex items-center gap-4">
                {item.icon}
                <CardTitle className="text-2xl">{item.title}</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 leading-relaxed">{item.content}</p>
            </CardContent>
          </Card>
        ))}
      </section>

      {/* Why Choose Our Program */}
      <section>
        <h3 className="text-2xl font-bold text-center text-gray-900 mb-8">
          Why Choose Our Program?
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {whyChooseUs.map((item, index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-blue-100 text-blue-600">
                    {item.icon}
                  </div>
                  <CardTitle className="text-lg">{item.title}</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription>{item.description}</CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Notifications */}
      <section>
        <div className="flex items-center gap-3 mb-6">
          <Bell className="h-6 w-6 text-blue-600" />
          <h3 className="text-2xl font-bold text-gray-900">Latest Notifications</h3>
        </div>
        <div className="space-y-4">
          {notifications.map((notification, index) => (
            <Card key={index} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h4 className="font-semibold text-lg">{notification.title}</h4>
                      <Badge variant="secondary">{notification.badge}</Badge>
                    </div>
                    <p className="text-gray-600 mb-2">{notification.content}</p>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Calendar className="h-4 w-4" />
                      <span>{new Date(notification.date).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Program Announcements */}
      <section>
        <h3 className="text-2xl font-bold text-gray-900 mb-6">Program Announcements</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {announcements.map((announcement, index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center gap-3">
                  {announcement.icon}
                  <CardTitle className="text-lg">{announcement.title}</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription>{announcement.content}</CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Photo Gallery Placeholder */}
      <section>
        <div className="flex items-center gap-3 mb-6">
          <Camera className="h-6 w-6 text-blue-600" />
          <h3 className="text-2xl font-bold text-gray-900">Photo Gallery</h3>
        </div>
        <Card className="bg-gradient-to-r from-gray-50 to-gray-100">
          <CardContent className="p-12 text-center">
            <Camera className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h4 className="text-lg font-semibold text-gray-600 mb-2">Coming Soon</h4>
            <p className="text-gray-500">
              We're preparing an inspiring photo gallery showcasing our program activities, 
              success stories, and community events.
            </p>
          </CardContent>
        </Card>
      </section>

      {/* Contact Information */}
      <section className="bg-gradient-to-r from-blue-600 to-green-600 rounded-2xl text-white p-8">
        <div className="text-center">
          <h3 className="text-2xl font-bold mb-4">Ready to Start Your Journey?</h3>
          <p className="text-lg mb-6 opacity-90">
            Join thousands of successful entrepreneurs who have transformed their lives through our program.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <div className="text-center">
              <p className="font-semibold">Program Coordinator</p>
              <p>+91 9876543210</p>
            </div>
            <div className="text-center">
              <p className="font-semibold">Email Support</p>
              <p>info@sedp-program.com</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutProgram;
