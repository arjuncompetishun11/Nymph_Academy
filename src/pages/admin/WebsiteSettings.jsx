import { useState, useEffect, useRef } from 'react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import { uploadImage } from '../../cloudinary';
import AdminLayout from '../../components/admin/AdminLayout';

const WebsiteSettings = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState({ type: '', content: '' });
  
  const [settings, setSettings] = useState({
    paymentPrice: '150',
    paymentQRUrl: 'https://res.cloudinary.com/dzwjnirr2/image/upload/v1760094772/payment-qr_ucm3p1.svg',
    logoUrl: '',
  });

  const [previewUrls, setPreviewUrls] = useState({
    qr: '',
    logo: ''
  });
  
  const fileInputRef = useRef(null);
  const logoFileInputRef = useRef(null);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const settingsRef = doc(db, "settings", "website");
        const settingsDoc = await getDoc(settingsRef);
        
        if (settingsDoc.exists()) {
          const data = settingsDoc.data();
          setSettings({
            paymentPrice: data.paymentPrice || '150',
            paymentQRUrl: data.paymentQRUrl || 'https://res.cloudinary.com/dzwjnirr2/image/upload/v1760094772/payment-qr_ucm3p1.svg',
            logoUrl: data.logoUrl || '',
          });
          
          // Set preview URLs
          setPreviewUrls({
            qr: data.paymentQRUrl || 'https://res.cloudinary.com/dzwjnirr2/image/upload/v1760094772/payment-qr_ucm3p1.svg',
            logo: data.logoUrl || ''
          });
        }
      } catch (error) {
        console.error("Error fetching website settings:", error);
        setMessage({ 
          type: 'error', 
          content: 'Failed to load website settings. Please refresh the page.'
        });
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setSettings(prev => ({
      ...prev,
      [name]: value
    }));

    // For URL fields, update the preview
    if (name === 'paymentQRUrl') {
      setPreviewUrls(prev => ({
        ...prev,
        qr: value
      }));
    } else if (name === 'logoUrl') {
      setPreviewUrls(prev => ({
        ...prev,
        logo: value
      }));
    }
  };
  
  const handleQRCodeUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    // Validate file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png'];
    if (!validTypes.includes(file.type)) {
      setMessage({
        type: 'error',
        content: 'Only JPG/PNG files are allowed'
      });
      return;
    }
    
    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      setMessage({
        type: 'error',
        content: 'File size exceeds 5MB limit'
      });
      return;
    }
    
    setUploading(true);
    setMessage({ type: '', content: '' });
    
    try {
      // Upload to Cloudinary using the existing function
      const result = await uploadImage(file, "nymph_academy_qr_code_preset");
      
      // Update settings and preview with the new URL
      setSettings(prev => ({
        ...prev,
        paymentQRUrl: result.url
      }));
      
      setPreviewUrls(prev => ({
        ...prev,
        qr: result.url
      }));
      
      setMessage({
        type: 'success',
        content: 'QR code uploaded successfully!'
      });
      
      // Clear message after 3 seconds
      setTimeout(() => {
        setMessage({ type: '', content: '' });
      }, 3000);
    } catch (error) {
      console.error("Error uploading QR code:", error);
      setMessage({
        type: 'error',
        content: `Failed to upload QR code: ${error.message}`
      });
    } finally {
      setUploading(false);
      // Reset the file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };
  
  const handleLogoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    // Validate file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/svg+xml'];
    if (!validTypes.includes(file.type)) {
      setMessage({
        type: 'error',
        content: 'Only JPG/PNG/SVG files are allowed'
      });
      return;
    }
    
    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      setMessage({
        type: 'error',
        content: 'File size exceeds 5MB limit'
      });
      return;
    }
    
    setUploading(true);
    setMessage({ type: '', content: '' });
    
    try {
      // Upload to Cloudinary using the existing function
      const result = await uploadImage(file, "nymph_academy_logo_preset");
      
      // Update settings and preview with the new URL
      setSettings(prev => ({
        ...prev,
        logoUrl: result.url
      }));
      
      setPreviewUrls(prev => ({
        ...prev,
        logo: result.url
      }));
      
      setMessage({
        type: 'success',
        content: 'Logo uploaded successfully!'
      });
      
      // Clear message after 3 seconds
      setTimeout(() => {
        setMessage({ type: '', content: '' });
      }, 3000);
    } catch (error) {
      console.error("Error uploading logo:", error);
      setMessage({
        type: 'error',
        content: `Failed to upload logo: ${error.message}`
      });
    } finally {
      setUploading(false);
      // Reset the file input
      if (logoFileInputRef.current) {
        logoFileInputRef.current.value = '';
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ type: '', content: '' });

    try {
      // Validate URLs
      if (settings.paymentQRUrl && !isValidUrl(settings.paymentQRUrl)) {
        throw new Error("Payment QR URL is not valid");
      }
      
      if (settings.logoUrl && !isValidUrl(settings.logoUrl)) {
        throw new Error("Logo URL is not valid");
      }

      // Save to Firestore with timestamp
      const settingsRef = doc(db, "settings", "website");
      await setDoc(settingsRef, {
        ...settings,
        updatedAt: new Date()
      }, { merge: true });
      
      setMessage({
        type: 'success',
        content: 'Website settings updated successfully!'
      });
      
      // Clear message after 5 seconds
      setTimeout(() => {
        setMessage({ type: '', content: '' });
      }, 5000);
    } catch (error) {
      console.error("Error saving website settings:", error);
      setMessage({
        type: 'error',
        content: `Failed to save settings: ${error.message}`
      });
    } finally {
      setSaving(false);
    }
  };

  // Function to validate URL
  const isValidUrl = (url) => {
    try {
      new URL(url);
      return true;
    } catch (error) {
      return false;
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="bg-white shadow rounded-lg p-6">
        <h1 className="text-2xl font-semibold text-gray-800 mb-6">Website Settings</h1>
        
        {message.content && (
          <div className={`mb-4 p-3 rounded ${
            message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          }`}>
            {message.content}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Payment Settings */}
          <div className="mb-8">
            <h2 className="text-xl font-medium text-gray-700 mb-4">Payment Settings</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="paymentPrice">
                  Payment Fee Amount (₹)
                </label>
                <input
                  type="text"
                  id="paymentPrice"
                  name="paymentPrice"
                  value={settings.paymentPrice}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="paymentQRUrl">
                  Payment QR Code URL
                </label>
                <div className="flex flex-col space-y-2">
                  <input
                    type="text"
                    id="paymentQRUrl"
                    name="paymentQRUrl"
                    value={settings.paymentQRUrl}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="https://example.com/qr-code.png"
                    required
                  />
                  
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-500">Or upload a QR code image:</span>
                    <input
                      type="file"
                      ref={fileInputRef}
                      accept="image/png,image/jpeg,image/jpg"
                      className="hidden"
                      onChange={handleQRCodeUpload}
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current.click()}
                      className="bg-gray-100 hover:bg-gray-200 text-gray-800 text-sm py-1 px-3 rounded border border-gray-300 transition"
                      disabled={uploading}
                    >
                      {uploading ? 'Uploading...' : 'Choose File'}
                    </button>
                  </div>
                </div>
                
                {/* QR Code Preview */}
                {previewUrls.qr && (
                  <div className="mt-2">
                    <p className="text-sm text-gray-500 mb-1">QR Code Preview:</p>
                    <div className="border border-gray-300 rounded p-2 bg-gray-50 inline-block">
                      <img 
                        src={previewUrls.qr} 
                        alt="Payment QR Preview" 
                        className="h-32 w-32 object-contain"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = 'https://via.placeholder.com/150?text=Invalid+URL';
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Logo Settings */}
          <div className="mb-8">
            <h2 className="text-xl font-medium text-gray-700 mb-4">Logo Settings</h2>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="logoUrl">
                Logo URL
              </label>
              <div className="flex flex-col space-y-2">
                <input
                  type="text"
                  id="logoUrl"
                  name="logoUrl"
                  value={settings.logoUrl}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="https://example.com/logo.png"
                />
                
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-500">Or upload a logo image:</span>
                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/jpg,image/svg+xml"
                    className="hidden"
                    onChange={handleLogoUpload}
                    ref={(el) => (logoFileInputRef.current = el)}
                  />
                  <button
                    type="button"
                    onClick={() => logoFileInputRef.current.click()}
                    className="bg-gray-100 hover:bg-gray-200 text-gray-800 text-sm py-1 px-3 rounded border border-gray-300 transition"
                    disabled={uploading}
                  >
                    {uploading ? 'Uploading...' : 'Choose File'}
                  </button>
                </div>
              </div>
              
              {/* Logo Preview */}
              {previewUrls.logo && (
                <div className="mt-2">
                  <p className="text-sm text-gray-500 mb-1">Logo Preview:</p>
                  <div className="border border-gray-300 rounded p-2 bg-gray-50 inline-block">
                    <img 
                      src={previewUrls.logo} 
                      alt="Logo Preview" 
                      className="h-16 object-contain"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = 'https://via.placeholder.com/150?text=Invalid+URL';
                      }}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition duration-300 disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save Settings'}
            </button>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
};

export default WebsiteSettings;