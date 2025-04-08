import io
import os
import torch
import torch.nn as nn
import torchvision.models as models
import torchvision.transforms as T
from PIL import Image
from fastapi import FastAPI, File, UploadFile, Request
from fastapi.responses import JSONResponse
from fastapi.responses import HTMLResponse
from fastapi.templating import Jinja2Templates
from fastapi.staticfiles import StaticFiles
import numpy as np
import cv2
import base64
import mediapipe as mp

# Khởi tạo FastAPI
app = FastAPI(title="Face Shape Recognition API")

# Thiết bị
device = "cuda" if torch.cuda.is_available() else "cpu"

# Tải mô hình EfficientNet-B4
model = models.efficientnet_b4(pretrained=False)
num_classes = 5
model.classifier = nn.Sequential(
    nn.Dropout(p=0.3, inplace=True),
    nn.Linear(model.classifier[1].in_features, num_classes)
)

# Tải trọng số đã huấn luyện
model.load_state_dict(torch.load("models/best_model.pth", map_location=device))
model.to(device)
model.eval()

# Biến đổi ảnh đầu vào cho mô hình
transform = T.Compose([
    T.Resize((224, 224)),
    T.ToTensor(),
    T.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])
])

# Danh sách nhãn và màu viền (RGB format)
class_names = ["Oval", "Round", "Square", "Heart", "Oblong"]
colors = {
    "Oval": (0, 255, 0),
    "Round": (0, 0, 255),
    "Square": (255, 0, 0),
    "Heart": (255, 255, 0),
    "Oblong": (255, 0, 255)
}

# MediaPipe Face Mesh
mp_face_mesh = mp.solutions.face_mesh
face_mesh = mp_face_mesh.FaceMesh(static_image_mode=True, max_num_faces=1, refine_landmarks=True)

# Chỉ số các điểm bao quanh khuôn mặt (đường viền ngoài)
FACE_CONTOUR_IDX = [
    10, 338, 297, 332, 284, 251, 389, 356, 454, 323,
    361, 288, 397, 365, 379, 378, 400, 377, 152, 148,
    176, 149, 150, 136, 172, 58, 132, 93, 234, 127,
    162, 21, 54, 103, 67, 109
]

# Hàm vẽ đường viền bao quanh khuôn mặt bằng MediaPipe
def draw_face_contour(image, predicted_label):
    try:
        img_array = np.array(image).copy()  # RGB
        h, w = img_array.shape[:2]
        rgb_img = img_array.copy()  # giữ nguyên RGB để đưa vào MediaPipe
        results = face_mesh.process(rgb_img)

        if not results.multi_face_landmarks:
            # Không có khuôn mặt nào
            cv2.rectangle(img_array, (10, 10), (w - 10, h - 10), colors[predicted_label], 2)
        else:
            face_landmarks = results.multi_face_landmarks[0]
            points = []

            for idx in FACE_CONTOUR_IDX:
                landmark = face_landmarks.landmark[idx]
                x, y = int(landmark.x * w), int(landmark.y * h)
                points.append([x, y])

            points = np.array(points, dtype=np.int32)
            color = colors[predicted_label]
            cv2.polylines(img_array, [points], isClosed=True, color=color, thickness=2)

        # Chuyển RGB sang BGR trước khi encode
        bgr_img = cv2.cvtColor(img_array, cv2.COLOR_RGB2BGR)
        _, buffer = cv2.imencode(".jpg", bgr_img)
        img_base64 = base64.b64encode(buffer).decode("utf-8")
        return img_base64
    except Exception as e:
        print(f"Error in draw_face_contour: {str(e)}")
        raise e

# Trỏ đến thư mục templates
templates = Jinja2Templates(directory="templates")

app.mount("/static", StaticFiles(directory="static"), name="static")
@app.get("/", response_class=HTMLResponse)
async def read_root(request: Request):
    # Truyền request và biến context nếu cần
    return templates.TemplateResponse("index.html", {"request": request, "name": "FastAPI ❤️ HTML"})



# API dự đoán
@app.post("/predict")
async def predict(file: UploadFile = File(...)):
    try:
        contents = await file.read()
        image = Image.open(io.BytesIO(contents)).convert("RGB")

        # Dự đoán hình dạng khuôn mặt
        image_tensor = transform(image).unsqueeze(0).to(device)
        with torch.no_grad():
            outputs = model(image_tensor)
            probabilities = torch.softmax(outputs, dim=1).cpu().numpy()[0]
            predicted_idx = torch.argmax(outputs, dim=1).item()

        predicted_label = class_names[predicted_idx]
        confidence_scores = {class_names[i]: float(probabilities[i]) for i in range(num_classes)}

        # Vẽ viền khuôn mặt
        image_with_contour = draw_face_contour(image, predicted_label)

        return JSONResponse(content={
            "predicted_shape": predicted_label,
            "confidence_scores": confidence_scores,
            "image_with_contour": f"data:image/jpeg;base64,{image_with_contour}",
            "status": "success"
        })
    except Exception as e:
        return JSONResponse(content={"status": "error", "message": str(e)}, status_code=500)

port = int(os.getenv("PORT", 8000))  # Railway cung cấp PORT qua biến môi trường
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=port)
