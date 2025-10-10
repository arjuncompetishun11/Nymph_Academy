import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { collection, addDoc, doc, getDoc } from "firebase/firestore";
import { db } from "../firebase";
import { uploadStudentImage } from "../cloudinary";
import NavBar from "../components/NavBar";
import Footer from "../components/Footer";

const EnrollmentForm = () => {
  const navigate = useNavigate();
  // State for website settings
  const [websiteSettings, setWebsiteSettings] = useState({
    paymentPrice: "150",
    paymentQRUrl:
      "https://res.cloudinary.com/dzwjnirr2/image/upload/v1760094772/payment-qr_ucm3p1.svg",
  });
  const [formData, setFormData] = useState({
    // Student Information
    fullName: "",
    email: "",
    classGrade: "",
    medium: "",
    schoolName: "",
    dateOfBirth: "",
    gender: "",

    // Mother Information
    motherName: "",
    motherOccupation: "",
    motherPhone: "",
    motherMobile: "",
    motherEmail: "",

    // Father Information
    fatherName: "",
    fatherOccupation: "",
    fatherPhone: "",
    fatherMobile: "",
    fatherEmail: "",

    // Residential Address
    addressLine1: "",
    city: "",
    state: "",
    pincode: "",

    // Siblings
    numberOfBrothers: "",
    numberOfSisters: "",

    photoFile: null,
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [photoPreview, setPhotoPreview] = useState(null);

  // Fetch the website settings
  useEffect(() => {
    const fetchSettings = async () => {
    try {
      // Fetch website settings
      const settingsRef = doc(db, "settings", "website");
      const settingsDoc = await getDoc(settingsRef);

      if (settingsDoc.exists()) {
        const settings = settingsDoc.data();
        setWebsiteSettings({
          paymentPrice: settings.paymentPrice || "150",
          paymentQRUrl:
            settings.paymentQRUrl ||
            "https://res.cloudinary.com/dzwjnirr2/image/upload/v1760094772/payment-qr_ucm3p1.svg",
        });
      }
    } catch (error) {
      console.error("Error fetching website settings:", error);
    }
    };
    fetchSettings();
  }, []);

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });

    // Clear error for this field when user types
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: "",
      });
    }
  };

  // Handle file input change
  const handleFileChange = (e) => {
    const file = e.target.files[0];

    if (file) {
      // Validate file type
      const validTypes = ["image/jpeg", "image/jpg", "image/png"];
      if (!validTypes.includes(file.type)) {
        setErrors({
          ...errors,
          photoFile: "Only JPG/PNG files are allowed",
        });
        return;
      }

      // Validate file size (5MB = 5 * 1024 * 1024 bytes)
      if (file.size > 5 * 1024 * 1024) {
        setErrors({
          ...errors,
          photoFile: "File size must be less than 5MB",
        });
        return;
      }

      // Set the file and preview
      setFormData({
        ...formData,
        photoFile: file,
      });

      // Create a preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result);
      };
      reader.readAsDataURL(file);

      // Clear error
      setErrors({
        ...errors,
        photoFile: "",
      });
    }
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};

    // Student Information
    if (!formData.fullName.trim()) {
      newErrors.fullName = "Student's name is required";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Student's email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      newErrors.email = "Invalid email format";
    }

    if (!formData.classGrade) {
      newErrors.classGrade = "Class is required";
    }

    if (!formData.medium) {
      newErrors.medium = "Medium is required";
    }

    if (!formData.schoolName.trim()) {
      newErrors.schoolName = "Present school name is required";
    }

    if (!formData.dateOfBirth) {
      newErrors.dateOfBirth = "Date of birth is required";
    }

    if (!formData.gender) {
      newErrors.gender = "Sex is required";
    }

    // Mother Information
    if (!formData.motherName.trim()) {
      newErrors.motherName = "Mother's name is required";
    }

    if (!formData.motherMobile.trim()) {
      newErrors.motherMobile = "Mother's mobile number is required";
    } else if (!/^[0-9]{10}$/.test(formData.motherMobile.trim())) {
      newErrors.motherMobile = "Mobile number must be 10 digits";
    }

    if (
      formData.motherEmail.trim() &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.motherEmail.trim())
    ) {
      newErrors.motherEmail = "Invalid email format";
    }

    // Father Information
    if (!formData.fatherName.trim()) {
      newErrors.fatherName = "Father's name is required";
    }

    if (!formData.fatherMobile.trim()) {
      newErrors.fatherMobile = "Father's mobile number is required";
    } else if (!/^[0-9]{10}$/.test(formData.fatherMobile.trim())) {
      newErrors.fatherMobile = "Mobile number must be 10 digits";
    }

    if (
      formData.fatherEmail.trim() &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.fatherEmail.trim())
    ) {
      newErrors.fatherEmail = "Invalid email format";
    }

    // Residential Address
    if (!formData.addressLine1.trim()) {
      newErrors.addressLine1 = "Address is required";
    }

    if (!formData.city.trim()) {
      newErrors.city = "City is required";
    }

    if (!formData.state.trim()) {
      newErrors.state = "State is required";
    }

    if (!formData.pincode.trim()) {
      newErrors.pincode = "PIN code is required";
    } else if (!/^[0-9]{6}$/.test(formData.pincode.trim())) {
      newErrors.pincode = "PIN code must be 6 digits";
    }

    if (!formData.photoFile) {
      newErrors.photoFile = "Student photo is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Step 1: Upload photo to Cloudinary
      const uploadResult = await uploadStudentImage(formData.photoFile);

      // Step 2: Save student data to Firestore
      const studentData = {
        // Student Information
        fullName: formData.fullName,
        email: formData.email,
        classGrade: formData.classGrade,
        medium: formData.medium,
        schoolName: formData.schoolName,
        dateOfBirth: formData.dateOfBirth,
        gender: formData.gender,

        // Mother Information
        motherName: formData.motherName,
        motherOccupation: formData.motherOccupation,
        motherPhone: formData.motherPhone,
        motherMobile: formData.motherMobile,
        motherEmail: formData.motherEmail,

        // Father Information
        fatherName: formData.fatherName,
        fatherOccupation: formData.fatherOccupation,
        fatherPhone: formData.fatherPhone,
        fatherMobile: formData.fatherMobile,
        fatherEmail: formData.fatherEmail,

        // Residential Address
        addressLine1: formData.addressLine1,
        city: formData.city,
        state: formData.state,
        pincode: formData.pincode,

        // Siblings
        numberOfBrothers: formData.numberOfBrothers,
        numberOfSisters: formData.numberOfSisters,

        photoURL: uploadResult.url,
        photoPublicId: uploadResult.publicId, // Store Cloudinary public ID for potential deletion later
        enrollmentDate: new Date(),
        paymentStatus: "pending",
        // Roll number will be generated after payment
      };

      const docRef = await addDoc(collection(db, "students"), studentData);

      // Navigate to payment page with student ID
      navigate(`/payment/${docRef.id}`);
    } catch (error) {
      console.error("Error submitting form:", error);
      setErrors({
        ...errors,
        submit: "An error occurred. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <NavBar />

      {/* Hero Section */}
      <div className="bg-blue-500 text-white py-10 px-4">
        <div className="container mx-auto text-center">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">
            Welcome to Nymph Academy
          </h1>
          <p className="text-lg">
            Enroll today for ₹{websiteSettings.paymentPrice} fee. Secure and easy process.
          </p>
        </div>
      </div>

      <div className="flex-grow container mx-auto py-8 px-4">
        <div className="max-w-3xl mx-auto bg-white p-8 rounded-lg shadow-md">
          <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">
            Nymph Academy Scholarship Exam Enrollment
          </h2>

          {errors.submit && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {errors.submit}
            </div>
          )}

          <form
            onSubmit={handleSubmit}
            className="bg-gray-50 p-6 rounded-lg border border-gray-200 shadow-sm"
          >
            <h3 className="text-lg font-bold text-blue-700 mb-4 border-b pb-2 flex items-center">
              <span className="bg-blue-700 text-white rounded-full w-6 h-6 flex items-center justify-center mr-2 text-sm">
                1
              </span>
              Student Information
            </h3>

            {/* Student's Name */}
            <div className="mb-4">
              <label
                htmlFor="fullName"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Student's Name *
              </label>
              <input
                type="text"
                id="fullName"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                className={`w-full px-4 py-2 border rounded-md ${
                  errors.fullName ? "border-red-500" : "border-gray-300"
                } focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50`}
                placeholder="Enter student's name as per school records"
              />
              {errors.fullName && (
                <p className="mt-1 text-sm text-red-500">{errors.fullName}</p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Student Email */}
              <div className="mb-4">
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Student Email *
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`w-full px-4 py-2 border rounded-md ${
                    errors.email ? "border-red-500" : "border-gray-300"
                  } focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50`}
                  placeholder="Enter student's email"
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-red-500">{errors.email}</p>
                )}
              </div>

              {/* Date of Birth */}
              <div className="mb-4">
                <label
                  htmlFor="dateOfBirth"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Date of Birth *
                </label>
                <input
                  type="date"
                  id="dateOfBirth"
                  name="dateOfBirth"
                  value={formData.dateOfBirth}
                  onChange={handleChange}
                  className={`w-full px-4 py-2 border rounded-md ${
                    errors.dateOfBirth ? "border-red-500" : "border-gray-300"
                  } focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50`}
                />
                {errors.dateOfBirth && (
                  <p className="mt-1 text-sm text-red-500">
                    {errors.dateOfBirth}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Class/Grade */}
              <div className="mb-4">
                <label
                  htmlFor="classGrade"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Class *
                </label>
                <select
                  id="classGrade"
                  name="classGrade"
                  value={formData.classGrade}
                  onChange={handleChange}
                  className={`w-full px-4 py-2 border rounded-md ${
                    errors.classGrade ? "border-red-500" : "border-gray-300"
                  } focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50`}
                >
                  <option value="">Select Class</option>
                  <option value="1">Class 1</option>
                  <option value="2">Class 2</option>
                  <option value="3">Class 3</option>
                  <option value="4">Class 4</option>
                  <option value="5">Class 5</option>
                  <option value="6">Class 6</option>
                  <option value="7">Class 7</option>
                  <option value="8">Class 8</option>
                  <option value="9">Class 9</option>
                  <option value="10">Class 10</option>
                  <option value="11">Class 11</option>
                  <option value="12">Class 12</option>
                </select>
                {errors.classGrade && (
                  <p className="mt-1 text-sm text-red-500">
                    {errors.classGrade}
                  </p>
                )}
              </div>

              {/* Medium */}
              <div className="mb-4">
                <label
                  htmlFor="medium"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Medium *
                </label>
                <select
                  id="medium"
                  name="medium"
                  value={formData.medium}
                  onChange={handleChange}
                  className={`w-full px-4 py-2 border rounded-md ${
                    errors.medium ? "border-red-500" : "border-gray-300"
                  } focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50`}
                >
                  <option value="">Select Medium</option>
                  <option value="english">English</option>
                  <option value="hindi">Hindi</option>
                  <option value="other">Other</option>
                </select>
                {errors.medium && (
                  <p className="mt-1 text-sm text-red-500">{errors.medium}</p>
                )}
              </div>

              {/* Sex/Gender */}
              <div className="mb-4">
                <label
                  htmlFor="gender"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Sex *
                </label>
                <select
                  id="gender"
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  className={`w-full px-4 py-2 border rounded-md ${
                    errors.gender ? "border-red-500" : "border-gray-300"
                  } focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50`}
                >
                  <option value="">Select</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
                {errors.gender && (
                  <p className="mt-1 text-sm text-red-500">{errors.gender}</p>
                )}
              </div>
            </div>

            {/* Present School */}
            <div className="mb-6">
              <label
                htmlFor="schoolName"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Present School *
              </label>
              <input
                type="text"
                id="schoolName"
                name="schoolName"
                value={formData.schoolName}
                onChange={handleChange}
                className={`w-full px-4 py-2 border rounded-md ${
                  errors.schoolName ? "border-red-500" : "border-gray-300"
                } focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50`}
                placeholder="Enter present school name"
              />
              {errors.schoolName && (
                <p className="mt-1 text-sm text-red-500">{errors.schoolName}</p>
              )}
            </div>

            <h3 className="text-lg font-bold text-blue-700 mt-8 mb-4 border-b pb-2 flex items-center">
              <span className="bg-blue-700 text-white rounded-full w-6 h-6 flex items-center justify-center mr-2 text-sm">
                2
              </span>
              Mother Information
            </h3>

            <div className="bg-white p-4 rounded-lg border border-gray-200">
              {/* Mother's Name */}
              <div className="mb-4">
                <label
                  htmlFor="motherName"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Mother's Name *
                </label>
                <input
                  type="text"
                  id="motherName"
                  name="motherName"
                  value={formData.motherName}
                  onChange={handleChange}
                  className={`w-full px-4 py-2 border rounded-md ${
                    errors.motherName ? "border-red-500" : "border-gray-300"
                  } focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50`}
                  placeholder="Enter mother's name"
                />
                {errors.motherName && (
                  <p className="mt-1 text-sm text-red-500">
                    {errors.motherName}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Mother's Occupation */}
                <div className="mb-4">
                  <label
                    htmlFor="motherOccupation"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Mother's Occupation
                  </label>
                  <input
                    type="text"
                    id="motherOccupation"
                    name="motherOccupation"
                    value={formData.motherOccupation}
                    onChange={handleChange}
                    className={`w-full px-4 py-2 border rounded-md border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50`}
                    placeholder="Enter mother's occupation"
                  />
                </div>

                {/* Mother's Email */}
                <div className="mb-4">
                  <label
                    htmlFor="motherEmail"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Mother's Email
                  </label>
                  <input
                    type="email"
                    id="motherEmail"
                    name="motherEmail"
                    value={formData.motherEmail}
                    onChange={handleChange}
                    className={`w-full px-4 py-2 border rounded-md ${
                      errors.motherEmail ? "border-red-500" : "border-gray-300"
                    } focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50`}
                    placeholder="Enter mother's email"
                  />
                  {errors.motherEmail && (
                    <p className="mt-1 text-sm text-red-500">
                      {errors.motherEmail}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Mother's Phone */}
                <div className="mb-4">
                  <label
                    htmlFor="motherPhone"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Mother's Phone
                  </label>
                  <input
                    type="text"
                    id="motherPhone"
                    name="motherPhone"
                    value={formData.motherPhone}
                    onChange={handleChange}
                    className={`w-full px-4 py-2 border rounded-md border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50`}
                    placeholder="Enter mother's phone number"
                  />
                </div>

                {/* Mother's Mobile */}
                <div className="mb-4">
                  <label
                    htmlFor="motherMobile"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Mother's Mobile *
                  </label>
                  <input
                    type="text"
                    id="motherMobile"
                    name="motherMobile"
                    value={formData.motherMobile}
                    onChange={handleChange}
                    className={`w-full px-4 py-2 border rounded-md ${
                      errors.motherMobile ? "border-red-500" : "border-gray-300"
                    } focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50`}
                    placeholder="Enter mother's mobile number"
                  />
                  {errors.motherMobile && (
                    <p className="mt-1 text-sm text-red-500">
                      {errors.motherMobile}
                    </p>
                  )}
                </div>
              </div>
            </div>

            <h3 className="text-lg font-bold text-blue-700 mt-6 mb-4 border-b pb-2 flex items-center">
              <span className="bg-blue-700 text-white rounded-full w-6 h-6 flex items-center justify-center mr-2 text-sm">
                3
              </span>
              Father Information
            </h3>

            <div className="bg-white p-4 rounded-lg border border-gray-200 mt-4">
              {/* Father's Name */}
              <div className="mb-4">
                <label
                  htmlFor="fatherName"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Father's Name *
                </label>
                <input
                  type="text"
                  id="fatherName"
                  name="fatherName"
                  value={formData.fatherName}
                  onChange={handleChange}
                  className={`w-full px-4 py-2 border rounded-md ${
                    errors.fatherName ? "border-red-500" : "border-gray-300"
                  } focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50`}
                  placeholder="Enter father's name"
                />
                {errors.fatherName && (
                  <p className="mt-1 text-sm text-red-500">
                    {errors.fatherName}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Father's Occupation */}
                <div className="mb-4">
                  <label
                    htmlFor="fatherOccupation"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Father's Occupation
                  </label>
                  <input
                    type="text"
                    id="fatherOccupation"
                    name="fatherOccupation"
                    value={formData.fatherOccupation}
                    onChange={handleChange}
                    className={`w-full px-4 py-2 border rounded-md border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50`}
                    placeholder="Enter father's occupation"
                  />
                </div>

                {/* Father's Email */}
                <div className="mb-4">
                  <label
                    htmlFor="fatherEmail"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Father's Email
                  </label>
                  <input
                    type="email"
                    id="fatherEmail"
                    name="fatherEmail"
                    value={formData.fatherEmail}
                    onChange={handleChange}
                    className={`w-full px-4 py-2 border rounded-md ${
                      errors.fatherEmail ? "border-red-500" : "border-gray-300"
                    } focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50`}
                    placeholder="Enter father's email"
                  />
                  {errors.fatherEmail && (
                    <p className="mt-1 text-sm text-red-500">
                      {errors.fatherEmail}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Father's Phone */}
                <div className="mb-4">
                  <label
                    htmlFor="fatherPhone"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Father's Phone
                  </label>
                  <input
                    type="text"
                    id="fatherPhone"
                    name="fatherPhone"
                    value={formData.fatherPhone}
                    onChange={handleChange}
                    className={`w-full px-4 py-2 border rounded-md border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50`}
                    placeholder="Enter father's phone number"
                  />
                </div>

                {/* Father's Mobile */}
                <div className="mb-4">
                  <label
                    htmlFor="fatherMobile"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Father's Mobile *
                  </label>
                  <input
                    type="text"
                    id="fatherMobile"
                    name="fatherMobile"
                    value={formData.fatherMobile}
                    onChange={handleChange}
                    className={`w-full px-4 py-2 border rounded-md ${
                      errors.fatherMobile ? "border-red-500" : "border-gray-300"
                    } focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50`}
                    placeholder="Enter father's mobile number"
                  />
                  {errors.fatherMobile && (
                    <p className="mt-1 text-sm text-red-500">
                      {errors.fatherMobile}
                    </p>
                  )}
                </div>
              </div>
            </div>

            <h3 className="text-lg font-bold text-blue-700 mt-6 mb-4 border-b pb-2 flex items-center">
              <span className="bg-blue-700 text-white rounded-full w-6 h-6 flex items-center justify-center mr-2 text-sm">
                4
              </span>
              Residential Address
            </h3>

            <div className="bg-white p-4 rounded-lg border border-gray-200">
              {/* Address Line 1 */}
              <div className="mb-4">
                <label
                  htmlFor="addressLine1"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Address Line 1 *
                </label>
                <textarea
                  id="addressLine1"
                  name="addressLine1"
                  value={formData.addressLine1}
                  onChange={handleChange}
                  rows="2"
                  className={`w-full px-4 py-2 border rounded-md ${
                    errors.addressLine1 ? "border-red-500" : "border-gray-300"
                  } focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50`}
                  placeholder="Enter your address"
                ></textarea>
                {errors.addressLine1 && (
                  <p className="mt-1 text-sm text-red-500">
                    {errors.addressLine1}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* City */}
                <div className="mb-4">
                  <label
                    htmlFor="city"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    City *
                  </label>
                  <input
                    type="text"
                    id="city"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    className={`w-full px-4 py-2 border rounded-md ${
                      errors.city ? "border-red-500" : "border-gray-300"
                    } focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50`}
                    placeholder="Enter your city"
                  />
                  {errors.city && (
                    <p className="mt-1 text-sm text-red-500">{errors.city}</p>
                  )}
                </div>

                {/* State */}
                <div className="mb-4">
                  <label
                    htmlFor="state"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    State *
                  </label>
                  <input
                    type="text"
                    id="state"
                    name="state"
                    value={formData.state}
                    onChange={handleChange}
                    className={`w-full px-4 py-2 border rounded-md ${
                      errors.state ? "border-red-500" : "border-gray-300"
                    } focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50`}
                    placeholder="Enter your state"
                  />
                  {errors.state && (
                    <p className="mt-1 text-sm text-red-500">{errors.state}</p>
                  )}
                </div>

                {/* PIN Code */}
                <div className="mb-4">
                  <label
                    htmlFor="pincode"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    PIN Code *
                  </label>
                  <input
                    type="text"
                    id="pincode"
                    name="pincode"
                    value={formData.pincode}
                    onChange={handleChange}
                    className={`w-full px-4 py-2 border rounded-md ${
                      errors.pincode ? "border-red-500" : "border-gray-300"
                    } focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50`}
                    placeholder="Enter 6-digit PIN code"
                  />
                  {errors.pincode && (
                    <p className="mt-1 text-sm text-red-500">
                      {errors.pincode}
                    </p>
                  )}
                </div>
              </div>
            </div>

            <h3 className="text-lg font-bold text-blue-700 mt-6 mb-4 border-b pb-2 flex items-center">
              <span className="bg-blue-700 text-white rounded-full w-6 h-6 flex items-center justify-center mr-2 text-sm">
                5
              </span>
              Siblings
            </h3>

            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Number of Brothers */}
                <div className="mb-4">
                  <label
                    htmlFor="numberOfBrothers"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    No. of Brothers
                  </label>
                  <input
                    type="number"
                    id="numberOfBrothers"
                    name="numberOfBrothers"
                    min="0"
                    value={formData.numberOfBrothers}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                    placeholder="Enter number of brothers"
                  />
                </div>

                {/* Number of Sisters */}
                <div className="mb-4">
                  <label
                    htmlFor="numberOfSisters"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    No. of Sisters
                  </label>
                  <input
                    type="number"
                    id="numberOfSisters"
                    name="numberOfSisters"
                    min="0"
                    value={formData.numberOfSisters}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                    placeholder="Enter number of sisters"
                  />
                </div>
              </div>
            </div>

            <h3 className="text-lg font-bold text-blue-700 mt-6 mb-4 border-b pb-2 flex items-center">
              <span className="bg-blue-700 text-white rounded-full w-6 h-6 flex items-center justify-center mr-2 text-sm">
                6
              </span>
              Photo Upload
            </h3>

            {/* Student Photo */}
            <div className="mb-6 bg-white p-4 rounded-lg border border-gray-200">
              <label
                htmlFor="photoFile"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Student Photo * (JPG/PNG, Max 5MB)
              </label>
              <div className="flex items-center">
                <div className="flex-1">
                  <input
                    type="file"
                    id="photoFile"
                    name="photoFile"
                    onChange={handleFileChange}
                    accept=".jpg,.jpeg,.png"
                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:border-blue-500"
                  />
                  {errors.photoFile && (
                    <p className="mt-1 text-sm text-red-500">
                      {errors.photoFile}
                    </p>
                  )}
                </div>

                {photoPreview && (
                  <div className="ml-4">
                    <img
                      src={photoPreview}
                      alt="Preview"
                      className="h-32 w-auto object-cover rounded-md border-2 border-gray-300"
                    />
                  </div>
                )}
              </div>
              <p className="mt-2 text-xs text-gray-500">
                Upload a recent passport-sized photograph of the student with a
                clear face.
              </p>
            </div>

            {/* Submit Button */}
            <div className="mt-6">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 transition duration-300 disabled:opacity-50 text-lg font-semibold shadow-md"
              >
                {isSubmitting ? (
                  <span className="flex items-center justify-center">
                    <svg
                      className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Processing...
                  </span>
                ) : (
                  `Proceed to Payment (₹${websiteSettings.paymentPrice})`
                )}
              </button>
              <p className="text-center text-sm text-gray-600 mt-2">
                By submitting this form, you agree to our terms and conditions
              </p>
            </div>
          </form>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default EnrollmentForm;
