"use client";

import { useEffect, useMemo, useRef, useState, type ChangeEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import SecurityTokenDisplay from "@/components/SecurityTokenDisplay";
import DeleteAccountButton from "@/components/DeleteAccountButton";

interface ProfileClientProps {
  userName: string | null;
  userEmail: string;
  userCreatedAt: string;
  userIdentityLabel: string;
  profileImageDataUrl: string | null;
  fallbackAvatarUrl: string | null;
  age: number | null;
  weightKg: number | null;
  heightCm: number | null;
  dateOfBirth: string | null;
}

const ACCEPTED_IMAGE_TYPES = new Set(["image/png", "image/jpeg", "image/jpg", "image/webp"]);
const MAX_RAW_FILE_SIZE_BYTES = 5 * 1024 * 1024;
const TARGET_IMAGE_SIZE = 512;
const MAX_FINAL_DATA_URL_LENGTH = 1_600_000;

function getProfileImageErrorMessage(errorCode: string) {
  switch (errorCode) {
    case "UNAUTHORIZED":
      return "You need to sign in again.";
    case "PAYLOAD_TOO_LARGE":
      return "Image is too large after processing. Try a different image.";
    case "INVALID_IMAGE":
      return "Invalid image format. Please upload PNG, JPG, or WEBP.";
    case "RATE_LIMITED":
      return "Too many upload attempts. Please try again in a few minutes.";
    default:
      return "Could not update profile photo. Please try again.";
  }
}

function getInitial(name: string | null, email: string) {
  if (name?.trim()) return name.trim().charAt(0).toUpperCase();
  return email.charAt(0).toUpperCase();
}

function formatMemberSince(createdAtISO: string) {
  const createdAt = new Date(createdAtISO);
  return createdAt.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });
}

function toDateInputValue(isoValue: string | null) {
  if (!isoValue) return "";
  const parsed = new Date(isoValue);
  if (Number.isNaN(parsed.getTime())) return "";
  return parsed.toISOString().slice(0, 10);
}

function calculateAgeFromDateInput(dateInput: string) {
  if (!dateInput) return null;

  const parsed = new Date(`${dateInput}T00:00:00`);
  if (Number.isNaN(parsed.getTime())) return null;

  const today = new Date();
  let computedAge = today.getFullYear() - parsed.getFullYear();
  const monthDiff = today.getMonth() - parsed.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < parsed.getDate())) {
    computedAge -= 1;
  }

  return Math.max(computedAge, 0);
}

function readFileAsDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = () => reject(new Error("READ_FAILED"));
    reader.readAsDataURL(file);
  });
}

function loadImage(src: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("IMAGE_DECODE_FAILED"));
    image.src = src;
  });
}

async function toSquareProfileImageDataUrl(file: File) {
  const sourceDataUrl = await readFileAsDataUrl(file);
  const image = await loadImage(sourceDataUrl);

  const canvas = document.createElement("canvas");
  canvas.width = TARGET_IMAGE_SIZE;
  canvas.height = TARGET_IMAGE_SIZE;

  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("CANVAS_NOT_AVAILABLE");

  const side = Math.min(image.width, image.height);
  const sx = Math.floor((image.width - side) / 2);
  const sy = Math.floor((image.height - side) / 2);

  ctx.drawImage(image, sx, sy, side, side, 0, 0, TARGET_IMAGE_SIZE, TARGET_IMAGE_SIZE);

  const outputDataUrl = canvas.toDataURL("image/jpeg", 0.88);
  if (outputDataUrl.length > MAX_FINAL_DATA_URL_LENGTH) {
    throw new Error("PAYLOAD_TOO_LARGE");
  }

  return outputDataUrl;
}

