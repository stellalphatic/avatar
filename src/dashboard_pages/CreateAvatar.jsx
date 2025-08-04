import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext'; // Adjust path based on your project structure
import supabase from '../supabaseClient'; // Adjust path based on your project structure
import { useNavigate } from 'react-router-dom';
import { Upload, Mic, Image, Save, Loader2, Info, CheckCircle, PlayCircle, Video as VideoIcon, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const CreateAvatar = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState(1); // Current step in the wizard
  const [loading, setLoading] = useState(false); // Overall loading for form submission
  const [fileUploading, setFileUploading] = useState(false); // Loading state for file uploads
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [profileLimits, setProfileLimits] = useState(null); // User's avatar creation limits

  const [formData, setFormData] = useState({
    name: '',
    persona_role: '', // Added persona_role as per schema
    system_prompt: '',
    conversational_context: '',
  });

  const [visualFile, setVisualFile] = useState(null); // Can be image or video
  const [voiceFile, setVoiceFile] = useState(null);

  const visualInputRef = useRef(null);
  const voiceInputRef = useRef(null);

  // Fetch user profile limits on component mount
  useEffect(() => {
    const fetchProfileLimits = async () => {
      if (!user) return;
      try {
        const { data, error: profileError } = await supabase
          .from('profiles')
          .select('custom_avatar_creations_this_month, custom_avatar_creations_monthly_limit')
          .eq('id', user.id)
          .single();

        if (profileError) throw profileError;
        setProfileLimits(data);
      } catch (err) {
        console.error('Error fetching profile limits:', err);
        setError('Failed to load avatar creation limits.');
      }
    };
    fetchProfileLimits();
  }, [user?.id]);

  // Check if user has exceeded avatar creation limit
  const hasExceededLimit = profileLimits &&
                           profileLimits.custom_avatar_creations_this_month >= profileLimits.custom_avatar_creations_monthly_limit;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e, setFile, type) => {
    setError(null); // Clear previous errors
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (type === 'voice') {
        // Basic size validation for voice
        const maxSizeMB = 5; // Example: 5MB limit for voice file
        if (file.size > maxSizeMB * 1024 * 1024) {
          setError(`Voice file is too large. Max size is ${maxSizeMB}MB.`);
          setFile(null);
          return;
        }
      } else if (type === 'visual') {
        const maxSizeMB = 10; // Example: 10MB limit for visual file
        if (file.size > maxSizeMB * 1024 * 1024) {
          setError(`Visual file is too large. Max size is ${maxSizeMB}MB.`);
          setFile(null);
          return;
        }
      }
      setFile(file);
    }
  };

  const uploadFile = async (file, bucketPath) => {
    if (!file) return null;
    setFileUploading(true);
    const filePath = `${user.id}/${bucketPath}/${Date.now()}-${file.name.replace(/\s/g, '_')}`;
    try {
      const { error: uploadError } = await supabase.storage
        .from('avatar-media') // Your bucket name
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
        });

      if (uploadError) {
        throw uploadError;
      }
      const { data: publicUrlData } = supabase.storage
        .from('avatar-media')
        .getPublicUrl(filePath);
      return publicUrlData.publicUrl;
    } catch (err) {
      console.error(`Error uploading file to ${bucketPath}:`, err);
      setError(`Failed to upload file: ${err.message}`);
      return null;
    } finally {
      setFileUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccessMessage(null);

    // Final validation before submission
    if (!user) {
      setError("User not authenticated. Please log in.");
      setLoading(false);
      return;
    }
    if (hasExceededLimit) {
      setError(`You have reached your limit of ${profileLimits.custom_avatar_creations_monthly_limit} custom avatars this month.`);
      setLoading(false);
      return;
    }
    if (!visualFile) { // Ensure at least one visual asset is provided
      setError("Please upload an image or video for your avatar's visual asset.");
      setLoading(false);
      return;
    }
    if (!voiceFile) {
      setError("Please upload a voice sample for your avatar.");
      setLoading(false);
      return;
    }
    if (!formData.name || !formData.system_prompt) {
      setError("Avatar Name and System Prompt are required.");
      setLoading(false);
      return;
    }

    try {
      let imageUrl = null;
      let videoUrl = null;

      if (visualFile) {
        if (visualFile.type.startsWith('image/')) {
          imageUrl = await uploadFile(visualFile, 'avatars/images');
        } else if (visualFile.type.startsWith('video/')) {
          videoUrl = await uploadFile(visualFile, 'avatars/videos');
        }
      }
      
      const voiceUrl = await uploadFile(voiceFile, 'avatars/voices');

      if ((!imageUrl && !videoUrl) || !voiceUrl) {
        throw new Error("Failed to upload all required media files.");
      }

      const avatarData = {
        user_id: user.id,
        name: formData.name,
        image_url: imageUrl,
        voice_url: voiceUrl,
        video_url: videoUrl, // Will be null if an image was uploaded
        persona_role: formData.persona_role || null,
        system_prompt: formData.system_prompt,
        conversational_context: formData.conversational_context || null,
        is_public: false, // Default to private for custom avatars
        llm_config: {}, // Placeholder
        stt_config: {}, // Placeholder
        tts_config: {}, // Placeholder
        created_at: new Date().toISOString(), // Add created_at
        updated_at: new Date().toISOString(), // Add updated_at
      };

      const { error: insertError } = await supabase
        .from('avatars')
        .insert([avatarData]);

      if (insertError) {
        // Handle unique constraint errors or other DB errors
        if (insertError.code === '23505') { // Example: unique violation code
          setError('An avatar with this name already exists. Please choose a different name.');
        } else {
          throw insertError;
        }
      } else {
        // Increment avatar creation count in user profile
        const { error: updateProfileError } = await supabase
          .from('profiles')
          .update({ custom_avatar_creations_this_month: profileLimits.custom_avatar_creations_this_month + 1 })
          .eq('id', user.id);

        if (updateProfileError) {
          console.warn('Failed to update avatar creation count in profile:', updateProfileError.message);
          // Don't block creation, but log the warning
        }

        setSuccessMessage('Avatar created successfully! Redirecting to My Avatars...');
        setTimeout(() => navigate('/dashboard/avatars/my'), 2000); // Redirect after success
      }
    } catch (err) {
      console.error('Avatar creation process error:', err.message);
      setError(err.message || 'An unexpected error occurred during avatar creation.');
    } finally {
      setLoading(false);
    }
  };

  const renderStepContent = () => {
    switch (step) {
      case 1:
        return (
          <motion.div
            key="step1"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.3 }}
            className="space-y-4" // Reduced vertical spacing
          >
            <h2 className="text-lg md:text-xl font-bold text-gray-900 dark:text-white mb-2 text-center">1. Upload Media Assets</h2> {/* Adjusted font size */}
            <p className="text-sm text-gray-600 dark:text-gray-400 text-center mb-4"> {/* Adjusted font size */}
              Provide a visual representation (image or video) and a voice sample for your avatar.
            </p>

            {/* Visual Asset Upload */}
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 md:p-4 border border-dashed border-gray-300 dark:border-gray-600 text-center"> {/* Adjusted padding */}
              <h3 className="font-semibold text-base md:text-lg text-gray-700 dark:text-gray-300 mb-2">Visual Asset (Image or Video)</h3> {/* Adjusted font size */}
              <div
                onClick={() => visualInputRef.current.click()}
                className="cursor-pointer w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg mx-auto h-48 sm:h-56 md:h-64 lg:h-72 bg-gray-100 dark:bg-gray-600/50 rounded-lg border-2 border-dashed border-gray-400 dark:border-gray-500 flex flex-col items-center justify-center text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors overflow-hidden relative" // Adjusted max-width and fixed height
              >
                {visualFile ? (
                  visualFile.type.startsWith('image/') ? (
                    <img src={URL.createObjectURL(visualFile)} alt="Visual Preview" className="w-full h-full object-contain rounded-lg" />
                  ) : (
                    <video src={URL.createObjectURL(visualFile)} controls className="w-full h-full object-contain rounded-lg" />
                  )
                ) : (
                  <>
                    <Image size={32} className="text-gray-400" /> {/* Adjusted icon size */}
                    <span className="text-sm mt-2 font-medium">Click to Upload Image or Video</span>
                    <span className="text-xs mt-1 text-gray-400">.jpg, .png, .mp4, .mov (Max 10MB)</span>
                  </>
                )}
                {fileUploading && (
                  <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center text-white">
                    <Loader2 className="animate-spin mr-2" size={24} /> Uploading...
                  </div>
                )}
              </div>
              <input ref={visualInputRef} type="file" accept="image/*,video/*" className="hidden" onChange={(e) => handleFileChange(e, setVisualFile, 'visual')} />
              {visualFile && <p className="text-xs text-center mt-2 text-gray-500 truncate">{visualFile.name}</p>}
              <p className="text-xs text-gray-400 mt-2">
                * For best results, use a clear image/video with a single, front-facing person.
                Advanced face validation (e.g., single face, no non-face images) is a future enhancement.
              </p>
            </div>

            {/* Voice Sample Upload */}
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 md:p-4 border border-dashed border-gray-300 dark:border-gray-600 text-center"> {/* Adjusted padding */}
              <h3 className="font-semibold text-base md:text-lg text-gray-700 dark:text-gray-300 mb-2">Voice Sample (Audio)</h3> {/* Adjusted font size */}
              <div
                onClick={() => voiceInputRef.current.click()}
                className="cursor-pointer w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg mx-auto h-24 bg-gray-100 dark:bg-gray-600/50 rounded-lg border-2 border-dashed border-gray-400 dark:border-gray-500 flex flex-col items-center justify-center text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors relative" // Adjusted max-width and fixed height
              >
                {voiceFile ? (
                  <div className="flex flex-col items-center w-full px-2"> {/* Reduced horizontal padding */}
                    <PlayCircle size={32} className="text-green-500 mb-1" /> {/* Adjusted icon size and margin */}
                    <p className="text-xs text-gray-700 dark:text-gray-300 text-center truncate w-full">{voiceFile.name}</p> {/* Adjusted font size */}
                    <audio src={URL.createObjectURL(voiceFile)} controls className="mt-2 w-full max-w-xs rounded-md"></audio> {/* Adjusted margin-top, max-width */}
                  </div>
                ) : (
                  <>
                    <Mic size={32} className="text-gray-400" /> {/* Adjusted icon size */}
                    <span className="text-sm mt-2 font-medium">Click to Upload Audio</span>
                    <span className="text-xs mt-1 text-gray-400">.wav, .mp3 (Recommended 10s+, Max 5MB)</span>
                  </>
                )}
                {fileUploading && (
                  <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center text-white">
                    <Loader2 className="animate-spin mr-2" size={24} /> Uploading...
                  </div>
                )}
              </div>
              <input ref={voiceInputRef} type="file" accept="audio/wav,audio/mpeg" className="hidden" onChange={(e) => handleFileChange(e, setVoiceFile, 'voice')} />
              {voiceFile && <p className="text-xs text-center mt-2 text-gray-500 truncate">{voiceFile.name}</p>}
            </div>

            <div className="flex justify-end mt-6"> {/* Adjusted margin-top */}
              <button
                type="button"
                onClick={() => {
                  if (!visualFile || !voiceFile) {
                    setError("Please upload both a visual asset (image/video) and a voice sample to proceed.");
                    return;
                  }
                  setStep(2);
                }}
                disabled={fileUploading || hasExceededLimit || !visualFile || !voiceFile}
                className="px-5 py-2 bg-pink-600 text-white font-semibold rounded-lg shadow-md hover:bg-pink-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm" // Adjusted padding and font size
              >
                Next Step
              </button>
            </div>
          </motion.div>
        );
      case 2:
        return (
          <motion.form
            key="step2"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.3 }}
            onSubmit={handleSubmit}
            className="space-y-4" // Reduced vertical spacing
          >
            <h2 className="text-lg md:text-xl font-bold text-gray-900 dark:text-white mb-2 text-center">2. Avatar Details & Create</h2> {/* Adjusted font size */}
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 text-center"> {/* Adjusted font size */}
              Define your avatar's personality and role.
            </p>

            {/* Avatar Details */}
            <div className="space-y-3 bg-gray-50 dark:bg-gray-700 p-4 md:p-6 rounded-lg border border-gray-200 dark:border-gray-600"> {/* Adjusted spacing and padding */}
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Avatar Name <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-1 focus:ring-pink-500 focus:border-pink-500 outline-none text-gray-900 dark:text-white"
                  placeholder="e.g., Financial Advisor Bot"
                />
              </div>
              <div>
                <label htmlFor="persona_role" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Persona Role (Optional)</label>
                <input
                  type="text"
                  id="persona_role"
                  name="persona_role"
                  value={formData.persona_role}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-1 focus:ring-pink-500 focus:border-pink-500 outline-none text-gray-900 dark:text-white"
                  placeholder="e.g., Customer Support, Sales Representative"
                />
              </div>
              <div>
                <label htmlFor="system_prompt" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">System Prompt (Persona) <span className="text-red-500">*</span></label>
                <textarea
                  id="system_prompt"
                  name="system_prompt"
                  value={formData.system_prompt}
                  onChange={handleInputChange}
                  required
                  rows="4" // Reduced rows
                  className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-1 focus:ring-pink-500 focus:border-pink-500 outline-none text-gray-900 dark:text-white"
                  placeholder="You are a helpful AI assistant named Charlie. You are an expert in financial planning for young professionals. Be friendly, encouraging, and provide clear, actionable advice."
                ></textarea>
                <p className="text-xs text-gray-400 mt-1">This is the core instruction that defines your avatar's personality and role.</p>
              </div>
              <div>
                <label htmlFor="conversational_context" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Conversational Context (Optional)</label>
                <textarea
                  id="conversational_context"
                  name="conversational_context"
                  value={formData.conversational_context}
                  onChange={handleInputChange}
                  rows="2" // Reduced rows
                  className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-1 focus:ring-pink-500 focus:border-pink-500 outline-none text-gray-900 dark:text-white"
                  placeholder="e.g., This conversation is for a first-time user consultation. The goal is to understand their financial situation."
                ></textarea>
                <p className="text-xs text-gray-400 mt-1">Additional context for specific conversation flows.</p>
              </div>
            </div>

            {/* Summary of Uploaded Media */}
            <div className="bg-gray-50 dark:bg-gray-700 p-3 md:p-4 rounded-lg border border-gray-200 dark:border-gray-600"> {/* Adjusted padding */}
              <h3 className="font-semibold text-base md:text-lg text-gray-700 dark:text-gray-300 mb-3">Uploaded Media Summary:</h3> {/* Adjusted font size */}
              <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-2">
                {visualFile ? (visualFile.type.startsWith('image/') ? <Image size={16} /> : <VideoIcon size={16} />) : <Info size={16} />}
                Visual Asset: <span className="truncate">{visualFile ? visualFile.name : 'Not provided'}</span>
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-2 mt-2">
                {voiceFile ? <Mic size={16} /> : <Info size={16} />}
                Voice Sample: <span className="truncate">{voiceFile ? voiceFile.name : 'Not provided'}</span>
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-between items-center mt-6 pt-4 border-t border-gray-200 dark:border-gray-700"> {/* Adjusted margin-top and padding-top */}
              <button
                type="button"
                onClick={() => setStep(1)}
                className="px-5 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 font-semibold rounded-lg shadow-md hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors text-sm" // Adjusted padding and font size
              >
                Previous Step
              </button>
              <button
                type="submit"
                disabled={loading || fileUploading || hasExceededLimit}
                className="px-5 py-2 bg-pink-600 text-white font-semibold rounded-lg shadow-md hover:bg-pink-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm" // Adjusted padding and font size
              >
                {loading ? <Loader2 size={20} className="animate-spin" /> : <Save size={20} />}
                {loading ? 'Creating Avatar...' : 'Create Avatar'}
              </button>
            </div>
          </motion.form>
        );
      default:
        return null;
    }
  };

  return (
    <div className="max-w-4xl mx-auto bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 md:p-8 border border-gray-200 dark:border-gray-700 my-8">
      <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-6 text-center">Create Your Custom Avatar</h1> {/* Adjusted font size */}

      {/* Step Indicators */}
      <div className="flex justify-center mb-8 space-x-3"> {/* Reduced space-x */}
        {[
          { label: 'Media Assets', step: 1 },
          { label: 'Avatar Details', step: 2 },
        ].map((s, index) => (
          <div key={s.step} className="flex items-center">
            <div className={`w-8 h-8 md:w-9 md:h-9 rounded-full flex items-center justify-center font-bold text-white transition-all duration-300 text-sm ${ // Adjusted size and font size
              step === s.step ? 'bg-purple-600 shadow-lg' : 'bg-gray-300 dark:bg-gray-600'
            }`}>
              {s.step}
            </div>
            <span className={`ml-2 text-xs md:text-sm font-medium ${step >= s.step ? 'text-purple-600 dark:text-purple-400' : 'text-gray-500 dark:text-gray-400'}`}>
              {s.label}
            </span>
            {index < 1 && (
              <div className={`h-1 w-6 md:w-10 mx-2 md:mx-3 transition-all duration-300 ${ // Adjusted width and mx
                step > s.step ? 'bg-purple-600' : 'bg-gray-300 dark:bg-gray-600'
              }`}></div>
            )}
          </div>
        ))}
      </div>

      {/* Global Messages */}
      <AnimatePresence>
        {hasExceededLimit && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-yellow-100 dark:bg-yellow-900/20 border border-yellow-400 text-yellow-700 dark:text-yellow-300 px-4 py-3 rounded-md relative mb-4 text-sm" role="alert"
          >
            <strong className="font-bold">Limit Reached!</strong>
            <span className="block sm:inline ml-2">You have reached your limit of {profileLimits.custom_avatar_creations_monthly_limit} custom avatars this month. Please upgrade your plan or wait for the next billing cycle.</span>
          </motion.div>
        )}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-red-100 dark:bg-red-900/20 border border-red-400 text-red-700 dark:text-red-300 px-4 py-3 rounded-md relative mb-4 text-sm" role="alert"
          >
            <strong className="font-bold">Error!</strong>
            <span className="block sm:inline ml-2">{error}</span>
          </motion.div>
        )}
        {successMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-green-100 dark:bg-green-900/20 border border-green-400 text-green-700 dark:text-green-300 px-4 py-3 rounded-md relative mb-4 text-sm" role="alert"
          >
            <strong className="font-bold">Success!</strong>
            <span className="block sm:inline ml-2">{successMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {renderStepContent()}
    </div>
  );
};

export default CreateAvatar;
