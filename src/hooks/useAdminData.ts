
import { useState, useEffect } from "react";
import { Registration, CategoryFee, categories } from "@/types/admin";

export const useAdminData = () => {
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [categoryFees, setCategoryFees] = useState<CategoryFee[]>([]);

  useEffect(() => {
    const data = JSON.parse(localStorage.getItem('sedp_registrations') || '[]');
    setRegistrations(data);

    const fees = JSON.parse(localStorage.getItem('sedp_category_fees') || '[]');
    if (fees.length === 0) {
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

  const updateRegistrations = (newRegistrations: Registration[]) => {
    setRegistrations(newRegistrations);
    localStorage.setItem('sedp_registrations', JSON.stringify(newRegistrations));
  };

  const updateCategoryFees = (newFees: CategoryFee[]) => {
    setCategoryFees(newFees);
    localStorage.setItem('sedp_category_fees', JSON.stringify(newFees));
  };

  return {
    registrations,
    categoryFees,
    updateRegistrations,
    updateCategoryFees
  };
};
