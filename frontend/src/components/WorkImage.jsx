import { useState } from "react";
import { MdArrowOutward } from "react-icons/md";

const FALLBACK_IMAGE = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300' viewBox='0 0 400 300'%3E%3Crect fill='%231a1f2e' width='400' height='300'/%3E%3Ctext fill='%235eead4' font-family='Geist, sans-serif' font-size='16' x='50%25' y='50%25' text-anchor='middle' dy='.3em'%3EProject Image%3C/text%3E%3C/svg%3E";

const WorkImage = (props) => {
  const [isVideo, setIsVideo] = useState(false);
  const [video, setVideo] = useState("");
  const [imgError, setImgError] = useState(false);

  const handleMouseEnter = async () => {
    if (props.video) {
      setIsVideo(true);
      try {
        const response = await fetch(`src/assets/${props.video}`);
        if (!response.ok) return;
        const blob = await response.blob();
        const blobUrl = URL.createObjectURL(blob);
        setVideo(blobUrl);
      } catch {
        // Video not available
      }
    }
  };

  const handleImgError = () => setImgError(true);

  return (
    <div className="work-image">
      <a className="work-image-in" href={props.link} onMouseEnter={handleMouseEnter} onMouseLeave={() => setIsVideo(false)} target="_blank" data-cursor={"disable"}>
        {props.link && <div className="work-link"><MdArrowOutward /></div>}
        <img src={imgError ? FALLBACK_IMAGE : (props.image || FALLBACK_IMAGE)} alt={props.alt || "Project"} onError={handleImgError} />
        {isVideo && <video src={video} autoPlay muted playsInline loop></video>}
      </a>
    </div>
  );
};

export default WorkImage;
