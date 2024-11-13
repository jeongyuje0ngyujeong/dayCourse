from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.common.action_chains import ActionChains

import time
import csv
import re

# 브라우저 자동 꺼짐 방지 옵션
chrome_options = Options()
chrome_options.add_experimental_option("detach", True)
chrome_options.add_argument("--start-maximized")  # 창 최대화 (선택 사항)

# 브라우저 실행 (Selenium 4 이상에서는 드라이버 경로 지정 불필요)
driver = webdriver.Chrome(options=chrome_options)

# 페이지 로딩이 완료될 때까지 기다리는 코드 - 암묵적 대기
driver.implicitly_wait(8)  # 10초로 늘리는 것도 고려해보세요

# url 설정 및 접속
url = "https://map.naver.com"
driver.get(url)

# 검색창 찾기 및 검색어 입력
search_box = WebDriverWait(driver, 8).until(
    EC.presence_of_element_located((By.CLASS_NAME, "input_search"))
)
search_box.send_keys("강남역 쇼핑몰")
search_box.send_keys(Keys.RETURN)

# 페이지 로딩 대기
time.sleep(3.3)


def switch_left():
    driver.switch_to.default_content()
    iframe = WebDriverWait(driver, 10).until(
        EC.presence_of_element_located((By.XPATH, '//*[@id="searchIframe"]'))
    )
    driver.switch_to.frame(iframe)

def switch_right():
    driver.switch_to.default_content()
    iframe = WebDriverWait(driver, 10).until(
        EC.presence_of_element_located((By.XPATH, '//*[@id="entryIframe"]'))
    )
    driver.switch_to.frame(iframe)


