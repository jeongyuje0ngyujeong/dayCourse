// src/pages/Town/Recommand/convex_hull.js

import React, { useState, useEffect } from 'react';
import { searchPubTransPath, storeZoneInRadius } from './requestTime';
import styled from "styled-components";
import { Button } from '../../../Button';
import { PageTitle } from '../../../commonStyles';

const Box = styled.div`
    width: 100%; /* 너비 조정 */
    height: 100%; /* 높이 조정 */
    background-color: 'white'; 
    border: 1px solid #ccc; 
    border-radius: 10px; /* 둥근 모서리 */
    margin-bottom: 10px; /* 여백 */
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1); /* 그림자 추가 */
    cursor: pointer;
    transition: transform 0.2s; /* 애니메이션 효과 */
    font-family: 'NPSfontBold', system-ui;
    font-size: 3vh;
    &:hover {
        transform: scale(1.05); /* 마우스 호버 시 확대 효과 */
    }

    border: ${({ isSelected }) => (isSelected ? '0.5vh solid #90B54C' : '1px solid #ccc')};

    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
`;
const Container = styled.div`
    flex: 1;
    display: flex;
    gap: 5px;
    margin-top: auto;
    height: 80%;
`;

const LoadingText = styled.div`
  display: inline-block;
  font-size: 5vh;
  color: #90B54C;

  .loading span {
    display: inline-block;
    margin: 0 0.3rem;
    animation: loading 0.7s infinite alternate;
  }

  .loading span:nth-child(2) {
    animation-delay: 0.1s;
  }

  .loading span:nth-child(3) {
    animation-delay: 0.2s;
  }

  .loading span:nth-child(4) {
    animation-delay: 0.3s;
  }

  .loading span:nth-child(5) {
    animation-delay: 0.4s;
  }

  .loading span:nth-child(6) {
    animation-delay: 0.5s;
  }

  .loading span:nth-child(7) {
    animation-delay: 0.6s;
  }

  @keyframes loading {
  0% {
    transform: translateY(0); /* 크기 확대 및 기본 위치 */
  }
  33% {
    transform: translateY(-2vh); /* 크기 축소 및 위로 튀는 효과 */
  }
  66% {
    transform: translateY(2vh); /* 크기 축소 및 위로 튀는 효과 */
  }
  100% {
    transform: translateY(0); /* 크기 확대 및 기본 위치 */
  }
}
`;
// 점 배열을 받아 볼록 다각형을 이루는 점 배열을 반환하는 함수
function getConvexHull(points) {
  if (points.length < 3) return points;

  // 점들을 y좌표 기준으로 정렬(같은 y면 x 기준으로 정렬)
  points.sort((a, b) => a[1] - b[1] || a[0] - b[0]);

  // 두 점을 기준으로 벡터의 회전 방향 확인
  const crossProduct = (o, a, b) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);

  const hull = [];

  // 하단 껍질 계산
  for (let point of points) {
    while (hull.length >= 2 && crossProduct(hull[hull.length - 2], hull[hull.length - 1], point) <= 0) {
      hull.pop();
    }
    hull.push(point);
  }

  // 상단 껍질 계산
  const lowerHullCount = hull.length;
  for (let i = points.length - 2; i >= 0; i--) {
    const point = points[i];
    while (hull.length > lowerHullCount && crossProduct(hull[hull.length - 2], hull[hull.length - 1], point) <= 0) {
      hull.pop();
    }
    hull.push(point);
  }

  // 마지막 점 중복 제거
  hull.pop();
  return hull;
}

function calculateCentroid(points) {
  if (points.length === 0) return [0, 0];
  else if (points.length < 3) {
    let sumX = 0;
    let sumY = 0;
    
    points.forEach(([x, y]) => {
        sumX += x;
        sumY += y;
    });

    const centerX = sumX / points.length;
    const centerY = sumY / points.length;

    return [centerX, centerY];
  } 

  let area = 0;
  let centroidX = 0;
  let centroidY = 0;

  for (let i = 0; i < points.length; i++) {
      const [x0, y0] = points[i];
      const [x1, y1] = points[(i + 1) % points.length];
      
      const crossProduct = x0 * y1 - x1 * y0;
      area += crossProduct;
      centroidX += (x0 + x1) * crossProduct;
      centroidY += (y0 + y1) * crossProduct;
  }

  area *= 0.5;
  centroidX /= (6 * area);
  centroidY /= (6 * area);

  return [centroidX, centroidY];
}

