import React, { useState, useEffect } from 'react';
import {searchPubTransPath, storeZoneInRadius} from './requestTime';
import styled from "styled-components";
import {Button} from '../../../Button';
import {PageTitle} from '../../../commonStyles';

const Box = styled.div`
    width: 100%; /* 너비 조정 */
    height: 100%; /* 높이 조정 */
    background-color: white; /* 배경색을 흰색으로 설정 */
    border: 1px solid #ccc; /* 경계선 추가 */
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
  // else if (points.length === 1) return points;
  else if (points.length < 3)
  {
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

export default function ConvexHullCalculator({departurePoints}) {
    // const [points, setPoints] = useState([]);  
    const [convexHull, setConvexHull] = useState([]); // 볼록다각형 꼭지점 좌표
    const [centroid, setCentroid] = useState([0, 0]); // 중간점 
    const [centroidAddress, setCentroidAddress] = useState('');
    // const [pairVector, setPairVector] = useState([]);
    // const [timeVector, setTimeVector] = useState([]);
    const [resultTowns, setResultTown] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
      const coordinates = extractCoordinates(departurePoints);
      const hull = getConvexHull(coordinates);
      const calculatedCentroid = calculateCentroid(hull);
      
      // setPoints(coordinates);
      setConvexHull(hull);
      setCentroid(calculatedCentroid);
      // setPairVector(pairCoordinatesWithTarget(hull, calculatedCentroid));
    }, [departurePoints]);

    const calculateConvexHull = async () => {
      setResultTown([]);
      const fetchRoutes = async (temp_centroid) => {
          try {
              console.log('convexHull: ', convexHull, 'centroid: ', temp_centroid);
              const routes = await getAllRoutes(convexHull, temp_centroid);
              // setTimeVector(routes);
              return routes;
          } catch (error) {
              console.error("Error fetching routes:", error);
              return null;
          }
      };
  
      const fetchTown = async (temp_centroid) => {
          let radius = 500; // 초기 반경 값 설정
          let towns = null;

          // 반경을 늘려가며 towns 길이가 3 이상일 때까지 반복
          while (radius <= 5000) {
              try {
                  console.log(`Fetching towns with radius: ${radius}`);
                  const result = await storeZoneInRadius(radius, temp_centroid[0], temp_centroid[1]);
                  towns = result.stores.map((town) => town.상권명.split('_')[0]) // '_' 기준으로 지역명만 추출
                  .filter((value, index, self) => self.indexOf(value) === index) // 중복된 지역 제거
                  console.log('result: ',towns)
  
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

    // useEffect(() => {
        // if (centroid[0] !== 0 || centroid[1] !== 0) {
        //   // LatLng 객체로 변환하여 Kakao API의 coord2Address 메서드에 전달
        //   const coords = new kakao.maps.LatLng(centroid[1], centroid[0]);
        //   searchDetailAddrFromCoords(coords, (result, status) => {
        //     if (status === kakao.maps.services.Status.OK) {
        //       setCentroidAddress(result[0].address.address_name);
        //     }
        //   })
        //   const fetchRoutes = async () => {
        //     try {
        //         const routes = await getAllRoutes(points, centroid);
        //         setPairVector(routes); // 결과를 상태로 설정
        //     } catch (error) {
        //         console.error("Error fetching routes:", error);
        //     }
        //   };
        //   fetchRoutes();
        // }
      // }, [centroid]);

      
    //지역 주소

    // const searchAddrFromCoords = (coords, callback) => {
    //     geocoder.coord2RegionCode(coords.getLng(), coords.getLat(), callback);
    // };

    // useEffect(() => {
    //     if (centroid[0] !== 0 || centroid[1] !== 0) {
    //       // LatLng 객체로 변환하여 Kakao API의 coord2Address 메서드에 전달
    //       const coords = new kakao.maps.LatLng(centroid[1], centroid[0]);
    //       searchAddrFromCoords(coords, (result, status) => {
    //         if (status === kakao.maps.services.Status.OK) {
    //           setCentroidAddress(result[0].address_name);
    //         }
    //       });
    //       const fetchRoutes = async () => {
    //         try {
    //             const routes = await getAllRoutes(points, centroid);
    //             setPairVector(routes); // 결과를 상태로 설정
    //         } catch (error) {
    //             console.error("Error fetching routes:", error);
    //         }
    //       };
    //       fetchRoutes();
    //     }
    // }, [centroid]);

    return (
        <div style={{display:'flex', width:'100%', flexDirection:'column'}}>
          <div style={{ display: 'flex', flex:'0', justifyContent: 'space-between', alignItems:'center' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems:'center', gap: '1rem'}}>
              <PageTitle style={{marginTop: '1rem', fontSize:'3vh'}}>추천지역</PageTitle>
              {centroidAddress && <p>중간 지점 | {centroidAddress}</p>}
            </div>
            <Button onClick={calculateConvexHull} style={{height: '3rem', width:'8rem'}}>지역 추천 받기</Button>
          </div>
          
          {/* <Container>
              <Box>추천지역1</Box>
              <Box>추천지역2</Box>
              <Box>추천지역3</Box>
            {resultTowns.slice(0, 3).map((town, index) => (
              <Box key={index}>
                {town.mainTrarNm} 
              </Box>
            ))}
          </Container> */}
          <Container>
            {resultTowns && resultTowns.length > 0 ? (
              resultTowns.slice(0, 3).map((town, index) => (
                <Box key={index}>
                  {town}
                </Box>
              ))
            ) : loading ? (
              <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" height="100%">
                <p>추천 지역을 탐색중입니다</p>
              </Box>
            ) : null}
          </Container>
        </div>
    );
};
