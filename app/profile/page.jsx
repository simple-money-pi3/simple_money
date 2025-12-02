"use client";

import React, { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Phone, Shield, Target, Coins, Trophy, LogOut, Edit2, Save, X, Camera, Trash2, AlertTriangle } from "lucide-react";
import { useAuthStore, useProfileStore } from "@/lib/store";
import { Header } from "@/components/layout/Header";
import { Navigation } from "@/components/layout/Navigation";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { SuccessModal } from "@/components/ui/SuccessModal";
import { soundManager } from "@/lib/sounds";

/**
 * Obtém as iniciais do nome do usuário
 */
const getInitials = (name) => {
  if (!name) return "U";
  const parts = name.split(" ");
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return name.substring(0, 2).toUpperCase();
};

/**
 * Mapeamento de ícones de conquistas
 */
const achievementIcons = {
  target: Target,
  coin: Coins,
  trophy: Trophy,
};

/**
 * Formata data para exibição (DD/MM/AAAA)
 */
const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

/**
 * Página de Perfil
 * Exibe informações do usuário, pontos, conquistas e opções de contato
 * Prioriza experiência desktop mas mantém responsividade mobile
 */
/**
 * Formata telefone para input (XX) XXXXX-XXXX
 */
const formatPhoneInput = (value) => {
  const numbers = value.replace(/\D/g, "");
  if (numbers === "") return "";
  
  if (numbers.length <= 2) {
    return `(${numbers}`;
  } else if (numbers.length <= 7) {
    return `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`;
  } else {
    return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7, 11)}`;
  }
};

/**
 * Remove formatação do telefone
 */
const parsePhoneValue = (formattedPhone) => {
  return formattedPhone.replace(/\D/g, "");
};

export default function ProfilePage() {
  const router = useRouter();
  const { user, logout, updateProfile, deleteAccount } = useAuthStore();
  const { points, achievements, getNotificationCount, loadNotifications } = useProfileStore();
  const notificationCount = getNotificationCount();
  
  // Estados do modo de edição
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [isDeleteAccountModalOpen, setIsDeleteAccountModalOpen] = useState(false);
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);
  const fileInputRef = useRef(null);
  
  // Estados do formulário
  const [formData, setFormData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: user?.phone || "",
    photo: user?.photo || null,
  });
  
  const [errors, setErrors] = useState({});

  // Sincroniza formData quando o user mudar
  useEffect(() => {
    if (user && !isEditing) {
      setFormData({
        name: user.name || "",
        email: user.email || "",
        phone: user.phone || "",
        photo: user.photo || null,
      });
    }
  }, [user, isEditing]);

  // Badge dinâmico: carrega notificações ao abrir o perfil
  useEffect(() => {
    loadNotifications();
  }, []);

  /**
   * Função para fazer logout
   */
  const handleLogout = () => {
    soundManager.playClick();
    logout();
    router.push("/login");
  };

  /**
   * Navega para a página de contato
   */
  const handleContactUs = () => {
    soundManager.playClick();
    router.push("/profile/contact");
  };

  /**
   * Navega para a página de termos
   */
  const handleTerms = () => {
    soundManager.playClick();
    router.push("/profile/terms");
  };

  /**
   * Inicia o modo de edição
   */
  const handleStartEdit = () => {
    soundManager.playClick();
    setFormData({
      name: user?.name || "",
      email: user?.email || "",
      phone: user?.phone || "",
      photo: user?.photo || null,
    });
    setErrors({});
    setIsEditing(true);
  };

  /**
   * Cancela a edição
   */
  const handleCancelEdit = () => {
    soundManager.playClick();
    setIsEditing(false);
    setFormData({
      name: user?.name || "",
      email: user?.email || "",
      phone: user?.phone || "",
      photo: user?.photo || null,
    });
    setErrors({});
  };

  /**
   * Valida o formulário
   */
  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Nome é obrigatório";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email é obrigatório";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Email inválido";
    }

    if (formData.phone && formData.phone.length > 0) {
      const phoneNumbers = parsePhoneValue(formData.phone);
      if (phoneNumbers.length < 10) {
        newErrors.phone = "Telefone inválido";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /**
   * Salva as alterações do perfil
   */
  const handleSaveProfile = async () => {
    soundManager.playClick();

    if (!validateForm()) {
      return;
    }

    setIsSaving(true);

    try {
      await updateProfile({
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone ? parsePhoneValue(formData.phone) : "",
        photo: formData.photo,
      });

      setIsEditing(false);
      setIsSuccessModalOpen(true);
      soundManager.playSuccess();
    } catch (error) {
      console.error("Erro ao salvar perfil:", error);
      setErrors({ general: "Erro ao salvar perfil. Tente novamente." });
    } finally {
      setIsSaving(false);
    }
  };

  /**
   * Manipula o upload de foto
   */
  const handlePhotoChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Valida o tipo de arquivo
    if (!file.type.startsWith("image/")) {
      setErrors({ photo: "Por favor, selecione uma imagem válida" });
      return;
    }

    // Valida o tamanho (máximo 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setErrors({ photo: "A imagem deve ter no máximo 5MB" });
      return;
    }

    // Converte para base64
    const reader = new FileReader();
    reader.onloadend = () => {
      setFormData((prev) => ({
        ...prev,
        photo: reader.result,
      }));
      setErrors((prev) => ({ ...prev, photo: null }));
    };
    reader.onerror = () => {
      setErrors({ photo: "Erro ao carregar a imagem" });
    };
    reader.readAsDataURL(file);
  };

  /**
   * Remove a foto
   */
  const handleRemovePhoto = () => {
    soundManager.playClick();
    setFormData((prev) => ({
      ...prev,
      photo: null,
    }));
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  /**
   * Abre modal de confirmação para apagar conta
   */
  const handleOpenDeleteAccount = () => {
    soundManager.playClick();
    setIsDeleteAccountModalOpen(true);
  };

  /**
   * Fecha modal de apagar conta
   */
  const handleCloseDeleteAccount = () => {
    soundManager.playClick();
    setIsDeleteAccountModalOpen(false);
  };

  /**
   * Apaga a conta do usuário
   */
  const handleDeleteAccount = async () => {
    soundManager.playClick();
    setIsDeletingAccount(true);

    try {
      // Deleta a conta no banco de dados e faz logout
      await deleteAccount();
      
      // Redireciona para login
      router.push('/login');
      soundManager.playSuccess();
    } catch (error) {
      console.error('Erro ao apagar conta:', error);
      setErrors({ general: "Erro ao apagar conta. Tente novamente." });
    } finally {
      setIsDeletingAccount(false);
      setIsDeleteAccountModalOpen(false);
    }
  };

  // Obtém o nome completo ou padrão
  const userName = user?.name || "Usuário";
  const userEmail = user?.email || "usuario@email.com";
  const userPhone = user?.phone || "";
  const userPhoto = user?.photo || null;
  const initials = getInitials(userName);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
      {/* Navegação lateral (desktop) */}
      <Navigation />

      {/* Conteúdo principal */}
      <div className="flex-1 flex flex-col pb-20 md:pb-0 md:ml-20 md:transition-all md:duration-300">
        {/* Cabeçalho com botão de sair */}
        <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between p-4 md:p-6">
            <h1 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">
              Meu Perfil
            </h1>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors font-medium"
            >
              <LogOut className="w-5 h-5" />
              <span className="hidden md:inline">Sair</span>
            </button>
          </div>
        </div>

        {/* Conteúdo */}
        <main className="flex-1 p-4 md:p-6 lg:p-8 xl:p-10 max-w-4xl mx-auto w-full space-y-6 md:space-y-8">
          {/* Card de Informações do Usuário */}
          <Card className="dark:bg-gray-800 dark:border-gray-700">
            <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
              {/* Avatar com badge */}
              <div className="relative">
                {isEditing ? (
                  <div className="relative">
                    <div className="w-24 h-24 md:w-32 md:h-32 rounded-full overflow-hidden bg-primary-500 flex items-center justify-center text-white text-2xl md:text-3xl font-bold">
                      {formData.photo ? (
                        <img
                          src={formData.photo}
                          alt="Foto do perfil"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        initials
                      )}
                    </div>
                    {/* Botão de editar foto */}
                    <label className="absolute bottom-0 right-0 w-8 h-8 md:w-10 md:h-10 bg-primary-500 rounded-full flex items-center justify-center cursor-pointer hover:bg-primary-600 transition-colors border-2 border-white dark:border-gray-800">
                      <Camera className="w-4 h-4 md:w-5 md:h-5 text-white" />
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handlePhotoChange}
                        className="hidden"
                      />
                    </label>
                    {formData.photo && (
                      <button
                        onClick={handleRemovePhoto}
                        className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                        title="Remover foto"
                      >
                        <X className="w-4 h-4 text-white" />
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="w-24 h-24 md:w-32 md:h-32 rounded-full overflow-hidden bg-primary-500 flex items-center justify-center text-white text-2xl md:text-3xl font-bold">
                    {userPhoto ? (
                      <img
                        src={userPhoto}
                        alt="Foto do perfil"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      initials
                    )}
                  </div>
                )}
                {/* Badge de notificações */}
                {!isEditing && notificationCount > 0 && (
                  <div className="absolute -bottom-1 -right-1 w-8 h-8 md:w-10 md:h-10 bg-orange-500 rounded-full flex items-center justify-center text-white text-xs md:text-sm font-bold border-4 border-white dark:border-gray-800">
                    {notificationCount}
                  </div>
                )}
              </div>

              {/* Informações do usuário */}
              <div className="flex-1 w-full">
                {isEditing ? (
                  <div className="space-y-4">
                    <div>
                      <Input
                        label="Nome"
                        type="text"
                        value={formData.name}
                        onChange={(e) => {
                          setFormData((prev) => ({ ...prev, name: e.target.value }));
                          if (errors.name) {
                            setErrors((prev) => ({ ...prev, name: null }));
                          }
                        }}
                        error={errors.name}
                        className="w-full"
                      />
                    </div>
                    <div>
                      <Input
                        label="Email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => {
                          setFormData((prev) => ({ ...prev, email: e.target.value }));
                          if (errors.email) {
                            setErrors((prev) => ({ ...prev, email: null }));
                          }
                        }}
                        error={errors.email}
                        className="w-full"
                      />
                    </div>
                    <div>
                      <Input
                        label="Telefone"
                        type="text"
                        value={formData.phone}
                        onChange={(e) => {
                          const formatted = formatPhoneInput(e.target.value);
                          setFormData((prev) => ({ ...prev, phone: formatted }));
                          if (errors.phone) {
                            setErrors((prev) => ({ ...prev, phone: null }));
                          }
                        }}
                        placeholder="(00) 00000-0000"
                        error={errors.phone}
                        className="w-full"
                        maxLength={15}
                      />
                    </div>
                    {errors.photo && (
                      <p className="text-sm text-red-600 dark:text-red-400">
                        {errors.photo}
                      </p>
                    )}
                    {errors.general && (
                      <p className="text-sm text-red-600 dark:text-red-400">
                        {errors.general}
                      </p>
                    )}
                    <div className="flex gap-3">
                      <Button
                        onClick={handleSaveProfile}
                        variant="primary"
                        isLoading={isSaving}
                        className="flex-1"
                      >
                        <Save className="w-4 h-4 mr-2" />
                        Salvar
                      </Button>
                      <Button
                        onClick={handleCancelEdit}
                        variant="secondary"
                        className="flex-1"
                      >
                        <X className="w-4 h-4 mr-2" />
                        Cancelar
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center md:text-left">
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
                        {userName}
                      </h2>
                      <button
                        onClick={handleStartEdit}
                        className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                        title="Editar perfil"
                      >
                        <Edit2 className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                      </button>
                    </div>
                    <p className="text-gray-600 dark:text-gray-400 mb-2">{userEmail}</p>
                    {userPhone && (
                      <p className="text-gray-600 dark:text-gray-400 mb-4">
                        {formatPhoneInput(userPhone)}
                      </p>
                    )}

                    {/* Botão de pontos */}
                    <div className="inline-flex items-center px-4 py-2 bg-primary-100 dark:bg-primary-900/30 rounded-full">
                      <span className="text-primary-700 dark:text-primary-300 font-semibold">
                        {points} pontos
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </Card>

          {/* Links de Ação */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Fale Conosco */}
            <button
              onClick={handleContactUs}
              className="flex items-center gap-4 p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-left"
            >
              <div className="p-3 rounded-lg bg-primary-100 dark:bg-primary-900/30">
                <Phone className="w-6 h-6 text-primary-600 dark:text-primary-400" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  FALE CONOSCO
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Entre em contato conosco
                </p>
              </div>
            </button>

            {/* Termos e Privacidade */}
            <button
              onClick={handleTerms}
              className="flex items-center gap-4 p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-left"
            >
              <div className="p-3 rounded-lg bg-primary-100 dark:bg-primary-900/30">
                <Shield className="w-6 h-6 text-primary-600 dark:text-primary-400" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  TERMOS & PRIVACIDADE
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Leia nossos termos
                </p>
              </div>
            </button>
          </div>

          {/* Botão de Apagar Conta */}
          <Card className="dark:bg-gray-800 dark:border-gray-700 border-red-200 dark:border-red-800">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-red-100 dark:bg-red-900/30">
                  <Trash2 className="w-6 h-6 text-red-600 dark:text-red-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    APAGAR CONTA
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Esta ação não pode ser desfeita
                  </p>
                </div>
              </div>
              <Button
                onClick={handleOpenDeleteAccount}
                variant="primary"
                className="bg-red-500 hover:bg-red-600"
              >
                Apagar Conta
              </Button>
            </div>
          </Card>

          {/* Lista de Conquistas */}
          <Card className="dark:bg-gray-800 dark:border-gray-700">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
              Conquistas
            </h3>

            {achievements.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500 dark:text-gray-400">
                  Nenhuma conquista ainda
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {achievements.map((achievement) => {
                  const IconComponent =
                    achievementIcons[achievement.icon] || Trophy;
                  const iconColor =
                    achievement.icon === "target"
                      ? "text-red-500"
                      : achievement.icon === "coin"
                      ? "text-yellow-500"
                      : "text-yellow-600";

                  return (
                    <div
                      key={achievement.id}
                      className="flex items-center gap-4 p-4 bg-white dark:bg-gray-700 rounded-xl border border-gray-200 dark:border-gray-600"
                    >
                      <div
                        className={`p-3 rounded-lg bg-gray-100 dark:bg-gray-600 ${iconColor}`}
                      >
                        <IconComponent className="w-6 h-6" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900 dark:text-white">
                          {achievement.title}
                        </h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {achievement.description}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>
        </main>
      </div>

      {/* Modal de Sucesso */}
      <SuccessModal
        isOpen={isSuccessModalOpen}
        onClose={() => {
          soundManager.playClick();
          setIsSuccessModalOpen(false);
        }}
        onAction={() => {
          soundManager.playClick();
          setIsSuccessModalOpen(false);
        }}
        title="Perfil atualizado!"
        message="Suas informações foram salvas com sucesso."
        actionText="OK"
      />

      {/* Modal de Apagar Conta */}
      {isDeleteAccountModalOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 dark:bg-black/40"
            onClick={handleCloseDeleteAccount}
          />
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full p-6 relative animate-scale-in">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 rounded-full flex items-center justify-center mr-3 bg-red-100 dark:bg-red-900/30">
                  <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400" />
                </div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  Apagar Conta
                </h2>
              </div>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Tem certeza que deseja apagar sua conta? Esta ação é{" "}
                <span className="font-semibold text-red-600 dark:text-red-400">
                  irreversível
                </span>
                . Todos os seus dados serão permanentemente removidos.
              </p>
              <div className="flex gap-3">
                <Button
                  onClick={handleCloseDeleteAccount}
                  variant="secondary"
                  className="flex-1"
                  disabled={isDeletingAccount}
                >
                  Cancelar
                </Button>
                <Button
                  onClick={handleDeleteAccount}
                  variant="primary"
                  className="flex-1 bg-red-500 hover:bg-red-600"
                  isLoading={isDeletingAccount}
                >
                  {isDeletingAccount ? "Apagando..." : "Apagar Conta"}
                </Button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
