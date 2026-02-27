"use client";

import { useMemo, useRef, useState, type ChangeEvent } from "react";
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

  ctx.drawImage(
    image,
    sx,
    sy,
    side,
    side,
    0,
    0,
    TARGET_IMAGE_SIZE,
    TARGET_IMAGE_SIZE
  );

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
}: ProfileClientProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [avatarSrc, setAvatarSrc] = useState(profileImageDataUrl || fallbackAvatarUrl);
  const [hasStoredPhoto, setHasStoredPhoto] = useState(Boolean(profileImageDataUrl));
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const memberSince = useMemo(() => formatMemberSince(userCreatedAt), [userCreatedAt]);

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
      const message = error instanceof Error
        ? (error.message === "PAYLOAD_TOO_LARGE"
            ? "Image is too large after processing. Try a different image."
            : error.message)
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

  return (
    <div className="flex justify-center min-h-full py-6">
      <div className="w-full max-w-3xl px-2 sm:px-4 space-y-8">
        <section className="bg-slate-100 rounded-3xl p-6 sm:p-8 shadow-sm">
          <div className="flex flex-col items-center text-center gap-5">
            <div className="relative">
              <div className="absolute inset-0 -m-1 rounded-full bg-gradient-to-tr from-blue-100 to-indigo-200 blur-sm opacity-80" />
              <div className="relative h-32 w-32 overflow-hidden rounded-full border-4 border-white shadow">
                {avatarSrc ? (
                  <img
                    src={avatarSrc}
                    alt="Profile avatar"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="h-full w-full bg-primary text-white flex items-center justify-center text-4xl font-semibold">
                    {getInitial(userName, userEmail)}
                  </div>
                )}
              </div>
            </div>

            <div>
              <h1 className="text-4xl font-bold tracking-tight text-slate-900">
                {userName || userEmail}
              </h1>
              <p className="mt-2 text-lg text-slate-500">Member since {memberSince}</p>
            </div>

            <div className="flex items-center gap-3">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/jpg,image/webp"
                className="hidden"
                onChange={handleFileSelected}
              />
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
                  className="px-4 py-2 rounded-full border border-slate-300 text-sm font-semibold text-slate-700 hover:bg-white transition-colors disabled:opacity-60"
                >
                  Remove
                </button>
              )}
            </div>

            {uploadError && (
              <p className="text-sm text-red-600">{uploadError}</p>
            )}
          </div>

          <div className="mt-8 grid grid-cols-3 gap-3 sm:gap-4">
            <div className="rounded-2xl bg-slate-200/60 p-4 text-center">
              <p className="text-xs font-semibold tracking-[0.12em] text-slate-500 uppercase">Age</p>
              <p className="mt-2 text-4xl font-bold text-slate-900">{age ?? "--"}</p>
            </div>
            <div className="rounded-2xl bg-slate-200/60 p-4 text-center">
              <p className="text-xs font-semibold tracking-[0.12em] text-slate-500 uppercase">Weight</p>
              <p className="mt-2 text-4xl font-bold text-slate-900">
                {weightKg ?? "--"}
                <span className="text-xl font-normal text-slate-500">kg</span>
              </p>
            </div>
            <div className="rounded-2xl bg-slate-200/60 p-4 text-center">
              <p className="text-xs font-semibold tracking-[0.12em] text-slate-500 uppercase">Height</p>
              <p className="mt-2 text-4xl font-bold text-slate-900">
                {heightCm ?? "--"}
                <span className="text-xl font-normal text-slate-500">cm</span>
              </p>
            </div>
          </div>
        </section>

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
          <DeleteAccountButton userName={userIdentityLabel} />
        </section>
      </div>
    </div>
  );
}