export default function ProfileClient({
  userName,
  userEmail,
  userCreatedAt,
  userIdentityLabel,
  profileImageDataUrl,
  fallbackAvatarUrl,
  age,
  weightKg,
  heightCm,
  dateOfBirth,
}: ProfileClientProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [displayName, setDisplayName] = useState(userName || "");
  const [displayDateOfBirth, setDisplayDateOfBirth] = useState(toDateInputValue(dateOfBirth));
  const [displayWeightKg, setDisplayWeightKg] = useState<number | null>(weightKg);
  const [displayHeightCm, setDisplayHeightCm] = useState<number | null>(heightCm);

  const [avatarSrc, setAvatarSrc] = useState(profileImageDataUrl || fallbackAvatarUrl);
  const [hasStoredPhoto, setHasStoredPhoto] = useState(Boolean(profileImageDataUrl));

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [profileError, setProfileError] = useState<string | null>(null);

  const [profileForm, setProfileForm] = useState({
    name: userName || "",
    dateOfBirth: toDateInputValue(dateOfBirth),
    weightKg: weightKg ? String(weightKg) : "",
    heightCm: heightCm ? String(heightCm) : "",
  });

  const memberSince = useMemo(() => formatMemberSince(userCreatedAt), [userCreatedAt]);

  useEffect(() => {
    setAvatarSrc(profileImageDataUrl || fallbackAvatarUrl);
    setHasStoredPhoto(Boolean(profileImageDataUrl));
  }, [profileImageDataUrl, fallbackAvatarUrl]);

  useEffect(() => {
    setDisplayName(userName || "");
    setDisplayDateOfBirth(toDateInputValue(dateOfBirth));
    setDisplayWeightKg(weightKg);
    setDisplayHeightCm(heightCm);
  }, [userName, dateOfBirth, weightKg, heightCm]);

  const displayedAge = useMemo(() => {
    const fromDob = calculateAgeFromDateInput(displayDateOfBirth);
    return fromDob ?? age;
  }, [displayDateOfBirth, age]);

  const editingAge = useMemo(
    () => calculateAgeFromDateInput(profileForm.dateOfBirth),
    [profileForm.dateOfBirth]
  );

  const openEditModal = () => {
    setUploadError(null);
    setProfileError(null);
    setProfileForm({
      name: displayName,
      dateOfBirth: displayDateOfBirth,
      weightKg: displayWeightKg != null ? String(displayWeightKg) : "",
      heightCm: displayHeightCm != null ? String(displayHeightCm) : "",
    });
    setIsEditModalOpen(true);
  };

  const closeEditModal = () => {
    if (isSavingProfile || isUploading) return;
    setIsEditModalOpen(false);
  };

  const triggerFilePicker = () => {
    if (isUploading) return;
    fileInputRef.current?.click();
  };

  const handleFileSelected = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploadError(null);

    if (!ACCEPTED_IMAGE_TYPES.has(file.type)) {
      setUploadError("Invalid image format. Please upload PNG, JPG, or WEBP.");
      event.target.value = "";
      return;
    }

    if (file.size > MAX_RAW_FILE_SIZE_BYTES) {
      setUploadError("Image is too large. Max file size is 5 MB.");
      event.target.value = "";
      return;
    }

    setIsUploading(true);
    try {
      const imageDataUrl = await toSquareProfileImageDataUrl(file);
      const response = await fetch("/api/user/profile-image", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageDataUrl }),
      });

      const result = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(getProfileImageErrorMessage(result.error));
      }

      setAvatarSrc(imageDataUrl);
      setHasStoredPhoto(true);
      router.refresh();
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message === "PAYLOAD_TOO_LARGE"
            ? "Image is too large after processing. Try a different image."
            : error.message
          : "Could not update profile photo. Please try again.";
      setUploadError(message);
    } finally {
      setIsUploading(false);
      if (event.target) event.target.value = "";
    }
  };

  const handleRemovePhoto = async () => {
    if (isUploading || !hasStoredPhoto) return;

    setUploadError(null);
    setIsUploading(true);
    try {
      const response = await fetch("/api/user/profile-image", { method: "DELETE" });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(getProfileImageErrorMessage(result.error));
      }

      setAvatarSrc(fallbackAvatarUrl || null);
      setHasStoredPhoto(false);
      router.refresh();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Could not remove profile photo.";
      setUploadError(message);
    } finally {
      setIsUploading(false);
    }
  };

  const handleProfileSave = async () => {
    setProfileError(null);

    const normalizedName = profileForm.name.trim().replace(/\s+/g, " ");
    const parsedWeight = Number.parseFloat(profileForm.weightKg);
    const parsedHeight = Number.parseFloat(profileForm.heightCm);

    if (normalizedName.length < 2) {
      setProfileError("Name must be at least 2 characters.");
      return;
    }

    if (!profileForm.dateOfBirth) {
      setProfileError("Date of birth is required.");
      return;
    }

    const parsedDob = new Date(`${profileForm.dateOfBirth}T00:00:00`);
    if (Number.isNaN(parsedDob.getTime()) || parsedDob > new Date()) {
      setProfileError("Date of birth must be a valid date in the past.");
      return;
    }

    if (!Number.isFinite(parsedWeight) || parsedWeight < 1 || parsedWeight > 635) {
      setProfileError("Weight must be between 1 and 635 kg.");
      return;
    }

    if (!Number.isFinite(parsedHeight) || parsedHeight < 61 || parsedHeight > 302) {
      setProfileError("Height must be between 61 and 302 cm.");
      return;
    }

    setIsSavingProfile(true);
    try {
      const response = await fetch("/api/user/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: normalizedName,
          dateOfBirth: parsedDob.toISOString(),
          weightKg: parsedWeight,
          heightCm: parsedHeight,
        }),
      });

      const result = await response.json().catch(() => ({}));
      if (!response.ok || !result.ok) {
        throw new Error("Could not update profile. Please try again.");
      }

      setDisplayName(normalizedName);
      setDisplayDateOfBirth(profileForm.dateOfBirth);
      setDisplayWeightKg(Math.round(parsedWeight));
      setDisplayHeightCm(Math.round(parsedHeight));
      setIsEditModalOpen(false);
      router.refresh();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Could not update profile.";
      setProfileError(message);
    } finally {
      setIsSavingProfile(false);
    }
  };

  return (
    <div className="flex justify-center min-h-full py-6">
      <div className="w-full max-w-3xl px-2 sm:px-4 space-y-8">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/png,image/jpeg,image/jpg,image/webp"
          className="hidden"
          onChange={handleFileSelected}
        />

        <section className="relative bg-slate-100 rounded-3xl p-6 sm:p-8 shadow-sm">
          <button
            type="button"
            onClick={openEditModal}
            className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white text-slate-600 flex items-center justify-center shadow-sm hover:shadow-md transition-shadow"
            aria-label="Edit profile"
          >
            <span className="material-icons-round">edit</span>
          </button>

          <div className="flex flex-col items-center text-center gap-5">
            <div className="relative">
              <div className="absolute inset-0 -m-1 rounded-full bg-gradient-to-tr from-blue-100 to-indigo-200 blur-sm opacity-80" />
              <div className="relative h-32 w-32 overflow-hidden rounded-full border-4 border-white shadow">
                {avatarSrc ? (
                  <img src={avatarSrc} alt="Profile avatar" className="h-full w-full object-cover" />
                ) : (
                  <div className="h-full w-full bg-primary text-white flex items-center justify-center text-4xl font-semibold">
                    {getInitial(displayName || userName, userEmail)}
                  </div>
                )}
              </div>
            </div>

            <div>
              <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900">
                {displayName || userEmail}
              </h1>
              <p className="mt-2 text-base sm:text-lg text-slate-500">Member since {memberSince}</p>
            </div>
          </div>

          <div className="mt-8 grid grid-cols-3 gap-2 sm:gap-4">
            <div className="rounded-2xl bg-slate-200/60 p-3 sm:p-4 text-center min-w-0">
              <p className="text-[11px] sm:text-xs font-semibold tracking-[0.12em] text-slate-500 uppercase whitespace-nowrap">
                Age
              </p>
              <p className="mt-2 text-3xl sm:text-4xl font-bold text-slate-900 leading-none whitespace-nowrap">
                {displayedAge ?? "--"}
              </p>
            </div>

            <div className="rounded-2xl bg-slate-200/60 p-3 sm:p-4 text-center min-w-0">
              <p className="text-[11px] sm:text-xs font-semibold tracking-[0.12em] text-slate-500 uppercase whitespace-nowrap">
                Weight
              </p>
              <p className="mt-2 flex items-baseline justify-center gap-0.5 whitespace-nowrap leading-none">
                <span className="text-3xl sm:text-4xl font-bold text-slate-900">{displayWeightKg ?? "--"}</span>
                <span className="text-lg sm:text-2xl font-medium text-slate-500">kg</span>
              </p>
            </div>

            <div className="rounded-2xl bg-slate-200/60 p-3 sm:p-4 text-center min-w-0">
              <p className="text-[11px] sm:text-xs font-semibold tracking-[0.12em] text-slate-500 uppercase whitespace-nowrap">
                Height
              </p>
              <p className="mt-2 flex items-baseline justify-center gap-0.5 whitespace-nowrap leading-none">
                <span className="text-3xl sm:text-4xl font-bold text-slate-900">{displayHeightCm ?? "--"}</span>
                <span className="text-lg sm:text-2xl font-medium text-slate-500">cm</span>
              </p>
            </div>
          </div>
        </section>

        {isEditModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/45 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="w-full max-w-lg rounded-3xl bg-white shadow-2xl border border-slate-100 overflow-hidden">
              <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
                <h2 className="text-xl font-bold text-slate-900">Edit Profile</h2>
                <button
                  type="button"
                  onClick={closeEditModal}
                  disabled={isSavingProfile || isUploading}
                  className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 hover:bg-slate-200 transition-colors disabled:opacity-60"
                  aria-label="Close"
                >
                  <span className="material-icons-round text-base">close</span>
                </button>
              </div>

              <div className="p-6 space-y-4 max-h-[78vh] overflow-y-auto">
                <label className="block space-y-1">
                  <span className="text-sm font-semibold text-slate-700">Full Name</span>
                  <input
                    type="text"
                    value={profileForm.name}
                    onChange={(event) =>
                      setProfileForm((prev) => ({ ...prev, name: event.target.value }))
                    }
                    className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary/30"
                  />
                </label>

                <label className="block space-y-1">
                  <span className="text-sm font-semibold text-slate-700">Date of Birth</span>
                  <input
                    type="date"
                    value={profileForm.dateOfBirth}
                    onChange={(event) =>
                      setProfileForm((prev) => ({ ...prev, dateOfBirth: event.target.value }))
                    }
                    className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary/30"
                  />
                </label>

                <div className="grid grid-cols-3 gap-2 sm:gap-3">
                  <div className="rounded-xl bg-slate-50 border border-slate-100 p-3 text-center">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500">Age</p>
                    <p className="mt-1 text-2xl font-bold leading-none text-slate-900">{editingAge ?? "--"}</p>
                  </div>

                  <label className="rounded-xl bg-slate-50 border border-slate-100 p-3 text-center block">
                    <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500">Weight (kg)</span>
                    <input
                      type="number"
                      inputMode="decimal"
                      step="0.1"
                      value={profileForm.weightKg}
                      onChange={(event) =>
                        setProfileForm((prev) => ({ ...prev, weightKg: event.target.value }))
                      }
                      className="mt-1 w-full bg-transparent text-center text-2xl font-bold leading-none text-slate-900 focus:outline-none"
                    />
                  </label>

                  <label className="rounded-xl bg-slate-50 border border-slate-100 p-3 text-center block">
                    <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500">Height (cm)</span>
                    <input
                      type="number"
                      inputMode="decimal"
                      step="0.1"
                      value={profileForm.heightCm}
                      onChange={(event) =>
                        setProfileForm((prev) => ({ ...prev, heightCm: event.target.value }))
                      }
                      className="mt-1 w-full bg-transparent text-center text-2xl font-bold leading-none text-slate-900 focus:outline-none"
                    />
                  </label>
                </div>

                <div className="rounded-2xl border border-slate-200 p-4 space-y-3">
                  <p className="text-sm font-semibold text-slate-800">Profile Photo</p>
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={triggerFilePicker}
                      disabled={isUploading}
                      className="px-4 py-2 rounded-full bg-slate-900 text-white text-sm font-semibold hover:bg-black transition-colors disabled:opacity-60"
                    >
                      {isUploading ? "Uploading..." : "Change Photo"}
                    </button>
                    {hasStoredPhoto && (
                      <button
                        type="button"
                        onClick={handleRemovePhoto}
                        disabled={isUploading}
                        className="px-4 py-2 rounded-full border border-slate-300 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors disabled:opacity-60"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                  {uploadError && <p className="text-sm text-red-600">{uploadError}</p>}
                </div>

                {profileError && <p className="text-sm text-red-600">{profileError}</p>}
              </div>

              <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={closeEditModal}
                  disabled={isSavingProfile || isUploading}
                  className="px-4 py-2 rounded-full border border-slate-300 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors disabled:opacity-60"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleProfileSave}
                  disabled={isSavingProfile || isUploading}
                  className="px-4 py-2 rounded-full bg-primary text-white text-sm font-semibold hover:bg-blue-700 transition-colors disabled:opacity-60"
                >
                  {isSavingProfile ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </div>
          </div>
        )}

        <section className="space-y-4">
          <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Contact Info</h2>
          <div className="rounded-2xl bg-white p-5 shadow-sm border border-slate-100 flex items-center gap-4">
            <div className="h-11 w-11 rounded-full bg-slate-100 flex items-center justify-center">
              <span className="material-icons-round text-slate-500">mail</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-slate-500">Email</p>
              <p className="text-xl font-semibold text-slate-900 break-all">{userEmail}</p>
            </div>
          </div>
        </section>

        <section className="rounded-2xl bg-white border border-slate-100 p-6 shadow-sm space-y-4">
          <h2 className="text-2xl font-bold text-slate-900">Account Settings</h2>
          <SecurityTokenDisplay />
          <Link
            href="/app/change-password"
            className="w-full border border-slate-300 text-slate-900 py-3 rounded-xl hover:bg-slate-50 transition-colors block text-center font-semibold"
          >
            Change Password
          </Link>
          <DeleteAccountButton userName={displayName || userIdentityLabel} />
        </section>
      </div>
    </div>
  );
}
