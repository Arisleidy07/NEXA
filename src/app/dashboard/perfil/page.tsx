"use client";

import { useState, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
import Image from "next/image";
import {
  User,
  Camera,
  Pencil,
  Save,
  Loader2,
  Mail,
  Calendar,
} from "lucide-react";
import { toast } from "sonner";

export default function PerfilPage() {
  const { user, userProfile, updateUserName, updateUserPhoto } = useAuth();
  const [editingName, setEditingName] = useState(false);
  const [newName, setNewName] = useState("");
  const [savingName, setSavingName] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const avatarUrl = userProfile?.fotoUrl || user?.photoURL;
  const displayName = userProfile?.nombre || user?.displayName || "Mi Negocio";

  const handleStartEditName = () => {
    setNewName(displayName);
    setEditingName(true);
  };

  const handleSaveName = async () => {
    if (!newName.trim()) {
      toast.error("El nombre no puede estar vacío");
      return;
    }
    setSavingName(true);
    try {
      await updateUserName(newName.trim());
      toast.success("Nombre actualizado");
      setEditingName(false);
    } catch {
      toast.error("Error al actualizar el nombre");
    } finally {
      setSavingName(false);
    }
  };

  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Solo se permiten imágenes");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("La imagen no puede superar 5MB");
      return;
    }

    setUploadingPhoto(true);
    try {
      await updateUserPhoto(file);
      toast.success("Foto actualizada");
    } catch {
      toast.error("Error al subir la foto");
    } finally {
      setUploadingPhoto(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-1">Mi Perfil</h1>
        <p className="text-muted text-sm">
          Administra tu información personal
        </p>
      </div>

      <div className="bg-card border border-border/60 rounded-2xl shadow-sm overflow-hidden">
        {/* Avatar Section */}
        <div className="bg-gradient-to-r from-primary/10 to-primary/5 p-8 flex flex-col items-center">
          <div className="relative group">
            {avatarUrl ? (
              <Image
                src={avatarUrl}
                alt="Avatar"
                width={120}
                height={120}
                className="rounded-full object-cover w-[120px] h-[120px] border-4 border-white shadow-lg"
              />
            ) : (
              <div className="w-[120px] h-[120px] rounded-full bg-white border-4 border-white shadow-lg flex items-center justify-center">
                <User className="w-14 h-14 text-primary/40" />
              </div>
            )}
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadingPhoto}
              className="absolute bottom-1 right-1 w-10 h-10 bg-primary text-white rounded-full flex items-center justify-center shadow-lg hover:bg-primary-hover transition-colors disabled:opacity-50"
            >
              {uploadingPhoto ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Camera className="w-5 h-5" />
              )}
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handlePhotoChange}
              className="hidden"
            />
          </div>
          <h2 className="mt-4 text-xl font-bold">{displayName}</h2>
          <p className="text-muted text-sm">{user?.email}</p>
        </div>

        {/* Info Section */}
        <div className="p-6 space-y-6">
          {/* Nombre */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <User className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-muted mb-0.5">Nombre</p>
                {editingName ? (
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleSaveName()}
                      className="flex-1 px-3 py-1.5 border border-border rounded-lg text-sm bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                      autoFocus
                    />
                    <button
                      onClick={handleSaveName}
                      disabled={savingName}
                      className="p-2 bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors disabled:opacity-50"
                    >
                      {savingName ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Save className="w-4 h-4" />
                      )}
                    </button>
                    <button
                      onClick={() => setEditingName(false)}
                      className="p-2 border border-border rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <span className="text-xs font-medium">Cancelar</span>
                    </button>
                  </div>
                ) : (
                  <p className="font-medium truncate">{displayName}</p>
                )}
              </div>
            </div>
            {!editingName && (
              <button
                onClick={handleStartEditName}
                className="p-2 rounded-lg hover:bg-white text-muted hover:text-primary transition-colors shrink-0"
              >
                <Pencil className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Email */}
          <div className="flex items-center p-4 bg-gray-50 rounded-xl">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
                <Mail className="w-5 h-5 text-blue-500" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-muted mb-0.5">Email</p>
                <p className="font-medium truncate">{user?.email}</p>
              </div>
            </div>
          </div>

          {/* Miembro desde */}
          {userProfile?.createdAt && (
            <div className="flex items-center p-4 bg-gray-50 rounded-xl">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className="w-10 h-10 rounded-lg bg-purple-50 flex items-center justify-center shrink-0">
                  <Calendar className="w-5 h-5 text-purple-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-muted mb-0.5">Miembro desde</p>
                  <p className="font-medium">
                    {new Date(userProfile.createdAt).toLocaleDateString(
                      "es-DO",
                      {
                        day: "2-digit",
                        month: "long",
                        year: "numeric",
                      },
                    )}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
