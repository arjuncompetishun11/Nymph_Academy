import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, getDocs, query, where, orderBy } from 'firebase/firestore';
import { db } from '../../firebase';
import AdminLayout from '../../components/admin/AdminLayout';
import * as XLSX from 'xlsx';

const StudentsPage = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [classFilter, setClassFilter] = useState('');
  const [paymentStatusFilter, setPaymentStatusFilter] = useState('');
  const [availableClasses, setAvailableClasses] = useState([]);
  const navigate = useNavigate();

  // Fetch all available classes once on component mount
  useEffect(() => {
    const fetchAllClasses = async () => {
      try {
        const allStudentsQuery = query(collection(db, "students"));
        const allStudentDocs = await getDocs(allStudentsQuery);
        const allStudentsList = allStudentDocs.docs.map(doc => doc.data());
        
        // Extract available classes from all students
        const classes = [
          ...new Set(allStudentsList.map((student) => student.classGrade)),
        ].sort((a, b) => Number(a) - Number(b));
        
        setAvailableClasses(classes);
      } catch (error) {
        console.error("Error fetching class list:", error);
      }
    };
    
    fetchAllClasses();
  }, []);

  // Fetch students with filters applied
  useEffect(() => {
    const fetchStudents = async () => {
      try {
        setLoading(true);
        let studentQuery;

        console.log('paymentstatusfilter:', paymentStatusFilter);
        // Apply filters based on which ones are active
        if (classFilter && paymentStatusFilter) {
          // Both class and payment status filters
          studentQuery = query(
            collection(db, "students"), 
            where("classGrade", "==", classFilter),
            where("paymentStatus", "==", paymentStatusFilter)
          );
        } else if (classFilter) {
          // Only class filter
          studentQuery = query(
            collection(db, "students"), 
            where("classGrade", "==", classFilter)
          );
        } else if (paymentStatusFilter) {
          // Only payment status filter
          studentQuery = query(
            collection(db, "students"), 
            where("paymentStatus", "==", paymentStatusFilter)
          );
        } else {
          // No filters
          studentQuery = query(collection(db, "students"));
        }
        
        const studentDocs = await getDocs(studentQuery);
        const studentsList = studentDocs.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));

        // Sort students by roll number if available, keeping those without roll numbers at the top
        const sortedStudentsList = studentsList.sort((a, b) => {
          // If both have roll numbers, sort numerically
          if (a.rollNumber && b.rollNumber) {
            return Number(a.rollNumber) - Number(b.rollNumber);
          }
          // If only a has roll number, b comes first
          if (a.rollNumber && !b.rollNumber) {
            return 1;
          }
          // If only b has roll number, a comes first
          if (!a.rollNumber && b.rollNumber) {
            return -1;
          }
          // If neither has roll number, sort by name
          return a.fullName.localeCompare(b.fullName);
        });

        // console.log('students Docs', studentDocs);
        // console.log('students List', sortedStudentsList);

        setStudents(sortedStudentsList);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching students:", error);
        setLoading(false);
      }
    };
    
    fetchStudents();
  }, [classFilter, paymentStatusFilter]);

  // Handle search and filtering
  const filteredStudents = students.filter(student => 
    student.fullName.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  // Handle export to Excel
  const handleExportToExcel = () => {
    if (filteredStudents.length === 0) {
      alert("No data available to export");
      return;
    }
    
    // Process the data to handle Firebase Timestamp objects or any complex objects
    const dataToExport = filteredStudents.map(student => {
      const processedData = { ...student };
      
      // Convert Firebase Timestamp to string if it exists
      if (processedData.enrollmentDate && typeof processedData.enrollmentDate.toDate === 'function') {
        processedData.enrollmentDate = processedData.enrollmentDate.toDate().toLocaleDateString();
      }
      
      // Convert date string to more readable format if it exists
      if (processedData.dateOfBirth) {
        processedData.dateOfBirth = new Date(processedData.dateOfBirth).toLocaleDateString();
      }
      
      // Combine hearAboutUs with hearAboutUsOther if "Other" is selected
      if (processedData.hearAboutUs === 'Other' && processedData.hearAboutUsOther) {
        processedData.hearAboutUs = `Other: ${processedData.hearAboutUsOther}`;
        delete processedData.hearAboutUsOther;
      } else {
        delete processedData.hearAboutUsOther;
      }
      
      // Remove the id field which is added separately
      delete processedData.id;
      
      return processedData;
    });
    
    // Create worksheet from the filtered data
    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    
    // Create workbook
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Students");
    
    // Generate Excel file
    const fileName = `NymphAcademy_Students_${new Date().toISOString().slice(0, 10)}.xlsx`;
    XLSX.writeFile(workbook, fileName);
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

  return (
    <AdminLayout>
      <h2 className="text-2xl font-bold mb-6">Student Management</h2>

      {/* Search and Filter */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div>
            <label
              htmlFor="search"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Search by Name
            </label>
            <input
              type="text"
              id="search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search students..."
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-4 py-2 border"
            />
          </div>

          <div>
            <label
              htmlFor="classFilter"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Filter by Class
            </label>
            <select
              id="classFilter"
              value={classFilter}
              onChange={(e) => setClassFilter(e.target.value)}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-4 py-2 border"
            >
              <option value="">All Classes</option>
              {availableClasses.map((cls) => (
                <option key={cls} value={cls}>
                  Class {cls}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="paymentStatusFilter"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Payment Status
            </label>
            <select
              id="paymentStatusFilter"
              value={paymentStatusFilter}
              onChange={(e) => setPaymentStatusFilter(e.target.value)}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-4 py-2 border"
            >
              <option value="">All Status</option>
              <option value="pending">Pending Payment</option>
              <option value="completed">Payment Completed</option>
            </select>
          </div>
        </div>

        <div className="flex justify-between">
          <button
            onClick={handleExportToExcel}
            disabled={filteredStudents.length === 0}
            className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white 
              ${filteredStudents.length === 0 ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500'}`}
          >
            Export to Excel
          </button>
          <button
            onClick={() => {
              setSearchTerm("");
              setClassFilter("");
              setPaymentStatusFilter("");
            }}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Reset Filters
          </button>
        </div>
      </div>

      {/* Students Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Roll No
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Student Name
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Class
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Date of Birth
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Parent
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Payment Status
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Enrollment Date
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredStudents.map((student) => (
                <tr
                  key={student.id}
                  className="hover:bg-gray-50 cursor-pointer"
                  onClick={() => navigate(`/admin/students/${student.id}`)}
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {student.rollNumber || "N/A"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {student.fullName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    Class {student.classGrade}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(student.dateOfBirth).toLocaleDateString() ||
                      "N/A"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {student.fatherName || student.motherName || "N/A"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {student.paymentStatus === 'completed' ? (
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                        Completed
                      </span>
                    ) : (
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                        Pending
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {student.enrollmentDate?.toDate().toLocaleDateString() ||
                      "N/A"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/admin/students/${student.id}`);
                      }}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      View Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredStudents.length === 0 && (
            <div className="text-center py-4">
              <p className="text-gray-500">No students found</p>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
};

export default StudentsPage;