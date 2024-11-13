from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
from bs4 import BeautifulSoup
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.common.action_chains import ActionChains
 
import time
import csv
import re

# 브라우저 자동 꺼짐 방지 옵션
chrome_options = Options()
chrome_options.add_experimental_option("detach", True)

# 브라우저 실행
driver = webdriver.Chrome(options=chrome_options)

# 페이지 로딩이 완료될 때까지 기다리는 코드 - 3초 설정
driver.implicitly_wait(3)

# url 설정 및 접속
url = "https://map.naver.com"
driver.get(url)

search_box = driver.find_element(By.CLASS_NAME, "input_search")
search_box.send_keys("강남역 음식점")
search_box.send_keys(Keys.RETURN)

# 특정 요소가 모두 로드되기 전에 검색창이나 검색 버튼만 준비될 수도 있기 때문에 implicitly_wait이 아니라 time.sleep으로 전체 로딩이 될 때까지 기다렸다가 진행
time.sleep(3.3)


def switch_left():
    driver.switch_to.parent_frame()
    iframe = driver.find_element(By.XPATH, '//*[@id="searchIframe"]')
    driver.switch_to.frame(iframe)


def switch_right():
    driver.switch_to.parent_frame()
    iframe = driver.find_element(By.XPATH, '//*[@id="entryIframe"]')
    driver.switch_to.frame(iframe)


with open('store_data.csv', mode='w', newline='', encoding='utf-8') as file:
    writer = csv.writer(file)
    writer.writerow(["Store Name", "Category", "Visitor Review Counts", "Blog Review Counts", "Address", "Rating", "Review Texts"])

    request_cnt = 0
    max_requests = 300
    wait_time = 600

    while True:
        switch_left()

        # 무한 루프이므로 다음 페이지가 없다면 반복문을 중단해야 함
        next_page = driver.find_element(By.XPATH,'//*[@id="app-root"]/div/div[2]/div[2]/a[7]').get_attribute('aria-disabled')
        if(next_page == 'true'):
            break

        # 맨 밑까지 스크롤, 가게 목록 전체 로딩
        scrollable_element = driver.find_element(By.CLASS_NAME, "Ryr1F")
        last_height = driver.execute_script("return arguments[0].scrollHeight", scrollable_element)
    
        while True:
            # 요소 내에서 아래로 600px 스크롤
            driver.execute_script("arguments[0].scrollTop += 600;", scrollable_element)
    
            # 페이지 로드를 기다림
            time.sleep(2.1)
    
            # 새 높이 계산
            new_height = driver.execute_script("return arguments[0].scrollHeight", scrollable_element)
    
            # 스크롤이 더 이상 늘어나지 않으면 루프 종료
            if new_height == last_height:
                break
    
            last_height = new_height
        
        # 현재 page에 등록된 모든 가게 조회
        page_no = driver.find_element(By.XPATH,'//a[contains(@class, "mBN2s qxokY")]').text
    
        elements = []
        # 첫페이지 광고 2개 때문에 첫페이지는 앞 2개를 빼야함
        elemets = driver.find_elements(By.XPATH,'//*[@id="_pcmap_list_scroll_container"]//li')

        print('현재 ' + '\033[95m' + str(page_no) + '\033[0m' + ' 페이지 / '+ '총 ' + '\033[95m' + str(len(elemets)) + '\033[0m' + '개의 가게를 찾았습니다.\n')
    
        for index, e in enumerate(elemets, start=1):
            # 각 가게의 상세 페이지로 이동
            e.find_element(By.CLASS_NAME,'CHC5F').find_element(By.XPATH, ".//a/div/div/span").click()
            time.sleep(3.4)

            switch_right()

            # BeautifulSoup을 사용하여 HTML 파싱
            soup = BeautifulSoup(driver.page_source, "html.parser")
            print(soup.prettify())

            # 가게 이름 추출
            store_name = soup.select_one("div.zD5Nm.undefined span").get_text(strip=True)
            print("Store Name:", store_name)
            
            # 카테고리 추출
            category = soup.select_one("div.zD5Nm.undefined span:nth-of-type(2)").get_text(strip=True)
            print("Category:", category)
            
            # 방문자 리뷰 수 추출
            visitor_review_tag = soup.select_one("a[href*='/review/visitor']")
            visitor_review_text = visitor_review_tag.get_text(strip=True) if visitor_review_tag else "N/A"
            visitor_review_count = re.search(r'\d+', visitor_review_text.replace(',', '')).group() if visitor_review_text != "N/A" else "N/A"
            print("Visitor Review Count:", visitor_review_count)

            # 블로그 리뷰 수 추출
            blog_review_tag = soup.select_one("a[href*='/review/ugc']")
            blog_review_text = blog_review_tag.get_text(strip=True) if blog_review_tag else "N/A"
            blog_review_count = re.search(r'\d+', blog_review_text.replace(',', '')).group() if blog_review_text != "N/A" else "N/A"
            print("Blog Review Count:", blog_review_count)

            # 가게 주소 추출
            address_tag = soup.select_one("span.LDgIH")  # 주소가 들어있는 span 태그의 클래스명을 사용
            address = address_tag.get_text(strip=True) if address_tag else "N/A"
            print("Address:", address)
            
            # 별점 추출
            rating_tag = soup.select_one("div.dAsGb span.PXMot.LXIwF")
            rating_text = rating_tag.get_text(strip=True) if rating_tag else "N/A"
            rating = re.search(r'\d+\.\d+', rating_text).group() if rating_text != "N/A" else "N/A"
            print("Rating:", rating)

            
            # 리뷰 텍스트와 리뷰 카운트 추출
            review_texts = []

            ul_tag = soup.select_one("div.KERaF ul.K4J9r")
            print(ul_tag)

            # ul 태그가 있을 때만 li 태그 접근 시도
            if ul_tag:
                # 모든 li 태그를 찾기
                li_tags = ul_tag.find_all("li", class_="MHaAm")
                for li in li_tags:
                    # 리뷰 텍스트 추출
                    review_text_tag = li.find("span", class_="t3J5f")
                    review_text = review_text_tag.get_text(strip=True) if review_text_tag else "N/A"
                    print(f"Review Text: {review_text}")

            # CSV 파일에 추출한 데이터 저장
            writer.writerow([store_name, category, visitor_review_count, blog_review_count, address, rating, "; ".join(review_texts)])
    
            switch_left()
            time.sleep(2.6)

            request_cnt += 1

            if request_cnt >= max_requests:
                print(f"{max_requests}회 요청을 완료했습니다. {wait_time / 60}분 동안 대기합니다.")
                time.sleep(wait_time)
                request_cnt = 0   
            
        # 페이지 다음 버튼이 활성화 상태일 경우 계속 진행
        if(next_page == 'false'):
            driver.find_element(By.XPATH,'//*[@id="app-root"]/div/div[3]/div[2]/a[7]').click()
        # 아닐 경우 루프 정지
        else:
            loop = False