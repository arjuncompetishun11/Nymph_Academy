import { useState, useEffect } from 'react';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../../firebase';

const WebsiteManagementPage = () => {
  const [settings, setSettings] = useState({
    paymentQRUrl: '',
    paymentPrice: '',
    logoUrl: ''
  });
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [paymentQRFile, setPaymentQRFile] = useState(null);
  const [logoFile, setLogoFile] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const settingsRef = doc(db, "settings", "website");
        const settingsDoc = await getDoc(settingsRef);
        
        if (settingsDoc.exists()) {
          setSettings(settingsDoc.data());
        }
        
        setLoading(false);
      } catch (error) {
        console.error("Error fetching settings:", error);
        setErrorMessage("Failed to load website settings. Please try again.");
        setLoading(false);
      }
    };
    
    fetchSettings();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setSettings({
      ...settings,
      [name]: value
    });
  };

  const handleFileChange = (e) => {
    const { name, files } = e.target;
    
    if (files.length > 0) {
      if (name === 'paymentQR') {
        setPaymentQRFile(files[0]);
      } else if (name === 'logo') {
        setLogoFile(files[0]);
      }
    }
  };

  const uploadImage = async (file, path) => {
    if (!file) return null;
    
    const storageRef = ref(storage, path);
    await uploadBytes(storageRef, file);
    return getDownloadURL(storageRef);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setSaving(true);
      setErrorMessage('');
      setSuccessMessage('');
      
      let updatedSettings = { ...settings };
      
      // Upload payment QR if provided
      if (paymentQRFile) {
        const paymentQRUrl = await uploadImage(
          paymentQRFile, 
          `website/payment-qr-${Date.now()}.${paymentQRFile.name.split('.').pop()}`
        );
        updatedSettings.paymentQRUrl = paymentQRUrl;
      }
      
      // Upload logo if provided
      if (logoFile) {
        const logoUrl = await uploadImage(
          logoFile, 
          `website/logo-${Date.now()}.${logoFile.name.split('.').pop()}`
        );
        updatedSettings.logoUrl = logoUrl;
      }
      
      // Update the settings in Firestore
      const settingsRef = doc(db, "settings", "website");
      await updateDoc(settingsRef, {
        ...updatedSettings,
        updatedAt: new Date()
      });
      
      // Update local state
      setSettings(updatedSettings);
      setSuccessMessage("Website settings updated successfully!");
      
      // Reset file inputs
      setPaymentQRFile(null);
      setLogoFile(null);
      
      // Reset file input elements
      document.getElementById('paymentQR').value = '';
      document.getElementById('logo').value = '';
      
    } catch (error) {
      console.error("Error updating settings:", error);
      setErrorMessage("Failed to update website settings. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Website Management</h2>
      
      {successMessage && (
        <div className="bg-green-50 border-l-4 border-green-400 p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-green-700">{successMessage}</p>
            </div>
          </div>
        </div>
      )}
      
      {errorMessage && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd"/>
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{errorMessage}</p>
            </div>
          </div>
        </div>
      )}
      
      <div className="bg-white rounded-lg shadow-md p-6">
        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-4">Payment Settings</h3>
            
            <div className="mb-4">
              <label htmlFor="paymentPrice" className="block text-sm font-medium text-gray-700 mb-1">
                Payment Amount (₹)
              </label>
              <input
                type="number"
                id="paymentPrice"
                name="paymentPrice"
                value={settings.paymentPrice}
                onChange={handleInputChange}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-4 py-2 border"
                required
              />
            </div>
            
            <div className="mb-4">
              <label htmlFor="paymentQR" className="block text-sm font-medium text-gray-700 mb-1">
                Payment QR Code
              </label>
              <div className="flex items-start">
                <div className="flex-1">
                  <input
                    type="file"
                    id="paymentQR"
                    name="paymentQR"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="block w-full text-sm text-gray-500
                           file:mr-4 file:py-2 file:px-4
                           file:rounded-md file:border-0
                           file:text-sm file:font-semibold
                           file:bg-blue-50 file:text-blue-700
                           hover:file:bg-blue-100"
                  />
                  <p className="mt-1 text-sm text-gray-500">
                    Upload a new QR code image (PNG or JPG).
                  </p>
                </div>
                
                {settings.paymentQRUrl && (
                  <div className="ml-4">
                    <div className="text-sm font-medium text-gray-700 mb-1">Current QR Code</div>
                    <img 
                      src={settings.paymentQRUrl} 
                      alt="Payment QR Code" 
                      className="h-24 w-auto object-cover border border-gray-200 rounded"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <div className="mb-6 pt-6 border-t border-gray-200">
            <h3 className="text-lg font-semibold mb-4">Website Branding</h3>
            
            <div className="mb-4">
              <label htmlFor="logo" className="block text-sm font-medium text-gray-700 mb-1">
                Website Logo
              </label>
              <div className="flex items-start">
                <div className="flex-1">
                  <input
                    type="file"
                    id="logo"
                    name="logo"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="block w-full text-sm text-gray-500
                           file:mr-4 file:py-2 file:px-4
                           file:rounded-md file:border-0
                           file:text-sm file:font-semibold
                           file:bg-blue-50 file:text-blue-700
                           hover:file:bg-blue-100"
                  />
                  <p className="mt-1 text-sm text-gray-500">
                    Upload a new logo image (PNG or SVG recommended).
                  </p>
                </div>
                
                {settings.logoUrl && (
                  <div className="ml-4">
                    <div className="text-sm font-medium text-gray-700 mb-1">Current Logo</div>
                    <img 
                      src={settings.logoUrl} 
                      alt="Website Logo" 
                      className="h-16 w-auto object-contain border border-gray-200 rounded p-1"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <div className="mt-6 pt-6 border-t border-gray-200 flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className={`px-4 py-2 rounded-md text-white font-medium ${
                saving ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default WebsiteManagementPage;