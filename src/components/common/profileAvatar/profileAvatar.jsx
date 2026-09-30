import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { PROFILE_PLACEHOLDER_IMAGE } from "../../../utils/profileUtil";

const ProfileAvatar = ({
  src,
  alt = "Profile",
  className = "",
  placeholderClassName = "",
}) => {
  const [imageError, setImageError] = useState(false);
  const trimmedSrc = typeof src === "string" ? src.trim() : "";
  const showPhoto = Boolean(trimmedSrc) && !imageError;

  useEffect(() => {
    setImageError(false);
  }, [trimmedSrc]);

  if (showPhoto) {
    return (
      <img
        src={trimmedSrc}
        alt={alt}
        className={className}
        onError={() => setImageError(true)}
      />
    );
  }

  return (
    <img
      src={PROFILE_PLACEHOLDER_IMAGE}
      alt=""
      aria-hidden
      className={placeholderClassName || className}
    />
  );
};

ProfileAvatar.propTypes = {
  src: PropTypes.string,
  alt: PropTypes.string,
  className: PropTypes.string,
  placeholderClassName: PropTypes.string,
};

export default ProfileAvatar;
