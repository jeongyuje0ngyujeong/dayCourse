from flask import Flask, request, jsonify
import os
import sys
import logging
import json
import pandas as pd
import numpy as np
import pickle
import simplejson as json #확인
from azure.ai.vision.imageanalysis import ImageAnalysisClient
from azure.ai.vision.imageanalysis.models import VisualFeatures
from azure.core.credentials import AzureKeyCredential

from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity, linear_kernel
from sklearn.cluster import KMeans
from collections import defaultdict, Counter

os.environ["LOKY_MAX_CPU_COUNT"] = "4"


app = Flask(__name__)
UPLOAD_FOLDER = 'uploads'
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# GloVe 모델 로드
with open('./glove_model.pkl', 'rb') as f:
    model = pickle.load(f)

# 파일 경로 지정
file_path = './output.csv'

# CSV 파일 읽기
data = pd.read_csv(file_path)

# 결측치 처리
data['rating'] = data['rating'].fillna(data['rating'].mean())
data['tag1'] = data['tag1'].fillna('')
data['tag2'] = data['tag2'].fillna('')
data['tag3'] = data['tag3'].fillna('')


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

    visual_features = [
        VisualFeatures.TAGS,
    ]

    result = client.analyze_from_url(
        image_url=image,
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
        analysis_results['Tags'] = tags_list
    
    return jsonify(analysis_results)


@app.route('/')
def hello():
    return "Hello, Flask!"

@app.route('/analyze', methods=['POST'])
def analyze_image():
    if request.content_type.startswith('multipart/form-data'):
        image = request.form.get('imageUrl')
        return analyze_image_file(image)

@app.route('/cluster', methods=['POST'])
def cluster_objects2():
    print("요청들어옴.")
    
    # 요청에서 이미지 리스트를 가져옴
    img_list1 = request.json.get('images', [])
    
    # 태그 벡터화
    tag_vectors = []
    for obj in img_list1:
        vectors = [model[tag] for tag in obj["metadata"] if tag in model]
        if vectors:
            avg_vector = np.mean(vectors, axis=0)  # 평균 벡터 계산
            tag_vectors.append({
                "url": obj["url"],
                "metadata": obj["metadata"],
                "planId": obj["planId"],
                "vector": avg_vector,
            })
    
    # K-means 클러스터링 수행
    X = np.array([item["vector"] for item in tag_vectors])
    n_clusters = min(8, len(item))
    kmeans = KMeans(n_clusters=n_clusters, random_state=0)
    labels = kmeans.fit_predict(X)
    
    # 클러스터링 결과 해석 및 객체 그룹화
    clustered_objects = {i: [] for i in range(n_clusters)}
    for item, label in zip(tag_vectors, labels):
        clustered_objects[label].append({
            "url": item["url"],
            "planId": item["planId"],
            "metadata": item["metadata"],
        })

    # 클러스터의 핵심 태그 찾기 (빈도수 기반)
    core_tags = {}
    used_tags = set()
    for cluster_id, obj_list in clustered_objects.items():
        # 해당 클러스터의 모든 태그 수집
        tag_list = []
        for obj in obj_list:
            obj_tags = obj["metadata"]
            tag_list += obj_tags.strip().split(',')
        
        # 빈도 수로 태그 정렬 후 사용되지 않은 태그 중 가장 빈도 높은 태그 선택
        if tag_list:
            tag_counts = Counter(tag_list)
            most_common_tag = None
            for tag, _ in tag_counts.most_common():
                if tag not in used_tags:
                    most_common_tag = tag
                    used_tags.add(tag)
                    break
            core_tags[cluster_id] = most_common_tag
        else:
            core_tags[cluster_id] = '123456'  # 태그가 없는 경우

    # 결과 반환
    result = {
        'clusters': {cluster_id: {
            'objects': obj_list,
            'core_tag': core_tags[cluster_id],
        } for cluster_id, obj_list in clustered_objects.items()}
    }
    
    return jsonify(result)

def get_user_profile_vector(datas, visited_stores, tfidf_matrix):
    # visited_stores는 사용자가 방문한 가게들의 LocationName 목록 (예: ['Store1', 'Store2', 'Store3'])
    visited_indices = datas[datas['LocationName'].isin(visited_stores)].index

    # 각 가게들의 combined_features 벡터를 합성(평균)하여 사용자 벡터 생성
    user_vector = np.zeros((tfidf_matrix.shape[1],))  # TF-IDF 행렬의 열 수로 초기화
    for idx in visited_indices:
        # 가게의 combined_features 벡터를 TF-IDF로 벡터화한 값에 접근
        user_vector += tfidf_matrix[idx].toarray().flatten()  # 벡터의 합
    user_vector /= len(visited_indices)  # 평균값을 구함
    
    return user_vector


def custom_serializer(obj):
    # Handle NaN and Inf values
    if isinstance(obj, float):
        if np.isnan(obj):  # Check for NaN values
            return None  # Replace NaN with None or a specific value of your choice
        elif obj == float('inf') or obj == float('-inf'):  # Check for Infinity values
            return None  # Replace Inf with None or a specific value of your choice
    # Handle pandas Timestamps (if applicable)
    elif isinstance(obj, pd.Timestamp):
        return obj.isoformat()  # Convert pandas Timestamp to ISO string
    # Handle None explicitly (if needed)
    elif obj is None:
        return None  # Return None as it is
    # For other objects, convert them to string
    return str(obj)

@app.route('/SpotSuggest', methods=['POST'])
def SpotSuggest():
    locations = request.json.get('locations', [])
    text = request.json.get('text')
    category = locations[0]['category']
    keyword = locations[0]['keyword']

    #print(locations)

    visited_stores = [location['LocationName'] for location in locations]

    if text == "k":
        data_text = "combined_features_k"
        datas = data[data['keyword'].str.contains(keyword)].copy().reset_index(drop=True)
    elif text == "c":
        data_text = "combined_features_c"
        datas = data[data['category'].str.contains(category)].copy().reset_index(drop=True)
    else:
        data_text = "combined_features_a"  # 기본 값
        datas = data.copy()
    
    # 필요한 피처 결합
    datas['combined_features_a'] = datas['category'] + ' ' + datas['keyword'] + ' ' + datas['tag1'] + ' ' + datas['tag2'] + ' ' + datas['tag3']
    datas['combined_features_c'] = datas['keyword'] + ' ' + datas['tag1'] + ' ' + datas['tag2'] + ' ' + datas['tag3']
    datas['combined_features_k'] = datas['tag1'] + ' ' + datas['tag2'] + ' ' + datas['tag3']

    print(data_text)
    print(datas[data_text])

    if datas[data_text].isin(["  ", "   ", "    "]).all():
        # 상위 20개 스토어 데이터프레임 반환
        recommendations = datas[0:20]
        
        # 필드를 삭제
        del recommendations['combined_features_a']
        del recommendations['combined_features_c']
        del recommendations['combined_features_k']

        test = recommendations.to_dict(orient='records')
        
        for item in test:
            for key, value in item.items():
                if isinstance(value, float) and np.isnan(value):  # 값이 NaN인 경우
                    item[key] = None  # 해당 값을 None으로 수정
                    
        output_json = json.dumps(test, default=custom_serializer, ensure_ascii=False)
        return output_json
    else:        
        # TF-IDF 벡터화
        tfidf_vectorizer = TfidfVectorizer(stop_words='english')
        tfidf_matrix = tfidf_vectorizer.fit_transform(datas[data_text])

        # 사용자가 방문한 가게들의 벡터 평균 구하기
        user_vector = get_user_profile_vector(datas, visited_stores, tfidf_matrix)

        # 사용자 벡터와 다른 가게들의 벡터 간 코사인 유사도 계산
        user_similarities = linear_kernel(tfidf_matrix, user_vector.reshape(1, -1)).flatten()

        # 유사도가 높은 상위 20개의 가게 추천
        sim_scores = [(i, score) for i, score in enumerate(user_similarities)]
        sim_scores = sorted(sim_scores, key=lambda x: x[1], reverse=True)
        sim_scores = sim_scores[0:20]

        # 인덱스 리스트 만들기
        store_indices = [i[0] for i in sim_scores]

        # 상위 데이터프레임 반환
        recommendations = datas.iloc[store_indices]
        
        # 필드를 삭제
        del recommendations['combined_features_a']
        del recommendations['combined_features_c']
        del recommendations['combined_features_k']

        test = recommendations.to_dict(orient='records')
        
        for item in test:
            for key, value in item.items():
                if isinstance(value, float) and np.isnan(value):  # 값이 NaN인 경우
                    item[key] = None  # 해당 값을 None으로 수정
        #print(test)
                    
        output_json = json.dumps(test, default=custom_serializer, ensure_ascii=False)
        return output_json

if __name__ == '__main__':
     app.run(host='0.0.0.0', port=5000) 
