const publicUrl = process.env.PUBLIC_URL || "";

export const PROFILE_PLACEHOLDER_IMAGE = `${publicUrl}/images/profile-placeholder.svg`;

export const mapProfileResponseToUserData = (profile = {}, existing = {}) => {
  const firstName = profile.firstName || existing.firstName || "";
  const lastName = profile.lastName || existing.lastName || "";

  return {
    ...existing,
    id: profile.userId ?? existing.id,
    email: profile.email ?? existing.email,
    firstName,
    lastName,
    name: `${firstName} ${lastName}`.trim() || existing.name || "",
    mobileNumber: profile.mobileNumber ?? existing.mobileNumber ?? "",
    organizationId: profile.organizationId ?? existing.organizationId,
    organizationName: profile.organizationName ?? existing.organizationName,
    profilePhotoUrl: profile.profilePhotoUrl ?? existing.profilePhotoUrl ?? "",
    bio: profile.bio ?? existing.bio ?? "",
    organizationDescription:
      profile.organizationDescription ?? existing.organizationDescription ?? "",
    socialMediaLinks: profile.socialMediaLinks ?? existing.socialMediaLinks ?? [],
    role: existing.role ?? null,
  };
};

export const notifyProfileUpdated = () => {
  window.dispatchEvent(new Event("profile-updated"));
};

export const isPlaceholderOrganizationName = (name) =>
  typeof name === "string" && /'s Organi[sz]ation$/i.test(name.trim());

export const getProfileInitials = (userData = {}) => {
  if (userData.firstName && userData.lastName) {
    return `${userData.firstName[0]}${userData.lastName[0]}`.toUpperCase();
  }
  if (userData.name) {
    const parts = userData.name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return userData.name.substring(0, 2).toUpperCase();
  }
  if (userData.organizationName) {
    const parts = userData.organizationName.trim().split(/\s+/);
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return userData.organizationName.substring(0, 2).toUpperCase();
  }
  return "PR";
};
