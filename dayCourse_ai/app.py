from flask import Flask, request, jsonify
import os
import sys
import logging
import json
from azure.ai.vision.imageanalysis import ImageAnalysisClient
from azure.ai.vision.imageanalysis.models import VisualFeatures
from azure.core.credentials import AzureKeyCredential

from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from collections import defaultdict

app = Flask(__name__)
UPLOAD_FOLDER = 'uploads'
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# ImageBoundingBox 객체를 딕셔너리로 변환하는 함수
def bounding_box_to_dict(bounding_box):
    # bounding_box가 리스트인 경우
    if isinstance(bounding_box, list) and all(isinstance(point, dict) for point in bounding_box):
        return [{'x': point.x, 'y': point.y} for point in bounding_box]
    # bounding_box가 단일 객체인 경우
    elif hasattr(bounding_box, 'x') and hasattr(bounding_box, 'y'):
        return {
            'x': bounding_box.x,
            'y': bounding_box.y,
            'width': 0,  # 단일 포인트의 경우 width는 0
            'height': 0  # 단일 포인트의 경우 height는 0
        }
    else:
        return {
            'error': "Invalid bounding box format"
        }


def sample_analyze_all_image_file():
    # Set up logging
    logger = logging.getLogger("azure")
    logger.setLevel(logging.INFO)
    handler = logging.StreamHandler(stream=sys.stdout)
    formatter = logging.Formatter("%(asctime)s:%(levelname)s:%(name)s:%(message)s")
    handler.setFormatter(formatter)
    logger.addHandler(handler)

    # Load Azure credentials from environment variables
    try:
        endpoint = "https://daycourse.cognitiveservices.azure.com/"
        key = "80a9636cb8e545f6ab0239efea8d95b3"
    except KeyError:
        return "Missing environment variable 'VISION_ENDPOINT' or 'VISION_KEY'"

    # 분석할 이미지 URL
    image_url = "https://learn.microsoft.com/azure/ai-services/computer-vision/media/quickstarts/presentation.png"

    # Create an Image Analysis client
    client = ImageAnalysisClient(
        endpoint=endpoint,
        credential=AzureKeyCredential(key),
        logging_enable=True
    )

    # Load image to analyze into a 'bytes' object
    # with open("KakaoTalk_20241016_144939920.jpg", "rb") as f:
    with open("경로", "rb") as f:
        image_data = f.read()

    visual_features = [
        VisualFeatures.TAGS,
        VisualFeatures.OBJECTS,
        VisualFeatures.CAPTION,
        VisualFeatures.DENSE_CAPTIONS,
        VisualFeatures.READ,
        VisualFeatures.SMART_CROPS,
        VisualFeatures.PEOPLE,
    ]

    result = client.analyze(
        image_data=image_data,
        visual_features=visual_features,
        smart_crops_aspect_ratios=[0.9, 1.33],
        gender_neutral_caption=True,
        language="en"
    )

    print('확인')
    # print(result)

   

    analysis_results = {}


    # Collect analysis results
    # Print all analysis results to the console
    print("Image analysis results:")

    if result.caption is not None:
        print(" Caption:")
        print(f"   '{result.caption.text}', Confidence {result.caption.confidence:.4f}")

    if result.dense_captions is not None:
        print(" Dense Captions:")
        for caption in result.dense_captions.list:
            print(f"   '{caption.text}', {caption.bounding_box}, Confidence: {caption.confidence:.4f}")
        

    # if result.read is not None:
    #     print(" Read:")
    #     if result.read.blocks is not None:
    #         for line in result.read.blocks[0].lines:
    #             print(f"   Line: '{line.text}', Bounding box {line.bounding_polygon}")
    #             for word in line.words:
    #                 print(f"     Word: '{word.text}', Bounding polygon {word.bounding_polygon}, Confidence {word.confidence:.4f}")

    # if result.read is not None:
    #     try:
    #         print("Read:")
    #         if result.read.blocks is not None and len(result.read.blocks) > 0:
    #             for line in result.read.blocks[0].lines:
    #                 print(f"   Line: '{line.text}', Bounding box {line.bounding_polygon}")
    #                 for word in line.words:
    #                     print(f"     Word: '{word.text}', Bounding polygon {word.bounding_polygon}, Confidence {word.confidence:.4f}")
    #         else:
    #             print("No blocks found in the result.")
    #     except AttributeError as e:
    #         print(f"AttributeError: {e}. Please check the structure of 'result.read'.")
    #     except Exception as e:
    #         print(f"An unexpected error occurred: {e}")
    # else:
    #     print("The 'read' result is None.")


    if result.tags is not None:
        print(" Tags:")
        tags_list = []
        for tag in result.tags.list:
            print(f"   '{tag.name}', Confidence {tag.confidence:.4f}")
            tags_list.append({
                'name': tag.name,
                'confidence': tag.confidence
            })
        print(result.tags.list)
        analysis_results['Tags'] = tags_list

    if result.objects is not None:
        print(" Objects:")
        for object in result.objects.list:
            print(f"   '{object.tags[0].name}', {object.bounding_box}, Confidence: {object.tags[0].confidence:.4f}")

    if result.people is not None:
        print(" People:")
        for person in result.people.list:
            print(f"   {person.bounding_box}, Confidence {person.confidence:.4f}")

    if result.smart_crops is not None:
        print(" Smart Cropping:")
        for smart_crop in result.smart_crops.list:
            print(f"   Aspect ratio {smart_crop.aspect_ratio}: Smart crop {smart_crop.bounding_box}")

    print(f" Image height: {result.metadata.height}")
    print(f" Image width: {result.metadata.width}")
    print(f" Model version: {result.model_version}")


    
    print(analysis_results)
    #return jsonify('test')
    return jsonify(analysis_results)