function calculateNextPosition(currentPosition, convexHull, weights) {
  let totalWeightedX = 0;
  let totalWeightedY = 0;
  let totalWeight = 0;

  // 각 convexHull 지점과 currentPosition 간의 이동 방향을 가중치를 적용해 계산
  for (let i = 0; i < convexHull.length; i++) {
      const [x, y] = convexHull[i];
      const weight = weights[i];

      // currentPosition과 convexHull[i] 간의 벡터
      const directionX = x - currentPosition[0];
      const directionY = y - currentPosition[1];
      const distance = Math.sqrt(directionX ** 2 + directionY ** 2);

      // 단위 벡터로 정규화 (거리 0일 경우 제외)
      if (distance > 0) {
          const unitX = directionX / distance;
          const unitY = directionY / distance;

          // 가중치를 곱한 벡터를 누적
          totalWeightedX += unitX * weight;
          totalWeightedY += unitY * weight;
          totalWeight += weight;
      }
  }

  // 이동 방향을 가중치로 평균화한 후, 너무 멀리 벗어나지 않도록 스케일 조정
  const averageDirectionX = (totalWeightedX / totalWeight) * 0.05; // 이동 비율을 줄임
  const averageDirectionY = (totalWeightedY / totalWeight) * 0.05;

  // nextPosition을 currentPosition에서 비율만큼 이동
  const nextPositionX = currentPosition[0] + averageDirectionX;
  const nextPositionY = currentPosition[1] + averageDirectionY;

  return [nextPositionX, nextPositionY];
}

function extractCoordinates(dataArray) {
    if (dataArray && dataArray.length > 0) {
        return dataArray.map(item => [parseFloat(item.x), parseFloat(item.y)]);
    }
    return []; // 빈 배열이나 유효하지 않은 데이터가 제공된 경우 빈 배열 반환
}

async function getAllRoutes(convexHull, centroid) {
  // 각 좌표와 targetPoint를 짝 지어 요청
  const pointsArray = convexHull.map(([x, y]) => [x, y, centroid[0], centroid[1]]);
  const promises = pointsArray.map(([sx, sy, ex, ey]) => 
      searchPubTransPath(sx, sy, ex, ey)
  );

  try {
    // 모든 요청이 완료될 때까지 대기하고 결과 배열 반환
    const results = await Promise.all(promises);
    return results;
  } catch (error) {
    console.error("Error fetching routes:", error);
    return []; // 오류가 발생한 경우 빈 배열 반환 또는 오류 처리 로직 추가
  }
}

const { kakao } = window;
const geocoder = new kakao.maps.services.Geocoder();

