import { useState, useEffect } from "react";
import { Registration, CategoryFee, categories, Panchayath, Announcement, PhotoGallery, PushNotification } from "@/types/admin";

export const useAdminData = () => {
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [categoryFees, setCategoryFees] = useState<CategoryFee[]>([]);
  const [panchayaths, setPanchayaths] = useState<Panchayath[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [photoGallery, setPhotoGallery] = useState<PhotoGallery[]>([]);
  const [notifications, setNotifications] = useState<PushNotification[]>([]);

  useEffect(() => {
    // Load registrations
    const data = JSON.parse(localStorage.getItem('sedp_registrations') || '[]');
    setRegistrations(data);

    // Load category fees with proper defaults
    const fees = JSON.parse(localStorage.getItem('sedp_category_fees') || '[]');
    if (fees.length === 0) {
      const defaultFees = categories.map(cat => ({
        category: cat.value,
        actualFee: cat.value === 'pennyekart-free' ? 0 : cat.value === 'job-card' ? 2000 : 1000,
        offerFee: cat.value === 'pennyekart-free' ? 0 : cat.value === 'job-card' ? 800 : 400,
        hasOffer: cat.value !== 'pennyekart-free',
        image: getDefaultCategoryImage(cat.value)
      }));
      setCategoryFees(defaultFees);
      localStorage.setItem('sedp_category_fees', JSON.stringify(defaultFees));
    } else {
      setCategoryFees(fees);
    }

    // Load panchayaths
    const panchayathData = JSON.parse(localStorage.getItem('sedp_panchayaths') || '[]');
    if (panchayathData.length === 0) {
      // Import default panchayaths from JSON
      import('@/data/panchayaths.json').then(data => {
        const defaultPanchayaths = data.default.map((p: any, index: number) => ({
          id: (index + 1).toString(),
          malayalamName: p.panchayath,
          englishName: p.english,
          pincode: p.pincode || '',
          district: 'Malappuram'
        }));
        setPanchayaths(defaultPanchayaths);
        localStorage.setItem('sedp_panchayaths', JSON.stringify(defaultPanchayaths));
      });
    } else {
      setPanchayaths(panchayathData);
    }

    // Load announcements
    const announcementData = JSON.parse(localStorage.getItem('sedp_announcements') || '[]');
    setAnnouncements(announcementData);

    // Load photo gallery
    const galleryData = JSON.parse(localStorage.getItem('sedp_gallery') || '[]');
    setPhotoGallery(galleryData);

    // Load notifications
    const notificationData = JSON.parse(localStorage.getItem('sedp_notifications') || '[]');
    setNotifications(notificationData);
  }, []);

  const getDefaultCategoryImage = (categoryValue: string) => {
    const images = {
      'pennyekart-free': 'https://images.pexels.com/photos/230544/pexels-photo-230544.jpeg?auto=compress&cs=tinysrgb&w=800',
      'pennyekart-paid': 'https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=800',
      'farmelife': 'https://images.pexels.com/photos/974314/pexels-photo-974314.jpeg?auto=compress&cs=tinysrgb&w=800',
      'foodelife': 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=800',
      'organelife': 'https://images.pexels.com/photos/1300972/pexels-photo-1300972.jpeg?auto=compress&cs=tinysrgb&w=800',
      'entrelife': 'https://images.pexels.com/photos/3184465/pexels-photo-3184465.jpeg?auto=compress&cs=tinysrgb&w=800',
      'job-card': 'https://images.pexels.com/photos/3184360/pexels-photo-3184360.jpeg?auto=compress&cs=tinysrgb&w=800'
    };
    return images[categoryValue as keyof typeof images] || images['job-card'];
  };

  const updateRegistrations = (newRegistrations: Registration[]) => {
    setRegistrations(newRegistrations);
    localStorage.setItem('sedp_registrations', JSON.stringify(newRegistrations));
  };

  const updateCategoryFees = (newFees: CategoryFee[]) => {
    setCategoryFees(newFees);
    localStorage.setItem('sedp_category_fees', JSON.stringify(newFees));
  };

  const updatePanchayaths = (newPanchayaths: Panchayath[]) => {
    setPanchayaths(newPanchayaths);
    localStorage.setItem('sedp_panchayaths', JSON.stringify(newPanchayaths));
  };

  const updateAnnouncements = (newAnnouncements: Announcement[]) => {
    setAnnouncements(newAnnouncements);
    localStorage.setItem('sedp_announcements', JSON.stringify(newAnnouncements));
  };

  const updatePhotoGallery = (newGallery: PhotoGallery[]) => {
    setPhotoGallery(newGallery);
    localStorage.setItem('sedp_gallery', JSON.stringify(newGallery));
  };

  const updateNotifications = (newNotifications: PushNotification[]) => {
    setNotifications(newNotifications);
    localStorage.setItem('sedp_notifications', JSON.stringify(newNotifications));
  };

  return {
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
  };
};