def analyze_image_file(image):
    # Set up logging
    logger = logging.getLogger("azure")
    logger.setLevel(logging.INFO)
    handler = logging.StreamHandler(stream=sys.stdout)
    formatter = logging.Formatter("%(asctime)s:%(levelname)s:%(name)s:%(message)s")
    handler.setFormatter(formatter)
    logger.addHandler(handler)

    # Load Azure credentials from environment variables
    try:
        endpoint = "https://daycourse.cognitiveservices.azure.com/"
        key = "80a9636cb8e545f6ab0239efea8d95b3"
    except KeyError:
        return "Missing environment variable 'VISION_ENDPOINT' or 'VISION_KEY'"

    # Create an Image Analysis client
    client = ImageAnalysisClient(
        endpoint=endpoint,
        credential=AzureKeyCredential(key),
        logging_enable=True
    )

    # Load image to analyze into a 'bytes' object
    # with open("KakaoTalk_20241016_144939920.jpg", "rb") as f:
    image_data = image.read()

    visual_features = [
        VisualFeatures.TAGS,
    ]

    result = client.analyze(
        image_data=image_data,
        visual_features=visual_features,
        smart_crops_aspect_ratios=[0.9, 1.33],
        gender_neutral_caption=True,
        language="en"
    )

    analysis_results = {}

    # Collect analysis results
    # Print all analysis results to the console
    print("Image analysis results:")  

    if result.tags is not None:
        print(" Tags:")
        tags_list = []
        for tag in result.tags.list:
            print(f"   '{tag.name}', Confidence {tag.confidence:.4f}")
            tags_list.append({
                'name': tag.name,
                'confidence': tag.confidence
            })
        print(result.tags.list)
        analysis_results['Tags'] = tags_list
    
    print(analysis_results)
    return jsonify(analysis_results)

def test23(data):

    # 사진과 태그 정의 딕셔너리 초기화
    photos = {}

    # 데이터 변환
    for item in data:
        photo_name = f"{item['url']}"  # 이름 변환
        photos[photo_name] = item["metadata"]

    # 모든 태그를 평탄화하여 리스트로 변환
    all_tags = set(tag for tags in photos.values() for tag in tags)

    # TF-IDF 벡터화
    vectorizer = TfidfVectorizer()
    tfidf_matrix = vectorizer.fit_transform(all_tags)

    # 코사인 유사도 계산
    cosine_sim = cosine_similarity(tfidf_matrix)

    # 태그 간의 유사도를 사전 형태로 저장
    tag_similarities = defaultdict(list)

    # 태그 리스트
    tags_list = list(all_tags)

    # 유사도 기반으로 그룹화
    threshold = 0.5  # 유사도 임계값
    for i in range(len(tags_list)):
        for j in range(i + 1, len(tags_list)):
            if cosine_sim[i, j] > threshold:  # 임계값을 넘는 경우
                tag_similarities[tags_list[i]].append(tags_list[j])

    # 결과 출력
    grouped_tags = defaultdict(list)
    print("test")

    for tag, similar_tags in tag_similarities.items():
        # 유사한 태그를 포함하여 결과 그룹화
        grouped_tags[tag].extend(similar_tags)

    # 태그와 그에 해당하는 사진 출력
    final_tagged_photos = defaultdict(list)

    for tag, similar_tags in grouped_tags.items():
        all_relevant_tags = [tag] + similar_tags
        for photo, tags in photos.items():
            if any(t in all_relevant_tags for t in tags):
                final_tagged_photos[tag].append(photo)

    # 최종 결과 출력
    result = {}
    for tag, photo_list in final_tagged_photos.items():
        print(f"{tag}: {', '.join(photo_list)}")
        result[tag] = photo_list
    
    return result


@app.route('/')
def hello():
    return "Hello, Flask!"

@app.route('/analyze', methods=['POST'])
def analyze_image():
    if request.content_type.startswith('multipart/form-data'):
        image = request.files.get('file')
        return analyze_image_file(image)

@app.route('/tt', methods=['POST'])
def tt():
    # 메타데이터를 JSON 형식으로 수신
    data = request.form.get('metadata')  # FormData로 전송된 'metadata'를 가져옴

    if data:
        images_data = json.loads(data)  # JSON 문자열을 파이썬 객체로 변환
        return test23(images_data)
    else:
        return jsonify({"error": "No metadata found"}), 400
    



if __name__ == '__main__':
     app.run(host='0.0.0.0', port=5001) 