with open('shopping.csv', mode='w', newline='', encoding='utf-8') as file:
    writer = csv.writer(file)
    writer.writerow(["Store Name", "Category", "Visitor Review Counts", "Blog Review Counts", "Address", "Rating", "Review Texts"])

    request_cnt = 0
    max_requests = 300
    wait_time = 600

    while True:
        switch_left()

        # 다음 페이지 버튼 상태 확인
        try:
            # next_page = driver.find_element(By.XPATH, '//*[@id="app-root"]/div/div[2]/div[2]/a[4]').get_attribute('aria-disabled')
            next_page = driver.find_element(By.XPATH, '//*[@id="app-root"]/div/div[2]/div[2]/a[7]').get_attribute('aria-disabled')
            if next_page == 'true': 
                break
        except:
            print("다음 페이지 버튼을 찾을 수 없습니다.")
            break

        # 맨 아래까지 스크롤하여 가게 목록 전체 로딩
        scrollable_element = driver.find_element(By.CLASS_NAME, "Ryr1F")
        # last_height = driver.execute_script("return arguments[0].scrollHeight", scrollable_element)
        last_height = driver.execute_script("return arguments[0].scrollTop;", scrollable_element)
        
        while True:
            # 요소 내에서 아래로 600px 스크롤
            driver.execute_script("arguments[0].scrollTop += 600;", scrollable_element)
    
            # 페이지 로드를 기다림
            time.sleep(2)
    
            # 새 높이 계산
            # new_height = driver.execute_script("return arguments[0].scrollHeight", scrollable_element)
            new_height = driver.execute_script("return arguments[0].scrollTop;", scrollable_element)

            # driver.execute_script("arguments[0].scrollBy(0, arguments[0].scrollHeight);", scrollable_element)
            # time.sleep(2)
            
            # new_height = driver.execute_script("return arguments[0].scrollHeight", scrollable_element)
            # print(f"Last height: {last_height}, New height: {new_height}")

            # 스크롤이 더 이상 늘어나지 않으면 루프 종료
            if new_height == last_height:
                break
    
            last_height = new_height

        # 현재 페이지 번호 추출
        try:
            page_no = driver.find_element(By.XPATH, '//a[contains(@class, "mBN2s qxokY")]').text
        except:
            page_no = "N/A"

        elements = []
        # 첫 페이지 광고 2개 때문에 첫 페이지는 앞 2개를 빼야함
        try:
            elemets = driver.find_elements(By.XPATH, '//*[@id="_pcmap_list_scroll_container"]//li')
            # 광고 요소 제거 (예: 첫 2개)
            if page_no == "1":
                elemets = elemets[2:]
        except:
            elemets = []

        print(f'현재 \033[95m{page_no}\033[0m 페이지 / 총 \033[95m{len(elemets)}\033[0m개의 가게를 찾았습니다.\n')
    
        for index, e in enumerate(elemets, start=1):
            try:
                # 각 가게의 상세 페이지로 이동
                # e.find_element(By.CLASS_NAME, 'CHC5F').find_element(By.XPATH, ".//a/div/div/span").click()
                # e.find_element(By.CLASS_NAME, 'Np1CD').click()
                e.find_element(By.CLASS_NAME, 'qbGlu').click()
                
                time.sleep(3.4)

                switch_right()

                # WebDriverWait을 사용하여 요소가 로드될 때까지 대기
                wait = WebDriverWait(driver, 10)

                # 가게 이름 추출
                store_name = wait.until(
                    EC.presence_of_element_located((By.CSS_SELECTOR, "div.zD5Nm.undefined span"))
                ).text.strip()
                print("Store Name:", store_name)
                
                # 카테고리 추출
                category = driver.find_elements(By.CSS_SELECTOR, "div.zD5Nm.undefined span")
                category = category[1].text.strip() if len(category) > 1 else "N/A"
                print("Category:", category)
                
                # 방문자 리뷰 수 추출
                try:
                    visitor_review_tag = driver.find_element(By.CSS_SELECTOR, "a[href*='/review/visitor']")
                    visitor_review_text = visitor_review_tag.text.strip()
                    visitor_review_count = re.search(r'\d+', visitor_review_text.replace(',', '')).group()
                except:
                    visitor_review_count = "N/A"
                print("Visitor Review Count:", visitor_review_count)

                # 블로그 리뷰 수 추출
                try:
                    blog_review_tag = driver.find_element(By.CSS_SELECTOR, "a[href*='/review/ugc']")
                    blog_review_text = blog_review_tag.text.strip()
                    blog_review_count = re.search(r'\d+', blog_review_text.replace(',', '')).group()
                except:
                    blog_review_count = "N/A"
                print("Blog Review Count:", blog_review_count)

                # 가게 주소 추출
                try:
                    address = driver.find_element(By.CSS_SELECTOR, "span.LDgIH").text.strip()
                except:
                    address = "N/A"
                print("Address:", address)
                
                # 별점 추출
                try:
                    rating_text = driver.find_element(By.CSS_SELECTOR, "div.dAsGb span.PXMot.LXIwF").text.strip()
                    rating = re.search(r'\d+\.\d+', rating_text).group()
                except:
                    rating = "N/A"
                print("Rating:", rating)

                # 오른쪽 프레임 스크롤 다운
                scrollable_element = driver.find_element(By.CSS_SELECTOR, 'html')
                last_height = driver.execute_script("return arguments[0].scrollHeight", scrollable_element)
            
                while True:
                    # 요소 내에서 아래로 600px 스크롤
                    driver.execute_script("arguments[0].scrollTop += 1200;", scrollable_element)
            
                    # 페이지 로드를 기다림
                    time.sleep(2.1)
            
                    # 새 높이 계산
                    new_height = driver.execute_script("return arguments[0].scrollHeight", scrollable_element)
            
                    # 스크롤이 더 이상 늘어나지 않으면 루프 종료
                    if new_height == last_height:
                        break
            
                    last_height = new_height

                # 리뷰 텍스트 추출
                review_texts = []
                try:
                    ul_tag = driver.find_element(By.CSS_SELECTOR, "ul.K4J9r")
                    all_text = ul_tag.text
                    
                    # 줄 단위로 분리
                    lines = all_text.splitlines()
                    print(lines)
                    
                    # 각 줄에서 리뷰 텍스트만 필터링하여 저장
                    for i in range(len(lines)):
                        if i % 3 == 0:
                            keyword = lines[i]
                            review_texts.append(keyword)
                            print("Extracted Keyword: ", keyword)
                except:
                    print("리뷰 텍스트를 찾을 수 없습니다.")

                # CSV 파일에 추출한 데이터 저장
                writer.writerow([store_name, category, visitor_review_count, blog_review_count, address, rating, "; ".join(review_texts)])
    
                switch_left()
                time.sleep(2.6)

                request_cnt += 1

                if request_cnt >= max_requests:
                    print(f"{max_requests}회 요청을 완료했습니다. {wait_time / 60}분 동안 대기합니다.")
                    time.sleep(wait_time)
                    request_cnt = 0   

            except Exception as ex:
                print(f"가게 정보를 추출하는 중 오류가 발생했습니다: {ex}")
                switch_left()
                time.sleep(2.6)
                continue  # 다음 가게로 넘어가기

        # 페이지 다음 버튼이 활성화 상태일 경우 계속 진행
        if next_page == 'false':
            try:
                driver.find_element(By.XPATH, '//*[@id="app-root"]/div/div[2]/div[2]/a[7]').click()
                time.sleep(2)  # 페이지 전환 대기
            except:
                print("다음 페이지 버튼을 클릭할 수 없습니다.")
                break
        else:
            break  # 다음 페이지가 없으므로 루프 종료
        # break

# 크롤링 완료 후 브라우저 닫기 (선택 사항)
driver.quit()