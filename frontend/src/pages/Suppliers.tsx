import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, Eye, Edit, Mail, Phone, MapPin, Trash2 } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import { suppliersService } from '../services/suppliers.service';
import type { Supplier } from '../types';
import toast from 'react-hot-toast';

export default function Suppliers() {
  const [loading, setLoading] = useState(true);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadSuppliers();
  }, []);

  const loadSuppliers = async () => {
    try {
      setLoading(true);
      const data = await suppliersService.getSuppliers();
      // Ensure all suppliers have id field (fallback to _id if needed)
      const suppliersWithId = data.map((s: any) => {
        if (!s.id && s._id) {
          s.id = s._id.toString();
        }
        return s;
      });
      setSuppliers(suppliersWithId);
    } catch (error: any) {
      toast.error('Failed to load suppliers');
      console.error('Error loading suppliers:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this supplier? This action cannot be undone.')) return;
    
    try {
      await suppliersService.deleteSupplier(id);
      toast.success('Supplier deleted successfully');
      loadSuppliers(); // Reload the list
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete supplier');
    }
  };

  const filteredSuppliers = suppliers.filter((supplier) =>
    supplier.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    supplier.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
    supplier.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Suppliers</h1>
          <p className="mt-1 text-sm text-gray-500">Manage your supplier relationships</p>
        </div>
        <Link to="/suppliers/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Supplier
          </Button>
        </Link>
      </div>

      {/* Search */}
      <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="Search suppliers..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading suppliers...</p>
          </div>
        </div>
      ) : (
        <>
          {/* Suppliers Grid */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredSuppliers.map((supplier) => (
              <div
                key={supplier.id || (supplier as any)._id}
                className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm hover:shadow-md transition-shadow"
              >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100 text-lg font-bold text-blue-600">
                    {supplier.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{supplier.name}</h3>
                    <p className="text-sm text-gray-500">{supplier.code}</p>
                  </div>
                </div>

                <div className="mt-4 space-y-2">
                  <div className="flex items-center text-sm text-gray-600">
                    <Mail className="mr-2 h-4 w-4 text-gray-400" />
                    {supplier.email}
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Phone className="mr-2 h-4 w-4 text-gray-400" />
                    {supplier.phone}
                  </div>
                  <div className="flex items-start text-sm text-gray-600">
                    <MapPin className="mr-2 mt-0.5 h-4 w-4 flex-shrink-0 text-gray-400" />
                    <span>
                      {supplier.address.city}, {supplier.address.state}
                    </span>
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    {supplier.rating && (
                      <Badge variant="secondary">
                        ⭐ {supplier.rating}
                      </Badge>
                    )}
                    <Badge variant={supplier.isActive ? 'success' : 'destructive'}>
                      {supplier.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="flex space-x-2">
                    <Link to={`/suppliers/${supplier.id || (supplier as any)._id || ''}`} className="flex-1">
                      <Button variant="outline" size="sm" className="w-full">
                        <Eye className="mr-2 h-4 w-4" />
                        View
                      </Button>
                    </Link>
                    <Link to={`/suppliers/${supplier.id || (supplier as any)._id || ''}/edit`} className="flex-1">
                      <Button variant="outline" size="sm" className="w-full">
                        <Edit className="mr-2 h-4 w-4" />
                        Edit
                      </Button>
                    </Link>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 text-red-600 hover:text-red-700 hover:bg-red-50"
                      onClick={() => handleDelete(supplier.id || (supplier as any)._id || '')}
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
            ))}
          </div>

          {filteredSuppliers.length === 0 && !loading && (
            <div className="rounded-lg border border-gray-200 bg-white p-12 text-center">
              <p className="text-gray-500">No suppliers found</p>
            </div>
          )}
        </>
      )}
    </div>
  );
}

