from flask import Flask, request, jsonify
import os
import sys
import logging
import json
import pandas as pd
import numpy as np
import pickle
from azure.ai.vision.imageanalysis import ImageAnalysisClient
from azure.ai.vision.imageanalysis.models import VisualFeatures
from azure.core.credentials import AzureKeyCredential

from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity, linear_kernel
from sklearn.cluster import KMeans
from collections import defaultdict, Counter

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
        image = request.form.get('imageUrl')
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
    n_clusters = 8
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

def get_recommendations(cosine_sim, idx, datas):

    # 해당 스토어와 모든 스토어 간의 유사도 가져오기
    sim_scores = list(enumerate(cosine_sim[idx]))

    # 유사도에 따라 스토어 정렬
    sim_scores = sorted(sim_scores, key=lambda x: x[1], reverse=True)

    # 상위 10개 스토어 인덱스 가져오기
    sim_scores = sim_scores[1:11]

    # 인덱스 리스트 만들기
    store_indices = [i[0] for i in sim_scores]

    # 상위 10개 스토어 데이터프레임 반환
    return datas.iloc[store_indices]


@app.route('/SpotSuggest', methods=['POST'])
def SpotSuggest():
    locations = request.json.get('locations', [])
    text = request.json.get('text')

    LocationName = locations[0]['LocationName']
    addressFull = locations[0]['addressFull']
    category = locations[0]['category']
    keyword = locations[0]['keyword']

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

    # TF-IDF 벡터화
    tfidf_vectorizer = TfidfVectorizer(stop_words='english')
    tfidf_matrix = tfidf_vectorizer.fit_transform(datas[data_text])

    # 코사인 유사도 행렬 계산
    cosine_sim = linear_kernel(tfidf_matrix, tfidf_matrix)

    #입력된 스토어의 인덱스 찾기
    idx = datas[datas['LocationName'] == LocationName].index[0]
    
    recommendations = get_recommendations(cosine_sim, idx, datas)
    return jsonify(recommendations.to_dict(orient='records'))

if __name__ == '__main__':
     app.run(host='0.0.0.0', port=5000) 
