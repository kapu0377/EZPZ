import axios from "axios";
import { useRef, useState } from "react";

const ObjectDetection = () =>{
  const [image, setImage] = useState(null);
  const [file ,setFile] = useState(null);
  const [objects, setObjects] = useState([]);
  const canvasRef = useRef(null);

  const handleImageChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };
  const handleObjectDetection = () =>{
    const formData = new FormData();
    formData.append("file", file);
    const response = axios.post("http://localhost:8088/api/odimg", 
      formData,
      {header:{"Content-Type":"multipart/form-data"}}
    );
    console.log(response.data);
  }
  return(
    <div className="flex flex-col items-center gap-4 p-4">
      <input type="file" accept="image/*" onChange={handleImageChange} />
      <button onClick={handleObjectDetection} className="px-4 py-2 bg-blue-500 text-white rounded">
        Detect Objects
      </button>
      <img src={image} />
      <canvas ref={canvasRef} className="border mt-4" />
    </div>
  );
}
export default ObjectDetection;