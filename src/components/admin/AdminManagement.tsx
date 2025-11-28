import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UsersIcon, UserPlusIcon, EditIcon, TrashIcon, CrownIcon, GraduationCapIcon, BookOpenIcon, EyeIcon, MapPinIcon, PhoneIcon, UserIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { API_BASE_URL } from "@/lib/api-config";

interface Admin {
  id: string;
  name: string;
  email: string;
  board?: string;
  schoolName?: string;
  contactPerson?: string;
  phone?: string;
  place?: string;
  pin?: string;
  permissions: string[];
  status: string;
  joinDate: string;
  stats: {
    students: number;
    teachers: number;
    videos: number;
    assessments: number;
    exams: number;
    totalExamsTaken: number;
    averageScore: string;
    averageAccuracy: string;
  };
  analytics: {
    topStudents: Array<{
      studentName: string;
      studentEmail: string;
      totalExams: number;
      averageScore: string;
    }>;
    recentResults: Array<{
      examTitle: string;
      studentName: string;
      score: number;
      marks: string;
      completedAt: string;
    }>;
    subjectPerformance: Array<{
      subject: string;
      accuracy: string;
      averageScore: string;
      totalQuestions: number;
      correctAnswers: number;
    }>;
  };
}

export default function AdminManagement() {
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddingAdmin, setIsAddingAdmin] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingAdmin, setEditingAdmin] = useState<Admin | null>(null);
  const [isUpdatingAdmin, setIsUpdatingAdmin] = useState(false);
  const [newAdmin, setNewAdmin] = useState({
    name: '',
    email: '',
    password: '',
    board: '',
    schoolName: '',
    contactPerson: '',
    phone: '',
    place: '',
    pin: ''
  });
  const [editAdmin, setEditAdmin] = useState({
    name: '',
    email: '',
    board: '',
    schoolName: '',
    contactPerson: '',
    phone: '',
    place: '',
    pin: '',
    isActive: true
  });
  const [viewingAdmin, setViewingAdmin] = useState<Admin | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [adminDetails, setAdminDetails] = useState<any>(null);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);
  const { toast } = useToast();

  // Fetch admins from API
  useEffect(() => {
    const fetchAdmins = async () => {
      try {
        const token = localStorage.getItem('authToken');
        const response = await fetch(`${API_BASE_URL}/api/super-admin/admins`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          console.log('Fetched admins data:', data);
          
          // Handle both wrapped and direct array responses
          if (Array.isArray(data)) {
            setAdmins(data);
          } else if (data.data && Array.isArray(data.data)) {
            setAdmins(data.data);
          } else {
            console.log('No valid admin data found');
            setAdmins([]);
          }
        } else {
          console.error('API failed with status:', response.status);
          setAdmins([]);
        }
      } catch (error) {
        console.error('Error fetching admins:', error);
        setAdmins([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAdmins();
  }, []);

  const handleAddAdmin = async () => {
    if (isAddingAdmin) return; // Prevent multiple submissions
    
    if (!newAdmin.name || !newAdmin.email || !newAdmin.password || !newAdmin.board || !newAdmin.schoolName) {
      toast({
        title: "Error",
        description: "Please fill in all required fields: name, email, password, board, and school name",
        variant: "destructive",
      });
      return;
    }

    // Check if admin with this email already exists
    const existingAdmin = admins?.find(admin => 
      admin?.email?.toLowerCase() === newAdmin.email.toLowerCase()
    );
    
    if (existingAdmin) {
      toast({
        title: "Admin Already Exists",
        description: "A school with this email already exists. Please use a different email.",
        variant: "destructive",
      });
      return;
    }

    setIsAddingAdmin(true);
    try {
      const token = localStorage.getItem('authToken');
      
      // Prepare payload - backend expects: name, email, board, schoolName, permissions
      // Note: Backend sets default password 'admin123', so we don't send password
      const payload = {
        name: newAdmin.name,
        email: newAdmin.email,
        board: newAdmin.board,
        schoolName: newAdmin.schoolName,
        contactPerson: newAdmin.contactPerson,
        phone: newAdmin.phone,
        place: newAdmin.place,
        pin: newAdmin.pin,
        permissions: [] // Optional, defaults to empty array
      };
      
      console.log('Creating admin with payload:', payload);
      console.log('API URL:', `${API_BASE_URL}/api/super-admin/admins`);
      
      const response = await fetch(`${API_BASE_URL}/api/super-admin/admins`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        const result = await response.json();
        setAdmins([...(admins || []), result.data]);
        setNewAdmin({ name: '', email: '', password: '', board: '', schoolName: '', contactPerson: '', phone: '', place: '', pin: '' });
        setIsAddDialogOpen(false);
        toast({
          title: "Success",
          description: "School added successfully",
        });
      } else {
        const errorData = await response.json();
        console.log('API Error Response:', errorData);
        throw new Error(errorData.message || 'Failed to add school');
      }
    } catch (error) {
      console.error('Error adding admin:', error);
      const errorMessage = error instanceof Error ? error.message : "Failed to add admin";
      
      // Check for network errors
      if (errorMessage.includes('Failed to fetch') || errorMessage.includes('ERR_NAME_NOT_RESOLVED')) {
        toast({
          title: "Network Error",
          description: "Cannot connect to the server. Please check your internet connection and ensure the backend is running.",
          variant: "destructive",
        });
      } else if (errorMessage.includes('already exists')) {
        toast({
          title: "Admin Already Exists",
          description: "A school with this email already exists. Please use a different email.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Error",
          description: errorMessage || "Failed to add school. Please try again.",
          variant: "destructive",
        });
      }
    } finally {
      setIsAddingAdmin(false);
    }
  };

  const handleEditClick = (admin: Admin) => {
    setEditingAdmin(admin);
    setEditAdmin({
      name: admin.name || '',
      email: admin.email || '',
      board: admin.board || '',
      schoolName: admin.schoolName || '',
      contactPerson: admin.contactPerson || '',
      phone: admin.phone || '',
      place: admin.place || '',
      pin: admin.pin || '',
      isActive: admin.status === 'active' || admin.status === 'Active'
    });
    setIsEditDialogOpen(true);
  };

  const handleUpdateAdmin = async () => {
    if (!editingAdmin?.id) {
      toast({
        title: "Error",
        description: "Invalid school ID",
        variant: "destructive",
      });
      return;
    }

    if (!editAdmin.name || !editAdmin.email || !editAdmin.board || !editAdmin.schoolName) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    setIsUpdatingAdmin(true);
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${API_BASE_URL}/api/super-admin/admins/${editingAdmin.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: editAdmin.name,
          email: editAdmin.email,
          board: editAdmin.board,
          schoolName: editAdmin.schoolName,
          contactPerson: editAdmin.contactPerson,
          phone: editAdmin.phone,
          place: editAdmin.place,
          pin: editAdmin.pin,
          isActive: editAdmin.isActive
        }),
      });

      if (response.ok) {
        const result = await response.json();
        console.log('Update admin success:', result);
        
        // Refresh the admins list
        const fetchResponse = await fetch(`${API_BASE_URL}/api/super-admin/admins`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (fetchResponse.ok) {
          const fetchData = await fetchResponse.json();
          console.log('Refreshed admins data:', fetchData);
          if (Array.isArray(fetchData)) {
            setAdmins(fetchData);
          } else if (fetchData.data && Array.isArray(fetchData.data)) {
            setAdmins(fetchData.data);
          }
        }
        
        setIsEditDialogOpen(false);
        setEditingAdmin(null);
        // Reset edit form
        setEditAdmin({
          name: '',
          email: '',
          board: '',
          schoolName: '',
          contactPerson: '',
          phone: '',
          place: '',
          pin: '',
          isActive: true
        });
        toast({
          title: "Success",
          description: "School updated successfully",
        });
      } else {
        const errorText = await response.text();
        let errorData;
        try {
          errorData = JSON.parse(errorText);
        } catch (e) {
          errorData = { message: errorText || `Server error: ${response.status}` };
        }
        console.error('Update admin error response:', errorData);
        throw new Error(errorData.message || 'Failed to update school');
      }
    } catch (error) {
      console.error('Error updating admin:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update school",
        variant: "destructive",
      });
    } finally {
      setIsUpdatingAdmin(false);
    }
  };

  const fetchAdminDetails = async (adminId: string) => {
    setIsLoadingDetails(true);
    try {
      const token = localStorage.getItem('authToken');
      
      // Fetch all users and filter students assigned to this admin
      const usersResponse = await fetch(`${API_BASE_URL}/api/super-admin/users`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      let students = [];
      if (usersResponse.ok) {
        const usersData = await usersResponse.json();
        const allUsers = Array.isArray(usersData) ? usersData : (usersData.data || []);
        // Filter students assigned to this admin
        students = allUsers.filter((user: any) => 
          user.role === 'student' && 
          (user.assignedAdmin === adminId || user.assignedAdmin?._id === adminId || user.assignedAdmin?.id === adminId)
        );
      }
      
      // Group students by class
      const studentsByClass: Record<string, any[]> = {};
      students.forEach((student: any) => {
        const className = student.classNumber || student.assignedClass?.classNumber || 'Unassigned';
        if (!studentsByClass[className]) {
          studentsByClass[className] = [];
        }
        studentsByClass[className].push(student);
      });
      
      setAdminDetails({
        students,
        studentsByClass,
        classes: Object.keys(studentsByClass).sort()
      });
    } catch (error) {
      console.error('Error fetching admin details:', error);
      toast({
        title: "Error",
        description: "Failed to fetch school details",
        variant: "destructive",
      });
    } finally {
      setIsLoadingDetails(false);
    }
  };

  const handleViewClick = async (admin: Admin) => {
    setViewingAdmin(admin);
    setIsViewDialogOpen(true);
    await fetchAdminDetails(admin.id);
  };

  const handleDeleteAdmin = async (adminId: string) => {
    if (!adminId) {
      toast({
        title: "Error",
        description: "Invalid school ID",
        variant: "destructive",
      });
      return;
    }

    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${API_BASE_URL}/api/super-admin/admins/${adminId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const deleteResult = await response.json();
        
        // Wait a moment to ensure database cleanup is complete
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Refresh the admins list from the server to ensure deleted admin is removed
        const fetchResponse = await fetch(`${API_BASE_URL}/api/super-admin/admins`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (fetchResponse.ok) {
          const fetchData = await fetchResponse.json();
          if (Array.isArray(fetchData)) {
            setAdmins(fetchData);
          } else if (fetchData.data && Array.isArray(fetchData.data)) {
            setAdmins(fetchData.data);
          } else {
            // Fallback: filter from local state
            setAdmins((admins || []).filter(admin => admin?.id !== adminId));
          }
        } else {
          // Fallback: filter from local state
          setAdmins((admins || []).filter(admin => admin?.id !== adminId));
        }
        
        toast({
          title: "Success",
          description: "School and all associated data deleted successfully. You can now add a new school with the same email.",
        });
        
        // Dispatch custom event to notify dashboard to refresh admin summary
        window.dispatchEvent(new CustomEvent('adminDeleted'));
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete school');
      }
    } catch (error) {
      console.error('Error deleting admin:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete school",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Loading schools...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">School Management</h2>
          <p className="text-gray-600">Manage schools and their associated data</p>
        </div>
        
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <UserPlusIcon className="h-4 w-4 mr-2" />
              Add New School
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New School</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    value={newAdmin.name}
                    onChange={(e) => setNewAdmin({ ...newAdmin, name: e.target.value })}
                    placeholder="Enter school administrator's full name"
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={newAdmin.email}
                    onChange={(e) => setNewAdmin({ ...newAdmin, email: e.target.value })}
                    placeholder="Enter school administrator's email"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={newAdmin.password}
                    onChange={(e) => setNewAdmin({ ...newAdmin, password: e.target.value })}
                    placeholder="Enter temporary password"
                  />
                </div>
                <div>
                  <Label htmlFor="board">Board *</Label>
                  <Select
                    value={newAdmin.board}
                    onValueChange={(value) => setNewAdmin({ ...newAdmin, board: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Board" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="CBSE_AP">CBSE Andhra Pradesh</SelectItem>
                      <SelectItem value="CBSE_TS">CBSE Telangana State</SelectItem>
                      <SelectItem value="STATE_AP">State Andhra Pradesh</SelectItem>
                      <SelectItem value="STATE_TS">State Telangana State</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-gray-500 mt-1">Select the board for this admin</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="schoolName">School Name *</Label>
                  <Input
                    id="schoolName"
                    value={newAdmin.schoolName}
                    onChange={(e) => setNewAdmin({ ...newAdmin, schoolName: e.target.value })}
                    placeholder="Enter school name"
                  />
                </div>
                <div>
                  <Label htmlFor="contactPerson">Contact Person</Label>
                  <Input
                    id="contactPerson"
                    value={newAdmin.contactPerson}
                    onChange={(e) => setNewAdmin({ ...newAdmin, contactPerson: e.target.value })}
                    placeholder="Enter contact person name"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    value={newAdmin.phone}
                    onChange={(e) => setNewAdmin({ ...newAdmin, phone: e.target.value })}
                    placeholder="Enter phone number"
                  />
                </div>
                <div>
                  <Label htmlFor="place">Place</Label>
                  <Input
                    id="place"
                    value={newAdmin.place}
                    onChange={(e) => setNewAdmin({ ...newAdmin, place: e.target.value })}
                    placeholder="Enter place/city"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="pin">PIN Code</Label>
                  <Input
                    id="pin"
                    value={newAdmin.pin}
                    onChange={(e) => setNewAdmin({ ...newAdmin, pin: e.target.value })}
                    placeholder="Enter PIN code"
                  />
                </div>
                <div></div>
              </div>
              <div className="flex justify-end space-x-2 pt-4">
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAddAdmin} disabled={isAddingAdmin}>
                  {isAddingAdmin ? 'Adding...' : 'Add School'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Edit Admin Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit School</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-name">Full Name *</Label>
                  <Input
                    id="edit-name"
                    value={editAdmin.name}
                    onChange={(e) => setEditAdmin({ ...editAdmin, name: e.target.value })}
                    placeholder="Enter school administrator's full name"
                  />
                </div>
                <div>
                  <Label htmlFor="edit-email">Email *</Label>
                  <Input
                    id="edit-email"
                    type="email"
                    value={editAdmin.email}
                    onChange={(e) => setEditAdmin({ ...editAdmin, email: e.target.value })}
                    placeholder="Enter school administrator's email"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-board">Board *</Label>
                  <Select
                    value={editAdmin.board}
                    onValueChange={(value) => setEditAdmin({ ...editAdmin, board: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Board" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="CBSE_AP">CBSE Andhra Pradesh</SelectItem>
                      <SelectItem value="CBSE_TS">CBSE Telangana State</SelectItem>
                      <SelectItem value="STATE_AP">State Andhra Pradesh</SelectItem>
                      <SelectItem value="STATE_TS">State Telangana State</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="edit-schoolName">School Name *</Label>
                  <Input
                    id="edit-schoolName"
                    value={editAdmin.schoolName}
                    onChange={(e) => setEditAdmin({ ...editAdmin, schoolName: e.target.value })}
                    placeholder="Enter school name"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-contactPerson">Contact Person</Label>
                  <Input
                    id="edit-contactPerson"
                    value={editAdmin.contactPerson}
                    onChange={(e) => setEditAdmin({ ...editAdmin, contactPerson: e.target.value })}
                    placeholder="Enter contact person name"
                  />
                </div>
                <div>
                  <Label htmlFor="edit-phone">Phone</Label>
                  <Input
                    id="edit-phone"
                    value={editAdmin.phone}
                    onChange={(e) => setEditAdmin({ ...editAdmin, phone: e.target.value })}
                    placeholder="Enter phone number"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-place">Place</Label>
                  <Input
                    id="edit-place"
                    value={editAdmin.place}
                    onChange={(e) => setEditAdmin({ ...editAdmin, place: e.target.value })}
                    placeholder="Enter place/city"
                  />
                </div>
                <div>
                  <Label htmlFor="edit-pin">PIN Code</Label>
                  <Input
                    id="edit-pin"
                    value={editAdmin.pin}
                    onChange={(e) => setEditAdmin({ ...editAdmin, pin: e.target.value })}
                    placeholder="Enter PIN code"
                  />
                </div>
              </div>
              <div className="flex items-center space-x-2 pt-2">
                <input
                  type="checkbox"
                  id="edit-isActive"
                  checked={editAdmin.isActive}
                  onChange={(e) => setEditAdmin({ ...editAdmin, isActive: e.target.checked })}
                  className="rounded"
                />
                <Label htmlFor="edit-isActive" className="cursor-pointer">
                  Active Account
                </Label>
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => {
                  setIsEditDialogOpen(false);
                  setEditingAdmin(null);
                }}>
                  Cancel
                </Button>
                <Button onClick={handleUpdateAdmin} disabled={isUpdatingAdmin}>
                  {isUpdatingAdmin ? 'Updating...' : 'Update School'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Admin Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600">Total Schools</p>
                <p className="text-3xl font-bold text-blue-900">{admins?.length || 0}</p>
              </div>
              <CrownIcon className="h-12 w-12 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-green-50 border-green-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600">Total Students</p>
                <p className="text-3xl font-bold text-green-900">
                  {admins?.reduce((sum, admin) => sum + (admin?.stats?.students || 0), 0) || 0}
                </p>
              </div>
              <UsersIcon className="h-12 w-12 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-purple-50 border-purple-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-600">Total Teachers</p>
                <p className="text-3xl font-bold text-purple-900">
                  {admins?.reduce((sum, admin) => sum + (admin?.stats?.teachers || 0), 0) || 0}
                </p>
              </div>
              <GraduationCapIcon className="h-12 w-12 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Admins List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {admins?.map((admin) => (
          <Card key={admin?.id || Math.random().toString()} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <CrownIcon className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{admin?.name || 'Unknown Admin'}</CardTitle>
                    <p className="text-sm text-gray-600">{admin?.email || 'No email'}</p>
                    {admin?.schoolName && (
                      <p className="text-xs text-blue-600 font-medium mt-1">{admin.schoolName}</p>
                    )}
                    {admin?.board && (
                      <Badge variant="outline" className="mt-1 text-xs">
                        {admin.board === 'CBSE_AP' ? 'CBSE AP' :
                         admin.board === 'CBSE_TS' ? 'CBSE TS' :
                         admin.board === 'STATE_AP' ? 'State AP' :
                         admin.board === 'STATE_TS' ? 'State TS' : admin.board}
                      </Badge>
                    )}
                  </div>
                </div>
                <Badge variant={(admin?.status || 'inactive') === 'active' ? 'default' : 'secondary'}>
                  {admin?.status || 'inactive'}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-green-50 rounded-lg">
                    <UsersIcon className="h-6 w-6 text-green-600 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-green-900">{admin?.stats?.students || 0}</p>
                    <p className="text-sm text-green-600">Students</p>
                  </div>
                  <div className="text-center p-3 bg-purple-50 rounded-lg">
                    <GraduationCapIcon className="h-6 w-6 text-purple-600 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-purple-900">{admin?.stats?.teachers || 0}</p>
                    <p className="text-sm text-purple-600">Teachers</p>
                  </div>
                </div>
                
                <div className="flex justify-between items-center pt-4 border-t">
                  <span className="text-sm text-gray-500">
                    Added: {admin?.joinDate ? new Date(admin.joinDate).toLocaleDateString() : 'Unknown'}
                  </span>
                  <div className="flex space-x-2">
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handleViewClick(admin)}
                      className="hover:bg-green-50"
                      title="View Details"
                    >
                      <EyeIcon className="h-4 w-4" />
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handleEditClick(admin)}
                      className="hover:bg-blue-50"
                    >
                      <EditIcon className="h-4 w-4" />
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={() => handleDeleteAdmin(admin?.id || '')}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {(!admins || admins.length === 0) && (
        <Card>
          <CardContent className="p-12 text-center">
            <CrownIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Schools Found</h3>
            <p className="text-gray-600 mb-4">Get started by adding your first school</p>
            <Button onClick={() => setIsAddDialogOpen(true)}>
              <UserPlusIcon className="h-4 w-4 mr-2" />
              Add First School
            </Button>
          </CardContent>
        </Card>
      )}

      {/* View Admin Details Modal */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">School Details</DialogTitle>
          </DialogHeader>
          {viewingAdmin && (
            <div className="space-y-6">
              {/* School Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CrownIcon className="h-5 w-5" />
                    School Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between py-2 border-b">
                    <Label className="text-sm font-medium text-gray-500">School Name</Label>
                    <p className="text-lg font-semibold text-right">{viewingAdmin.schoolName || 'N/A'}</p>
                  </div>
                  <div className="flex items-center justify-between py-2 border-b">
                    <Label className="text-sm font-medium text-gray-500">Administrator Name</Label>
                    <p className="text-lg font-semibold text-right">{viewingAdmin.name || 'N/A'}</p>
                  </div>
                  <div className="flex items-center justify-between py-2 border-b">
                    <Label className="text-sm font-medium text-gray-500">Email</Label>
                    <p className="text-lg text-right">{viewingAdmin.email || 'N/A'}</p>
                  </div>
                  <div className="flex items-center justify-between py-2 border-b">
                    <Label className="text-sm font-medium text-gray-500">Board</Label>
                    <p className="text-lg text-right">
                      {viewingAdmin.board === 'CBSE_AP' ? 'CBSE AP' :
                       viewingAdmin.board === 'CBSE_TS' ? 'CBSE TS' :
                       viewingAdmin.board === 'STATE_AP' ? 'State AP' :
                       viewingAdmin.board === 'STATE_TS' ? 'State TS' : viewingAdmin.board || 'N/A'}
                    </p>
                  </div>
                  <div className="flex items-center justify-between py-2 border-b">
                    <Label className="text-sm font-medium text-gray-500 flex items-center gap-1">
                      <UserIcon className="h-4 w-4" />
                      Contact Person
                    </Label>
                    <p className="text-lg text-right">{viewingAdmin.contactPerson || 'N/A'}</p>
                  </div>
                  <div className="flex items-center justify-between py-2 border-b">
                    <Label className="text-sm font-medium text-gray-500 flex items-center gap-1">
                      <PhoneIcon className="h-4 w-4" />
                      Phone
                    </Label>
                    <p className="text-lg text-right">{viewingAdmin.phone || 'N/A'}</p>
                  </div>
                  <div className="flex items-center justify-between py-2 border-b">
                    <Label className="text-sm font-medium text-gray-500 flex items-center gap-1">
                      <MapPinIcon className="h-4 w-4" />
                      Place
                    </Label>
                    <p className="text-lg text-right">{viewingAdmin.place || 'N/A'}</p>
                  </div>
                  <div className="flex items-center justify-between py-2 border-b">
                    <Label className="text-sm font-medium text-gray-500">PIN Code</Label>
                    <p className="text-lg text-right">{viewingAdmin.pin || 'N/A'}</p>
                  </div>
                  <div className="flex items-center justify-between py-2 border-b">
                    <Label className="text-sm font-medium text-gray-500">Status</Label>
                    <Badge variant={viewingAdmin.status === 'active' ? 'default' : 'secondary'}>
                      {viewingAdmin.status || 'inactive'}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between py-2">
                    <Label className="text-sm font-medium text-gray-500">Join Date</Label>
                    <p className="text-lg text-right">
                      {viewingAdmin.joinDate ? new Date(viewingAdmin.joinDate).toLocaleDateString() : 'N/A'}
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Classes and Students */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BookOpenIcon className="h-5 w-5" />
                    Classes & Students
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {isLoadingDetails ? (
                    <div className="text-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                      <p className="text-gray-600">Loading class and student details...</p>
                    </div>
                  ) : adminDetails && adminDetails.classes && adminDetails.classes.length > 0 ? (
                    <div className="space-y-4">
                      {adminDetails.classes.map((className: string) => (
                        <div key={className} className="border rounded-lg p-4">
                          <h4 className="font-semibold text-lg mb-3 flex items-center gap-2">
                            <GraduationCapIcon className="h-5 w-5 text-blue-600" />
                            Class {className}
                            <Badge variant="outline" className="ml-2">
                              {adminDetails.studentsByClass[className]?.length || 0} students
                            </Badge>
                          </h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                            {adminDetails.studentsByClass[className]?.map((student: any) => (
                              <div key={student.id || student._id} className="bg-gray-50 p-3 rounded-lg">
                                <p className="font-medium text-gray-900">{student.fullName || student.name || 'Unknown'}</p>
                                <p className="text-sm text-gray-600">{student.email || 'No email'}</p>
                                {student.phone && (
                                  <p className="text-xs text-gray-500">Phone: {student.phone}</p>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <UsersIcon className="h-12 w-12 mx-auto mb-2 text-gray-400" />
                      <p>No classes or students found for this school</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Statistics */}
              <Card>
                <CardHeader>
                  <CardTitle>Statistics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center p-3 bg-green-50 rounded-lg">
                      <UsersIcon className="h-6 w-6 text-green-600 mx-auto mb-2" />
                      <p className="text-2xl font-bold text-green-900">{viewingAdmin.stats?.students || 0}</p>
                      <p className="text-sm text-green-600">Students</p>
                    </div>
                    <div className="text-center p-3 bg-purple-50 rounded-lg">
                      <GraduationCapIcon className="h-6 w-6 text-purple-600 mx-auto mb-2" />
                      <p className="text-2xl font-bold text-purple-900">{viewingAdmin.stats?.teachers || 0}</p>
                      <p className="text-sm text-purple-600">Teachers</p>
                    </div>
                    <div className="text-center p-3 bg-blue-50 rounded-lg">
                      <BookOpenIcon className="h-6 w-6 text-blue-600 mx-auto mb-2" />
                      <p className="text-2xl font-bold text-blue-900">{viewingAdmin.stats?.exams || 0}</p>
                      <p className="text-sm text-blue-600">Exams</p>
                    </div>
                    <div className="text-center p-3 bg-orange-50 rounded-lg">
                      <UsersIcon className="h-6 w-6 text-orange-600 mx-auto mb-2" />
                      <p className="text-2xl font-bold text-orange-900">{viewingAdmin.stats?.totalExamsTaken || 0}</p>
                      <p className="text-sm text-orange-600">Exams Taken</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