export default function ConvexHullCalculator({ departurePoints, onSelectTown, selectedButton}) {
    const [convexHull, setConvexHull] = useState([]); // 볼록다각형 꼭지점 좌표
    const [centroid, setCentroid] = useState([0, 0]); // 중간점 
    const [centroidAddress, setCentroidAddress] = useState('');
    const [resultTowns, setResultTown] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
      const coordinates = extractCoordinates(departurePoints);
      const hull = getConvexHull(coordinates);
      const calculatedCentroid = calculateCentroid(hull);
      
      setConvexHull(hull);
      setCentroid(calculatedCentroid);
    }, [departurePoints]);

    const calculateConvexHull = async () => {
      setResultTown([]);
      const fetchRoutes = async (temp_centroid) => {
          try {
              console.log('convexHull: ', convexHull, 'centroid: ', temp_centroid);
              const routes = await getAllRoutes(convexHull, temp_centroid);
              return routes;
          } catch (error) {
              console.error("Error fetching routes:", error);
              return null;
          }
      };
  
      const fetchTown = async (temp_centroid) => {
          let radius = 500; // 초기 반경 값 설정
          let towns = null;

          // Geocoding을 통해 좌표를 가져오는 함수
          // const getCoordinates = (name) => {
          //     return new Promise((resolve, reject) => {
          //         geocoder.addressSearch(name, (result, status) => {
          //             if (status === kakao.maps.services.Status.OK) {
          //                 const x = parseFloat(result[0].x);
          //                 const y = parseFloat(result[0].y);
          //                 resolve({ x, y });
          //             } else {
          //                 console.warn(`Geocoding failed for town: ${name}`);
          //                 resolve({ x: NaN, y: NaN }); // Geocoding 실패 시 NaN 반환
          //             }
          //         });
          //     });
          // };

          // 반경을 늘려가며 towns 길이가 3 이상일 때까지 반복
          while (radius <= 5000) {
              try {
                  console.log(`Fetching towns with radius: ${radius}`);
                  const result = await storeZoneInRadius(radius, temp_centroid[0], temp_centroid[1]);
                  console.log('store: ', result);
                  // towns = result.stores.map((town) => town.상권명.split('_')[0]) 
                  // .filter((value, index, self) => self.indexOf(value) === index) 
                  towns = result.stores.reduce((acc, town) => {
                    const 지역명 = town.상권명.split('_')[0];
                    if (!acc.some((item) => item.상권명.split('_')[0] === 지역명)) {
                        acc.push({
                          상권명: 지역명, 
                          centroid_x: town.centroid_x,
                          centroid_y: town.centroid_y
                        });
                    }
                    return acc;
                  }, []);
                  
                  console.log('왜 안 나와: ',towns);
  
                  if (towns && towns.length >= 3) { // 조건 만족 시 반복 종료
                      setResultTown(towns);
                      break;
                  }
              } catch (error) {
                  console.error("Error fetching town:", error);
              } 

              radius += 500; // 반경을 점진적으로 증가
          }
          setLoading(false);
          return towns;
      };
  
      if (centroid[0] !== 0 || centroid[1] !== 0) {
        let temp_centroid = centroid;
        let temp_timeVector = [];
        let optimalCentroid = temp_centroid;
        let minTimeDifference = Infinity;

        setLoading(true);
        for (let count = 0; count < 5; count++) {
            console.log(count);
            temp_timeVector = await fetchRoutes(temp_centroid);

            if (!temp_timeVector || temp_timeVector.length === 0) {
                console.log('no timeVector break');
                break;
            }

            const minTime = Math.min(...temp_timeVector);
            const maxTime = Math.max(...temp_timeVector);
            const timeDifference = maxTime - minTime;

            console.log(temp_timeVector);
            if (timeDifference < minTimeDifference) {
                minTimeDifference = timeDifference;
                optimalCentroid = temp_centroid;
            }

            if (timeDifference <= minTime / 3) {
                console.log("find good town break");
                break;
            }

            const nextPosition = calculateNextPosition(temp_centroid, convexHull, temp_timeVector);

            const epsilon = 0.0001;
            if (Math.abs(nextPosition[0] - temp_centroid[0]) < epsilon && Math.abs(nextPosition[1] - temp_centroid[1]) < epsilon) {
                console.log(count, 'not updated');
                break;
            }

            temp_centroid = nextPosition;
            setCentroid(nextPosition);
        }

        // 루프 완료 후 최적의 centroid로 fetchTown 호출
        await fetchTown(optimalCentroid);
        setCentroid(optimalCentroid);

        const coords = new kakao.maps.LatLng(optimalCentroid[1], optimalCentroid[0]);
        searchDetailAddrFromCoords(coords, (result, status) => {
            if (status === kakao.maps.services.Status.OK) {
                setCentroidAddress(result[0].address.address_name);
            }
        });
      }
    }

    // 상세주소 
    const searchDetailAddrFromCoords = (coords, callback) => {
        geocoder.coord2Address(coords.getLng(), coords.getLat(), callback);
    };
 
    return (
        <div style={{display:'flex', width:'100%', flexDirection:'column'}}>
          <div style={{ display: 'flex', flex:'0', justifyContent: 'space-between', alignItems:'center'}}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems:'center', gap: '1rem'}}>
              <PageTitle style={{fontSize:'3vh'}}>추천지역</PageTitle>
              {centroidAddress && <p>중간 지점 | {centroidAddress}</p>}
            </div>
            <Button onClick={calculateConvexHull} style={{height: '3rem', width:'15vh',fontSize:'2vh', color:'white'}} $background='#90B54C'>지역 추천 받기</Button>
          </div>
          
          <Container>
            {resultTowns && resultTowns.length > 0 ? (
              resultTowns.slice(0, 3).map((town, index) => (
                <Box 
                  key={index} 
                  onClick={() => onSelectTown(town, index)}
                  isSelected={selectedButton === index}
                >
                    {town.상권명}
                </Box>
              ))
            ) : loading ? (
              <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" height="100%">
              <LoadingText>
                <div className="loading">
                  <span>추 </span>
                  <span>천 </span>
                  <span>지 </span>
                  <span>역 </span>
                  <span>탐 </span>
                  <span>색 </span>
                  <span>중 </span>
                </div>
              </LoadingText>
              </Box>
            ) : null}
          </Container>
        </div>
    );
}