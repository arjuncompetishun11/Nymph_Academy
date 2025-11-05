import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import NavBar from '../components/NavBar';
import Footer from '../components/Footer';

const ConfirmationPage = () => {
  const { studentId } = useParams();
  const navigate = useNavigate();
  const [studentData, setStudentData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch complete student data with roll number
  useEffect(() => {
    const fetchStudentData = async () => {
      if (!studentId) {
        navigate("/enrollment");
        return;
      }

      try {
        const studentRef = doc(db, "students", studentId);
        const studentDoc = await getDoc(studentRef);

        if (!studentDoc.exists() || !studentDoc.data().rollNumber) {
          // If no roll number, enrollment is not complete
          navigate("/enrollment");
          return;
        }

        setStudentData({
          id: studentDoc.id,
          ...studentDoc.data(),
        });
      } catch (error) {
        console.error("Error fetching student data:", error);
        setError("Failed to load enrollment data. Please contact the academy.");
      } finally {
        setLoading(false);
      }
    };

    fetchStudentData();
  }, [studentId, navigate]);

  // Format date
  const formatDate = (timestamp) => {
    if (!timestamp) return "N/A";

    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString("en-IN", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

const handlePrint = () => {
  const originalTitle = document.title;
  document.title = `Nymph Academy - Enrollment Confirmation (${
    studentData?.rollNumber || ""
  })`;

  const printContent = document.getElementById("confirmation-card");
  const originalContent = document.body.innerHTML;

  if (printContent) {
    document.body.innerHTML = printContent.outerHTML;
    window.print();
    document.body.innerHTML = originalContent;
  }

  document.title = originalTitle;
  window.location.reload(); // ensures event listeners & state are restored
};

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen bg-gray-50">
        <NavBar />
        <div className="flex-grow flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading enrollment details...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col min-h-screen bg-gray-50">
        <NavBar />
        <div className="flex-grow flex items-center justify-center">
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-6 rounded-lg shadow-md max-w-md">
            <div className="flex items-center mb-3">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h3 className="font-bold">Error</h3>
            </div>
            <p>{error}</p>
            <div className="mt-4">
              <button 
                onClick={() => navigate("/enrollment")}
                className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition duration-300"
              >
                Return to Enrollment
              </button>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <NavBar />
      <div className="flex-grow container mx-auto py-8 px-4">
        <div
          id="confirmation-card"
          className="max-w-3xl mx-auto bg-white p-8 rounded-lg shadow-lg"
        >
          <div className="border-b border-green-500 pb-4 mb-6 relative">
            <h1 className="text-3xl font-bold text-center text-gray-800 mt-4">
              Nymph Academy DOT Enrollment Confirmation
            </h1>
            <div className="mt-3 bg-green-50 border border-green-200 text-green-800 px-6 py-4 rounded-lg text-center print:hidden">
              <p className="text-lg">
                Congratulations! Your enrollment is complete.
              </p>
            </div>
          </div>

          <div className="mb-8 text-center">
            <h2 className="text-xl font-bold text-gray-700 mb-3">
              Roll Number
            </h2>
            <div className="bg-blue-50 border-2 border-blue-300 text-blue-800 px-6 py-4 rounded-lg inline-block shadow-sm">
              <span className="text-3xl font-mono font-bold tracking-wider">
                {studentData?.rollNumber}
              </span>
            </div>
          </div>

          {/* Student Information Grid */}
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-gray-700 mb-6 border-b-2 border-blue-100 pb-2 flex items-center">
              <span className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center mr-2 text-sm">
                1
              </span>
              Student Information
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
              {/* Student Details */}
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 h-full">
                <h3 className="text-md font-semibold text-blue-700 mb-3 pb-2 border-b border-blue-200 flex items-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4 mr-1"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                  Student Details
                </h3>
                <div className="space-y-2">
                  <div className="flex">
                    <span className="font-medium text-gray-700 w-1/3">
                      Name:
                    </span>
                    <span className="text-gray-900 font-semibold">
                      {studentData?.fullName}
                    </span>
                  </div>
                  <div className="flex">
                    <span className="font-medium text-gray-700 w-1/3">
                      Email:
                    </span>
                    <span className="text-gray-900">{studentData?.email}</span>
                  </div>
                  <div className="flex">
                    <span className="font-medium text-gray-700 w-1/3">
                      Class:
                    </span>
                    <span className="text-gray-900">
                      Class {studentData?.classGrade}
                    </span>
                  </div>
                  <div className="flex">
                    <span className="font-medium text-gray-700 w-1/3">
                      Medium:
                    </span>
                    <span className="text-gray-900 capitalize">
                      {studentData?.medium}
                    </span>
                  </div>
                  <div className="flex">
                    <span className="font-medium text-gray-700 w-1/3">
                      School:
                    </span>
                    <span className="text-gray-900">
                      {studentData?.schoolName}
                    </span>
                  </div>
                  <div className="flex">
                    <span className="font-medium text-gray-700 w-1/3">
                      DOB:
                    </span>
                    <span className="text-gray-900">
                      {studentData?.dateOfBirth}
                    </span>
                  </div>
                  <div className="flex">
                    <span className="font-medium text-gray-700 w-1/3">
                      Sex:
                    </span>
                    <span className="text-gray-900 capitalize">
                      {studentData?.gender}
                    </span>
                  </div>
                </div>
              </div>

              {/* Mother Information */}
              <div className="bg-purple-50 p-4 rounded-lg border border-purple-100 h-full">
                <h3 className="text-md font-semibold text-purple-700 mb-3 pb-2 border-b border-purple-200 flex items-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4 mr-1"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                    />
                  </svg>
                  Mother Information
                </h3>
                <div className="space-y-2">
                  <div className="flex">
                    <span className="font-medium text-gray-700 w-1/3">
                      Name:
                    </span>
                    <span className="text-gray-900">
                      {studentData?.motherName}
                    </span>
                  </div>
                  {studentData?.motherOccupation && (
                    <div className="flex">
                      <span className="font-medium text-gray-700 w-1/3">
                        Occupation:
                      </span>
                      <span className="text-gray-900">
                        {studentData?.motherOccupation}
                      </span>
                    </div>
                  )}

                  <div className="flex">
                    <span className="font-medium text-gray-700 w-1/3">
                      Mobile:
                    </span>
                    <span className="text-gray-900">
                      {studentData?.motherMobile}
                    </span>
                  </div>
                  {studentData?.motherEmail && (
                    <div className="flex">
                      <span className="font-medium text-gray-700 w-1/3">
                        Email:
                      </span>
                      <span className="text-gray-900">
                        {studentData?.motherEmail}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Father Information */}
              <div className="bg-cyan-50 p-4 rounded-lg border border-cyan-100 h-full">
                <h3 className="text-md font-semibold text-cyan-700 mb-3 pb-2 border-b border-cyan-200 flex items-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4 mr-1"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                    />
                  </svg>
                  Father Information
                </h3>
                <div className="space-y-2">
                  <div className="flex">
                    <span className="font-medium text-gray-700 w-1/3">
                      Name:
                    </span>
                    <span className="text-gray-900">
                      {studentData?.fatherName}
                    </span>
                  </div>
                  {studentData?.fatherOccupation && (
                    <div className="flex">
                      <span className="font-medium text-gray-700 w-1/3">
                        Occupation:
                      </span>
                      <span className="text-gray-900">
                        {studentData?.fatherOccupation}
                      </span>
                    </div>
                  )}

                  <div className="flex">
                    <span className="font-medium text-gray-700 w-1/3">
                      Mobile:
                    </span>
                    <span className="text-gray-900">
                      {studentData?.fatherMobile}
                    </span>
                  </div>
                  {studentData?.fatherEmail && (
                    <div className="flex">
                      <span className="font-medium text-gray-700 w-1/3">
                        Email:
                      </span>
                      <span className="text-gray-900">
                        {studentData?.fatherEmail}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Residential Address */}
              <div className="bg-emerald-50 p-4 rounded-lg border border-emerald-100 h-full">
                <h3 className="text-md font-semibold text-emerald-700 mb-3 pb-2 border-b border-emerald-200 flex items-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4 mr-1"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                    />
                  </svg>
                  Residential Address
                </h3>
                <div className="space-y-2">
                  <div className="flex">
                    <span className="font-medium text-gray-700 w-1/3">
                      Address:
                    </span>
                    <span className="text-gray-900">
                      {studentData?.addressLine1}
                    </span>
                  </div>
                  <div className="flex">
                    <span className="font-medium text-gray-700 w-1/3">
                      City:
                    </span>
                    <span className="text-gray-900">{studentData?.city}</span>
                  </div>
                  <div className="flex">
                    <span className="font-medium text-gray-700 w-1/3">
                      State:
                    </span>
                    <span className="text-gray-900">{studentData?.state}</span>
                  </div>
                  <div className="flex">
                    <span className="font-medium text-gray-700 w-1/3">
                      PIN:
                    </span>
                    <span className="text-gray-900">
                      {studentData?.pincode}
                    </span>
                  </div>
                </div>
              </div>

              {/* Siblings */}
              <div className="bg-amber-50 p-4 rounded-lg border border-amber-100 h-full">
                <h3 className="text-md font-semibold text-amber-700 mb-3 pb-2 border-b border-amber-200 flex items-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4 mr-1"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                    />
                  </svg>
                  Siblings
                </h3>
                <div className="space-y-2">
                  <div className="flex">
                    <span className="font-medium text-gray-700 w-1/3">
                      Brothers:
                    </span>
                    <span className="text-gray-900">
                      {studentData?.numberOfBrothers || "0"}
                    </span>
                  </div>
                  <div className="flex">
                    <span className="font-medium text-gray-700 w-1/3">
                      Sisters:
                    </span>
                    <span className="text-gray-900">
                      {studentData?.numberOfSisters || "0"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Enrollment Details */}
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 h-full">
                <h3 className="text-md font-semibold text-gray-700 mb-3 pb-2 border-b border-gray-200 flex items-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4 mr-1"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                  Enrollment Details
                </h3>
                <div className="space-y-2">
                  <div className="flex">
                    <span className="font-medium text-gray-700 w-1/3">
                      Enrolled:
                    </span>
                    <span className="text-gray-900">
                      {formatDate(studentData?.enrollmentDate)}
                    </span>
                  </div>
                  <div className="flex">
                    <span className="font-medium text-gray-700 w-1/3">
                      Paid on:
                    </span>
                    <span className="text-gray-900">
                      {formatDate(studentData?.paymentDate)}
                    </span>
                  </div>
                  <div className="flex">
                    <span className="font-medium text-gray-700 w-1/3">
                      Status:
                    </span>
                    <span className="text-green-600 font-medium">
                      Completed
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Syllabus Download Section */}
            {studentData?.classGrade && (
              <div className="mt-6 bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg border-2 border-blue-200 print:hidden">
                <h3 className="text-lg font-semibold text-blue-800 mb-3 flex items-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 mr-2"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                    />
                  </svg>
                  Download Syllabus
                </h3>
                <p className="text-gray-700 mb-4">
                  Download the complete syllabus for Class{" "}
                  {studentData.classGrade} to prepare for your DOT exam.
                </p>
                <a
                  href={`/syllabus/Dot class ${studentData.classGrade}.pdf`}
                  download
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition duration-300 font-semibold shadow-md"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 mr-2"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                  Download Class {studentData.classGrade} Syllabus PDF
                </a>
              </div>
            )}
          </div>

          {/* Uploaded Documents */}
          <div className="mt-10">
            <h2 className="text-lg font-semibold text-gray-700 mb-6 border-b-2 border-blue-100 pb-2 flex items-center">
              <span className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center mr-2 text-sm">
                2
              </span>
              Uploaded Documents
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <h3 className="text-md font-semibold text-gray-700 mb-3 pb-2 border-b border-gray-200 flex items-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4 mr-1"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                  Student Photo
                </h3>
                <div className="mt-2 flex justify-center">
                  {studentData?.photoURL ? (
                    <img
                      src={studentData.photoURL}
                      alt="Student"
                      className="h-48 w-auto object-cover rounded-lg shadow-sm border-2 border-gray-200"
                    />
                  ) : (
                    <div className="bg-gray-100 h-48 w-36 rounded-lg flex items-center justify-center">
                      <p className="text-gray-500">No photo available</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <h3 className="text-md font-semibold text-gray-700 mb-3 pb-2 border-b border-gray-200 flex items-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4 mr-1"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"
                    />
                  </svg>
                  Payment Screenshot
                </h3>
                <div className="mt-2 flex justify-center">
                  {studentData?.paymentScreenshotURL ? (
                    <img
                      src={studentData.paymentScreenshotURL}
                      alt="Payment Screenshot"
                      className="h-48 w-auto object-cover rounded-lg shadow-sm border-2 border-gray-200"
                    />
                  ) : (
                    <div className="bg-gray-100 h-48 w-full rounded-lg flex items-center justify-center">
                      <p className="text-gray-500">No screenshot available</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-4 border-t border-gray-200 text-center print:hidden">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <p className="text-blue-800 flex items-center justify-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 mr-2"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                Please save this information for your records. A confirmation
                email has been sent to your registered email address.
              </p>
            </div>

            <button
              onClick={handlePrint}
              className="mt-4 bg-blue-600 text-white py-3 px-6 rounded-md hover:bg-blue-700 transition duration-300 font-semibold flex items-center mx-auto"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 mr-2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"
                />
              </svg>
              Print Confirmation
            </button>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default ConfirmationPage;