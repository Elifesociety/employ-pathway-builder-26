import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, Trash2, Camera, Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { PhotoGallery } from "@/types/admin";

interface PhotoGalleryManagerProps {
  gallery: PhotoGallery[];
  onUpdate: (gallery: PhotoGallery[]) => void;
}

const PhotoGalleryManager = ({ gallery, onUpdate }: PhotoGalleryManagerProps) => {
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPhoto, setEditingPhoto] = useState<PhotoGallery | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    imageUrl: "",
    description: "",
    category: "general"
  });

  const sampleImages = [
    'https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=800',
    'https://images.pexels.com/photos/3184360/pexels-photo-3184360.jpeg?auto=compress&cs=tinysrgb&w=800',
    'https://images.pexels.com/photos/3184465/pexels-photo-3184465.jpeg?auto=compress&cs=tinysrgb&w=800',
    'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=800',
    'https://images.pexels.com/photos/974314/pexels-photo-974314.jpeg?auto=compress&cs=tinysrgb&w=800',
    'https://images.pexels.com/photos/1300972/pexels-photo-1300972.jpeg?auto=compress&cs=tinysrgb&w=800'
  ];

  const handleAdd = () => {
    setEditingPhoto(null);
    setFormData({
      title: "",
      imageUrl: "",
      description: "",
      category: "general"
    });
    setIsDialogOpen(true);
  };

  const handleEdit = (photo: PhotoGallery) => {
    setEditingPhoto(photo);
    setFormData({
      title: photo.title,
      imageUrl: photo.imageUrl,
      description: photo.description || "",
      category: photo.category
    });
    setIsDialogOpen(true);
  };

  const handleSave = () => {
    if (!formData.title.trim() || !formData.imageUrl.trim()) {
      toast({
        title: "Error",
        description: "Title and image URL are required",
        variant: "destructive"
      });
      return;
    }

    let updatedGallery;
    if (editingPhoto) {
      updatedGallery = gallery.map(p => 
        p.id === editingPhoto.id 
          ? { ...editingPhoto, ...formData }
          : p
      );
    } else {
      const newPhoto: PhotoGallery = {
        id: Date.now().toString(),
        ...formData,
        uploadedAt: new Date().toISOString()
      };
      updatedGallery = [newPhoto, ...gallery];
    }

    onUpdate(updatedGallery);
    setIsDialogOpen(false);
    toast({
      title: "Success",
      description: `Photo ${editingPhoto ? 'updated' : 'added'} successfully`
    });
  };

  const handleDelete = (id: string) => {
    const updatedGallery = gallery.filter(p => p.id !== id);
    onUpdate(updatedGallery);
    toast({
      title: "Success",
      description: "Photo deleted successfully"
    });
  };

  const useSampleImage = (imageUrl: string) => {
    setFormData({ ...formData, imageUrl });
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Camera className="h-5 w-5" />
              Photo Gallery Management
            </CardTitle>
            <CardDescription>Manage photos showcasing program activities and achievements</CardDescription>
          </div>
          <Button onClick={handleAdd} className="bg-purple-600 hover:bg-purple-700">
            <Plus className="h-4 w-4 mr-1" />
            Add Photo
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {gallery.map((photo) => (
            <Card key={photo.id} className="overflow-hidden">
              <div className="aspect-video relative">
                <img 
                  src={photo.imageUrl} 
                  alt={photo.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-2 right-2">
                  <Badge variant="secondary">{photo.category}</Badge>
                </div>
              </div>
              <CardContent className="p-4">
                <h3 className="font-semibold mb-2">{photo.title}</h3>
                {photo.description && (
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">{photo.description}</p>
                )}
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-500">
                    {new Date(photo.uploadedAt).toLocaleDateString()}
                  </span>
                  <div className="flex gap-1">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(photo)}
                    >
                      <Edit className="h-3 w-3" />
                    </Button>
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
                            Are you sure you want to delete "{photo.title}"? This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction 
                            onClick={() => handleDelete(photo.id)}
                            className="bg-red-600 hover:bg-red-700"
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {gallery.length === 0 && (
          <div className="text-center py-12">
            <Camera className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-600 mb-2">No Photos Yet</h3>
            <p className="text-gray-500 mb-4">Start building your photo gallery by adding the first photo</p>
            <Button onClick={handleAdd}>Add First Photo</Button>
          </div>
        )}

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingPhoto ? 'Edit Photo' : 'Add New Photo'}
              </DialogTitle>
              <DialogDescription>
                Add photos to showcase program activities and success stories
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Title *</Label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Photo title"
                />
              </div>
              <div className="space-y-2">
                <Label>Image URL *</Label>
                <Input
                  value={formData.imageUrl}
                  onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                  placeholder="https://example.com/image.jpg"
                />
                <div className="grid grid-cols-3 gap-2 mt-2">
                  {sampleImages.map((url, index) => (
                    <div key={index} className="relative group cursor-pointer" onClick={() => useSampleImage(url)}>
                      <img src={url} alt={`Sample ${index + 1}`} className="w-full h-20 object-cover rounded border-2 border-transparent group-hover:border-blue-500" />
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 rounded flex items-center justify-center">
                        <span className="text-white text-xs opacity-0 group-hover:opacity-100">Use This</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Photo description"
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label>Category</Label>
                <Input
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  placeholder="e.g., training, events, success-stories"
                />
              </div>
              {formData.imageUrl && (
                <div className="space-y-2">
                  <Label>Preview</Label>
                  <img src={formData.imageUrl} alt="Preview" className="w-full h-40 object-cover rounded border" />
                </div>
              )}
              <div className="flex gap-2 pt-4">
                <Button onClick={handleSave} className="flex-1">
                  {editingPhoto ? 'Update' : 'Add'} Photo
                </Button>
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};

export default PhotoGalleryManager;