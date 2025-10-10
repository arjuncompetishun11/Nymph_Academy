import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, updateDoc, collection, query, where, getDocs, setDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { uploadPaymentScreenshot } from '../cloudinary';
import NavBar from '../components/NavBar';
import Footer from '../components/Footer';

const PaymentPage = () => {
  const { studentId } = useParams();
  const navigate = useNavigate();
  const [studentData, setStudentData] = useState(null);
  const [paymentFile, setPaymentFile] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(true);
  const [paymentPreview, setPaymentPreview] = useState(null);

  // Fetch student data
  useEffect(() => {
    const fetchStudentData = async () => {
      if (!studentId) {
        navigate('/enrollment');
        return;
      }

      try {
        const studentRef = doc(db, 'students', studentId);
        const studentDoc = await getDoc(studentRef);
        
        if (!studentDoc.exists()) {
          navigate('/enrollment');
          return;
        }

        setStudentData({
          id: studentDoc.id,
          ...studentDoc.data()
        });
      } catch (error) {
        console.error('Error fetching student data:', error);
        setErrors({
          ...errors,
          fetch: 'Failed to load student data. Please try again.'
        });
      } finally {
        setLoading(false);
      }
    };

    fetchStudentData();
  }, [studentId, navigate]);

  // Handle file input change
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    
    if (file) {
      // Validate file type
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png'];
      if (!validTypes.includes(file.type)) {
        setErrors({
          ...errors,
          paymentFile: 'Only JPG/PNG files are allowed'
        });
        return;
      }
      
      // Validate file size (5MB = 5 * 1024 * 1024 bytes)
      if (file.size > 5 * 1024 * 1024) {
        setErrors({
          ...errors,
          paymentFile: 'File size must be less than 5MB'
        });
        return;
      }
      
      // Set the file
      setPaymentFile(file);
      
      // Create a preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPaymentPreview(reader.result);
      };
      reader.readAsDataURL(file);
      
      // Clear error
      setErrors({
        ...errors,
        paymentFile: ''
      });
    }
  };

  // Find the highest existing roll number for a class
  const findHighestExistingRollNumber = async (classGrade) => {
    try {
      // Query students collection for roll numbers of this class
      const studentsRef = collection(db, 'students');
      
      // Roll numbers for this class start with '1' + classGrade
      const prefix = `1${classGrade}`;
      
      // Get all roll numbers for this class
      const q = query(
        studentsRef, 
        where("rollNumber", ">=", prefix), 
        where("rollNumber", "<", prefix + '\uf8ff') // This is a trick to get all strings that start with the prefix
      );
      
      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) {
        return 0; // No students in this class yet
      }
      
      // Find the highest roll number
      let highestNumber = 0;
      
      querySnapshot.forEach(doc => {
        const rollNumber = doc.data().rollNumber;
        if (rollNumber && rollNumber.startsWith(prefix)) {
          // Extract the number part (last 3 digits)
          const numberPart = parseInt(rollNumber.substring(prefix.length), 10);
          if (!isNaN(numberPart) && numberPart > highestNumber) {
            highestNumber = numberPart;
          }
        }
      });
      
      return highestNumber;
    } catch (error) {
      console.error('Error finding highest roll number:', error);
      return 0; // Default to 0 on error
    }
  };

  // Check if a specific roll number already exists
  const checkRollNumberExists = async (rollNumber) => {
    try {
      const studentsRef = collection(db, 'students');
      const q = query(studentsRef, where("rollNumber", "==", rollNumber));
      const querySnapshot = await getDocs(q);
      
      return !querySnapshot.empty;
    } catch (error) {
      console.error('Error checking for roll number:', error);
      return true; // Assume it exists on error to be safe
    }
  };
  
  // Generate roll number (format: 1{class_number}{last_roll_number of class in three digits})
  const generateRollNumber = async (classGrade) => {
    try {
      // Reference to the roll number counter document for this class
      const rollCounterRef = doc(db, 'rollNumberCounters', `class${classGrade}`);
      
      // Get the current counter
      const rollCounterDoc = await getDoc(rollCounterRef);
      
      let lastRollNumber = 0;
      
      if (rollCounterDoc.exists()) {
        // If the counter document exists, get the last roll number
        lastRollNumber = rollCounterDoc.data().lastRollNumber;
      } else {
        // Counter doesn't exist, so initialize it based on existing data
        console.log(`Initializing counter for class ${classGrade}...`);
        
        // Find the highest existing roll number for this class
        const highestNumber = await findHighestExistingRollNumber(classGrade);
        lastRollNumber = highestNumber; // Start from the highest existing number
        
        console.log(`Found highest existing roll number for class ${classGrade}: ${highestNumber}`);
      }
      
      // Increment the roll number
      const newRollNumber = lastRollNumber + 1;
      
      // Format the roll number: 1{class_number}{three-digit counter}
      // Pad the number with leading zeros to make it 3 digits
      const paddedNumber = String(newRollNumber).padStart(3, '0');
      
      // Create the roll number
      const rollNumber = `1${classGrade}${paddedNumber}`;
      
      // Double-check that this roll number doesn't already exist
      // This is a safety check in case the counter gets out of sync
      const exists = await checkRollNumberExists(rollNumber);
      
      if (exists) {
        // If somehow the roll number already exists, recursively try the next one
        console.warn(`Roll number ${rollNumber} already exists. Trying next number.`);
        return generateRollNumber(classGrade);
      }
      
      // Update the counter in Firestore
      await setDoc(rollCounterRef, {
        lastRollNumber: newRollNumber,
        lastUpdated: new Date()
      });
      
      return rollNumber;
    } catch (error) {
      console.error('Error generating roll number:', error);
      throw new Error('Failed to generate roll number');
    }
  };

  // Send email function (placeholder)
  const sendEmail = (studentData) => {
    // This is a placeholder function
    console.log('Sending email to student:', studentData.email);
    // Implement email sending functionality later
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!paymentFile) {
      setErrors({
        ...errors,
        paymentFile: 'Payment screenshot is required'
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Step 1: Upload payment screenshot to Cloudinary
      const uploadResult = await uploadPaymentScreenshot(paymentFile);
      
      // Step 2: Generate roll number based on student's class/grade
      const rollNumber = await generateRollNumber(studentData.classGrade);
      
      // Step 3: Update student record in Firestore
      const studentRef = doc(db, 'students', studentId);
      await updateDoc(studentRef, {
        paymentStatus: 'completed',
        paymentScreenshotURL: uploadResult.url,
        paymentScreenshotPublicId: uploadResult.publicId, // Store Cloudinary public ID for potential deletion later
        paymentDate: new Date(),
        rollNumber: rollNumber
      });
      
      // Get the updated student data for email and confirmation
      const updatedStudentDoc = await getDoc(studentRef);
      const updatedStudentData = {
        id: updatedStudentDoc.id,
        ...updatedStudentDoc.data()
      };
      
      // Step 4: Send email confirmation (placeholder)
      sendEmail(updatedStudentData);
      
      // Navigate to confirmation page
      navigate(`/confirmation/${studentId}`);
    } catch (error) {
      console.error('Error submitting payment:', error);
      setErrors({
        ...errors,
        submit: 'An error occurred. Please try again.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen bg-gray-50">
        <NavBar />
        <div className="flex-grow flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <NavBar />
      <div className="flex-grow container mx-auto py-8 px-4">
        <div className="max-w-md mx-auto bg-white p-8 rounded-lg shadow-md">
          <h1 className="text-2xl font-bold text-center text-gray-800 mb-6">
            Nymph Academy Payment
          </h1>

          {errors.fetch && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {errors.fetch}
            </div>
          )}

          {errors.submit && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {errors.submit}
            </div>
          )}

          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-700 mb-2">
              Student Information
            </h2>
            <p className="text-gray-600">Student's Name: {studentData?.fullName}</p>
            <p className="text-gray-600">Class: {studentData?.classGrade}</p>
            <p className="text-gray-600">School: {studentData?.schoolName}</p>
            <p className="text-gray-600">Email: {studentData?.email}</p>
          </div>

          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-700 mb-3">
              Payment Details
            </h2>
            <p className="text-gray-600 mb-4">Fee: ₹150</p>

            <div className="flex justify-center mb-4">
              <div className="border border-gray-300 rounded-md p-4 bg-gray-50">
                <img
                  src="https://res.cloudinary.com/dzwjnirr2/image/upload/v1760094772/payment-qr_ucm3p1.svg"
                  alt="Payment QR Code"
                  className="h-64 w-64 object-contain"
                />
              </div>
            </div>

            <p className="text-sm text-gray-500 mb-4 text-center">
              Scan the QR code above to make your payment of ₹150
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            {/* Payment Screenshot Upload */}
            <div className="mb-6">
              <label
                htmlFor="paymentFile"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Upload Payment Screenshot * (JPG/PNG, Max 5MB)
              </label>
              <input
                type="file"
                id="paymentFile"
                name="paymentFile"
                onChange={handleFileChange}
                accept=".jpg,.jpeg,.png"
                className="w-full"
              />
              {errors.paymentFile && (
                <p className="mt-1 text-sm text-red-500">
                  {errors.paymentFile}
                </p>
              )}

              {paymentPreview && (
                <div className="mt-2">
                  <img
                    src={paymentPreview}
                    alt="Payment Screenshot Preview"
                    className="h-32 w-auto object-cover rounded-md"
                  />
                </div>
              )}
            </div>

            <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded mb-6">
              <p className="text-sm">
                <strong>Warning:</strong> Students are strictly required to
                upload the correct and valid payment receipt after making the
                payment. In case it is found that the payment has not been
                completed and/or an invalid or false document has been uploaded,
                Nymph Academy reserves the sole right to nullify the
                registration and cancel the roll number issued against it. Such
                students will not be permitted to appear for the test under any
                circumstances.
              </p>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition duration-300 disabled:opacity-50"
            >
              {isSubmitting ? "Processing Payment..." : "Confirm Payment"}
            </button>
          </form>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default PaymentPage;