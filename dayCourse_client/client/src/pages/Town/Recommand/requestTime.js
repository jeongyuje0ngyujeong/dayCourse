import axios from 'axios';

const ODSAY_API = process.env.REACT_APP_ODSAY_KEY;
// const SANGGWON_API = process.env.REACT_APP_SANGGWON_KEY;
const SANGGWON_API = `L0rMesNmmH%2FVyF8fnGCVY67L%2BWP6PIqBalzE8bdJ%2Bvjw11RfpEh00iXwZW%2BzNLAgOGd7uH0wVUBQEyfBb688lg%3D%3D`;

export async function searchPubTransPath(sx, sy, ex, ey) {
  const url = `https://api.odsay.com/v1/api/searchPubTransPathT?SX=${sx}&SY=${sy}&EX=${ex}&EY=${ey}&OPT=${0}&apiKey=${ODSAY_API}`;

  try {
    const response = await axios.get(url);
    console.log(response.data); // API 응답 데이터 출력
    return response.data.result.path[0].info.totalTime; // 필요한 경우 데이터를 반환
  } catch (error) {
    console.error("Error fetching public transport path:", error);
    throw error; // 에러 발생 시 외부에서 처리할 수 있도록 에러를 던짐
  }
}

export async function storeZoneInRadius(radius, y, x) {
  const url = `http://apis.data.go.kr/B553077/api/open/sdsc2/storeZoneInRadius?radius=${radius}&cx=${x}&cy=${y}&type=json&serviceKey=${SANGGWON_API}`;

  try {
    const response = await axios.get(url);
    console.log(response.data); // API 응답 데이터 출력
    return response.data; // 필요한 경우 데이터를 반환
  } catch (error) {
    console.error("Error fetching public transport path:", error);
    throw error; // 에러 발생 시 외부에서 처리할 수 있도록 에러를 던짐
  }
}