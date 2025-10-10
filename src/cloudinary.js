// Cloudinary configuration values
const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || 'your_cloud_name';
const apiKey = import.meta.env.VITE_CLOUDINARY_API_KEY || 'your_api_key';


// Function to upload image to Cloudinary using fetch API
export const uploadImage = async (
  file,
  upload_preset = "nymph_academy_studdent_image_preset"
) => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", upload_preset);
  formData.append("cloud_name", cloudName);

  try {
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
      {
        method: "POST",
        body: formData,
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || "Upload failed");
    }

    const result = await response.json();

    return {
      url: result.secure_url,
      publicId: result.public_id,
    };
  } catch (error) {
    console.error("Error uploading image to Cloudinary:", error);
    throw new Error("Failed to upload image: " + error.message);
  }
};

// Function to upload student image
export const uploadStudentImage = async (file) => {
  return uploadImage(file, "nymph_academy_studdent_image_preset");
};

// Function to upload payment screenshot
export const uploadPaymentScreenshot = async (file) => {
  return uploadImage(file, "nymph_academy_payment_image_preset");
};

// Note: For client-side operations, direct image deletion is not recommended
// In a real app, you would typically use a server endpoint to handle this
// This function is kept for reference, but would require a backend implementation
export const deleteImage = async (publicId) => {
  console.warn('Client-side image deletion is not implemented due to security concerns.');
  console.warn('In a production app, this operation should be performed server-side.');
  return false;
};

// Export configuration values
export const cloudinaryConfig = {
  cloudName,
  apiKey,
};