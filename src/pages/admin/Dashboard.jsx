import { useState, useEffect } from 'react';
import { collection, getDocs, getCountFromServer } from 'firebase/firestore';
import { db } from '../../firebase';
import AdminLayout from '../../components/admin/AdminLayout';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalStudents: 0,
    registeredToday: 0,
    paymentCompleted: 0,
    paymentPending: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Get total students count
        const studentsRef = collection(db, 'students');
        const snapshot = await getCountFromServer(studentsRef);
        const totalStudents = snapshot.data().count;

        // Get students registered today
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const studentsQuery = await getDocs(studentsRef);
        
        let registeredToday = 0;
        let paymentCompleted = 0;
        let paymentPending = 0;
        
        studentsQuery.forEach(doc => {
          const student = doc.data();
          
          // Check registration date
          if (student.registrationDate && 
              new Date(student.registrationDate.toDate()).setHours(0, 0, 0, 0) === today.getTime()) {
            registeredToday++;
          }
          
          // Check payment status
          if (student.paymentStatus === 'completed') {
            paymentCompleted++;
          } else {
            paymentPending++;
          }
        });
        
        setStats({
          totalStudents,
          registeredToday,
          paymentCompleted,
          paymentPending
        });
      } catch (error) {
        console.error("Error fetching dashboard stats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

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
      <div>
        <h1 className="text-2xl font-semibold text-gray-800 mb-6">Dashboard</h1>
        
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Students */}
          <div className="bg-white shadow rounded-lg p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-blue-100 text-blue-600">
                <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Students</p>
                <p className="text-3xl font-semibold text-gray-800">{stats.totalStudents}</p>
              </div>
            </div>
          </div>
          
          {/* Registered Today */}
          <div className="bg-white shadow rounded-lg p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-green-100 text-green-600">
                <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Registered Today</p>
                <p className="text-3xl font-semibold text-gray-800">{stats.registeredToday}</p>
              </div>
            </div>
          </div>
          
          {/* Payment Completed */}
          <div className="bg-white shadow rounded-lg p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-green-100 text-green-600">
                <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Payment Completed</p>
                <p className="text-3xl font-semibold text-gray-800">{stats.paymentCompleted}</p>
              </div>
            </div>
          </div>
          
          {/* Payment Pending */}
          <div className="bg-white shadow rounded-lg p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-yellow-100 text-yellow-600">
                <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Payment Pending</p>
                <p className="text-3xl font-semibold text-gray-800">{stats.paymentPending}</p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Quick Links */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-800 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <a href="/admin/students" className="flex items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition duration-300">
              <div className="p-2 rounded-md bg-blue-100 text-blue-600 mr-3">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              <div>
                <p className="font-medium">Manage Students</p>
                <p className="text-sm text-gray-600">View and search student records</p>
              </div>
            </a>
            
            <a href="/admin/settings" className="flex items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition duration-300">
              <div className="p-2 rounded-md bg-green-100 text-green-600 mr-3">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <div>
                <p className="font-medium">Website Settings</p>
                <p className="text-sm text-gray-600">Update payment QR code and fees</p>
              </div>
            </a>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default Dashboard;