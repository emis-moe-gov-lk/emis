// src/components/Profile.jsx
import { useState, useEffect } from "react";
import { getUserProfile, updateUserProfile } from "../../../api/userService";

export default function Profile() {
    // State for form data
    const [formData, setFormData] = useState({
        Name: "",
        ContactNumber: "",
        Email: "",
    });
    
    // State for loading, saving, errors, success
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);

    // Load user data when component first loads
    useEffect(() => {
        loadUserData();
    }, []);

    // Function to fetch user data from API
    const loadUserData = async () => {
        try {
            setLoading(true);
            const response = await getUserProfile();
            
            // IMPORTANT: Extract data based on your API response structure
            // Your API returns: { status: "success", data: { full_name, phone, email } }
            const userData = response?.data?.data || response?.data;
            
            console.log("Loaded user data:", userData); // Debug: check console
            
            // Fill the form with user data - using correct field names from your API
            setFormData({
                Name: userData.full_name || userData.name || "",
                ContactNumber: userData.phone || userData.contactNumber || "",
                Email: userData.email || "",
            });
            
        } catch (err) {
            console.error("Error details:", err);
            setError("Failed to load user data: " + (err.response?.data?.message || err.message));
        } finally {
            setLoading(false);
        }
    };

    // Handle form input changes
    const handleChange = (e) => {
        const { name, value } = e.target;
        
        if (name === "Name") {
            // Check for numbers in name
            if (/\d/.test(value)) {
                alert("Numbers are not allowed in name field");
                return;
            }
            setFormData((prev) => ({
                ...prev,
                [name]: value,
            }));
        } 
        else if (name === "ContactNumber") {
            // Check for letters in contact number
            if (/[a-zA-Z]/.test(value)) {
                alert("Letters are not allowed in contact number field");
                return;
            }
            setFormData((prev) => ({
                ...prev,
                [name]: value,
            }));
        }
        else {
            // For email field - normal change
            setFormData((prev) => ({
                ...prev,
                [name]: value,
            }));
        }
    };

    // Detect key press and show alert before typing
    const handleNameKeyPress = (e) => {
        if (e.key >= '0' && e.key <= '9') {
            alert("Numbers are not allowed in name field");
            e.preventDefault();
        }
    };

    const handleContactKeyPress = (e) => {
        if (/[a-zA-Z]/.test(e.key)) {
            alert("Letters are not allowed in contact number field");
            e.preventDefault();
        }
    };

    // Handle form submission (update profile)
    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Validation
        if (!formData.Name.trim()) {
            setError("Name is required");
            setTimeout(() => setError(null), 3000);
            return;
        }
        
        if (!formData.ContactNumber.trim()) {
            setError("Contact number is required");
            setTimeout(() => setError(null), 3000);
            return;
        }
        
        if (!formData.Email.trim()) {
            setError("Email is required");
            setTimeout(() => setError(null), 3000);
            return;
        }
        
        try {
            setSaving(true);
            const submitData = {
                name: formData.Name,  // Match your API field names
                phone: formData.ContactNumber,
                email: formData.Email,
            };
            
            await updateUserProfile(submitData);
            setSuccess("Profile updated successfully!");
            
            // Clear success message after 3 seconds
            setTimeout(() => setSuccess(null), 3000);
            
        } catch (err) {
            setError("Failed to update profile: " + (err.response?.data?.message || err.message));
            console.error(err);
        } finally {
            setSaving(false);
        }
    };

    // Show loading screen while fetching data
    if (loading) {
        return (
            <div className="profile">
                <h2>Profile</h2>
                <div style={{textAlign: "center", padding: "20px"}}>
                    <p>Loading your data...</p>
                </div>
            </div>
        );
    }

    // Main form JSX
    return (
        <div className="profile">
            <h2>Profile</h2>
            <p className="text-gray-400 pb-4">Update your name and email address</p>
            
            {/* Show error message if any */}
            {error && (
                <div style={{color: "red", marginBottom: "10px", padding: "10px", backgroundColor: "#ffebee", borderRadius: "4px"}}>
                    {error}
                </div>
            )}
            
            {/* Show success message if any */}
            {success && (
                <div style={{color: "green", marginBottom: "10px", padding: "10px", backgroundColor: "#e8f5e9", borderRadius: "4px"}}>
                    {success}
                </div>
            )}
            
            <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
                {/* Name Field */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Name
                    </label>
                    <input
                        type="text"
                        name="Name"
                        value={formData.Name}
                        onChange={handleChange}
                        onKeyPress={handleNameKeyPress}
                        disabled={saving}
                        className="w-full border border-gray-300 rounded-md p-2"
                        placeholder="Full Name"
                    />
                    
                </div>
                
                {/* Contact Number Field */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Contact Number
                    </label>
                    <input
                        type="text"
                        name="ContactNumber"
                        value={formData.ContactNumber}
                        onChange={handleChange}
                        onKeyPress={handleContactKeyPress}
                        disabled={saving}
                        className="w-full border border-gray-300 rounded-md p-2"
                        placeholder="Phone Number"
                    />
                    
                </div>
                
                {/* Email Field */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email
                    </label>
                    <input
                        type="email"
                        name="Email"
                        value={formData.Email}
                        onChange={handleChange}
                        disabled={saving}
                        className="w-full border border-gray-300 rounded-md p-2"
                        placeholder="Email Address"
                    />
                </div>

                {/* Submit Button */}
                <button
                    type="submit"
                    disabled={saving}
                    className="bg-black text-white px-4 py-2 rounded-md hover:bg-gray-800 transition"
                >
                    {saving ? "Saving..." : "Save Changes"}
                </button>
            </form>
        </div>
    );
}