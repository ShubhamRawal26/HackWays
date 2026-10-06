import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import {
  User,
  Phone,
  School,
  Mail,
  Calendar,
  GraduationCap,
  BadgeCheck,
  CheckCircle2,
  RefreshCw,
  ArrowRight,
  X,
  UploadCloud,
  FileText,
  Image as ImageIcon,
  Trash2,
  AlertCircle,
  ShieldCheck,
  Eye,
} from 'lucide-react';

// Client-side image compression to optimize RTDB storage and avoid lag
const compressImageFile = (file) => {
  return new Promise((resolve, reject) => {
    if (file.type === 'application/pdf') {
      if (file.size > 4 * 1024 * 1024) {
        return reject(new Error('PDF file size must be less than 4MB.'));
      }
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        const maxDim = 1200;

        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.82);
        resolve(dataUrl);
      };
      img.onerror = () => reject(new Error('Invalid image file.'));
      img.src = e.target.result;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

export default function UserDetailsModal({ isOpen, onClose, onSaved }) {
  const { user, completeProfile } = useAuth();
  const { success, error: showError } = useToast();
  const fileInputRef = useRef(null);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [studentType, setStudentType] = useState('college'); // 'college' | 'school'
  const [institute, setInstitute] = useState('');
  const [year, setYear] = useState('');
  const [idCardUrl, setIdCardUrl] = useState('');
  const [idCardName, setIdCardName] = useState('');
  const [photoURL, setPhotoURL] = useState('');

  const [saving, setSaving] = useState(false);
  const [compressing, setCompressing] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setEmail(user.email || '');
      setPhone(user.phone || '');
      setStudentType(user.studentType || 'college');
      setInstitute(user.institute || user.college || '');
      setYear(user.year || '');
      setIdCardUrl(user.idCardUrl || '');
      setIdCardName(user.idCardName || (user.idCardUrl ? 'Student_ID_Card.jpg' : ''));
      setPhotoURL(user.photoURL || '');
    }
  }, [user, isOpen]);

  if (!isOpen) return null;

  const handleFile = async (file) => {
    if (!file) return;

    if (!file.type.startsWith('image/') && file.type !== 'application/pdf') {
      showError('Please upload an image (JPG, PNG, WebP) or PDF of your ID Card.');
      return;
    }

    if (file.size > 6 * 1024 * 1024) {
      showError('File exceeds 6MB limit. Please upload a smaller file.');
      return;
    }

    setCompressing(true);
    try {
      const dataUrl = await compressImageFile(file);
      setIdCardUrl(dataUrl);
      setIdCardName(file.name || 'Student_ID_Card.jpg');
      success('ID Card attached successfully!');
    } catch (err) {
      console.error('ID Upload Error:', err);
      showError(err.message || 'Failed to process file. Please try another image.');
    } finally {
      setCompressing(false);
    }
  };

  const handleFileInputChange = (e) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name.trim()) {
      showError('Please enter your full name.');
      return;
    }
    if (!email.trim() || !/^\S+@\S+\.\S+$/.test(email.trim())) {
      showError('Please enter a valid email address.');
      return;
    }
    if (!phone || !/^[0-9]{10}$/.test(phone.trim())) {
      showError('Please enter a valid 10-digit WhatsApp mobile number.');
      return;
    }
    if (!institute.trim()) {
      showError(studentType === 'school' ? 'Please enter your school name.' : 'Please enter your college or institute name.');
      return;
    }
    if (!year) {
      showError(studentType === 'school' ? 'Please select your current class.' : 'Please select your year of study.');
      return;
    }
    if (!idCardUrl) {
      showError('Please upload your Student ID Card (School or College ID) to proceed.');
      return;
    }

    setSaving(true);
    try {
      const res = await completeProfile({
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
        studentType,
        college: institute.trim(),
        institute: institute.trim(),
        year: year.trim(),
        idCardUrl,
        idCardName: idCardName || 'Student_ID.jpg',
      });

      if (res.success) {
        success('Profile & ID verified! Welcome to Hackways.');
        if (onSaved) {
          onSaved(res.user || user);
        } else if (onClose) {
          onClose();
        }
      }
    } catch (err) {
      console.error('Save Profile Error:', err);
      showError(err.message || 'Failed to save profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const isPdf = idCardUrl?.startsWith('data:application/pdf') || idCardName?.toLowerCase().endsWith('.pdf');

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 bg-dark/75 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-accent/20 overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[92vh]">
        {/* Top Accent Gradient Line */}
        <div className="h-1.5 w-full bg-gradient-to-r from-primary via-emerald-500 to-secondary shrink-0" />

        {/* Header with Close */}
        <div className="p-5 pb-3 sm:p-6 sm:pb-3 border-b border-accent/15 relative shrink-0">
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="absolute top-4 right-4 p-2 rounded-xl text-dark-muted hover:text-dark hover:bg-neutral-100 transition-colors cursor-pointer"
              title="Close"
            >
              <X className="w-5 h-5" />
            </button>
          )}

          <div className="flex items-center gap-3">
            {photoURL ? (
              <img
                src={photoURL}
                alt={name}
                className="w-11 h-11 rounded-2xl object-cover border-2 border-primary/20 shadow-xs shrink-0"
              />
            ) : (
              <div className="w-11 h-11 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                <GraduationCap className="w-5 h-5" />
              </div>
            )}
            <div>
              <h2 className="text-lg sm:text-xl font-extrabold text-primary leading-tight">
                Complete Student Registration
              </h2>
              <p className="text-[11px] sm:text-xs text-dark-muted mt-0.5">
                Select your category, academic details, and upload your Student ID Card.
              </p>
            </div>
          </div>
        </div>

        {/* Popup Form */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4 overflow-y-auto flex-1">
          {/* Category Selector: College vs School */}
          <div>
            <label className="block text-xs font-bold text-dark mb-1.5 uppercase tracking-wide">
              I am a <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-2 gap-2.5 p-1 bg-background-cream rounded-2xl border border-accent/15">
              <button
                type="button"
                onClick={() => {
                  setStudentType('college');
                  if (year.startsWith('Class')) setYear('');
                }}
                className={`py-2 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  studentType === 'college'
                    ? 'bg-primary text-white shadow-sm'
                    : 'text-dark-muted hover:text-dark hover:bg-white/60'
                }`}
              >
                <GraduationCap className="w-4 h-4" />
                <span>College Student</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setStudentType('school');
                  if (year.includes('Year')) setYear('');
                }}
                className={`py-2 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  studentType === 'school'
                    ? 'bg-primary text-white shadow-sm'
                    : 'text-dark-muted hover:text-dark hover:bg-white/60'
                }`}
              >
                <School className="w-4 h-4" />
                <span>School Student</span>
              </button>
            </div>
          </div>

          {/* Full Name */}
          <div>
            <label className="block text-xs font-bold text-dark mb-1 uppercase tracking-wide">
              Full Name <span className="text-red-500">*</span>
            </label>
            <div className="relative flex items-center">
              <User className="w-4 h-4 text-dark-muted absolute left-3.5 pointer-events-none" />
              <input
                type="text"
                required
                placeholder="e.g. Rahul Sharma"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-background-cream text-dark border border-accent/20 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium"
              />
            </div>
          </div>

          {/* Email Address */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-bold text-dark uppercase tracking-wide">
                Email Address <span className="text-red-500">*</span>
              </label>
              <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md flex items-center gap-1 border border-emerald-200/50">
                <CheckCircle2 className="w-3 h-3" /> Google Verified
              </span>
            </div>
            <div className="relative flex items-center">
              <Mail className="w-4 h-4 text-dark-muted absolute left-3.5 pointer-events-none" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-background-cream text-dark border border-accent/20 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-mono"
              />
            </div>
          </div>

          {/* Phone Number */}
          <div>
            <label className="block text-xs font-bold text-dark mb-1 uppercase tracking-wide">
              Phone Number (WhatsApp) <span className="text-red-500">*</span>
            </label>
            <div className="relative flex items-center">
              <Phone className="w-4 h-4 text-dark-muted absolute left-3.5 pointer-events-none" />
              <input
                type="tel"
                required
                maxLength={10}
                placeholder="10-digit mobile number"
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                className="w-full pl-10 pr-4 py-2.5 bg-background-cream text-dark border border-accent/20 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-mono"
              />
            </div>
            <span className="text-[10px] text-dark-muted mt-0.5 block">Used for event WhatsApp updates &amp; team coordination</span>
          </div>

          {/* Institution Name (Dynamic) */}
          <div>
            <label className="block text-xs font-bold text-dark mb-1 uppercase tracking-wide">
              {studentType === 'school' ? 'School Name' : 'College / Institute Name'}{' '}
              <span className="text-red-500">*</span>
            </label>
            <div className="relative flex items-center">
              <School className="w-4 h-4 text-dark-muted absolute left-3.5 pointer-events-none" />
              <input
                type="text"
                required
                placeholder={
                  studentType === 'school'
                    ? "e.g. St. Anselm's Sr. Sec. School, Abu Road"
                    : 'e.g. Chartered Institute of Technology (CIT), Abu Road'
                }
                value={institute}
                onChange={(e) => setInstitute(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-background-cream text-dark border border-accent/20 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              />
            </div>
          </div>

          {/* Year of Study / Class (Dynamic) */}
          <div>
            <label className="block text-xs font-bold text-dark mb-1 uppercase tracking-wide">
              {studentType === 'school' ? 'Current Class / Standard' : 'Year of Study'}{' '}
              <span className="text-red-500">*</span>
            </label>
            <div className="relative flex items-center">
              <Calendar className="w-4 h-4 text-dark-muted absolute left-3.5 pointer-events-none" />
              <select
                required
                value={year}
                onChange={(e) => setYear(e.target.value)}
                className="w-full pl-10 pr-8 py-2.5 bg-background-cream text-dark border border-accent/20 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all appearance-none cursor-pointer"
              >
                <option value="" disabled>
                  {studentType === 'school' ? 'Select Class' : 'Select Year'}
                </option>
                {studentType === 'school' ? (
                  <>
                    <option value="Class 8">Class 8th</option>
                    <option value="Class 9">Class 9th</option>
                    <option value="Class 10">Class 10th</option>
                    <option value="Class 11">Class 11th</option>
                    <option value="Class 12">Class 12th</option>
                  </>
                ) : (
                  <>
                    <option value="1st Year">1st Year (B.Tech / BCA / BSc / etc.)</option>
                    <option value="2nd Year">2nd Year</option>
                    <option value="3rd Year">3rd Year</option>
                    <option value="4th Year">4th Year</option>
                    <option value="Postgraduate">Postgraduate (MCA / M.Tech / MBA)</option>
                    <option value="Other">Other Higher Education</option>
                  </>
                )}
              </select>
              <div className="absolute right-3.5 pointer-events-none text-dark-muted text-xs">▼</div>
            </div>
          </div>

          {/* Student ID Card Upload (Mandatory) */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-bold text-dark uppercase tracking-wide">
                Upload Student ID Card <span className="text-red-500">*</span>
              </label>
              <span className="text-[10px] text-accent font-semibold flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-primary" /> Mandatory for verification
              </span>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg,image/jpg,image/webp,application/pdf"
              className="hidden"
              onChange={handleFileInputChange}
            />

            {idCardUrl ? (
              /* Uploaded Preview State */
              <div className="p-3 rounded-2xl bg-emerald-50/70 border border-emerald-200/80 flex items-center justify-between gap-3 transition-all">
                <div className="flex items-center gap-3 min-w-0">
                  {isPdf ? (
                    <div className="w-12 h-12 rounded-xl bg-red-100 text-red-700 flex items-center justify-center shrink-0 border border-red-200">
                      <FileText className="w-6 h-6" />
                    </div>
                  ) : (
                    <img
                      src={idCardUrl}
                      alt="Student ID Preview"
                      className="w-12 h-12 rounded-xl object-cover border border-emerald-300 shadow-xs shrink-0"
                    />
                  )}
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-dark truncate max-w-[200px] sm:max-w-xs">
                      {idCardName || 'Student_ID_Card'}
                    </p>
                    <p className="text-[10px] font-semibold text-emerald-700 flex items-center gap-1 mt-0.5">
                      <CheckCircle2 className="w-3 h-3" /> ID Attached &bull; Ready to submit
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="p-1.5 rounded-lg text-dark-muted hover:text-dark hover:bg-white text-xs font-semibold transition-colors cursor-pointer"
                    title="Change ID Card"
                  >
                    Change
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIdCardUrl('');
                      setIdCardName('');
                      if (fileInputRef.current) fileInputRef.current.value = '';
                    }}
                    className="p-1.5 rounded-lg text-red-500 hover:text-red-700 hover:bg-red-50 transition-colors cursor-pointer"
                    title="Remove ID Card"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ) : (
              /* Dropzone Upload Button */
              <div
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`p-4 rounded-2xl border-2 border-dashed transition-all text-center cursor-pointer flex flex-col items-center justify-center gap-1.5 ${
                  dragActive
                    ? 'border-primary bg-primary/5 scale-[1.01]'
                    : 'border-accent/25 hover:border-primary bg-background-cream/50 hover:bg-background-cream'
                }`}
              >
                {compressing ? (
                  <div className="py-2 flex flex-col items-center gap-2">
                    <RefreshCw className="w-6 h-6 animate-spin text-primary" />
                    <span className="text-xs font-semibold text-primary">Processing ID Card...</span>
                  </div>
                ) : (
                  <>
                    <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-0.5">
                      <UploadCloud className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-dark">
                        Click to upload or drag ID Card here
                      </p>
                      <p className="text-[10px] text-dark-muted mt-0.5">
                        School ID, College ID, or Fee Receipt (JPG, PNG, WebP or PDF &bull; max 5MB)
                      </p>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Submit CTA */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={saving || compressing}
              className="w-full btn-primary py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all disabled:opacity-60 cursor-pointer"
            >
              {saving ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Saving Registration...</span>
                </>
              ) : (
                <>
                  <span>Save &amp; Continue to Dashboard</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>

          {onClose && (
            <div className="text-center pb-1">
              <button
                type="button"
                onClick={onClose}
                className="text-xs text-dark-muted hover:text-dark transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
