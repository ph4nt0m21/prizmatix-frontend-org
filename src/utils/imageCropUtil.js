export const createCroppedJpegFile = ({
  image,
  crop,
  fileName,
  quality = 0.85,
}) => {
  return new Promise((resolve, reject) => {
    if (!image || !crop?.width || !crop?.height) {
      reject(new Error("Invalid crop parameters"));
      return;
    }

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    if (!ctx) {
      reject(new Error("Unable to get 2D context"));
      return;
    }

    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;
    const pixelRatio = window.devicePixelRatio || 1;

    canvas.width = Math.floor(crop.width * pixelRatio * scaleX);
    canvas.height = Math.floor(crop.height * pixelRatio * scaleY);

    ctx.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
    ctx.imageSmoothingQuality = "high";

    ctx.drawImage(
      image,
      crop.x * scaleX,
      crop.y * scaleY,
      crop.width * scaleX,
      crop.height * scaleY,
      0,
      0,
      crop.width * scaleX,
      crop.height * scaleY
    );

    const nextFileName = (fileName || "image").replace(/\.(png|gif|webp)$/i, ".jpg");

    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error("Canvas export failed"));
          return;
        }
        resolve(
          new File([blob], nextFileName, {
            type: "image/jpeg",
          })
        );
      },
      "image/jpeg",
      quality
    );
  });
};
