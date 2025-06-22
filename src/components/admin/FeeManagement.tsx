
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Edit, Save, X } from "lucide-react";
import { CategoryFee, categories } from "@/types/admin";

interface FeeManagementProps {
  categoryFees: CategoryFee[];
  editingFees: boolean;
  onEditStart: () => void;
  onEditCancel: () => void;
  onSave: () => void;
  onFeeUpdate: (category: string, field: 'actualFee' | 'offerFee' | 'hasOffer', value: number | boolean) => void;
}

const FeeManagement = ({
  categoryFees,
  editingFees,
  onEditStart,
  onEditCancel,
  onSave,
  onFeeUpdate
}: FeeManagementProps) => {
  const getCategoryFee = (category: string) => {
    return categoryFees.find(fee => fee.category === category) || { actualFee: 0, offerFee: 0, hasOffer: false, image: '' };
  };

  return (
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
                <Button onClick={onSave} className="bg-green-600 hover:bg-green-700">
                  <Save className="h-4 w-4 mr-1" />
                  Save Changes
                </Button>
                <Button variant="outline" onClick={onEditCancel}>
                  <X className="h-4 w-4 mr-1" />
                  Cancel
                </Button>
              </>
            ) : (
              <Button onClick={onEditStart}>
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
                          onChange={(e) => onFeeUpdate(category.value, 'actualFee', parseInt(e.target.value) || 0)}
                          min="0"
                        />
                      </div>
                      <div>
                        <Label>Offer Fee (₹)</Label>
                        <Input
                          type="number"
                          value={currentFee.offerFee}
                          onChange={(e) => onFeeUpdate(category.value, 'offerFee', parseInt(e.target.value) || 0)}
                          min="0"
                        />
                      </div>
                      <div className="flex items-center space-x-2 pt-6">
                        <Checkbox
                          id={`offer-${category.value}`}
                          checked={currentFee.hasOffer}
                          onCheckedChange={(checked) => onFeeUpdate(category.value, 'hasOffer', !!checked)}
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
  );
};

export default FeeManagement;
