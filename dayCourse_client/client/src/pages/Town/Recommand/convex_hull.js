import React, { useState, useEffect } from 'react';
import {searchPubTransPath, storeZoneInRadius} from './requestTime';

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
  let sumWeightedVectors = { x: 0, y: 0 };
  let totalWeight = 0;

  convexHull.forEach((pos, index) => {
      const weight = weights[index];

      // Vector from current position to user position
      const vector = {
          x: pos[0] - currentPosition[0], // currentPosition을 배열로 처리
          y: pos[1] - currentPosition[1], // convexHull pos도 배열로 처리
      };

      // Normalize the vector (unit vector)
      const length = Math.sqrt(vector.x ** 2 + vector.y ** 2);
      if (length > 0) { // length가 0일 경우 분모가 0이 되는 것을 방지
          const unitVector = {
              x: vector.x / length,
              y: vector.y / length,
          };

          // Weighted vector
          sumWeightedVectors.x += unitVector.x * weight;
          sumWeightedVectors.y += unitVector.y * weight;
          totalWeight += weight;
      }
  });

  // Calculate next position
  const nextPosition = [
      currentPosition[0] + sumWeightedVectors.x / totalWeight,
      currentPosition[1] + sumWeightedVectors.y / totalWeight,
  ];

  return nextPosition; // nextPosition도 배열로 반환
}


function extractCoordinates(dataArray) {
    if (dataArray && dataArray.length > 0) {
        return dataArray.map(item => [parseFloat(item.x), parseFloat(item.y)]);
    }
    return []; // 빈 배열이나 유효하지 않은 데이터가 제공된 경우 빈 배열 반환
}

function pairCoordinatesWithTarget(pointsArray, targetPoint) {
    if (pointsArray.length > 1){
      return pointsArray.map(([sx, sy]) => [sx, sy, targetPoint[0], targetPoint[1]]);
    }
    return [];
}


async function getAllRoutes(pointsArray) {
  // 각 좌표와 targetPoint를 짝 지어 요청
  const promises = pointsArray.map(([sx, sy, ex, ey]) => searchPubTransPath(sx, sy, ex, ey));

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
    const [points, setPoints] = useState([]);
    const [convexHull, setConvexHull] = useState([]);
    const [centroid, setCentroid] = useState([0, 0]);
    const [centroidAddress, setCentroidAddress] = useState('');
    const [pairVector, setPairVector] = useState([]);
    const [timeVector, setTimeVector] = useState([]);
    const [resultTowns, setResultTown] = useState([]);

    useEffect(() => {
      const coordinates = extractCoordinates(departurePoints);
      const hull = getConvexHull(coordinates);
      const calculatedCentroid = calculateCentroid(hull);
      
      setPoints(coordinates);
      setConvexHull(hull);
      setCentroid(calculatedCentroid);
      setPairVector(pairCoordinatesWithTarget(hull, calculatedCentroid));
      // console.log(points);
      // console.log(centroid);
      // console.log(pairVector);
    }, [departurePoints]);

    const calculateConvexHull = async () => {
      const fetchRoutes = async () => {
          try {
              const routes = await getAllRoutes(pairVector);
              setTimeVector(routes); // 상태 업데이트
              return routes; // 최신 경로 데이터를 반환
          } catch (error) {
              console.error("Error fetching routes:", error);
              return null;
          }
      };
  
      if (centroid[0] !== 0 || centroid[1] !== 0) {
          // 초기 경로 데이터를 fetchRoutes 호출로 가져옴
          let timeVector = await fetchRoutes();
          const maxCount = 5;
  
          for (let count = 0; count < maxCount; count++) {
              // timeVector 값이 없으면 루프 종료
              if (!timeVector || timeVector.length === 0) break;

              const minTime = Math.min(...timeVector);
              const maxTime = Math.max(...timeVector);
  
              // 조건을 확인하여 만족할 경우 종료
              if (maxTime - minTime <= minTime / 3) {
                  console.log('points: ', points);
                  console.log('centroid: ', centroid);
                  console.log('pairVector: ', pairVector);
                  console.log('timeVector: ', timeVector);

                  const result = await storeZoneInRadius(1000, centroid[1], centroid[0]);
                  setResultTown(result.body.items)
                  console.log('추천 지역: ', result);
                  break;
              }
  
              const nextPosition = calculateNextPosition(centroid, convexHull, timeVector);
              setCentroid(nextPosition);
              setPairVector(pairCoordinatesWithTarget(convexHull, nextPosition));
  
              // fetchRoutes 호출하여 timeVector 최신 상태로 갱신
              timeVector = await fetchRoutes();
              console.log("Updated centroid:", nextPosition);
          }
  
          const coords = new kakao.maps.LatLng(centroid[1], centroid[0]);
          searchDetailAddrFromCoords(coords, (result, status) => {
              if (status === kakao.maps.services.Status.OK) {
                  setCentroidAddress(result[0].address.address_name);
              }
          });
      }
  };

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
        <div>
        {/* <h2>Convex Hull Calculator</h2> */}
        <button onClick={calculateConvexHull}>지역 추천 받기</button>
        {/* <div>
            <h3>Points:</h3>
            {points.map((point, index) => (
            <div key={index}>
                ({point[0]}, {point[1]})
            </div>
            ))}
        </div> */}
        <div>
            {/* <h3>Convex Hull:</h3> */}
            {/* {convexHull.map((point, index) => (
            <div key={index}>
                ({point[0]}, {point[1]})
            </div>
            ))} */}
            {/* {centroid[0] !== 0 || centroid[1] !== 0 ? <div>{centroid[0]}, {centroid[1]}</div> : null} */}
            {centroidAddress}
            {resultTowns.map((town, index) => (
              <div key={index}>
                {town.mainTrarNm} 
              </div>
            ))}
        </div>
        </div>
    );
};
