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
  const handleObjectDetection = async () =>{
    const formData = new FormData();
    formData.append("file", file);
    const response = await axios.post("http://localhost:8088/api/odimg", 
      formData,
      {header:{"Content-Type":"multipart/form-data"}}
    );
    console.log(response.data);
    const data = await response.json();
    const detectedObjects = data.responses[0].localizedObjectAnnotations || [];
    setObjects(detectedObjects);
    drawBoundingBoxes(detectedObjects);
  }
  const drawBoundingBoxes = (detectedObjects) => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const img = new Image();
    img.src = image;

    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0, img.width, img.height);

      detectedObjects.forEach((obj) => {
        const vertices = obj.boundingPoly.normalizedVertices;

        if (vertices.length === 4) {
          const x = vertices[0].x * img.width;
          const y = vertices[0].y * img.height;
          const width = (vertices[1].x - vertices[0].x) * img.width;
          const height = (vertices[2].y - vertices[0].y) * img.height;

          ctx.strokeStyle = "red";
          ctx.lineWidth = 3;
          ctx.strokeRect(x, y, width, height);

          ctx.fillStyle = "red";
          ctx.font = "16px Arial";
          ctx.fillText(obj.name, x, y - 5);
        }
      });
    };
  };
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