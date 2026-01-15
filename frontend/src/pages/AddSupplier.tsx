import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { suppliersService } from '../services/suppliers.service';
import toast from 'react-hot-toast';

export default function AddSupplier() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState({
    street: '',
    city: '',
    state: '',
    zipCode: '',
    country: '',
  });
  const [contactPerson, setContactPerson] = useState('');
  const [notes, setNotes] = useState('');
  const [rating, setRating] = useState('');
  const [isActive, setIsActive] = useState(true);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      toast.error('Please enter a supplier name');
      return;
    }
    
    if (!code.trim()) {
      toast.error('Please enter a supplier code');
      return;
    }
    
    if (!email.trim()) {
      toast.error('Please enter an email address');
      return;
    }
    
    if (!phone.trim()) {
      toast.error('Please enter a phone number');
      return;
    }
    
    if (!contactPerson.trim()) {
      toast.error('Please enter a contact person');
      return;
    }
    
    if (!address.street || !address.city || !address.state || !address.zipCode || !address.country) {
      toast.error('Please fill in all address fields');
      return;
    }

    try {
      setLoading(true);

      const supplierData = {
        name,
        code: code.toUpperCase(),
        email,
        phone,
        address: {
          street: address.street || '',
          city: address.city || '',
          state: address.state || '',
          zipCode: address.zipCode || '',
          country: address.country || '',
        },
        contactPerson,
        paymentTerms: notes || undefined,
        rating: rating ? parseFloat(rating) : undefined,
        isActive,
      };

      await suppliersService.createSupplier(supplierData);
      toast.success('Supplier created successfully!');
      navigate('/suppliers');
    } catch (error: any) {
      toast.error(error.message || 'Failed to create supplier');
      console.error('Error creating supplier:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link to="/suppliers">
            <Button type="button" variant="ghost" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Add New Supplier</h1>
            <p className="mt-1 text-sm text-gray-500">Create a new supplier in your system</p>
          </div>
        </div>
        <div className="flex space-x-3">
          <Link to="/suppliers">
            <Button type="button" variant="outline">
              Cancel
            </Button>
          </Link>
          <Button type="submit" disabled={loading}>
            <Save className="mr-2 h-4 w-4" />
            {loading ? 'Creating...' : 'Save Supplier'}
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Information */}
          <div className="rounded-lg border border-gray-200 bg-white p-6">
            <h2 className="text-lg font-semibold text-gray-900">Basic Information</h2>
            <div className="mt-4 space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label required>Supplier Name</Label>
                  <Input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter supplier name"
                    className="mt-1"
                    required
                  />
                </div>
                <div>
                  <Label required>Supplier Code</Label>
                  <Input
                    value={code}
                    onChange={(e) => setCode(e.target.value.toUpperCase())}
                    placeholder="SUP-001"
                    className="mt-1"
                    required
                  />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label required>Email</Label>
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="supplier@example.com"
                    className="mt-1"
                    required
                  />
                </div>
                <div>
                  <Label required>Phone</Label>
                  <Input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+1 (555) 123-4567"
                    className="mt-1"
                    required
                  />
                </div>
              </div>

              <div>
                <Label required>Contact Person</Label>
                <Input
                  value={contactPerson}
                  onChange={(e) => setContactPerson(e.target.value)}
                  placeholder="John Doe"
                  className="mt-1"
                  required
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label>Rating</Label>
                  <Input
                    type="number"
                    min="0"
                    max="5"
                    step="0.1"
                    value={rating}
                    onChange={(e) => setRating(e.target.value)}
                    placeholder="4.5"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label>Status</Label>
                  <select
                    value={isActive ? 'active' : 'inactive'}
                    onChange={(e) => setIsActive(e.target.value === 'active')}
                    className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <div>
                <Label>Notes</Label>
                <Textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Additional notes about this supplier..."
                  className="mt-1"
                  rows={3}
                />
              </div>
            </div>
          </div>

          {/* Address Information */}
          <div className="rounded-lg border border-gray-200 bg-white p-6">
            <h2 className="text-lg font-semibold text-gray-900">Address Information</h2>
            <div className="mt-4 space-y-4">
              <div>
                <Label>Street Address</Label>
                <Input
                  value={address.street}
                  onChange={(e) => setAddress({ ...address, street: e.target.value })}
                  placeholder="123 Main Street"
                  className="mt-1"
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label>City</Label>
                  <Input
                    value={address.city}
                    onChange={(e) => setAddress({ ...address, city: e.target.value })}
                    placeholder="New York"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label>State</Label>
                  <Input
                    value={address.state}
                    onChange={(e) => setAddress({ ...address, state: e.target.value })}
                    placeholder="NY"
                    className="mt-1"
                  />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label>ZIP Code</Label>
                  <Input
                    value={address.zipCode}
                    onChange={(e) => setAddress({ ...address, zipCode: e.target.value })}
                    placeholder="10001"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label>Country</Label>
                  <Input
                    value={address.country}
                    onChange={(e) => setAddress({ ...address, country: e.target.value })}
                    placeholder="United States"
                    className="mt-1"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}

