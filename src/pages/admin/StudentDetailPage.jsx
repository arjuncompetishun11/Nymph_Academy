import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import AdminLayout from '../../components/admin/AdminLayout';

const StudentDetailPage = () => {
  const { id } = useParams();
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchStudent = async () => {
      try {
        const studentDoc = await getDoc(doc(db, "students", id));
        if (studentDoc.exists()) {
          setStudent({
            id: studentDoc.id,
            ...studentDoc.data()
          });
        } else {
          console.error("No student found with ID:", id);
        }
        setLoading(false);
      } catch (error) {
        console.error("Error fetching student:", error);
        setLoading(false);
      }
    };
    
    fetchStudent();
  }, [id]);

  const formatDate = (timestamp) => {
    if (!timestamp) return 'N/A';
    try {
      return timestamp.toDate().toLocaleDateString();
    } catch (error) {
      return 'N/A';
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex justify-center items-center h-full">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      </AdminLayout>
    );
  }

  if (!student) {
    return (
      <AdminLayout>
        <div className="bg-white rounded-lg shadow-md p-6 text-center">
          <h2 className="text-2xl font-bold mb-4">Student Not Found</h2>
          <p className="text-gray-600 mb-4">The student you're looking for doesn't exist or has been removed.</p>
          <button 
            onClick={() => navigate('/admin/students')}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Back to Students
          </button>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Student Details</h2>
        <button
          onClick={() => navigate('/admin/students')}
          className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 flex items-center"
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Students
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="p-6 border-b">
          <div className="flex flex-col md:flex-row gap-6">
            <div className="md:w-1/4">
              <div className="mb-4">
                {student.photoURL ? (
                  <img 
                    src={student.photoURL} 
                    alt={student.fullName} 
                    className="w-full h-[250px] object-cover rounded-lg shadow-sm border border-gray-200"
                  />
                ) : (
                  <div className="w-full h-48 bg-gray-100 flex items-center justify-center rounded-lg">
                    <p className="text-gray-500">No photo</p>
                  </div>
                )}
              </div>
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                <h3 className="font-semibold text-blue-800 mb-2">Roll Number</h3>
                <p className="text-2xl font-bold">{student.rollNumber || 'Not Assigned'}</p>
              </div>
            </div>
            
            <div className="md:w-3/4">
              <h3 className="text-xl font-bold mb-4">{student.fullName}</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                  <p className="text-gray-500">Class</p>
                  <p className="font-semibold">Class {student.classGrade}</p>
                </div>
                <div>
                  <p className="text-gray-500">Medium</p>
                  <p className="font-semibold capitalize">{student.medium}</p>
                </div>
                <div>
                  <p className="text-gray-500">Gender</p>
                  <p className="font-semibold capitalize">{student.gender}</p>
                </div>
                <div>
                  <p className="text-gray-500">Date of Birth</p>
                  <p className="font-semibold">{student.dateOfBirth}</p>
                </div>
                <div>
                  <p className="text-gray-500">Email</p>
                  <p className="font-semibold">{student.email || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-gray-500">School</p>
                  <p className="font-semibold">{student.schoolName}</p>
                </div>
                <div>
                  <p className="text-gray-500">Enrollment Date</p>
                  <p className="font-semibold">{formatDate(student.enrollmentDate)}</p>
                </div>
                <div>
                  <p className="text-gray-500">Payment Date</p>
                  <p className="font-semibold">{formatDate(student.paymentDate)}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
          <div className="bg-purple-50 p-4 rounded-lg border border-purple-100">
            <h3 className="font-semibold text-purple-800 mb-3">Mother's Information</h3>
            <div className="space-y-2">
              <div>
                <p className="text-gray-500 text-sm">Name</p>
                <p className="font-semibold">{student.motherName}</p>
              </div>
              <div>
                <p className="text-gray-500 text-sm">Occupation</p>
                <p className="font-semibold">{student.motherOccupation || 'N/A'}</p>
              </div>
              <div>
                <p className="text-gray-500 text-sm">Mobile</p>
                <p className="font-semibold">{student.motherMobile || 'N/A'}</p>
              </div>

              <div>
                <p className="text-gray-500 text-sm">Email</p>
                <p className="font-semibold">{student.motherEmail || 'N/A'}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-cyan-50 p-4 rounded-lg border border-cyan-100">
            <h3 className="font-semibold text-cyan-800 mb-3">Father's Information</h3>
            <div className="space-y-2">
              <div>
                <p className="text-gray-500 text-sm">Name</p>
                <p className="font-semibold">{student.fatherName}</p>
              </div>
              <div>
                <p className="text-gray-500 text-sm">Occupation</p>
                <p className="font-semibold">{student.fatherOccupation || 'N/A'}</p>
              </div>
              <div>
                <p className="text-gray-500 text-sm">Mobile</p>
                <p className="font-semibold">{student.fatherMobile || 'N/A'}</p>
              </div>

              <div>
                <p className="text-gray-500 text-sm">Email</p>
                <p className="font-semibold">{student.fatherEmail || 'N/A'}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-emerald-50 p-4 rounded-lg border border-emerald-100">
            <h3 className="font-semibold text-emerald-800 mb-3">Address Information</h3>
            <div className="space-y-2">
              <div>
                <p className="text-gray-500 text-sm">Address</p>
                <p className="font-semibold">{student.addressLine1}</p>
              </div>
              <div>
                <p className="text-gray-500 text-sm">City</p>
                <p className="font-semibold">{student.city}</p>
              </div>
              <div>
                <p className="text-gray-500 text-sm">State</p>
                <p className="font-semibold">{student.state}</p>
              </div>
              <div>
                <p className="text-gray-500 text-sm">PIN Code</p>
                <p className="font-semibold">{student.pincode}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-amber-50 p-4 rounded-lg border border-amber-100">
            <h3 className="font-semibold text-amber-800 mb-3">Family Information</h3>
            <div className="space-y-2">
              <div>
                <p className="text-gray-500 text-sm">Brothers</p>
                <p className="font-semibold">{student.numberOfBrothers || '0'}</p>
              </div>
              <div>
                <p className="text-gray-500 text-sm">Sisters</p>
                <p className="font-semibold">{student.numberOfSisters || '0'}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-100">
            <h3 className="font-semibold text-indigo-800 mb-3">How Heard About Us</h3>
            <div className="space-y-2">
              <div>
                <p className="text-gray-500 text-sm">Source</p>
                <p className="font-semibold">{student.hearAboutUs || 'N/A'}</p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="p-6 bg-gray-50">
          <h3 className="font-semibold text-gray-800 mb-4">Payment Proof</h3>
          {student.paymentScreenshotURL ? (
            <img 
              src={student.paymentScreenshotURL} 
              alt="Payment Screenshot" 
              className="max-w-full h-auto max-h-96 object-contain rounded-lg shadow-sm border border-gray-200"
            />
          ) : (
            <div className="bg-gray-100 h-48 flex items-center justify-center rounded-lg">
              <p className="text-gray-500">No payment screenshot available</p>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
};

export default StudentDetailPage;